# MNREELS - UX Best Practices: Making It Dead Simple

> Goal: Anyone in Mongolia should be able to open MNREELS, buy coins, and watch a short film
> in under 60 seconds -- without reading instructions.

---

## 1. Onboarding: Zero Friction to First Video

### 1.1 Watch First, Register Later (The TikTok Model)

TikTok's most powerful onboarding decision is letting users browse content before signing up.
MNREELS should adopt the same principle.

**Implementation:**

```
App Open -> Immediately show curated/trending short films
                -> No login wall
                -> No splash screen tutorial
                -> Just content
```

- Show the swipe feed immediately on first open. No registration gate.
- Display a soft prompt ("Sign up to save your favorites") only after the user has watched 2-3 free videos.
- Registration becomes the LAST step, not the first -- only required when users want to:
  - Purchase coins
  - Like/comment
  - Follow creators
  - Save to watchlist

**Why this works:** Duolingo uses the same pattern -- letting users complete a full lesson before
asking them to register. Users who experience value first convert at significantly higher rates
than those blocked by a registration wall.

### 1.2 Registration: 2 Steps Maximum

When the user does register, make it effortless:

| Step | Action | Notes |
|------|--------|-------|
| 1 | Phone number entry | Mongolia standard -- most users have a number, not email |
| 2 | SMS verification code | Auto-read the OTP if possible (SMS Retriever API on Android) |

- No email required. No password creation. Phone number IS the identity.
- Optional: Add display name + avatar later (progressive profiling).
- Social login (Facebook, Google) as secondary options, not primary.
- Pre-fill the country code (+976) automatically.

### 1.3 Progressive Onboarding (Don't Overwhelm)

Never show a tutorial. Teach features in context, when the user first encounters them:

| Moment | What to Teach | How |
|--------|---------------|-----|
| First video | "Swipe up for more" | Animated arrow overlay on first video only |
| First paid content | "This film costs 10 coins" | Inline card with "Buy coins" button |
| First coin purchase | Step-by-step QPay flow | Guided modal, 2-3 screens max |
| First like | "Follow this creator for more" | Toast notification |
| First search | "Try searching by genre" | Placeholder text in search bar |

**Key principle:** Each tooltip or guide appears ONCE, at the moment of relevance, then never
again. No onboarding carousel. No "skip" button needed because there's nothing to skip.

### 1.4 Free Content as the Entry Drug

- Every creator should be encouraged to make at least 1 video free.
- Series should allow the first 1-2 episodes free (as already specified in the coin system).
- Curate a "Free to Watch" section prominently on the home screen.
- New users get a small coin bonus (e.g., 10 coins) on first registration to try a paid film.

---

## 2. Navigation: 3 Taps or Less to Anything

### 2.1 Bottom Tab Bar: 4 Tabs Only

Research consistently shows 3-5 tabs is optimal. For MNREELS, use exactly 4:

```
  [Home]     [Search]     [My Coins]     [Profile]
    |            |              |              |
  Feed      Discover       Wallet          You
```

| Tab | Icon | Purpose |
|-----|------|---------|
| Home | Play icon (filled) | Main swipe feed -- trending, recommended, free content |
| Search | Magnifying glass | Genre browsing, search by title/creator, categories |
| My Coins | Coin/wallet icon | Coin balance, purchase coins, transaction history |
| Profile | Person icon | Watch history, liked videos, settings, creator dashboard |

**Why not 5 tabs?**
- No "Upload" tab in the main nav. Upload is accessible FROM the Profile tab for registered creators. Most users are viewers, not creators -- don't waste prime nav space on a minority use case.
- No "Notifications" tab. Use a badge dot on the Profile icon instead.

### 2.2 Navigation Depth: Maximum 3 Taps

Map every user journey to ensure nothing is more than 3 taps away:

| Action | Tap Path |
|--------|----------|
| Watch a trending film | Open app (0 taps -- auto-plays) |
| Search for a film | Home -> Search tab (1 tap) -> Type query (2 taps) |
| Buy coins | Home -> My Coins tab (1 tap) -> Select bundle (2 taps) -> Pay (3 taps) |
| View watch history | Home -> Profile tab (1 tap) -> History section (2 taps) |
| Upload a video (creator) | Profile (1 tap) -> Creator Dashboard (2 taps) -> Upload (3 taps) |
| Change language | Profile (1 tap) -> Settings (2 taps) -> Language (3 taps) |

### 2.3 Gesture Navigation

Follow established gesture patterns that users already know from TikTok/Instagram:

| Gesture | Action |
|---------|--------|
| Swipe Up | Next video in feed |
| Swipe Down | Previous video / Pull to refresh |
| Swipe Left | View video details (title, creator, description, related) |
| Swipe Right | Go back / Return to previous screen |
| Double Tap | Like the video |
| Long Press | Share options / Add to watchlist |
| Pinch (optional) | Not needed -- full-screen video by default |

**Important:** Add subtle visual affordances for gestures on first use:
- A small upward arrow animation on the first video
- A gentle "swipe left for details" hint shown once

### 2.4 Search & Discovery UX

```
Search Screen Layout:
+----------------------------------+
|  [Search bar with placeholder]   |
|  "Кино хайх..."                  |
+----------------------------------+
|  [Genre chips - horizontally     |
|   scrollable]                    |
|  Action | Drama | Comedy | ...   |
+----------------------------------+
|  [Trending Now - horizontal      |
|   scroll of thumbnails]          |
+----------------------------------+
|  [New Releases - vertical list]  |
+----------------------------------+
```

- Genre chips as horizontally scrollable pills (not a dropdown).
- Show recent searches for returning users.
- Display search results as thumbnails (visual, not text lists).
- Auto-suggest as the user types.
- Support both Mongolian Cyrillic and Latin input.

---

## 3. Payment UX: Coins in 3 Taps

### 3.1 The Coin Purchase Flow

The entire coin purchase should take no more than 3 taps from any screen:

```
Tap 1: "Buy Coins" button (or tap on paid video -> "Get coins to watch")
Tap 2: Select coin bundle (50 / 100 / 200)
Tap 3: Confirm in QPay/SocialPay app (auto-redirect and return)
```

**Coin Purchase Screen Design:**

```
+----------------------------------+
|        YOUR COINS: 25            |
+----------------------------------+
|                                  |
|  +----------------------------+  |
|  |  50 coins         ?₮      |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |  100 coins        ?₮      |  |  <-- "POPULAR" badge
|  |  Save ~10%                 |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |  200 coins        ?₮      |  |  <-- "BEST VALUE" badge
|  |  Save ~20%                 |  |
|  +----------------------------+  |
|                                  |
|  [QPay]  [SocialPay]             |
+----------------------------------+
```

### 3.2 QPay/SocialPay Integration UX

**Deep Link Flow (Preferred):**
1. User taps "Pay with QPay"
2. MNREELS generates a QR/invoice via QPay API
3. App deep-links to QPay app (or SocialPay) with the invoice pre-filled
4. User confirms payment in QPay (biometric/PIN -- their existing flow)
5. QPay returns to MNREELS via callback
6. Coins are credited instantly with a success animation

**Fallback Flow (QR Code):**
- If deep linking fails, display a QR code on screen
- User scans with their bank app
- MNREELS polls for payment confirmation via webhook

**Critical UX details:**
- Show a loading spinner with "Waiting for payment..." during the redirect
- If the user returns without paying, show "Payment not completed. Try again?" (not an error)
- On success, show a celebratory coin animation (coins falling) and immediately update the balance
- Auto-retry webhook polling for up to 60 seconds before timing out

### 3.3 Trust Signals for First-Time Payers

First-time payers in Mongolia need reassurance. Include:

| Signal | Implementation |
|--------|----------------|
| Familiar payment logos | QPay and SocialPay logos displayed prominently |
| Price transparency | Always show MNT price alongside coin amounts |
| Transaction history | Accessible from Profile -> My Transactions |
| Refund policy | Short, clear text: "Coin is returned if video fails to play" |
| Secure badge | Lock icon + "Аюулгүй төлбөр" (Secure payment) text |
| Social proof | "50,000+ хэрэглэгч" (50,000+ users) -- when applicable |
| Bank logos | Show logos of integrated banks (Khan, Golomt, TDB, etc.) |

### 3.4 Contextual Purchase Prompts

Don't make users go to a separate "store." Prompt purchases where they naturally occur:

- When tapping a paid video with 0 coins: "This costs 10 coins. Get 50 coins for ?₮?"
  - One-tap "Buy & Watch" button that combines purchase and viewing
- When coins are low (below 10): Subtle banner at bottom of feed: "Running low on coins"
- After watching a free episode in a series: "Get coins to watch Episode 2"

---

## 4. Mobile-First Design Patterns

### 4.1 Thumb Zone Optimization

75% of users navigate with their thumbs. On modern 6+ inch phones, the bottom third of the
screen is the "natural zone" with 96% tap accuracy.

**Layout principles:**
```
+----------------------------------+
|                                  |  <- HARD ZONE: Logo, status bar only
|                                  |     (no interactive elements)
|                                  |
|       VIDEO CONTENT AREA         |  <- STRETCH ZONE: Video plays here
|       (full screen)              |     (tap to pause/play is OK)
|                                  |
|                                  |
+----------------------------------+
|  [Like] [Comment] [Share] [Save] |  <- EASY ZONE: All actions here
+----------------------------------+
|  [Home] [Search] [Coins] [Profile]| <- EASY ZONE: Navigation here
+----------------------------------+
```

- ALL interactive buttons in the bottom 40% of the screen
- Video controls (play/pause) via tap anywhere on the video (large target)
- Action buttons (like, share) on the right side for right-thumb access
- Navigation bar pinned to the bottom, always visible

### 4.2 Touch Target Sizes

Follow platform guidelines strictly:

| Element | Minimum Size | Recommended |
|---------|-------------|-------------|
| Buttons | 44x44 pt (iOS) / 48x48 dp (Android) | 48x48 or larger |
| Tab bar items | 44x44 pt | Full width of tab divided equally |
| List items | 44 pt height | 56-72 pt height |
| Spacing between targets | 8 pt minimum | 12 pt recommended |
| Coin bundle cards | Full width | Large, card-based, easy to tap |

### 4.3 Visual-First, Minimal Text

For a Mongolian audience across age ranges:

- Use thumbnail images as the primary way to browse content (not text lists)
- Video titles: Maximum 2 lines, truncate with ellipsis
- Creator names: 1 line, with avatar
- Genre chips: Icon + short label (e.g., film icon + "Action")
- Coin prices: Large, bold number + coin icon (e.g., "10" + coin emoji-style icon)
- Use universally understood icons: heart (like), speech bubble (comment), arrow (share)

### 4.4 Loading States & Skeleton Screens

Never show a blank screen or a generic spinner. Use skeleton screens that mirror the final layout:

**Feed Loading Skeleton:**
```
+----------------------------------+
|  +----------------------------+  |
|  | [shimmer rectangle         |  |  <- Video thumbnail placeholder
|  |  for video area]           |  |
|  |                            |  |
|  +----------------------------+  |
|  [circle] [shimmer line ----] |  |  <- Avatar + title placeholder
|  [shimmer short line --]      |  |  <- Creator name placeholder
+----------------------------------+
```

**Implementation rules:**
- Skeleton appears for any load time between 300ms and 10 seconds
- Under 300ms: Show content directly (no flash of skeleton)
- Over 10 seconds: Show skeleton + "Slow connection" message with retry button
- Use a shimmer animation (left-to-right sweep) on skeleton elements
- Skeleton layout must match the actual content layout exactly -- no position shifts when real content loads
- Load video thumbnails progressively: show low-res blur-up, then sharp image

### 4.5 Video Player UX

The video player is the core of the app. It must be flawless:

| Feature | Implementation |
|---------|----------------|
| Auto-play | Videos auto-play (muted first time, then remember preference) |
| Tap to pause/play | Tap anywhere on the video |
| Progress bar | Thin line at bottom of video, expandable on touch |
| Quality selector | Auto (adaptive bitrate by default), manual override in settings |
| Buffering | Show a subtle circular spinner on video, not a separate screen |
| Scrubbing | Drag the progress bar with thumbnail preview |
| Fullscreen | Default is fullscreen vertical; landscape rotation for 16:9 content |
| Resume | Remember playback position for partially watched videos |

---

## 5. Accessibility & Inclusivity

### 5.1 Supporting Older Users

Mongolia has a significant population of 40-60+ year olds who are smartphone users but may
struggle with complex UIs:

**Typography:**
| Element | Minimum Size | Notes |
|---------|-------------|-------|
| Body text | 16sp (Android) / 16pt (iOS) | Never smaller |
| Headings | 20-24sp | Bold weight |
| Button labels | 16sp | All caps avoided (hard to read in Cyrillic) |
| Coin amounts | 24sp+ | Must be instantly readable |
| Video titles | 16sp | 2 lines max |

**Additional accommodations:**
- Offer a "Large Text" mode in settings that scales all text by 1.25x
- High contrast mode: Increase contrast ratios beyond WCAG AA (4.5:1) to AAA (7:1)
- Avoid relying on color alone to convey information (add icons/labels)
- Label all icons with text (especially in navigation)
- Simple, linear navigation flow -- avoid nested menus deeper than 2 levels
- Clear back buttons (not just gestures) for users unfamiliar with swipe navigation

### 5.2 Low Bandwidth Optimization

Many Mongolian users outside Ulaanbaatar have limited connectivity:

**Adaptive Video Streaming:**
| Connection | Resolution | Bitrate |
|------------|-----------|---------|
| Fast 4G/WiFi | 1080p | 4-6 Mbps |
| Standard 4G | 720p | 1.5-3 Mbps |
| Slow 3G | 480p | 500 Kbps - 1 Mbps |
| Very slow / 2G | 360p | 200-400 Kbps |

**Implementation:**
- Cloudflare Stream adaptive bitrate (already in tech stack) handles this automatically
- Preload the next 2 videos in the feed while the current one plays
- Compress thumbnails aggressively (WebP format, lazy loading)
- Cache viewed content locally for 48 hours (matches the rewatch window)
- Show a "Data Saver" toggle in settings that forces 480p max
- Display a connection quality indicator when bandwidth is poor
- Text content and UI loads first, then images, then video -- progressive enhancement

**Lightweight app shell:**
- Target under 2MB for the initial PWA download
- Code-split routes so only the feed page loads initially
- Use service worker for caching static assets and API responses

### 5.3 Offline Capabilities

| Feature | Offline Behavior |
|---------|-----------------|
| Previously watched videos | Playable from cache (within 48-hour window) |
| Browse feed | Show cached thumbnails + "Connect to watch" message |
| Coin balance | Display last known balance from local storage |
| Transaction history | Show cached transactions |
| Search | Not available offline; show clear message |
| Upload (for creators) | Queue upload, auto-send when back online |

- Detect offline state and show a subtle top banner: "No connection -- showing saved content"
- Never show an error screen. Always show something useful.

### 5.4 Mongolian Language UI Considerations

**Cyrillic Typography:**
- Use fonts that render Mongolian Cyrillic cleanly (e.g., Inter, Roboto, or Noto Sans -- all support Cyrillic)
- Test all UI strings for text overflow -- Mongolian words can be long
- Allow 30-40% extra space for Mongolian labels compared to English equivalents
- Button labels: Use short Mongolian words or established loanwords when possible

**Language Strategy:**
| Element | Language |
|---------|----------|
| Primary UI | Mongolian Cyrillic |
| Fallback | English for technical terms with no Mongolian equivalent |
| Genre names | Mongolian (Уран сайхан, Инээдмийн, Аймшгийн, etc.) |
| Error messages | Mongolian, in plain conversational language |
| Payment screens | Mongolian + MNT currency formatting |
| Creator dashboard | Mongolian with English option toggle |

**Localization details:**
- Date format: YYYY.MM.DD (Mongolian standard)
- Currency: "₮" symbol, thousands separated by comma (e.g., ₮5,000)
- Number formatting: Follow Mongolian conventions
- Right-to-left: NOT needed (Mongolian Cyrillic is left-to-right)
- Consider future support for traditional Mongolian vertical script if targeting Inner Mongolia users

---

## 6. Creator Upload UX

### 6.1 Upload Flow: 3 Steps, 1 Screen

Creators should be able to upload a video in under 2 minutes:

```
Step 1: Select Video
  -> Tap "Upload" button in Creator Dashboard
  -> Opens phone gallery / file picker
  -> Select video file
  -> Upload begins immediately in background

Step 2: Add Details (while video uploads)
  +----------------------------------+
  |  [Video Preview - thumbnail]     |
  |  Upload progress: ████░░ 67%     |
  +----------------------------------+
  |  Title: [___________________]    |
  |  Genre: [Action v] (dropdown)    |
  |  Price: [Free / 10 / 12 / 15]   |
  |         (radio buttons by length)|
  |  Description: [___________]     |
  |  (optional)                      |
  +----------------------------------+
  |  Series: [None / Select series]  |
  |  Episode: [Auto-numbered]        |
  +----------------------------------+
  |                                  |
  |     [Preview & Publish]          |
  +----------------------------------+

Step 3: Preview & Confirm
  -> Watch the video as viewers will see it
  -> Confirm title, price, genre are correct
  -> Tap "Publish" -> Video enters moderation queue
```

### 6.2 Smart Defaults & Auto-Fill

Reduce creator effort with intelligent defaults:

| Field | Auto-Fill Behavior |
|-------|-------------------|
| Title | Suggest based on filename (strip extension, replace underscores) |
| Genre | Suggest based on creator's previous uploads |
| Price | Auto-set based on video duration (1-5 min = 10, 5-10 = 12, 10-15 = 15) |
| Thumbnail | Auto-generate 3 options from video frames; creator picks or uploads custom |
| Description | Optional -- don't require it |
| Series | Default to "Standalone" unless creator has existing series |
| Episode number | Auto-increment if part of a series |

### 6.3 Upload Progress & Reliability

- Show a persistent progress bar during upload (percentage + estimated time)
- Allow the creator to navigate away from the upload screen -- upload continues in background
- If upload fails (network issue), auto-retry up to 3 times
- If still failing, save the draft locally and offer "Resume upload" when connection returns
- Support chunked upload for large files (resilient to connection drops)
- Show file size and estimated upload time before upload begins
- Maximum file size clearly stated (e.g., "500MB maximum")

### 6.4 Thumbnail Generation

- Auto-extract 3-5 key frames from the uploaded video
- Present them in a horizontal carousel: "Choose your thumbnail"
- Allow custom thumbnail upload as an alternative
- Show how the thumbnail will look in the feed (preview in context)
- Recommended aspect ratio guide overlay (9:16 or 16:9)

### 6.5 Post-Upload Experience

After publishing:
```
+----------------------------------+
|                                  |
|     "Video submitted!"           |
|     (checkmark animation)        |
|                                  |
|  Your video is being reviewed.   |
|  You'll be notified when it's    |
|  live (usually within 24 hours). |
|                                  |
|  [View My Videos]  [Upload More] |
+----------------------------------+
```

- Send a push notification when the video is approved and live
- Send a notification if the video is rejected, with clear reasons
- Show view count and coin earnings in the Creator Dashboard in real-time

### 6.6 Creator Dashboard (Minimal)

```
+----------------------------------+
|  Creator Dashboard               |
+----------------------------------+
|  Total Earnings: 5,230 coins     |
|  Available for Payout: 4,000     |
|  [Request Payout]                |
+----------------------------------+
|  My Videos:                      |
|  +-----+ Title 1    Views: 1.2K |
|  |thumb| Coins earned: 450      |
|  +-----+ Status: Live           |
|  +-----+ Title 2    Views: 340  |
|  |thumb| Coins earned: 120      |
|  +-----+ Status: In Review      |
+----------------------------------+
|  [Upload New Video]              |
+----------------------------------+
```

---

## 7. Summary: The "Golden Rules" for MNREELS UX

1. **Content first, registration later.** Let users watch free content immediately.
2. **3 taps maximum** to reach any feature or content.
3. **4 bottom tabs only.** Home, Search, Coins, Profile. Nothing more.
4. **Phone number = identity.** No email, no password. SMS OTP only.
5. **Coins in 3 taps.** See paid video -> buy coins -> pay via QPay -> watch.
6. **Thumb zone everything.** All interactive elements in the bottom 40% of screen.
7. **No blank screens.** Skeleton loading for everything; cached content when offline.
8. **Mongolian first.** All UI in Cyrillic, with Mongolian-standard formatting.
9. **Progressive teaching.** Teach features one at a time, in context, not all at once.
10. **Creator simplicity.** Upload = pick video + add title + publish. Smart defaults handle the rest.

---

## References & Research Sources

- [TikTok Onboarding -- AppCues](https://goodux.appcues.com/blog/tiktok-user-onboarding)
- [Netflix Signup Onboarding -- UserOnboarding Academy](https://useronboarding.academy/user-onboarding-inspirations/netflix-signup-onboarding)
- [Bottom Tab Bar Best Practices -- UX Planet](https://uxplanet.org/bottom-tab-bar-navigation-design-best-practices-48d46a3b0c36)
- [Bottom Navigation Guide 2025 -- AppMySite](https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/)
- [Thumb Zone UX in 2025 -- Bootcamp/Medium](https://medium.com/design-bootcamp/the-thumb-zone-ux-in-2025-why-your-mobile-app-needs-to-rethink-ergonomics-now-9d1828f42bd9)
- [Designing for Thumb Zones -- Elaris Software](https://elaris.software/blog/mobile-ux-thumb-zones-2025/)
- [Skeleton Screens 101 -- Nielsen Norman Group](https://www.nngroup.com/articles/skeleton-screens/)
- [Skeleton Loading Screen Design -- LogRocket](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)
- [Progressive Onboarding -- UserPilot](https://userpilot.com/blog/progressive-onboarding/)
- [App Onboarding Best Practices -- Apphud](https://apphud.com/blog/app-onboarding-best-practices)
- [QPay Mongolia](https://qr.qpay.mn)
- [SocialPay 3.0](https://socialpay.mn/en)
- [QPay Shopify Integration -- CartDNA](https://www.cartdna.com/shopify-payment-methods/QPay)
- [File Upload UX Best Practices -- Uploadcare](https://uploadcare.com/blog/file-uploader-ux-best-practices/)
- [File Upload UI Tips -- Eleken](https://www.eleken.co/blog-posts/file-upload-ui)
- [Design for Older Adults -- PMC/NIH](https://pmc.ncbi.nlm.nih.gov/articles/PMC12350549/)
- [Interface Design for Older Adults -- Toptal](https://www.toptal.com/designers/ui/ui-design-for-older-adults)
- [Optimizing Apps for Low Bandwidth -- DevelopersAppIndia](https://developersappindia.com/blog/optimizing-mobile-apps-for-low-bandwidth-environments)
- [Frictionless Payments Guide -- Nuvei](https://www.nuvei.com/posts/frictionless-payments)
- [Instagram Gesture Navigation -- UX Collective](https://uxdesign.cc/improving-instagram-experience-with-gestures-f40bf429569c)
- [UI/UX for Multilingual World -- Medium](https://medium.com/@lindiebotes/ui-ux-design-for-a-multilingual-world-languages-digital-literacy-in-app-design-5870c5fa6949)
- [Mobile Navigation UX 2026 -- DesignStudioUIUX](https://www.designstudiouiux.com/blog/mobile-navigation-ux/)
- [Virtual Currency in Apps -- Corefy](https://corefy.com/blog/how-do-virtual-currencies-in-apps-and-games-work)
