import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'
import { CreateCategoryInput } from './dto/create-category.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Role } from '../common/enums/role.enum'

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async categories() {
    return this.categoriesService.findAll()
  }

  @Get('by-slug/:slug')
  async category(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  async createCategory(@Body() input: CreateCategoryInput) {
    return this.categoriesService.create(input)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.remove(id)
  }
}
