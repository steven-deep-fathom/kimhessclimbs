import React from 'react';
import { PRESS_LINKS, VIDEOS } from '../constants';
import { ExternalLink } from 'lucide-react';

const Press: React.FC = () => {
  return (
    <section id="press" className="py-24 bg-brand-slate border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-wide mb-4">
            In The <span className="text-brand-teal">News</span>
          </h2>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {VIDEOS.map((video) => (
            <div key={video.id} className="bg-black rounded-lg overflow-hidden border border-gray-800 shadow-lg hover:shadow-brand-teal/20 transition-all duration-300">
              <div className="aspect-video relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={video.url} 
                  title={video.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4">
                <h4 className="font-heading text-lg text-white">{video.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Articles List */}
        <div className="max-w-4xl mx-auto bg-brand-dark rounded-xl p-8 border border-gray-800">
            <div className="space-y-6">
            {PRESS_LINKS.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-800 last:border-0 hover:bg-gray-900/50 rounded-lg transition-colors p-4 -mx-4 md:mx-0 md:p-0">
                    <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-white hover:text-brand-teal transition-colors flex items-center gap-2 mb-2 md:mb-0"
                    >
                        {item.title}
                        <ExternalLink size={16} className="text-gray-500" />
                    </a>
                    <div className="flex items-center text-sm text-gray-400 space-x-4">
                        <span className="font-bold text-brand-teal uppercase">{item.source}</span>
                        <span>{item.date}</span>
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Press;