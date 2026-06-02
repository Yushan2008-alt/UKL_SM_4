import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ChatService } from './chat.service'
import { SendMessageInput } from './dto/send-message.input'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationsGateway } from '../notifications/notifications.gateway'
import { PrismaService } from '../prisma/prisma.service'

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
    private prisma: PrismaService,
  ) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.id)
  }

  @Get('conversation/:userId')
  @UseGuards(JwtAuthGuard)
  async getConversation(@Req() req: any, @Param('userId') otherUserId: string) {
    return this.chatService.getConversation(req.user.id, otherUserId)
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  async sendMessage(@Req() req: any, @Body() body: SendMessageInput) {
    const senderId = req.user.id
    const message = await this.chatService.createMessage(senderId, body.receiverId, body.content)

    const sender = await this.prisma.user.findUnique({ where: { id: senderId } })
    const senderName = sender?.name || 'Pengguna'

    this.notificationsGateway.notifyUser(body.receiverId, {
      title: 'Pesan Baru',
      message: `Pesan baru dari ${senderName}: ${body.content}`,
      type: 'CHAT',
      data: { senderId, chatContent: body.content },
      link: `/chat?userId=${senderId}`,
    })

    await this.notificationsService.create(
      'Pesan Baru',
      `Pesan baru dari ${senderName}: ${body.content}`,
      body.receiverId,
      'CHAT',
      { senderId, chatContent: body.content },
      `/chat?userId=${senderId}`,
    )

    return message
  }
}
