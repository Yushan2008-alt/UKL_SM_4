export class ProductImage {
  id!: string
  url!: string
  isPrimary!: boolean
}

export class ProductCategory {
  id!: string
  name!: string
  slug!: string
}

export class ProductSeller {
  id!: string
  name!: string
  email!: string
}

export class Product {
  id!: string
  name!: string
  description!: string
  price!: number
  stock!: number
  isActive!: boolean
  isApproved!: boolean
  avgRating!: number
  totalReviews!: number
  createdAt!: Date
  updatedAt!: Date
  seller?: ProductSeller
  category?: ProductCategory
  images?: ProductImage[]
}

export class ProductConnection {
  items!: Product[]
  total!: number
  page!: number
  limit!: number
}
