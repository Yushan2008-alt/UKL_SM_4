import { Min, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AddToCartInput {
  @ApiProperty() @IsUUID() productId!: string
  @ApiProperty({ minimum: 1 }) @Min(1) quantity!: number
}
