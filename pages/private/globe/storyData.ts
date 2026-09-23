import { EXPEDITIONS } from '../../../constants';
import { SEVEN_SUMMITS } from '../../../components/ui/RotatingGlobe';

// Story stops for the guided-story mockup, in climb order.
// Elbrus comes before Kilimanjaro in 2012 (confirmed by Steven, 2026-09-22).
// Elevations use SEVEN_SUMMITS in RotatingGlobe.tsx; Everest 29,032 ft is confirmed.
// Kilimanjaro, Denali and Vinson still differ from constants.ts (open question).

export interface StoryStop {
  id: string;
  name: string;
  year: string;
  continent: string;
  elevation: string;
  lat: number;
  lng: number;
  photos: string[];
  quote: string;
  postId: string | null;
}

const POSTS: Record<string, string> = {
  everest: 'rush-hour-death-zone',
  denali: 'daring-to-dream-again',
  vinson: 'antarctica-the-vast-unknown',
};

export const STORY_STOPS: StoryStop[] = EXPEDITIONS.filter((e) => e.completed).map((e) => {
  const summit = SEVEN_SUMMITS.find((s) => s.id === e.id);
  if (!summit) throw new Error(`No coordinates for ${e.id}`);
  return {
    id: e.id,
    name: e.name,
    year: e.year,
    continent: summit.continent,
    elevation: summit.elevation,
    lat: summit.lat,
    lng: summit.lng,
    // Cover image first, then two more from the gallery.
    photos: [e.image, ...(e.images ?? []).filter((src) => src !== e.image)].slice(0, 3),
    quote: e.description,
    postId: POSTS[e.id] ?? null,
  };
});

export const POLES = [
  { id: 'north-pole', name: 'North Pole', lat: 90, lng: 0 },
  { id: 'south-pole', name: 'South Pole', lat: -90, lng: 0 },
];

export const AIR_MILES = 109632;
