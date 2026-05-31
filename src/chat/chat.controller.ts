import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ChatService } from './chat.service'

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversation/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getConversation(@Req() req: any, @Param('userId') otherUserId: string) {
    return this.chatService.getConversation(req.user.id, otherUserId)
  }
}
