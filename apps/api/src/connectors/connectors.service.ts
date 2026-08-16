import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConnectorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.connector.findMany({
      where: { isActive: true },
      include: {
        pins: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const connector = await this.prisma.connector.findUnique({
      where: { id },
      include: {
        pins: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    return connector;
  }

  async findBySlug(slug: string) {
    const connector = await this.prisma.connector.findUnique({
      where: { slug },
      include: {
        pins: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with slug ${slug} not found`);
    }

    return connector;
  }

  async create(data: any) {
    return this.prisma.connector.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: data.type,
        description: data.description,
        imageUrl: data.imageUrl,
        numberOfPins: data.numberOfPins || (data.pins ? data.pins.length : 0),
        basePrice: data.basePrice || 100.0,
        pins: data.pins
          ? {
              create: data.pins.map((p: any, idx: number) => ({
                pinNumber: p.pinNumber || idx + 1,
                name: p.name,
                description: p.description,
                type: p.type || 'GENERAL_SIGNAL',
                color: p.color || '#3B82F6',
                position: p.position || idx + 1,
                required: p.required || false,
                allowMultipleConnections: p.allowMultipleConnections || false,
              })),
            }
          : undefined,
      },
      include: { pins: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.connector.update({
      where: { id },
      data,
      include: { pins: true },
    });
  }

  async delete(id: string) {
    return this.prisma.connector.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
