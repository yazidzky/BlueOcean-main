# BlueOcean - Aplikasi Manajemen Tugas & Kolaborasi

![BlueOcean Banner](https://img.shields.io/badge/BlueOcean-Task%20Management-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

BlueOcean adalah aplikasi web full-stack modern yang menggabungkan manajemen tugas produktif dengan fitur jejaring sosial. Aplikasi ini memungkinkan pengguna untuk mengelola tugas harian mereka sambil terhubung dengan teman-teman untuk kolaborasi dan motivasi.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#️-teknologi-yang-digunakan)
- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [Database Schema](#-database-schema)
- [Cara Instalasi](#-cara-instalasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [API Documentation](#-api-documentation)
- [Socket.IO Events](#-socketio-events)
- [Fitur PWA](#-fitur-pwa-progressive-web-app)
- [Deployment](#-deployment)
- [Panduan Pengembangan](#-panduan-pengembangan)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🌟 Fitur Utama

### 📋 Manajemen Tugas
- ✅ **CRUD Tugas Lengkap**: Buat, baca, update, dan hapus tugas dengan mudah
- 🎯 **Sistem Prioritas**: Atur prioritas tugas (rendah, sedang, tinggi)
- 📅 **Tanggal Jatuh Tempo**: Tetapkan deadline untuk setiap tugas
- ✔️ **Status Completion**: Tandai tugas sebagai selesai/belum selesai
- 📊 **Statistik Produktivitas**: Lihat progress dan pencapaian Anda

### 👥 Jejaring Sosial
- 🤝 **Sistem Pertemanan**: Kirim, terima, atau tolak permintaan pertemanan
- 🟢 **Status Real-time**: Indikator status pengguna (online, offline, away)
- 👤 **Profil Pengguna**: Kelola bio, avatar, dan minat pribadi
- 🏆 **Gamifikasi**: Sistem poin dan streak harian untuk meningkatkan motivasi
- 🔍 **Pencarian Pengguna**: Temukan dan tambahkan teman baru

### 💬 Chat Real-time
- ⚡ **Instant Messaging**: Chat langsung dengan teman menggunakan Socket.IO
- 🔔 **Notifikasi Real-time**: Dapatkan notifikasi pesan instan
- 💾 **Riwayat Chat**: Semua percakapan tersimpan di database
- ⌨️ **Typing Indicator**: Lihat ketika teman sedang mengetik
- 📱 **Responsive Chat UI**: Interface chat yang smooth di semua device

### 📊 Statistik & Analytics
- 📈 **Dashboard Komprehensif**: Visualisasi data produktivitas
- 🎯 **Task Completion Rate**: Persentase tugas yang diselesaikan
- 🔥 **Streak Tracking**: Lacak konsistensi harian Anda
- 🏅 **Point System**: Kumpulkan poin dari aktivitas produktif
- 📉 **Trend Analysis**: Lihat pola produktivitas Anda

---

## 🛠️ Teknologi yang Digunakan

### Backend Stack
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | Latest | Runtime JavaScript server-side |
| **Express.js** | ^4.21.2 | Framework web minimal dan fleksibel |
| **MongoDB** | ^8.10.1 | Database NoSQL untuk penyimpanan data |
| **Mongoose** | ^8.10.1 | ODM (Object Data Modeling) untuk MongoDB |
| **Socket.IO** | ^4.8.1 | Library untuk komunikasi real-time bidirectional |
| **JWT** | ^9.0.2 | JSON Web Token untuk autentikasi stateless |
| **bcryptjs** | ^2.4.3 | Library untuk hashing password |
| **Cloudinary** | ^2.8.0 | Cloud storage untuk media files |
| **CORS** | ^2.8.5 | Middleware untuk Cross-Origin Resource Sharing |
| **dotenv** | ^16.4.5 | Manajemen environment variables |

### Frontend Stack
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | ^19.2.0 | Library UI untuk membangun user interface |
| **TypeScript** | ~5.9.3 | Superset JavaScript dengan type safety |
| **Vite** | ^7.2.4 | Build tool modern dan cepat |
| **TailwindCSS** | ^3.4.18 | Utility-first CSS framework |
| **Radix UI** | Latest | Komponen UI primitif yang accessible |
| **React Query** | ^5.55.4 | Library untuk data fetching dan caching |
| **React Router** | ^6.26.2 | Routing library untuk React |
| **Socket.IO Client** | ^4.8.1 | Client library untuk Socket.IO |
| **Recharts** | ^2.12.7 | Library untuk visualisasi data |
| **Lucide React** | ^0.468.0 | Icon library modern |
| **React Hook Form** | ^7.53.0 | Form validation library |
| **Sonner** | ^1.5.0 | Toast notification library |

---

## 🏗️ Arsitektur Aplikasi

### Struktur Proyek

```
BlueOcean-main/
│
├── backend/                      # Server-side application
│   ├── config/
│   │   └── database.js          # MongoDB connection configuration
│   │
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── chat.controller.js   # Chat management
│   │   ├── friend.controller.js # Friend system logic
│   │   ├── stats.controller.js  # Statistics calculation
│   │   ├── task.controller.js   # Task CRUD operations
│   │   └── user.controller.js   # User profile management
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.js   # JWT verification
│   │   └── error.middleware.js  # Global error handler
│   │
│   ├── models/                  # MongoDB schemas
│   │   ├── Chat.model.js        # Chat message schema
│   │   ├── Task.model.js        # Task schema
│   │   └── User.model.js        # User schema with relations
│   │
│   ├── routes/                  # API route definitions
│   │   ├── auth.routes.js       # /api/auth endpoints
│   │   ├── chat.routes.js       # /api/chats endpoints
│   │   ├── friend.routes.js     # /api/friends endpoints
│   │   ├── stats.routes.js      # /api/stats endpoints
│   │   ├── task.routes.js       # /api/tasks endpoints
│   │   └── user.routes.js       # /api/users endpoints
│   │
│   ├── socket/                  # Socket.IO handlers
│   │   └── handlers.js          # Real-time event handlers
│   │
│   ├── utils/                   # Utility functions
│   │   └── generateToken.js     # JWT token generation
│   │
│   ├── .env                     # Environment variables (not in repo)
│   ├── package.json             # Backend dependencies
│   └── server.js                # Application entry point
│
└── frontend/                    # Client-side application
    ├── public/                  # Static assets
    │   └── vite.svg            # Default Vite logo
    │
    ├── src/
    │   ├── assets/             # Images, fonts, etc.
    │   │
    │   ├── components/         # Reusable React components
    │   │   ├── ui/            # Radix UI components
    │   │   ├── Layout.tsx     # Main layout wrapper
    │   │   ├── Navbar.tsx     # Navigation bar
    │   │   └── ...            # Other components
    │   │
    │   ├── contexts/          # React Context providers
    │   │   ├── AuthContext.tsx    # Authentication state
    │   │   └── ThemeProvider.tsx  # Theme management
    │   │
    │   ├── hooks/             # Custom React hooks
    │   │   ├── useAuth.ts     # Authentication hook
    │   │   ├── useSocket.ts   # Socket.IO hook
    │   │   └── ...            # Other custom hooks
    │   │
    │   ├── lib/               # Utility functions
    │   │   ├── api.ts         # Axios instance & API calls
    │   │   └── utils.ts       # Helper functions
    │   │
    │   ├── pages/             # Page components
    │   │   ├── Landing.tsx    # Landing page
    │   │   ├── Login.tsx      # Login page
    │   │   ├── Register.tsx   # Registration page
    │   │   ├── Dashboard.tsx  # Main dashboard
    │   │   ├── Tasks.tsx      # Task management page
    │   │   ├── Friends.tsx    # Friends list page
    │   │   ├── Chat.tsx       # Chat interface
    │   │   ├── Profile.tsx    # User profile page
    │   │   └── NotFound.tsx   # 404 page
    │   │
    │   ├── types/             # TypeScript type definitions
    │   │   └── index.ts       # Global types
    │   │
    │   ├── App.tsx            # Root component
    │   ├── main.tsx           # Application entry point
    │   └── index.css          # Global styles
    │
    ├── .env                   # Frontend environment variables
    ├── components.json        # Shadcn UI configuration
    ├── index.html             # HTML template
    ├── package.json           # Frontend dependencies
    ├── tailwind.config.cjs    # TailwindCSS configuration
    ├── tsconfig.json          # TypeScript configuration
    ├── vite.config.ts         # Vite configuration
    └── vercel.json            # Vercel deployment config
```

### Arsitektur Backend

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (React Frontend, Mobile Apps, Third-party Clients)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CORS Middleware │ Auth Middleware │ Error Handler  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Route Layer                             │
│  /api/auth  /api/users  /api/tasks  /api/friends  /api/chats│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Controller Layer                           │
│  Business Logic & Request/Response Handling                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Model Layer                              │
│  MongoDB Schemas & Data Validation                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
│  MongoDB (Collections: users, tasks, chats)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Real-time Layer (Parallel)                  │
│  Socket.IO Server ←→ Socket Handlers ←→ Connected Clients   │
└─────────────────────────────────────────────────────────────┘
```

### Flow Autentikasi

```
┌──────────┐                                      ┌──────────┐
│  Client  │                                      │  Server  │
└────┬─────┘                                      └────┬─────┘
     │                                                 │
     │  POST /api/auth/register                       │
     │  { name, email, password }                     │
     ├────────────────────────────────────────────────>
     │                                                 │
     │                    Validate Input               │
     │                    Hash Password                │
     │                    Create User in DB            │
     │                    Generate JWT Token           │
     │                                                 │
     │  { user, token }                               │
     <────────────────────────────────────────────────┤
     │                                                 │
     │  Store token in localStorage                    │
     │                                                 │
     │  GET /api/auth/me                              │
     │  Headers: { Authorization: Bearer <token> }    │
     ├────────────────────────────────────────────────>
     │                                                 │
     │                    Verify JWT                   │
     │                    Fetch User from DB           │
     │                                                 │
     │  { user }                                      │
     <────────────────────────────────────────────────┤
     │                                                 │
```

---

## 💾 Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String (required, max 50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6 chars),
  avatar: String (default: DiceBear avatar),
  status: String (enum: ['online', 'offline', 'away']),
  bio: String (max 500 chars),
  interests: [String],
  points: Number (default: 0),
  streakDays: Number (default: 0),
  lastLoginAt: Date,
  friends: [ObjectId] (ref: User),
  friendRequests: [
    {
      from: ObjectId (ref: User),
      status: String (enum: ['pending', 'accepted', 'rejected']),
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: unique index untuk login cepat
- `friends`: index untuk query pertemanan

### Task Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  title: String (required, max 200 chars),
  description: String (max 1000 chars),
  completed: Boolean (default: false),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user + completed`: compound index untuk filter tugas
- `user + dueDate`: compound index untuk sorting by deadline

### Chat Collection

```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User, required),
  receiver: ObjectId (ref: User, required),
  message: String (required, max 1000 chars),
  read: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `sender + receiver`: compound index untuk query chat history
- `createdAt`: index untuk sorting chronological

---

## 🚀 Cara Instalasi

### Prasyarat

Pastikan sistem Anda memiliki:
- **Node.js** v16.0.0 atau lebih tinggi ([Download](https://nodejs.org/))
- **MongoDB** v5.0 atau lebih tinggi ([Download](https://www.mongodb.com/try/download/community))
- **npm** v8.0.0 atau **pnpm** v8.0.0
- **Git** untuk cloning repository

### 1. Clone Repository

```bash
git clone https://github.com/yazidzky/BlueOcean-main.git
cd BlueOcean-main
```

### 2. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install
# atau
pnpm install
```

### 3. Setup Frontend

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Install dependencies
npm install
# atau
pnpm install
```

### 4. Setup Database

**Opsi A: MongoDB Local**
```bash
# Jalankan MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
net start MongoDB  # Windows

# MongoDB akan berjalan di mongodb://localhost:27017
```

**Opsi B: MongoDB Atlas (Cloud)**
1. Buat akun di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Buat cluster baru
3. Whitelist IP address Anda
4. Dapatkan connection string
5. Gunakan connection string di `.env`

---

## ⚙️ Konfigurasi Environment

### Backend Environment Variables

Buat file `.env` di folder `backend/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blueocean
# Atau untuk MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blueocean?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Frontend URL (untuk CORS)
CLIENT_URL=http://localhost:5173

# Allowed Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173,http://localhost:8080

# Vercel Preview Deployment
ALLOW_VERCEL_PREVIEW=false

# Cloudinary Configuration (Optional - untuk upload gambar)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Environment Variables

Buat file `.env` di folder `frontend/`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Socket.IO Configuration
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=BlueOcean
VITE_APP_VERSION=1.0.0
```

### Environment Variables untuk Production

**Backend (.env.production):**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blueocean
JWT_SECRET=production_secret_key_very_long_and_random
CLIENT_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

---

## 🏃 Menjalankan Aplikasi

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server akan berjalan di `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Aplikasi akan berjalan di `http://localhost:8080` (sesuai vite.config.ts)

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response 201:
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "...",
    "status": "offline",
    "points": 0,
    "streakDays": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "user": { ... },
  "token": "..."
}
```

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "user": { ... }
}
```

### User Endpoints

#### 1. Get All Users
```http
GET /api/users
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "users": [...]
}
```

#### 2. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "user": { ... }
}
```

#### 3. Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "New bio",
  "interests": ["coding", "gaming"]
}

Response 200:
{
  "success": true,
  "user": { ... }
}
```

#### 4. Update User Status
```http
PUT /api/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "online"
}

Response 200:
{
  "success": true,
  "user": { ... }
}
```

### Task Endpoints

#### 1. Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
Query Parameters:
  - completed: boolean (optional)
  - priority: string (optional)

Response 200:
{
  "success": true,
  "tasks": [...]
}
```

#### 2. Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the BlueOcean app",
  "priority": "high",
  "dueDate": "2024-12-31"
}

Response 201:
{
  "success": true,
  "task": { ... }
}
```

#### 3. Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}

Response 200:
{
  "success": true,
  "task": { ... }
}
```

#### 4. Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Task deleted"
}
```

#### 5. Toggle Task Completion
```http
PATCH /api/tasks/:id/toggle
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "task": { ... }
}
```

### Friend Endpoints

#### 1. Send Friend Request
```http
POST /api/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "target_user_id"
}

Response 200:
{
  "success": true,
  "message": "Friend request sent"
}
```

#### 2. Accept Friend Request
```http
POST /api/friends/accept
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "requester_user_id"
}

Response 200:
{
  "success": true,
  "message": "Friend request accepted"
}
```

#### 3. Reject Friend Request
```http
POST /api/friends/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "requester_user_id"
}

Response 200:
{
  "success": true,
  "message": "Friend request rejected"
}
```

#### 4. Remove Friend
```http
DELETE /api/friends/:friendId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Friend removed"
}
```

### Chat Endpoints

#### 1. Get Chat History
```http
GET /api/chats/:userId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "chats": [...]
}
```

#### 2. Send Message
```http
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "receiver_user_id",
  "message": "Hello!"
}

Response 201:
{
  "success": true,
  "chat": { ... }
}
```

### Statistics Endpoints

#### 1. Get User Statistics
```http
GET /api/stats
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "stats": {
    "totalTasks": 50,
    "completedTasks": 35,
    "pendingTasks": 15,
    "completionRate": 70,
    "totalFriends": 12,
    "points": 350,
    "streakDays": 7
  }
}
```

---

## 🔌 Socket.IO Events

### Client → Server Events

#### 1. Join Room
```javascript
socket.emit('join', { userId: 'user_id' });
```
Bergabung ke room personal untuk menerima notifikasi

#### 2. Send Message
```javascript
socket.emit('sendMessage', {
  senderId: 'sender_id',
  receiverId: 'receiver_id',
  message: 'Hello!'
});
```

#### 3. Typing Indicator
```javascript
socket.emit('typing', {
  senderId: 'sender_id',
  receiverId: 'receiver_id'
});
```

#### 4. Stop Typing
```javascript
socket.emit('stopTyping', {
  senderId: 'sender_id',
  receiverId: 'receiver_id'
});
```

### Server → Client Events

#### 1. Receive Message
```javascript
socket.on('receiveMessage', (data) => {
  // data: { _id, sender, receiver, message, createdAt }
  console.log('New message:', data);
});
```

#### 2. User Status Change
```javascript
socket.on('userStatusChange', (data) => {
  // data: { userId, status: 'online' | 'offline' | 'away' }
  console.log('User status changed:', data);
});
```

#### 3. Typing Event
```javascript
socket.on('typing', (data) => {
  // data: { senderId }
  console.log('User is typing:', data.senderId);
});
```

#### 4. Stop Typing Event
```javascript
socket.on('stopTyping', (data) => {
  // data: { senderId }
  console.log('User stopped typing:', data.senderId);
});
```

### Socket.IO Connection Example

```javascript
import io from 'socket.io-client';

const socket = io(process.env.VITE_SOCKET_URL, {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Join user room
socket.emit('join', { userId: currentUser._id });

// Listen for messages
socket.on('receiveMessage', (message) => {
  // Update chat UI
});

// Send message
const sendMessage = (receiverId, text) => {
  socket.emit('sendMessage', {
    senderId: currentUser._id,
    receiverId,
    message: text
  });
};
```

---

## 📱 Fitur PWA (Progressive Web App)

### Status PWA
⚠️ **Catatan**: Aplikasi ini saat ini **belum mengimplementasikan fitur PWA secara penuh**. Untuk mengaktifkan PWA, diperlukan konfigurasi tambahan.

### Cara Mengaktifkan PWA

#### 1. Install Plugin Vite PWA

```bash
cd frontend
npm install vite-plugin-pwa -D
```

#### 2. Update vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'BlueOcean - Task Management',
        short_name: 'BlueOcean',
        description: 'Aplikasi manajemen tugas dengan fitur jejaring sosial',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### 3. Buat Icon PWA

Buat icon dengan ukuran berikut di folder `public/`:
- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)
- `apple-touch-icon.png` (180x180 pixels)
- `favicon.ico` (32x32 pixels)

#### 4. Update index.html

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#3b82f6" />
    <meta name="description" content="Aplikasi manajemen tugas dengan fitur jejaring sosial" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    
    <title>BlueOcean - Task Management</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### 5. Fitur PWA yang Akan Aktif

Setelah konfigurasi di atas, aplikasi akan memiliki:
- ✅ **Install ke Home Screen**: Pengguna bisa install aplikasi di device
- ✅ **Offline Support**: Aplikasi tetap bisa diakses tanpa internet
- ✅ **Service Worker**: Caching otomatis untuk performa lebih baik
- ✅ **Push Notifications**: (Perlu konfigurasi tambahan)
- ✅ **Background Sync**: (Perlu konfigurasi tambahan)

---

## 🌐 Deployment

### Deployment Backend

#### Opsi 1: Railway

1. **Buat akun di [Railway](https://railway.app/)**

2. **Deploy dari GitHub:**
   ```bash
   # Push code ke GitHub
   git push origin main
   
   # Di Railway dashboard:
   # - New Project → Deploy from GitHub
   # - Pilih repository BlueOcean-main
   # - Railway akan auto-detect Node.js
   ```

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=...
   CLIENT_URL=https://your-frontend.vercel.app
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Deploy:**
   Railway akan otomatis build dan deploy

#### Opsi 2: Render

1. **Buat akun di [Render](https://render.com/)**

2. **Create New Web Service:**
   - Connect GitHub repository
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

3. **Set Environment Variables** (sama seperti Railway)

4. **Deploy**

#### Opsi 3: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create blueocean-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...

# Deploy
git subtree push --prefix backend heroku main
```

#### Opsi 4: VPS (DigitalOcean, AWS EC2, Linode)

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone repository
git clone https://github.com/yazidzky/BlueOcean-main.git
cd BlueOcean-main/backend

# Install dependencies
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Start with PM2
pm2 start server.js --name blueocean-backend

# Setup PM2 startup
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/blueocean

# Nginx config:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/blueocean /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Deployment Frontend

#### Opsi 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables di Vercel Dashboard:**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_SOCKET_URL=https://your-backend.railway.app
   ```

4. **Production Deploy:**
   ```bash
   vercel --prod
   ```

#### Opsi 2: Netlify

1. **Build aplikasi:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy ke Netlify:**
   - Drag & drop folder `dist` ke [Netlify Drop](https://app.netlify.com/drop)
   - Atau gunakan Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

#### Opsi 3: GitHub Pages

```bash
# Install gh-pages
npm install -g gh-pages

# Build
npm run build

# Deploy
gh-pages -d dist
```

### Checklist Deployment

- [ ] MongoDB Atlas setup dan connection string
- [ ] Environment variables configured
- [ ] CORS origins updated untuk production URLs
- [ ] JWT secret yang kuat untuk production
- [ ] SSL/HTTPS enabled
- [ ] Domain name configured (optional)
- [ ] Monitoring setup (optional)
- [ ] Backup strategy (optional)

---

## 👨‍💻 Panduan Pengembangan

### Menambahkan Fitur Baru

#### 1. Backend API Endpoint

**Langkah 1: Buat Model (jika perlu)**
```javascript
// backend/models/NewFeature.model.js
import mongoose from 'mongoose';

const newFeatureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // ... fields lainnya
}, {
  timestamps: true
});

export default mongoose.model('NewFeature', newFeatureSchema);
```

**Langkah 2: Buat Controller**
```javascript
// backend/controllers/newFeature.controller.js
import NewFeature from '../models/NewFeature.model.js';

export const getFeatures = async (req, res) => {
  try {
    const features = await NewFeature.find({ user: req.user._id });
    res.json({ success: true, features });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFeature = async (req, res) => {
  // ... implementation
};
```

**Langkah 3: Buat Routes**
```javascript
// backend/routes/newFeature.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getFeatures, createFeature } from '../controllers/newFeature.controller.js';

const router = express.Router();

router.route('/')
  .get(protect, getFeatures)
  .post(protect, createFeature);

export default router;
```

**Langkah 4: Register Routes di server.js**
```javascript
import newFeatureRoutes from './routes/newFeature.routes.js';
app.use('/api/newfeature', newFeatureRoutes);
```

#### 2. Frontend Component

**Langkah 1: Buat API Service**
```typescript
// frontend/src/lib/api.ts
export const newFeatureAPI = {
  getAll: () => api.get('/newfeature'),
  create: (data) => api.post('/newfeature', data),
  // ... methods lainnya
};
```

**Langkah 2: Buat Component**
```typescript
// frontend/src/components/NewFeature.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { newFeatureAPI } from '@/lib/api';

export const NewFeature = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['newfeature'],
    queryFn: newFeatureAPI.getAll
  });

  const createMutation = useMutation({
    mutationFn: newFeatureAPI.create,
    onSuccess: () => {
      // Refetch data
    }
  });

  // ... component logic
};
```

**Langkah 3: Tambahkan Route**
```typescript
// frontend/src/App.tsx
<Route path="/newfeature" element={<NewFeature />} />
```

### Code Style Guidelines

#### Backend (JavaScript)

```javascript
// ✅ Good
export const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ 
      success: true, 
      tasks 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ❌ Bad
export const getUserTasks = async (req,res) => {
try{
const tasks=await Task.find({user:req.user._id}).sort({createdAt:-1}).limit(10)
res.json({success:true,tasks})
}catch(error){
res.status(500).json({success:false,message:error.message})
}
}
```

#### Frontend (TypeScript + React)

```typescript
// ✅ Good
interface TaskProps {
  task: Task;
  onComplete: (id: string) => void;
}

export const TaskCard: React.FC<TaskProps> = ({ task, onComplete }) => {
  const handleComplete = () => {
    onComplete(task._id);
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <button onClick={handleComplete}>Complete</button>
    </div>
  );
};

// ❌ Bad
export const TaskCard = (props) => {
  return <div className="task-card">
    <h3>{props.task.title}</h3>
    <button onClick={()=>props.onComplete(props.task._id)}>Complete</button>
  </div>
}
```

### Git Workflow

```bash
# 1. Buat branch baru untuk fitur
git checkout -b feature/new-feature-name

# 2. Commit changes dengan pesan yang jelas
git add .
git commit -m "feat: add new feature description"

# 3. Push ke remote
git push origin feature/new-feature-name

# 4. Buat Pull Request di GitHub

# 5. Setelah review, merge ke main
git checkout main
git pull origin main
git merge feature/new-feature-name
git push origin main

# 6. Hapus branch lokal
git branch -d feature/new-feature-name
```

### Commit Message Convention

```
feat: menambahkan fitur baru
fix: memperbaiki bug
docs: update dokumentasi
style: perubahan formatting
refactor: refactoring code
test: menambahkan test
chore: update dependencies
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Install testing dependencies
npm install --save-dev jest supertest

# Buat test file
# backend/tests/auth.test.js
```

**Contoh Test:**
```javascript
import request from 'supertest';
import app from '../server.js';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

### Frontend Testing

```bash
cd frontend

# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Contoh Test:**
```typescript
import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = {
      _id: '1',
      title: 'Test Task',
      completed: false
    };
    
    render(<TaskCard task={task} onComplete={() => {}} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Run Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Pastikan MongoDB service berjalan
sudo systemctl status mongod

# Jika tidak berjalan, start service
sudo systemctl start mongod

# Atau cek connection string di .env
MONGODB_URI=mongodb://localhost:27017/blueocean
```

#### 2. CORS Error

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
```javascript
// backend/server.js
// Pastikan CLIENT_URL di .env sesuai dengan frontend URL
CLIENT_URL=http://localhost:8080

// Dan ALLOWED_ORIGINS include frontend URL
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

#### 3. JWT Token Invalid

**Error:**
```
JsonWebTokenError: invalid token
```

**Solution:**
```javascript
// Pastikan JWT_SECRET sama di .env
JWT_SECRET=your_secret_key

// Clear localStorage di browser
localStorage.removeItem('token');

// Login ulang
```

#### 4. Socket.IO Connection Failed

**Error:**
```
WebSocket connection failed
```

**Solution:**
```javascript
// frontend/.env
// Pastikan VITE_SOCKET_URL benar
VITE_SOCKET_URL=http://localhost:5000

// Cek apakah backend server running
// Cek browser console untuk error details
```

#### 5. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Atau ubah PORT di .env
PORT=5001
```

#### 6. Build Error Frontend

**Error:**
```
Module not found: Can't resolve '@/components/...'
```

**Solution:**
```bash
# Pastikan alias configured di vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

# Clear cache dan rebuild
rm -rf node_modules .vite
npm install
npm run build
```

### Debug Mode

**Backend Debug:**
```bash
# Tambahkan di server.js
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('Port:', process.env.PORT);
```

**Frontend Debug:**
```typescript
// Tambahkan di main.tsx
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
```

---

## 🤝 Kontribusi

Kami sangat menghargai kontribusi dari komunitas! Berikut cara berkontribusi:

### Cara Berkontribusi

1. **Fork Repository**
   ```bash
   # Klik tombol "Fork" di GitHub
   ```

2. **Clone Fork Anda**
   ```bash
   git clone https://github.com/YOUR_USERNAME/BlueOcean-main.git
   cd BlueOcean-main
   ```

3. **Buat Branch Baru**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Buat Perubahan**
   - Tulis code yang clean dan terdokumentasi
   - Follow code style guidelines
   - Tambahkan tests jika applicable

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

6. **Push ke GitHub**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Buat Pull Request**
   - Buka repository di GitHub
   - Klik "New Pull Request"
   - Jelaskan perubahan yang Anda buat
   - Submit PR

### Guidelines Kontribusi

- ✅ Follow existing code style
- ✅ Write clear commit messages
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Keep PRs focused and small
- ❌ Don't commit node_modules
- ❌ Don't commit .env files
- ❌ Don't break existing functionality

### Code Review Process

1. Maintainer akan review PR Anda
2. Jika ada feedback, lakukan perubahan yang diminta
3. Setelah approved, PR akan di-merge
4. Celebrate! 🎉

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **ISC License**.

```
ISC License

Copyright (c) 2025 yazidzky

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## 🙏 Acknowledgments

Terima kasih kepada:

- **Open Source Community** - Untuk tools dan libraries yang luar biasa
- **MongoDB** - Database yang powerful dan flexible
- **React Team** - Untuk library UI yang amazing
- **Socket.IO** - Untuk real-time communication yang mudah
- **Vercel** - Untuk platform deployment yang excellent
- **Semua Kontributor** - Yang telah membantu meningkatkan proyek ini

### Teknologi & Tools yang Digunakan

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [React](https://react.dev/) - UI library
- [Socket.IO](https://socket.io/) - Real-time engine
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

## 📊 Project Statistics

![GitHub stars](https://img.shields.io/github/stars/yazidzky/BlueOcean-main?style=social)
![GitHub forks](https://img.shields.io/github/forks/yazidzky/BlueOcean-main?style=social)
![GitHub issues](https://img.shields.io/github/issues/yazidzky/BlueOcean-main)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yazidzky/BlueOcean-main)

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] PWA implementation lengkap
- [ ] Push notifications
- [ ] Dark mode
- [ ] Task categories
- [ ] File attachments untuk tasks

### Version 1.2 (Future)
- [ ] Team collaboration features
- [ ] Calendar integration
- [ ] Email notifications
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics

### Version 2.0 (Long-term)
- [ ] AI-powered task suggestions
- [ ] Video call integration
- [ ] Third-party integrations (Google Calendar, Slack, etc.)
- [ ] Premium features

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ User authentication
- ✅ Task management
- ✅ Friend system
- ✅ Real-time chat
- ✅ Statistics dashboard
- ✅ Responsive design

---
