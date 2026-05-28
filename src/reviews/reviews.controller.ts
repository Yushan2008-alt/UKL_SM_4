import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ReviewsService } from './reviews.service'
import { CreateReviewInput } from './dto/create-review.input'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get('product/:productId')
  async productReviews(@Param('productId') productId: string) {
    return this.reviews.findByProduct(productId)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async myReviews(@CurrentUser() user: any) {
    return this.reviews.findByUser(user.id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createReview(@CurrentUser() user: any, @Body() input: CreateReviewInput) {
    return this.reviews.create(user.id, input)
  }
}
