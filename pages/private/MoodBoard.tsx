import React, { useEffect, useRef, useState } from 'react';
import { assetPath } from '../../utils/assetPath';
import './moodboard.css';

// Unlisted mood board for design feedback (docs/plans/2026-09-23_design-refresh.md).
// Screenshots of third-party sites, downscaled, credited and linked; not indexed.

interface Site {
  key: string;
  name: string;
  url: string;
  desc: string;
  first: string;
  phone: string | null;
  more: string[];
}

const SITES: Site[] = [
  {
    "key": "snowfall",
    "name": "New York Times: Snow Fall",
    "url": "https://www.nytimes.com/projects/2012/snow-fall/",
    "desc": "A true story told down the page: quiet type, big photos and video between the chapters. The model for \"the journey as a story\".",
    "first": "story_nyt-snowfall-1440.webp",
    "more": [
      "story_nyt-snowfall-1440-s1.webp",
      "story_nyt-snowfall-1440-s3.webp"
    ],
    "phone": "story_nyt-snowfall-390.webp"
  },
  {
    "key": "chin",
    "name": "Jimmy Chin",
    "url": "https://jimmychin.com",
    "desc": "One huge mountain photo, three words, nothing else. Photographs do all the talking.",
    "first": "adventure_jimmychin-1440.webp",
    "more": [
      "adventure_jimmychin-stills-1440.webp"
    ],
    "phone": "adventure_jimmychin-390.webp"
  },
  {
    "key": "whitedesert",
    "name": "White Desert (Antarctica)",
    "url": "https://white-desert.com",
    "desc": "Big condensed headline over footage, an elegant italic serif, coordinates as detail. Polished, calm, premium.",
    "first": "modern_whitedesert-1440.webp",
    "more": [
      "modern_whitedesert-1440-full.webp"
    ],
    "phone": "modern_whitedesert-390.webp"
  },
  {
    "key": "nimsdai",
    "name": "Nimsdai (Nirmal Purja)",
    "url": "https://www.nimsdai.com",
    "desc": "A record-setting mountaineer as a brand: desaturated snow photos, a gold accent, and a list of achievements up front.",
    "first": "adventure_nimsdai-1440.webp",
    "more": [
      "adventure_nimsdai-1440-full.webp"
    ],
    "phone": "adventure_nimsdai-390.webp"
  },
  {
    "key": "alpenglow",
    "name": "Alpenglow Expeditions",
    "url": "https://alpenglowexpeditions.com",
    "desc": "Huge light/bold condensed headline over a Himalayan panorama; dates and elevations in a typewriter-style mono.",
    "first": "adventure_alpenglow-1440.webp",
    "more": [
      "adventure_alpenglow-1440-full.webp"
    ],
    "phone": "adventure_alpenglow-390.webp"
  },
  {
    "key": "ballinger",
    "name": "Adrian Ballinger",
    "url": "https://www.adrianballinger.com",
    "desc": "A climber’s personal site: warm, simple, serif quote, one summit selfie with a dated caption.",
    "first": "adventure_ballinger-1440.webp",
    "more": [
      "adventure_ballinger-1440-full.webp"
    ],
    "phone": "adventure_ballinger-390.webp"
  },
  {
    "key": "blackdiamond",
    "name": "Black Diamond: Stories",
    "url": "https://blackdiamondequipment.com/blogs/stories",
    "desc": "Story index: big aerial photo, heavy chapter titles, alternating photo and text down the page.",
    "first": "adventure_blackdiamond-1440.webp",
    "more": [
      "adventure_blackdiamond-1440-full.webp"
    ],
    "phone": "adventure_blackdiamond-390.webp"
  },
  {
    "key": "mikehorn",
    "name": "Mike Horn",
    "url": "https://www.mikehorn.com",
    "desc": "Explorer site: full-bleed glacier photo, tall condensed name, three words.",
    "first": "speakers_mike-horn-1440.webp",
    "more": [
      "speakers_mike-horn-1440-full.webp"
    ],
    "phone": "speakers_mike-horn-390.webp"
  },
  {
    "key": "kirkby",
    "name": "Bruce Kirkby",
    "url": "https://brucekirkby.com",
    "desc": "Explorer-author who leads with adventure, then speaking and writing further down. Bold photos, big words.",
    "first": "story_brucekirkby-1440.webp",
    "more": [
      "story_brucekirkby-1440-s1.webp",
      "story_brucekirkby-1440-s3.webp"
    ],
    "phone": "story_brucekirkby-390.webp"
  },
  {
    "key": "madison",
    "name": "Madison Mountaineering",
    "url": "https://madisonmountaineering.com",
    "desc": "Superb ridge and summit photography; every peak shows elevation in m and ft. Layout is older.",
    "first": "adventure_madison-1440.webp",
    "more": [
      "adventure_madison-1440-full.webp"
    ],
    "phone": "adventure_madison-390.webp"
  },
  {
    "key": "trevornoah",
    "name": "Trevor Noah",
    "url": "https://trevornoah.com",
    "desc": "A personality-led site: giant name, playful 3D, two colours. Here as a contrast.",
    "first": "modern_trevornoah-1440.webp",
    "more": [
      "modern_trevornoah-1440-full.webp"
    ],
    "phone": "modern_trevornoah-390.webp"
  },
  {
    "key": "nasa",
    "name": "NASA Eyes on the Earth",
    "url": "https://eyes.nasa.gov/apps/earth/",
    "desc": "Real satellite imagery on a 3D globe. The same idea as the photo-real spinning globe Steven has been trying for the site.",
    "first": "modern_nasaeyes-1440.webp",
    "more": [],
    "phone": "modern_nasaeyes-390.webp"
  },
  {
    "key": "current",
    "name": "kimhessclimbs.com today",
    "url": "https://kimhessclimbs.com",
    "desc": "The current site, for comparison.",
    "first": "current_hero-1440.webp",
    "more": [
      "current_story-1440.webp",
      "current_expeditions-1440.webp"
    ],
    "phone": "current_hero-390.webp"
  }
];

type Verdict = 'love' | 'some' | 'no';
const LABELS: Record<Verdict, string> = { love: 'Love', some: 'Some of it', no: 'Not for Kim' };
const STORE = 'khc-moodboard';

interface Saved {
  name: string;
  picks: Record<string, { v?: Verdict; n?: string }>;
}

const img = (file: string) => assetPath(`/sandbox-assets/moodboard/${file}`);

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw) as Saved;
  } catch { /* storage unavailable */ }
  return { name: '', picks: {} };
}

const MoodBoard: React.FC = () => {
  const [saved, setSaved] = useState<Saved>(load);
  const [copied, setCopied] = useState<'no' | 'yes' | 'failed'>('no');
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Keep this unlisted page out of search results while it is open.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const title = document.title;
    document.title = 'Mood board | Kim Hess';
    return () => { meta.remove(); document.title = title; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch { /* storage unavailable */ }
    setCopied('no');
  }, [saved]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (zoom && !d.open) d.showModal();
    if (!zoom && d.open) d.close();
  }, [zoom]);

  const setPick = (key: string, patch: { v?: Verdict; n?: string }) =>
    setSaved((s) => ({ ...s, picks: { ...s.picks, [key]: { ...s.picks[key], ...patch } } }));

  const lines = SITES.filter((s) => saved.picks[s.key]?.v || saved.picks[s.key]?.n).map((s) => {
    const p = saved.picks[s.key];
    return `${s.name}: ${p.v ? LABELS[p.v] : '-'}${p.n ? ` | ${p.n}` : ''}`;
  });
  const output = lines.length ? [`From: ${saved.name || '(no name)'}`, ...lines].join('\n') : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied('yes');
    } catch {
      setCopied('failed');
    }
  };

  return (
    <div className="mb">
      <header className="mb-head">
        <h1>Mood board: react to real sites</h1>
        <p>
          We&rsquo;re rethinking the look of kimhessclimbs.com around Kim&rsquo;s climbs, told as a story. Before designing anything,
          we want to know which of these real sites feel right.
        </p>
        <p>
          For each one, choose <b>Love</b>, <b>Some of it</b> or <b>Not for Kim</b>, and note what caught you
          (&ldquo;photos this big&rdquo;, &ldquo;too dark&rdquo;, &ldquo;this font&rdquo;). Tap any screenshot to enlarge it. The big image is the
          first screen on a laptop, the small one is a phone, and the strip below is further down the page.
        </p>
        <p>When you&rsquo;re done, press <b>Copy my reactions</b> and send them to Steven. Your picks stay saved in this browser.</p>
        <label className="mb-name">
          Your name
          <input type="text" value={saved.name} onChange={(e) => setSaved((s) => ({ ...s, name: e.target.value }))} autoComplete="name" />
        </label>
      </header>

      <main className="mb-list">
        {SITES.map((s) => {
          const p = saved.picks[s.key] ?? {};
          return (
            <section className="mb-card" key={s.key} aria-labelledby={`mb-${s.key}`}>
              <h2 id={`mb-${s.key}`}>
                {s.name}
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace('https://', '')}</a>
              </h2>
              <p className="mb-desc">{s.desc}</p>
              <div className="mb-shots">
                <button type="button" className="mb-shot" onClick={() => setZoom({ src: img(s.first), alt: `${s.name}, first screen on a laptop` })}>
                  <img src={img(s.first)} alt={`${s.name}, first screen on a laptop`} loading="lazy" decoding="async" />
                </button>
                {s.phone && (
                  <button type="button" className="mb-shot" onClick={() => setZoom({ src: img(s.phone!), alt: `${s.name} on a phone` })}>
                    <img src={img(s.phone)} alt={`${s.name} on a phone`} loading="lazy" decoding="async" />
                  </button>
                )}
              </div>
              {s.more.length > 0 && (
                <div className="mb-more">
                  {s.more.map((m) => (
                    <button type="button" className="mb-shot" key={m} onClick={() => setZoom({ src: img(m), alt: `${s.name}, further down the page` })}>
                      <img src={img(m)} alt={`${s.name}, further down the page`} loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
              <div className="mb-react" role="group" aria-label={`Your reaction to ${s.name}`}>
                {(Object.keys(LABELS) as Verdict[]).map((v) => (
                  <button
                    type="button"
                    key={v}
                    data-v={v}
                    aria-pressed={p.v === v}
                    onClick={() => setPick(s.key, { v: p.v === v ? undefined : v })}
                  >
                    {LABELS[v]}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="What caught you?"
                  aria-label={`Note on ${s.name}`}
                  value={p.n ?? ''}
                  onChange={(e) => setPick(s.key, { n: e.target.value })}
                />
              </div>
            </section>
          );
        })}
        <p className="mb-credit">
          Screenshots of third-party websites, shown small for private design feedback. Each belongs to its owner; follow the links to
          see the real sites.
        </p>
      </main>

      <div className="mb-out">
        <textarea readOnly value={output || 'No reactions yet'} aria-label="Your reactions" />
        <button type="button" onClick={copy} disabled={!output}>{copied === 'yes' ? 'Copied' : copied === 'failed' ? 'Select the text to copy' : 'Copy my reactions'}</button>
      </div>

      <dialog ref={dialogRef} className="mb-zoom" onClose={() => setZoom(null)} onClick={() => setZoom(null)}>
        {zoom && <img src={zoom.src} alt={zoom.alt} />}
      </dialog>
    </div>
  );
};

export default MoodBoard;
