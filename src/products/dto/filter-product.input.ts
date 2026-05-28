import { IsOptional, IsUUID, Min, Max, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class FilterProductInput {
  @ApiPropertyOptional() @IsOptional() query?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string
  @ApiPropertyOptional() @IsOptional() @Min(0) minPrice?: number
  @ApiPropertyOptional() @IsOptional() maxPrice?: number
  @ApiPropertyOptional() @IsOptional() @Min(1) @Max(5) minRating?: number
  @ApiPropertyOptional({ enum: ['latest', 'cheapest', 'popular', 'rating'] }) @IsOptional() @IsEnum(['latest', 'cheapest', 'popular', 'rating']) sort?: string
  @ApiPropertyOptional() @IsOptional() @Min(1) page?: number
  @ApiPropertyOptional() @IsOptional() @Min(1) @Max(50) limit?: number
}
