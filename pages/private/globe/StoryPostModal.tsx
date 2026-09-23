import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { BLOG_POSTS } from '../../../blogData';
import { assetPath } from '../../../utils/assetPath';

// Opens a blogData.ts post inside the mockup (the live Blog modal has no per-post URL).
const StoryPostModal: React.FC<{ postId: string | null; onClose: () => void }> = ({ postId, onClose }) => {
  const post = postId ? BLOG_POSTS.find((p) => p.id === postId) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!post) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <article
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-brand-slate shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white" aria-label="Close story">
          <X size={18} />
        </button>
        <img src={assetPath(post.image)} alt="" className="h-56 w-full object-cover" />
        <div className="p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">{post.date}</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-white">{post.title}</h2>
          <div className="mt-4 space-y-4 whitespace-pre-line text-gray-300 leading-relaxed">{post.content}</div>
        </div>
      </article>
    </div>
  );
};

export default StoryPostModal;
