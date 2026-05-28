import { MinLength, Min, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateProductInput {
  @ApiProperty() @MinLength(3) name!: string
  @ApiProperty() @MinLength(10) description!: string
  @ApiProperty() @Min(0) price!: number
  @ApiProperty() @Min(0) stock!: number
  @ApiProperty() @IsUUID() categoryId!: string
}
