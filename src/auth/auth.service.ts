import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import * as bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterInput } from './dto/register.input'
import { LoginInput } from './dto/login.input'
import { AuthPayload } from './dto/auth.object'
import { GoogleLoginPayload } from './dto/google-login.object'

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client
  private readonly clientId: string

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.clientId = this.config.get<string>('GOOGLE_CLIENT_ID') ?? ''
    this.googleClient = new OAuth2Client(this.clientId)
  }

  async googleLogin(idToken: string): Promise<GoogleLoginPayload> {
    if (!this.clientId) {
      throw new UnauthorizedException(
        'GOOGLE_CLIENT_ID not configured on server. Hubungi developer.',
      )
    }

    let payload: { email?: string; name?: string; sub?: string }
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.clientId,
      })
      payload = ticket.getPayload()!
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new UnauthorizedException(
        process.env.NODE_ENV === 'production'
          ? 'Token Google tidak valid'
          : `Token Google tidak valid: ${message}`,
      )
    }

    if (!payload.email) throw new UnauthorizedException('Email tidak ditemukan di token Google')

    let user = await this.prisma.user.findUnique({ where: { email: payload.email } })
    let isNewUser = false

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: payload.name ?? payload.email.split('@')[0],
          email: payload.email,
          password: await bcrypt.hash(Math.random().toString(36), 12),
          role: 'BUYER',
          isVerified: true,
        },
      })
      isNewUser = true
    }

    const token = this.signToken(user)
    return {
      accessToken: token,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isNewUser,
    }
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } })
    if (existing) throw new ConflictException('Email sudah terdaftar')

    const password = await bcrypt.hash(input.password, 12)

    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
        role: input.role,
        isVerified: input.role === 'SELLER' ? false : true,
      },
    })

    return { accessToken: this.signToken(user), userId: user.id, name: user.name, email: user.email, role: user.role }
  }

  async login(input: LoginInput, res: Response): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new NotFoundException('Email tidak ditemukan')

    const valid = await bcrypt.compare(input.password, user.password)
    if (!valid) throw new UnauthorizedException('Password salah')

    const token = this.signToken(user)

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.cookie('user_role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { accessToken: token, userId: user.id, name: user.name, email: user.email, role: user.role }
  }

  logout(res: Response): boolean {
    res.clearCookie('access_token')
    res.clearCookie('user_role')
    return true
  }

  private signToken(user: { id: string; email: string; role: string }): string {
    return this.jwt.sign({ sub: user.id, email: user.email, role: user.role })
  }
}
