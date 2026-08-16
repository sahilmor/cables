import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { CompatibilityModule } from './compatibility/compatibility.module';
import { WiringModule } from './wiring/wiring.module';
import { PricingModule } from './pricing/pricing.module';
import { CustomCablesModule } from './custom-cables/custom-cables.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CableTypesModule } from './cable-types/cable-types.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ManufacturingModule } from './manufacturing/manufacturing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    ConnectorsModule,
    CompatibilityModule,
    WiringModule,
    PricingModule,
    CustomCablesModule,
    ProductsModule,
    CategoriesModule,
    CableTypesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ManufacturingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
