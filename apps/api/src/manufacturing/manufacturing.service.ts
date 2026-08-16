import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';

@Injectable()
export class ManufacturingService {
  constructor(private prisma: PrismaService) {}

  async getQueue() {
    return this.prisma.manufacturingJob.findMany({
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJob(id: string) {
    const job = await this.prisma.manufacturingJob.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
          },
        },
      },
    });

    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  async updateJobStatus(
    id: string,
    status: OrderStatus,
    technicianNotes?: string,
    assignedTo?: string,
  ) {
    const data: any = { status };
    if (technicianNotes !== undefined) data.technicianNotes = technicianNotes;
    if (assignedTo !== undefined) data.assignedTo = assignedTo;

    if (status === OrderStatus.QUALITY_CHECK) {
      data.qaPassedAt = new Date();
    }
    if (status === OrderStatus.READY_TO_SHIP || status === OrderStatus.SHIPPED) {
      data.completedAt = new Date();
    }

    const job = await this.prisma.manufacturingJob.update({
      where: { id },
      data,
      include: { order: true },
    });

    // Sync order status
    await this.prisma.order.update({
      where: { id: job.orderId },
      data: { status },
    });

    return job;
  }

  async generateSpecificationPdf(jobId: string): Promise<Buffer> {
    const job = await this.getJob(jobId);
    const snap: any = job.wiringSnapshot || {};

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header Banner
      doc
        .rect(40, 40, 515, 60)
        .fill('#0f172a');

      doc
        .fillColor('#ffffff')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CABLECRAFT FABRICATION SPECIFICATION', 55, 55);

      doc
        .fillColor('#38bdf8')
        .fontSize(10)
        .font('Helvetica')
        .text(`JOB TICKET: ${job.jobTicketNumber} | ORDER: ${job.order.orderNumber}`, 55, 80);

      doc.moveDown(3);

      // Physical specs box
      doc
        .fillColor('#0f172a')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('1. CABLE ASSEMBLY OVERVIEW', 40, 120);

      const phys = snap.cablePhysicalSpecs || {};
      const c1 = snap.connector1 || {};
      const c2 = snap.connector2 || {};

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`End 1 Connector: ${c1.name || 'N/A'} (${c1.type || ''})`, 50, 145)
        .text(`End 2 Connector: ${c2.name || 'N/A'} (${c2.type || ''})`, 50, 160)
        .text(`Bulk Cable Type: ${phys.type || 'Standard Shielded'}`, 50, 175)
        .text(`Finished Length: ${phys.finishedLengthMeters || 1.0} meters`, 300, 145)
        .text(`Cut Length: ${phys.manufacturingCutLengthMeters || 1.12} m (incl. strip allowance)`, 300, 160)
        .text(`Shielding / Jacket: ${phys.shielding || 'FOIL'} / ${phys.jacket || 'PVC'}`, 300, 175);

      // Wiring pin mapping table
      doc
        .fillColor('#0f172a')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('2. PIN-TO-PIN WIRING MAP', 40, 210);

      let currentY = 235;

      // Table header
      doc
        .rect(40, currentY, 515, 20)
        .fill('#f1f5f9');

      doc
        .fillColor('#0f172a')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('#', 50, currentY + 5)
        .text(`END 1: ${c1.name || 'End 1'}`, 80, currentY + 5)
        .text('WIRE COLOR', 240, currentY + 5)
        .text(`END 2: ${c2.name || 'End 2'}`, 340, currentY + 5)
        .text('CONTINUITY', 470, currentY + 5);

      currentY += 22;

      const pinMapping = snap.pinMapping || [];

      for (let i = 0; i < pinMapping.length; i++) {
        const item = pinMapping[i];
        if (i % 2 === 1) {
          doc.rect(40, currentY, 515, 18).fill('#f8fafc');
        }

        doc
          .fillColor('#334155')
          .fontSize(9)
          .font('Helvetica')
          .text(`${i + 1}`, 50, currentY + 4)
          .text(`Pin ${item.sourcePinNumber}: ${item.sourcePinName}`, 80, currentY + 4)
          .text(`${item.wireColor || '#3B82F6'}`, 240, currentY + 4)
          .text(`Pin ${item.targetPinNumber}: ${item.targetPinName}`, 340, currentY + 4)
          .text('[  ] PASS', 470, currentY + 4);

        currentY += 18;
      }

      // Quality Assurance Box
      currentY = Math.max(currentY + 30, 520);

      doc
        .rect(40, currentY, 515, 120)
        .strokeColor('#cbd5e1')
        .stroke();

      doc
        .fillColor('#0f172a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('3. PRODUCTION QA & SIGN-OFF', 50, currentY + 12);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#475569')
        .text('Assembler Signature: _______________________', 50, currentY + 40)
        .text('Assembly Date: ___________________', 320, currentY + 40)
        .text('QA Tester Signature: ______________________', 50, currentY + 70)
        .text('Hi-Pot / Continuity: [  ] VERIFIED 100%', 320, currentY + 70)
        .text(`Status: ${job.status}`, 50, currentY + 95)
        .text(`Technician Notes: ${job.technicianNotes || 'None'}`, 200, currentY + 95);

      doc.end();
    });
  }
}
