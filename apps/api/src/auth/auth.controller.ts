import { Controller, Get, Post, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, Role } from '@prisma/client';

@ApiTags('Auth & Users')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getMe(@CurrentUser() user: User) {
    return this.authService.getCurrentUser(user);
  }

  @Post('sync-profile')
  @ApiOperation({ summary: 'Update user profile metadata' })
  async syncProfile(
    @CurrentUser() user: User,
    @Body() body: { fullName?: string; phone?: string },
  ) {
    return this.authService.syncProfile(user, body);
  }

  @Patch('users/:id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: update user role' })
  async updateRole(
    @CurrentUser() adminUser: User,
    @Param('id') targetUserId: string,
    @Body('role') newRole: Role,
  ) {
    return this.authService.updateRole(adminUser, targetUserId, newRole);
  }
}
