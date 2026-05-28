import { IsUUID, Min, Max, IsOptional, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateReviewInput {
  @ApiProperty() @IsUUID() productId!: string
  @ApiProperty() @Min(1) @Max(5) rating!: number
  @ApiPropertyOptional() @IsOptional() @MinLength(3) comment?: string
}
