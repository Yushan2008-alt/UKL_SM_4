import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateReviewInput } from './dto/create-review.input'

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, isVisible: true },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(userId: string, input: CreateReviewInput) {
    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        productId: input.productId,
        order: { buyerId: userId, status: 'DELIVERED' },
      },
    })
    if (!purchased) throw new ForbiddenException('Hanya pembeli yang bisa memberi review')

    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId: input.productId } },
    })
    if (existing) throw new ConflictException('Kamu sudah memberi review untuk produk ini')

    const review = await this.prisma.review.create({
      data: { ...input, userId },
      include: { user: { select: { id: true, name: true } } },
    })

    const stats = await this.prisma.review.aggregate({
      where: { productId: input.productId, isVisible: true },
      _avg: { rating: true },
      _count: true,
    })

    await this.prisma.product.update({
      where: { id: input.productId },
      data: {
        avgRating: stats._avg.rating ?? 0,
        totalReviews: stats._count,
      },
    })

    return review
  }
}
