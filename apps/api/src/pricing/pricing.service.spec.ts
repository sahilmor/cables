import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      connector: {
        findUnique: jest.fn(),
      },
      cableTypeConfig: {
        findUnique: jest.fn(),
      },
      pricingRule: {
        findFirst: jest.fn(),
      },
    };
    service = new PricingService(mockPrisma);
  });

  it('should calculate authoritative total with 18% GST and fees correctly', async () => {
    mockPrisma.connector.findUnique
      .mockResolvedValueOnce({ id: 'c1', basePrice: 160.0 }) // HDMI
      .mockResolvedValueOnce({ id: 'c2', basePrice: 90.0 });  // RJ45

    mockPrisma.cableTypeConfig.findUnique.mockResolvedValue({
      id: 'cable-cat6a',
      pricePerMeter: 120.0,
    });

    mockPrisma.pricingRule.findFirst.mockResolvedValue({
      baseAssemblyFee: 250.0,
      perPinFee: 15.0,
      taxRatePercent: 18.0,
      shippingFee: 120.0,
      freeShippingMin: 2500.0,
    });

    // 2.0 meters, 8 pin connections
    // c1 (160) + c2 (90) + length (2 * 120 = 240) + assembly (250 + 8 * 15 = 370) = Subtotal 860
    // GST (18% of 860) = 154.80
    // Shipping (< 2500) = 120.00
    // Total = 860 + 154.80 + 120 = 1134.80

    const result = await service.calculateCustomCablePrice({
      connector1Id: 'c1',
      connector2Id: 'c2',
      cableTypeId: 'cable-cat6a',
      lengthMeters: 2.0,
      connectionsCount: 8,
    });

    expect(result.subtotal).toBe(860);
    expect(result.taxAmount).toBe(154.8);
    expect(result.shippingFee).toBe(120);
    expect(result.total).toBe(1134.8);
  });
});
