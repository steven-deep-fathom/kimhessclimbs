import React, { useRef, useState, useEffect } from 'react';
import { Mountain, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import RotatingGlobe, { SEVEN_SUMMITS, GlobeRef, Summit } from '../components/ui/RotatingGlobe';

// Animated counter component that counts from 0 to target value
interface AnimatedStatProps {
  value: number;
  duration: number; // in milliseconds
  delay: number; // delay before starting animation (in milliseconds)
  label: string;
  formatNumber?: boolean;
  onComplete?: () => void;
}

const AnimatedStat: React.FC<AnimatedStatProps> = ({ value, duration, delay, label, formatNumber = true, onComplete }) => {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setIsActive(true);
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic for smoother ending
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(value);
          onComplete?.();
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [value, duration, delay, onComplete]);

  const displayValue = formatNumber ? count.toLocaleString() : count;

  return (
    <div className={`bg-brand-slate p-3 sm:p-5 rounded-xl border border-gray-700 text-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'} overflow-hidden`}>
      <p className="text-lg sm:text-2xl md:text-4xl font-bold text-brand-teal font-heading truncate">{displayValue}</p>
      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mt-1 sm:mt-2 line-clamp-2">{label}</p>
    </div>
  );
};

// Stats configuration with cumulative delays
const STATS_CONFIG = [
  { value: 109632, duration: 5000, label: "Miles Traveled by Air" },
  { value: 133487, duration: 5000, label: "Feet Ascended" },
  { value: 21467, duration: 3000, label: "Photos Taken" },
  { value: 2631, duration: 2000, label: "Days of Planning" },
  { value: 181, duration: 1500, label: "Nights in a Tent" },
  { value: 159, duration: 1500, label: "Days Without a Shower" },
  { value: 7, duration: 800, label: "Continents" },
  { value: 7, duration: 800, label: "Mountains" },
  { value: 1, duration: 500, label: "World Record" },
  { value: 2, duration: 600, label: "Poles To Go" },
];

// All stats start animating at the same time (no cumulative delay)
const getStatsWithDelays = () => {
  return STATS_CONFIG.map((stat) => ({ ...stat, delay: 0 }));
};

const StatsSection: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsWithDelays = getStatsWithDelays();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  return (
    <div ref={sectionRef} className="mt-16">
      <h2 className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-wide text-white mb-8 text-center">
        By The <span className="text-brand-teal">Numbers</span>
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {statsWithDelays.map((stat, index) => (
          <AnimatedStat
            key={index}
            value={hasStarted ? stat.value : 0}
            duration={stat.duration}
            delay={hasStarted ? stat.delay : 0}
            label={stat.label}
          />
        ))}
      </div>
    </div>
  );
};

const GlobePage: React.FC = () => {
  const globeRef = useRef<GlobeRef>(null);
  const [activeSummit, setActiveSummit] = useState<string | null>(null);
  const [selectedSummit, setSelectedSummit] = useState<Summit | null>(null);

  const handleSummitClick = (summit: Summit) => {
    setActiveSummit(summit.id);
    setSelectedSummit(summit);
    globeRef.current?.rotateTo(summit.lng, summit.lat);
  };

  return (
    <div className="bg-brand-dark min-h-screen">
      <Navbar />

      {/* Main content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-wide text-white mb-4">
              Seven <span className="text-brand-teal">Summits</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Click on any summit to spin the globe and explore Kim's journey across all seven continents.
            </p>
          </div>

          {/* Globe and Summit List Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Summit List - Left Side */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-brand-slate rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-brand-teal" />
                    The Seven Summits
                  </h2>
                </div>

                <div className="divide-y divide-gray-700">
                  {SEVEN_SUMMITS.map((summit) => (
                    <button
                      key={summit.id}
                      onClick={() => handleSummitClick(summit)}
                      className={`w-full p-4 text-left transition-all duration-300 hover:bg-brand-dark/50 ${
                        activeSummit === summit.id
                          ? 'bg-brand-teal/10 border-l-4 border-brand-teal'
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-heading font-bold ${
                            activeSummit === summit.id ? 'text-brand-teal' : 'text-white'
                          }`}>
                            {summit.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">{summit.continent}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-brand-teal">{summit.elevation}</p>
                          <p className="text-xs text-gray-500 mt-1">{summit.year}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 p-4 bg-brand-slate/50 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  Summit markers on globe
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-2 mt-2">
                  <span className="w-3 h-3 rounded-full bg-brand-teal"></span>
                  Selected summit
                </p>
              </div>
            </div>

            {/* Globe - Center/Right */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <RotatingGlobe
                ref={globeRef}
                width={700}
                height={550}
                activeSummit={activeSummit}
                className="w-full"
              />

              {/* Instructions */}
              <div className="mt-4 text-center text-sm text-gray-500">
                Drag to rotate &bull; Scroll to zoom &bull; Click a summit to locate
              </div>

              {/* Selected Summit Details */}
              {selectedSummit && (
                <div className="mt-6 p-6 bg-brand-slate rounded-2xl border border-gray-700">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                      <Mountain className="w-8 h-8 text-brand-teal" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-heading font-bold text-white">
                        {selectedSummit.name}
                      </h3>
                      <p className="text-brand-teal font-semibold mt-1">{selectedSummit.continent}</p>

                      <div className="grid grid-cols-3 gap-6 mt-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-6 h-6 text-brand-teal" />
                          <div>
                            <p className="text-sm text-gray-400 uppercase tracking-wider">Elevation</p>
                            <p className="text-xl font-bold text-white">{selectedSummit.elevation}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-brand-teal" />
                          <div>
                            <p className="text-sm text-gray-400 uppercase tracking-wider">Summited</p>
                            <p className="text-xl font-bold text-white">{selectedSummit.year}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-6 h-6 text-brand-teal" />
                          <div>
                            <p className="text-sm text-gray-400 uppercase tracking-wider">Coordinates</p>
                            <p className="text-xl font-bold text-white">
                              {Math.abs(selectedSummit.lat).toFixed(2)}°{selectedSummit.lat >= 0 ? 'N' : 'S'},{' '}
                              {Math.abs(selectedSummit.lng).toFixed(2)}°{selectedSummit.lng >= 0 ? 'E' : 'W'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <StatsSection />

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black py-8 text-center border-t border-slate-800">
        <p className="text-gray-500 text-sm font-bold tracking-wider">
          &copy; Kim Hess. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default GlobePage;
