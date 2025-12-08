import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { BLOG_POSTS } from '../constants';
import { BlogPost } from '../types';
import { assetPath } from '../utils/assetPath';

const Blog: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    document.body.style.overflow = 'hidden';
  };

  const closePost = () => {
    setSelectedPost(null);
    document.body.style.overflow = 'unset';
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 408; // Card width (384px / w-96) + gap (24px)
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // All posts for the carousel (most recent first)
  const allPosts = BLOG_POSTS;

  return (
    <section id="blog" className="py-24 bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-wide mb-4">
            The <span className="text-brand-teal">Blog</span>
          </h2>
          <p className="text-xl text-gray-400">Stories from the front lines</p>
        </div>

        {/* Stories Carousel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-teal">{allPosts.length} Stories</h3>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-3 rounded-full bg-brand-slate border border-gray-700 text-white hover:bg-brand-teal hover:border-brand-teal transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-3 rounded-full bg-brand-slate border border-gray-700 text-white hover:bg-brand-teal hover:border-brand-teal transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-96 bg-brand-slate rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-800 cursor-pointer group snap-start"
                onClick={() => openPost(post)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={assetPath(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-brand-teal text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                    {post.date}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                      Read Story <ArrowRight size={18} />
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-xl font-bold font-heading text-white mb-3 group-hover:text-brand-teal transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Gradient Fade Indicators */}
          <div className="absolute left-0 top-16 bottom-4 w-8 bg-gradient-to-r from-brand-dark to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-16 bottom-4 w-8 bg-gradient-to-l from-brand-dark to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Blog Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/95 overflow-y-auto py-8 px-4"
            onClick={closePost}
          >
            <button
              onClick={closePost}
              className="fixed top-6 right-6 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/50 rounded-full hover:bg-black/70"
            >
              <X size={28} />
            </button>

            <motion.article
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="max-w-3xl w-full bg-brand-slate rounded-2xl overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero Image */}
              <div className="relative h-64 md:h-80">
                <img
                  src={assetPath(selectedPost.image)}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-slate via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block bg-brand-teal text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                    {selectedPost.date}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
                    {selectedPost.title}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Tags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Blog Content */}
                <div className="prose prose-lg prose-invert max-w-none">
                  {selectedPost.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-300 leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Close button at bottom */}
                <div className="mt-12 pt-8 border-t border-gray-700 text-center">
                  <button
                    onClick={closePost}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-brand-teal text-white font-bold uppercase tracking-wider rounded-full hover:bg-teal-600 transition-colors"
                  >
                    Back to Blog
                  </button>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Blog;
