import React, { useState } from 'react';
import { ArrowRight, Instagram, Facebook, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xanrdqkr', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-brand-teal relative overflow-hidden">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white p-8 md:p-16 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Info */}
            <div className="col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:pr-8">
                <h2 className="text-4xl font-heading font-bold text-brand-dark uppercase tracking-tight mb-6">
                    Get In <br/><span className="text-brand-teal">Touch</span>
                </h2>
                <p className="text-gray-500 mb-8 font-sans leading-relaxed">
                    Speaking Bookings • Partnerships • Press Inquiries
                </p>
                <div className="flex flex-col space-y-6">
                    <a href="mailto:kim@kimhessclimbs.com" className="text-brand-dark font-bold text-lg hover:text-brand-teal transition-colors">
                        kim@kimhessclimbs.com
                    </a>
                    <div className="flex space-x-4">
                        <a href="https://www.instagram.com/kimmyhess/" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-brand-teal hover:text-white transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="https://www.facebook.com/kimhessclimbs/" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-brand-teal hover:text-white transition-colors">
                            <Facebook size={20} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="col-span-1 md:col-span-2">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-brand-teal mb-4" />
                    <h3 className="text-2xl font-heading font-bold text-brand-dark mb-2">Message Sent!</h3>
                    <p className="text-gray-500">Thank you for reaching out. Kim will get back to you soon.</p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-6 text-brand-teal font-semibold hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="sr-only">Name</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Your Name"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="sr-only">Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="Your Email"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder-gray-400"
                          />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subject" className="sr-only">Subject</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          placeholder="Subject"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="sr-only">Message</label>
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          required
                          placeholder="Your Message"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder-gray-400 resize-none"
                        ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-4 bg-brand-dark text-white font-bold uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                  </form>
                )}
            </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;