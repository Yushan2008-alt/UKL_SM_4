import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AddressesService } from './addresses.service'
import { CreateAddressInput } from './dto/create-address.input'
import { UpdateAddressInput } from './dto/update-address.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  async myAddresses(@CurrentUser() user: any) {
    return this.addressesService.findByUser(user.id)
  }

  @Get(':id')
  async address(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.findOne(id, user.id)
  }

  @Post()
  async createAddress(@CurrentUser() user: any, @Body() input: CreateAddressInput) {
    return this.addressesService.create(user.id, input)
  }

  @Patch(':id')
  async updateAddress(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() input: UpdateAddressInput,
  ) {
    return this.addressesService.update(id, user.id, input)
  }

  @Delete(':id')
  async removeAddress(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.remove(id, user.id)
  }
}
