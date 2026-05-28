import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { CreateOrderInput } from './dto/create-order.input'
import { VerifyOrderInput } from './dto/verify-order.input'
import { OrderStatus } from '../common/enums/order-status.enum'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role } from '../common/enums/role.enum'

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async myOrders(@CurrentUser() user: any) {
    return this.ordersService.findByBuyer(user.id)
  }

  @Get(':id')
  async order(@Param('id') id: string) {
    return this.ordersService.findOne(id)
  }

  @Post()
  async createOrder(@CurrentUser() user: any, @Body() input: CreateOrderInput) {
    return this.ordersService.createOrder(user.id, input)
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, user.id, status)
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async verifyOrder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() input: VerifyOrderInput,
  ) {
    return this.ordersService.verifyOrder(id, user.id, user.role, input.action)
  }
}
