import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UpdateUserInput } from './dto/update-user.input'
import { BecomeSellerInput } from './dto/become-seller.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role } from '../common/enums/role.enum'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get profil user saat ini' })
  async me(@CurrentUser() user: any) {
    return this.usersService.findById(user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get semua user (untuk admin) — termasuk field seller' })
  async allUsers() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async user(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Post('become-seller')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Buyer mendaftar jadi seller',
    description: 'Role tetap BUYER, sellerStatus menjadi PENDING. Admin perlu memverifikasi.',
  })
  async becomeSeller(@CurrentUser() user: any, @Body() input: BecomeSellerInput) {
    return this.usersService.becomeSeller(user.id, input)
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update profil user' })
  async updateUser(@CurrentUser() user: any, @Body() input: UpdateUserInput) {
    return this.usersService.update(user.id, input)
  }

  @Patch(':id/verify-seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin memverifikasi seller (PATCH /users/:id/verify-seller)',
    description: 'Mengubah role → SELLER, sellerStatus → APPROVED, dan membuat notifikasi ke user.',
  })
  @ApiParam({ name: 'id', description: 'User ID yang akan diverifikasi sebagai seller' })
  async verifySeller(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.usersService.verifySeller(id, admin.id)
  }
}
