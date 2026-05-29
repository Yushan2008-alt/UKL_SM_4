import { IsString, MinLength, ValidateIf } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class GoogleLoginInput {
  @ApiPropertyOptional() @ValidateIf(o => !o.credential) @IsString() @MinLength(10) idToken?: string

  @ApiPropertyOptional() @ValidateIf(o => !o.idToken) @IsString() @MinLength(10) credential?: string
}
