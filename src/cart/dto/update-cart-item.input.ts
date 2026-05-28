import { Min, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateCartItemInput {
  @ApiProperty() @IsUUID() productId!: string
  @ApiProperty({ minimum: 0 }) @Min(0) quantity!: number
}
