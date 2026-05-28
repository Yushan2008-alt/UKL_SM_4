import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async ensureCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    })
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true }, take: 1 } },
              },
            },
          },
        },
      })
    }
    return cart
  }

  async getCart(userId: string) {
    return this.ensureCart(userId)
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    if (!product.isActive || !product.isApproved) throw new BadRequestException('Produk tidak tersedia')
    if (quantity > product.stock) throw new BadRequestException('Stok tidak mencukupi')

    const cart = await this.ensureCart(userId)

    const existing = cart.items.find((i) => i.productId === productId)
    if (existing) {
      const newQty = existing.quantity + quantity
      if (newQty > product.stock) throw new BadRequestException('Stok tidak mencukupi')
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      })
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      })
    }

    return this.getCart(userId)
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    if (quantity < 1) return this.removeItem(userId, productId)

    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    if (quantity > product.stock) throw new BadRequestException('Stok tidak mencukupi')

    const cart = await this.ensureCart(userId)
    const item = cart.items.find((i) => i.productId === productId)
    if (!item) throw new NotFoundException('Item tidak ditemukan di keranjang')

    await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity } })
    return this.getCart(userId)
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.ensureCart(userId)
    const item = cart.items.find((i) => i.productId === productId)
    if (!item) throw new NotFoundException('Item tidak ditemukan di keranjang')

    await this.prisma.cartItem.delete({ where: { id: item.id } })
    return this.getCart(userId)
  }

  async clearCart(userId: string) {
    const cart = await this.ensureCart(userId)
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    return this.getCart(userId)
  }
}
