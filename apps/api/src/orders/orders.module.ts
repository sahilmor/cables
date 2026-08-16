import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WiringModule } from '../wiring/wiring.module';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [WiringModule],
  controllers: [OrdersController],
  providers: [OrdersService, SupabaseAuthGuard, RolesGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
