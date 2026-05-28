import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { CreateProductInput } from './dto/create-product.input'
import { UpdateProductInput } from './dto/update-product.input'
import { FilterProductInput } from './dto/filter-product.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role } from '../common/enums/role.enum'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async products(@Query() filter: FilterProductInput) {
    return this.productsService.findAll(filter)
  }

  @Get(':id')
  async product(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth()
  async createProduct(@CurrentUser() user: any, @Body() input: CreateProductInput) {
    return this.productsService.create(user.id, user.role, input)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth()
  async updateProduct(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() input: UpdateProductInput,
  ) {
    return this.productsService.update(id, user.id, user.role, input)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth()
  async removeProduct(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.remove(id, user.id, user.role)
  }
}
