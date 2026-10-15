# Sistem Inspeksi Kendaraan Digital (AV1/AVIF Compression)

API untuk sistem manajemen inspeksi kendaraan digital yang dirancang untuk meningkatkan efisiensi, akurasi, dan dokumentasi dalam proses pemeriksaan armada.

Fitur unggulan dari sistem ini adalah penggunaan kompresi citra dengan format **AVIF** (berbasis codec AV1) untuk menghemat ruang penyimpanan server dan mempercepat waktu unggah bukti foto dari perangkat mobile petugas di lapangan.

## Alur Kerja Sistem (Workflow)

1.  **Penerbitan Work Order (WO)**
    -   **Aktor:** Customer Service (CS)
    -   **Proses:** CS menerbitkan WO untuk kendaraan yang akan bertugas. Sistem secara otomatis menghasilkan QR Code unik untuk setiap WO dan memberikan notifikasi kepada driver.

2.  **Eksekusi Work Order**
    -   **Aktor:** Driver
    -   **Proses:** Driver menerima dan menjalankan tugas sesuai informasi yang tertera pada WO melalui aplikasi.

3.  **Proses Inspeksi Kendaraan**
    -   **Aktor:** Petugas Checker
    -   **Proses:**
        -   Setelah driver kembali ke garasi, Checker memulai sesi inspeksi dengan memindai (scan) QR Code pada WO.
        -   Checker melakukan pemeriksaan pada setiap bagian kendaraan yang telah ditentukan dalam sistem (contoh: ban, mesin, lampu, body, interior).
        -   Untuk setiap bagian yang dicek, Checker wajib melampirkan foto kondisi aktual. Foto ini akan diunggah dan dikompresi secara otomatis oleh server dari format JPEG/PNG ke format **AVIF**.

4.  **Review & Pengambilan Keputusan**
    -   **Aktor:** Pengurus Armada (Fleet Manager)
    -   **Proses:** Hasil inspeksi (termasuk catatan dan foto terkompresi) menjadi bahan acuan bagi Pengurus Armada untuk mengambil keputusan, seperti menjadwalkan perbaikan, memesan suku cadang, atau memberikan approval bahwa kendaraan laik jalan.

5.  **Reporting & Dashboard**
    -   **Aktor:** Customer Service & Fleet Manager
    -   **Proses:** Sistem menyediakan endpoint statistik ringkas untuk menghitung metrik Work Order secara _real-time_ tanpa membebani _frontend_. Selain itu, tersedia fitur pembuatan Surat Rekomendasi Pergantian Suku Cadang yang bisa dicetak dalam format PDF.

## Aktor Sistem (User Roles)

-   **Customer Service:** Menerbitkan dan mengelola Work Order.
-   **Driver:** Menerima dan menjalankan Work Order.
-   **Checker:** Melakukan inspeksi kendaraan dan mengunggah bukti foto.
-   **Pengurus Armada (Fleet Manager):** Mereview hasil inspeksi dan memberikan approval atau tindak lanjut.
-   **Admin:** Mengelola data master (kendaraan, user, part inspeksi).

## Teknologi yang Digunakan

-   **Backend:** Node.js, Express.js
-   **Database:** MySQL
-   **Image Processing:** `sharp` (untuk kompresi ke AVIF)
-   **QR Code Generation:** `qrcode`
-   **Authentication:** JWT (JSON Web Tokens) & `bcryptjs`

## Endpoint Khusus Demo Akademik (Skripsi)
Sistem ini dilengkapi rute khusus `/api/demo` untuk mendemonstrasikan kapabilitas algoritma secara langsung (misal di depan penguji):
-   **Simulasi Matematis (6 Langkah):** Membedah proses Transform Coding (DCT) dan Kuantisasi pada skala blok 8x8 piksel menggunakan nilai matriks referensi nyata.
-   **Simulasi Kompresi Gambar:** Menunjukkan perbandingan ukuran file, waktu pemrosesan, rasio kompresi, serta simulasi retensi kualitas antara file mentah dengan hasil format `.avif`.

## Instalasi & Setup

1.  Clone repository ini:
    ```bash
    git clone <url_repository>
    ```
2.  Masuk ke direktori proyek:
    ```bash
    cd avif-api
    ```
3.  Install semua package yang dibutuhkan:
    ```bash
    npm install
    ```
4.  Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasinya (kredensial database, JWT secret, port).
5.  Jalankan server:
    ```bash
    npm start
    ```

## Struktur Database (Rancangan)

Berikut adalah rancangan tabel database MySQL untuk mendukung operasional sistem:

### 1. `users` (Master Data Pengguna)
Menggabungkan semua aktor dalam sistem. Peran dibedakan menggunakan kolom `role`.
- id (Primary Key)
- nama_lengkap
- username
- password
- role (admin, cs, driver, checker, fleet_manager)
- created_at
- is_active

### 2. `vehicles` (Master Data Kendaraan)
Menyimpan data semua armada kendaraan.
- id (Primary Key)
- plat_nomor
- merk
- model
- tahun
- jenis_kendaraan
- created_at

### 3. `inspection_parts` (Master Data Komponen Inspeksi)
Menyimpan daftar semua komponen/item yang wajib diperiksa (checklist standar).
- id (Primary Key)
- nama_part
- deskripsi
- is_active

### 4. `work_orders` (Data Transaksi Work Order)
Tabel utama yang mencatat setiap perintah kerja untuk driver.
- id (Primary Key, UUID)
- nomor_wo
- vehicle_id
- driver_id
- cs_id (ID pembuat WO)
- titik_muat
- titik_bongkar
- jenis_muatan
- kuantitas_muatan
- status (baru, dikerjakan, selesai, diinspeksi)
- qr_code_url
- tanggal_wo
- created_at

### 5. `wo_instructions` (Data Pesan/Instruksi Work Order)
Menyimpan daftar pesan atau instruksi dari CS kepada Driver (Bisa lebih dari 1 pesan per WO).
- id (Primary Key)
- work_order_id (Relasi ke work_orders)
- pesan
- created_at

### 6. `inspections` (Data Sesi Inspeksi - Header)
Mencatat setiap sesi inspeksi yang dilakukan oleh Checker ketika driver kembali.
- id (Primary Key, UUID)
- work_order_id
- checker_id
- tanggal_inspeksi
- catatan_umum

### 7. `inspection_details` (Detail Hasil Inspeksi per Komponen)
Menyimpan hasil pengecekan setiap komponen. Di sinilah file foto (AVIF) disimpan.
- id (Primary Key)
- inspection_id
- part_id
- kondisi (baik, perlu_perhatian, rusak_segera_ganti)
- catatan
- path_foto_avif

### 8. `maintenance_actions` (Tindak Lanjut)
Tabel untuk mencatat keputusan Fleet Manager (approval) dari temuan inspeksi.
- id (Primary Key)
- inspection_detail_id
- manager_id (Fleet Manager yang merespons)
- status_tindakan (menunggu_approval, Lunas, ditolak, selesai_dikerjakan)
- catatan_manager
- tanggal_approval
- tanggal_selesai_dikerjakan

### 9. `part_replacement_letters` (Surat Rekomendasi Pergantian)
Menyimpan data surat rekomendasi pergantian sparepart yang dibuat oleh Fleet Manager berdasarkan hasil inspeksi.
- id (Primary Key, UUID)
- nomor_surat
- inspection_id (Relasi ke inspections)
- manager_id (Pembuat surat)
- catatan
- tanggal_surat
- status (diajukan, Lunas, selesai)