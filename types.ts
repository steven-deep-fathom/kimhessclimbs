
export interface Expedition {
  id: string;
  name: string;
  year: string;
  description: string;
  image: string;
  images?: string[];  // Gallery images for lightbox
  completed: boolean;
  profileSvg?: string;
  shapeDescription?: string;
}

export interface PressItem {
  title: string;
  url: string;
  source: string;
  date?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
}

export interface Partner {
  name: string;
  logoUrl: string;
  url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  tags?: string[];
}
