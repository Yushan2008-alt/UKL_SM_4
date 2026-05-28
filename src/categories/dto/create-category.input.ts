import { MinLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCategoryInput {
  @ApiProperty() @MinLength(2) name!: string
  @ApiProperty() @MinLength(2) slug!: string
  @ApiPropertyOptional() @IsOptional() iconUrl?: string
}
