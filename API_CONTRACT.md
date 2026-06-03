# 📡 API Contract: Seller Verification System

## Overview
Dokumentasi ini menjelaskan contract antara frontend dan backend untuk sistem verifikasi seller.

---

## 🔐 Authentication
Semua endpoint (kecuali register/login) memerlukan:
```
Authorization: Bearer <token>
```

---

## 📝 Endpoints

### 1. POST `/auth/register`
**Description:** Registrasi user baru (default BUYER)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "BUYER"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "BUYER",
    "avatarUrl": null,
    "isVerified": false,
    "sellerStatus": null,
    "shopName": null,
    "shopDescription": null,
    "shopLogo": null,
    "category": null
  }
}
```

---

### 2. POST `/users/become-seller`
**Description:** User (BUYER) mendaftar jadi seller

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "shopName": "Toko Buku Bilal",
  "shopDescription": "Menjual buku bekas dan alat tulis murah",
  "category": "Buku & Alat Tulis",
  "shopLogo": "https://example.com/uploads/logo.png"
}
```

**Response 200:**
```json
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "BUYER",
  "avatarUrl": null,
  "isVerified": false,
  "sellerStatus": "PENDING",
  "shopName": "Toko Buku Bilal",
  "shopDescription": "Menjual buku bekas dan alat tulis murah",
  "shopLogo": "https://example.com/uploads/logo.png",
  "category": "Buku & Alat Tulis"
}
```

**⚠️ PENTING:**
- `role` harus tetap `BUYER` (JANGAN ubah jadi SELLER)
- `sellerStatus` harus `PENDING`
- Simpan `shopName`, `shopDescription`, `shopLogo`, `category`

**Response 400 (Sudah Pending):**
```json
{
  "message": "Pendaftaran seller Anda masih dalam proses verifikasi"
}
```

**Response 400 (Sudah Seller):**
```json
{
  "message": "Anda sudah terdaftar sebagai seller"
}
```

---

### 3. GET `/users`
**Description:** Get all users (untuk admin)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response 200:**
```json
[
  {
    "id": "uuid-1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "BUYER",
    "sellerStatus": "PENDING",
    "shopName": "Toko Buku Bilal",
    "shopDescription": "Menjual buku bekas...",
    "shopLogo": "https://...",
    "category": "Buku & Alat Tulis",
    "isVerified": false
  },
  {
    "id": "uuid-2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "SELLER",
    "sellerStatus": "APPROVED",
    "shopName": "Toko Fashion Jane",
    "shopDescription": "Fashion murah...",
    "shopLogo": "https://...",
    "category": "Pakaian",
    "isVerified": true
  }
]
```

**Frontend Filter:**
Frontend akan filter user yang:
- `role === 'SELLER'` ATAU
- `sellerStatus === 'PENDING'` ATAU
- `sellerStatus === 'APPROVED'`

---

### 4. PATCH `/users/:id/verify-seller`
**Description:** Admin memverifikasi seller (approve)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**URL Params:**
- `id` (string, required): User ID yang akan diverifikasi

**Request Body:** (empty/optional)

**Response 200:**
```json
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "SELLER",
  "sellerStatus": "APPROVED",
  "shopName": "Toko Buku Bilal",
  "shopDescription": "Menjual buku bekas...",
  "shopLogo": "https://...",
  "category": "Buku & Alat Tulis",
  "isVerified": true
}
```

**⚠️ PENTING - Backend HARUS:**
1. Ubah `role` dari `BUYER` → `SELLER`
2. Ubah `sellerStatus` dari `PENDING` → `APPROVED`
3. Set `isVerified = true`
4. **Create notification** untuk user:
```javascript
await prisma.notification.create({
  data: {
    userId: userId,
    title: "🎉 Selamat! Akun Seller Anda Disetujui",
    message: "Akun seller Anda telah diverifikasi. Anda sekarang dapat mulai berjualan di StudentCommerce!",
    type: "SELLER_APPROVED",
    isRead: false
  }
})
```

**Response 400 (Not Pending):**
```json
{
  "message": "User tidak dalam status pending"
}
```

**Response 403 (Not Admin):**
```json
{
  "message": "Unauthorized: Admin only"
}
```

**Response 404:**
```json
{
  "message": "User tidak ditemukan"
}
```

---

### 5. GET `/notifications`
**Description:** Get semua notifikasi user

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "notif-uuid-1",
    "userId": "user-uuid",
    "title": "🎉 Selamat! Akun Seller Anda Disetujui",
    "message": "Akun seller Anda telah diverifikasi. Anda sekarang dapat mulai berjualan di StudentCommerce!",
    "type": "SELLER_APPROVED",
    "isRead": false,
    "createdAt": "2026-06-03T07:00:00.000Z"
  },
  {
    "id": "notif-uuid-2",
    "userId": "user-uuid",
    "title": "Pesanan Baru",
    "message": "Anda mendapat pesanan baru #12345",
    "type": "ORDER",
    "isRead": true,
    "createdAt": "2026-06-02T15:30:00.000Z"
  }
]
```

---

### 6. GET `/notifications/unread-count`
**Description:** Hitung jumlah notifikasi unread

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params (optional):**
- `type` (string): Filter by notification type (e.g., "CHAT", "SELLER_APPROVED")

**Response 200:**
```json
{
  "count": 5
}
```

---

### 7. POST `/notifications/:id/read`
**Description:** Mark notifikasi sebagai read

**Headers:**
```
Authorization: Bearer <token>
```

**URL Params:**
- `id` (string, required): Notification ID

**Response 200:**
```json
{
  "id": "notif-uuid",
  "userId": "user-uuid",
  "title": "🎉 Selamat! Akun Seller Anda Disetujui",
  "message": "...",
  "type": "SELLER_APPROVED",
  "isRead": true,
  "createdAt": "2026-06-03T07:00:00.000Z"
}
```

---

### 8. POST `/notifications/read-all`
**Description:** Mark semua notifikasi user sebagai read

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "All notifications marked as read"
}
```

---

## 🗂️ Database Schema (Prisma)

### User Model
```prisma
model User {
  id              String        @id @default(uuid())
  name            String
  email           String        @unique
  password        String
  role            Role          @default(BUYER)
  avatarUrl       String?
  isVerified      Boolean       @default(false)
  
  // Seller fields
  sellerStatus    SellerStatus?
  shopName        String?
  shopDescription String?
  shopLogo        String?
  category        String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  notifications   Notification[]
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

enum SellerStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Notification Model
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  message   String
  type      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🔄 State Flow

### User Status Progression:
```
Register
  ↓
role: BUYER
sellerStatus: null
  ↓
Become Seller (POST /become-seller)
  ↓
role: BUYER (tetap)
sellerStatus: PENDING
  ↓
Admin Verify (PATCH /verify-seller)
  ↓
role: SELLER (berubah)
sellerStatus: APPROVED
isVerified: true
+ Create Notification
```

---

## ✅ Validation Rules

### POST `/users/become-seller`:
- `shopName`: required, min 3 chars, max 100 chars
- `shopDescription`: required, min 10 chars, max 500 chars
- `category`: optional, string
- `shopLogo`: optional, valid URL
- User must be BUYER
- User sellerStatus must not be PENDING

### PATCH `/users/:id/verify-seller`:
- User must exist
- User sellerStatus must be PENDING
- Request user must be ADMIN

---

## 🧪 Test Cases

### Test 1: Register as Buyer
```bash
POST /auth/register
Body: { name, email, password, role: "BUYER" }
Expected: role = BUYER, sellerStatus = null
```

### Test 2: Become Seller
```bash
POST /users/become-seller
Body: { shopName, shopDescription, category, shopLogo }
Expected: role = BUYER, sellerStatus = PENDING
```

### Test 3: Admin Verify
```bash
PATCH /users/:id/verify-seller
Expected: role = SELLER, sellerStatus = APPROVED, notification created
```

### Test 4: Get Notifications
```bash
GET /notifications
Expected: Array with SELLER_APPROVED notification
```

---

## 🚨 Common Mistakes

❌ **JANGAN:**
- Langsung ubah role jadi SELLER di endpoint `/become-seller`
- Lupa create notification setelah verify
- Return response tanpa field baru (sellerStatus, shopName, dll)

✅ **HARUS:**
- Set sellerStatus = PENDING di `/become-seller`
- Ubah role + sellerStatus + create notif di `/verify-seller`
- Include semua field di response

---

## 📞 Support

Jika ada yang tidak jelas atau perlu diskusi API contract:
1. Check `BACKEND_VERIFICATION_GUIDE.md` untuk detail implementasi
2. Check `QUICK_SUMMARY.md` untuk overview
3. Hubungi frontend developer untuk koordinasi
