# 📋 Panduan Backend: Sistem Verifikasi Seller

## 🎯 Overview
Sistem verifikasi seller membutuhkan perubahan pada backend untuk mendukung:
1. Status PENDING untuk seller baru
2. Admin dapat memverifikasi seller
3. Notifikasi otomatis ke buyer setelah verifikasi

---

## 🔍 Analisis Masalah & Solusi

### ⚠️ MASALAH 1: User Model Tidak Memiliki Field Status Seller
**Problem:**
- Model User hanya memiliki field `isVerified` (boolean)
- Tidak ada cara untuk membedakan seller yang PENDING vs APPROVED vs REJECTED
- Field `role` langsung berubah jadi SELLER saat pendaftaran

**Solusi:**
Tambahkan field `sellerStatus` pada User model dengan nilai:
- `null` - untuk BUYER (bukan seller)
- `PENDING` - seller menunggu verifikasi
- `APPROVED` - seller sudah diverifikasi
- `REJECTED` - seller ditolak

---

### ⚠️ MASALAH 2: API `becomeSeller` Langsung Mengubah Role
**Problem:**
- Endpoint `/users/become-seller` langsung mengubah `role` menjadi SELLER
- Tidak ada status pending/menunggu

**Solusi:**
Ubah logika endpoint agar:
1. `role` tetap BUYER
2. Set `sellerStatus = PENDING`
3. Simpan data toko (shopName, shopDescription, shopLogo) di field terpisah

---

### ⚠️ MASALAH 3: Tidak Ada Endpoint untuk Admin Verifikasi Seller
**Problem:**
- Endpoint `PATCH /users/:id/verify` mungkin hanya mengubah `isVerified`
- Tidak mengubah role dari BUYER ke SELLER

**Solusi:**
Buat/update endpoint untuk verifikasi seller:
- Ubah `sellerStatus` dari PENDING ke APPROVED
- Ubah `role` dari BUYER ke SELLER
- Kirim notifikasi ke user

---

### ⚠️ MASALAH 4: Tidak Ada Notifikasi Otomatis Setelah Verifikasi
**Problem:**
- User tidak tahu kapan akun seller mereka diverifikasi

**Solusi:**
Implementasikan sistem notifikasi:
1. Setelah admin verifikasi, backend create notifikasi baru
2. Frontend polling/websocket untuk real-time notification
3. User klik notifikasi → role berubah di frontend

---

## 🛠️ Step-by-Step Implementation Guide

### STEP 1: Update Database Schema (Prisma)

**File:** `prisma/schema.prisma`

```prisma
model User {
  id              String        @id @default(uuid())
  name            String
  email           String        @unique
  password        String
  role            Role          @default(BUYER)
  avatarUrl       String?
  isVerified      Boolean       @default(false)
  
  // === TAMBAHKAN FIELD BERIKUT ===
  sellerStatus    SellerStatus? // null jika bukan seller
  shopName        String?
  shopDescription String?
  shopLogo        String?
  category        String?
  // ================================
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  products        Product[]
  orders          Order[]
  reviews         Review[]
  addresses       Address[]
  notifications   Notification[]
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

// === TAMBAHKAN ENUM BARU ===
enum SellerStatus {
  PENDING
  APPROVED
  REJECTED
}
// ===========================

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  message   String
  type      String?  // Tambahkan ini jika belum ada
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Command untuk apply perubahan:**
```bash
# 1. Buat migration
npx prisma migrate dev --name add_seller_verification_system

# 2. Generate Prisma Client
npx prisma generate

# 3. (Optional) Seed data jika perlu
npx prisma db seed
```

---

### STEP 2: Update User Controller - Become Seller Endpoint

**File:** `src/controllers/user.controller.ts` (atau sejenisnya)

**Ubah endpoint `/users/become-seller`:**

```typescript
// BEFORE (SALAH)
async becomeSeller(req: Request, res: Response) {
  const { shopName, shopDescription, category, shopLogo } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role: 'SELLER', // ❌ JANGAN langsung ubah role
      shopName,
      shopDescription,
      category,
      shopLogo,
    },
  });

  return res.json(user);
}

// AFTER (BENAR)
async becomeSeller(req: Request, res: Response) {
  const { shopName, shopDescription, category, shopLogo } = req.body;
  const userId = req.user.id;

  // Validasi user belum jadi seller
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  
  if (existingUser.sellerStatus === 'PENDING') {
    return res.status(400).json({ message: 'Pendaftaran seller Anda masih dalam proses verifikasi' });
  }
  
  if (existingUser.role === 'SELLER') {
    return res.status(400).json({ message: 'Anda sudah terdaftar sebagai seller' });
  }

  // Update user dengan status PENDING
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role: 'BUYER', // ✅ Tetap BUYER
      sellerStatus: 'PENDING', // ✅ Set status pending
      shopName,
      shopDescription,
      category,
      shopLogo,
    },
  });

  // ✅ (Optional) Kirim notifikasi ke semua admin
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'Pendaftaran Seller Baru',
        message: `${user.name} mendaftar sebagai seller dan menunggu verifikasi`,
        type: 'SELLER_REGISTRATION',
      },
    });
  }

  return res.json(user);
}
```

---

### STEP 3: Update/Create Admin Verify Seller Endpoint

**File:** `src/controllers/admin.controller.ts` atau `user.controller.ts`

**Endpoint:** `PATCH /users/:id/verify-seller` atau `PATCH /admin/sellers/:id/verify`

```typescript
async verifySeller(req: Request, res: Response) {
  const { id } = req.params; // User ID yang akan diverifikasi
  const adminId = req.user.id;

  // Cek apakah yang request adalah admin
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Unauthorized: Admin only' });
  }

  // Cek user yang akan diverifikasi
  const user = await prisma.user.findUnique({ where: { id } });
  
  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  if (user.sellerStatus !== 'PENDING') {
    return res.status(400).json({ message: 'User tidak dalam status pending' });
  }

  // ✅ Update status dan role
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role: 'SELLER', // Ubah role jadi SELLER
      sellerStatus: 'APPROVED', // Approve seller
      isVerified: true, // Set verified juga
    },
  });

  // ✅ Kirim notifikasi ke user
  await prisma.notification.create({
    data: {
      userId: id,
      title: '🎉 Selamat! Akun Seller Anda Disetujui',
      message: `Akun seller Anda telah diverifikasi. Anda sekarang dapat mulai berjualan di StudentCommerce!`,
      type: 'SELLER_APPROVED',
    },
  });

  return res.json(updatedUser);
}
```

**Daftarkan route:**
```typescript
// routes/admin.routes.ts atau routes/user.routes.ts
router.patch('/users/:id/verify-seller', authenticateToken, verifySeller);
// atau
router.patch('/admin/sellers/:id/verify', authenticateToken, verifySeller);
```

---

### STEP 4: Update Endpoint Get Sellers untuk Admin

**File:** `src/controllers/user.controller.ts`

```typescript
async getAllSellers(req: Request, res: Response) {
  // Ambil semua user yang pernah mendaftar jadi seller (termasuk pending)
  const sellers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'SELLER' },
        { sellerStatus: 'PENDING' },
        { sellerStatus: 'APPROVED' },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shopName: true,
      shopDescription: true,
      shopLogo: true,
      category: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.json(sellers);
}
```

---

### STEP 5: Update Notification Endpoint

**File:** `src/controllers/notification.controller.ts`

Pastikan endpoint sudah mendukung:

```typescript
// GET /notifications - Ambil semua notifikasi user
async getNotifications(req: Request, res: Response) {
  const userId = req.user.id;
  
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  
  return res.json(notifications);
}

// GET /notifications/unread-count - Hitung unread
async getUnreadCount(req: Request, res: Response) {
  const userId = req.user.id;
  const { type } = req.query;
  
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
      ...(type ? { type: String(type) } : {}),
    },
  });
  
  return res.json({ count });
}

// POST /notifications/:id/read - Mark as read
async markAsRead(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user.id;
  
  const notification = await prisma.notification.update({
    where: { id, userId }, // Pastikan user cuma bisa mark notif sendiri
    data: { isRead: true },
  });
  
  return res.json(notification);
}

// POST /notifications/read-all - Mark all as read
async markAllAsRead(req: Request, res: Response) {
  const userId = req.user.id;
  
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  
  return res.json({ message: 'All notifications marked as read' });
}
```

---

## 🧪 Testing Guide

### Test 1: User Register sebagai Buyer
```bash
POST http://localhost:YOUR_PORT/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@mail.com",
  "password": "test123",
  "role": "BUYER"
}

# Expected: User created dengan role=BUYER, sellerStatus=null
```

### Test 2: Buyer Mendaftar Jadi Seller
```bash
POST http://localhost:YOUR_PORT/users/become-seller
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "shopName": "Toko Test",
  "shopDescription": "Ini toko testing",
  "category": "Jasa",
  "shopLogo": "https://example.com/logo.png"
}

# Expected: 
# - role masih BUYER
# - sellerStatus = PENDING
# - shopName, shopDescription tersimpan
```

### Test 3: Admin Lihat Daftar Seller Pending
```bash
GET http://localhost:YOUR_PORT/users?role=SELLER
Authorization: Bearer ADMIN_TOKEN

# Expected: Dapat list user dengan sellerStatus = PENDING
```

### Test 4: Admin Verifikasi Seller
```bash
PATCH http://localhost:YOUR_PORT/users/USER_ID/verify-seller
Authorization: Bearer ADMIN_TOKEN

# Expected:
# - User role berubah BUYER → SELLER
# - sellerStatus = APPROVED
# - Notifikasi dibuat untuk user
```

### Test 5: User Check Notification
```bash
GET http://localhost:YOUR_PORT/notifications
Authorization: Bearer USER_TOKEN

# Expected: Ada notifikasi "Akun seller Anda disetujui"
```

---

## 📝 Checklist untuk Backend Developer

```
[ ] 1. Update schema.prisma dengan field sellerStatus, shopName, shopDescription, shopLogo
[ ] 2. Run migration: npx prisma migrate dev --name add_seller_verification
[ ] 3. Update endpoint POST /users/become-seller - set sellerStatus=PENDING, role tetap BUYER
[ ] 4. Create/update endpoint PATCH /users/:id/verify-seller untuk admin
[ ] 5. Endpoint verify harus: ubah role ke SELLER, set sellerStatus=APPROVED, create notification
[ ] 6. Update GET /users untuk filter seller dengan status PENDING
[ ] 7. Test semua endpoint dengan Postman/Thunder Client
[ ] 8. Commit dan push ke repository
```

---

## 🚨 Catatan Penting

1. **Jangan lupa backup database** sebelum run migration
2. **Testing di local dulu** sebelum deploy ke production
3. **Koordinasi dengan frontend** untuk memastikan response API sesuai
4. **Security**: Pastikan endpoint verify hanya bisa diakses ADMIN
5. **Validation**: Tambahkan validasi di setiap endpoint (cek empty string, dll)

---

## 📞 Troubleshooting

### Error: "Field sellerStatus does not exist"
**Solusi:** Run `npx prisma generate` setelah migrate

### Error: "Unique constraint failed on email"
**Solusi:** User sudah ada, gunakan email berbeda untuk testing

### Notifikasi tidak muncul di frontend
**Solusi:** 
1. Cek apakah notifikasi tercipta di database
2. Cek endpoint GET /notifications work
3. Cek frontend polling/refresh

### Role tidak berubah setelah verifikasi
**Solusi:** Pastikan endpoint verify mengupdate field `role` dan `sellerStatus`

---

## ✅ Summary

Frontend sudah siap dengan:
- ✅ Register page tanpa role selector (default BUYER)
- ✅ Seller register page dengan popup pending
- ✅ Admin page untuk verifikasi
- ✅ Notification system

Backend perlu implementasi:
- ⚠️ Database schema update (sellerStatus field)
- ⚠️ Endpoint /become-seller (set PENDING, bukan langsung SELLER)
- ⚠️ Endpoint /verify-seller (approve & kirim notifikasi)
- ⚠️ Notification creation saat verifikasi

**Estimated time:** 2-4 jam untuk backend implementation + testing
