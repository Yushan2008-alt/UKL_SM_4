import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  async myNotifications(@CurrentUser() user: any) {
    return this.notifications.findByUser(user.id)
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: any) {
    return this.notifications.getUnreadCount(user.id)
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notifications.markAsRead(id)
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notifications.markAllAsRead(user.id)
  }
}
