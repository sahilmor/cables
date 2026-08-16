import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, SupabaseAuthGuard, RolesGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
