import React, { Suspense } from 'react';
import { Menu, X, Instagram, Facebook, Mountain, ArrowLeft } from 'lucide-react';
import GenerativeMountainScene from '../../components/ui/mountain-scene';

// Simplified navbar for mockup pages - links back to main site
function MockupNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed w-full z-50 bg-brand-dark/95 backdrop-blur-sm shadow-lg py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#home"
              className="font-heading font-bold text-2xl tracking-widest text-white uppercase"
            >
              Kim Hess <span className="text-brand-teal font-light">Climbs</span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="#home"
              className="flex items-center gap-2 text-gray-300 hover:text-brand-teal transition-colors duration-200 text-sm font-semibold uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              Back to Main Site
            </a>
            <a
              href="#private"
              className="text-gray-300 hover:text-brand-teal transition-colors duration-200 text-sm font-semibold uppercase tracking-wider"
            >
              Sandbox
            </a>
            {/* Social Icons */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <a
                href="https://www.instagram.com/kimmyhess/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/kimhessclimbs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-brand-teal focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-brand-slate absolute w-full shadow-xl border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#home"
              className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-brand-dark px-3 py-4 rounded-md text-base font-medium uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              Back to Main Site
            </a>
            <a
              href="#private"
              className="text-gray-300 hover:text-white hover:bg-brand-dark block px-3 py-4 rounded-md text-base font-medium uppercase tracking-wider"
            >
              Sandbox
            </a>
            {/* Mobile Social Icons */}
            <div className="flex items-center gap-4 px-3 pt-4 mt-2 border-t border-gray-700">
              <a
                href="https://www.instagram.com/kimmyhess/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/kimhessclimbs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Simplified footer for mockup pages
function MockupFooter() {
  return (
    <footer className="relative z-10 bg-black/80 backdrop-blur-sm py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <Mountain className="w-5 h-5 text-brand-teal" />
            <span className="font-heading font-bold text-lg tracking-widest text-white uppercase">
              Kim Hess <span className="text-brand-teal font-light">Climbs</span>
            </span>
          </div>

          {/* Mockup Badge */}
          <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Mockup / Sandbox
          </div>

          {/* Copyright */}
          <p className="text-gray-600 text-xs font-bold tracking-wider">
            &copy; {new Date().getFullYear()} Kim Hess. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MountainScenePage() {
  return (
    <div className="bg-slate-900 min-h-screen flex flex-col">
      <MockupNavbar />

      {/* Main content area with mountain scene */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* Three.js Mountain Scene */}
        <Suspense fallback={<div className="w-full h-full bg-slate-900" />}>
          <GenerativeMountainScene />
        </Suspense>

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 drop-shadow-lg">
            Mountain Scene
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl drop-shadow-md">
            Interactive Three.js terrain with procedural generation and dynamic lighting.
            Move your mouse to control the light position.
          </p>
          <div className="mt-8 flex gap-4">
            <a
              href="#private"
              className="bg-brand-teal text-white hover:bg-teal-600 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-brand-teal/30"
            >
              Back to Sandbox
            </a>
            <a
              href="#home"
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all border border-white/20"
            >
              Main Site
            </a>
          </div>
        </div>
      </main>

      <MockupFooter />
    </div>
  );
}
