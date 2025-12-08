import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import GrandSlam from './components/GrandSlam';
import Speaking from './components/Speaking';
import InstagramFeed from './components/InstagramFeed';
import Blog from './components/Blog';
import Expeditions from './components/Expeditions';
import Partners from './components/Partners';
import Press from './components/Press';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GlobePage from './pages/GlobePage';

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
  return (
    <div className="bg-slate-900 min-h-screen">
      <Navbar />
      <Hero />
      <Story />
      <GrandSlam />
      <Speaking />
      <InstagramFeed />
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

  // Route to different pages based on hash
  if (route === '#globe' || route === '#/globe') {
    return <GlobePage />;
  }

  // Default to home page
  return <HomePage />;
}

export default App;