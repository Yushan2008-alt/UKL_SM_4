import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCategoryInput } from './dto/create-category.input'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({ include: { _count: { select: { products: true } } } })
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } })
    if (!category) throw new NotFoundException('Kategori tidak ditemukan')
    return category
  }

  async create(input: CreateCategoryInput) {
    const existing = await this.prisma.category.findUnique({ where: { slug: input.slug } })
    if (existing) throw new ConflictException('Slug kategori sudah digunakan')
    return this.prisma.category.create({ data: input })
  }

  async remove(id: string) {
    await this.prisma.category.findUniqueOrThrow({ where: { id } })
    await this.prisma.category.delete({ where: { id } })
    return true
  }
}
