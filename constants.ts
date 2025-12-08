import { Expedition, Partner, PressItem, VideoItem } from './types';

export const THEME_COLOR = "#14b8a6"; // Elegant Teal

export const EXPEDITIONS: Expedition[] = [
  {
    id: "aconcagua",
    name: "Aconcagua",
    year: "2011",
    description: "South America's tallest mountain at 22,841 ft (6962m). Perched in the Andes, it is known for its grueling ascent.",
    image: "/images/expeditions/Aconcagua_06-1340x891.jpg",
    images: [
      "/images/expeditions/Aconcagua_08-1340x891.jpg",
      "/images/expeditions/Aconcagua_07-1340x894.jpg",
      "/images/expeditions/Aconcagua_06-1340x891.jpg",
      "/images/expeditions/Aconcagua_05-1340x891.jpg",
      "/images/expeditions/Aconcagua_04-1340x891.jpg",
      "/images/expeditions/Aconcagua_03-1340x891.jpg",
      "/images/expeditions/Aconcagua_02-1340x891.jpg",
      "/images/expeditions/Aconcagua_01-1340x891.jpg",
      "/images/expeditions/Aconcagua_00-1340x894.jpg"
    ],
    completed: true,
    shapeDescription: "Jagged peak with steep approaches",
    profileSvg: "M0 50 L 15 40 L 25 45 L 35 15 L 45 25 L 55 10 L 70 35 L 85 30 L 100 50"
  },
  {
    id: "elbrus",
    name: "Mt. Elbrus",
    year: "2012",
    description: "The tallest mountain in Europe at 18,510 ft (5642m). Located in the Caucasus Mountains on the border of Georgia and Russia.",
    image: "/images/expeditions/Elbrus_02-1340x891.jpg",
    images: [
      "/images/expeditions/IMGP0536-small-1340x891.jpg",
      "/images/expeditions/DSC03754-small-1340x891.jpg",
      "/images/expeditions/Elbrus_06-1340x891.jpg",
      "/images/expeditions/Elbrus_08-1340x891.jpg",
      "/images/expeditions/IMGP0711-small-1340x891.jpg",
      "/images/expeditions/Elbrus_02-1340x891.jpg",
      "/images/expeditions/Elbrus_03-1340x891.jpg",
      "/images/expeditions/IMGP0794-small-1340x891.jpg",
      "/images/expeditions/Elbrus_05-1340x891.jpg"
    ],
    completed: true,
    shapeDescription: "Distinctive twin peaks",
    profileSvg: "M0 50 L 15 35 L 30 10 L 50 25 L 70 12 L 85 35 L 100 50"
  },
  {
    id: "kilimanjaro",
    name: "Mt. Kilimanjaro",
    year: "2012",
    description: "The tallest mountain in Africa at 19,340 ft (5895m). A trek through 5 different climatic zones ending on a glacier.",
    image: "/images/expeditions/Kilimanjaro_00-1340x891.jpg",
    images: [
      "/images/expeditions/IMGP1373-small-1340x887.jpg",
      "/images/expeditions/Kilimanjaro_08-1340x891.jpg",
      "/images/expeditions/Kilimanjaro_09-1340x891.jpg",
      "/images/expeditions/Kilimanjaro_05-1340x891.jpg",
      "/images/expeditions/IMGP1480-small-1340x891.jpg",
      "/images/expeditions/Kilimanjaro_01-1340x891.jpg",
      "/images/expeditions/Kilimanjaro_00-1340x891.jpg",
      "/images/expeditions/Kilimanjaro_04-1340x891.jpg",
      "/images/expeditions/IMGP1852-small-1340x891.jpg"
    ],
    completed: true,
    shapeDescription: "Iconic flat top (Kibo)",
    profileSvg: "M0 50 L 20 35 L 35 25 L 65 25 L 80 35 L 100 50"
  },
  {
    id: "denali",
    name: "Denali",
    year: "2013",
    description: "North America's tallest peak at 20,320ft (6194m). Known for its massive vertical rise and extreme cold.",
    image: "/images/expeditions/Denali_06-1340x891.jpg",
    images: [
      "/images/expeditions/Denali_06-1340x891.jpg",
      "/images/expeditions/Denali_07-1340x891.jpg",
      "/images/expeditions/Denali_04-1340x891.jpg",
      "/images/expeditions/Denali_01-1340x891.jpg",
      "/images/expeditions/Denali_09-1340x891.jpg",
      "/images/expeditions/Denali_08-1340x891.jpg",
      "/images/expeditions/Denali_02-1340x891.jpg",
      "/images/expeditions/Denali_03-1340x891.jpg",
      "/images/expeditions/DSC00337-small-1340x891.jpg"
    ],
    completed: true,
    shapeDescription: "Massive, steep vertical rise",
    profileSvg: "M0 50 L 15 45 L 30 35 L 45 5 L 55 15 L 65 10 L 80 40 L 100 50"
  },
  {
    id: "everest",
    name: "Mt. Everest",
    year: "2016",
    description: "The tallest mountain in the world at 29,035 ft (8850m). Kim stood on top of the world on May 21, 2016.",
    image: "/images/expeditions/Everest16_01-1340x894.jpg",
    images: [
      "/images/expeditions/DSC02781-small-1340x891.jpg",
      "/images/expeditions/Everest_05-1340x894.jpg",
      "/images/expeditions/untitled-5-of-6-small-1500x1250.jpg",
      "/images/expeditions/Everest-2015-03207-small-1340x891.jpg",
      "/images/expeditions/Everest_07-1340x894.jpg",
      "/images/expeditions/Everest_06-1340x894.jpg",
      "/images/expeditions/DSC00625-small-1340x891.jpg",
      "/images/expeditions/Everest_02-1340x894.jpg",
      "/images/expeditions/Everest_03-1340x894.jpg",
      "/images/expeditions/DSC05785-small-1340x891.jpg",
      "/images/expeditions/Screenshot-2016-06-12-small-1500x1200.jpg",
      "/images/expeditions/DSC01883-small-1340x891.jpg",
      "/images/expeditions/Everest16_05-1340x894.jpg",
      "/images/expeditions/Snapseed-small-1340x891.jpg",
      "/images/expeditions/Everest16_08-1340x894.jpg",
      "/images/expeditions/Everest16_09-1340x1005.jpg",
      "/images/expeditions/c49b-d217-1420-1a87-small-1500x1250.jpg",
      "/images/expeditions/DSC05656-small-1340x891.jpg"
    ],
    completed: true,
    shapeDescription: "Sharp distinctive pyramid",
    profileSvg: "M0 50 L 25 40 L 40 30 L 50 2 L 60 30 L 75 25 L 100 50"
  },
  {
    id: "vinson",
    name: "Mt. Vinson",
    year: "2017",
    description: "The highest mountain in Antarctica at 16,066ft (4,897m). Known as the coldest of the Seven Summits.",
    image: "/images/expeditions/Vinson_04-1340x894.jpg",
    images: [
      "/images/expeditions/Vinson_01-1340x894.jpg",
      "/images/expeditions/Vinson_02-1340x894.jpg",
      "/images/expeditions/Vinson_03-1340x894.jpg",
      "/images/expeditions/Vinson_04-1340x894.jpg",
      "/images/expeditions/Vinson_05-1340x894.jpg",
      "/images/expeditions/Vinson_06-1340x894.jpg",
      "/images/expeditions/Vinson_07-1340x894.jpg",
      "/images/expeditions/Vinson_08-1340x894.jpg",
      "/images/expeditions/Vinson_09-1340x894.jpg",
      "/images/expeditions/Vinson_10-1340x894.jpg"
    ],
    completed: true,
    shapeDescription: "Blocky Massif",
    profileSvg: "M0 50 L 20 35 L 30 25 L 45 20 L 55 22 L 65 18 L 80 35 L 100 50"
  },
  {
    id: "kosciuszko",
    name: "Mt. Kosciuszko",
    year: "2018",
    description: "Australia's tallest mountain at 7,310ft (2228m). Located in New South Wales.",
    image: "/images/expeditions/IMG_0743-small-1340x891.jpg",
    images: [
      "/images/expeditions/IMGP2584-small-1340x891.jpg",
      "/images/expeditions/IMG_0743-small-1340x891.jpg",
      "/images/expeditions/IMG_0739-small-1340x891.jpg",
      "/images/expeditions/IMGP2618-small-1340x891.jpg",
      "/images/expeditions/IMG_0754-small-1340x891.jpg",
      "/images/expeditions/BNRPE5622-small-1500x1200.jpg",
      "/images/expeditions/IMG_2252-small-1340x891.jpg",
      "/images/expeditions/IMG_2274-4-1340x891.jpg",
      "/images/expeditions/Diving-small-1500x1250.jpg"
    ],
    completed: true,
    shapeDescription: "Rounded rolling hill",
    profileSvg: "M0 50 C 25 45 35 25 50 25 S 75 45 100 50"
  },
  {
    id: "north-pole",
    name: "North Pole",
    year: "TBA",
    description: "The northernmost point on Earth in the Arctic Ocean. Constant shifting sea ice makes this a unique challenge.",
    image: "https://images.unsplash.com/photo-1464666316724-4739f295f406?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    completed: false
  },
  {
    id: "south-pole",
    name: "South Pole",
    year: "TBA",
    description: "The southernmost point on Earth, found at latitude 90 degrees South on the continent of Antarctica.",
    image: "https://images.unsplash.com/photo-1516979655822-71c6c9b4988f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    completed: false
  }
];

export const PRESS_LINKS: PressItem[] = [
  { title: "Tips and Tricks to Crush Your Goals", url: "https://blog.honeystinger.com/tips-and-tricks-to-crush-your-2020-goals/", source: "Honey Stinger", date: "Jan 2020" },
  { title: "Climbing the Seven Summits", url: "https://www.colorado.edu/coloradan/2018/12/01/climbing-seven-summits-kimberly-hess", source: "Coloradan", date: "Nov 2018" },
  { title: "Steamboat woman closes in on lofty goal", url: "https://theknow.denverpost.com/2017/12/27/kim-hess-peak-seven-continents-2017/170938/", source: "Denver Post", date: "Dec 2017" },
  { title: "Colorado woman summits Everest with Broncos flag", url: "http://www.9news.com/features/steamboat-woman-summits-everest-with-broncos-flag/212381150", source: "9 News Denver", date: "May 2016" }
];

export const VIDEOS: VideoItem[] = [
  { id: "DoHol4ZvnRY", title: "Kim Hess, Love Story, UC Health", url: "https://www.youtube.com/embed/DoHol4ZvnRY" },
  { id: "9J3qmNpEmwU", title: "Kim Hess - My Story", url: "https://www.youtube.com/embed/9J3qmNpEmwU" },
  { id: "R7R1gH4Hll8", title: "My Life, My Story", url: "https://www.youtube.com/embed/R7R1gH4Hll8" },
];

export const PARTNERS: Partner[] = [
  { name: "Korbel", logoUrl: "/images/partners/Korbel_02.png", url: "https://www.korbel.com" },
  { name: "UCHealth", logoUrl: "/images/partners/UC_Health_01.png", url: "https://www.uchealth.org" },
  { name: "Big Agnes", logoUrl: "/images/partners/Big_Agnes_Logo.png", url: "https://www.bigagnes.com" },
  { name: "Honey Stinger", logoUrl: "/images/partners/Honey_Stinger_03.png", url: "https://www.honeystinger.com" },
  { name: "Hestra", logoUrl: "/images/partners/Hestra_01.png", url: "https://en-us.hestragloves.com" },
];

// Blog posts are now in blogData.ts with full content
export { BLOG_POSTS } from './blogData';