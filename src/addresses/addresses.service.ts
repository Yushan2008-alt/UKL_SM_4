import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAddressInput } from './dto/create-address.input'
import { UpdateAddressInput } from './dto/update-address.input'

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    })
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.shippingAddress.findUnique({ where: { id } })
    if (!address) throw new NotFoundException('Alamat tidak ditemukan')
    if (address.userId !== userId) throw new ForbiddenException('Bukan alamat Anda')
    return address
  }

  async create(userId: string, input: CreateAddressInput) {
    if (input.isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return this.prisma.shippingAddress.create({
      data: { ...input, userId },
    })
  }

  async update(id: string, userId: string, input: UpdateAddressInput) {
    await this.findOne(id, userId)

    if (input.isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      })
    }

    return this.prisma.shippingAddress.update({
      where: { id },
      data: input,
    })
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    await this.prisma.shippingAddress.delete({ where: { id } })
    return true
  }
}
