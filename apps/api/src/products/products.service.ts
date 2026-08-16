import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    categorySlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { categorySlug, search, minPrice, maxPrice } = params;

    const where: any = {
      status: 'ACTIVE',
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async create(data: any) {
    const { images, ...prodData } = data;
    const product = await this.prisma.product.create({
      data: prodData,
    });

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await this.prisma.productImage.create({
          data: {
            productId: product.id,
            url: typeof images[i] === 'string' ? images[i] : images[i].url,
            position: i,
          },
        });
      }
    }

    return this.findOne(product.id);
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, images: true },
    });
  }

  async delete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}
