import { PaymentsService } from './payments.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
      },
      manufacturingJob: {
        count: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new PaymentsService(mockPrisma);
  });

  it('should verify payment, mark order PAID and create manufacturing jobs', async () => {
    const mockOrder = {
      id: 'order-1',
      orderNumber: 'ORD-10001',
      status: OrderStatus.PAID,
      items: [
        {
          id: 'item-1',
          itemType: 'CUSTOM_CABLE',
          customCableSnapshot: {
            pinMapping: [],
          },
        },
      ],
    };

    mockPrisma.payment.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.order.update.mockResolvedValue(mockOrder);
    mockPrisma.manufacturingJob.count.mockResolvedValue(0);
    mockPrisma.manufacturingJob.create.mockResolvedValue({
      id: 'job-1',
      jobTicketNumber: `JOB-${new Date().getFullYear()}-1001`,
    });

    const result = await service.verifyPayment({
      orderId: 'order-1',
      razorpayOrderId: 'order_123',
      razorpayPaymentId: 'pay_456',
      razorpaySignature: 'sampleSecretKey456',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe(OrderStatus.PAID);
    expect(mockPrisma.manufacturingJob.create).toHaveBeenCalled();
  });
});
