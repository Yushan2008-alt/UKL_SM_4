import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class VerifyOrderInput {
  @ApiProperty({ enum: ['accept', 'reject'] }) @IsEnum(['accept', 'reject']) action!: 'accept' | 'reject'
}
