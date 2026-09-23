import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface YouTubeFacadeProps {
  id: string;
  title: string;
}

/**
 * A YouTube thumbnail with a play button. The player (about 4 MB per video)
 * loads only when clicked, from youtube-nocookie.com, and starts playing.
 */
export const YouTubeFacade: React.FC<YouTubeFacadeProps> = ({ id, title }) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="absolute inset-0 w-full h-full group"
      aria-label={`Play video: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-16 h-16 rounded-full bg-black/70 group-hover:bg-brand-teal flex items-center justify-center transition-colors shadow-lg">
          <Play size={28} className="text-white ml-1" fill="currentColor" />
        </span>
      </span>
    </button>
  );
};
YouTubeFacade.displayName = 'YouTubeFacade';
