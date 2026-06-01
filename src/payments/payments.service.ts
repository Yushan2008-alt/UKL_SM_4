import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { PaymentStatus } from '../common/enums/payment-status.enum'
import { NotificationsGateway } from '../notifications/notifications.gateway'

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifGateway: NotificationsGateway,
    private config: ConfigService,
  ) {}

  async findByOrder(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } })
    if (!payment) throw new NotFoundException('Pembayaran tidak ditemukan')
    return { ...payment, amount: Number(payment.amount) }
  }

  async updateStatus(orderId: string, status: PaymentStatus, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: { include: { items: { include: { product: { select: { sellerId: true } } } }, buyer: { select: { id: true, name: true } } } } },
    })
    if (!payment) throw new NotFoundException('Pembayaran tidak ditemukan')
    if (userId && payment.order.buyer.id !== userId) throw new ForbiddenException('Bukan pesanan Anda')

    const data: any = { status }
    if (status === 'PAID') data.paidAt = new Date()

    const updated = await this.prisma.payment.update({ where: { orderId }, data })

    if (status === 'PAID') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      })
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { select: { id: true, name: true, price: true } } } }, payment: true },
    })

    return {
      payment: { ...updated, amount: Number(updated.amount) },
      order: order ? { ...order, totalAmount: Number(order.totalAmount), shippingCost: Number(order.shippingCost) } : null,
      redirectUrl: `/orders/${orderId}`,
    }
  }

  async handleWebhook(payload: any, signature?: string) {
    const serverKey = this.config.get<string>('MIDTRANS_SERVER_KEY')
    if (serverKey && signature) {
      const computedSignature = crypto
        .createHash('sha512')
        .update(payload.order_id + payload.status_code + payload.gross_amount + serverKey)
        .digest('hex')
      if (signature !== computedSignature) {
        throw new UnauthorizedException('Invalid webhook signature')
      }
    }

    const { orderId, transaction_status } = payload
    
    if (orderId && transaction_status) {
      let status: PaymentStatus | undefined

      if (transaction_status === 'settlement' || transaction_status === 'capture') {
        status = PaymentStatus.PAID
      } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
        status = PaymentStatus.FAILED
      }
      
      if (status) {
        await this.updateStatus(orderId, status)
      }
    }

    return { message: 'Webhook processed' }
  }
}
