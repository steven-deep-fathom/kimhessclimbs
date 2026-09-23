import React, { useEffect, useState } from 'react';

// On-screen frame-rate readout for the phone performance check.
const FpsMeter: React.FC = () => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const color = fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-300' : 'text-red-400';
  return (
    <div className={`fixed right-3 top-12 z-50 rounded bg-black/70 px-2 py-1 font-mono text-xs ${color}`} data-testid="fps">
      {fps} fps
    </div>
  );
};

export default FpsMeter;
