import React, { useEffect } from 'react';
import { Instagram } from 'lucide-react';

const InstagramFeed: React.FC = () => {
  useEffect(() => {
    // Load LightWidget script
    const script = document.createElement('script');
    script.src = 'https://cdn.lightwidget.com/widgets/lightwidget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://cdn.lightwidget.com/widgets/lightwidget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section className="py-16 bg-brand-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-wide text-white text-center mb-10">
          Follow The <span className="text-brand-teal">Journey</span>
        </h2>

        {/* Instagram Handle */}
        <div className="text-center mb-10">
          <a
            href="https://www.instagram.com/kimmyhess/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h3 className="text-white font-heading font-bold text-lg group-hover:text-brand-teal transition-colors">
                @kimmyhess
              </h3>
              <p className="text-gray-400 text-sm">Follow the Journey</p>
            </div>
          </a>
        </div>

        {/* LightWidget Instagram Feed */}
        <div className="rounded-lg overflow-hidden">
          <iframe
            src="//lightwidget.com/widgets/7f1ba3adfb5e5d3094228fa0637daf20.html"
            scrolling="no"
            allowTransparency={true}
            className="lightwidget-widget"
            style={{ width: '100%', border: 0, overflow: 'hidden' }}
          />
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/kimmyhess/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full text-white font-bold uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
          >
            <Instagram size={18} />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
