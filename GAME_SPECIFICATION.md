# Proje Dokümantasyonu: Mobil Tıklama Oyunu (Clicker Game)
## Hedef Platformlar: Android & iOS (Cross-Platform / Öneri: React Native veya Flutter)

Bu doküman, yapay zeka destekli kod üreticileri (Claude Code vb.) için bir kılavuzdur. Sistem mimarisi, ekran tasarımları, durum yönetimi (State Management) ve oyun mekanikleri aşağıda detaylandırılmıştır.

---

## 1. Genel Mimari ve Durum Yönetimi (State Management)

Uygulama genelinde kalıcı (persistent) bir state yönetimi kullanılmalıdır (Örn: React Native için `Zustand` + `MMKV` veya Flutter için `HydratedBLoC`). Oyuncu çıkış yaptığında veriler kaybolmamalıdır.

### Global State Veri Yapısı
*   `nickname`: String (İlk girişte alınacak, boş bırakılamaz)
*   `level`: Integer (Başlangıç: 1)
*   `xp`: Integer (Başlangıç: 0)
*   `tikTik`: Integer (Başlangıç: 0)
*   `clickPower`: Integer (Başlangıç: 1, Mağazadan artırılabilir, Maks: 10)
*   `maxMultiTouch`: Integer (Başlangıç: 2, Mağazadan artırılabilir, Maks: 5 veya daha fazla)
*   `activeMonsterId`: Integer (Başlangıç: 1)
*   `unlockedMonsters`: Array [1]
*   `unlockedAchievements`: Array (Kazanılan ama talep edilmeyenler için `id` ve `claimed` durumu)
*   `offlineProgression`: { `lastSavedTimestamp`: Timestamp, `storedXp`: Integer, `storedTikTik`: Integer }
*   `language`: String ('tr' | 'en')

---

## 2. Navigasyon ve Ekran Yapısı (Bottom Navigation)

Ekranın altında sabit bir Navigasyon Barı (Bottom Bar) yer alacaktır. 5 ana sekme soldan sağa şu sıralamayla dizilecektir:
1. **Mağaza (Shop)**
2. **Profil (Profile)**
3. **Canavar (Monster) [Ana Ekran]**
4. **Başarılar (Achievements)**
5. **Ayarlar (Settings)**

> **Giriş Kontrolü (Auth Gate):** Eğer global state içinde `nickname` tanımlı değilse, oyun doğrudan bir "Hoş Geldiniz" ekranı açmalı, kullanıcıdan nickname almadan ana sekmeleri göstermemelidir.

---

## 3. Sekme Detayları ve Mekanikler

### Sekme 1: Canavar (Monster) - Ana Oyun Ekranı
Bu sekme oyunun çekirdek döngüsüdür (Core Loop).

*   **Tıklama ve Ödül Mekaniği:**
    *   Ekranda aktif canavarın görseli ve üzerinde Can Barı (HP) yer alır.
    *   Her dokunuş canavardan `clickPower` kadar can götürür.
    *   **Her 10 başarılı vuruş (dokunuş):** Oyuncuya `+5 TıkTık` ve `+1 XP` kazandırır.
*   **Çoklu Dokunuş (Multi-Touch) Sınırı:**
    *   İlk etapta ekrana aynı anda en fazla **2 parmakla** tıklanabilir.
    *   Aynı anda basılan parmak sayısı `maxMultiTouch` değerinden büyükse, sistem sadece izin verilen maksimum dokunuşu işleme almalıdır.
*   **Canavarlar ve Seviye Kilitleri:**
    *   Toplamda 10 adet canavar bulunacaktır. Canavarlar toplam XP miktarına göre doğrusal/kademeli olarak açılır:
        *   *Canavar 1:* Seviye 1 (0 XP)
        *   *Canavar 2:* Seviye 2 (100 XP)
        *   *Canavar 3:* Seviye 3 (1000 XP)
        *   *Canavar 4 ve sonrası:* Logaritmik/Doğrusal artış ölçeği (Örn: Seviye x 2000 XP).
*   **Tuzak Mekaniği: Zararlı Baloncuklar (Bubbles)**
    *   Canavarın etrafındaki rastgele koordinatlarda, küçük boyutlarda baloncuklar belirecektir.
    *   **Aynı andaki Baloncuk Sayısı:** Aktif canavarın seviyesine eşittir (Canavar Lvl 1 = 1 baloncuk, Lvl 2 = 2 baloncuk...).
    *   **Ceza Sistemi:** Oyuncu bu baloncuklara tıkladığında TıkTık kaybeder.
    *   **Ceza Formülü:** $\text{Kaybedilen TıkTık} = 10 \times \text{Aktif Canavar Seviyesi}$.
    *   Baloncuklar belirli periyotlarla (örn. 3-5 saniyede bir) yer değiştirmeli veya kaybolup yeniden doğmalıdır.

### Sekme 2: Mağaza (Shop)
Mağaza kendi içinde iki alt sekmeye (Tab) ayrılır:

1.  **TıkTık ile Alınanlar (Click Power & Mechanics):**
    *   *Geliştirme:* Tıklama Gücü (`clickPower`). 1 dokunuşun kaç dokunuş sayılacağını belirler.
    *   *Seviyeler:* Seviye 1'den 10'a kadar yükseltilebilir.
    *   *Maliyet:* İlk seviye 500 TıkTık'tır ve her seviyede katlanarak/doğrusal artar.
    *   *Ekstra Geliştirme:* Aynı anda tıklanabilecek parmak sayısı (`maxMultiTouch`) artırımı.
2.  **XP ile Alınanlar (Idle Otomasyon Sistemleri):**
    *   Uygulama kapalıyken (arka planda) canavara otomatik vuran 3 farklı sistem satın alınabilir.
    *   **Kritik Kural:** Bu otomatik sistemler **asla baloncuklara vurmaz/hasar almaz**.
    *   *Sistem 1:* **"Tembel Hamster"** (Düşük hızda otomatik tıklama)
    *   *Sistem 2:* **"Kahve Bağımlısı Yazılımcı"** (Orta hızda otomatik tıklama)
    *   *Sistem 3:* **"Yapay Zeka Amelesi"** (Yüksek hızda otomatik tıklama)
    *   *Maliyet:* Çok yüksek XP miktarları ile satın alınabilirler.
    *   **Çevrimdışı İlerleme (Offline Progress Bar):** Oyuncu uygulamadan çıkıp (Örn: Saat 01:00) geri girdiğinde (Örn: Saat 03:00), geçen süre hesaplanır. Biriken TıkTık ve XP puanları Canavar sekmesinde veya bu sekmede bir **İlerleme Çubuğu (Bar)** olarak birikir. Oyuncu bara tıkladığında ödülleri ana kasasına aktarır.

### Sekme 3: Profil (Profile)
Kullanıcının mevcut durumunu özetleyen temiz bir arayüzdür.
*   **Görünmesi Gereken Veriler:**
    *   Kullanıcı Adı (Nickname)
    *   Mevcut Seviye (Level)
    *   Güncel TıkTık Bakiyesi
    *   Mevcut XP ve Sonraki Seviyeye Kalan XP Barı

### Sekme 4: Başarılar (Achievements)
Canavarları geçmeye ve belirli kilometre taşlarına ulaşmaya yönelik kilitli listeleme ekranı.
*   **Durum Geçişleri:**
    *   *Kilitli Durum:* Başarım gri renktedir ve detayları gizlidir/kilitlidir.
    *   *Kazanıldı Durumu:* Şartlar sağlandığında kilit sembolü **Ünlem İşaretine (!)** dönüşür.
    *   *Talep Edildi Durumu:* Kullanıcı ünleme tıkladığında ödülü alır, ünlem kaybolur ve başarım "Tamamlandı" olarak işaretlenir.
*   **Ödül Ölçeği:** Başarım zorluğuna/seviyesine göre yüksek TıkTık ve canavar seviyesiyle doğru orantılı düşük XP kazandırır.

### Sekme 5: Ayarlar (Settings)
Uygulama tercihlerinin yönetildiği ekrandır.
*   **Dil Seçenekleri:** Türkçe ve İngilizce (Localizasyon dosyaları `tr.json` ve `en.json` olarak ayrılmalıdır). Tüm arayüz bu seçime göre dinamik değişmelidir.
*   **Verileri Sıfırla (Hard Reset):** Kullanıcı tüm ilerlemesini (puanlar, seviyeler, nickname dahil) sıfırlayarak oyunu ilk yükleme anına döndürebilmelidir (Onay mekanizmalı bir pop-up ile çalışmalıdır).

---

## 4. Teknik Kodlama Talimatları (AI İçin İpuçları)

1.  **Dokunmatik Alan Hassasiyeti:** Canavar alanına yapılan tıklamalarda Multi-touch event'leri doğru yakalanmalı, baloncukların tıklama alanları (hitbox) küçük tutulmalıdır.
2.  **Zamanlayıcı (Timer) Güvenliği:** Arka plan hesaplamalarında cihaz saatini manipüle etmeye (saati ileri alma hilesi) karşı önlem olarak, çevrimdışı geçen süre sunucu saati veya güvenli yerel asenkron döngülerle doğrulanmaya açık yazılmalıdır.
3.  **UI/UX:** Sekme geçişleri akıcı olmalı, baloncukların rastgele koordinatlarda spawn olması animasyonla desteklenmelidir.