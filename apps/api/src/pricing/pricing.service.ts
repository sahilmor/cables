import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceBreakdown } from '@cables/types';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculateCustomCablePrice(params: {
    connector1Id: string;
    connector2Id: string;
    cableTypeId: string;
    lengthMeters: number;
    connectionsCount: number;
  }): Promise<PriceBreakdown> {
    const [c1, c2, cableType, rule] = await Promise.all([
      this.prisma.connector.findUnique({ where: { id: params.connector1Id } }),
      this.prisma.connector.findUnique({ where: { id: params.connector2Id } }),
      this.prisma.cableTypeConfig.findUnique({ where: { id: params.cableTypeId } }),
      this.prisma.pricingRule.findFirst({ where: { isActive: true } }),
    ]);

    if (!c1 || !c2 || !cableType) {
      throw new BadRequestException('Invalid connector or cable type specified for pricing');
    }

    const c1Price = Number(c1.basePrice);
    const c2Price = Number(c2.basePrice);
    const pricePerMeter = Number(cableType.pricePerMeter);
    const lengthCost = Math.round(Number(params.lengthMeters) * pricePerMeter * 100) / 100;

    const baseAssemblyFee = rule ? Number(rule.baseAssemblyFee) : 250.0;
    const perPinFee = rule ? Number(rule.perPinFee) : 15.0;
    const perPinConnectionFee = params.connectionsCount * perPinFee;
    const assemblyFee = baseAssemblyFee + perPinConnectionFee;

    const subtotal = Math.round((c1Price + c2Price + lengthCost + assemblyFee) * 100) / 100;
    const taxRatePercent = rule ? Number(rule.taxRatePercent) : 18.0;
    const taxAmount = Math.round(subtotal * (taxRatePercent / 100) * 100) / 100;

    const freeShippingMin = rule ? Number(rule.freeShippingMin) : 2500.0;
    const standardShipping = rule ? Number(rule.shippingFee) : 120.0;
    const shippingFee = subtotal >= freeShippingMin ? 0.0 : standardShipping;

    const total = Math.round((subtotal + taxAmount + shippingFee) * 100) / 100;

    return {
      baseCablePrice: 0,
      connector1Price: c1Price,
      connector2Price: c2Price,
      lengthCost,
      assemblyFee,
      perPinConnectionFee,
      subtotal,
      taxRatePercent,
      taxAmount,
      shippingFee,
      total,
    };
  }

  async getPricingRules() {
    return this.prisma.pricingRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePricingRule(id: string, data: any) {
    return this.prisma.pricingRule.update({
      where: { id },
      data,
    });
  }
}
