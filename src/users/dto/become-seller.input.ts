import { IsOptional, IsString, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class BecomeSellerInput {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) storeName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() storePhone?: string
  @ApiPropertyOptional() @IsOptional() @IsString() storeAddress?: string
  @ApiPropertyOptional() @IsOptional() @IsString() storeDescription?: string
}
