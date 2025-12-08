
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Globe } from 'lucide-react';
import { EXPEDITIONS } from '../constants';

const GrandSlam: React.FC = () => {
  return (
    <section id="grand-slam" className="py-24 bg-brand-dark text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-wide mb-4">
            The Explorers <span className="text-brand-teal">Grand Slam</span>
          </h2>
          <p className="text-brand-teal uppercase tracking-[0.2em] text-sm font-bold mb-6">
            Progress Tracker
          </p>
          <a
            href="#globe"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-slate border border-brand-teal/50 rounded-full text-brand-teal font-bold uppercase tracking-wider text-sm hover:bg-brand-teal hover:text-white transition-all duration-300 shadow-lg hover:shadow-brand-teal/30 animate-pulse hover:animate-none"
          >
            <Globe size={18} className="animate-spin-slow" />
            Explore the Seven Summits
          </a>
        </div>

        {/* Vertical Timeline */}
        <div className="relative">
            {/* The Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-700 transform md:-translate-x-1/2"></div>

            <div className="space-y-16 md:space-y-24 pb-12">
                {EXPEDITIONS.map((expedition, index) => {
                    const isEven = index % 2 === 0;
                    
                    // Helper function to render the graphic
                    const renderGraphic = (className: string) => (
                         expedition.profileSvg ? (
                            <div className={`flex flex-col ${className}`}>
                                {expedition.shapeDescription && (
                                    <p className={`text-brand-teal font-heading font-bold text-xs uppercase tracking-widest mb-2 opacity-70`}>
                                        {expedition.shapeDescription}
                                    </p>
                                )}
                                <svg 
                                    viewBox="0 0 100 50" 
                                    className="w-48 h-16 text-brand-teal" 
                                    preserveAspectRatio="none"
                                >
                                    <path 
                                        d={expedition.profileSvg} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            </div>
                        ) : null
                    );

                    return (
                        <motion.div 
                            key={expedition.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Timeline Node */}
                            <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 top-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-brand-dark z-20 bg-brand-dark">
                                {expedition.completed ? (
                                    <div className="w-full h-full bg-transparent border-2 border-brand-teal rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                                        <Check size={16} className="text-brand-teal" strokeWidth={3} />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600">
                                        <Lock size={14} className="text-gray-500" />
                                    </div>
                                )}
                            </div>

                            {/* OPPOSITE SIDE (Graphic for Desktop) */}
                            <div className={`hidden md:flex md:w-1/2 flex-col justify-center ${isEven ? 'pl-24 items-start' : 'pr-24 items-end'}`}>
                                {renderGraphic(isEven ? 'items-start text-left' : 'items-end text-right')}
                            </div>

                            {/* CONTENT SIDE */}
                            <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-24 md:text-right items-end' : 'md:pl-24 md:text-left items-start'} flex flex-col`}>
                                
                                {/* Metadata Badge */}
                                <div className={`flex items-center gap-3 mb-3 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                                    <span className="px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-xs font-bold text-gray-300 shadow-sm">
                                        {expedition.year}
                                    </span>
                                    {expedition.completed ? (
                                        <span className="px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-brand-teal text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                                            Completed
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                            Remaining
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-3xl md:text-4xl font-heading font-black text-white mb-4 uppercase tracking-tight">
                                    {expedition.name}
                                </h3>
                                
                                <p className="text-gray-400 text-lg leading-relaxed font-light max-w-md">
                                    {expedition.description}
                                </p>

                                {/* Mobile Graphic */}
                                <div className="md:hidden mt-8 w-full flex flex-col items-start">
                                     {renderGraphic('items-start text-left')}
                                </div>
                                
                            </div>

                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a
            href="#globe"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-slate border border-brand-teal/50 rounded-full text-brand-teal font-bold uppercase tracking-wider text-sm hover:bg-brand-teal hover:text-white transition-all duration-300 shadow-lg hover:shadow-brand-teal/30 animate-pulse hover:animate-none"
          >
            <Globe size={18} className="animate-spin-slow" />
            Explore the Seven Summits
          </a>
        </div>

      </div>
    </section>
  );
};

export default GrandSlam;
