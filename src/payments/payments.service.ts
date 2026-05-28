import { Injectable, NotFoundException } from '@nestjs/common'
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
    const payment = await this.prisma.payment.findUnique({ where: { orderId } })
    if (!payment) throw new NotFoundException('Pembayaran tidak ditemukan')

    const data: any = { status }
    if (status === 'PAID') data.paidAt = new Date()

    return this.prisma.payment.update({ where: { orderId }, data })
  }
}
