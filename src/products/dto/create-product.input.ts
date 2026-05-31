import { MinLength, Min, IsUUID, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductInput {
  @ApiProperty() @MinLength(3) name!: string
  @ApiProperty() @MinLength(10) description!: string
  @ApiProperty() @Min(0) price!: number
  @ApiPropertyOptional() @IsOptional() @Min(0) stock?: number
  @ApiProperty() @IsUUID() categoryId!: string
  @ApiProperty({ enum: ['PHYSICAL', 'DIGITAL'], default: 'PHYSICAL' }) @IsEnum(['PHYSICAL', 'DIGITAL']) productType!: 'PHYSICAL' | 'DIGITAL'
  @ApiPropertyOptional() @ValidateIf(o => o.productType === 'DIGITAL') @IsOptional() fileUrl?: string
}
