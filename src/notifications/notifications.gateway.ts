import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server

  notifyUser(userId: string, notification: any) {
    this.server.to(userId).emit('new_notification', notification)
  }
}
