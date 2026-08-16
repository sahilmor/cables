import { Module } from '@nestjs/common';
import { CustomCablesService } from './custom-cables.service';
import { CustomCablesController } from './custom-cables.controller';
import { WiringModule } from '../wiring/wiring.module';
import { PricingModule } from '../pricing/pricing.module';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [WiringModule, PricingModule],
  controllers: [CustomCablesController],
  providers: [CustomCablesService, SupabaseAuthGuard, RolesGuard],
  exports: [CustomCablesService],
})
export class CustomCablesModule {}
