import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterInput } from './dto/register.input'
import { LoginInput } from './dto/login.input'
import { GoogleLoginInput } from './dto/google-login.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() input: RegisterInput) {
    return this.auth.register(input)
  }

  @Post('login')
  async login(@Body() input: LoginInput, @Res({ passthrough: true }) res: Response) {
    return this.auth.login(input, res)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.auth.logout(res)
  }

  @Post('google')
  async googleLogin(@Body() input: GoogleLoginInput) {
    return this.auth.googleLogin(input.idToken)
  }
}
