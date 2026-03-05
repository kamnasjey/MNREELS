# MNREELS - Tech Stack

## Frontend
| Технологи | Зорилго |
|-----------|---------|
| **Next.js (React)** | Fullstack framework, SEO сайн, хурдан |
| **TailwindCSS** | UI дизайн |
| **HLS.js** | Video streaming player |
| **Swiper.js** | TikTok маягийн swipe UI |
| **PWA** | Mobile app шиг ажиллана (install хийж болно) |

## Backend
| Технологи | Зорилго |
|-----------|---------|
| **Next.js API Routes** | REST API endpoints |
| **NextAuth.js** | Authentication (бүртгэл, нэвтрэх) |
| **Prisma** | Database ORM |

## Database
| Технологи | Зорилго |
|-----------|---------|
| **PostgreSQL (Supabase)** | Үндсэн database - users, coins, transactions |
| **Supabase Realtime** | Мэдэгдэл, live updates |

## Видео хадгалалт & Streaming
| Технологи | Зорилго |
|-----------|---------|
| **Cloudflare R2** | Видео файл хадгалах (хямд) |
| **Cloudflare Stream** | HLS transcode (480p, 720p, 1080p), adaptive bitrate |

## Төлбөр
| Технологи | Зорилго |
|-----------|---------|
| **QPay API** | Coin худалдан авалт |
| **SocialPay API** | Coin худалдан авалт (нэмэлт сонголт) |

## Яагаад эдгээр вэ?
- **Next.js** — Нэг framework-ээр frontend + backend хоёуланг нь хийнэ
- **Supabase/PostgreSQL** — Мөнгөний transaction найдвартай, үнэгүй tier-тэй
- **Cloudflare R2** — AWS S3-аас хямд, Монголд хурдан
- **Cloudflare Stream** — Видео автомат transcode, DRM хамгаалалт
- **QPay/SocialPay** — Монголд хамгийн түгээмэл төлбөрийн систем
