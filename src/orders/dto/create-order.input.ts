import { IsUUID, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateOrderInput {
  @ApiProperty() @IsUUID() addressId!: string
  @ApiProperty({ enum: ['TRANSFER', 'EWALLET', 'COD'] }) @IsEnum(['TRANSFER', 'EWALLET', 'COD']) paymentMethod!: string
}
