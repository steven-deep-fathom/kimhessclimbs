import React, { Suspense } from 'react';
import { Menu, X, Instagram, Facebook, Mountain, ArrowLeft } from 'lucide-react';
import HeightmapTerrain from '../../components/ui/heightmap-terrain';

// Simplified navbar for mockup pages
function MockupNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur-sm shadow-lg py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#home"
              className="font-heading font-bold text-2xl tracking-widest text-white uppercase"
            >
              Kim Hess <span className="text-sky-400 font-light">Climbs</span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="#home"
              className="flex items-center gap-2 text-gray-300 hover:text-sky-400 transition-colors duration-200 text-sm font-semibold uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              Back to Main Site
            </a>
            <a
              href="#private"
              className="text-gray-300 hover:text-sky-400 transition-colors duration-200 text-sm font-semibold uppercase tracking-wider"
            >
              Sandbox
            </a>
            {/* Social Icons */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <a
                href="https://www.instagram.com/kimmyhess/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-sky-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/kimhessclimbs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-sky-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-sky-400 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-slate-800 absolute w-full shadow-xl border-b border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#home"
              className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-slate-700 px-3 py-4 rounded-md text-base font-medium uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              Back to Main Site
            </a>
            <a
              href="#private"
              className="text-gray-300 hover:text-white hover:bg-slate-700 block px-3 py-4 rounded-md text-base font-medium uppercase tracking-wider"
            >
              Sandbox
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function MockupFooter() {
  return (
    <footer className="relative z-10 bg-black/80 backdrop-blur-sm py-8 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <Mountain className="w-5 h-5 text-sky-400" />
            <span className="font-heading font-bold text-lg tracking-widest text-white uppercase">
              Kim Hess <span className="text-sky-400 font-light">Climbs</span>
            </span>
          </div>
          <div className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Mount Everest - 8,849m
          </div>
          <p className="text-gray-600 text-xs font-bold tracking-wider">
            &copy; {new Date().getFullYear()} Kim Hess. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function EverestScenePage() {
  return (
    <div className="bg-slate-950 min-h-screen flex flex-col">
      <MockupNavbar />

      {/* Main content area with Everest terrain */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* Three.js Everest Terrain - dramatic side view of Himalayan ridge */}
        <Suspense fallback={<div className="w-full h-full bg-slate-950" />}>
          <HeightmapTerrain
            heightmapUrl="/heightmaps/everest.png"
            color="#7dd3fc"  // Sky blue / icy
            heightScale={7.0}  // Very dramatic vertical exaggeration
          />
        </Suspense>

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="bg-sky-500/20 text-sky-300 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            The Roof of the World
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-4 drop-shadow-lg">
            Mount Everest
          </h1>
          <p className="text-2xl text-sky-200 font-light mb-2">
            8,849 meters / 29,032 feet
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mb-8">
            The highest peak on Earth. Summit reached by Kim Hess as part of the Seven Summits challenge.
            Move your mouse to illuminate the terrain.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#private/kilimanjaro"
              className="bg-amber-500 text-white hover:bg-amber-600 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-amber-500/30"
            >
              View Kilimanjaro
            </a>
            <a
              href="#private"
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all border border-white/20"
            >
              All Summits
            </a>
          </div>
        </div>
      </main>

      <MockupFooter />
    </div>
  );
}
