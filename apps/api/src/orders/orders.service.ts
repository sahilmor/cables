import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WiringService } from '../wiring/wiring.service';
import { User, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private wiringService: WiringService,
  ) {}

  async createOrder(user: User, data: {
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
      phone: string;
    };
    cartItemIds?: string[];
    gstNumber?: string;
    customerNotes?: string;
    couponCode?: string;
  }) {
    // 1. Create or link shipping address
    const address = await this.prisma.address.create({
      data: {
        userId: user.id,
        street: data.shippingAddress.street,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        postalCode: data.shippingAddress.postalCode,
        country: data.shippingAddress.country || 'India',
        phone: data.shippingAddress.phone,
      },
    });

    // 2. Fetch cart items
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
            customCable: {
              include: {
                connector1: { include: { pins: true } },
                connector2: { include: { pins: true } },
                cableType: true,
                connections: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of cart.items) {
      const quantity = item.quantity;
      if (item.productId && item.product) {
        const unitPrice = Number(item.product.price);
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          productId: item.productId,
          itemType: 'STANDARD_PRODUCT',
          title: item.product.name,
          quantity,
          unitPrice,
          totalPrice: itemTotal,
        });
      } else if (item.customCableId && item.customCable) {
        const cc = item.customCable;
        const unitPrice = Number(cc.calculatedPrice);
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        // Generate immutable frozen snapshot
        const snapshot = this.wiringService.generateSpecificationSnapshot(
          cc.connector1,
          cc.connector2,
          cc.cableType,
          Number(cc.lengthMeters),
          cc.connections,
          cc.priceBreakdown,
        );

        orderItemsData.push({
          customCableId: item.customCableId,
          itemType: 'CUSTOM_CABLE',
          title: `${cc.connector1.name} to ${cc.connector2.name} Custom Cable (${cc.lengthMeters}m)`,
          quantity,
          unitPrice,
          totalPrice: itemTotal,
          customCableSnapshot: snapshot,
        });
      }
    }

    const rule = await this.prisma.pricingRule.findFirst({ where: { isActive: true } });
    const taxRate = rule ? Number(rule.taxRatePercent) : 18.0;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const freeMin = rule ? Number(rule.freeShippingMin) : 2500.0;
    const shippingFee = subtotal >= freeMin ? 0.0 : (rule ? Number(rule.shippingFee) : 120.0);
    const totalAmount = Math.round((subtotal + taxAmount + shippingFee) * 100) / 100;

    const count = await this.prisma.order.count();
    const orderNumber = `ORD-${10001 + count}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        shippingAddressId: address.id,
        status: OrderStatus.PENDING_PAYMENT,
        subtotal,
        taxAmount,
        shippingFee,
        totalAmount,
        gstNumber: data.gstNumber,
        customerNotes: data.customerNotes,
        couponCode: data.couponCode,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    // Clear cart after order creation
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  }

  async findUserOrders(user: User) {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
        shippingAddress: true,
        payments: true,
        manufacturingJobs: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        items: true,
        shippingAddress: true,
        payments: true,
        manufacturingJobs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
