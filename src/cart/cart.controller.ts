import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { CartService } from './cart.service'
import { AddToCartInput } from './dto/add-to-cart.input'
import { UpdateCartItemInput } from './dto/update-cart-item.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  async myCart(@CurrentUser() user: any) {
    return this.cart.getCart(user.id)
  }

  @Post()
  async addToCart(@CurrentUser() user: any, @Body() input: AddToCartInput) {
    return this.cart.addItem(user.id, input.productId, input.quantity)
  }

  @Patch()
  async updateCartItem(@CurrentUser() user: any, @Body() input: UpdateCartItemInput) {
    return this.cart.updateItemQuantity(user.id, input.productId, input.quantity)
  }

  @Delete(':productId')
  async removeFromCart(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.cart.removeItem(user.id, productId)
  }

  @Delete()
  async clearCart(@CurrentUser() user: any) {
    return this.cart.clearCart(user.id)
  }
}
