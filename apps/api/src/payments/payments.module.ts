import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, SupabaseAuthGuard, RolesGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
