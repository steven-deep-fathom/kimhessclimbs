
import React from 'react';
import { motion } from 'framer-motion';
import { Quote, ArrowRight } from 'lucide-react';

const Speaking: React.FC = () => {
  const testimonials = [
    {
      quote: "Kim inspired the girls to want to be her and to engage in the challenges of life, she motivated the young women to yearn for outdoor exploration and to find their own life purpose.",
      author: "Denver School Educator"
    },
    {
      quote: "She was AWESOME! The nursing leaders as they left for the day shared how they were in awe of her and appreciative of the boost.",
      author: "UCHealth"
    },
    {
      quote: "Thank you very much for presenting last night. Your story is absolutely amazing! I could have listened to you all night and I think it was a great way to end the evening.",
      author: "Editor at Steamboat Pilot & Today"
    }
  ];

  return (
    <section id="book-kim" className="py-24 bg-brand-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 text-center md:text-left">
            <h2 className="text-brand-teal font-bold tracking-widest uppercase mb-4 text-sm md:text-base">
            Motivational Speaker
            </h2>
            <h3 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter leading-none">
            Inspire Your Audience
            </h3>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16 h-auto lg:h-[600px]">
        
        {/* Left Column: Portrait (Tall) */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800 group min-h-[400px] lg:min-h-0 order-2 lg:order-1"
        >
            <img 
            src="/images/portraits/KimmySteamboat-7.jpg" 
            alt="Kim Hess Portrait" 
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg italic">"The only person who can stop you from achieving anything in life is yourself."</p>
            </div>
        </motion.div>

        {/* Right Column: Content + Event Photo */}
        <div className="lg:col-span-8 grid grid-rows-1 lg:grid-rows-2 gap-6 order-1 lg:order-2">
            
            {/* Content Box */}
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gray-800 p-8 md:p-10 rounded-3xl border border-gray-700 flex flex-col justify-center items-start relative overflow-hidden"
            >
                {/* Decorative BG Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <p className="text-lg text-gray-300 leading-relaxed mb-8 relative z-10">
                Kim captivates audiences with hair-raising stories of adventure tailored to empower your team. From the summit of Mt. Everest to the boardroom, she dives into lessons on resilience, grit, and the power of perspective.
                </p>

                <div className="flex flex-wrap gap-4 relative z-10">
                <a 
                    href="#contact" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-brand-teal text-white font-bold uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-brand-teal/20 rounded-xl group"
                >
                    Book Kim Now
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <div className="flex items-center gap-2 px-6 py-4 border border-gray-600 rounded-xl text-gray-300">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Accepting 2025 Inquiries</span>
                </div>
                </div>
            </motion.div>

            {/* Event Photo (Wide) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800 group min-h-[250px]"
            >
                <img 
                src="/images/portraits/Evre-Event-small.jpg" 
                alt="Kim Hess Speaking Event" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-brand-dark/0 transition-colors duration-500"></div>
                <div className="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Live Events
                </div>
            </motion.div>

        </div>
        </div>

        {/* Testimonials Ticker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((item, idx) => (
            <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + (idx * 0.1) }}
            className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 hover:border-brand-teal/30 transition-colors"
            >
            <div className="text-brand-teal mb-3">
                <Quote size={24} />
            </div>
            <p className="text-gray-400 italic text-sm mb-4">"{item.quote}"</p>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">{item.author}</p>
            </motion.div>
        ))}
        </div>

      </div>
    </section>
  );
};

export default Speaking;
