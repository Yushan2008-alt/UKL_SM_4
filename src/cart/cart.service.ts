import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private toNumberDeep(obj: any): any {
    if (!obj) return obj
    if (Array.isArray(obj)) return obj.map((i) => this.toNumberDeep(i))
    if (typeof obj !== 'object') return obj

    const result: any = {}
    for (const key of Object.keys(obj)) {
      const val = obj[key]
      if (key === 'price' || key === 'amount' || key === 'totalAmount' || key === 'shippingCost') {
        result[key] = Number(val)
      } else if (Array.isArray(val)) {
        result[key] = val.map((i: any) => this.toNumberDeep(i))
      } else if (val && typeof val === 'object' && !(val instanceof Date)) {
        result[key] = this.toNumberDeep(val)
      } else {
        result[key] = val
      }
    }
    return result
  }

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
    return this.toNumberDeep(cart)
  }

  async getCart(userId: string) {
    return this.ensureCart(userId)
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    if (!product.isActive || !product.isApproved) throw new BadRequestException('Produk tidak tersedia')
    if (product.stock >= 0 && quantity > product.stock) throw new BadRequestException('Stok tidak mencukupi')

    const cart = await this.ensureCart(userId)

    const existing = cart.items.find((i) => i.productId === productId)
    if (existing) {
      const newQty = existing.quantity + quantity
      if (product.stock >= 0 && newQty > product.stock) throw new BadRequestException('Stok tidak mencukupi')
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
    if (product.stock >= 0 && quantity > product.stock) throw new BadRequestException('Stok tidak mencukupi')

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
