import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private userSockets = new Map<string, Set<string>>()

  constructor(private jwtService: JwtService) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.cookie
          ?.split(';')
          .find((c) => c.trim().startsWith('token='))
          ?.split('=')[1])

      if (!token) {
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

  notifyUser(userId: string, notification: any) {
    this.server.to(userId).emit('new_notification', notification)
  }
}
