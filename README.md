# 🌊 BlueOcean - Task Management & Social Networking Platform

BlueOcean adalah aplikasi web Progressive Web App (PWA) yang menggabungkan manajemen tugas dengan fitur jejaring sosial. Aplikasi ini memungkinkan pengguna untuk mengelola tugas, berkolaborasi dengan teman, dan berkomunikasi secara real-time.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi Stack](#-teknologi-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Deployment ke VPS/Cloud](#-deployment-ke-vpscloud)
- [Struktur Database](#-struktur-database)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [PWA Features](#-pwa-features)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## ✨ Fitur Utama

### 🎯 Manajemen Tugas
- ✅ Buat, edit, dan hapus tugas
- 📅 Set tanggal jatuh tempo
- 🎨 Prioritas tugas (Low, Medium, High)
- ✔️ Tandai tugas sebagai selesai
- 📊 Dashboard statistik tugas

### 👥 Jejaring Sosial
- 🤝 Sistem pertemanan (kirim/terima permintaan teman)
- 💬 Chat real-time dengan teman
- 👤 Profil pengguna dengan avatar
- 🎯 Sistem poin dan streak
- 🔍 Cari pengguna lain

### 🔐 Autentikasi & Keamanan
- 🔒 Registrasi dan login dengan JWT
- 🛡️ Password hashing dengan bcrypt
- 🔑 Protected routes
- 👁️ Status online/offline real-time

### 📱 Progressive Web App (PWA)
- 📲 Dapat diinstall di perangkat
- 🔄 Offline support dengan Service Worker
- 💾 Caching strategi untuk performa optimal
- 🔔 Push notifications
- 📶 Background sync untuk operasi offline

### 🌐 Real-time Features
- ⚡ WebSocket untuk komunikasi real-time
- 💬 Typing indicators
- 🟢 Status online/offline
- 📨 Instant message delivery

## 🛠 Teknologi Stack

### Frontend
- **Framework**: React 19.2.0 + TypeScript
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 6.26.2
- **State Management**: TanStack React Query 5.55.4
- **UI Components**: Radix UI + Tailwind CSS 3.4.18
- **Real-time**: Socket.IO Client 4.8.1
- **HTTP Client**: Axios 1.7.7
- **Forms**: React Hook Form 7.53.0
- **Charts**: Recharts 2.12.7
- **Icons**: Lucide React 0.468.0
- **Notifications**: Sonner 1.5.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB + Mongoose 8.10.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Real-time**: Socket.IO 4.8.1
- **File Upload**: Cloudinary 2.8.0
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.4.5

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm/pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript 5.9.3

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  │   (PWA)      │  │   (PWA)      │  │   (PWA)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Frontend (Vite)                   │   │
│  │  ├─ Components (Radix UI + Tailwind)                 │   │
│  │  ├─ Pages (Dashboard, Tasks, Chat, Profile)          │   │
│  │  ├─ Contexts (Auth, Theme)                           │   │
│  │  ├─ Hooks (Custom React Hooks)                       │   │
│  │  └─ Service Worker (PWA)                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API / WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Express.js Server + Socket.IO              │   │
│  │  ├─ Routes (Auth, Users, Tasks, Friends, Chat)       │   │
│  │  ├─ Controllers (Business Logic)                     │   │
│  │  ├─ Middleware (Auth, Error Handling)                │   │
│  │  ├─ Socket Handlers (Real-time Events)               │   │
│  │  └─ Utils (Helpers, Validators)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    MongoDB                           │   │
│  │  ├─ Users Collection                                 │   │
│  │  ├─ Tasks Collection                                 │   │
│  │  ├─ Chats Collection                                 │   │
│  │  └─ Indexes (Performance Optimization)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Cloudinary  │  │   DiceBear   │  │    Email     │      │
│  │ (File Upload)│  │  (Avatars)   │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prasyarat

Sebelum memulai, pastikan sistem Anda memiliki:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 atau **pnpm** >= 8.0.0
- **MongoDB** >= 6.0 (lokal atau cloud seperti MongoDB Atlas)
- **Git** untuk version control
- **Text Editor** (VS Code, Sublime, dll)

### Verifikasi Instalasi

```bash
node --version    # Harus >= v18.0.0
npm --version     # Harus >= 9.0.0
mongo --version   # Harus >= 6.0
git --version     # Versi terbaru
```

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/yazidzky/BlueOcean-main.git
cd BlueOcean-main
```

### 2. Setup Backend

```bash
cd backend
npm install
# atau
pnpm install
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
# atau
pnpm install
```

## ⚙️ Konfigurasi Environment

### Backend Environment Variables

Buat file `.env` di folder `backend/`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/oceanbluee
# Atau gunakan MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oceanbluee?retryWrites=true&w=majority
MONGODB_DB=oceanbluee

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=30d

# CORS Configuration
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
ALLOW_VERCEL_PREVIEW=false

# Cloudinary Configuration (Optional - untuk upload file)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional - untuk notifikasi)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Frontend Environment Variables

Buat file `.env` di folder `frontend/`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=BlueOcean
VITE_APP_VERSION=1.0.0
```

### Environment untuk Production

Untuk production, gunakan nilai yang lebih aman:

**Backend `.env.production`:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oceanbluee
JWT_SECRET=generate_a_very_strong_random_secret_key
JWT_EXPIRE=7d
CLIENT_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ALLOW_VERCEL_PREVIEW=false
```

**Frontend `.env.production`:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com
```

## 🏃 Menjalankan Aplikasi

### Development Mode

#### 1. Jalankan Backend
```bash
cd backend
npm run dev
# Server berjalan di http://localhost:5000
```

#### 2. Jalankan Frontend (Terminal Baru)
```bash
cd frontend
npm run dev
# Aplikasi berjalan di http://localhost:5173
```

### Production Mode

#### 1. Build Frontend
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

#### 2. Jalankan Backend Production
```bash
cd backend
npm start
```

### Akses Aplikasi

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🌐 Deployment ke VPS/Cloud

### Opsi 1: Deployment ke VPS (Ubuntu/Debian)

#### 1. Persiapan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Clone dan Setup Aplikasi

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yazidzky/BlueOcean-main.git
cd BlueOcean-main

# Setup Backend
cd backend
sudo npm install --production
sudo cp .env.example .env
sudo nano .env  # Edit konfigurasi

# Setup Frontend
cd ../frontend
sudo npm install
sudo npm run build
```

#### 3. Konfigurasi PM2

Buat file `ecosystem.config.js` di root project:

```javascript
module.exports = {
  apps: [
    {
      name: 'blueocean-backend',
      cwd: '/var/www/BlueOcean-main/backend',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/blueocean-backend-error.log',
      out_file: '/var/log/pm2/blueocean-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

Jalankan dengan PM2:
```bash
cd /var/www/BlueOcean-main
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Konfigurasi Nginx

Buat file konfigurasi `/etc/nginx/sites-available/blueocean`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/BlueOcean-main/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker - no cache
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Manifest
    location = /manifest.webmanifest {
        add_header Content-Type application/manifest+json;
    }
}
```

Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/blueocean /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL dengan Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

#### 6. Setup Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Opsi 2: Deployment ke Vercel (Frontend) + Railway/Render (Backend)

#### Frontend ke Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Frontend**
```bash
cd frontend
vercel --prod
```

3. **Konfigurasi `vercel.json`** (sudah ada di project):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

#### Backend ke Railway

1. **Buat akun di** [Railway.app](https://railway.app)
2. **Connect GitHub repository**
3. **Add MongoDB database** dari Railway marketplace
4. **Set environment variables** di Railway dashboard
5. **Deploy** otomatis dari GitHub

#### Backend ke Render

1. **Buat akun di** [Render.com](https://render.com)
2. **New Web Service** → Connect repository
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`
5. **Add environment variables**
6. **Add MongoDB** dari Render (atau gunakan MongoDB Atlas)

### Opsi 3: Deployment ke Docker

#### 1. Buat `Dockerfile` untuk Backend

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### 2. Buat `Dockerfile` untuk Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Buat `docker-compose.yml`

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: blueocean-mongo
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: oceanbluee

  backend:
    build: ./backend
    container_name: blueocean-backend
    restart: always
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://mongodb:27017/oceanbluee
      JWT_SECRET: ${JWT_SECRET}
      CLIENT_URL: ${CLIENT_URL}

  frontend:
    build: ./frontend
    container_name: blueocean-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### 4. Deploy dengan Docker

```bash
# Build dan jalankan
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 💾 Struktur Database

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,              // Nama pengguna
  email: String,             // Email (unique)
  password: String,          // Hashed password
  avatar: String,            // URL avatar
  status: String,            // 'online' | 'offline' | 'away'
  bio: String,               // Bio pengguna
  interests: [String],       // Array minat
  points: Number,            // Total poin
  streakDays: Number,        // Hari berturut-turut aktif
  lastLoginAt: Date,         // Terakhir login
  friends: [ObjectId],       // Array ID teman
  friendRequests: [{
    from: ObjectId,          // ID pengirim
    status: String,          // 'pending' | 'accepted' | 'rejected'
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,            // Ref ke Users
  title: String,             // Judul tugas
  description: String,       // Deskripsi tugas
  completed: Boolean,        // Status selesai
  priority: String,          // 'low' | 'medium' | 'high'
  dueDate: Date,             // Tanggal jatuh tempo
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ user: 1, completed: 1 }
{ user: 1, dueDate: 1 }
```

### Chats Collection

```javascript
{
  _id: ObjectId,
  participants: [ObjectId],  // Array 2 user IDs
  messages: [{
    sender: ObjectId,        // Ref ke Users
    content: String,         // Isi pesan
    read: Boolean,           // Status dibaca
    createdAt: Date
  }],
  lastMessage: {
    content: String,
    sender: ObjectId,
    createdAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register          - Registrasi pengguna baru
POST   /api/auth/login             - Login pengguna
GET    /api/auth/me                - Get profil pengguna saat ini (protected)
```

### Users

```
GET    /api/users                  - Get semua pengguna (protected)
GET    /api/users/:id              - Get detail pengguna (protected)
PUT    /api/users/:id              - Update profil pengguna (protected)
DELETE /api/users/:id              - Hapus pengguna (protected)
GET    /api/users/search?q=query   - Cari pengguna (protected)
```

### Tasks

```
GET    /api/tasks                  - Get semua tugas user (protected)
POST   /api/tasks                  - Buat tugas baru (protected)
GET    /api/tasks/:id              - Get detail tugas (protected)
PUT    /api/tasks/:id              - Update tugas (protected)
DELETE /api/tasks/:id              - Hapus tugas (protected)
PATCH  /api/tasks/:id/complete     - Toggle status selesai (protected)
```

### Friends

```
GET    /api/friends                - Get daftar teman (protected)
POST   /api/friends/request        - Kirim permintaan teman (protected)
PUT    /api/friends/accept/:id     - Terima permintaan teman (protected)
PUT    /api/friends/reject/:id     - Tolak permintaan teman (protected)
DELETE /api/friends/:id            - Hapus teman (protected)
GET    /api/friends/requests       - Get permintaan teman pending (protected)
```

### Chats

```
GET    /api/chats                  - Get semua chat user (protected)
POST   /api/chats                  - Buat chat baru (protected)
GET    /api/chats/:id              - Get detail chat (protected)
POST   /api/chats/:id/messages     - Kirim pesan (protected)
PUT    /api/chats/:id/read         - Tandai pesan dibaca (protected)
DELETE /api/chats/:id              - Hapus chat (protected)
```

### Stats

```
GET    /api/stats                  - Get statistik user (protected)
GET    /api/stats/leaderboard      - Get leaderboard (protected)
```

### Health Check

```
GET    /api/health                 - Status server
GET    /                           - Info API routes
```

### Request/Response Examples

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "...",
      "status": "offline"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Create Task
```bash
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "priority": "high",
  "dueDate": "2024-12-31"
}

# Response
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "completed": false,
    "user": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## 🔌 WebSocket Events

### Client → Server

```javascript
// Typing indicator
socket.emit('typing', {
  recipientId: 'user_id',
  chatId: 'chat_id'
});

socket.emit('stop_typing', {
  recipientId: 'user_id',
  chatId: 'chat_id'
});
```

### Server → Client

```javascript
// User status changes
socket.on('user_status', (data) => {
  console.log(data); // { userId: '...', status: 'online' }
});

// Typing indicators
socket.on('user_typing', (data) => {
  console.log(data); // { userId: '...', chatId: '...' }
});

socket.on('user_stop_typing', (data) => {
  console.log(data); // { userId: '...', chatId: '...' }
});

// New message
socket.on('new_message', (data) => {
  console.log(data); // { chatId: '...', message: {...} }
});
```

### Connection Example

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

## 📱 PWA Features

### Service Worker

Service Worker di `frontend/public/sw.js` menyediakan:

1. **Caching Strategy**
   - Core assets (HTML, CSS, JS, images)
   - API responses
   - Navigation requests

2. **Offline Support**
   - Fallback ke cache saat offline
   - Queue requests untuk sync nanti

3. **Background Sync**
   - Sync data saat koneksi kembali
   - Retry failed requests

4. **Push Notifications**
   - Notifikasi pesan baru
   - Notifikasi tugas jatuh tempo

### Manifest

File `manifest.webmanifest` mendefinisikan:
- Nama aplikasi
- Icons (192x192, 512x512)
- Theme color
- Display mode (standalone)
- Start URL

### Install Prompt

Aplikasi dapat diinstall sebagai PWA di:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS)
- ✅ Firefox (Desktop)
- ✅ Samsung Internet

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Registrasi pengguna baru
- [ ] Login dengan kredensial valid
- [ ] Buat, edit, hapus tugas
- [ ] Kirim permintaan teman
- [ ] Terima/tolak permintaan teman
- [ ] Kirim pesan chat
- [ ] Real-time typing indicator
- [ ] Status online/offline
- [ ] Offline mode (disconnect internet)
- [ ] Install sebagai PWA
- [ ] Push notifications

## 🐛 Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solusi:**
- Pastikan MongoDB berjalan: `sudo systemctl start mongod`
- Cek connection string di `.env`
- Gunakan MongoDB Atlas jika MongoDB lokal bermasalah

#### JWT Token Error
```
Error: jwt malformed
```
**Solusi:**
- Pastikan `JWT_SECRET` di `.env` sudah diset
- Clear localStorage di browser
- Login ulang

#### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solusi:**
- Tambahkan frontend URL ke `ALLOWED_ORIGINS` di backend `.env`
- Pastikan `CLIENT_URL` sudah benar

### Frontend Issues

#### Vite Build Error
```
Error: Cannot find module
```
**Solusi:**
```bash
rm -rf node_modules package-lock.json
npm install
```

#### WebSocket Connection Failed
```
WebSocket connection failed
```
**Solusi:**
- Pastikan backend berjalan
- Cek `VITE_WS_URL` di frontend `.env`
- Periksa firewall/proxy settings

#### PWA Not Installing
**Solusi:**
- Pastikan HTTPS aktif (kecuali localhost)
- Cek `manifest.webmanifest` valid
- Clear browser cache
- Pastikan Service Worker registered

### Deployment Issues

#### PM2 App Crashed
```bash
pm2 logs blueocean-backend --lines 100
```
**Solusi:**
- Cek logs untuk error spesifik
- Pastikan environment variables sudah diset
- Restart: `pm2 restart blueocean-backend`

#### Nginx 502 Bad Gateway
**Solusi:**
- Cek backend berjalan: `pm2 status`
- Cek Nginx config: `sudo nginx -t`
- Cek logs: `sudo tail -f /var/log/nginx/error.log`

#### MongoDB Out of Memory
**Solusi:**
- Tambah swap space
- Upgrade server RAM
- Gunakan MongoDB Atlas

## 📊 Monitoring & Maintenance

### Monitoring dengan PM2

```bash
# Status aplikasi
pm2 status

# Logs real-time
pm2 logs blueocean-backend

# Monitoring dashboard
pm2 monit

# Restart aplikasi
pm2 restart blueocean-backend

# Stop aplikasi
pm2 stop blueocean-backend

# Delete dari PM2
pm2 delete blueocean-backend
```

### Database Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/oceanbluee" --out=/backup/$(date +%Y%m%d)

# Restore MongoDB
mongorestore --uri="mongodb://localhost:27017/oceanbluee" /backup/20241208
```

### Log Rotation

Buat file `/etc/logrotate.d/blueocean`:

```
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Jangan commit file `.env`
   - Gunakan secrets manager di production
   - Rotate JWT secret secara berkala

2. **Database**
   - Enable MongoDB authentication
   - Gunakan strong passwords
   - Restrict network access
   - Regular backups

3. **API Security**
   - Rate limiting
   - Input validation
   - SQL injection prevention (Mongoose handles this)
   - XSS protection

4. **HTTPS**
   - Always use HTTPS in production
   - HTTP Strict Transport Security (HSTS)
   - Secure cookies

5. **Dependencies**
   - Regular updates: `npm audit`
   - Fix vulnerabilities: `npm audit fix`

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan ikuti langkah berikut:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Coding Standards

- Gunakan ESLint untuk linting
- Follow Airbnb style guide
- Write meaningful commit messages
- Add tests untuk fitur baru
- Update dokumentasi
  
## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.IO](https://socket.io/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---
