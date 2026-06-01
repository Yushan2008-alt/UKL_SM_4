import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import type { PrismaClient } from '../@generated/prisma/client.js'

let PC: Promise<typeof import('../@generated/prisma/client.js')>

async function getPC() {
  if (!PC) PC = import('../@generated/prisma/client.js')
  const mod = await PC
  return mod.PrismaClient
}

function isLocalhost(url: string): boolean {
  return /localhost|127\.0\.0\.1|::1/.test(url)
}

function getAdapterOptions(url: string) {
  const ssl = isLocalhost(url) ? undefined : { rejectUnauthorized: false }
  return { connectionString: url, ssl }
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public prisma!: PrismaClient

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const Client = await getPC()
    const url = this.configService.get<string>('DATABASE_URL')!
    const pool = new Pool(getAdapterOptions(url))
    const adapter = new PrismaPg(pool)
    this.prisma = new Client({ adapter })
    await this.prisma.$connect()
  }

  async onModuleDestroy() {
    if (this.prisma) await this.prisma.$disconnect()
  }

  get user() { return this.prisma?.user }
  get category() { return this.prisma?.category }
  get product() { return this.prisma?.product }
  get productImage() { return this.prisma?.productImage }
  get cart() { return this.prisma?.cart }
  get cartItem() { return this.prisma?.cartItem }
  get order() { return this.prisma?.order }
  get orderItem() { return this.prisma?.orderItem }
  get payment() { return this.prisma?.payment }
  get review() { return this.prisma?.review }
  get shippingAddress() { return this.prisma?.shippingAddress }
  get notification() { return this.prisma?.notification }
  get message() { return this.prisma?.message }

  $transaction(fn: (tx: any) => Promise<any>) {
    return this.prisma.$transaction(fn)
  }
}
