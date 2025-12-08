import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { EXPEDITIONS } from '../constants';
import { Expedition } from '../types';

const Expeditions: React.FC = () => {
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (expedition: Expedition) => {
    setSelectedExpedition(expedition);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedExpedition(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  const images = selectedExpedition?.images || [selectedExpedition?.image].filter(Boolean) as string[];

  const nextImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedExpedition) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedExpedition, nextImage, prevImage]);

  return (
    <section id="expeditions" className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-gray-800 pb-6">
          <h2 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-wide">
            Expedition <span className="text-brand-teal">Gallery</span>
          </h2>
          <p className="text-gray-400 mt-4 md:mt-0">Scenes from the Summit</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPEDITIONS.filter(e => e.completed).map((expedition, index) => (
            <motion.div
              key={expedition.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
              onClick={() => openLightbox(expedition)}
            >
              <img
                src={expedition.image}
                alt={expedition.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h3 className="text-2xl font-heading font-bold text-white mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {expedition.name}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-brand-teal text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      {expedition.year}
                  </p>
                  {expedition.images && expedition.images.length > 1 && (
                    <span className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {expedition.images.length} photos
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedExpedition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            >
              <X size={32} />
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl w-full px-4 md:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main image with animation */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  src={images[currentImageIndex]}
                  alt={`${selectedExpedition.name} - Photo ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                />
              </AnimatePresence>

              {/* Info and thumbnails */}
              <div className="mt-6 text-center">
                <h3 className="text-3xl font-heading font-bold text-white mb-2">
                  {selectedExpedition.name}
                </h3>
                <p className="text-brand-teal font-bold uppercase tracking-widest mb-2">
                  {selectedExpedition.year}
                </p>

                {/* Image counter */}
                {images.length > 1 && (
                  <p className="text-gray-500 text-sm mb-4">
                    {currentImageIndex + 1} / {images.length}
                  </p>
                )}

                <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                  {selectedExpedition.description}
                </p>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-2 flex-wrap max-w-3xl mx-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-16 h-12 rounded overflow-hidden transition-all ${
                          idx === currentImageIndex
                            ? 'ring-2 ring-brand-teal opacity-100'
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Expeditions;
