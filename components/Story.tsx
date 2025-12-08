import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Story: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="story" className="py-24 bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-wide mb-4"
          >
            The <span className="text-brand-teal">Story</span>
          </motion.h2>
          <div className="h-1 w-20 bg-brand-teal mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800">
              <img 
                src="/images/portraits/Photo-May-21-4-23-03-AM-1-2.jpg" 
                alt="Kim on Everest Summit" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-brand-slate p-6 rounded-xl shadow-xl border border-gray-700 hidden md:block">
              <p className="text-5xl font-bold text-brand-teal font-heading">7</p>
              <p className="text-sm uppercase tracking-wider text-gray-400">Summits<br/>Conquered</p>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-heading font-semibold text-brand-teal uppercase tracking-wider">
              "There are 7 billion people that inhabit our planet. Less than 60 have ever completed the Explorers Grand Slam. Only 12 are women."
            </h3>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              Comprised of climbing the tallest peak on each continent—the Seven Summits—and completing a traverse to the North and South Pole. Located in the most hostile environments on Earth, it breaks even the toughest athletes.
            </p>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              With the Seven Summits down, Kim is vying to become the youngest American Woman to complete the Explorers Grand Slam. The poles are next.
            </p>
            
            <div className={`space-y-6 overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-gray-300 leading-relaxed">
                I remember the first time I laid eyes on Mt. Everest. I was 8 years old. I imagined standing on the summit would be like going to the moon. That was the day the seed was planted.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Upon my return from traveling the world, my brother Steven challenged me to climb the Seven Summits. I agreed instantly. We started in 2011 with Aconcagua.
              </p>
              <p className="text-gray-300 leading-relaxed">
                My path wasn't straight. A broken arm on Denali devastated me. But I stopped feeling sorry for myself. Three surgeries later, I signed up for Mt. Everest.
              </p>
              <div className="bg-brand-slate p-6 rounded-lg border-l-4 border-brand-teal italic text-gray-300">
                  "I’ve lived by the motto: Don’t let your dreams be dreams. I set my eyes on the impossible and I’ve done the impossible to achieve it."
              </div>
            </div>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-brand-teal font-bold uppercase tracking-wider hover:text-white transition-colors mt-4"
            >
              {isExpanded ? (
                <>Read Less <ChevronUp size={20} /></>
              ) : (
                <>Read Full Bio <ChevronDown size={20} /></>
              )}
            </button>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Story;