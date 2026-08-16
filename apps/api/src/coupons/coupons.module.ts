import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [CouponsController],
  providers: [CouponsService, SupabaseAuthGuard, RolesGuard],
  exports: [CouponsService],
})
export class CouponsModule {}
