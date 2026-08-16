import { Injectable, Controller, Get, Param, Module } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/roles.decorator';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: { images: true },
        },
      },
    });
  }
}

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug with products' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
