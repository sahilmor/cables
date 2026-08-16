import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { Public } from '../common/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay payment order for checkout' })
  createOrder(@Body('orderId') orderId: string) {
    return this.paymentsService.createRazorpayOrder(orderId);
  }

  @Post('verify')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  verifyPayment(@Body() body: any) {
    return this.paymentsService.verifyPayment(body);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Razorpay webhook receiver' })
  handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }
}
