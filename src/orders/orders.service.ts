import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderInput } from './dto/create-order.input'
import { OrderStatus } from '../common/enums/order-status.enum'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: {
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findBySeller(sellerId: string) {
    return this.prisma.order.findMany({
      where: { items: { some: { product: { sellerId } } } },
      include: {
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
        payment: true,
        address: true,
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, price: true, sellerId: true } } } },
        payment: true,
        address: true,
      },
    })
    if (!order) throw new NotFoundException('Order tidak ditemukan')
    return order
  }

  async createOrder(buyerId: string, input: CreateOrderInput) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: buyerId },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) throw new BadRequestException('Keranjang kosong')

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Stok ${item.product.name} tidak cukup`)
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
    const shippingCost = 15000
    const totalAmount = subtotal + shippingCost

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId,
          addressId: input.addressId,
          totalAmount,
          shippingCost,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.product.price,
            })),
          },
        },
      })

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      await tx.payment.create({
        data: { orderId: newOrder.id, amount: totalAmount, method: input.paymentMethod, status: 'UNPAID' },
      })

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return this.findOne(order.id)
  }

  async updateStatus(id: string, buyerId: string, status: OrderStatus) {
    const order = await this.findOne(id)
    if (order.buyerId !== buyerId) throw new BadRequestException('Bukan order Anda')
    return this.prisma.order.update({ where: { id }, data: { status } })
  }

  async verifyOrder(id: string, userId: string, userRole: string, action: 'accept' | 'reject') {
    const order = await this.findOne(id)

    if (order.status !== 'PENDING') throw new BadRequestException('Hanya order dengan status PENDING yang bisa diverifikasi')

    if (userRole === 'SELLER') {
      const isSellerProduct = order.items.some((item) => item.product.sellerId === userId)
      if (!isSellerProduct) throw new ForbiddenException('Anda bukan seller dari produk di order ini')
    }

    const newStatus = action === 'accept' ? OrderStatus.PROCESSING : OrderStatus.CANCELLED

    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
        payment: true,
      },
    })
  }
}
