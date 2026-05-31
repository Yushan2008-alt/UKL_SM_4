import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    const secret = config.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not set. Add JWT_SECRET to Railway environment variables.',
      )
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: secret,
    })
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload?.sub) throw new UnauthorizedException('Token tidak valid: payload kosong')
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw new UnauthorizedException('User tidak ditemukan')
    if (!user.isActive) throw new UnauthorizedException('Akun Anda dinonaktifkan')
    return user
  }
}
