import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, SupabaseAuthGuard, RolesGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
