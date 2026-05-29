import { ApiProperty } from '@nestjs/swagger'

export class GoogleLoginPayload {
  @ApiProperty() accessToken!: string
  @ApiProperty() userId!: string
  @ApiProperty() name!: string
  @ApiProperty() email!: string
  @ApiProperty() role!: string
  @ApiProperty() isNewUser!: boolean
}
