## **Konsep proyek**

**Nama konsep: E-COMMERCE KHUSUS PELAJAR DAN MAHASISWA.**  
**Ide utama: platform belanja yang menjawab kebutuhan akademik, lifestyle kampus, dan kebutuhan harian pelajar secara cepat, murah, dan relevan.**

**Konsep ini kuat karena pasar pelajar/mahasiswa punya karakter yang jelas: sensitif harga, suka hal praktis, dekat dengan tren digital, dan cepat menerima inovasi. Karena itu, platform tidak perlu meniru marketplace besar secara penuh, tetapi cukup unggul di kurasi produk, kemudahan pencarian, harga ramah kantong, dan pengalaman mobile-first .**

## **Target audience**

**Target utama:**

* **Pelajar SMA/SMK.**  
* **Mahasiswa aktif.**  
* **Gen Z yang aktif menggunakan smartphone.**  
* **Pengguna yang suka inovasi, promo, dan pengalaman digital yang simpel.**  
* **Seller kecil, toko alat tulis, merchandise kampus, thrift, snack, print service, dan produk kebutuhan harian mahasiswa.**

**Karakter audience ini cocok dengan e-commerce yang cepat, visual, dan tidak rumit. Mereka biasanya lebih responsif terhadap UI yang modern, gamification, cashback, komunitas, dan fitur rekomendasi berbasis kebutuhan kuliah atau sekolah.**

## **Value project**

**Value project harus menjawab pertanyaan: kenapa user harus memilih platform ini, bukan marketplace besar?**

## **Value utama**

* **Spesifik untuk pelajar/mahasiswa. Produk yang ditampilkan relevan dengan kebutuhan mereka.**  
* **Harga ramah kantong. Bisa pakai fitur budget filter, bundling hemat, dan promo student-only.**  
* **Kurasi produk. Tidak terlalu banyak distraksi, user langsung menemukan kebutuhan kampus/sekolah.**  
* **Fokus local seller dan UMKM. Bisa jadi nilai sosial sekaligus bisnis.**  
* **Mobile-first dan cepat. Cocok untuk pengguna Gen Z yang terbiasa belanja lewat HP.**  
* **Inovatif. Bisa ditambah fitur AI recommendation, checklist kebutuhan semester, atau wishlist berbasis keperluan kuliah.**

**Kalau dijadikan positioning, kalimat yang kuat adalah:**  
**“Platform e-commerce paling relevan untuk kebutuhan pelajar dan mahasiswa, cepat, hemat, dan terkurasi.”**

## **Analisis peluang**

**E-commerce terus tumbuh dan belanja mobile menjadi kebiasaan utama. Statista menekankan bahwa smartphone menyumbang hampir 80% kunjungan retail global dan marketplace besar masih mendominasi pencarian serta transaksi online . Shopify juga menunjukkan e-commerce terus meningkat secara global dan kini menjadi bagian besar dari total retail sales dunia. Artinya, proyek Anda berada di pasar yang sudah valid, tetapi perlu diferensiasi agar tidak kalah oleh marketplace umum.**

## **Fitur utama**

**Berikut fitur yang sebaiknya ada dan cocok untuk MVP maupun pengembangan lanjutan.**

## **Fitur user**

* **Register, login, logout.**  
* **Profil pengguna.**  
* **Alamat pengiriman.**  
* **Wishlist.**  
* **Keranjang belanja.**  
* **Checkout.**  
* **Riwayat pesanan.**

## **Fitur produk**

* **Kategori produk.**  
* **Pencarian.**  
* **Filter harga, kategori, rating, dan kebutuhan.**  
* **Detail produk.**  
* **Stok produk.**  
* **Rating dan review.**  
* **Produk rekomendasi.**

## **Fitur transaksi**

* **Payment method.**  
* **Invoice otomatis.**  
* **Ongkir estimasi.**  
* **Status pembayaran.**

## **Fitur seller**

* **CRUD produk.**  
* **CRUD stok.**  
* **CRUD kategori produk milik seller.**  
* **Lihat pesanan masuk.**  
* **Update status pesanan.**  
* **Laporan penjualan sederhana.**

## **Fitur admin**

* **CRUD user.**  
* **Verifikasi seller.**  
* **Moderasi produk.**  
* **Moderasi review.**  
* **Statistik penjualan.**  
* **Dashboard analitik.**

## **CRUD yang wajib**

**Kalau Anda ingin proyek ini terlihat lengkap secara teknis, CRUD inti yang harus ada adalah:**

* **User CRUD: admin mengelola user.**  
* **Product CRUD: seller menambah, mengubah, menghapus produk.**  
* **Category CRUD: admin mengelola kategori.**  
* **Cart CRUD: tambah, ubah quantity, hapus item.**  
* **Order CRUD: status pesanan diubah sesuai proses transaksi.**  
* **Review CRUD: user membuat, edit, hapus review.**  
* **Promotion CRUD: admin/seller mengelola voucher atau promo.**

## 

## 

## **Strategi pengembangan MVP**

**Saya sarankan MVP jangan terlalu besar. Fokus pada hal yang paling dipakai.**

## **MVP prioritas**

1. **Login/register.**  
2. **Home katalog produk.**  
3. **Search dan filter.**  
4. **Detail produk.**  
5. **Keranjang.**  
6. **Checkout.**  
7. **Riwayat pesanan.**  
8. **Dashboard seller.**  
9. **Dashboard admin sederhana.**

## **Fitur lanjutan**

* **AI rekomendasi produk.**  
* **Chat seller.**  
* **Notifikasi pembayaran dan status pesanan.**  
* **Voucher student-only.**  
* **Bundling paket kebutuhan semester.**  
* **Gamifikasi point/reward.**

## **Strategi target audience**

**Karena target Anda Gen Z dan pelajar/mahasiswa yang “gila inovasi”, maka pendekatannya harus seperti ini:**

* **UI modern, clean, dan mobile-first.**  
* **Warna coklat muda yang sangat pucat atau krem susu tapi tetap profesional. Beri kesan fun, elegant, hangat di mata user, modern yang membuat pupil mata user membesar karena desainnya.**  
* **Copywriting santai dan dekat dengan bahasa anak muda.**  
* **Produk dibungkus dalam kategori kebutuhan nyata: tugas, kos, organisasi, praktikum, event kampus, dan daily essentials.**

**Strategi ini membuat aplikasi terasa dibuat khusus untuk mereka, bukan sekadar marketplace umum yang kebetulan menjual barang sekolah.**

## 

## **Database inti**

**Untuk MVP, struktur database bisa dibuat seperti ini:**

## **Tabel utama**

* **users**  
* **roles**  
* **categories**  
* **products**  
* **product\_images**  
* **carts**  
* **cart\_items**  
* **orders**  
* **order\_items**  
* **payments**  
* **reviews**  
* **vouchers**  
* **shipping\_addresses**  
* **notifications**

## **Relasi penting**

* **users punya role.**  
* **users bisa punya carts, orders, reviews.**  
* **products milik seller.**  
* **products masuk ke categories.**  
* **orders punya order\_items dan payments.**  
* **orders terhubung ke shipping\_addresses.**

## **Flow user**

## **Flow pembeli**

1. **User buka landing page.**  
2. **User memilih kategori kebutuhan.**  
3. **User mencari atau filter produk.**  
4. **User membuka detail produk.**  
5. **User menambah ke cart.**  
6. **User checkout.**  
7. **User pilih alamat dan pembayaran.**  
8. **User pantau status pesanan.**

## **Flow seller**

1. **Seller login.**  
2. **Seller masuk dashboard.**  
3. **Seller tambah/edit/hapus produk.**  
4. **Seller melihat order masuk.**  
5. **Seller update status pesanan.**

## **Flow admin**

1. **Admin login.**  
2. **Admin verifikasi seller.**  
3. **Admin moderasi produk dan review.**  
4. **Admin melihat dashboard analitik.**  
5. **Admin memantau transaksi.**

## **Strategi bisnis**

**Dari sisi bisnis, model ini bisa dikembangkan dengan:**

* **Komisi transaksi.**  
* **Fee seller premium.**  
* **Iklan produk unggulan.**  
* **Voucher sponsor.**  
* **Paket langganan seller.**  
* **Kerja sama dengan UMKM sekitar sekolah/kampus.**

**Strategi ini bagus karena target audience punya volume transaksi kecil tapi sering, jadi monetisasi bisa berjalan dari frekuensi dan repeat order.**

**Bahasa yang digunakan untuk frontend adalah [next.js](http://next.js) dan di dalamnya hanya ada file yang jenisnya page.tsx, layout.tsx, folder lib, navbar, card, dll, dan hanya yang bentuk tsx.**

**Bahasa yang digunakan untuk backend adalah [nest.js](http://nest.js). Database PostgreSQL. Library menggunakan prisma. API menggunakan GraphQL. Untuk testing fitur menggunakan swagger.**