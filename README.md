# ⚡ TaskFlow — Modern Workspace & Task Management App

TaskFlow adalah aplikasi manajemen tugas dan workspace modern dengan antarmuka elegan, Kanban board real-time, block notes (Notion-style), autentikasi tim, sistem notifikasi email SMTP, dan konfigurasi Docker production-ready untuk VPS (Coolify / Docker Compose).

---

## 🔒 1. Panduan Push ke GitHub (Aman & Bebas Leak)

Repository ini telah dikonfigurasi dengan [`.gitignore`](.gitignore) dan [`.dockerignore`](.dockerignore) untuk memastikan **file rahasia (.env, .env.local, password, dokumen office)** tidak akan ter-push ke GitHub.

### Langkah-langkah Push ke GitHub:

```bash
# 1. Inisialisasi Git (jika belum)
git init

# 2. Tambahkan semua file yang aman (file .env & dokumen otomatis diabaikan)
git add .

# 3. Buat commit pertama
git commit -m "feat: initial commit with secured docker and coolify configuration"

# 4. Ubah branch utama ke main
git branch -M main

# 5. Hubungkan ke repository GitHub Anda
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git

# 6. Push ke GitHub
git push -u origin main
```

---

## 🚀 2. Panduan Deploy di Coolify (VPS Hostinger)

Coolify mempermudah deploy langsung dari GitHub dengan SSL (HTTPS) otomatis dan manajemen environment variable via dashboard web.

### Langkah A: Tambahkan Project di Coolify
1. Buka dashboard **Coolify** Anda di VPS Hostinger.
2. Klik **+ Add Resource** ➔ Pilih **GitHub App / Public Repository** (atau **Docker Compose**).
3. Masukkan URL repository GitHub Anda dan pilih branch `main`.

### Langkah B: Input Environment Variables di Coolify
Buka tab **Environment Variables** di resource Coolify Anda, lalu masukkan variabel berikut:

```env
# Database Credentials
DATABASE_URL=mysql://taskflow_user:GANTI_DENGAN_PASSWORD_DATABASE_AMAN@mysql:3306/taskflow_db
MYSQL_ROOT_PASSWORD=GANTI_DENGAN_ROOT_PASSWORD_SANGAT_RAHASIA
MYSQL_DATABASE=taskflow_db
MYSQL_USER=taskflow_user
MYSQL_PASSWORD=GANTI_DENGAN_PASSWORD_DATABASE_AMAN

# Application Settings
NODE_ENV=production
PORT=3000

# SMTP Email Configuration (Opsional / Disarankan)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=email_anda@gmail.com
SMTP_PASS=password_aplikasi_gmail_16_karakter
SMTP_FROM="TaskFlow Workspace <email_anda@gmail.com>"
```

> 💡 **Tips Coolify:**
> - Jika Anda menggunakan database MySQL internal bawaan Coolify, cukup isi `DATABASE_URL` dengan string koneksi database yang diberikan Coolify.
> - Jika deploy menggunakan `docker-compose.yml`, Coolify otomatis menjalankan service `taskflow`, `mysql`, dan `phpmyadmin`.

### Langkah C: Deploy & Konfigurasi Domain
1. Di menu **Domains**, masukkan domain atau subdomain Anda (contoh: `tasks.domainanda.com`).
2. Klik tombol **Deploy** di Coolify.
3. Aplikasi akan otomatis di-build, menjalankan sinkronisasi schema database (`prisma db push`), dan online dengan sertifikat HTTPS otomatis!

---

## 🛠️ 3. Menjalankan di Komputer Lokal (Development)

```bash
# 1. Salin template environment
cp .env.example .env.local

# 2. Jalankan database MySQL lokal via Docker
npm run docker:up

# 3. Sinkronkan database schema
npm run db:push

# 4. (Opsional) Jalankan data dummy awal
npm run db:seed

# 5. Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🐳 4. Manajemen Docker & Database

| Perintah | Deskripsi |
|---|---|
| `npm run docker:up` | Menjalankan container MySQL & phpMyAdmin lokal |
| `npm run docker:down` | Menghentikan container lokal |
| `npm run db:push` | Sinkronisasi skema Prisma ke database |
| `npm run db:seed` | Mengisi database dengan akun dan data awal |
| `npm run db:studio` | Membuka Prisma Studio GUI di browser |
