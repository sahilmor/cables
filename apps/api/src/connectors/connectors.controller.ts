import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConnectorsService } from './connectors.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Connectors')
@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active connectors with pins' })
  findAll() {
    return this.connectorsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get connector by ID' })
  findOne(@Param('id') id: string) {
    return this.connectorsService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get connector by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.connectorsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create new connector' })
  create(@Body() body: any) {
    return this.connectorsService.create(body);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update connector' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.connectorsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Deactivate connector' })
  delete(@Param('id') id: string) {
    return this.connectorsService.delete(id);
  }
}
