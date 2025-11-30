# BlueOcean - Aplikasi Manajemen Tugas & Kolaborasi

BlueOcean adalah aplikasi web full-stack yang menggabungkan manajemen tugas produktif dengan fitur jejaring sosial. Aplikasi ini memungkinkan pengguna untuk mengelola tugas harian mereka sambil terhubung dengan teman-teman untuk kolaborasi dan motivasi.

## 🌟 Fitur Utama

### 📋 Manajemen Tugas
- Buat, edit, dan hapus tugas dengan mudah
- Atur prioritas tugas (rendah, sedang, tinggi)
- Tetapkan tanggal jatuh tempo untuk setiap tugas
- Tandai tugas sebagai selesai
- Lihat statistik produktivitas Anda

### 👥 Jejaring Sosial
- Sistem pertemanan dengan permintaan teman
- Status pengguna (online, offline, away)
- Profil pengguna dengan bio dan minat
- Sistem poin dan streak harian untuk motivasi

### 💬 Chat Real-time
- Chat langsung dengan teman menggunakan Socket.IO
- Notifikasi pesan real-time
- Riwayat percakapan tersimpan

### 📊 Statistik & Gamifikasi
- Lacak poin produktivitas Anda
- Sistem streak harian untuk konsistensi
- Dashboard statistik komprehensif

## 🛠️ Teknologi yang Digunakan

### Backend
- **Node.js** & **Express.js** - Framework server
- **MongoDB** & **Mongoose** - Database dan ODM
- **Socket.IO** - Komunikasi real-time
- **JWT** - Autentikasi pengguna
- **bcryptjs** - Enkripsi password
- **Cloudinary** - Penyimpanan media

### Frontend
- **React 19** - Library UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Komponen UI
- **React Query** - State management & data fetching
- **React Router** - Routing
- **Socket.IO Client** - Real-time communication
- **Recharts** - Visualisasi data
- **Lucide React** - Icon library

## 📁 Struktur Proyek

```
BlueOcean-main/
├── backend/
│   ├── config/          # Konfigurasi database
│   ├── controllers/     # Logic aplikasi
│   ├── middleware/      # Middleware Express
│   ├── models/          # Model MongoDB
│   ├── routes/          # Route API
│   ├── socket/          # Handler Socket.IO
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point backend
│
└── frontend/
    ├── public/          # Asset statis
    ├── src/             # Source code React
    │   ├── components/  # Komponen React
    │   ├── pages/       # Halaman aplikasi
    │   ├── hooks/       # Custom hooks
    │   ├── lib/         # Utility & helpers
    │   └── types/       # TypeScript types
    └── index.html       # HTML template
```

## 🚀 Cara Instalasi

### Prasyarat
- Node.js (v16 atau lebih tinggi)
- MongoDB (lokal atau cloud)
- npm atau pnpm

### 1. Clone Repository
```bash
git clone https://github.com/yazidzky/BlueOcean-main.git
cd BlueOcean-main
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder backend:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/blueocean
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
ALLOW_VERCEL_PREVIEW=false

# Cloudinary (opsional, untuk upload gambar)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Jalankan server backend:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

Buka terminal baru:
```bash
cd frontend
npm install
```

Buat file `.env` di folder frontend:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Jalankan aplikasi frontend:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login pengguna
- `GET /api/auth/me` - Dapatkan data pengguna saat ini

### Users
- `GET /api/users` - Dapatkan semua pengguna
- `GET /api/users/:id` - Dapatkan pengguna berdasarkan ID
- `PUT /api/users/:id` - Update profil pengguna
- `PUT /api/users/:id/status` - Update status pengguna

### Tasks
- `GET /api/tasks` - Dapatkan semua tugas pengguna
- `POST /api/tasks` - Buat tugas baru
- `PUT /api/tasks/:id` - Update tugas
- `DELETE /api/tasks/:id` - Hapus tugas
- `PATCH /api/tasks/:id/toggle` - Toggle status selesai tugas

### Friends
- `POST /api/friends/request` - Kirim permintaan pertemanan
- `POST /api/friends/accept` - Terima permintaan pertemanan
- `POST /api/friends/reject` - Tolak permintaan pertemanan
- `DELETE /api/friends/:friendId` - Hapus teman

### Chats
- `GET /api/chats/:userId` - Dapatkan riwayat chat dengan pengguna
- `POST /api/chats` - Kirim pesan baru

### Stats
- `GET /api/stats` - Dapatkan statistik pengguna

## 🔌 Socket.IO Events

### Client → Server
- `join` - Bergabung ke room pengguna
- `sendMessage` - Kirim pesan chat
- `typing` - Indikator sedang mengetik
- `stopTyping` - Berhenti mengetik

### Server → Client
- `receiveMessage` - Terima pesan baru
- `userStatusChange` - Perubahan status pengguna
- `typing` - Pengguna lain sedang mengetik
- `stopTyping` - Pengguna lain berhenti mengetik

## 🎨 Fitur UI

- **Responsive Design** - Bekerja sempurna di desktop dan mobile
- **Dark Mode Ready** - Siap untuk implementasi dark mode
- **Animasi Smooth** - Transisi dan animasi yang halus
- **Komponen Reusable** - Komponen UI yang dapat digunakan kembali
- **Accessibility** - Dibangun dengan standar aksesibilitas

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm run lint
```

## 📦 Build untuk Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🌐 Deployment

### Backend
Aplikasi backend dapat di-deploy ke:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

### Frontend
Aplikasi frontend dapat di-deploy ke:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Cloudflare Pages

### Environment Variables untuk Production
Pastikan untuk mengatur semua environment variables yang diperlukan di platform hosting Anda.

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan ikuti langkah berikut:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Lisensi

Proyek ini dilisensikan di bawah lisensi ISC.

## 👨‍💻 Pengembang

Dikembangkan oleh [yazidzky](https://github.com/yazidzky)

## 📧 Kontak

Jika Anda memiliki pertanyaan atau saran, silakan buat issue di repository ini.

## 🙏 Acknowledgments

- Terima kasih kepada semua kontributor open-source
- Inspirasi dari berbagai aplikasi produktivitas modern
- Komunitas React dan Node.js

---
