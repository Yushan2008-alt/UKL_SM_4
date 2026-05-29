import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UpdateUserInput } from './dto/update-user.input'
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
  async me(@CurrentUser() user: any) {
    return this.usersService.findById(user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async allUsers() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async user(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Post('become-seller')
  @UseGuards(JwtAuthGuard)
  async becomeSeller(@CurrentUser() user: any) {
    return this.usersService.becomeSeller(user.id)
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateUser(@CurrentUser() user: any, @Body() input: UpdateUserInput) {
    return this.usersService.update(user.id, input)
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async verifySeller(@Param('id') id: string) {
    return this.usersService.verifySeller(id)
  }
}
