import React from 'react';

// Private sandbox index - lists available mockups
// This page itself is unlisted, only accessible via direct URL

const mockups = [
  // Add mockups here as you create them:
  { name: 'mountain-scene', description: 'Interactive Three.js terrain with procedural generation' },
  { name: 'example', description: 'Template mockup - copy this to create new ones' },
];

export default function PrivateIndex() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Private Sandbox</h1>
        <p className="text-slate-400 mb-8">
          Unlisted mockups and experiments. These pages are live but not linked from the main site.
        </p>

        {mockups.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400">No mockups yet. Create one in <code className="bg-slate-700 px-2 py-1 rounded">pages/private/</code></p>
          </div>
        ) : (
          <ul className="space-y-3">
            {mockups.map((mockup) => (
              <li key={mockup.name}>
                <a
                  href={`#private/${mockup.name}`}
                  className="block bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-700 transition-colors"
                >
                  <span className="font-medium">{mockup.name}</span>
                  {mockup.description && (
                    <span className="text-slate-400 ml-2">— {mockup.description}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 pt-8 border-t border-slate-700">
          <a href="#home" className="text-amber-400 hover:text-amber-300">
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  );
}
