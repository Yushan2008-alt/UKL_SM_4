import { Role } from '../common/enums/role.enum'

export class User {
  id!: string
  name!: string
  email!: string
  role!: Role
  isVerified!: boolean
  isActive!: boolean
  avatarUrl?: string
  createdAt!: Date
  updatedAt!: Date
}
