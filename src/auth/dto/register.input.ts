import { IsEmail, MinLength, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from '../../common/enums/role.enum'

export class RegisterInput {
  @ApiProperty() @MinLength(2) name!: string
  @ApiProperty() @IsEmail() email!: string
  @ApiProperty() @MinLength(8) password!: string
  @ApiProperty({ enum: [Role.BUYER, Role.SELLER] }) @IsEnum([Role.BUYER, Role.SELLER]) role!: Role
}
