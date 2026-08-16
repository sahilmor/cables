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
import { CustomCablesService } from './custom-cables.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/roles.decorator';
import { User } from '@prisma/client';

@ApiTags('Custom Cables')
@Controller('custom-cables')
export class CustomCablesController {
  constructor(private readonly customCablesService: CustomCablesService) {}

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved custom cables for current user' })
  findAllForUser(@CurrentUser() user: User) {
    return this.customCablesService.findAllForUser(user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single custom cable configuration with pins and connections' })
  findOne(@Param('id') id: string) {
    return this.customCablesService.findOne(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create or save custom cable configuration' })
  create(@Body() body: any, @CurrentUser() user?: User) {
    return this.customCablesService.create(user || null, body);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update custom cable configuration' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user?: User) {
    return this.customCablesService.update(id, user || null, body);
  }

  @Post(':id/duplicate')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicate an existing custom cable' })
  duplicate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.customCablesService.duplicate(id, user);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete custom cable' })
  delete(@Param('id') id: string) {
    return this.customCablesService.delete(id);
  }
}
