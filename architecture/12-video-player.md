# MNREELS - Видео Player & Хадгалалт

## 1. Видео хадгалалт — Cloudflare R2 + ffmpeg

### Яагаад Cloudflare R2?
- **Egress (гарах traffic) ҮНЭГҮЙ** — бусад cloud-ууд TB бүрт $87+ авдаг
- **10GB хүртэл ҮНЭГҮЙ** — MVP-д хангалттай
- AWS S3-тай нийцтэй API
- Монголд хурдан: Cloudflare-ийн edge network Ази даяар

### Яагаад Cloudflare Stream АШИГЛАХГҮЙ?
```
Stream = $5/1000 мин хадгалалт + $1/1000 мин delivery
Бид live stream хийхгүй, зөвхөн upload хийсэн видео үзнэ.

R2 + ffmpeg = хадгалалт $0.015/GB + egress ҮНЭГҮЙ + VPS $6/сар
  → 13 дахин хямд!
```

### Хадгалалтын бүтэц
```
Cloudflare R2
    │
    ├── /originals/           (Эх файл)
    │     └── {video_id}.mp4
    │
    ├── /transcoded/          (HLS хөрвүүлсэн)
    │     └── {video_id}/
    │           ├── master.m3u8        (playlist)
    │           ├── 480p/
    │           │     ├── stream.m3u8
    │           │     ├── segment-001.ts
    │           │     ├── segment-002.ts
    │           │     └── ...
    │           ├── 720p/
    │           │     └── ...
    │           └── 1080p/
    │                 └── ...
    │
    └── /thumbnails/          (Зураг)
          └── {video_id}.jpg
```

---

## 2. Transcode урсгал (ffmpeg + VPS)

### Бүтэц
```
Бүтээгч upload → R2 (эх файл) → Webhook → VPS (ffmpeg) → R2 (HLS файлууд)
                                                               │
                                                               ▼
                                              Хэрэглэгч R2-аас шууд үзнэ
                                              (egress ҮНЭГҮЙ)
```

### VPS дээрх ffmpeg ажиллагаа
```bash
# Эх файлыг R2-аас татна
# 3 чанарт хөрвүүлнэ:

# 480p (мобайл, удаан интернет)
ffmpeg -i original.mp4 \
  -vf scale=-2:480 -c:v h264 -b:v 1M \
  -c:a aac -b:a 128k \
  -hls_time 4 -hls_segment_filename '480p/segment-%03d.ts' \
  480p/stream.m3u8

# 720p (ердийн)
ffmpeg -i original.mp4 \
  -vf scale=-2:720 -c:v h264 -b:v 2.5M \
  -c:a aac -b:a 128k \
  -hls_time 4 -hls_segment_filename '720p/segment-%03d.ts' \
  720p/stream.m3u8

# 1080p (өндөр чанар)
ffmpeg -i original.mp4 \
  -vf scale=-2:1080 -c:v h264 -b:v 5M \
  -c:a aac -b:a 192k \
  -hls_time 4 -hls_segment_filename '1080p/segment-%03d.ts' \
  1080p/stream.m3u8

# master.m3u8 (adaptive bitrate playlist)
# → Browser автомат шилжинэ
```

### Transcode VPS
```
DigitalOcean Droplet: $6/сар (1 vCPU, 1GB RAM)
  - 10 минутын видео transcode хийхэд ~3-5 мин
  - Queue system: Bull + Redis
  - Нэг дор олон видео ирвэл дараалалд оруулна
  - Өсөхөд: $12/сар (2 vCPU) эсвэл олон worker
```

---

## 3. Бүтээгчийн Upload урсгал

```
Бүтээгч "Видео оруулах" дарна
    │
    ▼
POST /api/v1/upload/request
    │  → R2-д presigned upload URL үүсгэнэ
    │  → { upload_url: "https://r2.mnreels.mn/...", upload_id: "xxx" }
    │
    ▼
Browser → R2 руу ШУУД upload (tus protocol)
    │
    │  ✓ Манай сервер дамжихгүй → хурдан
    │  ✓ Хэрэглэгч → R2 шууд → сервер ачаалал 0
    │  ✓ Progress bar харуулна
    │  ✓ Resume боломжтой (тасарсан бол үргэлжлүүлнэ)
    │
    ▼
Upload дуусмагц → POST /api/v1/upload/complete
    │  → { upload_id, series_id, title, episode_number }
    │
    ▼
VPS дээрх ffmpeg transcode эхэлнэ
    │  → 3-5 минутын дотор бэлэн
    │  → DB-д status: "transcoding" → "ready"
    │
    ▼
2 цагийн модераци цонх
    │
    ├── Admin зөвшөөрөл → Нийтлэх
    └── 2 цаг → Автомат нийтлэх
```

### Direct Upload — яагаад?
```
✗ БУРУУ (сервер дамжуулах):
  Бүтээгч → Манай сервер → R2
  - Сервер RAM/CPU ачаалал ихтэй
  - 2x bandwidth зарцуулна
  - Upload удаан

✓ ЗӨВ (шууд upload):
  Бүтээгч → R2 (шууд)
  - Манай сервер зөвхөн URL үүсгэнэ
  - 0 bandwidth зарцуулна
  - Upload хурдан
  - Vercel-ийн 4.5MB body limit-д орохгүй
```

### tus Protocol (Resumable Upload)
- Том файл жижиг хэсгүүдэд (chunk) хуваагдана
- Интернет тасарвал тасарсан газраасаа үргэлжлүүлнэ
- Progress bar үнэн зөв харуулна
- Upload дундаас cancel хийж болно

---

## 4. Video Player UI

### Full-screen вертикал Player
```
┌────────────────────────┐
│                        │
│                        │
│     ┌──────────┐       │
│     │          │       │
│     │  ВИДЕО   │       │
│     │  ТОГЛОЖ  │  ♡    │
│     │  БАЙНА   │  💬   │
│     │          │  ↗    │
│     └──────────┘       │
│                        │
│  ▶ 2:35 ━━━━━━━━ 8:20 │
│                        │
│  Б. Батболд             │
│  Хар шөнө • Анги 5     │
│  #drama #thriller       │
│                        │
│ [Home] [Search] [🎫] [Me]│
└────────────────────────┘

Дээш swipe → Дараагийн анги/видео
Доош swipe → Өмнөх видео
Нэг товш → Play/Pause
Давхар товш → Like ❤️
```

### Player-ийн features
| Feature | Тайлбар |
|---------|---------|
| **Auto-play** | Видео нээмэгц тоглоно |
| **Swipe** | Дээш swipe → дараагийн видео, smooth transition |
| **Progress bar** | Доод талд нимгэн шугам, чирж болно |
| **Play/Pause** | Нэг товшилтоор |
| **Double-tap Like** | Зүүн/баруун талд хоёр товш → Like анимац |
| **Mute/Unmute** | Дууны товч |
| **Fullscreen** | Хэвтээ горимд эргүүлж болно |
| **Speed** | 1x, 1.25x, 1.5x, 2x хурдаар үзэх |
| **Quality** | Auto / 480p / 720p / 1080p сонголт |
| **Picture-in-Picture** | Жижиг цонхонд харуулах |

---

## 5. HLS Adaptive Bitrate — Тасалдалгүй үзэх

### HLS (HTTP Live Streaming) гэж юу?
```
Видео файлыг жижиг хэсгүүдэд (segment) хуваана:
  master.m3u8 (playlist файл)
    ├── 480p/stream.m3u8
    │     ├── segment-001.ts (4 секунд)
    │     ├── segment-002.ts (4 секунд)
    │     └── ...
    ├── 720p/stream.m3u8
    └── 1080p/stream.m3u8

Browser нэг бүтэн файл татахгүй →
  Жижиг хэсгүүдийг дараалан татна →
  Ингэснээр buffer хурдан дүүрнэ →
  Тасалдалгүй тоглоно
```

### Adaptive Bitrate — Автомат чанар
```
Хэрэглэгчийн интернет хурд:

  Хурдан (10+ Mbps)  → 1080p тоглоно
  Дунд (3-10 Mbps)   → 720p тоглоно
  Удаан (1-3 Mbps)   → 480p тоглоно
  Маш удаан (<1 Mbps) → 480p, buffer хийнэ

  Хурд өөрчлөгдвөл → Автомат чанар солино
  Хэрэглэгч мэдэхгүй → Видео тасалдахгүй
```

### R2 + HLS.js integration
```javascript
import Hls from 'hls.js';

// R2-аас авсан HLS URL (signed)
const streamUrl = "https://r2.mnreels.mn/transcoded/{video_id}/master.m3u8?token=xxx&expires=xxx";

const video = document.getElementById('video');

if (Hls.isSupported()) {
  const hls = new Hls({
    maxBufferLength: 10,        // 10 секунд урьдчилж татна
    maxMaxBufferLength: 30,     // Хамгийн ихдээ 30 секунд buffer
    startLevel: -1,             // Автомат чанар сонголт
    capLevelToPlayerSize: true, // Дэлгэцийн хэмжээнд тохируулна
  });
  hls.loadSource(streamUrl);
  hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  // Safari нь HLS native дэмждэг
  video.src = streamUrl;
}
```

---

## 6. Pre-loading стратеги — Хүлээлтгүй swipe

### Дараагийн 2 видеог урьдчилж бэлдэх
```
Одоо үзэж байгаа: Видео #5
    │
    ├── Видео #6 — metadata + эхний 3 сек БЭЛЭН
    ├── Видео #7 — metadata БЭЛЭН
    └── Видео #8+ — Swipe хийхэд л татна

Хэрэглэгч #5-аас #6 руу swipe хийхэд:
  → #6 ШУУД тоглоно (аль хэдийн бэлэн)
  → #7 эхний 3 сек татаж эхэлнэ
  → #8 metadata татна
```

### Яагаад зөвхөн 2 видео?
- **RAM хэмнэнэ**: Олон видео preload хийвэл утас удаашрана
- **Data хэмнэнэ**: Хэрэглэгч үзэхгүй видео татахгүй
- **Хурдан**: 2 видео preload хангалттай smooth

### Feed алгоритм — batch-ээр авна
```
GET /api/v1/videos/feed?page=1&limit=10

→ 10 видеоны мэдээлэл нэг дор авна
→ Эхний 2-ын HLS URL-ийг preload
→ Хэрэглэгч 8-д хүрэхэд дараагийн 10-ыг авна
→ Хэзээ ч "дуусахгүй" мэдрэмж
```

---

## 7. Видео хамгаалалт (Security)

### R2 Signed URLs
```
Хэрэглэгч кино үзэхээр дарна
    │
    ▼
Тасалбар хүрэлцэх үү? → Тийм
    │
    ▼
Сервер signed URL үүсгэнэ (хугацаатай)
    │  → URL зөвхөн 4 цаг хүчинтэй
    │  → Cloudflare Workers-ээр IP шалгалт
    │
    ▼
Browser зөвхөн энэ URL-ээр тоглуулна
    │
    ▼
4 цагийн дараа URL хүчингүй болно
```

### Хамгаалалтын давхаргууд
| Давхарга | Хамгаалалт |
|----------|-----------|
| **Signed URLs** | URL хугацаатай (4 цаг) |
| **Token validation** | HLS URL авахад JWT шалгана |
| **Hotlink protection** | Зөвхөн mnreels.mn домэйнээс тоглуулна |
| **Cloudflare WAF** | Bot, scraper хориглоно |
| **Download хориг** | Right-click disable, video src нуух |

### Бодит байдал
```
⚠️ 100% хамгаалалт БАЙХГҮЙ
   - Screen record хийж болно
   - Browser dev tools-оор URL олж болно

✓ Гэхдээ:
   - Ихэнх хэрэглэгч ийм зүйл хийхгүй
   - Энэ нь Netflix ч адилхан тулгардаг асуудал
   - Signed URL + token хангалттай сайн хамгаалалт
   - 1 анги 100₮ учир хулгайлах сэдэл бага
```

---

## 8. Зардлын тооцоо (R2 + ffmpeg)

### MVP зардал (эхний үе)
```
50 видео × 500MB = 25GB эх файл
50 видео × 1.5GB (3 чанар HLS) = 75GB transcoded
Нийт: 100GB хадгалалт

R2 хадгалалт:
  10GB үнэгүй
  90GB × $0.015 = $1.35/сар

R2 egress (хэрэглэгч үзэх):
  ҮНЭГҮЙ ✓

VPS (ffmpeg transcode):
  DigitalOcean: $6/сар

═══════════════════════════
MVP нийт: ~$7.35/сар (~₮25,700)
```

### Өсөлтийн тооцоо
```
500 видео (1TB):     R2 $15 + VPS $6   = $21/сар   (~₮73,500)
2,000 видео (4TB):   R2 $60 + VPS $12  = $72/сар   (~₮252,000)
10,000 видео (20TB): R2 $300 + VPS $24 = $324/сар  (~₮1,134,000)
```

### Ашгийн тооцоо
```
Өдөрт 500 үзэлт:
  Орлого (15%):  225,000₮/сар
  Зардал:         25,700₮/сар
  Цэвэр ашиг:   199,300₮ ✅

Өдөрт 1,000 үзэлт:
  Орлого (15%):  450,000₮/сар
  Зардал:         25,700₮/сар
  Цэвэр ашиг:   424,300₮ ✅

Өдөрт 5,000 үзэлт:
  Орлого (15%):  2,250,000₮/сар
  Зардал:         73,500₮/сар
  Цэвэр ашиг:   2,176,500₮ ✅

Өдөрт 10,000 үзэлт:
  Орлого (15%):  4,500,000₮/сар
  Зардал:         252,000₮/сар
  Цэвэр ашиг:   4,248,000₮ ✅
```

---

## 9. Swipe механизм (Swiper.js)

### Swiper.js тохиргоо
```javascript
import { Swiper, SwiperSlide } from 'swiper/react';

<Swiper
  direction="vertical"        // Дээш/доош swipe
  slidesPerView={1}           // Нэг дэлгэцэнд 1 видео
  threshold={50}              // 50px-аас их swipe хийвэл л шилжинэ
  resistance={true}           // Эхний/сүүлийн видеонд resistance
  resistanceRatio={0.5}       // Bounce effect
  speed={300}                 // 300ms transition
  virtual={{                  // Virtual slides — RAM хэмнэнэ
    slides: videoList,
    renderSlide: (video) => <VideoSlide video={video} />,
  }}
  onSlideChange={(swiper) => {
    // Өмнөх видео pause
    // Шинэ видео play
    // Дараагийн видео preload
    // Progress API руу илгээх
  }}
>
  {videos.map(video => (
    <SwiperSlide key={video.id}>
      <VideoPlayer video={video} />
    </SwiperSlide>
  ))}
</Swiper>
```

### Virtual Slides — яагаад?
```
✗ Бүх видеог DOM-д оруулбал:
  100 видео = 100 <video> element
  → Browser удаашрана, RAM дүүрнэ

✓ Virtual slides:
  Зөвхөн 3 slide DOM-д байна (өмнөх, одоогийн, дараагийн)
  → RAM бага, хурдан
  → Хэдэн ч видео swipe хийж болно
```

---

## 10. Network эрүүл мэндийн хяналт

### Удаан интернеттэй хэрэглэгчдэд
```
Интернет хурд шалгах → connection.effectiveType

  4g    → 1080p, preload 2 видео
  3g    → 720p, preload 1 видео
  2g    → 480p, preload 0 (одоогийнхоо л)
  slow-2g → Видео тоглуулахгүй, "Интернет удаан" мэдэгдэл
```

### Buffering indicator
```
Видео buffer хийж байвал:
  → Төв хэсэгт spinner (loading) харуулна
  → 5 секундээс удаан buffer → "Чанар бууруулах уу?" prompt
  → Хэрэглэгч "Тийм" → 480p руу шилжинэ
```

---

## 11. Player State Management

### Видео бүрийн state
```typescript
interface VideoPlayerState {
  // Тоглуулалт
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;

  // Чанар
  quality: '480p' | '720p' | '1080p' | 'auto';
  playbackRate: 1 | 1.25 | 1.5 | 2;

  // Дуу
  isMuted: boolean;
  volume: number;

  // Тасалбар
  isPurchased: boolean;
  isFree: boolean;

  // Social
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
}
```

### Видеоны progress хадгалах
```
Хэрэглэгч видео хагасаас гарвал:
  → POST /api/v1/videos/:id/progress { currentTime: 245, duration: 500 }
  → Дараа нь буцаж ирэхэд тасарсан газраасаа үргэлжлүүлнэ
  → "Үргэлжлүүлэх үү?" prompt
```

---

## Нэгтгэвэл

```
Бүтээгч upload хийнэ
    → tus protocol-оор шууд R2 руу (манай сервер дамжихгүй)
    → VPS дээрх ffmpeg transcode (480p/720p/1080p HLS)
    → HLS файлууд R2 руу буцаж хадгалагдана
    → 2 цагийн модераци → Нийтлэгдэнэ

Хэрэглэгч үзнэ
    → Swiper.js вертикал swipe
    → HLS.js adaptive bitrate (интернет хурданд тохируулна)
    → R2-аас шууд stream (egress ҮНЭГҮЙ)
    → Дараагийн 2 видео preload (тасалдалгүй)
    → Signed URL + token хамгаалалт
    → Progress хадгалагдана (тасарсан газраасаа үргэлжлүүлнэ)

Зардал:
    MVP: ~₮25,700/сар (R2 + VPS)
    Cloudflare Stream ашиглахгүй → 13x хямд
```
