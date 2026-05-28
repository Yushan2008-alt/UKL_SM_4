import { PaymentStatus } from '../common/enums/payment-status.enum'

export class Payment {
  id!: string
  amount!: number
  method!: string
  status!: PaymentStatus
  paidAt?: Date
  invoiceNo!: string
  createdAt!: Date
  orderId!: string
}
