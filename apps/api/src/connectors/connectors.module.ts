import { Module } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [ConnectorsController],
  providers: [ConnectorsService, SupabaseAuthGuard, RolesGuard],
  exports: [ConnectorsService],
})
export class ConnectorsModule {}
