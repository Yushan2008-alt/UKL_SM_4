import { IsString, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SendMessageInput {
  @ApiProperty() @IsUUID() receiverId!: string
  @ApiProperty() @IsString() content!: string
}
