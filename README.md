# MYB Saha Operasyon Yönetimi

Apartman ve site yönetimlerinde personel görev takibi, konum doğrulama ve WhatsApp bildirimi sistemi.

## Mimari

| Katman | Teknoloji |
|--------|-----------|
| Backend | NestJS + TypeScript |
| Veritabanı | PostgreSQL 16 + PostGIS 3.4 |
| Kuyruk | Redis 7 + BullMQ |
| Admin Panel | React + Tailwind CSS + Shadcn UI |
| Mobil | Flutter |
| WhatsApp | Meta Cloud API |

## Hızlı Başlangıç

```bash
# 1. Ortam değişkenlerini kopyala
cp .env.example .env

# 2. Veritabanı ve Redis'i başlat
docker compose up -d

# 3. Backend'i başlat
cd backend && npm install && npm run start:dev

# 4. Admin paneli başlat
cd admin && npm install && npm run dev
```

## Dizin Yapısı

```
MYB_Personel/
├── backend/          # NestJS API sunucusu
├── admin/            # React admin paneli
├── mobile/           # Flutter mobil uygulama
├── docker-compose.yml
└── .env.example
```
