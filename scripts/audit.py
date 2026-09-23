#!/usr/bin/env python3
"""Mobile and performance audit for kimhessclimbs.com.

Implements the regression checks R1-R10 and the weight metric defined in
docs/plans/2026-09-22_mobile-and-performance.md.

Usage:
    python3 scripts/audit.py BASE_URL OUT_DIR
    python3 scripts/audit.py https://kimhessclimbs.com docs/plans/evidence/2026-09-22_baseline
    python3 scripts/audit.py http://localhost:6900 /tmp/after
"""
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

WIDTHS = [390, 768, 1024, 1280, 1440, 1920]
HEIGHTS = {390: 844, 768: 1024}
# Kim's head in /images/backgrounds/Kim_Hess_Climbs_Splash04.jpg (1600x900 source pixels)
HEAD_BOX = (1180, 390, 1290, 510)

BASE = sys.argv[1].rstrip("/")
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
ORIGIN = "{0.scheme}://{0.netloc}".format(urlparse(BASE))

results = {}


def record(check, width, ok, detail):
    results.setdefault(check, {})[str(width)] = {"pass": bool(ok), "detail": detail}


def viewport(w):
    return {"width": w, "height": HEIGHTS.get(w, 900)}


def new_context(browser, w):
    return browser.new_context(viewport=viewport(w), is_mobile=w < 768, has_touch=w < 768)


def open_page(ctx, route_hash=""):
    page = ctx.new_page()
    cdp = ctx.new_cdp_session(page)
    cdp.send("Network.enable")
    cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
    return page


def goto(page, route_hash=""):
    page.goto(BASE + "/" + route_hash, wait_until="networkidle", timeout=90000)
    page.wait_for_timeout(1500)


def full_scroll(page):
    height = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < height:
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(350)
        y += 500
        height = page.evaluate("document.documentElement.scrollHeight")
    page.wait_for_timeout(1500)


def body_bytes(requests, by_host=None):
    total, failed, redirects = 0, 0, 0
    for req in requests:
        try:
            resp = req.response()
            if resp is None:
                failed += 1
                continue
            if 300 <= resp.status < 400:
                redirects += 1
                continue
            n = len(resp.body())
            total += n
            if by_host is not None:
                host = urlparse(req.url).netloc
                by_host[host] = by_host.get(host, 0) + n
        except Exception:
            failed += 1
    return total, failed, redirects


OVERFLOW_JS = "document.documentElement.scrollWidth - document.documentElement.clientWidth"

R1_JS = """() => {
  const nav = document.querySelector('nav');
  const box = nav.querySelector('.max-w-7xl');
  const row = box.firstElementChild;
  const edge = box.getBoundingClientRect().right - parseFloat(getComputedStyle(box).paddingRight);
  const logo = row.firstElementChild.getBoundingClientRect();
  const wrapper = row.children[1];
  const burger = nav.querySelector('button');
  const burgerVisible = !!burger && burger.getBoundingClientRect().width > 0;
  const out = {edge: Math.round(edge), vw: innerWidth, burgerVisible,
               burgerRight: burgerVisible ? Math.round(burger.getBoundingClientRect().right) : null};
  if (!wrapper || getComputedStyle(wrapper).display === 'none') { out.desktop = false; return out; }
  out.desktop = true;
  wrapper.style.flexShrink = '0';
  const controls = [...wrapper.querySelectorAll('a')].filter(a => a.getBoundingClientRect().width > 0);
  const rects = controls.map(a => a.getBoundingClientRect());
  out.rowScroll = row.scrollWidth; out.rowClient = row.clientWidth;
  out.lastRight = Math.round(Math.max(...rects.map(r => r.right)));
  out.heights = [...new Set(controls.filter(a => !a.querySelector('svg')).map(a => Math.round(a.getBoundingClientRect().height)))];
  out.gap = Math.round(Math.min(...rects.map(r => r.left)) - logo.right);
  return out;
}"""

R3_JS = """() => [...document.querySelectorAll('#grand-slam h3')].map(h3 => {
  const badge = h3.previousElementSibling && h3.previousElementSibling.firstElementChild;
  const p = h3.nextElementSibling;
  return {name: h3.textContent.trim(),
          badge: badge ? Math.round(badge.getBoundingClientRect().left) : null,
          h3: Math.round(h3.getBoundingClientRect().left),
          p: p ? Math.round(p.getBoundingClientRect().left) : null};
})"""

R4_JS = """(head) => {
  const hero = document.querySelector('section');
  const img = hero.querySelector('img');
  const r = img.getBoundingClientRect();
  const s = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
  const rw = img.naturalWidth * s, rh = img.naturalHeight * s;
  const pos = getComputedStyle(img).objectPosition.split(' ').map(v => parseFloat(v) / 100);
  const ox = r.left + (r.width - rw) * pos[0], oy = r.top + (r.height - rh) * pos[1];
  // head is in 1600x900 source pixels; the loaded file may be a smaller WebP variant.
  const k = s * img.naturalWidth / 1600;
  const box = {l: ox + head[0] * k, t: oy + head[1] * k, r: ox + head[2] * k, b: oy + head[3] * k};
  const glyphs = [];
  for (const el of hero.querySelectorAll('h1, h2, p')) {
    const range = document.createRange(); range.selectNodeContents(el);
    for (const g of range.getClientRects()) glyphs.push({tag: el.tagName, l: g.left, t: g.top, r: g.right, b: g.bottom});
  }
  for (const a of hero.querySelectorAll('a')) { const g = a.getBoundingClientRect(); glyphs.push({tag: 'A', l: g.left, t: g.top, r: g.right, b: g.bottom}); }
  const hits = glyphs.filter(g => g.l < box.r && g.r > box.l && g.t < box.b && g.b > box.t).map(g => g.tag);
  const inView = box.l >= 0 && box.r <= innerWidth && box.t >= 0 && box.b <= innerHeight;
  return {objectPosition: getComputedStyle(img).objectPosition, loaded: img.currentSrc.split('/').pop(), head: Object.fromEntries(Object.entries(box).map(([k, v]) => [k, Math.round(v)])), inView, overlaps: [...new Set(hits)]};
}"""

HERO_CLEAR_JS = """() => {
  const hero = document.querySelector('section');
  const nav = document.querySelector('nav .max-w-7xl').getBoundingClientRect();
  const els = [...hero.querySelectorAll('h1, h2, p, a')].map(e => e.getBoundingClientRect());
  return {navBottom: Math.round(nav.bottom), textTop: Math.round(Math.min(...els.map(r => r.top))),
          textBottom: Math.round(Math.max(...els.map(r => r.bottom)))};
}"""

# Extra hero sizes (critic, 2026-09-23): mid-size windows must keep text off the
# head; every size keeps text below the nav and above the bottom edge. Screens
# 500 px tall or less can't clear the head and are checked for fit only.
HERO_EXTRA = [(640, 800), (900, 800), (1000, 700), (844, 390), (667, 375)]

R5_JS = """() => {
  const grid = [...document.querySelectorAll('#expeditions *')].find(e => getComputedStyle(e).display === 'grid');
  const g = grid.getBoundingClientRect();
  const rows = {};
  for (const c of grid.children) { const r = c.getBoundingClientRect(); const k = Math.round(r.top);
    rows[k] = rows[k] || {l: 1e9, r: -1e9, n: 0}; rows[k].l = Math.min(rows[k].l, r.left); rows[k].r = Math.max(rows[k].r, r.right); rows[k].n++; }
  const list = Object.values(rows).map(x => ({n: x.n, l: Math.round(x.l), r: Math.round(x.r)}));
  const gaps = list.filter(x => Math.abs(x.l - g.left) > 2 || Math.abs(x.r - g.right) > 2);
  return {gridLeft: Math.round(g.left), gridRight: Math.round(g.right), rows: list, incompleteRows: gaps.length};
}"""

R6_JS = """() => {
  const scroller = [...document.querySelectorAll('#blog *')].find(e => ['auto', 'scroll'].includes(getComputedStyle(e).overflowX));
  const cards = [...scroller.children];
  const s = scroller.getBoundingClientRect();
  // Cards at least half inside the scroller's box must be wholly inside it.
  const clipped = cards.map(c => c.getBoundingClientRect())
    .filter(r => Math.min(r.right, s.right) - Math.max(r.left, s.left) > r.width / 2)
    .filter(r => r.left < s.left - 2 || r.right > s.right + 2).length;
  return {scrollerWidth: scroller.clientWidth, maxCardWidth: Math.max(...cards.map(c => c.getBoundingClientRect().width)),
          cards: cards.length, scrollLeft: Math.round(scroller.scrollLeft), clipped};
}"""

R7_JS = """() => {
  const c = document.querySelector('canvas');
  if (!c) return null;
  const r = c.getBoundingClientRect(), p = c.parentElement.getBoundingClientRect();
  // Land is drawn as #475569 halftone dots; count those pixels.
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let land = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (Math.abs(d[i] - 71) < 6 && Math.abs(d[i + 1] - 85) < 6 && Math.abs(d[i + 2] - 105) < 6) land++;
  }
  return {w: Math.round(r.width), h: Math.round(r.height), container: Math.round(p.width), landPixels: land};
}"""


def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        # First-paint menu screenshot (R8 companion).
        ctx = new_context(browser, 390)
        page = ctx.new_page()
        page.goto(BASE + "/", wait_until="commit")
        page.wait_for_selector("nav", timeout=30000)
        page.screenshot(path=str(OUT / "first-paint-390.png"))
        ctx.close()

        weights = {}
        for w in WIDTHS:
            ctx = new_context(browser, w)
            page = open_page(ctx)
            finished, errors = [], []
            page.on("requestfinished", lambda r: finished.append(r))

            def on_console(msg):
                if msg.type != "error":
                    return
                url = (msg.location or {}).get("url", "")
                if url and not url.startswith(ORIGIN):
                    return  # third-party iframe/script message, logged but excluded
                errors.append(msg.text[:200])

            page.on("console", on_console)
            page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)[:200]))
            goto(page)
            before = list(finished)
            overflow_before = page.evaluate(OVERFLOW_JS)
            page.screenshot(path=str(OUT / f"home-{w}-top.png"))

            # R1 nav
            nav = page.evaluate(R1_JS)
            if w >= 1280:
                ok = (nav.get("desktop") and nav["rowScroll"] <= nav["rowClient"] and nav["lastRight"] <= nav["edge"] + 1
                      and len(nav["heights"]) == 1 and nav["gap"] >= 32)
            else:
                ok = (not nav.get("desktop")) and nav["burgerVisible"] and nav["burgerRight"] <= w - 16
            record("R1", w, ok, nav)

            # R4 hero head box
            if w in (390, 768):
                page.wait_for_timeout(500)
                hero = page.evaluate(R4_JS, list(HEAD_BOX))
                record("R4", w, hero["inView"] and not hero["overlaps"], hero)

            # R3 timeline alignment
            if w == 390:
                items = page.evaluate(R3_JS)
                bad = [i for i in items if len({i["badge"], i["h3"], i["p"]} - {None}) > 1 and
                       max(v for v in (i["badge"], i["h3"], i["p"]) if v is not None) -
                       min(v for v in (i["badge"], i["h3"], i["p"]) if v is not None) > 2]
                record("R3", w, not bad, {"misaligned": bad})

            # R6 blog cards: fit, and stay whole after one press of the scroll button
            if w == 390:
                page.locator("#blog").scroll_into_view_if_needed()
                page.wait_for_timeout(800)
                blog = page.evaluate(R6_JS)
                page.locator('#blog button[aria-label="Scroll right"]').click()
                page.wait_for_timeout(1200)
                stepped = page.evaluate(R6_JS)
                record("R6", w, blog["maxCardWidth"] <= blog["scrollerWidth"] and blog["clipped"] == 0
                       and stepped["scrollLeft"] > 0 and stepped["clipped"] == 0, {"initial": blog, "after_step": stepped})
                page.evaluate("window.scrollTo(0, 0)")

            full_scroll(page)
            overflow_after = page.evaluate(OVERFLOW_JS)

            # R5 gallery
            if w in (768, 1280):
                gal = page.evaluate(R5_JS)
                record("R5", w, gal["incompleteRows"] == 0, gal)

            page.screenshot(path=str(OUT / f"home-{w}-full.png"), full_page=True)
            b_bytes = body_bytes(before)
            hosts = {}
            a_bytes = body_bytes(finished, hosts)
            weights[str(w)] = {
                "before_scroll": {"bytes": b_bytes[0], "requests": len(before), "failed_bodies": b_bytes[1], "redirects": b_bytes[2]},
                "full_scroll": {"bytes": a_bytes[0], "requests": len(finished), "failed_bodies": a_bytes[1], "redirects": a_bytes[2]},
                "full_scroll_by_host": dict(sorted(hosts.items(), key=lambda kv: -kv[1])),
            }
            record("R8", w, overflow_before <= 0 and overflow_after <= 0 and not errors,
                   {"overflow_before": overflow_before, "overflow_after": overflow_after, "first_party_errors": errors})
            ctx.close()

        for w, h in HERO_EXTRA:
            ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=w < 768, has_touch=w < 768)
            page = ctx.new_page()
            goto(page)
            page.wait_for_timeout(500)
            hero = page.evaluate(R4_JS, list(HEAD_BOX))
            fit = page.evaluate(HERO_CLEAR_JS)
            ok = fit["textTop"] >= fit["navBottom"] and fit["textBottom"] <= h - 8 and (h <= 500 or not hero["overlaps"])
            results.setdefault("R4", {})[f"{w}x{h}"] = {"pass": ok, "detail": {**hero, **fit}}
            page.screenshot(path=str(OUT / f"hero-{w}x{h}.png"))
            ctx.close()

        # R2 globe-page nav, R7 globe sizing and local land data
        for w in (390, 1440):
            ctx = new_context(browser, w)
            page = open_page(ctx)
            goto(page, "#globe")
            if w < 1280:
                page.locator("nav button").first.click()
                page.wait_for_timeout(300)
            hrefs = page.evaluate("""() => [...document.querySelectorAll('nav a')]
                .filter(a => a.getBoundingClientRect().width > 0 && /^#[a-z]/.test(a.getAttribute('href')))
                .map(a => a.getAttribute('href'))""")
            hrefs = list(dict.fromkeys(hrefs))
            outcomes = []
            for href in hrefs:
                page.goto("about:blank")
                goto(page, "#globe")
                if w < 1280:
                    page.locator("nav button").first.click()
                    page.wait_for_timeout(300)
                clicked = page.evaluate("""(h) => { const a = [...document.querySelectorAll('nav a')]
                    .find(a => a.getAttribute('href') === h && a.getBoundingClientRect().width > 0);
                    if (!a) return false; a.click(); return true; }""", href)
                page.wait_for_timeout(2000)
                if not clicked:
                    outcomes.append({"href": href, "ok": False, "reason": "link not visible"})
                    continue
                top = page.evaluate("(id) => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top) : null; }", href[1:])
                hash_now = page.evaluate("location.hash")
                outcomes.append({"href": href, "hash": hash_now, "top": top,
                                 "ok": hash_now == href and top is not None and -5 <= top <= 100})
            record("R2", w, bool(outcomes) and all(o["ok"] for o in outcomes), outcomes)
            ctx.close()

            ctx = new_context(browser, w)
            ctx.route("**/raw.githubusercontent.com/**", lambda route: route.abort())
            page = open_page(ctx)
            land = []
            page.on("response", lambda r: land.append((r.url, r.status)) if "ne_110m_land" in r.url else None)
            goto(page, "#globe")
            page.wait_for_timeout(2000)
            canvas = page.evaluate(R7_JS)
            local_ok = any(u.startswith(ORIGIN) and s == 200 for u, s in land)
            ok = (bool(canvas) and abs(canvas["w"] - canvas["h"]) <= 2 and canvas["w"] >= min(canvas["container"], 700) - 2
                  and local_ok and canvas["landPixels"] > 500)
            record("R7", w, ok, {"canvas": canvas, "land_requests": land})
            page.screenshot(path=str(OUT / f"globe-{w}.png"), full_page=True)
            ctx.close()

        # R9 contact form (Formspree intercepted; no email is sent)
        for w in (390, 1440):
            ctx = new_context(browser, w)
            hits = []

            def fake(route):
                hits.append(route.request.url)
                route.fulfill(status=200, content_type="application/json", body='{"ok":true}')

            ctx.route("**/formspree.io/**", fake)
            page = open_page(ctx)
            goto(page, "#contact")
            page.fill("#name", "Audit Test")
            page.fill("#email", "audit@example.com")
            page.fill("#subject", "Audit")
            page.fill("#message", "Automated audit; request intercepted, never sent.")
            page.locator("#contact form button[type=submit]").click()
            try:
                page.wait_for_selector("text=Thank you for reaching out", timeout=5000)
                shown = True
            except Exception:
                shown = False
            record("R9", w, shown and len(hits) == 1, {"intercepted": len(hits), "success_shown": shown})
            ctx.close()

        # R10 phone menu has a contact link
        for w in (390, 1024):
            ctx = new_context(browser, w)
            page = open_page(ctx)
            goto(page)
            burger = page.locator("nav button").first
            if burger.count() and burger.is_visible():
                burger.click()
                page.wait_for_timeout(300)
                has = page.evaluate("""() => [...document.querySelectorAll('nav a[href="#contact"]')]
                    .some(a => a.getBoundingClientRect().width > 0)""")
                record("R10", w, has, {"menu_opened": True, "contact_link": has})
            else:
                record("R10", w, False, {"menu_opened": False, "reason": "no visible menu button"})
            ctx.close()

        browser.close()

    report = {"base": BASE, "checks": results, "weight": weights}
    (OUT / "audit.json").write_text(json.dumps(report, indent=2))
    lines = [f"# Audit: {BASE}", "", "| Check | " + " | ".join(str(w) for w in WIDTHS) + " |",
             "|---|" + "---|" * len(WIDTHS)]
    for check in sorted(results, key=lambda c: int(c[1:])):
        row = [results[check].get(str(w)) for w in WIDTHS]
        lines.append(f"| {check} | " + " | ".join("—" if r is None else ("pass" if r["pass"] else "FAIL") for r in row) + " |")
    extra = {k: v for k, v in results.get("R4", {}).items() if "x" in k}
    lines += ["", "R4 extra sizes: " + ", ".join(f"{k} {'pass' if v['pass'] else 'FAIL'}" for k, v in extra.items())]
    lines += ["", "| Width | Before scroll (MB, requests) | Full scroll (MB, requests) | Failed bodies |", "|---|---|---|---|"]
    for w, v in weights.items():
        lines.append(f"| {w} | {v['before_scroll']['bytes'] / 1e6:.2f}, {v['before_scroll']['requests']} | "
                     f"{v['full_scroll']['bytes'] / 1e6:.2f}, {v['full_scroll']['requests']} | {v['full_scroll']['failed_bodies']} |")
    (OUT / "summary.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    run()
