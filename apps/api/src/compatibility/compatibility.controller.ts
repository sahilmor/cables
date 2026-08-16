import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompatibilityService } from './compatibility.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Compatibility')
@Controller('compatibility')
export class CompatibilityController {
  constructor(private readonly compatibilityService: CompatibilityService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all connector compatibility rules' })
  findAll() {
    return this.compatibilityService.findAll();
  }

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Check compatibility between two connectors' })
  check(
    @Query('sourceId') sourceId: string,
    @Query('targetId') targetId: string,
  ) {
    return this.compatibilityService.checkCompatibility(sourceId, targetId);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Set compatibility rule' })
  setCompatibility(@Body() body: any) {
    return this.compatibilityService.setCompatibility(body);
  }
}
