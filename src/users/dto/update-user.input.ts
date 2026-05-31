import { IsOptional, MinLength, IsEmail } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserInput {
  @ApiPropertyOptional() @IsOptional() @MinLength(2) name?: string
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string
  @ApiPropertyOptional() @IsOptional() avatarUrl?: string
}
