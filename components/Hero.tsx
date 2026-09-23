import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ResponsiveImage } from './ResponsiveImage';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ResponsiveImage
          src="/images/backgrounds/Kim_Hess_Climbs_Splash04.jpg"
          sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
          eager
          highPriority
          alt="Kim Hess Climbing"
          className="w-full h-full object-cover object-[82%_50%] lg:object-center xl:landscape:object-[40%_50%] lg:portrait:object-[68%_50%]"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-brand-dark"></div>
      </div>

      {/* Content. Below lg the photo is framed on Kim, whose head sits at 43-57%
          of the height, so the text splits above and below that band. Screens
          under 500 px tall (landscape phones) can't fit that, so they get the
          centred desktop layout in a smaller size. On desktop the subtitle is
          narrower and the photo is positioned (centre at lg, 40% on wide
          landscape screens, 68% on upright tablets) to keep her head beside it. */}
      <div className="relative z-20 text-center px-4 w-full max-w-5xl mx-auto h-full flex flex-col lg:h-auto lg:block lg:mt-16 [@media(max-height:500px)]:h-auto [@media(max-height:500px)]:block [@media(max-height:500px)]:mt-12">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-lg:h-[43%] max-lg:flex max-lg:flex-col max-lg:justify-end max-lg:items-center max-lg:pb-3 [@media(max-height:500px)]:h-auto [@media(max-height:500px)]:block [@media(max-height:500px)]:pb-0"
        >
          <h2 className="text-brand-teal font-bold tracking-[0.3em] text-lg md:text-xl uppercase mb-3 lg:mb-6 [@media(max-height:500px)]:text-base">
            Mountaineer • Motivator • Storyteller
          </h2>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white uppercase tracking-tight mb-4 lg:mb-6 drop-shadow-2xl [@media(max-height:500px)]:text-5xl [@media(max-height:500px)]:mb-3">
            Kim Hess
          </h1>
          
          <div className="h-1 w-24 bg-brand-teal mx-auto lg:mb-8 rounded-full [@media(max-height:500px)]:mb-4"></div>
        </motion.div>

        <div className="lg:hidden h-[14%] [@media(max-height:500px)]:hidden"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-lg:pt-3 [@media(max-height:500px)]:pt-0"
        >
          <p className="text-gray-200 text-lg md:text-2xl font-light tracking-wide max-w-3xl lg:max-w-xl mx-auto mb-6 lg:mb-12 leading-relaxed [@media(max-height:500px)]:text-lg [@media(max-height:500px)]:mb-4">
            Pursuing the Explorers Grand Slam. Defying Limits. Conquering The Impossible.
          </p>
          
          <div className="flex flex-row gap-4 justify-center">
            <a 
              href="#book-kim" 
              className="px-6 py-3 sm:px-8 sm:py-4 bg-brand-teal text-white font-bold uppercase tracking-widest rounded-full hover:bg-teal-600 transition-all shadow-lg hover:shadow-brand-teal/50 transform hover:-translate-y-1"
            >
              Book Kim
            </a>
            <a 
              href="#story" 
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-brand-dark transition-all transform hover:-translate-y-1"
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
