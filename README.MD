# 📚 Perpustakaan Digital Berbasis Web Semantik

Sebuah aplikasi perpustakaan digital modern yang menggunakan teknologi Web Semantik untuk memberikan pengalaman pencarian dan rekomendasi yang lebih cerdas dan personal.

## 🌟 Fitur Utama

### 🔍 **Pencarian Semantik**

- Pencarian berbasis pemahaman konteks dan makna
- Ekspansi query otomatis dengan sinonim dan konsep terkait
- Highlighting hasil pencarian dengan entitas semantik
- Deteksi intent pencarian (pembelajaran, referensi, dll)

### 🤖 **Sistem Rekomendasi Cerdas**

- **Content-based Filtering**: Berdasarkan similarity semantik
- **Collaborative Filtering**: Berdasarkan preferensi user serupa
- **Hybrid Approach**: Kombinasi kedua metode
- Personalisasi berdasarkan rating dan interaksi user

### 🕸️ **Web Semantik & Knowledge Graph**

- Representasi data dalam format JSON-LD
- Vocabulari Schema.org untuk buku dan penulis
- Visualisasi hubungan antar entitas
- Relasi semantik antar buku dengan confidence score

### 📊 **Analytics & Insights**

- Dashboard analitik real-time
- Statistik penggunaan dan tren pencarian
- Visualisasi distribusi genre dan penulis
- Metrics performa sistem

## 🛠️ Teknologi yang Digunakan

### **Backend**

- **Node.js** dengan Express.js
- **PostgreSQL** untuk database utama
- **JSON-LD** untuk representasi semantik
- **Schema.org** vocabulary
- **Elasticsearch** (optional) untuk full-text search

### **Frontend**

- **React.js** dengan TypeScript
- **Ant Design** untuk UI components
- **Styled Components** untuk styling
- **Recharts** untuk visualisasi data
- **Framer Motion** untuk animasi

### **Database & Storage**

- **PostgreSQL** dengan ekstensi full-text search
- **Redis** (optional) untuk caching
- **Docker** untuk containerization

## 🚀 Instalasi & Setup

### **Prerequisites**

```bash
# Pastikan terinstall:
- Node.js (v16+)
- PostgreSQL (v12+)
- Git
- Docker & Docker Compose (optional)
```

### **1. Clone Repository**

```bash
git clone <repository-url>
cd digital-library
```

### **2. Setup Database**

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb digital_library

# Run migrations
psql -U postgres -d digital_library -f database/init.sql
```

### **3. Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Start development server
npm run dev
```

### **4. Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env sesuai kebutuhan

# Start development server
npm start
```

### **5. Docker Setup (Alternative)**

```bash
# Build dan jalankan semua services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📋 Environment Configuration

### **Backend (.env)**

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_library
DB_USER=postgres
DB_PASSWORD=your_password

# External API
EXTERNAL_DATA_URL=https://yunautama.xyz/serveran/data.json

# Security
JWT_SECRET=your-jwt-secret-key
```

### **Frontend (.env)**

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME="Perpustakaan Digital"
```

## 🧪 Testing

### **Automated Testing**

```bash
# Jalankan test script
chmod +x test.sh
./test.sh

# Manual API testing
curl http://localhost:3001/health
curl http://localhost:3001/api/books
curl -X POST http://localhost:3001/api/books/sync
```

### **Test Coverage**

- ✅ Database connectivity
- ✅ API endpoints functionality
- ✅ Frontend accessibility
- ✅ Data synchronization
- ✅ Semantic search
- ✅ Recommendation system
- ✅ Security measures

## 📖 API Documentation

### **Books Endpoints**

#### `GET /api/books`

Mengambil daftar semua buku dengan pagination dan filter.

**Query Parameters:**

- `page` (number): Halaman data (default: 1)
- `limit` (number): Jumlah data per halaman (default: 10)
- `genre` (string): Filter berdasarkan genre
- `author` (string): Filter berdasarkan penulis
- `year` (number): Filter berdasarkan tahun terbit

**Response:**

```json
{
  "books": [
    {
      "id": 1,
      "title": "Mahir Web Semantic",
      "author": "Prof. Dhema Subagja",
      "isbn": "978-3-16-148410-0",
      "publication_year": 2023,
      "publisher": "Matahari",
      "page_count": 350,
      "genre": "Techno",
      "description": "Deskripsi buku...",
      "cover_url": "https://...",
      "semantic_data": { "entities": {...} }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### `GET /api/books/search?query={query}`

Pencarian semantik buku berdasarkan query.

**Response:**

```json
{
  "query": "programming",
  "results": [
    {
      "...book_data",
      "semantic_entities": {
        "topics": ["programming", "web development"],
        "concepts": ["tutorial", "guide"]
      },
      "search_intent": "learning"
    }
  ]
}
```

#### `GET /api/books/recommendations`

Mendapatkan rekomendasi buku.

**Query Parameters:**

- `type` (string): Jenis rekomendasi (content|collaborative|hybrid|popular)
- `userId` (string): ID user untuk personalisasi
- `bookId` (number): ID buku untuk content-based

#### `POST /api/books/rate`

Memberikan rating pada buku.

**Body:**

```json
{
  "userId": "user123",
  "bookId": 1,
  "rating": 5
}
```

#### `GET /api/books/analytics`

Mendapatkan data analytics dan statistik.

#### `GET /api/books/knowledge-graph`

Mendapatkan data knowledge graph untuk visualisasi.

## 🎨 Komponen Frontend

### **Struktur Komponen**

```
src/
├── components/
│   ├── Layout/
│   │   └── Layout.js          # Layout utama dengan navigation
│   └── BookCard/
│       └── BookCard.js        # Komponen kartu buku
├── pages/
│   ├── HomePage.js            # Halaman beranda
│   ├── SearchPage.js          # Halaman pencarian
│   ├── BookDetailPage.js      # Detail buku
│   ├── RecommendationsPage.js # Halaman rekomendasi
│   └── AnalyticsPage.js       # Dashboard analytics
├── services/
│   └── apiService.js          # Service untuk API calls
└── styles/
    └── GlobalStyle.js         # Global styling dan theme
```

### **Fitur UI/UX**

- 🎨 **Glassmorphism Design**: Modern dengan efek blur dan transparansi
- 📱 **Responsive Design**: Optimal di semua perangkat
- ⚡ **Smooth Animations**: Menggunakan Framer Motion
- 🔍 **Real-time Search**: Debounced search dengan live suggestions
- 💾 **Persistent State**: Local storage untuk preferensi user
- 🌙 **Dark/Light Mode**: Toggle tema (coming soon)

## 🧠 Implementasi Web Semantik

### **JSON-LD Structure**

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "book": "Book",
    "author": "author",
    "publisher": "publisher"
  },
  "@type": "Book",
  "@id": "https://perpustakaan.id/books/1",
  "name": "Mahir Web Semantic",
  "author": {
    "@type": "Person",
    "name": "Prof. Dhema Subagja"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Matahari"
  }
}
```

### **Semantic Relations**

- `similarTo`: Buku dengan konten serupa
- `writtenBy`: Relasi penulis-buku
- `publishedBy`: Relasi penerbit-buku
- `hasGenre`: Kategori/genre buku
- `relatedTo`: Topik terkait

### **Entity Extraction**

Sistem mengekstrak entitas semantik dari:

- Judul buku
- Deskripsi buku
- Genre dan metadata
- Query pencarian user

## 📊 Sistem Rekomendasi

### **Content-Based Filtering**

```javascript
// Menghitung similarity berdasarkan:
- Genre (30% weight)
- Author (40% weight)
- Publisher (10% weight)
- Publication year (20% weight)

similarity_score = 0.3 * genre_match +
                  0.4 * author_match +
                  0.1 * publisher_match +
                  0.2 * year_proximity
```

### **Collaborative Filtering**

- Mencari user dengan preferensi serupa
- Merekomendasikan buku yang disukai user serupa
- Menggunakan matrix factorization untuk skalabilitas

### **Hybrid Approach**

Menggabungkan kedua metode dengan weight:

- 60% Content-based
- 40% Collaborative filtering

## 🔧 Troubleshooting

### **Masalah Umum**

#### Database Connection Error

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U postgres -d digital_library -c "SELECT 1;"
```

#### CORS Error

```javascript
// Pastikan FRONTEND_URL di backend .env sesuai
FRONTEND_URL=http://localhost:3000
```

#### Port Already in Use

```bash
# Kill process on port 3000/3001
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9
```

#### Missing Dependencies

```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

### **Performance Issues**

#### Slow API Response

- Check database indexes
- Monitor query execution time
- Consider Redis caching
- Optimize semantic processing

#### High Memory Usage

- Limit concurrent connections
- Implement pagination properly
- Use streaming for large datasets

## 🚀 Deployment

### **Production Deployment**

#### Using Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Monitor
docker-compose logs -f
```

#### Manual Deployment

```bash
# Backend
cd backend
npm install --production
npm run build
pm2 start ecosystem.config.js

# Frontend
cd frontend
npm run build
# Serve build folder dengan nginx/apache
```

### **Environment Variables (Production)**

```env
NODE_ENV=production
DB_HOST=your-db-host
DB_PASSWORD=strong-password
JWT_SECRET=complex-jwt-secret
FRONTEND_URL=https://your-domain.com
```

## 📈 Monitoring & Maintenance

### **Logging**

- API access logs dengan Morgan
- Error tracking dan alerting
- Performance metrics collection

### **Database Maintenance**

```sql
-- Optimize database
VACUUM ANALYZE;

-- Reindex untuk performance
REINDEX DATABASE digital_library;

-- Monitor slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC;
```

### **Regular Tasks**

- Backup database harian
- Sync data dari external API
- Monitor disk space dan memory
- Update dependencies secara berkala

## 🤝 Contributing

### **Development Workflow**

1. Fork repository
2. Create feature branch
3. Implement changes dengan tests
4. Run test suite
5. Submit pull request

### **Code Standards**

- ES6+ JavaScript/TypeScript
- ESLint untuk code quality
- Prettier untuk formatting
- Semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Developer**: [Neir Laverna]
- **Frontend Developer**: [Neir Laverna]
- **Database Designer**: [Neir Laverna]
- **DevOps Engineer**: [Neir Laverna]

## 📞 Support

Untuk bantuan dan dukungan:

---

**Dibuat dengan ❤️ untuk meningkatkan pengalaman perpustakaan digital di Indonesia**
