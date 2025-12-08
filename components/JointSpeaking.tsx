import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const JointSpeaking: React.FC = () => {
  return (
    <section id="joint-speaking" className="py-24 bg-brand-slate text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 text-right">
            <motion.h2 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-wide"
            >
              Joint <span className="text-brand-teal">Speaking</span>
            </motion.h2>
            <div className="h-1 w-24 bg-brand-teal ml-auto mt-2 rounded-full"></div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-brand-dark rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
          
          {/* Image Side - Conserve object position fix */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] lg:h-auto"
          >
             {/* TODO: Add actual image of Steven and Kim Hess */}
             <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
               <span className="text-gray-500 text-lg font-medium">Image Coming Soon</span>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent opacity-60 lg:opacity-30"></div>
          </motion.div>

          {/* Content Side */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="p-10 lg:p-16 flex flex-col justify-center"
          >
             <h4 className="text-3xl font-heading font-bold text-white mb-6">
               Tech Entrepreneur <span className="text-brand-teal">&</span> World Class Climber
             </h4>
             
             <p className="text-lg text-gray-300 leading-relaxed mb-10">
               Kim's world class climbing brother and accomplished trail blazing tech entrepreneur is available for select audiences. Together, they bring a dynamic perspective on risk, innovation, and peak performance that transcends boundaries.
             </p>

             <div>
               <a 
                 href="#contact" 
                 className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-brand-teal text-brand-teal font-bold uppercase tracking-wider rounded-full hover:bg-brand-teal hover:text-white transition-all"
               >
                 Book The Duo
                 <ArrowRight size={20} />
               </a>
             </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default JointSpeaking;