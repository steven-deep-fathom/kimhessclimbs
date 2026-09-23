# Mobile and performance pass

**Status:** In Progress. Phase 1 approved by Steven 2026-09-22; implemented on `perf-mobile`, uncommitted, awaiting his review on the local dev server before any commit or publish.
**Risk:** HIGH (build pipeline change, more than two files, live site deploys on push to `main`)
**Repo:** `/Users/stevenhess/Code/hobby/Kim_Hess_Climbs/kim-hess-site`, `main` at `4089c8d`, remote `github.com/steven-deep-fathom/kimhessclimbs`. `.github/workflows/deploy.yml` builds (Node 20, `npm ci && npm run build`) and publishes `dist/` to GitHub Pages on every push to `main` and on manual dispatch. If the CI build fails, nothing deploys and the current site stays up.

## Decision

Fix the phone layout and page weight without changing content or visual direction. Work on branch `perf-mobile`. Nothing reaches `main` until an independent critic approves and Steven approves the push. `.env.local` is never read or printed.

## Baseline (live site, 2026-09-22; Playwright, Chromium)

| Symptom | Evidence |
|---|---|
| Page weight | 25.6 MB decoded before scrolling, about 93 requests (Phase 0 audit, all frames). By host: YouTube 12.8 MB, site files 8.5, unpkg 3.4, Tailwind CDN 0.4. Before-scroll ≈ full-scroll because every image loads eagerly. An earlier 7.2–7.5 MB figure was `transferSize` (compressed, same-origin only) and is not comparable |
| Leftover scripts | `index.html` loads React 18 UMD, Babel standalone, Framer Motion 10 UMD, a React 19 import map, and the Tailwind play CDN (3.4.17), which prints a production warning |
| Bundle | `index-HnMRvpRz.js` is 1,000,673 bytes and includes D3 (used only by `#globe`) and Three.js (used only by `#private`) |
| Images | `public/images` is 28 MB. JPEG widths: 76 at 1340 px, 23 at 1500, 1 at 2500; the hero is 1600×900; portraits 325–375 px |
| Desktop nav | At 1440 px, "Book Now" (x 1471–1553) and the social icons (to x 1654) sit past the 1328 px content edge. `max-w-7xl` gives the same 1216 px box at every width ≥ 1280, so it overflows at 1280–1920 |
| Globe nav | On `#globe`, clicking a nav link leaves hash `#globe` and scrollY 0. `handleNavClick` (`components/Navbar.tsx:31-47`) calls `preventDefault` and finds no element |
| Hero on phones | At 390 px with `object-center`, the visible source band is x ≈ 592–1008. Kim's body centre is at source x ≈ 1230, so only her glove shows |
| Timeline on phones | The unprefixed `items-end` (`components/GrandSlam.tsx:94`) right-aligns alternate badges |
| Gallery | 7 cards in `lg:grid-cols-3` with `aspect-[4/3]` (`components/Expeditions.tsx:60,68`) leave Kosciuszko alone on the last row; `md` (2 columns) also has an orphan |
| Blog on phones | Cards are a fixed `w-96` (384 px) with a hard-coded 408 px scroll step (`components/Blog.tsx:24,78`), so they clip at 390 px |
| Globe on phones | `GlobePage.tsx:206-207` passes a fixed 700×550; `RotatingGlobe.tsx:99-108` sizes from `window.innerWidth`, with no resize handling |
| External fetch | Land outlines come from `raw.githubusercontent.com/martynafford/natural-earth-geojson` |
| `#private` | Public, and statically imported by `App.tsx:16-20` |
| Sideways pan on phones | Page overflow (`scrollWidth − clientWidth`) of 34 px at 390, 26 at 768, and 18 at 1024 and 1280. At all four widths the cause is the Story slide-ins (`components/Story.tsx:28` `x: -50`, `:49` `x: 50`), which sit off-screen until scrolled into view. The fixed nav overruns visually (R1) but doesn't add page overflow |

## Regression checks (`scripts/audit.py`)

Each check must **fail against the baseline** and pass after its fix.

| ID | Assertion | Widths |
|---|---|---|
| R1 | At 1280, 1440 and 1920: the menu is not squeezed (row `scrollWidth` ≤ `clientWidth` with the menu set to `flex-shrink:0`), every control is single-line (equal heights), the last control ends at or before the `max-w-7xl` content edge, and the logo-to-menu gap is ≥ 32 px. Below 1280: the hamburger shows and sits inside viewport − 16 px. (The baseline fails: controls overrun to x 1654 at 1440.) | 390, 768, 1024, 1280, 1440, 1920 |
| R2 | On `#globe`, each nav link lands on `#home` with the target section's top within 100 px of the viewport top | 1440, 390 |
| R3 | Every GrandSlam item's badge row, `h3` and `p` share a left x (±2 px) | 390 |
| R4 | Kim's head box (source x 1180–1290, y 390–510, mapped through the rendered `object-position`) is inside the viewport and doesn't overlap the glyph boxes (`Range.getClientRects()`) of the hero `h2`, `h1`, subtitle `p` or buttons | 390, 768 |
| R5 | No empty gallery grid cell | 768, 1280 |
| R6 | Every blog card is fully visible when scrolled into place | 390 |
| R7 | The globe canvas is square, fills its container width, and renders with `raw.githubusercontent.com` blocked | 390, 1440 |
| R8 | No horizontal page overflow, sampled on load **before scrolling** and again after a full scroll; no first-party console errors (third-party iframe messages, such as YouTube's permissions-policy notice, are logged but excluded); first-paint screenshot of the menu button saved | all six |
| R9 | The contact form renders. A submit is sent with Formspree intercepted by `page.route`, so no email goes out, and the success state shows | 390, 1440 |
| R10 | The phone menu (opened at 390 and 1024 px) contains a link to `#contact` | 390, 1024 |

**Weight metric:** decoded response-body bytes (`len(await response.body())`) summed over every finished request in **all frames**, iframes included, from Playwright network events; cache disabled; home page, before scrolling and after a full scroll, at 390 and 1440 px. This counts cross-origin CDN scripts and YouTube frames, which `decodedBodySize` reports as 0, and it is comparable between the live site and a local preview. Each `response.body()` call is wrapped in a try block: redirects count as 0, and the number of failed bodies (aborted, evicted, 206) is reported. Every run uses a fresh browser context plus CDP `Network.setCacheDisabled`, and bodies are awaited before the page closes. Encoded transfer bytes are recorded once more on the live site after deploy.
**Budgets (unproven until measured):** before scrolling ≤ 1.5 MB decoded; full scroll ≤ 3 MB. If a budget is missed, the report states the gap and the cause.

## Phases

**Phase 0: Branch and baseline.**
- Create `perf-mobile`.
- **D1:** include the pending `vite.config.ts` port change (8849 → 6900, per `~/Code/OPERATIONS.md`) and the untracked `AGENTS.md` in the first commit.
- Write `audit.py`, run it against the live site, and save the output to `docs/plans/evidence/2026-09-22_baseline/`.
- **Gate:** R1–R7 fail as expected; R8, R9 and R10 record their baseline.

**Phase 1: Build cleanup.**
- `index.html`: remove the React 18, Babel, Framer Motion and import-map tags and the Tailwind CDN. Create `index.css` beginning with `@tailwind base; @tailwind components; @tailwind utilities;` (the CDN injected preflight implicitly). Move the whole inline `<style>` block (scroll padding, body and heading fonts, colours, `.scroll-smooth`, scrollbar, `.scrollbar-hide`, `line-clamp-*`, `perspective-500`) into it after `@tailwind base`, and import it from `index.tsx`.
- Add `tailwindcss@3.4.17`, `postcss` and `autoprefixer`. `tailwind.config.js` carries the brand colours, fonts and `spin-slow` animation. Content globs: `./index.html`, `./*.{ts,tsx}`, `./components/**/*.tsx`, `./pages/**/*.tsx`, `./utils/**/*.ts`. Every class is a literal string today (no concatenated class names), so purging is safe.
- `vite.config.ts`: remove the `GEMINI_API_KEY` `define` (nothing reads `process.env`), and set `server.host: 'localhost'` and `preview.port: 6900`. `tsconfig.json`: add `vite/client` to `types`.
- `App.tsx`: load `GlobePage` with `React.lazy`, with a dark full-screen spinner as the Suspense fallback. Add a chunk-load error boundary that reloads once, guarded by a `sessionStorage` flag, to handle stale tabs after a deploy.
- **D2:** load the private pages with `React.lazy` inside an `if (import.meta.env.DEV)` branch so Rollup drops them. On the live site, `#private/*` then shows Home.
  - **Superseded by Steven, 2026-09-22:** deploy the mockups live, unlisted, and not wired into any live page. Private routes are lazy-loaded in production at their `#private/...` URLs, and mockup assets are served from `public/sandbox-assets/`.
- **Gate:**
  - `npm ci && npm run build && npx tsc --noEmit` pass under Node 20 (the version CI uses).
  - `dist/CNAME` exists.
  - A separate audit build with `build.sourcemap: true` (to a scratch `outDir`, not `dist/`): the entry chunk's `.map` `sources` contain no `node_modules/d3-*` or `node_modules/three`, and no chunk's sources include `pages/private/`.
  - `grep -r '#private/mountain-scene' dist` finds nothing (a route string survives minification; component names don't).
  - Screenshots at six widths match the baseline apart from the intended changes (reviewed side by side).
  - R8 no worse than the baseline (its Story cause is fixed in Phase 3); R9 passes.

**Phase 2: Images, video and data.**
- `scripts/optimize-images.mjs` uses `cwebp` to write `name-640.webp` and `name-1280.webp` for every JPEG and PNG under `public/images`. Variants are **capped at the source width**: a 375 px portrait gets a single `name-375.webp`, and nothing is upscaled. The script also writes `utils/imageManifest.json` (path → width, height, variants).
- The WebP files are **committed**, because CI has no `cwebp`. The repo-size change is measured and reported. The original JPEGs stay in place.
- `components/ResponsiveImage.tsx` reads the manifest and outputs `<picture>` with `srcset`, `sizes`, `width` and `height`, `loading="lazy"` and `decoding="async"`. Paths not in the manifest (the Unsplash URLs at `constants.ts:168,176`) pass through as a plain `<img>`.

  | Call site | Behaviour |
  |---|---|
  | `Hero.tsx:11` | `eager`, `fetchpriority="high"` |
  | `Story.tsx:35` | lazy |
  | `Speaking.tsx:46`, `Speaking.tsx:98` | lazy |
  | `Blog.tsx:82` (card) | lazy |
  | `Blog.tsx:141` (modal) | eager when opened |
  | `Partners.tsx:23` | lazy |
  | `Expeditions.tsx:71` (card) | lazy |
  | `Expeditions.tsx:143` (lightbox `motion.img`) | keeps `motion.img`, adds `srcSet`/`sizes` |
  | `Expeditions.tsx:188` (thumbnails) | smallest variant |

- `components/YouTubeFacade.tsx` replaces the iframes in `Press.tsx`: an `i.ytimg.com` thumbnail and a play button, swapped on click for a `youtube-nocookie.com` iframe with `autoplay=1`.
- Copy `ne_110m_land.json` (Natural Earth, public domain) to `public/data/`; `RotatingGlobe.tsx` fetches it through `assetPath`.
- **Gate:** R7 passes; both budgets are met or explained; every image renders; the lightbox and thumbnails work; all three videos play on click.

**Phase 3: Layout fixes.**
- **Nav (`Navbar.tsx`):** below `xl` (1280 px), show the hamburger: the desktop bar `hidden lg:block` → `hidden xl:block`, and the button and phone panel `lg:hidden` → `xl:hidden` (`:108`, `:121`); add `aria-label` and `aria-expanded`.
  - **D4:** in the **desktop bar only**, filter out the "Contact" entry ("Book Now" already goes to `#contact`, `:80`) and remove the Instagram and Facebook icons. The `navLinks` array (`:20`; Contact entry at `:28`) keeps Contact, because the phone menu is built from it (`:123-132`) and has no Book Now. Social links stay in the phone menu (`:133-153`), the contact card (`Contact.tsx:55-59`) and the footer (`Footer.tsx:17-37`).
  - Set `space-x-8` → `space-x-4`, link `px-3` → `px-2`, `ml-10` → `ml-6`, and add `whitespace-nowrap` to every control.
  - **Measured** on the live DOM with exactly these changes, after the styles applied (2026-09-22, `scratchpad/nav5.py`; the round-4 critic reproduced it): menu 890 px, every control 36 px tall (none wrap), and a 68 px logo-to-menu gap at 1280, 1440 and 1920 (the content box is 1216 px at every width ≥ 1280). The R1 floor is 32 px, leaving a 36 px margin. An earlier figure of 794 px / 164 px was measured before the styles applied, and is wrong.
  - Globe pages: when the target id is missing, set `location.hash`. `HomePage` scrolls to `location.hash` with an 80 px offset after mount, which also fixes deep links such as `/#story`. Fixes R1 and R2.
- **Hero (`Hero.tsx`):** below `lg`, `object-position` 82% 50%. The critic measured her head box at x 196–299, y 366–478 (390×844) and x 480–605, y 444–580 (768×1024). The current centred text overlaps it at both widths. **D3** changes the layout:
  - **`sm` to `lg` (768 px):** the text stack (352 px) moves below the head, where there are 444 px free.
  - **Below `sm` (390 px):** the stack (479 px) fits neither above the head (286 px) nor below it (366 px). It splits: eyebrow `h2` and `h1` go above the head; subtitle and buttons go below, with the buttons side by side.
  - Fit at 390 is UNPROVEN until built. R4 enforces it, and Steven sees the phone screenshots at the Phase 3 gate. Buttons are content-width (no full-width stretch): side by side on phones, and side by side below the text at tablet width. The teal divider bar (`Hero.tsx:36`) stays directly under the `h1`.
- **Story slide-ins (`Story.tsx`):** add `overflow-x-clip` to the section so the `x: ±50` entrance animations (`:28`, `:49`) can't widen the page. Fixes R8. `JointSpeaking.tsx` uses the same pattern but isn't rendered (`App.tsx` doesn't import it), so it is left alone.
- **Timeline (`GrandSlam.tsx:94`):** `items-end` becomes `md:items-end` (`:97` is already `md:`-prefixed). Fixes R3.
- **Gallery (`Expeditions.tsx`):**
  - Use `grid-flow-row-dense`, and replace the aspect ratio with fixed row heights (`auto-rows-[16rem] lg:auto-rows-[18rem]`).
  - **D5:** Everest gets `md:col-span-2`, filling 4 rows at `md`. Vinson gets `lg:col-span-2`, so there are 9 cells, filling 3 rows at `lg`. The span classes are literal strings chosen by `expedition.id`. Fixes R5.
- **Blog (`Blog.tsx`):** cards `w-[85vw] max-w-96`; the scroll step is read from the first card's width plus the gap. Fixes R6.
- **Globe (`GlobePage.tsx`, `RotatingGlobe.tsx`):** a ResizeObserver sizes the canvas to container width as a square, capped at 700 px. Below `lg`, the peak list becomes a horizontal chip row under the globe, and the detail card's stats stack. Fixes R7.
- **Gate:** R1–R10 pass at every width. Steven reviews the phone screenshots.

**Phase 4: Review and release.**
- Update the stale docs in the same branch: `CLAUDE.md`, `AGENTS.md`, `.claude/CLAUDE.md` and `.claude/rules/styling.md` (Tailwind CDN → PostCSS, port 6900).
- Run the audit against `npm run preview` (port 6900) and write `docs/plans/evidence/2026-09-22_after/` with a before/after table.
- **Independent critic:** a separately spawned reviewer agent reads `git diff main...perf-mobile` plus the evidence. This is *not* the project's `.claude/commands/review.md`, which reads only `HEAD~1` in the same session. STOP or REVISE blocks release. The project's `/deploy` command (which runs `git add .` and pushes) is not used.
- **Operator gate:** Steven approves. Merge with `git merge --no-ff perf-mobile`, then push `main`, which deploys. Re-run the audit against kimhessclimbs.com and record live transfer bytes.
- **Rollback:** `git revert -m 1 <merge>` and push.

## Out of scope
Visual redesign, the globe concepts (`2026-09-22_globe-concept-mockups.md`), self-hosted fonts, content edits, the disabled Instagram feed, and rewriting the project's `.claude/commands`.

## Decisions for Steven
| # | Question | Recommendation |
|---|---|---|
| D1 | Commit the pending port change and `AGENTS.md`? | Yes |
| D2 | What happens to `#private` on the live site? | Dev-only (shows Home) |
| D3 | Hero text moves off Kim's head below `lg`: below the head at tablet width, split above and below it on phones | Yes (required: the current text covers her head) |
| D4 | Remove the duplicate "Contact" link from the desktop bar only, plus the desktop social icons (they remain in the phone menu, contact card and footer)? | Yes |
| D5 | Wide gallery cards | Everest (md, lg), Vinson (lg) |

## Outcomes

**Phase 0 (2026-09-22):**
- Branch `perf-mobile` created from `main` `4089c8d`. Nothing committed; D1 is held until Steven approves a commit.
- `scripts/audit.py` written. The baseline is in `evidence/2026-09-22_baseline/`.
- As expected, R1–R7 fail; R1 passes at 768 only, where the hamburger already shows. R8 fails at 390–1280, with 35 px overflow before scrolling. R9 passes. R10 passes at 390 and fails at 1024.
- Weight: 25.6 MB decoded before scrolling. Of that, YouTube is 12.8, site files 8.5, unpkg 3.4 and the Tailwind CDN 0.4.

**Phase 1 (2026-09-22), all gate items met:**
- `tsc --noEmit` passes. Three pre-existing tuple errors in `RotatingGlobe.tsx` were fixed, and `vite/client` resolved the `import.meta.env` error.
- Clean `npm ci`, build and `tsc` pass under Node 20.20.2 (npx `node@20`).
- `dist/CNAME` is present.
- The source-map build shows the entry chunk has no `d3`, `three` or `pages/private` sources; D3 is only in the `GlobePage` chunk. `grep '#private/' dist` finds nothing.
- Main JS went from 1,000,673 to 406,370 bytes. CSS is 36 KB, including the production-only exclusion of `pages/private/**`.
- The audit against a local preview is in `evidence/2026-09-22_phase1/`. R8 is no worse (35 px, the same Story cause), with no first-party console errors. R9 passes. Weight is 21.2 MB decoded before scrolling: unpkg and the Tailwind CDN are gone, and YouTube's 12.8 MB remains until Phase 2.
- Full-page screenshots are visually equivalent to the baseline at all six widths: at most 0.001% of pixels differ by more than 40 levels, around the bouncing scroll indicator. The `#globe` comparison covered only the error state, because R7 blocks the land-data host. The critic confirmed separately in dev that the lazy globe page renders with data.
- Beyond the plan: `index.css` drops the hand-written `line-clamp-*` rules (Tailwind 3.4 has them natively).
- Independent critic (2026-09-22): REVISE, with no HIGH findings. Fixes made:
  - Outcomes and the baseline weight row corrected.
  - `ChunkErrorBoundary` now reloads only on chunk-load errors, and its flag clears after 10 s.
  - `tailwindcss` pinned to exactly 3.4.17.
  - Mockup WebGL contexts are released and their animations cancelled on unmount.
- Open, to fix in Phase 3 when those checks become the gates: R2 doesn't assert the hash, R6 doesn't exercise the scroll step, and R7 doesn't verify land pixels.
- **Budget note:** the ≤ 1.5 MB / ≤ 3 MB budgets were set against this decoded metric. The baseline is 25.6 MB, so Phase 2 has to remove YouTube (12.8 MB) and make images lazy to reach them.

