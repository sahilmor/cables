import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WiringService } from '../wiring/wiring.service';
import { PricingService } from '../pricing/pricing.service';
import { User } from '@prisma/client';

@Injectable()
export class CustomCablesService {
  constructor(
    private prisma: PrismaService,
    private wiringService: WiringService,
    private pricingService: PricingService,
  ) {}

  async findAllForUser(user: User) {
    return this.prisma.customCable.findMany({
      where: { userId: user.id },
      include: {
        connector1: true,
        connector2: true,
        cableType: true,
        connections: {
          include: {
            sourcePin: true,
            targetPin: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const cable = await this.prisma.customCable.findUnique({
      where: { id },
      include: {
        connector1: {
          include: {
            pins: { where: { isActive: true }, orderBy: { position: 'asc' } },
          },
        },
        connector2: {
          include: {
            pins: { where: { isActive: true }, orderBy: { position: 'asc' } },
          },
        },
        cableType: true,
        connections: {
          include: {
            sourcePin: true,
            targetPin: true,
          },
        },
      },
    });

    if (!cable) {
      throw new NotFoundException(`Custom cable configuration ${id} not found`);
    }

    return cable;
  }

  async create(user: User | null, data: any) {
    const connections = data.connections || [];
    const validationReport = await this.wiringService.validateConfiguration(
      data.connector1Id,
      data.connector2Id,
      connections,
    );

    const pricing = await this.pricingService.calculateCustomCablePrice({
      connector1Id: data.connector1Id,
      connector2Id: data.connector2Id,
      cableTypeId: data.cableTypeId,
      lengthMeters: Number(data.lengthMeters) || 1.0,
      connectionsCount: connections.length,
    });

    return this.prisma.customCable.create({
      data: {
        userId: user?.id || null,
        name: data.name || 'Custom Cable Assembly',
        connector1Id: data.connector1Id,
        connector2Id: data.connector2Id,
        cableTypeId: data.cableTypeId,
        lengthMeters: data.lengthMeters || 1.0,
        cableColor: data.cableColor || '#000000',
        jacketMaterial: data.jacketMaterial || 'PVC',
        shieldingType: data.shieldingType || 'FOIL_SHIELDED',
        notes: data.notes,
        isValid: validationReport.isValid,
        validationReport: validationReport as any,
        calculatedPrice: pricing.total,
        priceBreakdown: pricing as any,
        connections: {
          create: connections.map((c: any) => ({
            sourcePinId: c.sourcePinId,
            targetPinId: c.targetPinId,
            wireColor: c.wireColor,
            label: c.label,
          })),
        },
      },
      include: {
        connector1: true,
        connector2: true,
        cableType: true,
        connections: {
          include: { sourcePin: true, targetPin: true },
        },
      },
    });
  }

  async update(id: string, user: User | null, data: any) {
    const existing = await this.prisma.customCable.findUnique({
      where: { id },
      include: { connections: true },
    });

    if (!existing) {
      throw new NotFoundException('Custom cable not found');
    }

    const c1Id = data.connector1Id || existing.connector1Id;
    const c2Id = data.connector2Id || existing.connector2Id;
    const cableTypeId = data.cableTypeId || existing.cableTypeId;
    const lengthMeters = data.lengthMeters !== undefined ? data.lengthMeters : existing.lengthMeters;
    const connections = data.connections || existing.connections;

    const validationReport = await this.wiringService.validateConfiguration(
      c1Id,
      c2Id,
      connections,
    );

    const pricing = await this.pricingService.calculateCustomCablePrice({
      connector1Id: c1Id,
      connector2Id: c2Id,
      cableTypeId,
      lengthMeters: Number(lengthMeters),
      connectionsCount: connections.length,
    });

    // Replace connections if supplied
    if (data.connections) {
      await this.prisma.customCableConnection.deleteMany({
        where: { customCableId: id },
      });
    }

    return this.prisma.customCable.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : existing.name,
        connector1Id: c1Id,
        connector2Id: c2Id,
        cableTypeId,
        lengthMeters,
        cableColor: data.cableColor || existing.cableColor,
        jacketMaterial: data.jacketMaterial || existing.jacketMaterial,
        shieldingType: data.shieldingType || existing.shieldingType,
        notes: data.notes !== undefined ? data.notes : existing.notes,
        isValid: validationReport.isValid,
        validationReport: validationReport as any,
        calculatedPrice: pricing.total,
        priceBreakdown: pricing as any,
        connections: data.connections
          ? {
              create: data.connections.map((c: any) => ({
                sourcePinId: c.sourcePinId,
                targetPinId: c.targetPinId,
                wireColor: c.wireColor,
                label: c.label,
              })),
            }
          : undefined,
      },
      include: {
        connector1: true,
        connector2: true,
        cableType: true,
        connections: {
          include: { sourcePin: true, targetPin: true },
        },
      },
    });
  }

  async duplicate(id: string, user: User) {
    const original = await this.findOne(id);
    return this.prisma.customCable.create({
      data: {
        userId: user.id,
        name: `${original.name} (Copy)`,
        connector1Id: original.connector1Id,
        connector2Id: original.connector2Id,
        cableTypeId: original.cableTypeId,
        lengthMeters: original.lengthMeters,
        cableColor: original.cableColor,
        jacketMaterial: original.jacketMaterial,
        shieldingType: original.shieldingType,
        notes: original.notes,
        isValid: original.isValid,
        validationReport: original.validationReport as any,
        calculatedPrice: original.calculatedPrice,
        priceBreakdown: original.priceBreakdown as any,
        connections: {
          create: original.connections.map((c) => ({
            sourcePinId: c.sourcePinId,
            targetPinId: c.targetPinId,
            wireColor: c.wireColor,
            label: c.label,
          })),
        },
      },
      include: {
        connector1: true,
        connector2: true,
        cableType: true,
        connections: {
          include: { sourcePin: true, targetPin: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.customCable.delete({
      where: { id },
    });
  }
}
