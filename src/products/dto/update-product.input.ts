import { IsOptional, MinLength, Min, IsUUID } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProductInput {
  @ApiPropertyOptional() @IsOptional() @MinLength(3) name?: string
  @ApiPropertyOptional() @IsOptional() @MinLength(10) description?: string
  @ApiPropertyOptional() @IsOptional() @Min(0) price?: number
  @ApiPropertyOptional() @IsOptional() @Min(0) stock?: number
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string
}
