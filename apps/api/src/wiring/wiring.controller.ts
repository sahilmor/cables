import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WiringService } from './wiring.service';
import { Public } from '../common/decorators/roles.decorator';
import { WireConnectionDto } from '@cables/types';

class ValidateWiringDto {
  connector1Id: string;
  connector2Id: string;
  connections: WireConnectionDto[];
}

@ApiTags('Wiring Engine')
@Controller('wiring')
export class WiringController {
  constructor(private readonly wiringService: WiringService) {}

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Validate pin connections between connectors' })
  validate(@Body() body: ValidateWiringDto) {
    return this.wiringService.validateConfiguration(
      body.connector1Id,
      body.connector2Id,
      body.connections,
    );
  }
}
