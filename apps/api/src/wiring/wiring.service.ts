import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PinType } from '@prisma/client';
import { WiringValidationResult, WireConnectionDto } from '@cables/types';

@Injectable()
export class WiringService {
  constructor(private prisma: PrismaService) {}

  async validateConfiguration(
    connector1Id: string,
    connector2Id: string,
    connections: WireConnectionDto[],
  ): Promise<WiringValidationResult> {
    const [c1, c2] = await Promise.all([
      this.prisma.connector.findUnique({
        where: { id: connector1Id },
        include: { pins: { where: { isActive: true } } },
      }),
      this.prisma.connector.findUnique({
        where: { id: connector2Id },
        include: { pins: { where: { isActive: true } } },
      }),
    ]);

    if (!c1 || !c2) {
      throw new BadRequestException('Invalid connector IDs provided');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check connector compatibility
    const compatRule = await this.prisma.connectorCompatibility.findFirst({
      where: {
        OR: [
          { sourceConnectorId: connector1Id, targetConnectorId: connector2Id },
          { sourceConnectorId: connector2Id, targetConnectorId: connector1Id },
        ],
      },
    });

    if (compatRule && !compatRule.isCompatible) {
      errors.push(
        `Connector pairing ${c1.name} and ${c2.name} is marked incompatible: ${compatRule.notes || 'Incompatible pinout standard'}`,
      );
    }

    const pinMap1 = new Map(c1.pins.map((p) => [p.id, p]));
    const pinMap2 = new Map(c2.pins.map((p) => [p.id, p]));

    const sourceUsedCount = new Map<string, number>();
    const targetUsedCount = new Map<string, number>();
    const seenPairs = new Set<string>();

    for (const conn of connections) {
      const pairKey = `${conn.sourcePinId}->${conn.targetPinId}`;
      if (seenPairs.has(pairKey)) {
        errors.push(`Duplicate wire connection detected: Pin pair ${pairKey} is connected multiple times.`);
      }
      seenPairs.add(pairKey);

      const p1 = pinMap1.get(conn.sourcePinId);
      const p2 = pinMap2.get(conn.targetPinId);

      if (!p1) {
        errors.push(`Source pin ${conn.sourcePinId} does not exist on End 1 (${c1.name}).`);
        continue;
      }
      if (!p2) {
        errors.push(`Target pin ${conn.targetPinId} does not exist on End 2 (${c2.name}).`);
        continue;
      }

      sourceUsedCount.set(p1.id, (sourceUsedCount.get(p1.id) || 0) + 1);
      targetUsedCount.set(p2.id, (targetUsedCount.get(p2.id) || 0) + 1);

      // Multi-connection check
      if (!p1.allowMultipleConnections && (sourceUsedCount.get(p1.id) || 0) > 1) {
        errors.push(`End 1 Pin ${p1.pinNumber} (${p1.name}) does not allow multiple wire terminations.`);
      }
      if (!p2.allowMultipleConnections && (targetUsedCount.get(p2.id) || 0) > 1) {
        errors.push(`End 2 Pin ${p2.pinNumber} (${p2.name}) does not allow multiple wire terminations.`);
      }

      // Signal mismatch electrical warnings
      if (p1.type === PinType.POWER && p2.type === PinType.GROUND) {
        errors.push(
          `Short circuit hazard: End 1 Power pin (${p1.name}) is connected to End 2 Ground pin (${p2.name}).`,
        );
      }
      if (p1.type === PinType.ANALOG_AUDIO && p2.type === PinType.HIGH_SPEED_DIFFERENTIAL) {
        warnings.push(
          `Signal type disparity: Connecting Analog Audio (${p1.name}) to High Speed Digital Differential (${p2.name}).`,
        );
      }
    }

    // Required pins check
    const requiredPins1 = c1.pins.filter((p) => p.required);
    const requiredPins2 = c2.pins.filter((p) => p.required);

    const missingRequiredSource = requiredPins1.filter((p) => !sourceUsedCount.has(p.id));
    const missingRequiredTarget = requiredPins2.filter((p) => !targetUsedCount.has(p.id));

    if (missingRequiredSource.length > 0) {
      errors.push(
        `Missing required connections on End 1 (${c1.name}): ${missingRequiredSource
          .map((p) => `Pin ${p.pinNumber} (${p.name})`)
          .join(', ')}`,
      );
    }

    if (missingRequiredTarget.length > 0) {
      errors.push(
        `Missing required connections on End 2 (${c2.name}): ${missingRequiredTarget
          .map((p) => `Pin ${p.pinNumber} (${p.name})`)
          .join(', ')}`,
      );
    }

    if (connections.length === 0) {
      errors.push('No pin connections have been created yet.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      connectedCount: connections.length,
      totalRequiredSourcePins: requiredPins1.length,
      totalRequiredTargetPins: requiredPins2.length,
      missingRequiredSourcePins: missingRequiredSource as any,
      missingRequiredTargetPins: missingRequiredTarget as any,
    };
  }

  generateSpecificationSnapshot(
    connector1: any,
    connector2: any,
    cableType: any,
    lengthMeters: number,
    connections: any[],
    pricing: any,
  ) {
    const pinMap1 = new Map(connector1.pins.map((p: any) => [p.id, p]));
    const pinMap2 = new Map(connector2.pins.map((p: any) => [p.id, p]));

    const mappedConnections = connections.map((conn, idx) => {
      const p1 = pinMap1.get(conn.sourcePinId) as any;
      const p2 = pinMap2.get(conn.targetPinId) as any;
      return {
        index: idx + 1,
        sourcePinNumber: p1?.pinNumber ?? 0,
        sourcePinName: p1?.name ?? 'Unknown',
        sourcePinType: p1?.type ?? 'GENERAL_SIGNAL',
        targetPinNumber: p2?.pinNumber ?? 0,
        targetPinName: p2?.name ?? 'Unknown',
        targetPinType: p2?.type ?? 'GENERAL_SIGNAL',
        wireColor: conn.wireColor || p1?.color || '#3B82F6',
        label: conn.label || `W-${idx + 1}`,
      };
    });

    const stripAllowanceCm = 6;
    const totalCutLengthM = (
      parseFloat(lengthMeters.toString()) +
      (stripAllowanceCm * 2) / 100
    ).toFixed(2);

    return {
      specVersion: '1.0',
      generatedAt: new Date().toISOString(),
      cableTitle: `${connector1.name} to ${connector2.name} Custom Assembly`,
      connector1: {
        id: connector1.id,
        name: connector1.name,
        type: connector1.type,
        pinCount: connector1.numberOfPins,
      },
      connector2: {
        id: connector2.id,
        name: connector2.name,
        type: connector2.type,
        pinCount: connector2.numberOfPins,
      },
      cablePhysicalSpecs: {
        type: cableType.name,
        gaugeAWG: cableType.gaugeAWG,
        shielding: cableType.shielding,
        jacket: cableType.jacket,
        finishedLengthMeters: parseFloat(lengthMeters.toString()),
        manufacturingCutLengthMeters: parseFloat(totalCutLengthM),
        stripAllowancePerEndCm: stripAllowanceCm,
      },
      pinMapping: mappedConnections,
      pricingSummary: pricing,
    };
  }
}
