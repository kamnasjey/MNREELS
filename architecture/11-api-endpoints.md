# MNREELS - API Endpoints

> Base URL: `/api/v1`
> Auth: JWT Bearer token (NextAuth.js)
> Format: JSON

---

## 1. Auth (Бүртгэл & Нэвтрэх)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| POST | `/auth/register` | Утасны дугаараар бүртгүүлэх | - |
| POST | `/auth/verify-otp` | SMS код баталгаажуулах | - |
| POST | `/auth/login` | Нэвтрэх (утас + OTP) | - |
| POST | `/auth/refresh` | Token шинэчлэх | Refresh token |
| POST | `/auth/logout` | Гарах | User |

### Request/Response жишээ

**POST `/auth/register`**
```json
// Request
{ "phone": "+97699001234" }

// Response
{ "message": "OTP sent", "expires_in": 300 }
```

**POST `/auth/verify-otp`**
```json
// Request
{ "phone": "+97699001234", "otp": "123456" }

// Response
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "uuid",
    "phone": "+97699001234",
    "display_name": null,
    "role": "viewer",
    "tasalbar_balance": 10
  }
}
```

---

## 2. Users (Хэрэглэгч)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/users/me` | Миний мэдээлэл | User |
| PATCH | `/users/me` | Профайл засах (нэр, avatar, bio) | User |
| GET | `/users/:id` | Бусдын профайл харах | Optional |
| POST | `/users/me/become-creator` | Бүтээгч болох | User |
| PATCH | `/users/me/age-verify` | Насны баталгаажуулалт | User |

---

## 3. Creator Profile (Бүтээгчийн профайл)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/creators/:id` | Бүтээгчийн профайл | Optional |
| GET | `/creators/:id/series` | Бүтээгчийн цуврал жагсаалт | Optional |
| GET | `/creators/:id/videos` | Бүтээгчийн бүх видео | Optional |
| GET | `/creators/:id/stats` | Бүтээгчийн статистик | Creator (own) |
| PATCH | `/creators/me` | Банк мэдээлэл засах | Creator |
| GET | `/creators/popular` | Алдартай бүтээгчид | Optional |

---

## 4. Series (Цуврал)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/series` | Цуврал жагсаалт (filter, sort, paginate) | Optional |
| GET | `/series/:id` | Цувралын дэлгэрэнгүй | Optional |
| GET | `/series/:id/episodes` | Цувралын ангиуд | Optional |
| POST | `/series` | Шинэ цуврал үүсгэх | Creator |
| PATCH | `/series/:id` | Цуврал засах | Creator (own) |
| DELETE | `/series/:id` | Цуврал устгах | Creator (own) |
| GET | `/series/trending` | Trending цуврал | Optional |
| GET | `/series/new` | Шинэ цуврал | Optional |
| GET | `/series/free` | Үнэгүй цуврал | Optional |

### Query parameters (GET `/series`)
```
?category=drama
&age_rating=all
&sort=trending|newest|popular
&page=1
&limit=20
&search=хар шөнө
```

### Response жишээ (GET `/series/:id`)
```json
{
  "id": "uuid",
  "title": "Хар шөнө",
  "description": "Нэгэн харанхуй шөнө...",
  "cover_image_url": "https://...",
  "creator": {
    "id": "uuid",
    "display_name": "Б. Батболд",
    "avatar_url": "https://...",
    "follower_count": 12500
  },
  "category": { "id": "uuid", "name": "Уран сайхан", "slug": "drama" },
  "age_rating": "16+",
  "episode_count": 30,
  "free_episodes": 3,
  "total_views": 45000,
  "status": "active",
  "created_at": "2026-01-15T..."
}
```

---

## 5. Videos / Episodes (Видео / Анги)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/videos/:id` | Видеоны мэдээлэл | Optional |
| GET | `/videos/:id/stream` | HLS stream URL авах (тасалбар шалгана) | User |
| POST | `/videos` | Видео upload хийх | Creator |
| PATCH | `/videos/:id` | Видео мэдээлэл засах | Creator (own) |
| DELETE | `/videos/:id` | Видео устгах | Creator (own) |
| GET | `/videos/feed` | Swipe feed (For You algorithm) | Optional |
| GET | `/videos/feed/following` | Дагсан бүтээгчдийн видео | User |

### GET `/videos/:id/stream` — Кино үзэх logic

```
1. Үнэгүй юу? → Тийм → stream URL буцаана
2. Өмнө худалдаж авсан + 48 цаг дотор? → Тийм → stream URL буцаана
3. Тасалбар хүрэлцэх үү?
   → Үгүй → { error: "insufficient_balance", balance: 5, required: 2 }
   → Тийм → Тасалбар хасна (1.7 creator, 0.3 platform) → stream URL буцаана
```

### Response жишээ
```json
// Амжилттай
{
  "stream_url": "https://cloudflare-stream.com/xxx/manifest.m3u8",
  "expires_at": "2026-03-07T12:00:00Z",
  "tasalbar_spent": 2,
  "remaining_balance": 133
}

// Тасалбар хүрэлцэхгүй
{
  "error": "insufficient_balance",
  "balance": 1,
  "required": 2,
  "packages_url": "/api/v1/tasalbar/packages"
}
```

---

## 6. Тасалбар систем

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/tasalbar/balance` | Миний үлдэгдэл | User |
| GET | `/tasalbar/packages` | Худалдах багцууд | Optional |
| POST | `/tasalbar/purchase` | Тасалбар худалдаж авах (QPay/SocialPay) | User |
| POST | `/tasalbar/purchase/callback` | Төлбөрийн webhook (QPay/SocialPay) | System |
| GET | `/tasalbar/transactions` | Гүйлгээний түүх | User |

### POST `/tasalbar/purchase`
```json
// Request
{
  "package_id": "uuid",
  "payment_method": "qpay"
}

// Response
{
  "order_id": "uuid",
  "payment_url": "https://qpay.mn/...",
  "qr_code": "base64...",
  "invoice_id": "QPAY123",
  "expires_in": 1800
}
```

### POST `/tasalbar/purchase/callback` (QPay webhook)
```json
// QPay-аас ирнэ
{
  "invoice_id": "QPAY123",
  "payment_status": "PAID",
  "amount": 5000
}

// Систем хийх зүйлс:
// 1. payment_orders.status = 'paid'
// 2. tasalbar_balances.balance += 135 (120 + 15 бонус)
// 3. tasalbar_transactions бүртгэл үүсгэх
```

---

## 7. Бүтээгчийн орлого & Мөнгө татах

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/creator/earnings` | Орлогын нэгтгэл | Creator |
| GET | `/creator/earnings/history` | Орлогын дэлгэрэнгүй түүх | Creator |
| POST | `/creator/payout` | Мөнгө татах хүсэлт | Creator |
| GET | `/creator/payouts` | Мөнгө татах хүсэлтүүд | Creator |

### GET `/creator/earnings`
```json
{
  "total_tasalbar": 4350,
  "total_mnt": 217500,
  "available_to_withdraw": 4350,
  "pending_withdrawal": 0,
  "this_week": {
    "tasalbar": 342,
    "views": 4020,
    "new_followers": 58
  }
}
```

### POST `/creator/payout`
```json
// Request
{
  "tasalbar_amount": 4350,
  "bank_name": "Хаан банк",
  "bank_account": "5012XXXXXXXX",
  "account_holder": "Б. Батболд"
}

// Response
{
  "payout_id": "uuid",
  "tasalbar_amount": 4350,
  "amount_mnt": 217500,
  "status": "pending",
  "estimated_days": 3
}
```

---

## 8. Social (Like, Comment, Follow)

### Like

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| POST | `/videos/:id/like` | Like дарах | User |
| DELETE | `/videos/:id/like` | Like болиулах | User |

### Comment

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/videos/:id/comments` | Сэтгэгдлүүд (paginate) | Optional |
| POST | `/videos/:id/comments` | Сэтгэгдэл бичих | User |
| POST | `/comments/:id/reply` | Хариулах | User |
| DELETE | `/comments/:id` | Устгах | User (own) / Admin |
| POST | `/comments/:id/like` | Сэтгэгдэлд like | User |

### Follow

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| POST | `/creators/:id/follow` | Дагах | User |
| DELETE | `/creators/:id/follow` | Дагахаа болих | User |
| GET | `/users/me/following` | Миний дагсан бүтээгчид | User |
| GET | `/creators/:id/followers` | Бүтээгчийн дагагчид | Optional |

---

## 9. Notifications (Мэдэгдэл)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/notifications` | Мэдэгдлүүд (paginate) | User |
| PATCH | `/notifications/:id/read` | Уншсан гэж тэмдэглэх | User |
| PATCH | `/notifications/read-all` | Бүгдийг уншсан болгох | User |
| GET | `/notifications/unread-count` | Уншаагүй тоо | User |

---

## 10. Search (Хайлт)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/search` | Бүх зүйлээс хайх | Optional |
| GET | `/search/series` | Зөвхөн цувралаас | Optional |
| GET | `/search/creators` | Зөвхөн бүтээгчдээс | Optional |
| GET | `/categories` | Ангилалын жагсаалт | Optional |

### GET `/search?q=хар&type=all`
```json
{
  "series": [
    { "id": "uuid", "title": "Хар шөнө", "episode_count": 30, "cover_image_url": "..." }
  ],
  "creators": [
    { "id": "uuid", "display_name": "Хар үзэмж", "follower_count": 5000 }
  ],
  "videos": [
    { "id": "uuid", "title": "Хар шөнө Анги 1", "series_title": "Хар шөнө" }
  ]
}
```

---

## 11. Watch History (Үзсэн түүх)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/users/me/history` | Үзсэн түүх | User |
| POST | `/videos/:id/progress` | Үзсэн progress хадгалах | User |
| GET | `/users/me/bookmarks` | Bookmark жагсаалт | User |
| POST | `/videos/:id/bookmark` | Bookmark нэмэх | User |
| DELETE | `/videos/:id/bookmark` | Bookmark устгах | User |

---

## 12. Upload (Видео оруулах)

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| POST | `/upload/request` | Upload URL авах (Cloudflare direct upload) | Creator |
| POST | `/upload/complete` | Upload дууссан гэж мэдэгдэх | Creator |

### Upload flow
```
1. POST /upload/request
   → { upload_url: "https://upload.cloudflare...", upload_id: "xxx" }

2. Client → Cloudflare руу шууд upload хийнэ (browser → Cloudflare)

3. POST /upload/complete
   → { upload_id: "xxx", series_id: "uuid", title: "Анги 5", episode_number: 5 }
   → Cloudflare Stream transcode эхэлнэ
   → 2 цагийн модераци цонх эхэлнэ
```

---

## 13. Admin

| Method | Endpoint | Тайлбар | Auth |
|--------|----------|---------|------|
| GET | `/admin/videos/pending` | Модераци хүлээж буй видео | Admin |
| POST | `/admin/videos/:id/approve` | Видео зөвшөөрөх | Admin |
| POST | `/admin/videos/:id/reject` | Видео татгалзах | Admin |
| GET | `/admin/payouts/pending` | Мөнгө татах хүсэлтүүд | Admin |
| POST | `/admin/payouts/:id/approve` | Мөнгө татах зөвшөөрөх | Admin |
| POST | `/admin/payouts/:id/reject` | Мөнгө татах татгалзах | Admin |
| GET | `/admin/stats` | Платформын статистик | Admin |
| GET | `/admin/users` | Хэрэглэгчийн жагсаалт | Admin |

---

## Нийт endpoint тоо: ~55

| Бүлэг | Тоо |
|--------|-----|
| Auth | 5 |
| Users | 5 |
| Creator Profile | 6 |
| Series | 9 |
| Videos | 7 |
| Тасалбар | 5 |
| Creator Earnings | 4 |
| Social (Like/Comment/Follow) | 10 |
| Notifications | 4 |
| Search | 4 |
| Watch History | 5 |
| Upload | 2 |
| Admin | 8 |

---

## Auth levels

| Level | Тайлбар |
|-------|---------|
| `-` | Нэвтрэлгүй хандах боломжтой |
| `Optional` | Нэвтэрсэн бол нэмэлт мэдээлэл (жишээ: liked эсэх) |
| `User` | Нэвтэрсэн хэрэглэгч |
| `Creator` | Бүтээгч эрхтэй хэрэглэгч |
| `Admin` | Админ |
| `System` | Дотоод webhook (QPay callback гэх мэт) |
