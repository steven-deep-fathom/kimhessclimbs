import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import GrandSlam from './components/GrandSlam';
import Speaking from './components/Speaking';
// Instagram feed temporarily disabled - requires paid LightWidget plan for HTTPS
// import InstagramFeed from './components/InstagramFeed';
import Blog from './components/Blog';
import Expeditions from './components/Expeditions';
import Partners from './components/Partners';
import Press from './components/Press';
import Contact from './components/Contact';
import Footer from './components/Footer';
// Loaded on demand so D3 stays out of the home page download.
const GlobePage = lazy(() => import('./pages/GlobePage'));

// Private sandbox routes: unlisted mockups, reachable only by direct URL and never
// linked from the site. Each loads on demand, so none of it is in the home download.
const privateRoutes: Record<string, React.LazyExoticComponent<React.ComponentType>> = {};
{
  const PrivateIndex = lazy(() => import('./pages/private/PrivateIndex'));
  privateRoutes['#private'] = PrivateIndex;
  privateRoutes['#private/'] = PrivateIndex;
  privateRoutes['#private/example'] = lazy(() => import('./pages/private/ExampleMockup'));
  privateRoutes['#private/mountain-scene'] = lazy(() => import('./pages/private/MountainScene'));
  privateRoutes['#private/everest'] = lazy(() => import('./pages/private/EverestScene'));
  privateRoutes['#private/kilimanjaro'] = lazy(() => import('./pages/private/KilimanjaroScene'));
  privateRoutes['#private/globe-real'] = lazy(() => import('./pages/private/globe/GlobeReal'));
  privateRoutes['#private/globe-story'] = lazy(() => import('./pages/private/globe/GlobeStory'));
  privateRoutes['#private/globe-dive'] = lazy(() => import('./pages/private/globe/GlobeDive'));
  privateRoutes['#private/globe-page'] = lazy(() => import('./pages/private/globe/GlobePageM1'));
  privateRoutes['#private/summit-hero'] = lazy(() => import('./pages/private/globe/SummitHero'));
  privateRoutes['#private/ridgeline-hero'] = lazy(() => import('./pages/private/globe/RidgelineHero'));
  // Design feedback mood board (docs/plans/2026-09-23_design-refresh.md)
  privateRoutes['#private/moodboard'] = lazy(() => import('./pages/private/MoodBoard'));
}

const RELOAD_FLAG = 'khc-chunk-reload';
const CHUNK_ERROR = /Loading chunk|dynamically imported module|Importing a module script failed/i;

// A tab opened before a deploy can request a chunk that no longer exists.
// Reload once to pick up the new build; show a message if that also fails.
// Other render errors are not reloaded.
class ChunkErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  declare props: Readonly<{ children: React.ReactNode }>;
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (!CHUNK_ERROR.test(String((error as Error)?.message ?? error))) return;
    let reloaded = false;
    try {
      reloaded = sessionStorage.getItem(RELOAD_FLAG) === '1';
      if (!reloaded) sessionStorage.setItem(RELOAD_FLAG, '1');
    } catch {
      reloaded = true;
    }
    if (!reloaded) window.location.reload();
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="bg-brand-dark min-h-screen flex items-center justify-center text-gray-400">
          Something went wrong loading this page. Please refresh.
        </div>
      );
    }
    return this.props.children;
  }
}

const PageFallback: React.FC = () => (
  <div className="bg-brand-dark min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-brand-teal animate-spin" />
  </div>
);

// Simple hash-based router
function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash || '#home');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#home');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}

function HomePage() {
  // Deep links (/#story) and nav clicks from other pages land here before the
  // sections exist, so the browser can't jump; scroll to the hash after mount,
  // clearing the fixed nav.
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80 });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="bg-slate-900 min-h-screen">
      <Navbar />
      <Hero />
      <Story />
      <GrandSlam />
      <Speaking />
      {/* InstagramFeed temporarily removed - see components/InstagramFeed.tsx */}
      <Blog />
      <Expeditions />
      <Partners />
      <Press />
      <Contact />
      <Footer />
    </div>
  );
}

function App() {
  const route = useHashRoute();

  // Clear the one-time reload flag once the page has run for a while, so a later
  // deploy in the same tab can trigger one reload again without risking a loop.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* storage unavailable */ }
    }, 10000);
    return () => window.clearTimeout(timer);
  }, []);

  let page: React.ReactNode;
  if (route === '#globe' || route === '#/globe') {
    page = <GlobePage />;
  } else if (privateRoutes[route]) {
    const PrivatePage = privateRoutes[route];
    page = <PrivatePage />;
  } else {
    page = <HomePage />;
  }

  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageFallback />}>{page}</Suspense>
    </ChunkErrorBoundary>
  );
}

export default App;
