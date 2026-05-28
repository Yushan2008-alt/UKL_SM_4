import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import type { PrismaClient } from '../@generated/prisma/client.js'

let PC: new (opts: any) => PrismaClient

async function getPC() {
  if (!PC) {
    const mod = await import('../@generated/prisma/client.js')
    PC = mod.PrismaClient
  }
  return PC
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
    const adapter = new PrismaPg(getAdapterOptions(url))
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

  $transaction(fn: (tx: any) => Promise<any>) {
    return this.prisma.$transaction(fn)
  }
}
