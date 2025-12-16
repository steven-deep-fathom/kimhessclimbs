import React, { Suspense } from 'react';
import { Menu, X, Instagram, Facebook, Mountain, ArrowLeft } from 'lucide-react';
import HeightmapTerrain from '../../components/ui/heightmap-terrain';

// Simplified navbar for mockup pages - warm orange theme
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
              Kim Hess <span className="text-amber-400 font-light">Climbs</span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="#home"
              className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors duration-200 text-sm font-semibold uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              Back to Main Site
            </a>
            <a
              href="#private"
              className="text-gray-300 hover:text-amber-400 transition-colors duration-200 text-sm font-semibold uppercase tracking-wider"
            >
              Sandbox
            </a>
            {/* Social Icons */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <a
                href="https://www.instagram.com/kimmyhess/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/kimhessclimbs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-amber-400 focus:outline-none"
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
    <footer className="relative z-10 bg-black/80 backdrop-blur-sm py-8 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <Mountain className="w-5 h-5 text-amber-400" />
            <span className="font-heading font-bold text-lg tracking-widest text-white uppercase">
              Kim Hess <span className="text-amber-400 font-light">Climbs</span>
            </span>
          </div>
          <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Mount Kilimanjaro - 5,895m
          </div>
          <p className="text-gray-600 text-xs font-bold tracking-wider">
            &copy; {new Date().getFullYear()} Kim Hess. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function KilimanjaroScenePage() {
  return (
    <div className="bg-slate-950 min-h-screen flex flex-col">
      <MockupNavbar />

      {/* Main content area with Kilimanjaro terrain */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* Three.js Kilimanjaro Terrain - dramatic side view */}
        <Suspense fallback={<div className="w-full h-full bg-slate-950" />}>
          <HeightmapTerrain
            heightmapUrl="/heightmaps/kilimanjaro.png"
            color="#fb923c"  // Warm orange / African sunset
            heightScale={8.0}  // Very dramatic vertical exaggeration
          />
        </Suspense>

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="bg-amber-500/20 text-amber-300 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            The Roof of Africa
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-4 drop-shadow-lg">
            Mount Kilimanjaro
          </h1>
          <p className="text-2xl text-amber-200 font-light mb-2">
            5,895 meters / 19,341 feet
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mb-8">
            Africa's highest peak and a dormant stratovolcano. One of Kim's Seven Summits conquests.
            Move your mouse to illuminate the terrain.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#private/everest"
              className="bg-sky-500 text-white hover:bg-sky-600 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-sky-500/30"
            >
              View Everest
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
