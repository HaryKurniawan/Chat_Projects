# Aplikasi Chat Real-Time

Aplikasi chat real-time full-stack yang dibangun menggunakan React, Vite, Node.js, Express, Socket.IO, dan Prisma.

## Fitur Utama

- **Autentikasi Pengguna:** Sistem Register dan Login yang aman dengan autentikasi JWT.
- **Pesan Real-Time:** Pengiriman pesan instan menggunakan Socket.IO untuk komunikasi yang lancar.
- **Dashboard Admin:** Halaman khusus bagi admin untuk mengelola aplikasi (ban/unban pesan, manajemen pengguna, dll).
- **UI Responsif:** Antarmuka pengguna yang modern, bersih, dan responsif menggunakan Tailwind CSS v4, Radix UI, dan Ant Design.
- **Integrasi Database:** Integrasi ORM yang kokoh menggunakan Prisma.

## Teknologi (Tech Stack)

### Frontend

- **React 19** & **Vite**
- **Tailwind CSS v4** untuk styling
- **Socket.IO Client** untuk event real-time
- **React Router DOM** untuk navigasi
- **Radix UI** & **Ant Design** untuk komponen UI yang aksesibel dan mudah disesuaikan
- **Lucide React** untuk ikon

### Backend

- **Node.js** & **Express** server
- **Prisma (ORM)** untuk interaksi database
- **Socket.IO Server** untuk komunikasi dua arah real-time
- **JSON Web Token (JWT)** & **bcrypt** untuk keamanan dan autentikasi
- **Express Rate Limit** & **Helmet** untuk perlindungan API

## Struktur Proyek

Repositori ini disusun sebagai monorepo dengan dua folder utama:

- `/frontend` - Berisi aplikasi single-page React.
- `/backend` - Berisi server Express, konfigurasi Socket.IO, dan model Prisma.
- `/.husky` - Konfigurasi Git Hooks (Linter & Commit Message Standard).

## Memulai (Getting Started)

### Prasyarat

- Node.js (disarankan v18 ke atas)
- Database (PostgreSQL atau MySQL sesuai konfigurasi Prisma di backend)

### Instalasi & Setup

1. **Clone repositori:**

   ```bash
   git clone <repository-url>
   cd project_chat
   ```

2. **Setup Backend:**

   ```bash
   cd backend
   npm install

   # Duplikat file .env.example menjadi .env
   cp .env.example .env

   # Perbarui variabel di .env, contoh: DATABASE_URL dan JWT_SECRET

   # Generate Prisma client dan push schema ke database Anda
   npx prisma generate
   npx prisma db push

   # Jalankan server pengembangan
   npm run dev
   ```

3. **Setup Frontend:**

   ```bash
   cd ../frontend
   npm install

   # Jalankan server pengembangan React
   npm run dev
   ```

## Penggunaan

- Buka browser ke URL yang diberikan oleh Vite (contoh: `http://localhost:5173`).
- Buat akun atau login.
- Mulai chat secara real-time atau akses Halaman Admin (`/admin`) jika memiliki hak akses administrator.
