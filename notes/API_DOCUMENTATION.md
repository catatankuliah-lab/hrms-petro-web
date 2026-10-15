# API Documentation - Sistem Inspeksi Kendaraan Digital

Dokumentasi ini merangkum semua endpoint yang tersedia pada API Sistem Inspeksi Kendaraan.

- **Base URL:** `https://apiops.petrolum.cloud` (atau sesuai konfigurasi `.env`)
- **Autentikasi:** Semua endpoint (kecuali `/api/auth/login`) membutuhkan `Authorization: Bearer <token>` pada header. Token didapat dari endpoint login.

---

## 1. Auth (`/api/auth`)
- **`POST /login`**
  - **Deskripsi:** Login untuk semua peran pengguna.
  - **Body:** `{ "username": "...", "password": "..." }`

---

## 2. Users (`/api/users`)
- **`GET /`**
  - **Deskripsi:** Melihat daftar semua user (mendukung query `page`, `limit`, `search`).
  - **Role:** `cs` (Sesuai konfigurasi saat ini)
- **`GET /:id`**
  - **Deskripsi:** Melihat detail user berdasarkan ID.
  - **Role:** `cs`
- **`POST /`**
  - **Deskripsi:** Membuat user baru.
  - **Body:** `{ "nama_lengkap": "...", "username": "...", "password": "...", "role": "..." }`
- **`DELETE /:id`**
  - **Deskripsi:** Menonaktifkan user (Soft Delete).

---

## 3. Vehicles (`/api/vehicles`)
- **`GET /`**
  - **Deskripsi:** Melihat semua armada kendaraan (mendukung query `page`, `limit`, `search`).
  - **Role:** Semua user yang login.
- **`POST /`**
  - **Deskripsi:** Menambah data kendaraan baru.
  - **Role:** `cs`
  - **Body:** `{ "plat_nomor": "...", "merk": "...", "model": "...", "tahun": 2021, "jenis_kendaraan": "..." }`
- **`PUT /:id`** & **`DELETE /:id`**
  - **Deskripsi:** Mengubah dan menghapus data kendaraan.

---

## 4. Inspection Parts (`/api/inspection-parts`)
- **`GET /`**
  - **Deskripsi:** Melihat semua komponen yang wajib diinspeksi.
  - **Role:** Semua user yang login.
- **`POST /`**
  - **Deskripsi:** Menambah komponen master inspeksi baru.
  - **Role:** `cs`
  - **Body:** `{ "nama_part": "...", "deskripsi": "...", "is_active": true }`

---

## 5. Work Orders (`/api/work-orders`)
- **`GET /`**
  - **Deskripsi:** Melihat semua Work Order.
  - **Role:** Semua user yang login.
- **`GET /stats`**
  - **Deskripsi:** Mengambil statistik jumlah Work Order berdasarkan status (baru, dikerjakan, selesai/diinspeksi) untuk Card Dashboard.
  - **Role:** Semua user yang login.
- **`GET /:id`**
  - **Deskripsi:** Melihat detail spesifik satu Work Order beserta data driver dan kendaraan.
- **`PUT /:id/status`**
  - **Deskripsi:** Mengubah status Work Order (baru, dikerjakan, selesai, diinspeksi).
- **`POST /`**
  - **Deskripsi:** Menerbitkan Work Order baru (otomatis men-generate QR Code).
  - **Role:** `cs`, `admin`
  - **Body:** `{ "nomor_wo": "...", "vehicle_id": 1, "driver_id": 2, "titik_muat": "...", "titik_bongkar": "...", "jenis_muatan": "...", "kuantitas_muatan": "...", "tanggal_wo": "YYYY-MM-DD" }`

---

## 6. WO Instructions (`/api/wo-instructions`)
- **`GET /wo/:woId`**
  - **Deskripsi:** Melihat semua instruksi untuk satu Work Order tertentu.
  - **Role:** Semua user yang login.
- **`POST /`**
  - **Deskripsi:** Menambah pesan/instruksi baru ke sebuah WO.
  - **Role:** `cs`, `admin`
  - **Body:** `{ "work_order_id": "...", "pesan": "..." }`

---

## 7. Inspections (AVIF Core) (`/api/inspections`)
- **`POST /`**
  - **Deskripsi:** Memulai sesi inspeksi baru (Header).
  - **Role:** `checker`
  - **Body:** `{ "work_order_id": "...", "catatan_umum": "..." }`
- **`POST /:inspectionId/details`**
  - **Deskripsi:** Mengunggah foto & pengecekan part. Foto otomatis dikompresi ke **AVIF** dan disimpan secara dinamis (`/uploads/inspeksi/YYYY-MM-DD/NOPOL/`).
  - **Role:** `checker`
  - **Content-Type:** `multipart/form-data`
  - **Body:** `part_id`, `kondisi` (baik, perlu_perhatian, rusak_segera_ganti), `catatan`, `foto_part` (File Gambar)
- **`GET /:id`**
  - **Deskripsi:** Melihat rapor lengkap hasil inspeksi beserta foto AVIF-nya.

---

## 8. Maintenance Actions (`/api/maintenance-actions`)
- **`POST /`**
  - **Deskripsi:** Memberikan persetujuan/tindak lanjut untuk part yang rusak.
  - **Role:** `fleet_manager`, `admin`
  - **Body:** `{ "inspection_detail_id": 1, "status_tindakan": "Lunas", "catatan_manager": "..." }`
- **`PUT /:id/status`**
  - **Deskripsi:** Mengubah status tindak lanjut (misal: menjadi `selesai_dikerjakan`).

---

## 9. Replacement Letters (`/api/replacement-letters`)
- **`GET /`**
  - **Deskripsi:** Melihat daftar semua surat rekomendasi pergantian suku cadang.
  - **Role:** Semua user yang login.
- **`GET /:id`**
  - **Deskripsi:** Melihat detail satu surat rekomendasi beserta relasi data Work Order, Inspeksi, dan daftar detail suku cadang (parts) yang harus diganti.
  - **Role:** Semua user yang login.
- **`POST /`**
  - **Deskripsi:** Membuat surat rekomendasi pergantian suku cadang dari sesi inspeksi.
  - **Role:** `fleet_manager`, `admin`
  - **Body:** `{ "nomor_surat": "...", "inspection_id": "...", "catatan": "..." }`

---

## 10. Demo Skripsi (`/api/demo`)
- **`POST /av1`**
  - **Deskripsi:** Menjalankan simulasi matematis konsep kompresi AV1 (DCT & Kuantisasi) pada citra blok 8x8. Berguna untuk mendemonstrasikan algoritma saat sidang skripsi.
  - **Body (Opsional):** `{ "quality": 50 }`
- **`POST /compress-av1`**
  - **Deskripsi:** Endpoint demo untuk mensimulasikan kompresi gambar nyata ke format `.avif`.
  - **Content-Type:** `multipart/form-data`
  - **Body:** `image` (File Gambar)
  - **Response:** Mengembalikan metrik kompresi nyata (ukuran asli, terkompresi, rasio) dan metrik simulasi (PSNR, SSIM, waktu proses).