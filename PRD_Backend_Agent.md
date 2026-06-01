# PRD Backend — E-Commerce Pelajar
> Stack: NestJS · PostgreSQL · Prisma · GraphQL (Code-first) · Swagger  
> Deploy: **Railway**

---

## 1. Setup & Install

```bash
npm i -g @nestjs/cli
nest new student-commerce-api --package-manager npm
cd student-commerce-api

npm install \
  @nestjs/graphql @nestjs/apollo @apollo/server graphql \
  @nestjs/config @nestjs/jwt @nestjs/passport \
  passport passport-jwt @types/passport-jwt \
  @prisma/client prisma \
  class-validator class-transformer \
  bcrypt @types/bcrypt \
  @nestjs/swagger swagger-ui-express \
  @nestjs/serve-static \
  @nestjs/platform-express \
  cookie-parser @types/cookie-parser \
  @nestjs/throttler \
  multer @types/multer

npx prisma init
```

### `.env`
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/student_commerce
JWT_SECRET=change-this-to-a-very-long-random-string-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
```

---

## 2. Struktur Folder

```
src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   └── enums/
│       ├── role.enum.ts
│       ├── order-status.enum.ts
│       └── payment-status.enum.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       ├── login.input.ts
│       ├── register.input.ts
│       └── auth.object.ts
├── users/
│   ├── users.module.ts
│   ├── users.resolver.ts
│   ├── users.service.ts
│   ├── user.model.ts
│   └── dto/update-user.input.ts
├── categories/
│   ├── categories.module.ts
│   ├── categories.resolver.ts
│   ├── categories.service.ts
│   ├── category.model.ts
│   └── dto/create-category.input.ts
├── products/
│   ├── products.module.ts
│   ├── products.resolver.ts
│   ├── products.service.ts
│   ├── product.model.ts
│   └── dto/
│       ├── create-product.input.ts
│       ├── update-product.input.ts
│       └── filter-product.input.ts
├── cart/
│   ├── cart.module.ts
│   ├── cart.resolver.ts
│   ├── cart.service.ts
│   └── cart.model.ts
├── orders/
│   ├── orders.module.ts
│   ├── orders.resolver.ts
│   ├── orders.service.ts
│   ├── order.model.ts
│   └── dto/create-order.input.ts
├── payments/
│   ├── payments.module.ts
│   ├── payments.resolver.ts
│   └── payments.service.ts
├── reviews/
│   ├── reviews.module.ts
│   ├── reviews.resolver.ts
│   ├── reviews.service.ts
│   └── dto/create-review.input.ts
├── vouchers/
│   ├── vouchers.module.ts
│   ├── vouchers.resolver.ts
│   └── vouchers.service.ts
├── upload/
│   ├── upload.module.ts
│   └── upload.controller.ts
└── notifications/
    ├── notifications.module.ts
    └── notifications.service.ts
```

---

## 3. Prisma Schema

### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PAID
  FAILED
  REFUNDED
}

model User {
  id          String    @id @default(uuid())
  name        String
  email       String    @unique
  password    String
  role        Role      @default(BUYER)
  isVerified  Boolean   @default(false)
  isActive    Boolean   @default(true)
  avatarUrl   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  cart            Cart?
  orders          Order[]
  reviews         Review[]
  addresses       ShippingAddress[]
  products        Product[]
  notifications   Notification[]
}

model Category {
  id        String    @id @default(uuid())
  name      String    @unique
  slug      String    @unique
  iconUrl   String?
  createdAt DateTime  @default(now())
  products  Product[]
}

model Product {
  id            String    @id @default(uuid())
  name          String
  description   String
  price         Decimal   @db.Decimal(12, 2)
  stock         Int       @default(0)
  isActive      Boolean   @default(true)
  isApproved    Boolean   @default(false)
  avgRating     Float     @default(0)
  totalReviews  Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  seller        User      @relation(fields: [sellerId], references: [id])
  sellerId      String

  category      Category  @relation(fields: [categoryId], references: [id])
  categoryId    String

  images        ProductImage[]
  cartItems     CartItem[]
  orderItems    OrderItem[]
  reviews       Review[]
}

model ProductImage {
  id        String   @id @default(uuid())
  url       String
  isPrimary Boolean  @default(false)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
}

model Cart {
  id        String     @id @default(uuid())
  user      User       @relation(fields: [userId], references: [id])
  userId    String     @unique
  items     CartItem[]
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(uuid())
  quantity  Int
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  cartId    String
  product   Product @relation(fields: [productId], references: [id])
  productId String

  @@unique([cartId, productId])
}

model Order {
  id            String      @id @default(uuid())
  totalAmount   Decimal     @db.Decimal(12, 2)
  shippingCost  Decimal     @default(0) @db.Decimal(12, 2)
  status        OrderStatus @default(PENDING)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  buyer         User        @relation(fields: [buyerId], references: [id])
  buyerId       String

  address       ShippingAddress @relation(fields: [addressId], references: [id])
  addressId     String

  voucher       Voucher?    @relation(fields: [voucherId], references: [id])
  voucherId     String?

  items         OrderItem[]
  payment       Payment?
}

model OrderItem {
  id           String   @id @default(uuid())
  quantity     Int
  priceAtTime  Decimal  @db.Decimal(12, 2)

  order        Order    @relation(fields: [orderId], references: [id])
  orderId      String

  product      Product  @relation(fields: [productId], references: [id])
  productId    String
}

model Payment {
  id        String        @id @default(uuid())
  amount    Decimal       @db.Decimal(12, 2)
  method    String
  status    PaymentStatus @default(UNPAID)
  paidAt    DateTime?
  invoiceNo String        @unique @default(cuid())
  createdAt DateTime      @default(now())

  order     Order         @relation(fields: [orderId], references: [id])
  orderId   String        @unique
}

model Review {
  id        String   @id @default(uuid())
  rating    Int
  comment   String?
  isVisible Boolean  @default(true)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  userId    String

  product   Product  @relation(fields: [productId], references: [id])
  productId String

  @@unique([userId, productId])
}

model Voucher {
  id              String    @id @default(uuid())
  code            String    @unique
  discountPercent Int?
  discountAmount  Decimal?  @db.Decimal(12, 2)
  minPurchase     Decimal   @default(0) @db.Decimal(12, 2)
  maxUses         Int       @default(1)
  usedCount       Int       @default(0)
  expiresAt       DateTime?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())

  orders          Order[]
}

model ShippingAddress {
  id            String   @id @default(uuid())
  label         String
  recipientName String
  phone         String
  address       String
  city          String
  province      String
  postalCode    String
  isDefault     Boolean  @default(false)

  user          User     @relation(fields: [userId], references: [id])
  userId        String

  orders        Order[]
}

model Notification {
  id        String   @id @default(uuid())
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  userId    String
}
```

### Prisma Commands
```bash
npx prisma migrate dev --name init         # development
npx prisma migrate deploy                  # production (Railway)
npx prisma db seed                         # seed data
npx prisma studio                          # GUI browser
```

---

## 4. Bootstrap — `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Commerce Pelajar API')
    .setDescription('REST endpoints: Upload · Health · Webhook')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig))

  await app.listen(process.env.PORT ?? 3001)
  console.log(`Server running on port ${process.env.PORT ?? 3001}`)
}
bootstrap()
```

---

## 5. App Module — `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CategoriesModule } from './categories/categories.module'
import { ProductsModule } from './products/products.module'
import { CartModule } from './cart/cart.module'
import { OrdersModule } from './orders/orders.module'
import { PaymentsModule } from './payments/payments.module'
import { ReviewsModule } from './reviews/reviews.module'
import { VouchersModule } from './vouchers/vouchers.module'
import { UploadModule } from './upload/upload.module'
import { NotificationsModule } from './notifications/notifications.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }) => ({ req, res }),
      playground: process.env.NODE_ENV !== 'production',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    VouchersModule,
    UploadModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

---

## 6. Prisma Service

### `src/prisma/prisma.service.ts`
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect() }
  async onModuleDestroy() { await this.$disconnect() }
}
```

### `src/prisma/prisma.module.ts`
```typescript
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 7. Common — Enum, Guard, Decorator

### `src/common/enums/role.enum.ts`
```typescript
import { registerEnumType } from '@nestjs/graphql'
export enum Role { BUYER = 'BUYER', SELLER = 'SELLER', ADMIN = 'ADMIN' }
registerEnumType(Role, { name: 'Role' })
```

### `src/common/enums/order-status.enum.ts`
```typescript
import { registerEnumType } from '@nestjs/graphql'
export enum OrderStatus {
  PENDING = 'PENDING', PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED', DELIVERED = 'DELIVERED', CANCELLED = 'CANCELLED',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' })
```

### `src/common/decorators/current-user.decorator.ts`
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx)
    return gqlCtx.getContext().req.user
  },
)
```

### `src/common/decorators/roles.decorator.ts`
```typescript
import { SetMetadata } from '@nestjs/common'
import { Role } from '../enums/role.enum'
export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
```

### `src/common/guards/jwt-auth.guard.ts`
```typescript
import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
```

### `src/common/guards/roles.guard.ts`
```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { Role } from '../enums/role.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true
    const ctx = GqlExecutionContext.create(context)
    const user = ctx.getContext().req.user
    return requiredRoles.includes(user?.role)
  }
}
```

---

## 8. Auth Module

### `src/auth/jwt.strategy.ts`
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.isActive) throw new UnauthorizedException()
    return user
  }
}
```

### `src/auth/dto/login.input.ts`
```typescript
import { InputType, Field } from '@nestjs/graphql'
import { IsEmail, MinLength } from 'class-validator'

@InputType()
export class LoginInput {
  @Field() @IsEmail() email: string
  @Field() @MinLength(8) password: string
}
```

### `src/auth/dto/register.input.ts`
```typescript
import { InputType, Field } from '@nestjs/graphql'
import { IsEmail, MinLength, IsEnum } from 'class-validator'
import { Role } from '../../common/enums/role.enum'

@InputType()
export class RegisterInput {
  @Field() @MinLength(2) name: string
  @Field() @IsEmail() email: string
  @Field() @MinLength(8) password: string
  @Field(() => Role) @IsEnum([Role.BUYER, Role.SELLER]) role: Role
}
```

### `src/auth/auth.service.ts` — Method Signatures
```typescript
// register(input: RegisterInput): Promise<AuthPayload>
//   - cek email duplicate → ConflictException
//   - hash password bcrypt(password, 12)
//   - prisma.user.create
//   - jika SELLER: isVerified = false
//   - return { accessToken, user }

// login(input: LoginInput, res: Response): Promise<AuthPayload>
//   - cari user by email → NotFoundException
//   - bcrypt.compare → UnauthorizedException
//   - sign JWT { sub: user.id, email, role }
//   - set cookie: res.cookie('access_token', token, { httpOnly: true, secure: prod, sameSite: 'strict', maxAge: 7d })
//   - set cookie: res.cookie('user_role', user.role, { httpOnly: false, ... })
//   - return { accessToken, user }

// logout(res: Response): boolean
//   - res.clearCookie('access_token')
//   - res.clearCookie('user_role')
//   - return true
```

---

## 9. Products Module — Business Logic

### `src/products/dto/filter-product.input.ts`
```typescript
import { InputType, Field, Int, Float } from '@nestjs/graphql'
import { IsOptional, IsUUID, Min, Max } from 'class-validator'

@InputType()
export class FilterProductInput {
  @Field({ nullable: true }) @IsOptional() query?: string
  @Field({ nullable: true }) @IsOptional() @IsUUID() categoryId?: string
  @Field(() => Float, { nullable: true }) @IsOptional() @Min(0) minPrice?: number
  @Field(() => Float, { nullable: true }) @IsOptional() maxPrice?: number
  @Field(() => Int, { nullable: true }) @IsOptional() @Min(1) @Max(5) minRating?: number
  @Field({ nullable: true }) @IsOptional() sort?: 'latest' | 'cheapest' | 'popular' | 'rating'
  @Field(() => Int, { nullable: true }) @IsOptional() @Min(1) page?: number
  @Field(() => Int, { nullable: true }) @IsOptional() @Min(1) @Max(50) limit?: number
}
```

### `src/products/products.service.ts` — Method Signatures
```typescript
// findAll(filter: FilterProductInput): Promise<{ items: Product[], total, page, limit }>
//   where: { isActive: true, isApproved: true }
//   + jika query: { name: { contains: query, mode: 'insensitive' } }
//   + jika categoryId: { categoryId }
//   + jika minPrice/maxPrice: { price: { gte, lte } }
//   + jika minRating: { avgRating: { gte: minRating } }
//   orderBy berdasarkan sort: latest=createdAt desc, cheapest=price asc, popular=totalReviews desc, rating=avgRating desc
//   include: images, category, seller(name)
//   skip = (page-1) * limit, take = limit

// findOne(id: string): Promise<Product>
//   prisma.product.findUniqueOrThrow({ where: { id }, include: { images, category, seller, reviews... } })

// create(sellerId: string, input: CreateProductInput): Promise<Product>
//   pastikan user role=SELLER dan isVerified=true
//   prisma.product.create({ data: { ...input, sellerId, isApproved: false } })

// update(id: string, sellerId: string, input: UpdateProductInput): Promise<Product>
//   pastikan product.sellerId === sellerId (ownership check)
//   prisma.product.update

// remove(id: string, sellerId: string): Promise<boolean>
//   pastikan ownership
//   prisma.product.delete

// approve(id: string): Promise<Product>   ← admin only
// reject(id: string): Promise<Product>    ← admin only
```

---

## 10. Orders Module — Business Logic

### `src/orders/dto/create-order.input.ts`
```typescript
import { InputType, Field } from '@nestjs/graphql'
import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator'

@InputType()
export class CreateOrderInput {
  @Field() @IsUUID() addressId: string
  @Field() @IsEnum(['TRANSFER', 'EWALLET', 'COD']) paymentMethod: string
  @Field({ nullable: true }) @IsOptional() @IsString() voucherCode?: string
}
```

### `src/orders/orders.service.ts` — createOrder Logic (Wajib Urut)
```typescript
// createOrder(buyerId: string, input: CreateOrderInput): Promise<Order>
//
// STEP 1: Ambil cart + items
//   const cart = await prisma.cart.findUnique({
//     where: { userId: buyerId },
//     include: { items: { include: { product: true } } }
//   })
//   if (!cart || cart.items.length === 0) throw new BadRequestException('Keranjang kosong')
//
// STEP 2: Validasi stok semua item
//   for (const item of cart.items) {
//     if (item.product.stock < item.quantity)
//       throw new BadRequestException(`Stok ${item.product.name} tidak cukup`)
//   }
//
// STEP 3: Hitung subtotal
//   const subtotal = cart.items.reduce((sum, item) =>
//     sum + Number(item.product.price) * item.quantity, 0)
//
// STEP 4: Validasi & hitung diskon voucher
//   let discount = 0
//   if (input.voucherCode) {
//     const voucher = await prisma.voucher.findUnique({ where: { code: input.voucherCode } })
//     // validasi: isActive, usedCount < maxUses, expiresAt > now, subtotal >= minPurchase
//     if (voucher.discountPercent) discount = subtotal * voucher.discountPercent / 100
//     if (voucher.discountAmount) discount = Number(voucher.discountAmount)
//   }
//
// STEP 5: Total final
//   const shippingCost = 15000  // flat untuk MVP
//   const totalAmount = subtotal - discount + shippingCost
//
// STEP 6: Buat order dalam 1 transaction
//   await prisma.$transaction(async (tx) => {
//     const order = await tx.order.create({
//       data: {
//         buyerId, addressId: input.addressId, totalAmount, shippingCost,
//         voucherId: voucher?.id,
//         items: { create: cart.items.map(item => ({
//           productId: item.productId,
//           quantity: item.quantity,
//           priceAtTime: item.product.price,  // ← snapshot harga
//         })) },
//       },
//     })
//
//     // Kurangi stok tiap produk
//     for (const item of cart.items) {
//       await tx.product.update({
//         where: { id: item.productId },
//         data: { stock: { decrement: item.quantity } }
//       })
//     }
//
//     // Buat payment record
//     await tx.payment.create({
//       data: { orderId: order.id, amount: totalAmount, method: input.paymentMethod, status: 'UNPAID' }
//     })
//
//     // Increment voucher usedCount
//     if (voucher) await tx.voucher.update({
//       where: { id: voucher.id },
//       data: { usedCount: { increment: 1 } }
//     })
//
//     // Kosongkan cart
//     await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
//
//     return order
//   })
```

---

## 11. Reviews Module — Business Logic

### `src/reviews/reviews.service.ts` — createReview Validation
```typescript
// createReview(userId: string, input: { productId, rating, comment }): Promise<Review>
//
// STEP 1: Cek user pernah beli produk ini (status DELIVERED)
//   const purchased = await prisma.orderItem.findFirst({
//     where: {
//       productId: input.productId,
//       order: { buyerId: userId, status: 'DELIVERED' }
//     }
//   })
//   if (!purchased) throw new ForbiddenException('Hanya pembeli yang bisa memberi review')
//
// STEP 2: Cek belum pernah review
//   const existing = await prisma.review.findUnique({
//     where: { userId_productId: { userId, productId: input.productId } }
//   })
//   if (existing) throw new ConflictException('Kamu sudah memberi review')
//
// STEP 3: Buat review
//   const review = await prisma.review.create({ data: { ...input, userId } })
//
// STEP 4: Recalculate avgRating di product
//   const stats = await prisma.review.aggregate({
//     where: { productId: input.productId, isVisible: true },
//     _avg: { rating: true }, _count: true,
//   })
//   await prisma.product.update({
//     where: { id: input.productId },
//     data: { avgRating: stats._avg.rating ?? 0, totalReviews: stats._count }
//   })
```

---

## 12. Upload — REST Controller (Swagger)

### `src/upload/upload.controller.ts`
```typescript
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.UPLOAD_DIR ?? './uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, unique + extname(file.originalname))
      },
    }),
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Hanya file jpg, png, webp'), false)
      }
      cb(null, true)
    },
  }))
  @ApiConsumes('multipart/form-data')
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` }
  }
}
```

---

## 13. Health Check

```typescript
// Tambah endpoint GET /health di AppController (buat AppController baru)
// Response: { status: 'ok', timestamp: new Date().toISOString() }
// Digunakan Railway untuk health check
```

---

## 14. Urutan Implementasi (Build Order)

Ikuti urutan ini supaya tidak ada circular dependency:

```
1. PrismaModule + PrismaService
2. common/ (enums, decorators, guards)
3. AuthModule (jwt.strategy, auth.service, auth.resolver)
4. UsersModule
5. CategoriesModule
6. ProductsModule (depends: Users, Categories)
7. CartModule (depends: Products)
8. VouchersModule
9. OrdersModule (depends: Cart, Products, Vouchers, Users)
10. PaymentsModule (depends: Orders)
11. ReviewsModule (depends: Products, Orders)
12. UploadModule
13. NotificationsModule
```

---

## 15. Railway Deployment

### `railway.json` (root project)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/main.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### `package.json` — Scripts Wajib
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main.js",
    "start:dev": "nest start --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "prisma db seed",
    "release": "npm run build"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Environment Variables di Railway Dashboard
```
NODE_ENV=production
PORT=3000
DATABASE_URL=         ← auto dari Railway PostgreSQL service (copy dari Railway)
JWT_SECRET=           ← random string 32+ karakter
JWT_EXPIRES_IN=7d
CORS_ORIGIN=          ← URL frontend (Vercel URL)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
```

### Railway Setup Steps
```
1. railway login
2. railway init          ← buat project baru
3. railway add           ← tambah PostgreSQL service
4. railway variables set NODE_ENV=production JWT_SECRET=xxx ...
5. railway up            ← deploy (atau link ke GitHub repo + auto-deploy)
```

---

## 16. Seed Data — `prisma/seed.ts`

```typescript
import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@studentcommerce.id' },
    update: {},
    create: { name: 'Admin', email: 'admin@studentcommerce.id', password: hashedPassword, role: Role.ADMIN, isVerified: true },
  })

  // Seller demo
  const seller = await prisma.user.upsert({
    where: { email: 'toko@studentcommerce.id' },
    update: {},
    create: { name: 'Toko Demo', email: 'toko@studentcommerce.id', password: hashedPassword, role: Role.SELLER, isVerified: true },
  })

  // Buyer demo
  await prisma.user.upsert({
    where: { email: 'buyer@studentcommerce.id' },
    update: {},
    create: { name: 'Buyer Demo', email: 'buyer@studentcommerce.id', password: hashedPassword, role: Role.BUYER },
  })

  // Kategori
  const categories = [
    { name: 'Tugas & ATK', slug: 'tugas-atk' },
    { name: 'Kebutuhan Kos', slug: 'kebutuhan-kos' },
    { name: 'Praktikum', slug: 'praktikum' },
    { name: 'Event Kampus', slug: 'event-kampus' },
    { name: 'Daily Essentials', slug: 'daily-essentials' },
  ]
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug }, update: {}, create: cat,
    })
  }

  // Voucher contoh
  await prisma.voucher.upsert({
    where: { code: 'STUDENT10' },
    update: {},
    create: { code: 'STUDENT10', discountPercent: 10, minPurchase: 50000, maxUses: 100 },
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

---

## 17. Konvensi Wajib

| Item | Aturan |
|---|---|
| DTO | Selalu gunakan `class-validator` decorator |
| Guard | `@UseGuards(JwtAuthGuard)` untuk semua resolver yang butuh auth |
| Role check | `@Roles(Role.SELLER)` + `@UseGuards(JwtAuthGuard, RolesGuard)` |
| Prisma error | Wrap dalam try/catch, lempar `NotFoundException` / `ConflictException` |
| Decimal | Selalu `Number(decimal)` saat return dari Prisma ke GraphQL |
| Ownership | Selalu validasi `resource.ownerId === currentUser.id` sebelum mutasi |
| Transaction | Gunakan `prisma.$transaction` untuk operasi multi-tabel |
