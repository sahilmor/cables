import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompatibilityService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.connectorCompatibility.findMany({
      include: {
        sourceConnector: true,
        targetConnector: true,
      },
    });
  }

  async checkCompatibility(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
      return { isCompatible: true, notes: 'Direct pass-through' };
    }

    const rule = await this.prisma.connectorCompatibility.findFirst({
      where: {
        OR: [
          { sourceConnectorId: sourceId, targetConnectorId: targetId },
          { sourceConnectorId: targetId, targetConnectorId: sourceId },
        ],
      },
    });

    if (rule) {
      return {
        isCompatible: rule.isCompatible,
        specialRules: rule.specialRules,
        notes: rule.notes,
      };
    }

    // Default to true if not explicitly forbidden in prototype, but flagged with info
    return {
      isCompatible: true,
      notes: 'Custom wiring configuration allowed with validation',
    };
  }

  async setCompatibility(data: {
    sourceConnectorId: string;
    targetConnectorId: string;
    isCompatible: boolean;
    specialRules?: any;
    notes?: string;
  }) {
    return this.prisma.connectorCompatibility.upsert({
      where: {
        sourceConnectorId_targetConnectorId: {
          sourceConnectorId: data.sourceConnectorId,
          targetConnectorId: data.targetConnectorId,
        },
      },
      update: {
        isCompatible: data.isCompatible,
        specialRules: data.specialRules,
        notes: data.notes,
      },
      create: data,
    });
  }
}
