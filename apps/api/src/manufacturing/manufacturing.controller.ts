import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ManufacturingService } from './manufacturing.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';

@ApiTags('Manufacturing')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANUFACTURING)
@Controller('manufacturing')
export class ManufacturingController {
  constructor(private readonly manufacturingService: ManufacturingService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Get active manufacturing job queue' })
  getQueue() {
    return this.manufacturingService.getQueue();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get single manufacturing job details with wiring snapshot' })
  getJob(@Param('id') id: string) {
    return this.manufacturingService.getJob(id);
  }

  @Patch('jobs/:id/status')
  @ApiOperation({ summary: 'Update manufacturing job status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Body('technicianNotes') notes?: string,
    @Body('assignedTo') assignedTo?: string,
  ) {
    return this.manufacturingService.updateJobStatus(id, status, notes, assignedTo);
  }

  @Public()
  @Get('jobs/:id/pdf')
  @ApiOperation({ summary: 'Download or stream PDF manufacturing wiring specification' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.manufacturingService.generateSpecificationPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="wiring-spec-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
