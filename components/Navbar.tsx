import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Facebook } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "The\u00A0Story", href: "#story" },
    { name: "Grand\u00A0Slam", href: "#grand-slam" },
    { name: "Book\u00A0Kim", href: "#book-kim" },
    { name: "The\u00A0Blog", href: "#blog" },
    { name: "Expeditions", href: "#expeditions" },
    { name: "Partners", href: "#partners" },
    { name: "Press", href: "#press" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-brand-dark/95 backdrop-blur-sm shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <a 
              href="#" 
              className="font-heading font-bold text-2xl tracking-widest text-white uppercase"
            >
              Kim Hess <span className="text-brand-teal font-light">Climbs</span>
            </a>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-gray-300 hover:text-brand-teal transition-colors duration-200 px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider"
                >
                  {link.name}
                </a>
              ))}
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="bg-brand-teal text-white hover:bg-teal-600 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-brand-teal/30">
                Book Now
              </a>
              {/* Social Icons */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                <a
                  href="https://www.instagram.com/kimmyhess/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://www.facebook.com/kimhessclimbs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-brand-teal focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-brand-slate absolute w-full shadow-xl border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-gray-300 hover:text-white hover:bg-brand-dark block px-3 py-4 rounded-md text-base font-medium uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
            {/* Mobile Social Icons */}
            <div className="flex items-center gap-4 px-3 pt-4 mt-2 border-t border-gray-700">
              <a
                href="https://www.instagram.com/kimmyhess/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/kimhessclimbs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-teal transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;