import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

class CalculatePriceDto {
  connector1Id: string;
  connector2Id: string;
  cableTypeId: string;
  lengthMeters: number;
  connectionsCount: number;
}

@ApiTags('Pricing Engine')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Public()
  @Post('calculate')
  @ApiOperation({ summary: 'Calculate custom cable price with authoritative tax and breakdown' })
  calculatePrice(@Body() body: CalculatePriceDto) {
    return this.pricingService.calculateCustomCablePrice(body);
  }

  @Get('rules')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get pricing rules' })
  getRules() {
    return this.pricingService.getPricingRules();
  }

  @Patch('rules/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update pricing rule' })
  updateRule(@Param('id') id: string, @Body() body: any) {
    return this.pricingService.updatePricingRule(id, body);
  }
}
