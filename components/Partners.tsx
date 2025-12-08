import React from 'react';
import { PARTNERS } from '../constants';

const Partners: React.FC = () => {
  return (
    <section id="partners" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-brand-dark uppercase tracking-wide mb-4">Partners</h2>
          <div className="h-1 w-16 bg-brand-teal mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-center justify-items-center opacity-80 hover:opacity-100 transition-opacity">
          {PARTNERS.map((partner, index) => (
            <a 
              key={index} 
              href={partner.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group transition-all duration-300 w-full flex justify-center grayscale hover:grayscale-0"
            >
              <img 
                src={partner.logoUrl} 
                alt={partner.name} 
                className="max-h-12 w-auto object-contain transform group-hover:scale-105 transition-transform"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;