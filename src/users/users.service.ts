import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserInput } from './dto/update-user.input'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User tidak ditemukan')
    return user
  }

  async findAll() {
    return this.prisma.user.findMany()
  }

  async update(id: string, input: UpdateUserInput) {
    await this.findById(id)
    return this.prisma.user.update({ where: { id }, data: input })
  }

  async becomeSeller(id: string) {
    const user = await this.findById(id)
    if (user.role === 'SELLER') throw new BadRequestException('Anda sudah menjadi penjual')
    if (user.role === 'ADMIN') throw new BadRequestException('Admin tidak bisa menjadi penjual')

    return this.prisma.user.update({
      where: { id },
      data: { role: 'SELLER', isVerified: false },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    })
  }

  async verifySeller(id: string) {
    const user = await this.findById(id)
    if (user.role !== 'SELLER') throw new BadRequestException('Hanya akun SELLER yang bisa diverifikasi')
    if (user.isVerified) throw new BadRequestException('Akun ini sudah diverifikasi')

    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    })
  }
}
