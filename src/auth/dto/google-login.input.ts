import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GoogleLoginInput {
  @ApiProperty() @IsString() @MinLength(10) idToken!: string
}
