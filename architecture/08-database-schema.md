# MNREELS - Database Schema

## ER Diagram (Ерөнхий холбоос)

```
Users ──────┬──── CreatorProfiles
  │         │
  │         ├──── Series ──── Videos
  │         │                   │
  ├── TasalbarBalances              ├── Likes
  ├── TasalbarTransactions          ├── Comments
  ├── PaymentOrders             ├── Purchases
  ├── Follows                   └── ModerationLogs
  ├── Notifications
  └── PayoutRequests
```

---

## 1. Users (Хэрэглэгчид)

Бүх хэрэглэгчид нэг хүснэгтэд, role-оор ялгана.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      VARCHAR(500),
    role            VARCHAR(20) NOT NULL DEFAULT 'viewer',
                    -- 'viewer', 'creator', 'admin'
    date_of_birth   DATE,
    age_verified    BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## 2. CreatorProfiles (Бүтээгчийн профайл)

Creator-үүдийн нэмэлт мэдээлэл.

```sql
CREATE TABLE creator_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio             TEXT,
    bank_name       VARCHAR(100),
    bank_account    VARCHAR(50),
    account_holder  VARCHAR(100),
    total_earnings  BIGINT DEFAULT 0,        -- Нийт олсон тасалбар
    total_withdrawn BIGINT DEFAULT 0,        -- Нийт татсан тасалбар
    follower_count  INT DEFAULT 0,
    video_count     INT DEFAULT 0,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
```

---

## 3. TasalbarBalances (Тасалбар үлдэгдэл)

Хэрэглэгч бүрийн тасалбар үлдэгдэл.

```sql
CREATE TABLE tasalbar_balances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance         BIGINT NOT NULL DEFAULT 0,
    total_purchased BIGINT DEFAULT 0,        -- Нийт худалдаж авсан тасалбар
    total_spent     BIGINT DEFAULT 0,        -- Нийт зарцуулсан тасалбар
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasalbar_balances_user_id ON tasalbar_balances(user_id);
```

---

## 4. TasalbarPackages (Тасалбар багц)

Худалдаж авах боломжтой тасалбар багцууд.

```sql
CREATE TABLE tasalbar_packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,       -- "Жижиг багц"
    tasalbar_amount     INT NOT NULL,                -- 50, 100, 200
    price_mnt       INT NOT NULL,                -- Үнэ (төгрөг)
    discount_pct    DECIMAL(5,2) DEFAULT 0,      -- Хөнгөлөлт %
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. PaymentOrders (Төлбөрийн захиалга)

QPay/SocialPay төлбөрийн бүртгэл.

```sql
CREATE TABLE payment_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    package_id      UUID NOT NULL REFERENCES tasalbar_packages(id),
    tasalbar_amount     INT NOT NULL,
    amount_mnt      INT NOT NULL,                -- Төлсөн дүн (төгрөг)
    payment_method  VARCHAR(20) NOT NULL,        -- 'qpay', 'socialpay'
    payment_ref     VARCHAR(255),                -- Гадны системийн reference
    invoice_id      VARCHAR(255),                -- QPay/SocialPay invoice ID
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
                    -- 'pending', 'paid', 'failed', 'expired'
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_invoice ON payment_orders(invoice_id);
```

---

## 6. TasalbarTransactions (Тасалбар гүйлгээ)

Бүх тасалбар хөдөлгөөний бүртгэл.

```sql
CREATE TABLE tasalbar_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    type            VARCHAR(30) NOT NULL,
                    -- 'purchase'    : Тасалбар худалдаж авсан
                    -- 'spend'       : Кино үзэхэд зарцуулсан
                    -- 'earning'     : Бүтээгчийн олсон орлого
                    -- 'withdrawal'  : Бүтээгч мөнгө татсан
                    -- 'refund'      : Буцаалт
    amount          BIGINT NOT NULL,             -- + нэмэгдсэн, - хасагдсан
    balance_after   BIGINT NOT NULL,             -- Гүйлгээний дараах үлдэгдэл
    reference_type  VARCHAR(30),                 -- 'payment_order', 'purchase', 'payout'
    reference_id    UUID,                        -- Холбогдох бичлэгийн ID
    description     VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasalbar_transactions_user_id ON tasalbar_transactions(user_id);
CREATE INDEX idx_tasalbar_transactions_type ON tasalbar_transactions(type);
CREATE INDEX idx_tasalbar_transactions_created_at ON tasalbar_transactions(created_at);
```

---

## 7. Categories (Ангилал)

Кино/контентын ангилал.

```sql
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,       -- "Уран сайхан", "Инээдмийн"
    slug            VARCHAR(100) UNIQUE NOT NULL, -- "drama", "comedy"
    icon_url        VARCHAR(500),
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Series (Цуврал)

Цуврал кинонуудын бүлэг.

```sql
CREATE TABLE series (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    cover_image_url VARCHAR(500),
    category_id     UUID REFERENCES categories(id),
    age_rating      VARCHAR(10) NOT NULL DEFAULT 'all',
                    -- 'all', '13+', '16+', '18+'
    free_episodes   INT DEFAULT 0,               -- Эхний X анги үнэгүй
    episode_count   INT DEFAULT 0,
    total_views     BIGINT DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'active',
                    -- 'active', 'completed', 'paused'
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_series_creator_id ON series(creator_id);
CREATE INDEX idx_series_category_id ON series(category_id);
CREATE INDEX idx_series_age_rating ON series(age_rating);
```

---

## 9. Videos (Видео / Анги)

Бие даасан видео эсвэл цувралын анги.

```sql
CREATE TABLE videos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      UUID NOT NULL REFERENCES users(id),

    -- Цувралтай холбоос (optional)
    series_id       UUID REFERENCES series(id) ON DELETE SET NULL,
    episode_number  INT,                         -- Цуврал дотор хэддүгээр анги

    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    thumbnail_url   VARCHAR(500),

    -- Видео файл
    video_url       VARCHAR(500),                -- Cloudflare R2 original
    stream_url      VARCHAR(500),                -- Cloudflare Stream HLS URL
    stream_id       VARCHAR(255),                -- Cloudflare Stream ID
    duration_sec    INT NOT NULL,                 -- Видеоны урт (секунд)

    -- Үнэ
    tasalbar_price      INT NOT NULL DEFAULT 0,      -- 0 = үнэгүй
    is_free         BOOLEAN DEFAULT FALSE,

    -- Ангилал & насны зэрэглэл
    category_id     UUID REFERENCES categories(id),
    age_rating      VARCHAR(10) NOT NULL DEFAULT 'all',
                    -- 'all', '13+', '16+', '18+'

    -- Тоолуур
    view_count      BIGINT DEFAULT 0,
    like_count      BIGINT DEFAULT 0,
    comment_count   BIGINT DEFAULT 0,

    -- Статус
    status          VARCHAR(20) NOT NULL DEFAULT 'processing',
                    -- 'processing'  : Transcode хийж байна
                    -- 'pending'     : Модераци хүлээж байна
                    -- 'approved'    : Admin зөвшөөрсөн
                    -- 'rejected'    : Admin татгалзсан
                    -- 'published'   : Нийтлэгдсэн
                    -- 'unpublished' : Нийтлэлээс буцаасан
    moderation_deadline TIMESTAMPTZ,             -- 2 цагийн дараа auto-publish
    rejection_reason    VARCHAR(500),
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_creator_id ON videos(creator_id);
CREATE INDEX idx_videos_series_id ON videos(series_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_category_id ON videos(category_id);
CREATE INDEX idx_videos_age_rating ON videos(age_rating);
CREATE INDEX idx_videos_published_at ON videos(published_at);
CREATE INDEX idx_videos_is_free ON videos(is_free);
```

---

## 10. Purchases (Худалдан авалт / Үзэх эрх)

Хэрэглэгч кино худалдаж авсан бүртгэл (48 цаг хүчинтэй).

```sql
CREATE TABLE purchases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    video_id        UUID NOT NULL REFERENCES videos(id),
    tasalbar_amount     INT NOT NULL,                -- Зарцуулсан тасалбар
    purchased_at    TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,        -- purchased_at + 48 цаг
    is_active       BOOLEAN DEFAULT TRUE,

    UNIQUE(user_id, video_id)                    -- Давхардахгүй
);

CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_video_id ON purchases(video_id);
CREATE INDEX idx_purchases_expires_at ON purchases(expires_at);
```

---

## 11. Likes (Таалагдсан)

```sql
CREATE TABLE likes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, video_id)
);

CREATE INDEX idx_likes_video_id ON likes(video_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

---

## 12. Comments (Сэтгэгдэл)

```sql
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,  -- Reply
    content         TEXT NOT NULL,
    is_hidden       BOOLEAN DEFAULT FALSE,       -- Admin нуусан эсэх
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

---

## 13. Follows (Дагах)

```sql
CREATE TABLE follows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(follower_id, creator_id)
);

CREATE INDEX idx_follows_creator_id ON follows(creator_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
```

---

## 14. PayoutRequests (Мөнгө татах хүсэлт)

Бүтээгчийн мөнгө татах хүсэлт.

```sql
CREATE TABLE payout_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      UUID NOT NULL REFERENCES users(id),
    tasalbar_amount     BIGINT NOT NULL,             -- Татах тасалбар
    platform_fee    BIGINT NOT NULL,             -- 15% платформын шимтгэл
    creator_amount  BIGINT NOT NULL,             -- 85% бүтээгчийн хүртэх
    amount_mnt      INT NOT NULL,                -- Төгрөгөөр хөрвүүлсэн дүн
    bank_name       VARCHAR(100) NOT NULL,
    bank_account    VARCHAR(50) NOT NULL,
    account_holder  VARCHAR(100) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
                    -- 'pending'    : Хүсэлт илгээсэн
                    -- 'approved'   : Admin зөвшөөрсөн
                    -- 'processing' : Шилжүүлж байна
                    -- 'completed'  : Амжилттай
                    -- 'rejected'   : Татгалзсан
    admin_id        UUID REFERENCES users(id),
    admin_note      VARCHAR(500),
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payout_requests_creator_id ON payout_requests(creator_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);
```

---

## 15. Notifications (Мэдэгдэл)

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL,
                    -- 'new_episode'    : Дагасан бүтээгч шинэ анги оруулсан
                    -- 'comment'        : Кинонд сэтгэгдэл ирсэн
                    -- 'like'           : Like дарсан
                    -- 'follow'         : Шинэ дагагч
                    -- 'payout_update'  : Мөнгө татах хүсэлтийн шинэчлэл
                    -- 'system'         : Системийн мэдэгдэл
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    reference_type  VARCHAR(30),                 -- 'video', 'comment', 'payout'
    reference_id    UUID,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

## 16. ModerationLogs (Модерацийн бүртгэл)

Admin-ий хийсэн модерацийн үйлдлүүд.

```sql
CREATE TABLE moderation_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id        UUID NOT NULL REFERENCES users(id),
    video_id        UUID NOT NULL REFERENCES videos(id),
    action          VARCHAR(20) NOT NULL,        -- 'approved', 'rejected'
    reason          VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_logs_video_id ON moderation_logs(video_id);
CREATE INDEX idx_moderation_logs_admin_id ON moderation_logs(admin_id);
```

---

## 17. WatchHistory (Үзсэн түүх)

Хэрэглэгчийн үзсэн кинонуудын түүх (feed давтагдахгүй байх, recommendation-д ашиглана).

```sql
CREATE TABLE watch_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    watched_sec     INT DEFAULT 0,               -- Хэдэн секунд үзсэн
    completed       BOOLEAN DEFAULT FALSE,       -- Бүтэн үзсэн эсэх
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, video_id)
);

CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_video_id ON watch_history(video_id);
```

---

## Хүснэгтүүдийн хамаарлын товч

```
users
 ├── 1:1  tasalbar_balances
 ├── 1:1  creator_profiles
 ├── 1:N  videos (creator)
 ├── 1:N  series (creator)
 ├── 1:N  payment_orders
 ├── 1:N  tasalbar_transactions
 ├── 1:N  purchases
 ├── 1:N  likes
 ├── 1:N  comments
 ├── 1:N  follows (follower / creator)
 ├── 1:N  notifications
 ├── 1:N  payout_requests
 ├── 1:N  watch_history
 └── 1:N  moderation_logs (admin)

series
 └── 1:N  videos (episodes)

videos
 ├── 1:N  purchases
 ├── 1:N  likes
 ├── 1:N  comments
 ├── 1:N  watch_history
 └── 1:N  moderation_logs
```
