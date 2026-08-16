import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, Role, OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order from cart' })
  create(@CurrentUser() user: User, @Body() body: any) {
    return this.ordersService.createOrder(user, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user order history' })
  findUserOrders(@CurrentUser() user: User) {
    return this.ordersService.findUserOrders(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order details and custom cable snapshots' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: Get all orders across platform' })
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANUFACTURING)
  @ApiOperation({ summary: 'Admin/Manufacturing: Update order status' })
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}
