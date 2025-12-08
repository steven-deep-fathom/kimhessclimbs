import React from 'react';
import { Instagram, Facebook, Mountain } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <Mountain className="w-6 h-6 text-brand-teal" />
            <span className="font-heading font-bold text-xl tracking-widest text-white uppercase">
              Kim Hess <span className="text-brand-teal font-light">Climbs</span>
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6 mb-8">
            <a
              href="https://www.instagram.com/kimmyhess/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-brand-teal transition-colors duration-200 group"
              aria-label="Instagram"
            >
              <Instagram size={24} />
              <span className="text-sm font-semibold uppercase tracking-wider group-hover:text-brand-teal">@kimmyhess</span>
            </a>
            <span className="text-gray-700">|</span>
            <a
              href="https://www.facebook.com/kimhessclimbs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-brand-teal transition-colors duration-200 group"
              aria-label="Facebook"
            >
              <Facebook size={24} />
              <span className="text-sm font-semibold uppercase tracking-wider group-hover:text-brand-teal">Kim Hess Climbs</span>
            </a>
          </div>

          {/* Tagline */}
          <p className="text-gray-500 text-sm mb-6 max-w-md text-center">
            Seven Summits Completed. Explorer's Grand Slam in Progress. Inspiring others to reach their peaks.
          </p>

          {/* Copyright */}
          <p className="text-gray-600 text-xs font-bold tracking-wider">
            &copy; {new Date().getFullYear()} Kim Hess. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;