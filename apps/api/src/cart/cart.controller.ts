import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { Public } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

class AddCartItemDto {
  productId?: string;
  customCableId?: string;
  quantity?: number;
  sessionId?: string;
}

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get current user or session cart' })
  getCart(
    @CurrentUser() user?: User,
    @Query('sessionId') sessionId?: string,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    return this.cartService.getOrCreateCart(user, sessionId || headerSessionId);
  }

  @Public()
  @Post('items')
  @ApiOperation({ summary: 'Add standard product or custom cable to cart' })
  addItem(
    @Body() body: AddCartItemDto,
    @CurrentUser() user?: User,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    return this.cartService.addItem({
      user,
      sessionId: body.sessionId || headerSessionId,
      productId: body.productId,
      customCableId: body.customCableId,
      quantity: body.quantity,
    });
  }

  @Public()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItemQuantity(id, Number(quantity));
  }

  @Public()
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @Public()
  @Delete('clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  clear(
    @CurrentUser() user?: User,
    @Query('sessionId') sessionId?: string,
    @Headers('x-session-id') headerSessionId?: string,
  ) {
    return this.cartService.clearCart(user, sessionId || headerSessionId);
  }
}
