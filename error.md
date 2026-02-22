# MYB Saha Operasyon Yönetimi - Hata ve Eksiklik Raporu

Bu rapor, sistemin baştan aşağı incelenmesi sonucunda tespit edilen mantık hatalarını, mimari eksiklikleri ve yazılım kusurlarını içermektedir.

## 1. Kritik Mimari Hatalar

### 1.1. Tekrarlanan Görev (Recurring Task) Mantığı Eksikliği
Sistemde `Task` entity'si hem görev tanımını (hangi günler, hangi saatte) hem de görevin o anki durumunu (PENDING, COMPLETED vb.) tutmaktadır.
- **Hata:** Bir görev bir kez tamamlandığında (`COMPLETED`), veritabanında o şekilde kalır. Gelecek hafta veya bir sonraki görev gününde sistem bu görevi tekrar "Bekliyor" durumuna getirmez.
- **Sonuç:** Personel bir görevi hayatında sadece 1 kez yapabilir. İkinci kez yapmak istediğinde backend `startTask` metodunda "Bu görev zaten başlatılmış veya tamamlanmış" hatası verecektir.
- **Öneri:** `TaskSchedule` (Tanım) ve `TaskExecution` (Her bir gerçekleşme için ayrı satır) şeklinde iki ayrı tablo kullanılmalı veya günlük/haftalık bir "reset" cron job'ı eklenmelidir.

### 1.2. Mobil Uygulamada "Görevi Tamamla" Özelliği Yok
Mobil uygulamadaki `TaskDetailScreen` ve `TaskListScreen` incelendiğinde sadece "GÖREVİ BAŞLAT" butonu olduğu görülmüştür.
- **Hata:** Görevi bitirmek için bir buton veya backend'deki `completeTask` endpoint'ini çağıran bir servis metodu bulunmamaktadır.
- **Sonuç:** Başlatılan görevler sonsuza kadar `IN_PROGRESS` veya `LATE` durumunda kalır.

---

## 2. İş Mantığı (Business Logic) Hataları

### 2.1. Görev Tipi (Task Type) Uyuşmazlığı
- **Hata:** Admin panelinde yeni görev oluşturulurken `type` alanına "Çöp Toplama" gibi lokalize isimler kaydedilmektedir. Ancak mobil uygulama ve WhatsApp işlemcisi (`WhatsappProcessor`) "garbage", "cleaning" gibi kodlar (codes) beklemektedir.
- **Sonuç:**
  - Mobil uygulamada ikonlar doğru gözükmez (default ikona düşer).
  - WhatsApp bildirimlerinde görev tanımı bulunamaz (`findByCode` başarısız olur) ve mesaj şablonları eşleşmez.

### 2.2. Personel Görev Listesi Filtreleme Hatası
- **Hata:** Backend'deki `findByStaff` metodu, personele atanmış tüm görevleri gün ayrımı yapmaksızın döndürmektedir.
- **Sonuç:** Personel Salı günü uygulamayı açtığında, sadece Pazartesi günü yapması gereken görevleri de "Bugünkü Görevler" listesinde görür.

### 2.3. Görev Durumu (Status) Karmaşası
- **Hata:** `LATE` (Gecikti) durumu hem "Geç Başlatılan" hem de "Geç Tamamlanan" görevler için kullanılmaktadır.
- **Sonuç:** Bir görevin o an devam mı ettiği (started late) yoksa bitti mi (finished late) olduğu sadece `status` alanına bakarak anlaşılamaz.

### 2.4. Gecikme (Lateness) Tanımı Eksikliği
- **Hata:** `is_late` bayrağı sadece görev *başlatılırken* kontrol edilmektedir.
- **Sonuç:** Zamanında başlatılan ancak bitiş saatinden sonra tamamlanan görevler "gecikmiş" olarak işaretlenmez.

### 2.5. Excel İçe Aktarma (Import) Davranışı
- **Hata:** `importUnits` metodu, yeni bir Excel yüklendiğinde o apartmandaki tüm mevcut sakinleri siler (`delete`).
- **Sonuç:** Mevcut verilerin üzerine ekleme (append) yapılamaz, her seferinde tam liste yüklenmesi gerekir. Hatalı bir yüklemede tüm veriler kaybolur.

---

## 3. WhatsApp Entegrasyon Hataları

### 3.1. Telefon Numarası Formatı
- **Hata:** Meta Cloud API telefon numaralarını uluslararası formatta (ör: `90532...`) bekler. Backend'de sadece rakam dışı karakterler temizlenmektedir.
- **Sonuç:** Eğer Excel'de numara `0532...` şeklinde kayıtlıysa, Meta API bu numarayı reddedecektir. Ülke kodu (90) kontrolü ve eklemesi yapılmamaktadır.

### 3.2. Rate Limiting ve Performans
- **Hata:** `WhatsappProcessor` içerisinde `Promise.allSettled` ile tüm apartman sakinlerine aynı anda istek atılmaktadır.
- **Sonuç:** Çok daireli (yüzlerce sakin) bir apartmanda Meta API rate limitlerine takılma ve sunucu kaynaklarının anlık tükenmesi riski vardır.

### 3.3. Sakin Seçim Mantığı
- **Hata:** Sistem dairede kiracı varsa ona, yoksa ev sahibine mesaj atar. Eğer bir birimde ikisi de yoksa o birim sessizce geçilir. Apartman bazında hiç sakin yoksa sadece log atılır.

---

## 4. Veritabanı ve Teknik Eksiklikler

### 4.1. Eksik İndeksler
- **Hata:** `apartment_id`, `staff_id`, `task_id` gibi yabancı anahtar (foreign key) alanlarında `Index` tanımlanmamıştır.
- **Sonuç:** Veri miktarı arttıkça görev listeleme ve dashboard sorguları ciddi oranda yavaşlayacaktır.

### 4.2. Kullanılmayan Statü: `OUT_OF_RANGE`
- **Hata:** `TaskStatus` enum içerisinde `OUT_OF_RANGE` tanımlanmış ancak kod içerisinde hiçbir yerde kullanılmamıştır. Geofencing hatası durumunda sadece Exception fırlatılmaktadır.

### 4.3. Task Definition Seed Eksikliği
- **Hata:** `TaskDefinitionsService` içerisinde `seed()` metodu bulunmasına rağmen `main.ts` veya `AppModule` içerisinde çağrılmamaktadır. İlk kurulumda görev tanımları boş gelir.

---

## 5. UI/UX ve Güvenlik Eksiklikleri

### 5.1. Admin Panelinde Sabit Değerler
- **Hata:** `Tasks.tsx` sayfasında görev tipleri dropdown içerisinde hardcoded (sabit) yazılmıştır.
- **Sonuç:** `TaskDefinitions` sayfasında eklenen yeni bir görev tipi, görev atama ekranında görünmez.

### 5.2. Google Maps API Anahtarı
- **Hata:** `VITE_GOOGLE_MAPS_API_KEY` eksik olduğunda Admin panelindeki harita bileşeni kırılarak tüm sayfa deneyimini etkileyebilir.

### 5.3. Mobil Uygulama Çıkış Yapma (Logout)
- **Hata:** `_logout` metodu `prefs.clear()` yaparak tüm ayarları siler. Eğer ilerde başka kalıcı ayarlar eklenirse onlar da silinecektir. Sadece `access_token` silinmesi daha güvenlidir.

### 5.4. Dashboard İstatistikleri
- **Hata:** `getStats` sorgusu geçmişteki tüm "is_late" görevleri saymaktadır.
- **Sonuç:** Dashboard'daki "Geciken Görevler" sayısı gün geçtikçe kümülatif olarak artacak, sadece bugünün gecikenlerini göstermeyecektir.
