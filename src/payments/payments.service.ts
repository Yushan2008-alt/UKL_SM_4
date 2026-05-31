import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PaymentStatus } from '../common/enums/payment-status.enum'

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findByOrder(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } })
    if (!payment) throw new NotFoundException('Pembayaran tidak ditemukan')
    return payment
  }

  async updateStatus(orderId: string, status: PaymentStatus) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: { include: { items: { include: { product: { select: { sellerId: true } } } }, buyer: { select: { name: true } } } } },
    })
    if (!payment) throw new NotFoundException('Pembayaran tidak ditemukan')

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
        await this.prisma.notification.create({
          data: {
            title: 'Pembayaran Diterima',
            message: `Pesanan #${orderId.slice(-8).toUpperCase()} telah dibayar oleh ${payment.order.buyer.name}`,
            userId: sellerId,
          },
        })
      }
    }

    return updated
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
