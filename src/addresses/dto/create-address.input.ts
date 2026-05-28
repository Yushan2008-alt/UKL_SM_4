import { MinLength, IsOptional, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateAddressInput {
  @ApiProperty() @MinLength(1) label!: string
  @ApiProperty() @MinLength(2) recipientName!: string
  @ApiProperty() @MinLength(10) phone!: string
  @ApiProperty() @MinLength(5) address!: string
  @ApiProperty() @MinLength(3) city!: string
  @ApiProperty() @MinLength(3) province!: string
  @ApiProperty() @MinLength(3) postalCode!: string
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean
}
