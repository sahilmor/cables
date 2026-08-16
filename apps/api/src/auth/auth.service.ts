import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(user: User) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        addresses: true,
      },
    });
  }

  async syncProfile(user: User, data: { fullName?: string; phone?: string }) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
      },
    });
  }

  async updateRole(adminUser: User, targetUserId: string, newRole: Role) {
    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });
  }
}
