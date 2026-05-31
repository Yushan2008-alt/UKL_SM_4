import { IsOptional, IsUUID, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateOrderInput {
  @ApiPropertyOptional() @IsOptional() @IsUUID() addressId?: string
  @ApiProperty({ enum: ['TRANSFER', 'EWALLET', 'COD', 'QRIS'] }) @IsEnum(['TRANSFER', 'EWALLET', 'COD', 'QRIS']) paymentMethod!: string
}
