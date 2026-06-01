import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ChatService } from './chat.service'
import { SendMessageInput } from './dto/send-message.input'

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversation/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getConversation(@Req() req: any, @Param('userId') otherUserId: string) {
    return this.chatService.getConversation(req.user.id, otherUserId)
  }

  @Post('messages')
  @UseGuards(AuthGuard('jwt'))
  async sendMessage(@Req() req: any, @Body() body: SendMessageInput) {
    return this.chatService.createMessage(req.user.id, body.receiverId, body.content)
  }
}
