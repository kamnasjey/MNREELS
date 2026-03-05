# MNREELS UI/UX Design Patterns Research
# Competitive Analysis & Actionable Recommendations

> Comprehensive analysis of UI/UX patterns from TikTok, Instagram, YouTube, Webtoon, KakaoPage, ReelShort, DramaBox, and Netflix. Compiled for MNREELS -- a paid short film platform with social features targeting the Mongolian market.

---

## Table of Contents

1. [Creator Profile Pages](#1-creator-profile-pages)
2. [Social Feed & Discovery Beyond Swipe](#2-social-feed--discovery-beyond-swipe)
3. [Content Detail / Episode List Pages](#3-content-detail--episode-list-pages)
4. [Social Interaction UI](#4-social-interaction-ui)
5. [Creator Dashboard](#5-creator-dashboard)
6. [Bottom Navigation](#6-bottom-navigation)
7. [MNREELS Consolidated Recommendations](#7-mnreels-consolidated-recommendations)

---

## 1. Creator Profile Pages

### 1.1 TikTok Creator Profile

TikTok's profile is the gold standard for short-form video creator pages.

**Layout (top to bottom):**

```
+------------------------------------------+
|  [< Back]            [Share] [Settings]  |
+------------------------------------------+
|              [Avatar - circular]          |
|              @username                    |
|                                          |
|   Following    Followers     Likes       |
|     247          12.4K       89.3K       |
|                                          |
|  [Edit Profile]  [Share Profile]         |
|                                          |
|  Bio text (up to 80 characters)          |
|  linktr.ee/username                      |
+------------------------------------------+
|  [Videos] | [Favorites] | [Liked]        |  <- Tab bar for content
+------------------------------------------+
|  +-----+ +-----+ +-----+                |
|  |thumb| |thumb| |thumb|  <- 3-column    |
|  |  1  | |  2  | |  3  |     grid        |
|  +-----+ +-----+ +-----+                |
|  +-----+ +-----+ +-----+                |
|  |thumb| |thumb| |thumb|                 |
|  |  4  | |  5  | |  6  |                 |
|  +-----+ +-----+ +-----+                |
+------------------------------------------+
```

**Key design decisions:**
- **Avatar:** Large circular image, centered, above the username
- **Stats row:** Three metrics displayed horizontally -- Following, Followers, Likes -- with counts in bold and labels in smaller text below
- **Follow/Message buttons:** Prominent red "Follow" button (or "Following" toggle), with "Message" as secondary. For own profile, "Edit Profile" replaces "Follow"
- **Bio:** Short text field (80 chars max), with one clickable link below
- **Content tabs:** Horizontal tab bar switching between Videos (grid), Favorites (reposted), and Liked (if public)
- **Video grid:** 3-column grid of vertical thumbnails (9:16 aspect ratio). Each thumbnail shows a small play icon and view count overlay in the bottom-left
- **No playlists/series grouping:** TikTok does NOT organize content into series or playlists on the profile page. All videos appear in a flat reverse-chronological grid
- **Pinned videos:** Creators can pin up to 3 videos to the top of their grid (indicated by a pin icon)

**What works:** Dead simple. One glance tells you who this person is, how popular they are, and their content. The 3-column grid maximizes content density.

---

### 1.2 Instagram Creator Profile

Instagram's profile has evolved significantly with the 2025 grid update.

**Layout:**

```
+------------------------------------------+
|  username        [+Create] [Hamburger]   |
+------------------------------------------+
|  [Avatar]   Posts  Followers  Following  |
|  (circle)    342    45.2K      1,203     |
|                                          |
|  Display Name (bold)                     |
|  Category label (e.g., "Digital Creator")|
|  Bio text (up to 150 characters)         |
|  Link displayed as text                  |
|                                          |
|  [Follow]  [Message]  [Email]  [v]       |
+------------------------------------------+
|  [Grid] | [Reels] | [Tagged]             |
+------------------------------------------+
|  3-column grid (3:4 aspect ratio)        |
|  +------+ +------+ +------+             |
|  |      | |      | |      |             |
|  | post | | reel | | post |             |
|  |      | |      | |      |             |
|  +------+ +------+ +------+             |
+------------------------------------------+
```

**Key design decisions:**
- **Stats placement:** Unlike TikTok (centered), Instagram places stats to the RIGHT of the avatar in a horizontal row -- Posts, Followers, Following
- **Category label:** Instagram shows a creator category (e.g., "Digital Creator", "Artist", "Musician") below the display name -- useful for content platforms
- **Grid format:** As of 2025, Instagram shifted from 1:1 square thumbnails to 3:4 taller thumbnails (1015x1350px). This better showcases vertical content. Video Reels thumbnails use the 3:4 crop from the full 9:16 video
- **Content tabs:** Grid (all posts), Reels (video only), Tagged (mentions by others)
- **Action buttons:** Follow + Message side by side, with optional contact actions (Email, Call) for business/creator accounts
- **Highlights row:** Story Highlights appear as circular icons between the bio and content tabs -- a unique Instagram feature for organizing past ephemeral content into permanent categories
- **Mutual followers indicator:** "Followed by user1, user2, and 3 others" shown for social proof

**What works:** The category label is excellent for a content platform. The taller 3:4 grid thumbnails are better for video content than squares. Story Highlights (circular category icons) are a clever way to organize featured content.

---

### 1.3 YouTube Creator Profile (Channel Page)

YouTube's channel page is the most content-rich profile design.

**Layout:**

```
+------------------------------------------+
|  [Banner Image - full width]             |
|                                          |
+------------------------------------------+
|  [Avatar] Channel Name                   |
|           @handle  1.2M subscribers      |
|           103 videos                     |
|                                          |
|  Channel description (truncated, with    |
|  "...more" expand)                       |
|                                          |
|  linktr.ee/channel + 3 more links        |
|                                          |
|  [Subscribe]  [Join]                     |
+------------------------------------------+
|  [Home] [Videos] [Shorts] [Live]         |
|  [Playlists] [Community] [Channels]      |
+------------------------------------------+
|  "For You" section (personalized)        |
|  [horizontal scroll of video cards]      |
|                                          |
|  "Short Videos" section                  |
|  [horizontal scroll of Shorts thumbs]    |
|                                          |
|  "Uploads" section                       |
|  [horizontal scroll of recent videos]    |
|                                          |
|  "Created Playlists" section             |
|  [horizontal scroll of playlist cards]   |
+------------------------------------------+
```

**Key design decisions:**
- **Banner image:** Large customizable header image (2048x1152px) -- provides strong visual branding
- **Stats:** Subscriber count and video count displayed inline next to the handle
- **Content organization:** Up to 12 custom sections on the Home tab. Default sections: Short Videos, Uploads, Created Playlists, Subscriptions
- **Multiple tabs:** Home, Videos, Shorts, Live, Playlists, Community -- the most tabs of any platform
- **Horizontal carousels:** Each section uses horizontal scrolling cards, not a grid
- **Playlists:** YouTube is the ONLY major platform with a robust playlist/series organization feature on the profile
- **Customizable layout:** Creators can reorder sections and add up to 12 featured shelves

**What works:** The banner image adds personality. Playlists/sections allow series organization. The customizable Home tab lets creators curate their best content for first-time visitors. However, this design is too complex for mobile-first short-form content.

---

### 1.4 Webtoon Creator Profile

Webtoon's creator profile is purpose-built for serial content.

**Layout:**

```
+------------------------------------------+
|  [Avatar]  Creator Name                  |
|            Followers: 15.2K              |
|                                          |
|  Bio text (customizable)                 |
|  Social media links (Twitter, Instagram) |
|  Personal URL                            |
|                                          |
|  [Follow]                                |
+------------------------------------------+
|  Temporary Notice (optional pinned msg)  |
+------------------------------------------+
|  My Series:                              |
|  +--------------------------------------+|
|  | [Cover] Series Title 1               ||
|  |         Genre | Rating | Status      ||
|  |         "Updated every Tuesday"      ||
|  +--------------------------------------+|
|  | [Cover] Series Title 2               ||
|  |         Genre | Rating | Status      ||
|  +--------------------------------------+|
+------------------------------------------+
|  Community Feed:                         |
|  [Creator's text posts, polls, updates]  |
+------------------------------------------+
```

**Key design decisions:**
- **Series-centric:** The profile is organized around series (works), not individual episodes. Each series shows its cover image, title, genre, rating, and update schedule
- **Community feed:** Unique feature -- creators can post text updates, polls, and announcements directly on their profile
- **Minimal stats:** Only follower count is displayed (no view counts, no like totals)
- **Temporary notice:** A pinned message area for announcements (e.g., "On hiatus until March")
- **Social links:** External social media links are prominently displayed
- **No video grid:** Because content is long-form serial, there is no thumbnail grid. Series are listed vertically as cards

**What works for MNREELS:** The series-centric organization is exactly what MNREELS needs for creators who publish multi-episode short films. The community feed is a smart way to keep followers engaged between releases.

---

### 1.5 ReelShort Creator/Series Profile

ReelShort does not have traditional creator profiles (it is a studio-produced platform). Instead, it is organized around **series pages**.

**Series page layout:**

```
+------------------------------------------+
|  [Series Cover Image / Trailer preview]  |
|                                          |
+------------------------------------------+
|  Series Title                            |
|  Genre tags | Rating | Episode count     |
|  View count | Like count                 |
|                                          |
|  Synopsis (expandable)                   |
|                                          |
|  [Watch Now]  [Add to List]              |
+------------------------------------------+
|  Episodes:                               |
|  Ep 1 - Title    FREE     [Play]        |
|  Ep 2 - Title    FREE     [Play]        |
|  Ep 3 - Title    FREE     [Play]        |
|  -------- PAYWALL --------               |
|  Ep 4 - Title    59 coins [Unlock]      |
|  Ep 5 - Title    59 coins [Unlock]      |
|  ...                                     |
+------------------------------------------+
```

**Key design decisions:**
- **Series-first, not creator-first:** The primary entity is the series, not the creator/director
- **Clear free/paid boundary:** Free episodes are visually distinct from paid ones. The paywall is explicit
- **Episode list:** Vertical list format with episode number, title, price (FREE or coin cost), and play/unlock button
- **Prominent CTA:** "Watch Now" button starts at Episode 1 or resumes where the user left off
- **Coin pricing inline:** Each locked episode displays its coin cost directly in the episode list

---

### 1.6 MNREELS Recommendation: Creator Profile Page

```
+------------------------------------------+
|  [< Back]                    [Share]     |
+------------------------------------------+
|  [Banner Image / Featured Video still]   |
+------------------------------------------+
|  [Avatar]  Creator Name                  |
|            Creator type badge            |
|            (e.g., "Filmmaker")           |
|                                          |
|   Followers    Total Views    Films      |
|    1,234        45.6K          12        |
|                                          |
|  [Follow]  [Notify Me]                   |
|                                          |
|  Bio text (up to 150 chars)              |
|  Social links (optional)                 |
+------------------------------------------+
|  [Series] | [All Films] | [About]        |
+------------------------------------------+
|                                          |
|  SERIES TAB:                             |
|  +--------------------------------------+|
|  | [Cover] Series Title                 ||
|  |         12 episodes | Drama          ||
|  |         "3 free episodes"            ||
|  |         [Continue Watching Ep 4]     ||
|  +--------------------------------------+|
|  | [Cover] Series Title 2               ||
|  |         8 episodes | Thriller        ||
|  |         [Start Watching]             ||
|  +--------------------------------------+|
|                                          |
|  ALL FILMS TAB:                          |
|  3-column grid of all standalone +       |
|  series thumbnails (reverse-chronological)|
|                                          |
|  ABOUT TAB:                              |
|  Full bio, filmography, social links,    |
|  awards/recognition                      |
+------------------------------------------+
```

**Design rationale:**
- **Banner image** from YouTube gives visual personality (MNREELS creators are filmmakers -- visual branding matters)
- **Category badge** from Instagram ("Filmmaker", "Animator", "Screenwriter") adds credibility
- **Three stats** (Followers, Total Views, Films) -- enough for social proof without clutter
- **Series tab as default** -- since MNREELS is series-heavy, show organized series first (from Webtoon pattern)
- **"Continue Watching" inline** -- if the viewer has started a series, show resume progress directly on the creator profile (from Netflix pattern)
- **All Films grid** -- fallback to TikTok/Instagram 3-column grid for browsing all content
- **Follow + Notify Me** -- separate button for enabling new release notifications (from YouTube bell icon pattern)

---

## 2. Social Feed & Discovery Beyond Swipe

### 2.1 TikTok: Discover Page

**Structure:**

```
+------------------------------------------+
|  [Search bar: "Search"]                  |
+------------------------------------------+
|  Trending Searches:                      |
|  1. #keyword1  2. #keyword2  3. #key...  |
+------------------------------------------+
|  Category Chips (horizontally scrollable):|
|  [All] [Comedy] [Drama] [Sports] [Food]  |
+------------------------------------------+
|  Trending content grid (2-column):       |
|  +--------+  +--------+                 |
|  | video  |  | video  |                 |
|  | thumb  |  | thumb  |                 |
|  | + desc |  | + desc |                 |
|  +--------+  +--------+                 |
|  +--------+  +--------+                 |
|  | video  |  | video  |                 |
|  +--------+  +--------+                 |
+------------------------------------------+
```

**Key patterns:**
- **Search bar at top** -- always visible, with trending search suggestions
- **Horizontal category chips** -- scrollable genre/topic filters. Tapping a chip filters the grid below
- **2-column staggered grid** -- NOT 3-column. Slightly taller thumbnails with title text below, creating a "Pinterest-style" masonry layout
- **Trending hashtags** -- numbered list of trending search terms at the top
- **Content cards** show: thumbnail, description snippet (2 lines max), creator name, view/like count
- **Algorithm-curated:** The Discover page is algorithmically curated per user, not just a raw trending list

**Dual feed system:**
- **"For You" feed** (default tab): Fully personalized algorithmic feed, swipe-based
- **"Following" feed**: Chronological feed of content from followed creators only
- **Discover page**: Category-based browsing for intentional exploration

---

### 2.2 Instagram: Explore Page

**Structure:**

```
+------------------------------------------+
|  [Search bar: "Search"]                  |
+------------------------------------------+
|  Category Pills (algorithm-selected):    |
|  [For You] [Travel] [Art] [Food] [Style] |
+------------------------------------------+
|  Mixed-format grid:                      |
|  +------+ +---+ +---+                   |
|  |      | | s | | s |                   |
|  | LARGE| | m | | m |                   |
|  |      | | a | | a |                   |
|  |      | | l | | l |                   |
|  +------+ | l | | l |                   |
|           +---+ +---+                   |
|  +---+ +---+ +------+                   |
|  | s | | s | |      |                   |
|  | m | | m | | LARGE|                   |
|  +---+ +---+ +------+                   |
+------------------------------------------+
```

**Key patterns:**
- **Mixed-size grid:** Instagram's Explore uses a distinctive tiled grid with varying sizes -- some large tiles (2x2) alongside smaller ones (1x1). This creates visual hierarchy and draws the eye to featured content
- **Algorithm-predicted categories:** Instead of fixed genres, Instagram generates personalized category pills based on predicted interests. A user interested in cooking sees "Recipes", "Food Photography" etc.
- **Tapping into feed:** Tapping any Explore tile opens it in a full-screen scrollable feed of related content (not just the single post)
- **Reels-heavy:** The Explore page now prominently features Reels (video content) over static images
- **No explicit "trending" section:** Unlike TikTok, Instagram does not number trending topics. Discovery is implicit through the algorithm

---

### 2.3 YouTube: Explore/Trending

**Structure:**

```
+------------------------------------------+
|  [Search icon]                           |
+------------------------------------------+
|  Category tabs:                          |
|  [Trending] [Music] [Gaming] [Movies]   |
+------------------------------------------+
|  Trending Videos (vertical list):        |
|  +--------------------------------------+|
|  | [Thumbnail]  Title of Video          ||
|  |              Channel Name            ||
|  |              1.2M views . 3 hrs ago  ||
|  +--------------------------------------+|
|  | [Thumbnail]  Title of Video          ||
|  |              Channel Name            ||
|  +--------------------------------------+|
+------------------------------------------+
|                                          |
|  Shorts shelf (horizontal scroll):      |
|  +------+ +------+ +------+            |
|  |Short | |Short | |Short |            |
|  |thumb | |thumb | |thumb |            |
|  +------+ +------+ +------+            |
+------------------------------------------+
```

**Key patterns:**
- **Explicit category tabs** for Trending, Music, Gaming, Movies -- fixed categories, not personalized
- **Vertical card list** for trending videos (larger thumbnails than grid)
- **Shorts shelf:** Horizontal scrollable section for short-form content, visually distinct from regular videos
- **Separate search:** Search is a distinct flow from Explore/Trending

---

### 2.4 ReelShort & DramaBox: Content Discovery

**ReelShort approach:**
- **Homepage:** Curated editorial sections -- "Trending", "New Releases", "Recommended for You", "Continue Watching"
- **Genre browsing:** Horizontal genre chips at top, tapping filters the page
- **Minimalist discovery:** Fewer categories, more algorithmic -- the platform nudges you toward watching, not browsing
- **Series cards:** Large horizontal cards with cover image, title, genre, episode count, rating

**DramaBox approach:**
- **Homepage variety:** Mixed sections with different visual treatments -- hero banners, horizontal carousels, vertical lists
- **Stronger discoverability:** More categories, genres, and editorial collections than ReelShort
- **Trending indicators:** Badges for trending/popular series
- **"Daily Update" section:** Highlights new episodes added today

---

### 2.5 MNREELS Recommendation: Discovery & Feed System

MNREELS needs THREE discovery surfaces beyond the main swipe feed:

**Screen 1: Search/Discover (Search tab)**

```
+------------------------------------------+
|  [Search bar: "Кино хайх..."]            |
+------------------------------------------+
|  Genre Chips (horizontal scroll):        |
|  [Бүгд] [Драма] [Инээдмийн] [Аймшгийн] |
|  [Хайрын] [Түүхэн] [Хүүхдийн]          |
+------------------------------------------+
|  Trending Now:                           |
|  (Horizontal scroll of series cards)     |
|  +--------+ +--------+ +--------+       |
|  |trending| |trending| |trending|       |
|  | series | | series | | series |       |
|  | card 1 | | card 2 | | card 3 |       |
|  +--------+ +--------+ +--------+       |
+------------------------------------------+
|  New Releases:                           |
|  (Vertical list of series cards)         |
|  +--------------------------------------+|
|  | [Poster] Title . Genre . Free Ep 1-3||
|  +--------------------------------------+|
|  | [Poster] Title . Genre . 10 coins   ||
|  +--------------------------------------+|
+------------------------------------------+
|  Popular Creators:                       |
|  (Horizontal scroll of creator avatars)  |
|  (o) (o) (o) (o) (o) (o)               |
+------------------------------------------+
|  Free to Watch:                          |
|  (Grid of free content)                  |
+------------------------------------------+
```

**Screen 2: For You vs Following (Home tab sub-navigation)**

```
+------------------------------------------+
|  [Following]  |  [For You]  (top tabs)   |
+------------------------------------------+
|  Full-screen swipe feed                  |
|  (switches between algorithm-curated     |
|   and following-only content)            |
+------------------------------------------+
```

**Screen 3: Category/Genre Pages (accessed via genre chips)**

```
+------------------------------------------+
|  [< Back]  Drama                         |
+------------------------------------------+
|  Sort: [Trending] [New] [Most Viewed]    |
+------------------------------------------+
|  2-column grid of series posters         |
|  with title, episode count, coin price   |
+------------------------------------------+
```

**Design rationale:**
- **Search tab** combines TikTok's category chips + Instagram's visual grid + ReelShort's editorial sections
- **For You vs Following** toggle follows the TikTok pattern (essential for any social feed)
- **Genre pages** follow the app store / Netflix pattern for deep browsing
- **"Free to Watch" section** is critical for MNREELS -- it's the entry funnel for the coin system
- **Popular Creators** horizontal scroll creates discoverability for filmmakers (not present in ReelShort but essential for creator-driven platforms)

---

## 3. Content Detail / Episode List Pages

### 3.1 Netflix: Series Detail Page

Netflix's series page is the benchmark for episode-based content organization.

**Layout:**

```
+------------------------------------------+
|  [Hero Image / Trailer auto-playing]     |
|                                          |
|  Series Title                            |
|  2024 | TV-14 | 3 Seasons               |
|                                          |
|  Match score: 97% Match                 |
|                                          |
|  [Play]  [+ My List]  [Rate]  [Share]   |
|                                          |
|  Synopsis text (2-3 lines, expandable)   |
|                                          |
|  Cast: Name1, Name2, Name3...more       |
|  Genres: Drama, Thriller                 |
|  This show is: Suspenseful, Dark        |
+------------------------------------------+
|  [Episodes v]  [Trailers]  [More Like]  |
+------------------------------------------+
|  Season 1 (dropdown to switch)           |
|                                          |
|  1. Episode Title                        |
|  [Thumbnail =====>     ] 45m            |
|   ^^^^ progress bar (red)               |
|  Episode description text...             |
|                                          |
|  2. Episode Title                        |
|  [Thumbnail             ] 42m            |
|  Episode description text...             |
|                                          |
|  3. Episode Title         NEW            |
|  [Thumbnail             ] 48m            |
|  Episode description text...             |
+------------------------------------------+
```

**Key patterns:**
- **Hero media:** Auto-playing trailer or key art fills the top of the page
- **Metadata bar:** Year, rating, season count displayed compactly
- **Match score:** Personalized relevance score (Netflix's algorithm confidence)
- **Progress tracking:** Red progress bar overlaid on episode thumbnails shows exactly how much the user has watched. Episodes are marked as NEVER_WATCHED, IN_PROGRESS, or WATCHED
- **Resume intelligence:** The "Play" button changes to "Resume" with episode context ("Resume S2:E4") when in progress
- **Season selector:** Dropdown at the top of the episode list for multi-season shows
- **Episode cards:** Each episode shows: thumbnail, title, duration, progress bar, and description. The thumbnail is wider than it is tall (16:9 aspect ratio)
- **"More Like This" tab:** Related content recommendations

---

### 3.2 Webtoon: Series Home Page

**Layout:**

```
+------------------------------------------+
|  [Series Cover Image]                    |
|                                          |
|  Series Title                            |
|  Creator Name (linked to profile)        |
|  Genre | Rating | Update Schedule        |
|                                          |
|  Likes: 2.4M  Subscribers: 456K         |
|                                          |
|  [Subscribe]  [First Episode]            |
|                                          |
|  Synopsis text (expandable)              |
+------------------------------------------+
|  Sort: [Oldest First v] / [Newest First] |
+------------------------------------------+
|  Preview tab (for new readers only):     |
|  Curated preview panels                  |
+------------------------------------------+
|  Episode List:                           |
|  [Thumb] Ep 1 - Title    FREE    date   |
|  [Thumb] Ep 2 - Title    FREE    date   |
|  [Thumb] Ep 3 - Title    FREE    date   |
|  [Thumb] Ep 4 - Title    [coin]  date   |
|  [Thumb] Ep 5 - Title    [clock] date   |
|          ^^^ "Wait to unlock"           |
|  [Thumb] Ep 6 - Title    [lock]  date   |
|          ^^^ "Fast Pass required"       |
+------------------------------------------+
```

**Key patterns:**
- **Episode thumbnails:** Rectangular (202x142px), landscape orientation, shown inline with the episode list
- **Sorting:** Users can sort episodes oldest-first or newest-first (critical for serial content)
- **Three-tier access indicators:**
  - FREE: No icon, just the text "FREE" or no indicator
  - Wait-to-unlock: Clock icon -- free after a countdown timer
  - Paid (Fast Pass): Lock icon or coin icon -- requires coins to unlock immediately
- **Preview tab:** Appears ONLY for new readers who haven't started the series -- shows curated preview panels to hook them
- **Subscribe button:** Subscribing to a series notifies the reader of new episodes (distinct from following the creator)
- **Update schedule displayed:** "Every Tuesday" or "Complete" shown prominently

---

### 3.3 KakaoPage: Series Page with "Wait for Free"

**Layout:**

```
+------------------------------------------+
|  [Series Cover]                          |
|  Title                                   |
|  Genre | Author | Status                 |
|  Rating: 4.8/5 (from readers)            |
|                                          |
|  [Start Reading]  [Subscribe]            |
+------------------------------------------+
|  Episode List:                           |
|                                          |
|  Ep 1    FREE (permanently)              |
|  Ep 2    FREE (permanently)              |
|  Ep 3    FREE (permanently)              |
|  -------- unlockable zone --------       |
|  Ep 4    [clock icon] Free in 23:45:12   |
|          OR [ticket icon] Use ticket     |
|  Ep 5    [lock] Rental: 200 won          |
|          OR [lock] Own: 500 won          |
|  ...                                     |
|  -------- latest episodes --------       |
|  Ep 48   [Premium lock] Cash only        |
|  Ep 49   [Premium lock] Cash only        |
|  Ep 50   [Premium lock] Cash only        |
+------------------------------------------+
```

**Key patterns:**
- **Three pricing zones:** (1) Permanently free first episodes, (2) "Wait for Free" zone with countdown timers, (3) Premium-only latest episodes that cannot be unlocked by waiting
- **Countdown timer inline:** Each "wait for free" episode shows a live countdown (e.g., "Free in 23:45:12") directly in the episode list
- **Rental vs. ownership:** Two purchase options per episode -- rent (temporary access, cheaper) or buy (permanent access, more expensive)
- **Clock icon:** Visual indicator for "Wait for Free" episodes
- **Progress indicator:** Previously read episodes are visually distinct (greyed text or checkmark)

---

### 3.4 ReelShort: Series Episode List

**Layout:**

```
+------------------------------------------+
|  [Trailer / Series Key Art]              |
|                                          |
|  Series Title                            |
|  Genre tags | Total Episodes             |
|  View count | Rating                     |
|                                          |
|  Synopsis (2 lines + "more")             |
|                                          |
|  [Watch Now / Resume Ep 4]              |
|  [Add to Watchlist]                      |
+------------------------------------------+
|  Episode List (vertical):                |
|                                          |
|  Ep 1  Title        FREE      [>]      |
|  Ep 2  Title        FREE      [>]      |
|  ...                                     |
|  Ep 10 Title        FREE      [>]      |
|  --------- Unlock Required ---------    |
|  Ep 11 Title      59 coins   [lock]    |
|  Ep 12 Title      59 coins   [lock]    |
|  ...                                     |
|  Ep 80 Title      59 coins   [lock]    |
+------------------------------------------+
|  Related Series:                         |
|  (Horizontal scroll of similar series)   |
+------------------------------------------+
```

**Key patterns:**
- **Immediate playback:** "Watch Now" or "Resume" as primary CTA -- one tap to start/continue
- **Flat episode list:** Simple vertical list, no thumbnails per episode (space-efficient)
- **Clear paywall line:** Visual separator between free and paid episodes
- **Uniform pricing:** All paid episodes cost the same (59 coins each)
- **Bulk unlock option:** Some platforms offer "Unlock all remaining episodes" at a discount
- **Related series:** Recommendation section below the episode list

---

### 3.5 MNREELS Recommendation: Series Detail Page

```
+------------------------------------------+
|  [Hero: Trailer auto-play / Cover art]   |
|  (Full-width, 16:9 or 9:16 depending     |
|   on video orientation)                  |
+------------------------------------------+
|  Series Title                            |
|  Creator Name (tappable -> profile)      |
|  Drama | 12 episodes | 2024             |
|                                          |
|  Views: 12.3K   Likes: 4.5K             |
|  Rating: 4.7/5 (from viewers)            |
|                                          |
|  [Play / Resume Ep X]  [+ Watchlist]     |
|  [Follow Creator]      [Share]           |
|                                          |
|  Synopsis (3 lines + "дэлгэрэнгүй...")  |
|  Cast: (if applicable)                   |
+------------------------------------------+
|  Episodes:                  [Sort v]     |
+------------------------------------------+
|                                          |
|  FREE EPISODES:                          |
|  [Thumb] Ep 1  Title       Үнэгүй  [>] |
|  [Thumb] Ep 2  Title       Үнэгүй  [>] |
|  [Thumb] Ep 3  Title       Үнэгүй  [>] |
|          ^^^ progress bar if started     |
|                                          |
|  PAID EPISODES:                          |
|  [Thumb] Ep 4  Title   10 coin [lock]   |
|  [Thumb] Ep 5  Title   10 coin [lock]   |
|          ...                             |
|  [Thumb] Ep 12 Title   15 coin [lock]   |
|                                          |
|  [Unlock All: 120 coins (save 15%)]     |
+------------------------------------------+
|  More from this Creator:                 |
|  (Horizontal scroll of other series)     |
+------------------------------------------+
|  Similar Series:                         |
|  (Horizontal scroll of recommendations)  |
+------------------------------------------+
```

**Design decisions:**
- **Progress bars on thumbnails** (from Netflix) -- critical for resume behavior
- **Episode thumbnails** shown (unlike ReelShort's text-only list) -- MNREELS content is cinematic, so visual previews add value
- **"Үнэгүй" (Free) badge** in green and coin price in gold -- color-coded access status
- **Sort toggle** (from Webtoon) -- oldest first or newest first
- **"Unlock All" bundle option** -- discounted bulk purchase for binge-watchers (proven revenue booster)
- **Creator link** prominent -- MNREELS is a creator platform, so driving traffic to creator profiles is important
- **Rating from viewers** (not algorithm match score) -- builds social proof and community
- **Two recommendation sections:** "More from this Creator" (loyalty) and "Similar Series" (discovery)

---

## 4. Social Interaction UI

### 4.1 Comment Panel Design

**TikTok Pattern (the standard):**

```
+------------------------------------------+
|  [Video still visible ~40% of screen]    |
+------------------------------------------+
|  Comments (1,234)              [X close] |
+------------------------------------------+
|  +--------------------------------------+|
|  | [Avatar] Username        2h ago      ||
|  | Comment text here that can span      ||
|  | multiple lines with replies below    ||
|  | [Heart] 45  [Reply]                  ||
|  |   |-- [Avatar] Reply username  1h    ||
|  |   |   Reply text...                  ||
|  |   |   [Heart] 12  [Reply]            ||
|  +--------------------------------------+|
|  | [Avatar] Username        5h ago      ||
|  | Comment text...                      ||
|  | [Heart] 23  [Reply]                  ||
|  +--------------------------------------+|
+------------------------------------------+
|  [Avatar] [Type a comment...]     [Post] |
+------------------------------------------+
```

**Key patterns across platforms:**

| Platform | Comment Panel Style | Position | Dismissal |
|----------|-------------------|----------|-----------|
| TikTok | Bottom sheet overlay (~60% screen) | Slides up from bottom | Swipe down or tap X |
| Instagram Reels | Bottom sheet overlay (~50% screen) | Slides up from bottom | Swipe down or tap X |
| YouTube Shorts | Bottom sheet overlay (~60% screen) | Slides up from bottom | Swipe down |
| Webtoon | Full-page (navigates to comment page) | Replaces current view | Back button |
| Netflix | None (no comments) | N/A | N/A |

**Universal comment panel patterns:**
- **Bottom sheet modal** is the industry standard for video content -- the video stays partially visible behind the semi-transparent overlay
- **60% screen height** is the sweet spot -- enough to read comments, but video stays visible for context
- **Threaded replies** with indent (TikTok, Instagram) -- not flat comments
- **Like button per comment** (heart icon with count)
- **"Reply" action** per comment for threading
- **Input field pinned to bottom** with user avatar, text field, and send button
- **Sort options:** "Top comments" (by likes) vs "Newest" (chronological)
- **Creator badge:** Special visual indicator when the creator comments on their own content
- **Pinned comment:** Creators can pin one comment to the top

---

### 4.2 Like Animation Effects

**TikTok double-tap like:**
- Double-tap anywhere on the video triggers a large heart animation
- The heart appears at the tap location (not a fixed position)
- Heart is white with a brief scale-up animation (grows then shrinks slightly)
- Multiple rapid taps create multiple overlapping hearts with slight position randomization
- The like button on the right rail simultaneously fills in red
- Spring physics animation -- the heart "bounces" slightly before fading out

**Instagram double-tap like:**
- Double-tap shows a centered white heart overlay
- Single large heart that grows, holds briefly, then fades
- Simpler than TikTok (one heart, centered, no particle effects)

**Implementation for MNREELS:**
- Use TikTok-style multi-heart effect (more engaging, more satisfying)
- Hearts should be in the MNREELS brand color
- Add subtle haptic feedback on like (vibration pulse)
- The heart animation should work on both double-tap (on video) and single-tap (on heart icon)

---

### 4.3 Share Mechanics

**Share sheet pattern (universal):**

```
+------------------------------------------+
|  Share to:                      [X]      |
+------------------------------------------+
|  (o)Copy  (o)SMS  (o)WhatsApp (o)More   |
|  Link                                    |
+------------------------------------------+
|  Recent contacts:                        |
|  (o) Name1  (o) Name2  (o) Name3        |
+------------------------------------------+
|  [Report]  [Not Interested]  [Save]      |
+------------------------------------------+
```

**Platform-specific patterns:**

- **TikTok:** Share sheet includes "Copy Link", direct message to TikTok users, and external apps. Also includes "Duet", "Stitch", and "Save Video" as creation-oriented sharing
- **Instagram:** Share sheet prioritizes DM sharing to Instagram users (shows recent chats), then external sharing options
- **YouTube:** Share includes timestamp option, "Clip" (for creating clips), and direct app sharing
- **ReelShort:** Minimal sharing -- primarily "Copy Link" and external app sharing. No in-app messaging

**MNREELS recommendation:**
- Copy Link (essential -- many Mongolian users share via Facebook Messenger)
- Direct share to Facebook, Instagram, Twitter
- "Share to Chat" for future in-app messaging
- **Unique: "Gift this film"** -- share button that lets you send a free unlock to a friend (viral growth mechanic)

---

### 4.4 Notification Center Design

**Standard notification center pattern:**

```
+------------------------------------------+
|  Notifications                    [Gear] |
+------------------------------------------+
|  Filter tabs:                            |
|  [All] [Social] [Updates] [Activity]     |
+------------------------------------------+
|  TODAY                                   |
|  +--------------------------------------+|
|  | [Avatar] Creator uploaded new film   ||
|  | "Film Title" - 2 hours ago           ||
|  | [Thumbnail preview]          [>]     ||
|  +--------------------------------------+|
|  | [Avatar] User123 liked your film     ||
|  | 3 hours ago                          ||
|  +--------------------------------------+|
|  | [System] Your film is now live!      ||
|  | "Film Title" passed review - 5h ago  ||
|  +--------------------------------------+|
|                                          |
|  YESTERDAY                               |
|  +--------------------------------------+|
|  | [Avatar] User456 commented:          ||
|  | "Great film!" - 1 day ago            ||
|  +--------------------------------------+|
|  | [Grouped] 12 people liked your film  ||
|  | "Film Title" - 1 day ago             ||
|  +--------------------------------------+|
+------------------------------------------+
```

**Key patterns:**
- **Time-based grouping:** "Today", "Yesterday", "This Week", "Earlier" -- used by TikTok, Instagram, and most social apps
- **Notification grouping:** Multiple similar notifications (e.g., "12 people liked your film") grouped into one card to prevent spam feel
- **Unread indicators:** Unread notifications have a colored background (typically light blue) or a dot indicator. Read notifications are plain white/gray
- **Filter tabs:** Instagram uses "All" and "Following" tabs. TikTok uses "All Activity" and "Likes" and "Comments" and "Mentions" sub-tabs
- **Rich media preview:** Include thumbnail images in notifications (proven to increase open rates by 25%)
- **Badge on icon:** Bell icon in navigation shows a red dot or number badge for unread count. Limit to "99+" for large counts
- **Settings gear:** Quick access to notification preferences (toggle types on/off)

**MNREELS recommendation:**
- Place notification bell on the Home screen header (not a bottom tab -- save tab space for core navigation)
- Group notifications by time (Today / Yesterday / Earlier)
- Group similar notifications ("5 people liked your film")
- Categories: Social (likes, comments, follows), Content (new episodes from followed creators), System (review status, payout updates)
- Include thumbnail previews in content notifications
- Red dot badge on bell icon for unread count

---

## 5. Creator Dashboard

### 5.1 TikTok Creator Tools (TikTok Studio)

**Dashboard structure:**

```
+------------------------------------------+
|  Overview Tab:                           |
+------------------------------------------+
|  Date range selector: [Last 7 days v]    |
|                                          |
|  +--------+ +--------+ +--------+       |
|  | Views  | | Likes  | | Shares |       |
|  | 12.4K  | | 3.2K   | | 456    |       |
|  | +15%   | | +8%    | | -3%    |       |
|  +--------+ +--------+ +--------+       |
|                                          |
|  [Line chart: Views over time]           |
|                                          |
|  Followers: 45.2K  (+1,234 this week)    |
|                                          |
|  Profile Views: 8.9K                     |
+------------------------------------------+
|  Top Content:                            |
|  +--------------------------------------+|
|  | [Thumb] Video Title     Views: 5.2K  ||
|  |         Likes: 1.2K    Shares: 89   ||
|  +--------------------------------------+|
|  | [Thumb] Video Title     Views: 3.8K  ||
|  +--------------------------------------+|
+------------------------------------------+
|  Content Tab:                            |
|  [All Videos] [Live] [Scheduled]         |
|  List of all uploaded content with       |
|  per-video metrics                       |
+------------------------------------------+
|  Audience Tab:                           |
|  Demographics, geography, active times   |
+------------------------------------------+
|  Monetization Tab:                       |
|  Estimated rewards, program eligibility  |
+------------------------------------------+
```

**Key patterns:**
- **Card-based stats overview:** Key metrics (views, likes, shares) in large cards with trend indicators (+/-%)
- **Date range selector:** 7 days, 28 days, 60 days, custom range
- **Trend charts:** Line charts showing performance over time
- **Content list:** All uploaded content with per-item metrics in a sortable list
- **Audience insights:** Demographics (age, gender, geography), peak activity times

---

### 5.2 YouTube Studio Dashboard

**Structure:**

```
+------------------------------------------+
|  Channel Dashboard                       |
+------------------------------------------+
|  [Video Performance Card]                |
|  Latest video: "Title"                   |
|  Views: 1.2K in first 48 hours           |
|  [Chart comparing to typical performance]|
+------------------------------------------+
|  [Channel Analytics Card]                |
|  Subscribers: 45.2K (+234)               |
|  Views: 89.3K (last 28 days)             |
|  Watch time: 4,567 hours                 |
|  [Real-time: 23 views right now]         |
+------------------------------------------+
|  [Revenue Card]                          |
|  Estimated revenue: $1,234.56            |
|  Last 28 days                            |
|  RPM: $5.67                              |
+------------------------------------------+
|  [Top Content Card]                      |
|  List of top-performing videos           |
+------------------------------------------+
|  [Audience Card]                         |
|  Returning vs New viewers                |
|  When your viewers are online            |
+------------------------------------------+
```

**Key patterns unique to YouTube Studio:**
- **"Latest video" performance card:** The dashboard leads with the most recent upload's performance, compared to the creator's typical performance (benchmark line)
- **Real-time views:** Shows current live viewer count
- **Revenue breakdown:** RPM (Revenue per Mille), estimated monthly earnings, revenue by source (ads, memberships, Super Chat)
- **AI-powered assistant (2025+):** "Ask Studio" feature lets creators ask plain-language questions about their analytics
- **Content list with action buttons:** Each video in the content manager has quick-access buttons: edit, analytics, comments, download
- **Advanced mode:** Exportable, filterable data tables for power users

---

### 5.3 MNREELS Recommendation: Creator Dashboard

For MNREELS, the creator dashboard should be SIMPLE (most creators are independent Mongolian filmmakers, not data analysts).

**Dashboard layout:**

```
+------------------------------------------+
|  Creator Dashboard                       |
|  [Нийт орлого: 45,230 coin]    [Payout] |
|  Available for payout: 40,000 coin       |
|  = approximately ₮400,000                |
+------------------------------------------+
|  Last 7 days:          [Date range v]    |
|  +--------+ +--------+ +--------+       |
|  | Views  | | Coins  | | New    |       |
|  | 2,340  | | Earned | | Follow |       |
|  |        | | 1,250  | | +89    |       |
|  +--------+ +--------+ +--------+       |
|                                          |
|  [Simple bar chart: daily views]         |
+------------------------------------------+
|  My Content:                             |
|  +--------------------------------------+|
|  | [Thumb] Series: Title                ||
|  |  12 episodes | 5,230 views total     ||
|  |  Coins earned: 2,450                 ||
|  |  [Edit] [Analytics] [Add Episode]    ||
|  +--------------------------------------+|
|  | [Thumb] Standalone Film              ||
|  |  Views: 1,200 | Coins: 890          ||
|  |  Status: Live                        ||
|  |  [Edit] [Analytics]                  ||
|  +--------------------------------------+|
|  | [Thumb] New Upload                   ||
|  |  Status: In Review (18h remaining)   ||
|  |  [Edit Draft]                        ||
|  +--------------------------------------+|
+------------------------------------------+
|  [Upload New Video]                      |
+------------------------------------------+
```

**Key design decisions:**
- **Earnings front and center:** MNREELS is a paid content platform -- creators care most about revenue. Show total earnings and payout availability at the very top (unique to paid platforms, different from TikTok/YouTube)
- **MNT equivalent shown:** Always show the real-money equivalent of coin earnings (e.g., "= approximately 400,000 tugrik")
- **Three key metrics only:** Views, Coins Earned, New Followers. No overwhelming data (follow TikTok's simplicity, not YouTube's complexity)
- **Simple bar chart:** Daily views for the last 7 days -- no complex multi-axis charts
- **Content list with inline actions:** Edit, Analytics (detailed per-video breakdown), Add Episode (for series)
- **Review status visible:** "In Review" with countdown timer shown directly in the content list
- **"Upload New Video" CTA** at the bottom -- always accessible from the dashboard
- **Payout button:** Direct access to request payout (critical for creator satisfaction)

**Upload flow (3 steps, from existing UX doc):**
1. Select video from device
2. Add details while video uploads in background (title, genre, price, series assignment)
3. Preview and publish to moderation queue

---

## 6. Bottom Navigation

### 6.1 Platform Comparison

| Platform | Tab 1 | Tab 2 | Tab 3 | Tab 4 | Tab 5 |
|----------|-------|-------|-------|-------|-------|
| **TikTok** | Home (FYP) | Discover | + Create | Inbox | Profile |
| **Instagram** | Home (Feed) | Search | + Create | Reels | Profile |
| **YouTube** | Home | Shorts | + Create | Subscriptions | Library |
| **Webtoon** | Home | Search | -- | Favorites | More |
| **ReelShort** | Home | Discover | -- | My List | Profile |
| **DramaBox** | Home | Discover | -- | Library | Me |

**Patterns observed:**

**5-tab platforms (TikTok, Instagram, YouTube):**
- **Create button in center position:** TikTok and Instagram both place the "+" create button as the center tab. YouTube does as well. This makes creation feel like a core activity, not a secondary feature
- **Center "+" is visually distinct:** Usually larger, elevated, or differently colored from other tabs
- **Inbox/Notifications as a tab:** TikTok dedicates a full tab to inbox (DMs + notifications). Instagram replaced its Activity tab with Reels

**4-tab platforms (ReelShort, DramaBox, Webtoon):**
- **No "Create" tab:** These are consumption-first platforms. Creation is accessed from the profile or settings
- **"Library/My List" tab:** Dedicated tab for saved content, watchlist, and downloads
- **Simpler navigation:** 4 tabs work well when the primary activity is consuming content (not creating it)

**Research findings on optimal tab count:**
- 3-5 tabs is the proven optimal range
- Odd numbers (3 or 5) create better visual rhythm than even numbers
- Each tab must represent a fundamentally different screen/activity
- Tabs must be reachable in the thumb zone (bottom of screen)
- Active tab should use brand color; inactive tabs use neutral gray
- Icon + short label (1 word) for every tab -- icon-only causes confusion

---

### 6.2 MNREELS Recommendation: Bottom Navigation

MNREELS should use **5 tabs** with a center create button -- but only for creators.

**For Viewers (most users):**

```
+------------------------------------------+
|  [Home]   [Search]   [Coins]   [Profile] |
|   Feed    Discover    Wallet     You      |
+------------------------------------------+
```

4 tabs. Clean, simple, focused on consumption and monetization.

| Tab | Icon | Purpose |
|-----|------|---------|
| Home | Play/Home icon (filled) | Main swipe feed with "For You" / "Following" toggle |
| Search | Magnifying glass | Genre browsing, search, trending, categories |
| Coins | Coin/wallet icon | Coin balance, purchase coins, transaction history |
| Profile | Person icon | Watch history, liked videos, settings, notifications |

**For Creators (opt-in, after creator verification):**

```
+------------------------------------------+
|  [Home] [Search] [+Upload] [Coins] [Profile]|
|   Feed  Discover  Create    Wallet   You  |
+------------------------------------------+
```

5 tabs. The center "+" upload button appears ONLY for verified creators.

| Tab | Icon | Purpose |
|-----|------|---------|
| Home | Play/Home icon | Main swipe feed |
| Search | Magnifying glass | Discovery |
| + Upload | Plus icon (elevated, brand color) | Quick access to upload flow |
| Coins | Coin/wallet icon | Balance + earnings for creators |
| Profile | Person icon | Creator dashboard accessible from here |

**Why this approach:**

1. **Viewer-first design:** 85%+ of users are viewers. Don't waste a tab on upload for people who will never use it. This follows the ReelShort/DramaBox pattern (consumption platforms)

2. **Coins tab is unique to MNREELS:** TikTok doesn't need a wallet tab because it's free. MNREELS's entire business model depends on coin purchases -- making it a primary tab reduces friction to purchase. This is the "3 taps to buy coins" principle from the existing UX doc

3. **Creator upgrade path:** When a user becomes a verified creator, the navigation adapts. The center "+" button appears, upgrading from 4 to 5 tabs. This is similar to how Instagram shows different tabs for business vs. personal accounts

4. **Notifications NOT a tab:** Unlike TikTok's dedicated Inbox tab, MNREELS puts notifications as a bell icon with badge in the header of the Home screen. Reason: MNREELS is not a messaging platform -- a full tab for notifications would be empty for most users. The notification bell follows the Instagram pattern (badge on existing icon)

---

### 6.3 Tab Bar Visual Design

```
+------------------------------------------+
| Specifications:                          |
| - Height: 56dp (Android) / 49pt (iOS)   |
| - Background: Dark (#1a1a1a) with        |
|   slight transparency (90% opacity)      |
| - Active icon: Brand color (gold/amber)  |
| - Active label: Brand color, 10sp bold   |
| - Inactive icon: #888888 (medium gray)   |
| - Inactive label: #888888, 10sp regular  |
| - Touch target: Full tab width, 56dp     |
|   height minimum                         |
| - Center "+" button (creator mode):      |
|   40x40dp, elevated 8dp, brand color     |
|   background, white "+" icon             |
| - Separator: 0.5dp line or subtle shadow |
|   above the tab bar                      |
| - Always visible: Tab bar persists on    |
|   all screens except full-screen video   |
|   playback                               |
+------------------------------------------+
```

---

## 7. MNREELS Consolidated Recommendations

### 7.1 Priority Matrix

| Feature | Priority | Source Pattern | Rationale |
|---------|----------|---------------|-----------|
| Creator profile with series organization | P0 | Webtoon + TikTok hybrid | Series are the core content unit |
| Series detail page with episode list | P0 | Netflix + KakaoPage | Episode list with free/paid indicators is revenue-critical |
| Comment panel (bottom sheet overlay) | P0 | TikTok | Social engagement drives retention |
| Double-tap like animation | P0 | TikTok | Expected standard interaction |
| Search/Discover page with genre chips | P0 | TikTok Discover | Essential for content discovery beyond algorithm |
| 4-tab bottom nav (viewer) | P0 | ReelShort + custom Coins tab | Consumption-first, monetization-accessible |
| For You / Following feed toggle | P0 | TikTok | Dual feed is the standard for social video |
| Notification bell with badge | P0 | Instagram | Lightweight notification access |
| Creator dashboard with earnings | P1 | TikTok Studio simplified | Creator retention depends on revenue visibility |
| Progress bars on episodes | P1 | Netflix | Resume behavior increases completion rates |
| "Unlock All" bundle pricing | P1 | KakaoPage | Increases average transaction value |
| 5-tab nav for creators (+ Upload) | P1 | TikTok + Instagram | Reduces creator upload friction |
| Share sheet with "Gift this film" | P1 | Custom for MNREELS | Viral growth mechanic |
| Series sorting (oldest/newest) | P1 | Webtoon | User control for serial content |
| Rating system (viewer ratings) | P2 | KakaoPage + App stores | Social proof for paid content decisions |
| Creator community feed | P2 | Webtoon | Between-release engagement |
| "Popular Creators" discovery section | P2 | Instagram Suggested | Creator ecosystem growth |
| Notification center with filtering | P2 | TikTok + Instagram | Organized notification management |

### 7.2 Key Differentiators for MNREELS

MNREELS is NOT a TikTok clone. It is a **paid short film platform with social features**. This changes several fundamental design decisions:

| Aspect | TikTok/Instagram | MNREELS |
|--------|-----------------|---------|
| Content length | 15-60 seconds | 1-15 minutes |
| Content type | UGC, disposable | Cinematic, scripted, rewatchable |
| Monetization | Free (ad-supported) | Coin-based micropayments |
| Content organization | Flat feed, no series | Series-first, episodic |
| Creator relationship | Casual follow | Invested (paid for their content) |
| Discovery primary mode | Algorithmic swipe | Swipe + intentional browsing |
| Profile purpose | Social identity | Portfolio/filmography |
| Comments purpose | Social chatter | Discussion about story/craft |

**These differences mean:**
1. The **series detail page** is more important than on TikTok (where individual videos stand alone)
2. **Creator profiles** need more depth (filmography, not just a video grid)
3. The **Coins tab** replaces what would be a Chat/Inbox tab on a free platform
4. **Content discovery** needs both algorithmic (swipe feed) AND intentional (search/browse) paths -- paid content requires more deliberate decision-making than free content
5. **Episode progress tracking** is essential (people pay for content and expect to resume where they left off)
6. **Ratings and reviews** are more important than on free platforms (they help justify purchase decisions)

### 7.3 Screen Map

```
                          +------------------+
                          |   App Open       |
                          +------------------+
                                  |
                    +-------------+-------------+
                    |                           |
              +-----v-----+              +------v------+
              | HOME FEED  |              | ONBOARDING  |
              | (For You/  |              | (first time |
              |  Following)|              |  only)      |
              +-----+------+              +-------------+
                    |
        +-----------+-----------+-----------+
        |           |           |           |
   +----v----+ +----v----+ +---v----+ +----v----+
   | Search/ | | Coins/  | | Profile| | Video   |
   | Discover| | Wallet  | |        | | Player  |
   +---------+ +---------+ +--------+ | (full   |
        |           |           |      | screen) |
   +----v----+ +----v----+ +---v----+ +----+----+
   | Genre   | | Buy     | | Watch  |      |
   | Page    | | Coins   | | History|  +---v----+
   +---------+ +---------+ +--------+  | Series |
                                        | Detail |
   +----v-----+  +----v-----+          +---+----+
   | Creator  |  | Creator  |              |
   | Profile  |  | Dashboard|          +---v----+
   +----------+  | (creator |          |Episode |
                  |  mode)   |          | List   |
                  +----------+          +--------+
```

### 7.4 Visual Design Language Summary

| Element | Specification |
|---------|--------------|
| **Primary background** | Dark (#0a0a0a to #1a1a1a) -- dark mode default for video platforms |
| **Card backgrounds** | Slightly lighter (#222222) for contrast |
| **Brand accent** | Gold/amber (#FFB800 or similar) for coins, CTAs, active states |
| **Secondary accent** | White (#FFFFFF) for text and icons on dark backgrounds |
| **Free badge** | Green (#22C55E) |
| **Paid/Locked badge** | Gold (#FFB800) with coin icon |
| **Like heart** | Red (#FF2D55) -- universal heart color |
| **Follow button** | Brand color fill, white text |
| **Unfollow/Following** | Outlined button, gray text |
| **Typography** | Inter or Noto Sans (Cyrillic support) |
| **Body text** | 16sp minimum |
| **Stats numbers** | 20-24sp bold |
| **Corner radius** | 12dp for cards, 24dp for buttons, circular for avatars |
| **Spacing** | 8dp grid system, 16dp standard padding |
| **Thumbnail ratio (grid)** | 9:16 for video grid, 3:4 for series posters |
| **Episode thumbnails** | 16:9 landscape in episode lists |

---

## Sources

### Creator Profiles
- [TikTok Profile Mockups - Figma](https://www.figma.com/community/file/1179084292922604749/free-tiktok-profile-mockups)
- [TikTok UI Screens - Figma](https://www.figma.com/community/file/874598319834758320/tiktok-ui-screens)
- [Instagram New Grid Layout 2026 - Kapwing](https://www.kapwing.com/resources/instagrams-new-grid-layout-size-and-dimensions-2025/)
- [Instagram Sizing Guide 2025 - Your Social Team](https://yoursocial.team/blog/instagram-new-grid-format)
- [WEBTOON Creator Profiles - WEBTOON CANVAS](https://webtooncanvas.zendesk.com/hc/en-us/articles/18556423002644-Creator-Profiles)
- [Setting up Creator Profile - WEBTOON CANVAS](https://webtooncanvas.zendesk.com/hc/en-us/articles/43607743553812-Setting-up-or-Editing-Your-Creator-Profile)

### Discovery & Navigation
- [TikTok Trend Discovery - Shopify](https://www.shopify.com/blog/tiktok-trend-discovery)
- [Mobile Navigation UX Best Practices 2026 - DesignStudioUIUX](https://www.designstudiouiux.com/blog/mobile-navigation-ux/)
- [Bottom Navigation Bar Guide 2025 - AppMySite](https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/)
- [Bottom Tab Bar Best Practices - UXDWorld](https://uxdworld.com/bottom-tab-bar-navigation-design-best-practices/)

### Series & Episode Pages
- [Netflix Design Patterns - UX Planet](https://uxplanet.org/next-episode-the-design-patterns-and-flows-of-netflix-592b63741f89)
- [Analyzing Netflix Design - CXL](https://cxl.com/blog/netflix-design/)
- [Redesigning Webtoon App UX - Medium](https://medium.com/@mandy.chong11/redesigning-the-webtoon-app-a-ux-case-study-624172d70d8a)
- [New Series Home - WEBTOON CANVAS](https://webtooncanvas.zendesk.com/hc/en-us/articles/37509749429268-New-Series-Home-Is-Here)
- [KakaoPage System - NamuWiki](https://en.namu.wiki/w/%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%8E%98%EC%9D%B4%EC%A7%80/%EC%8B%9C%EC%8A%A4%ED%85%9C)
- [How to Build App Like ReelShort - Enveu](https://www.enveu.com/blog/how-to-build-an-app-like-reelshort)
- [DramaBox vs ReelShort Comparison - YourAppLand](https://yourappland.com/dramabox-vs-reelshort-full-comparison-of-features-and-pricing/)

### Social Interaction UI
- [Bottom Sheet Design - Mobbin](https://mobbin.com/glossary/bottom-sheet)
- [Bottom Sheets UX Guidelines - Nielsen Norman Group](https://www.nngroup.com/articles/bottom-sheet/)
- [Bottom Sheets Best Examples - Plotline](https://www.plotline.so/blog/mobile-app-bottom-sheets)
- [Bottom Sheet Material Design 3](https://m3.material.io/components/bottom-sheets/overview)
- [TikTok Double Tap Like - Flutter](https://pub.dev/packages/tiktok_double_tap_like)

### Creator Dashboard
- [TikTok Studio](https://www.tiktok.com/tiktokstudio)
- [TikTok Creator Analytics](https://www.tiktok.com/analytics)
- [YouTube Studio Complete Guide 2025 - Onewrk](https://onewrk.com/youtube-studio-complete-guide-2025/)
- [YouTube Analytics Guide - Brandwatch](https://www.brandwatch.com/blog/youtube-analytics/)
- [YouTube Studio Guide 2026 - vidIQ](https://vidiq.com/blog/post/beginners-guide-youtube-studio/)

### Notification Design
- [Designing Notifications for Apps - UX Magazine](https://uxmag.com/articles/designing-notifications-for-apps)
- [Notification System Design - MagicBell](https://www.magicbell.com/blog/notification-system-design)
- [Designing App Notifications 2026 - MobileAppDaily](https://www.mobileappdaily.com/knowledge-hub/designing-app-notifications)

### Micro Drama Apps
- [How to Build Micro Drama App - FastPix](https://www.fastpix.io/tutorials/how-to-build-a-micro-drama-video-app-like-reelshort-or-dramabox)
- [Short Drama Apps - MobileAppDaily](https://www.mobileappdaily.com/products/short-drama-apps)
- [Apps Like ReelShort - Emizentech](https://emizentech.com/blog/apps-like-reelshort.html)
