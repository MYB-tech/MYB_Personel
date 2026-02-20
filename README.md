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

## Veritabanı Kurulumu (PostgreSQL + PostGIS)

Bu proje konum tabanlı doğrulama (Geofencing) için **PostGIS** eklentisine ihtiyaç duyar.

### Seçenek 1: Docker (Önerilen)
Eğer Docker yüklüyse, hiçbir kurulum yapmanıza gerek yoktur. `docker-compose.yml` dosyası PostGIS destekli PostgreSQL 16 imajını otomatik olarak yapılandırır.
```bash
docker compose up -d
```

### Seçenek 2: Manuel Kurulum
Eğer PostgreSQL'i yerel olarak kurmak isterseniz aşağıdaki adımları takip edin:

1. **PostgreSQL 16** sürümünü yükleyin.
2. İşletim sisteminize uygun **PostGIS** eklentisini (v3.4+) yükleyin.
3. Veritabanınızı oluşturun:
   ```sql
   CREATE DATABASE myb_personel;
   ```
4. Veritabanına bağlanın ve PostGIS eklentisini etkinleştirin:
   ```sql
   \c myb_personel;
   CREATE EXTENSION postgis;
   ```
5. `.env` dosyasındaki `DB_HOST`, `DB_PORT`, `DB_USER` ve `DB_PASSWORD` alanlarını kendi yerel kurulumunuza göre güncelleyin.

## Dizin Yapısı

```
MYB_Personel/
├── backend/          # NestJS API sunucusu
├── admin/            # React admin paneli
├── mobile/           # Flutter mobil uygulama
├── docker-compose.yml
└── .env.example
```
