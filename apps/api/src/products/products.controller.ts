import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List and filter standard products' })
  findAll(
    @Query('categorySlug') categorySlug?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.productsService.findAll({
      categorySlug,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create product' })
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update product' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Archive product' })
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
