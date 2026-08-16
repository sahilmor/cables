import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [PricingController],
  providers: [PricingService, SupabaseAuthGuard, RolesGuard],
  exports: [PricingService],
})
export class PricingModule {}
