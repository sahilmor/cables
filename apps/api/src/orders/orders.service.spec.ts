import { OrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockPrisma: any;
  let mockWiringService: any;

  beforeEach(() => {
    mockPrisma = {
      address: {
        create: jest.fn(),
      },
      cart: {
        findUnique: jest.fn(),
      },
      pricingRule: {
        findFirst: jest.fn(),
      },
      order: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      cartItem: {
        deleteMany: jest.fn(),
      },
    };

    mockWiringService = {
      generateSpecificationSnapshot: jest.fn().mockReturnValue({
        specVersion: '1.0',
        pinMapping: [],
        cablePhysicalSpecs: { finishedLengthMeters: 2 },
      }),
    };

    service = new OrdersService(mockPrisma, mockWiringService);
  });

  it('should create order and freeze immutable custom cable snapshot', async () => {
    const mockUser: any = { id: 'user-123', email: 'customer@cablecraft.io' };
    const mockAddress = { id: 'addr-1' };

    mockPrisma.address.create.mockResolvedValue(mockAddress);
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [
        {
          id: 'item-1',
          customCableId: 'cable-1',
          quantity: 2,
          customCable: {
            id: 'cable-1',
            calculatedPrice: 1000.0,
            connector1: { name: 'HDMI', pins: [] },
            connector2: { name: 'RJ45', pins: [] },
            cableType: { name: 'Cat6A' },
            lengthMeters: 2.0,
            connections: [],
            priceBreakdown: {},
          },
        },
      ],
    });

    mockPrisma.pricingRule.findFirst.mockResolvedValue({
      taxRatePercent: 18.0,
      freeShippingMin: 2500.0,
      shippingFee: 120.0,
    });

    mockPrisma.order.count.mockResolvedValue(0);

    const expectedOrder = {
      id: 'order-1',
      orderNumber: 'ORD-10001',
      status: OrderStatus.PENDING_PAYMENT,
      subtotal: 2000.0,
      taxAmount: 360.0,
      shippingFee: 120.0,
      totalAmount: 2480.0,
    };

    mockPrisma.order.create.mockResolvedValue(expectedOrder);

    const result = await service.createOrder(mockUser, {
      shippingAddress: {
        street: '123 Tech Ave',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        phone: '+919876543210',
      },
    });

    expect(mockWiringService.generateSpecificationSnapshot).toHaveBeenCalled();
    expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1' } });
    expect(result.orderNumber).toBe('ORD-10001');
    expect(result.totalAmount).toBe(2480.0);
  });
});
