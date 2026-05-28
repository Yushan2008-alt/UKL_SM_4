import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PaymentStatus } from '../../common/enums/payment-status.enum'

export class UpdatePaymentStatusInput {
  @ApiProperty({ enum: PaymentStatus, description: 'PAID, FAILED, or REFUNDED' }) @IsEnum(PaymentStatus) status!: PaymentStatus
}

