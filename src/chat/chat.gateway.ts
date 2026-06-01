import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ChatService } from './chat.service'
import { NotificationsGateway } from '../notifications/notifications.gateway'
import { NotificationsService } from '../notifications/notifications.service'
import { PrismaService } from '../prisma/prisma.service'

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private userSockets = new Map<string, Set<string>>()

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.cookie
          ?.split(';')
          .find((c) => c.trim().startsWith('token='))
          ?.split('=')[1])

      if (!token) {
        socket.emit('error', 'Authentication required')
        socket.disconnect()
        return
      }

      const payload = this.jwtService.verify(token)
      const userId = payload.sub

      socket.data.userId = userId
      socket.join(userId)

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set())
      }
      this.userSockets.get(userId)!.add(socket.id)
    } catch {
      socket.emit('error', 'Invalid token')
      socket.disconnect()
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(socket.id)
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId)
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(socket: Socket, data: { receiverId: string; message: string; content?: string }) {
    const senderId = socket.data.userId
    if (!senderId) return

    const content = data.content || data.message
    if (!content || !data.receiverId) return

    const message = await this.chatService.createMessage(senderId, data.receiverId, content)

    const messagePayload = {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      status: message.status,
    }

    this.server.to(data.receiverId).emit('new_message', messagePayload)
    this.server.to(data.receiverId).emit('receive_message', messagePayload)
    this.server.to(data.receiverId).emit('message', messagePayload)

    socket.emit('message_sent', messagePayload)

    if (this.userSockets.has(data.receiverId)) {
      this.chatService.markAsDelivered(message.id)
    }

    const sender = await this.prisma.user.findUnique({ where: { id: senderId } })
    const senderName = sender?.name || 'Pengguna'

    this.notificationsGateway.notifyUser(data.receiverId, {
      title: 'Pesan Baru',
      message: `Pesan baru dari ${senderName}: ${content}`,
      type: 'CHAT',
      data: { senderId, chatContent: content },
      link: `/chat?userId=${senderId}`,
    })

    await this.notificationsService.create(
      'Pesan Baru',
      `Pesan baru dari ${senderName}: ${content}`,
      data.receiverId,
      'CHAT',
      { senderId, chatContent: content },
      `/chat?userId=${senderId}`,
    )
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(socket: Socket, data: { messageId: string }) {
    const message = await this.chatService.markAsRead(data.messageId)
    this.server.to(message.senderId).emit('message_read', { messageId: data.messageId })
  }
}
