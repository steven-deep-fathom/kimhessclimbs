import React from 'react';

// Shown whenever an invented element (arc, route line, camp marker) is on screen.
const IllustrativeTag: React.FC<{ visible: boolean; text?: string }> = ({
  visible,
  text = 'Illustrative — not actual route/flights',
}) => (
  <div
    className={`fixed bottom-4 left-4 z-50 rounded-full border border-amber-400/40 bg-black/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur transition-opacity duration-300 ${
      visible ? 'opacity-100' : 'pointer-events-none opacity-0'
    }`}
    aria-hidden={!visible}
  >
    {text}
  </div>
);

export default IllustrativeTag;
