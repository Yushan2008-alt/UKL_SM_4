import { IsEmail, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginInput {
  @ApiProperty() @IsEmail() email!: string
  @ApiProperty() @MinLength(8) password!: string
}
