import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PaymentStatus } from '../common/enums/payment-status.enum'
import { NotificationsGateway } from '../notifications/notifications.gateway'

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifGateway: NotificationsGateway,
  ) {}

  async findByOrder(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } })
    if (!payment) throw new NotFoundException('Pembayaran tidak ditemukan')
    return payment
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

      const sellerIds = [...new Set(payment.order.items.map((i) => i.product.sellerId))]
      for (const sellerId of sellerIds) {
        const notif = await this.prisma.notification.create({
          data: {
            title: 'Pembayaran Diterima',
            message: `Pesanan #${orderId.slice(-8).toUpperCase()} telah dibayar oleh ${payment.order.buyer.name}`,
            userId: sellerId,
          },
        })
        this.notifGateway.notifyUser(sellerId, notif)
      }
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { select: { id: true, name: true, price: true } } } }, payment: true },
    })

    return { payment: updated, order, redirectUrl: `/orders/${orderId}` }
  }

  async handleWebhook(payload: any) {
    // TODO: Validasi signature/header dari Payment Gateway (misal: Midtrans/Xendit)
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
