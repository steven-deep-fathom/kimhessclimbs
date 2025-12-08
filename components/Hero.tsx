
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/backgrounds/Kim_Hess_Climbs_Splash04.jpg" 
          alt="Kim Hess Climbing" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-brand-dark"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 w-full max-w-5xl mx-auto mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-brand-teal font-bold tracking-[0.3em] text-lg md:text-xl uppercase mb-6">
            Mountaineer • Motivator • Storyteller
          </h2>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white uppercase tracking-tight mb-6 drop-shadow-2xl">
            Kim Hess
          </h1>
          
          <div className="h-1 w-24 bg-brand-teal mx-auto mb-8 rounded-full"></div>

          <p className="text-gray-200 text-lg md:text-2xl font-light tracking-wide max-w-3xl mx-auto mb-12 leading-relaxed">
            Pursuing the Explorers Grand Slam. Defying Limits. Conquering The Impossible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#book-kim" 
              className="px-8 py-4 bg-brand-teal text-white font-bold uppercase tracking-widest rounded-full hover:bg-teal-600 transition-all shadow-lg hover:shadow-brand-teal/50 transform hover:-translate-y-1"
            >
              Book Kim
            </a>
            <a 
              href="#story" 
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-brand-dark transition-all transform hover:-translate-y-1"
            >
              My Story
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown size={40} />
      </motion.div>
    </section>
  );
};

export default Hero;
