# MNREELS - System Architecture

## Ерөнхий бүтэц

```
                    ┌─────────────┐
                    │  Хэрэглэгч  │
                    │  (Browser)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Next.js   │
                    │  Frontend   │
                    │  (Vercel)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Next.js    │
                    │  API Routes │
                    └──┬────┬──┬─┘
                       │    │  │
          ┌────────────┘    │  └────────────┐
          │                 │               │
   ┌──────▼──────┐  ┌──────▼──────┐ ┌──────▼──────┐
   │ PostgreSQL  │  │ Cloudflare  │ │ QPay /      │
   │ (Supabase)  │  │ R2 + Stream │ │ SocialPay   │
   │             │  │             │ │             │
   │ - Users     │  │ - Video     │ │ - Тасалбар      │
   │ - Тасалбарs     │  │   storage   │ │   худалдан  │
   │ - Videos    │  │ - HLS       │ │   авалт     │
   │ - Follows   │  │   streaming │ │ - Payout    │
   │ - Comments  │  │ - Transcode │ │             │
   └─────────────┘  └─────────────┘ └─────────────┘
```

## Видео upload урсгал

```
Бүтээгч видео upload
    │
    ▼
Next.js API хүлээн авна
    │
    ▼
Cloudflare R2 руу хадгална
    │
    ▼
Cloudflare Stream руу transcode хүсэлт
    │
    ▼
Auto transcode (480p, 720p, 1080p)
    │
    ▼
2 цагийн модераци цонх
    │
    ├── Admin зөвшөөрөл ──► Нийтлэх
    └── 2 цаг ──► Автомат нийтлэх
```

## Тасалбар худалдан авах урсгал

```
Хэрэглэгч тасалбар багц сонгоно
    │
    ▼
QPay/SocialPay invoice үүсгэнэ
    │
    ▼
Хэрэглэгч төлбөр хийнэ
    │
    ▼
Webhook callback ирнэ
    │
    ▼
Хэрэглэгчийн тасалбар balance нэмэгдэнэ
    │
    ▼
Transaction бүртгэл хадгална
```

## Кино үзэх урсгал

```
Хэрэглэгч кино сонгоно (swipe)
    │
    ▼
Үнэгүй юу? ──► Тийм ──► Шууд үзнэ
    │
    Үгүй
    │
    ▼
Өмнө худалдаж авсан уу? (48 цаг) ──► Тийм ──► Шууд үзнэ
    │
    Үгүй
    │
    ▼
Тасалбар хүрэлцэх үү? ──► Үгүй ──► "Тасалбар цэнэглэх" prompt
    │
    Тийм
    │
    ▼
Тасалбар хасна + 48 цагийн эрх олгоно
    │
    ▼
Cloudflare Stream HLS URL-аар тоглуулна
```

## Deploy
- **Frontend + API:** Vercel (үнэгүй tier-ээс эхлэх)
- **Database:** Supabase (үнэгүй tier-ээс эхлэх)
- **Video:** Cloudflare R2 + Stream
