import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(user?: User, sessionId?: string) {
    if (user) {
      let cart = await this.prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              customCable: {
                include: {
                  connector1: true,
                  connector2: true,
                  cableType: true,
                  connections: { include: { sourcePin: true, targetPin: true } },
                },
              },
            },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId: user.id },
          include: {
            items: {
              include: {
                product: { include: { images: true } },
                customCable: {
                  include: {
                    connector1: true,
                    connector2: true,
                    cableType: true,
                    connections: { include: { sourcePin: true, targetPin: true } },
                  },
                },
              },
            },
          },
        });
      }
      return cart;
    }

    // Guest Cart by session ID
    const effectiveSessionId = sessionId || 'guest-session-default';
    let cart = await this.prisma.cart.findUnique({
      where: { sessionId: effectiveSessionId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            customCable: {
              include: {
                connector1: true,
                connector2: true,
                cableType: true,
                connections: { include: { sourcePin: true, targetPin: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { sessionId: effectiveSessionId },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              customCable: {
                include: {
                  connector1: true,
                  connector2: true,
                  cableType: true,
                  connections: { include: { sourcePin: true, targetPin: true } },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async addItem(params: {
    user?: User;
    sessionId?: string;
    productId?: string;
    customCableId?: string;
    quantity?: number;
  }) {
    const cart = await this.getOrCreateCart(params.user, params.sessionId);
    const quantity = params.quantity || 1;

    let unitPrice = 0;
    if (params.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: params.productId },
      });
      if (!product) throw new NotFoundException('Product not found');
      unitPrice = Number(product.price);

      // Check if standard product is already in cart
      const existingItem = cart.items.find((item) => item.productId === params.productId);
      if (existingItem) {
        return this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
            totalPrice: (existingItem.quantity + quantity) * unitPrice,
          },
        });
      }
    } else if (params.customCableId) {
      const customCable = await this.prisma.customCable.findUnique({
        where: { id: params.customCableId },
      });
      if (!customCable) throw new NotFoundException('Custom cable not found');
      unitPrice = Number(customCable.calculatedPrice);
    }

    const totalPrice = unitPrice * quantity;

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: params.productId,
        customCableId: params.customCableId,
        quantity,
        unitPrice,
        totalPrice,
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      return this.prisma.cartItem.delete({ where: { id: itemId } });
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        totalPrice: Number(item.unitPrice) * quantity,
      },
    });
  }

  async removeItem(itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(user?: User, sessionId?: string) {
    const cart = await this.getOrCreateCart(user, sessionId);
    return this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}
