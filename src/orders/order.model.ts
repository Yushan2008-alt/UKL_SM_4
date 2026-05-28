import { OrderStatus } from '../common/enums/order-status.enum'

export class OrderItemProduct {
  id!: string
  name!: string
  price!: number
}

export class OrderItem {
  id!: string
  quantity!: number
  priceAtTime!: number
  product!: OrderItemProduct
}

export class Order {
  id!: string
  totalAmount!: number
  shippingCost!: number
  status!: OrderStatus
  createdAt!: Date
  updatedAt!: Date
  items!: OrderItem[]
}
