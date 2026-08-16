import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay | null = null;

  constructor(private prisma: PrismaService) {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey123';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sampleSecretKey456';

    if (!keyId.includes('sample')) {
      try {
        this.razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });
      } catch (err) {
        console.warn('Razorpay SDK init deferred:', err);
      }
    }
  }

  async createRazorpayOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const amountInPaise = Math.round(Number(order.totalAmount) * 100);
    const receipt = `rcpt_${order.orderNumber}`;

    let razorpayOrderId = `order_${Date.now()}`;

    if (this.razorpay) {
      try {
        const response = await this.razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });
        razorpayOrderId = response.id;
      } catch (err: any) {
        console.error('Razorpay order creation failed, using mock order:', err?.message || err);
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'RAZORPAY',
        razorpayOrderId,
        amount: order.totalAmount,
        currency: 'INR',
        status: PaymentStatus.PENDING,
      },
    });

    return {
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey123',
      orderNumber: order.orderNumber,
      paymentId: payment.id,
    };
  }

  async verifyPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sampleSecretKey456';

    // Verify HMAC SHA256 signature if real Razorpay secret is set
    if (!keySecret.includes('sample')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== data.razorpaySignature) {
        throw new BadRequestException('Invalid Razorpay signature');
      }
    }

    // Update payment record
    await this.prisma.payment.updateMany({
      where: { razorpayOrderId: data.razorpayOrderId },
      data: {
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        status: PaymentStatus.CAPTURED,
      },
    });

    // Update order status to PAID
    const order = await this.prisma.order.update({
      where: { id: data.orderId },
      data: { status: OrderStatus.PAID },
      include: { items: true },
    });

    // Spawn Manufacturing Jobs for each custom cable item
    for (const item of order.items) {
      if (item.itemType === 'CUSTOM_CABLE' && item.customCableSnapshot) {
        const jobCount = await this.prisma.manufacturingJob.count();
        const jobTicketNumber = `JOB-${new Date().getFullYear()}-${1001 + jobCount}`;

        await this.prisma.manufacturingJob.create({
          data: {
            jobTicketNumber,
            orderId: order.id,
            orderItemId: item.id,
            status: OrderStatus.MANUFACTURING,
            wiringSnapshot: item.customCableSnapshot as any,
          },
        });
      }
    }

    return { success: true, orderId: order.id, status: OrderStatus.PAID };
  }

  async handleWebhook(body: any, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const event = body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = body.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        const payment = await this.prisma.payment.findUnique({
          where: { razorpayOrderId },
        });
        if (payment) {
          await this.verifyPayment({
            orderId: payment.orderId,
            razorpayOrderId,
            razorpayPaymentId: paymentEntity.id,
            razorpaySignature: 'webhook_verified',
          });
        }
      }
    }

    return { received: true };
  }
}
