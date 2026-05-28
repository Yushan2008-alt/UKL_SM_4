export class CartItemProduct {
  id!: string
  name!: string
  price!: number
  stock!: number
  imageUrl?: string
}

export class CartItem {
  id!: string
  quantity!: number
  product!: CartItemProduct
}

export class Cart {
  id!: string
  items!: CartItem[]
}
