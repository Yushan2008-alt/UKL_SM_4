import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { FilterProductInput } from './dto/filter-product.input'
import { CreateProductInput } from './dto/create-product.input'
import { UpdateProductInput } from './dto/update-product.input'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterProductInput) {
    const { query, categoryId, minPrice, maxPrice, minRating, sort, productType, page = 1, limit = 12 } = filter

    const where: any = { isActive: true, isApproved: true }

    if (query) where.name = { contains: query, mode: 'insensitive' }
    if (categoryId) where.categoryId = categoryId
    if (productType) where.productType = productType
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }
    if (minRating) where.avgRating = { gte: minRating }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'cheapest') orderBy = { price: 'asc' }
    else if (sort === 'popular') orderBy = { totalReviews: 'desc' }
    else if (sort === 'rating') orderBy = { avgRating: 'desc' }

    const skip = (page - 1) * limit

    const [rawItems, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { images: true, category: true, seller: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.product.count({ where }),
    ])

    const items = rawItems.map((item: any) => ({ ...item, price: Number(item.price) }))

    return { items, total, page, limit }
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        seller: { select: { id: true, name: true, email: true } },
        reviews: { include: { user: { select: { id: true, name: true } } } },
      },
    })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    return { ...product, price: Number(product.price) }
  }

  async create(userId: string, userRole: string, input: CreateProductInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User tidak ditemukan')

    if (userRole === 'SELLER' && !user.isVerified) {
      throw new BadRequestException('Akun seller belum diverifikasi')
    }

    if (input.productType === 'DIGITAL' && !input.fileUrl) {
      throw new BadRequestException('Produk digital wajib memiliki fileUrl')
    }

    const data: any = {
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.productType === 'DIGITAL'
        ? (input.stock != null && input.stock > 0 ? input.stock : -1)
        : (input.stock ?? 0),
      productType: input.productType,
      fileUrl: input.fileUrl ?? null,
      categoryId: input.categoryId,
      sellerId: userId,
      isApproved: true,
    }

    if (input.imageUrl) {
      data.images = {
        create: [{ url: input.imageUrl, isPrimary: true }]
      }
    }

    const created = await this.prisma.product.create({
      data,
      include: { images: true, category: true, seller: { select: { id: true, name: true, email: true } } },
    })
    return { ...created, price: Number(created.price) }
  }

  async update(id: string, userId: string, userRole: string, input: UpdateProductInput) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    if (userRole !== 'ADMIN' && product.sellerId !== userId) throw new ForbiddenException('Bukan produk Anda')

    const { imageUrl, fileSize, weight, ...updateData } = input as any

    const isDigital = product.productType === 'DIGITAL' || input.productType === 'DIGITAL'
    if (isDigital) {
      updateData.stock = -1
    }

    if (imageUrl) {
      updateData.images = {
        deleteMany: {}, // Hapus image lama
        create: [{ url: imageUrl, isPrimary: true }]
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { images: true, category: true, seller: { select: { id: true, name: true, email: true } } },
    })
    return { ...updated, price: Number(updated.price) }
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Produk tidak ditemukan')
    if (userRole !== 'ADMIN' && product.sellerId !== userId) throw new ForbiddenException('Bukan produk Anda')

    await this.prisma.cartItem.deleteMany({ where: { productId: id } })
    await this.prisma.product.delete({ where: { id } })
    return true
  }
}
