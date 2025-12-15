import React from 'react';

// Example mockup template
// Copy this file and rename it to create new mockups
// Then register it in App.tsx under the private routes

export default function ExampleMockup() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <a href="#private" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to sandbox
          </a>
        </div>

        <h1 className="text-3xl font-bold mb-4">Example Mockup</h1>
        <p className="text-slate-400 mb-8">
          This is a template mockup. Replace this content with your design.
        </p>

        {/* Your mockup content goes here */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <p>Your mockup content here...</p>
        </div>
      </div>
    </div>
  );
}
