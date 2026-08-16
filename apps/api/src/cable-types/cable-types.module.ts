import { Injectable, Controller, Get, Param, Module } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/roles.decorator';

@Injectable()
export class CableTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cableTypeConfig.findMany({
      where: { isActive: true },
      orderBy: { pricePerMeter: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.cableTypeConfig.findUnique({
      where: { id },
    });
  }
}

@ApiTags('Cable Types')
@Controller('cable-types')
export class CableTypesController {
  constructor(private readonly cableTypesService: CableTypesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all available bulk cable configurations' })
  findAll() {
    return this.cableTypesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get cable type by ID' })
  findOne(@Param('id') id: string) {
    return this.cableTypesService.findOne(id);
  }
}

@Module({
  controllers: [CableTypesController],
  providers: [CableTypesService],
  exports: [CableTypesService],
})
export class CableTypesModule {}
