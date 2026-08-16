import { Module } from '@nestjs/common';
import { WiringService } from './wiring.service';
import { WiringController } from './wiring.controller';

@Module({
  controllers: [WiringController],
  providers: [WiringService],
  exports: [WiringService],
})
export class WiringModule {}
