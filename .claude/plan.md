# MNREELS - Бүрэн Production Ready болгох план

## Одоогийн байдал
- Creator dashboard, series/video upload, withdraw хуудсууд бий ГЭХДЭЭ:
  - Creator dashboard дээр series тус бүрийн **earnings = 0** hardcoded
  - **weeklyGrowth = "+0"** hardcoded
  - Creator series detail хуудас `/creator/series/[id]` **байхгүй** (ангиуд удирдах, статистик)
  - Admin panel **огт байхгүй**
  - Withdraw хуудас банкны мэдээлэл харуулахгүй (зөвхөн текст)
  - Profile хуудас creator-д зориулсан статистик байхгүй

## Хийх ажлууд (6 том блок)

---

### 1. ADMIN PANEL (`/admin/*`) — Шинээр бүтээх
Системийн администратор бүх зүйлийг хянах хуудас.

**Файлууд:**
- `app/src/app/admin/layout.tsx` — Admin layout (sidebar nav, admin check)
- `app/src/app/admin/page.tsx` — Dashboard overview (нийт stats)
- `app/src/app/admin/episodes/page.tsx` — Модераци (pending episodes approve/reject)
- `app/src/app/admin/withdrawals/page.tsx` — Withdrawal хүсэлтүүд (approve/reject/complete)
- `app/src/app/admin/creators/page.tsx` — Бүтээгчдийн жагсаалт (verify/ban)
- `app/src/app/admin/users/page.tsx` — Хэрэглэгчдийн жагсаалт
- `app/src/lib/actions/admin.ts` — Admin server actions

**Admin эрх шалгах:**
- `profiles` table дээр `is_admin boolean default false` нэмэх (migration)
- Middleware-д `/admin` route-д admin check нэмэх
- RLS policy: admin бүх table уншиж, засах эрхтэй

**Admin Dashboard харуулах:**
- Нийт хэрэглэгч тоо
- Нийт бүтээгч тоо
- Модерацид хүлээж буй episode тоо
- Pending withdrawal тоо
- Өнөөдрийн орлого
- 7 хоногийн график (текст хэлбэрээр)

**Episode модераци:**
- Бүх `status = 'moderation'` episode жагсаах
- Video preview (thumbnail/link)
- Approve → status = 'published', published_at = now()
- Reject → status = 'rejected'

**Withdrawal удирдлага:**
- Pending withdrawal жагсаалт
- Банк мэдээлэл, дүн харуулах
- Mark as processing / completed / rejected

---

### 2. CREATOR DASHBOARD САЙЖРУУЛАХ
**Одоо дутуу:**
- Series тус бүрийн earnings = 0 (hardcoded)
- weeklyGrowth = "+0" (hardcoded)
- Series detail хуудас байхгүй

**Засах:**
- `creator.ts`-д series тус бүрийн earnings-г `creator_earnings` table-с тооцоолох
- 7 хоногийн views өсөлт тооцоолох (episodes.views энэ 7 хоногт)
- `/creator/series/[id]/page.tsx` — Series detail: ангиудын жагсаалт, episode тус бүрийн views/earnings, status

---

### 3. WITHDRAW ХУУДАС САЙЖРУУЛАХ
**Одоо дутуу:**
- Банкны мэдээлэл зөвхөн текст (бодит мэдээлэл fetch хийхгүй)
- Одоогийн balance харуулахгүй
- Withdrawal history байхгүй

**Засах:**
- Server component-р профайл fetch → balance, bank info prop-оор дамжуулах
- Withdrawal history харуулах (өмнө илгээсэн хүсэлтүүд + status)

---

### 4. PROFILE ХУУДАС САЙЖРУУЛАХ
**Одоо дутуу:**
- Creator хүн профайлдаа creator stats харахгүй
- Logout товч байхгүй

**Засах:**
- Creator бол: earnings, views, series тоо харуулах
- Logout товч нэмэх
- Профайл засах боломж (display_name, bio)

---

### 5. DATABASE MIGRATION
Шинэ migration файл:
```sql
-- Add is_admin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Admin RLS policies (admin can read/update all tables)
-- Episode moderation policies for admin
-- Withdrawal management policies for admin
```

---

### 6. MIDDLEWARE ШИНЭЧЛЭХ
- `/admin` route-д `is_admin` шалгах
- Admin биш бол redirect

---

## Хэрэгжүүлэх дараалал
1. Database migration (is_admin column + RLS)
2. Admin actions (`lib/actions/admin.ts`)
3. Admin layout + pages (dashboard, episodes, withdrawals, creators, users)
4. Creator dashboard fixes (earnings per series, weekly growth, series detail page)
5. Withdraw page improvements (balance, bank info, history)
6. Profile page improvements (creator stats, logout, edit)
7. Middleware update (admin route protection)
