import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MessageStatus } from '../@generated/prisma/enums'

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(senderId: string, receiverId: string, content: string) {
    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } })
    if (!receiver) throw new NotFoundException('Receiver tidak ditemukan')

    return this.prisma.message.create({
      data: { senderId, receiverId, content, status: MessageStatus.SENT },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    })
  }

  async getConversation(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
  }

  async markAsDelivered(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } })
    if (!message) throw new NotFoundException('Message tidak ditemukan')
    if (message.receiverId !== userId) throw new ForbiddenException('Bukan message Anda')

    return this.prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.DELIVERED },
    })
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } })
    if (!message) throw new NotFoundException('Message tidak ditemukan')
    if (message.receiverId !== userId) throw new ForbiddenException('Bukan message Anda')

    return this.prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.READ },
    })
  }

  async getConversations(userId: string) {
    const contacts = await this.prisma.user.findMany({
      where: {
        OR: [
          { sentMessages: { some: { receiverId: userId } } },
          { receivedMessages: { some: { senderId: userId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        sentMessages: {
          where: { receiverId: userId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        receivedMessages: {
          where: { senderId: userId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            sentMessages: {
              where: {
                receiverId: userId,
                status: { not: MessageStatus.READ },
              },
            },
          },
        },
      },
    })

    const conversations = contacts.map((contact) => {
      const lastSent = contact.sentMessages[0]
      const lastReceived = contact.receivedMessages[0]
      
      let lastMessage: Record<string, any> | null = null
      if (lastSent && lastReceived) {
        lastMessage =
          lastSent.createdAt > lastReceived.createdAt ? lastSent : lastReceived
      } else {
        lastMessage = lastSent || lastReceived
      }

      return {
        contact: {
          id: contact.id,
          name: contact.name,
          avatarUrl: contact.avatarUrl,
        },
        lastMessage,
        unreadCount: contact._count.sentMessages,
      }
    })

    return conversations.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt?.getTime() || 0
      const dateB = b.lastMessage?.createdAt?.getTime() || 0
      return dateB - dateA
    })
  }
}
