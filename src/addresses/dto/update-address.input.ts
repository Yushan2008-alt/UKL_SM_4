import { IsOptional, MinLength, IsBoolean } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateAddressInput {
  @ApiPropertyOptional() @IsOptional() @MinLength(1) label?: string
  @ApiPropertyOptional() @IsOptional() @MinLength(2) recipientName?: string
  @ApiPropertyOptional() @IsOptional() @MinLength(10) phone?: string
  @ApiPropertyOptional() @IsOptional() @MinLength(5) address?: string
  @ApiPropertyOptional() @IsOptional() @MinLength(3) city?: string
  @ApiPropertyOptional() @IsOptional() @MinLength(3) province?: string
  @ApiPropertyOptional() @IsOptional() @MinLength(3) postalCode?: string
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean
}
