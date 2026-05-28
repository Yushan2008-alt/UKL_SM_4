import { ApiProperty } from '@nestjs/swagger'

export class AuthPayload {
  @ApiProperty() accessToken!: string
  @ApiProperty() userId!: string
  @ApiProperty() name!: string
  @ApiProperty() email!: string
  @ApiProperty() role!: string
}
