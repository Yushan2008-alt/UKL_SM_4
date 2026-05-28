import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { UpdatePaymentStatusInput } from './dto/update-payment-status.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Role } from '../common/enums/role.enum'

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get(':orderId')
  async paymentByOrder(@Param('orderId') orderId: string) {
    return this.payments.findByOrder(orderId)
  }

  @Patch(':orderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async updatePaymentStatus(
    @Param('orderId') orderId: string,
    @Body() input: UpdatePaymentStatusInput,
  ) {
    return this.payments.updateStatus(orderId, input.status)
  }
}
