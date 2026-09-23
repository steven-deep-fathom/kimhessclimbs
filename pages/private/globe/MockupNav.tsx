import React from 'react';

const LINKS = [
  { href: '#private/globe-real', label: 'M1 · Photo-real Earth' },
  { href: '#private/globe-story', label: 'M3 · Guided story' },
  { href: '#private/globe-dive', label: 'M2 · Mountain close-up' },
  { href: '#private/globe-page', label: 'M1 in context' },
  { href: '#private/summit-hero', label: 'M4 · Summit hero' },
  { href: '#private/ridgeline-hero', label: 'M5 · Ridgeline hero' },
];

// Switcher shared by the three globe mockups.
const MockupNav: React.FC<{ current: string }> = ({ current }) => (
  <nav className="fixed left-0 right-0 top-0 z-40 flex items-center gap-2 overflow-x-auto bg-black/60 px-3 py-2 backdrop-blur scrollbar-hide">
    <a href="#private" className="mr-2 shrink-0 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white">
      ← Sandbox
    </a>
    {LINKS.map((l) => (
      <a
        key={l.href}
        href={l.href}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          l.href === current ? 'bg-brand-teal text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
        }`}
      >
        {l.label}
      </a>
    ))}
  </nav>
);

export default MockupNav;
