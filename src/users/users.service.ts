import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationsGateway } from '../notifications/notifications.gateway'
import { NotificationType } from '../@generated/prisma/enums'
import { UpdateUserInput } from './dto/update-user.input'
import { BecomeSellerInput } from './dto/become-seller.input'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User tidak ditemukan')
    return user
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        avatarUrl: true,
        sellerStatus: true,
        shopName: true,
        shopDescription: true,
        shopLogo: true,
        category: true,
        storeName: true,
        storePhone: true,
        storeAddress: true,
        storeDescription: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(id: string, input: UpdateUserInput) {
    const user = await this.findById(id)

    if (input.email && input.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: input.email } })
      if (existing) throw new BadRequestException('Email sudah digunakan user lain')
    }

    return this.prisma.user.update({ where: { id }, data: input })
  }

  async becomeSeller(id: string, input: BecomeSellerInput) {
    const user = await this.findById(id)

    // Validasi status
    if (user.sellerStatus === 'PENDING') {
      throw new BadRequestException('Pendaftaran seller Anda masih dalam proses verifikasi')
    }
    if (user.role === 'SELLER' || user.sellerStatus === 'APPROVED') {
      throw new BadRequestException('Anda sudah terdaftar sebagai seller')
    }
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Admin tidak bisa mendaftar sebagai seller')
    }

    // Update user dengan status PENDING (role tetap BUYER)
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        role: 'BUYER',               // ✅ Tetap BUYER
        sellerStatus: 'PENDING',     // ✅ Set status pending
        shopName: input.shopName,
        shopDescription: input.shopDescription,
        shopLogo: input.shopLogo,
        category: input.category,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        sellerStatus: true,
        shopName: true,
        shopDescription: true,
        shopLogo: true,
        category: true,
      },
    })

    // Kirim notifikasi ke semua admin
    try {
      const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } })
      for (const admin of admins) {
        const notification = await this.notificationsService.create(
          'Pendaftaran Seller Baru',
          `${updatedUser.name} mendaftar sebagai seller dan menunggu verifikasi`,
          admin.id,
          NotificationType.SELLER_REGISTRATION,
        )

        // ✅ Real-time notifikasi via Socket.IO ke admin
        this.notificationsGateway.notifyUser(admin.id, {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: NotificationType.SELLER_REGISTRATION,
          isRead: false,
          createdAt: notification.createdAt,
        })
      }
    } catch (e) {
      // Non-fatal: jangan gagalkan request utama jika notif ke admin gagal
      console.error('Gagal kirim notif ke admin:', e)
    }

    return updatedUser
  }

  async verifySeller(sellerId: string, adminId: string) {
    // Validasi admin
    const admin = await this.findById(adminId)
    if (admin.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized: Admin only')
    }

    // Cek user yang akan diverifikasi
    const user = await this.findById(sellerId)

    if (user.sellerStatus !== 'PENDING') {
      throw new BadRequestException('User tidak dalam status pending')
    }

    // ✅ Update role → SELLER, sellerStatus → APPROVED, isVerified → true
    const updatedUser = await this.prisma.user.update({
      where: { id: sellerId },
      data: {
        role: 'SELLER',
        sellerStatus: 'APPROVED',
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        sellerStatus: true,
        shopName: true,
        shopDescription: true,
        shopLogo: true,
        category: true,
      },
    })

    // ✅ Kirim notifikasi ke user yang diverifikasi (database)
    const notification = await this.notificationsService.create(
      '🎉 Selamat! Akun Seller Anda Disetujui',
      'Akun seller Anda telah diverifikasi. Anda sekarang dapat mulai berjualan di StudentCommerce!',
      sellerId,
      NotificationType.SELLER_APPROVED,
    )

    // ✅ Real-time notifikasi via Socket.IO ke user
    this.notificationsGateway.notifyUser(sellerId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: NotificationType.SELLER_APPROVED,
      isRead: false,
      createdAt: notification.createdAt,
    })

    return updatedUser
  }
}
