import { Module } from '@nestjs/common';
import { ManufacturingService } from './manufacturing.service';
import { ManufacturingController } from './manufacturing.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [ManufacturingController],
  providers: [ManufacturingService, SupabaseAuthGuard, RolesGuard],
  exports: [ManufacturingService],
})
export class ManufacturingModule {}
