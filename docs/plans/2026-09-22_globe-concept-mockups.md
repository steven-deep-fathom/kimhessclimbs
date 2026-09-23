# Globe concept mockups

**Status:** In Progress. Steven asked for the mockups on 2026-09-22. S0–S3 are built in the working tree on `perf-mobile` (uncommitted), and S4 review is pending.
**Risk:** HIGH (more than two files; new WebGL code; assets that could leak to the live site)
**Repo:** `/Users/stevenhess/Code/hobby/Kim_Hess_Climbs/kim-hess-site`

## Decision

Build three clickable mockups of the globe page that exist only in the local dev server. Nothing from them reaches kimhessclimbs.com: not pages, not code, not textures. Steven picks a direction from the review packet, and the production build becomes its own plan.

**Constraints (Steven, 2026-09-22):** no API services (no Google 3D Tiles, no Cesium ion, no keys), and no real route, GPS or flight data. Every invented line or path is labeled on screen.

**Preconditions:** mobile plan decision D2 = "`#private` is dev-only" is approved, and that plan's Phase 1 has passed its gate.
**Branch:** `globe-mockups`, cut from `perf-mobile` after its Phase 1 gate, and rebased onto `perf-mobile` (or onto `main` once that merges) before each review. **This branch is never merged to `main`.** (Superseded 2026-09-22: Steven asked to deploy the mockups live, unlisted. See Outcomes.) A chosen direction is rebuilt for production under a new plan.

## Inputs

**Verified in the repo (2026-09-22):**
- `SEVEN_SUMMITS` (`components/ui/RotatingGlobe.tsx:15-21`) has coordinates, elevation and year for each peak. Years match `EXPEDITIONS` in `constants.ts`. The Poles are "TBA" with no coordinates, and their images are remote Unsplash URLs (`constants.ts:168`, `:176`).
- `RotatingGlobe.tsx` is a D3 canvas globe, not Three.js, so M1 is a new component. Only the data is reused.
- There are 81 photos in a flat `public/images/expeditions/` folder. Per-peak photos come from `EXPEDITIONS[].images`, not from filenames.
- Heightmaps: only `public/heightmaps/everest.png` and `kilimanjaro.png`, both 256×256 8-bit RGBA. They were made by `scripts/generate-heightmaps.mjs`, which calls the Open-Elevation API, so that script is off-limits under the no-API rule.
- `components/ui/heightmap-terrain.tsx` has a fixed camera (`:180`), owns its own renderer and scene, computes heights only in the vertex shader, moves its light only on `mousemove` (`:225`), and never disposes its renderer. `pages/private/EverestScene.tsx` and `KilimanjaroScene.tsx` are thin wrappers around it.
- Blog posts open in a modal inside `components/Blog.tsx`. There is no per-post URL. Tag matches: Everest has 15 posts, Denali 1 (a 2014 post, also tagged everest), Vinson 1, and **Aconcagua, Elbrus, Kilimanjaro and Kosciuszko have none**.
- Elevations disagree:

  | Peak | `RotatingGlobe.tsx` | `constants.ts` |
  |---|---|---|
  | Everest | 29,032 ft | 29,035 ft |
  | Kilimanjaro | 19,341 ft | 19,340 ft |
  | Denali | 20,310 ft | 20,320 ft |
  | Vinson | 16,050 ft | 16,066 ft |

  `PrivateIndex.tsx` also says 8,849 m for Everest.

**UNPROVEN:** whether Elbrus or Kilimanjaro came first in 2012 (there's no month data); the texture budgets below.

## Keeping it off the live site
- Mockup assets live in `sandbox-assets/` at the repo root, **not** `public/`, because Vite copies all of `public/` into `dist/`. The Vite dev server already serves the project root, so they resolve at `/sandbox-assets/*` in dev only. Mockup code refers to textures **only by URL string, never by `import`**, because an import would make Vite emit the file into `dist/assets`.
- Mockup code sits under `pages/private/globe/` and is imported only through the DEV-gated routes from the mobile plan.
- The mockups never load Unsplash images. Google Fonts (`index.html`) is the only third-party request, and it is accepted.

## Files
| New | Purpose |
|---|---|
| `pages/private/globe/EarthGlobe.tsx` | Three.js Earth: day and night textures, atmosphere shader, day/night line, `flyTo(lat, lng)` |
| `pages/private/globe/GlobeReal.tsx` | M1 page (`#private/globe-real`) |
| `pages/private/globe/GlobeStory.tsx` | M3 page (`#private/globe-story`) |
| `pages/private/globe/GlobeDive.tsx` | M2 page (`#private/globe-dive`) |
| `pages/private/globe/TerrainLayer.ts` | Terrain mesh added to **EarthGlobe's own renderer** (one WebGL context); samples the PNG on the CPU for marker heights; lighting doesn't depend on the pointer |
| `pages/private/globe/storyData.ts` | Story stops: peak id, one elevation source, photos, blog post id or none |
| `pages/private/globe/StoryPostModal.tsx` | Renders a `blogData.ts` post by id inside the mockup |
| `pages/private/globe/FpsMeter.tsx` | On-screen frame-rate readout, used for Steven's phone test |
| `pages/private/globe/IllustrativeTag.tsx` | Fixed label, bottom-left: "Illustrative — not actual route/flights"; shown whenever an invented element is on screen |
| `sandbox-assets/textures/` plus `SOURCES.md` | NASA textures, credits, source files |

**Edited:** `App.tsx` (three DEV-only routes), `pages/private/PrivateIndex.tsx` (three entries). `heightmap-terrain.tsx` stays unchanged, so the existing scenes keep working.

## Mockups
- **M1 Photo-real Earth.**
  - Textures: day is Blue Marble Next Generation (5400×2700, one month, to be recorded), downscaled to 4096×2048 and 2048×1024 JPEG. Night is Black Marble 2016 (13500×6750), downscaled the same way.
  - Credits in `SOURCES.md`: "NASA Earth Observatory / Reto Stöckli" (Blue Marble) and "NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC" (Black Marble), plus NASA's no-endorsement note.
  - Clicking a peak flies the camera there in ≤ 3 s, then shows its card.
  - Phones (under 768 px): 2K textures, and until tapped a still poster PNG rendered from the desktop build and saved in `sandbox-assets/`.
- **M3 Guided story.**
  - Scroll steps run in `EXPEDITIONS` order. A great-circle arc draws between stops, with `IllustrativeTag` showing.
  - Each stop shows 2–3 photos from `EXPEDITIONS[].images` and, where a post exists, a "Read the story" button that opens that post in a modal inside the mockup.
  - Everest links to "Rush Hour in the Death Zone" (to be confirmed with Steven), Denali to "Daring to Dream Again..." (keyed by post id, not title) and Vinson to "Antarctica: The Vast Unknown". Aconcagua, Elbrus, Kilimanjaro and Kosciuszko show a pull-quote from the expedition description instead.
  - The 109,632 air miles appears as a fixed stat on the final step and is not tied to arc length. The arcs total about 38,800 miles.
  - The final step turns the globe side-on so both poles sit on its outline, with markers hard-coded at ±90° and labeled "Still to come".
  - Phones: the globe pinned to the top 45 % of the screen, with panels scrolling below it.
- **M2 Mountain close-up.**
  - Everest and Kilimanjaro only. After the M1 fly-in, the globe fades out and a `TerrainLayer` fades in within the same scene.
  - Hand-placed route line and camp markers, with `IllustrativeTag` showing.
  - The terrain resolution is limited by the 256×256 source (about 17 m per height step on Everest). The review packet will state this.

## Phases and gates
Every phase gate includes: `npm run build` and `npx tsc --noEmit` pass; no console errors on the mockup routes; and the leak check returns nothing: `grep -riE 'sandbox-assets|Illustrative — not actual|globe-(real|story|dive)' dist` and `find dist -iname '*GlobeReal*' -o -iname '*GlobeStory*' -o -iname '*GlobeDive*' -o -iname '*EarthGlobe*'`.

| Phase | Work | Gate beyond the common checks |
|---|---|---|
| S0 | Download, downscale and credit the textures | Desktop textures ≤ 8 MB on disk, phone ≤ 2 MB; texture GPU memory (width × height × 4 × 4/3) ≤ 96 MiB desktop (two 4K textures ≈ 85.3 MiB) and ≤ 24 MiB phone (≈ 21.3 MiB) |
| S1 | M1 | Automated (Playwright, through a dev-only `window.__globe` test hook): for each of the 7 peaks, the camera target is within 2° of the peak within 3 s and its card shows. Steven: at least 30 fps on his phone, read from `FpsMeter` |
| S2 | M3 | 7 stops in order, then the Poles; each tag visible with every arc; the 3 post modals open |
| S3 | M2 | Both mountains transition with one WebGL context (`renderer.info` checked), and the terrain is lit on touch devices |
| S4 | Independent `/review` of the branch, then the review packet: desktop and 390 px recordings, load size, GPU memory, comparison table | Critic APPROVE, then Steven picks a direction |

## Out of scope
APIs or hosted maps, real route, GPS or flight data, new heightmaps (these need an offline elevation file source and a new script; a later decision), live tracking, any deployment, and changes to the live `#globe` page.

## Questions for Steven
1. Which elevation source is correct for the cards (table above)?
2. Which came first in 2012, Elbrus or Kilimanjaro?
3. Which Everest post should the story link to?
4. After M1 and M3, is the combined version (photo-real globe with the guided story) the target? This is my recommendation.

## Outcomes

**Answers from Steven (2026-09-22):**
- Everest is 29,032 ft. Cards use `SEVEN_SUMMITS` for every peak. The Kilimanjaro, Denali and Vinson differences are still unconfirmed.
- Elbrus came before Kilimanjaro in 2012.
- Everest links to "Rush Hour in the Death Zone" (`rush-hour-death-zone`).

**Branching:** a deviation from the plan. The plan cuts `globe-mockups` from a committed Phase 1, but Steven asked for no commits before review. So the mockups sit in the same working tree as new files only (`pages/private/globe/`, `sandbox-assets/`), plus route lines in `App.tsx` and `PrivateIndex.tsx`, which can be split out when committing.

**S0 (textures):**
- Blue Marble NG December 2004 (5400×2700) and Black Marble 2016 3 km (13500×6750), downloaded 2026-09-22 and resized to 4096×2048 and 2048×1024.
- Size: desktop 1.8 MB, phone 0.54 MB.
- Texture GPU memory: about 85.3 MiB desktop and 21.3 MiB phone (computed).
- Credits are in `sandbox-assets/textures/SOURCES.md`. The phone poster `sandbox-assets/globe-poster.jpg` was rendered from the desktop M1 view.

**S1 to S3 (headless Chromium, software WebGL, 1440 and 390 px):**
- M1: each of the 7 peaks lands within 0.03° of target within 3 s, with its card showing.
- M3: 9 steps in order (intro, 7 stops, Poles). The Illustrative tag shows whenever arcs are drawn. The post modal opens.
- M2: Everest and Kilimanjaro both reach terrain mode with one canvas.
- No console errors on any mockup route.
- The leak check on `dist` returns nothing.
- Frame rate on Steven's phone is not yet measured. Headless frame rates reflect software rendering, not phone performance.

**Changes after the first screenshots:**
- M1 opens on the sunlit side, with a live day/night line.
- M2 and M3 light the Earth from the camera so every stop is in daylight.
- Cards use the expedition cover photo first.
- The frame-rate meter moved below the switcher.
- The final story step got a card background and a wider phone framing.


**Round 2 (Steven's feedback, 2026-09-22):**
- **M1:** the globe now sits in a fixed round frame of min(62vw, 70vh) on desktop and min(92vw, 60vh) on phones. Zoom and fly-to change the view inside the frame, and the frame size is unchanged after zooming (630 px before and after at 1440).
- **M3:**
  - The story column and the globe are separate grid columns, with no overlap; at 1440 the text ends at x 605 and the frame starts at 648. The whole globe and its arcs fit the frame (`fitRadius` 1.28), and stops rotate the globe rather than zooming.
  - Round 3 removed the dead scroll: the page is 4,779 px at 1440 (about 5.3 screens, down from about 9.5), with faster moves and step dots.
- **M2:** rotate to the peak, straight top-down zoom, then the relief resolves in place, then a slow tilt, all as one continuous path. The return plays it in reverse. A rigid globe-and-camera swap, which is invisible on screen, gives orbit controls a correct "up". The patch is 0.08 and resolves at altitude 0.15, before the satellite texture pixelates.
- **M1 in context** (`#private/globe-page`): a copy of `pages/GlobePage.tsx` with the M1 globe swapped in. The live file is unchanged.
- **New takes on the old sandbox mockups:**
  - M4 (`#private/summit-hero`): Everest and Kilimanjaro heroes with a sun sweep, haze and slow orbit, plus an optional illustrative route.
  - M5 (`#private/ridgeline-hero`): SVG ridgelines from the Everest heightmap, with no WebGL.
- **Checks (headless, 1440 and 390):** no console errors on any route. The leak check on `dist` returns nothing. The phone frame rate is still unmeasured.

**Deploy decision (Steven, 2026-09-22):** deploy to the live site, including the mockups, without wiring them into any live page.
- Mockups are live at their `#private/...` URLs, lazy-loaded, and linked from nothing on the live site.
- `sandbox-assets/` moved to `public/sandbox-assets/`.
- The production-only Tailwind exclusion of `pages/private/**` was removed, so mockup styles work on the live site; site CSS is 44.8 KB.
- The leak-check gate no longer applies. It is replaced by a source-map check: the home entry chunk has no `d3`, `three` or `pages/private` sources.
