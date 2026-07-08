# VeilPay mobile / white-theme fix plan

Six issues reported (mostly Android + light-mode toggle). Below: root cause and the
exact change per issue. All changes are Tailwind/CSS-only, no logic changes.

## Theme model recap (important)
Light mode = `html.light-mode { filter: invert(1) hue-rotate(180deg) }` on the whole
document. `.preserve-color` re-inverts a subtree back to its authored colors.
The phone layers (`phoneRef`, `image2Ref`, `image3Ref`) are `preserve-color`, so
anything authored inside them renders with its authored color in BOTH themes.
The `DownloadSection` is NOT preserve-color, so it fully inverts in light mode.

---

### #1 — Android: "Private by default / Multi-chain by design" too small
- **File:** `src/components/HeroTitle.tsx`
- **Cause:** `clamp(3rem,9vw,7.75rem)` — on ~393px Android the 9vw term (~35px) falls
  below the 3rem floor, so text is pinned at the small 3rem minimum.
- **Fix:** Raise the mobile term/floor so it scales up on phones while the desktop max
  (7.75rem / 6.25rem) is unchanged:
  - line 1/2 `Private by` / `default.` → `clamp(3.4rem,15vw,7.75rem)`
  - line 3/4 `Multi-chain` / `by design.` → `clamp(2.9rem,12.5vw,6.25rem)`

### #6 — Mobile: "Introducing VEILPAY" unreadable (sits over the phone)
- **File:** `src/components/IntroTitle.tsx`
- **Cause:** On mobile the layout stacks the two words at `pt-[20vh]`/`pb-[15vh]` while
  the hero phone is full-bleed (`w-[420px]`), so both words land on top of the busy
  wallet UI. White "Introducing" disappears over light areas; gold "VEILPAY" over the UI.
- **Fix:** Add a cheap (blur-free) dark radial scrim behind each word on mobile only
  (`md:hidden`) and strengthen the text shadow, so both read clearly regardless of what
  is behind them. Nudge padding so words hug the top/bottom edges.

### #2 — White theme: social icons blend into the light background
- **File:** `src/components/DownloadSection.tsx`
- **Cause:** Section inverts in light mode; icons are `text-gray-400` which lands as a
  low-contrast mid-tone on the now-light box.
- **Fix:** Make the icon color theme-aware — keep `text-gray-400` in dark mode, and in
  light mode author a lighter value (which inverts to a darker, readable tone). Done via
  a `.download-social` class + `html.light-mode .download-social` rule in `index.css`.

### #3 — Footer "VEILPAY" wordmark not big enough on mobile
- **File:** `src/components/BrutalistFooter.tsx`
- **Cause:** `clamp(2.5rem,18vw,30rem)` — 18vw fills a desktop viewport edge-to-edge but
  on a phone leaves large side gaps.
- **Fix:** Split the responsive size: mobile `clamp(2.5rem,25vw,30rem)` (edge-to-edge,
  Antigravity-style), desktop unchanged at 18vw via a `md:` breakpoint. Footer already
  has `overflow-x-hidden`, so slight overshoot can't cause a scrollbar.

### #4 — Feature section: the 2 mockups fully cover instead of coinciding
- **File:** `src/components/ScrollSequence.tsx`
- **Cause:** `image2`, `image3` and the base phone all use the identical wrapper
  (`translate-x-[2vw]`) and same size, so image3 lands exactly on top of image2 —
  it fully covers rather than overlapping side-by-side.
- **Fix:** Give image3's wrapper a small offset (translate X/Y + slight scale) so the two
  payment/wallet screens partially overlap and read as two stacked cards. Mobile keeps a
  smaller offset than desktop.

### #5 — White theme: gradient behind the phone-screen logo stays black
- **File:** `src/components/IPhoneMockup.tsx` + `src/index.css`
- **Cause:** The dark radial scrim behind the intro logo lives inside the
  `preserve-color` phone layer, so its authored black stays black in light mode — a dark
  blob over the light wallet UI.
- **Fix:** Add a `.screen-scrim` class; in `html.light-mode .screen-scrim` override the
  gradient to a light/white halo (`!important` beats the inline style) so it becomes a
  soft light glow around the gold mark in light mode.

---

## Verification
- `npx tsc --noEmit -p tsconfig.app.json` (full `npm run build` can't run in-sandbox).
- Re-read each edited file.
- User builds/deploys on their own Windows machine (Vercel).
