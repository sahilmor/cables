import { Module } from '@nestjs/common';
import { CompatibilityService } from './compatibility.service';
import { CompatibilityController } from './compatibility.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [CompatibilityController],
  providers: [CompatibilityService, SupabaseAuthGuard, RolesGuard],
  exports: [CompatibilityService],
})
export class CompatibilityModule {}
