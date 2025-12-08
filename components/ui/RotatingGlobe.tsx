import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import * as d3 from "d3";

export interface Summit {
  id: string;
  name: string;
  continent: string;
  lat: number;
  lng: number;
  elevation: string;
  year: string;
}

export const SEVEN_SUMMITS: Summit[] = [
  { id: "everest", name: "Mount Everest", continent: "Asia", lat: 27.9883, lng: 86.9251, elevation: "29,032 ft", year: "2016" },
  { id: "aconcagua", name: "Aconcagua", continent: "South America", lat: -32.6531, lng: -70.0121, elevation: "22,841 ft", year: "2011" },
  { id: "denali", name: "Denali", continent: "North America", lat: 63.0691, lng: -151.0063, elevation: "20,310 ft", year: "2013" },
  { id: "kilimanjaro", name: "Mt. Kilimanjaro", continent: "Africa", lat: -3.0670, lng: 37.3550, elevation: "19,341 ft", year: "2012" },
  { id: "elbrus", name: "Mt. Elbrus", continent: "Europe", lat: 43.3525, lng: 42.4379, elevation: "18,510 ft", year: "2012" },
  { id: "vinson", name: "Mt. Vinson", continent: "Antarctica", lat: -78.6341, lng: -85.2130, elevation: "16,050 ft", year: "2017" },
  { id: "kosciuszko", name: "Mt. Kosciuszko", continent: "Australia", lat: -36.4561, lng: 148.2634, elevation: "7,310 ft", year: "2018" },
];

interface RotatingGlobeProps {
  width?: number;
  height?: number;
  className?: string;
  onSummitHover?: (summit: Summit | null) => void;
  activeSummit?: string | null;
}

export interface GlobeRef {
  rotateTo: (lng: number, lat: number) => void;
}

const RotatingGlobe = forwardRef<GlobeRef, RotatingGlobeProps>(
  ({ width = 800, height = 600, className = "", onSummitHover, activeSummit }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const projectionRef = useRef<d3.GeoProjection | null>(null);
    const rotationRef = useRef<[number, number]>([0, 0]);
    const autoRotateRef = useRef(true);
    const renderRef = useRef<(() => void) | null>(null);
    const radiusRef = useRef(0);
    const animationRef = useRef<number | null>(null);

    // Expose rotateTo method to parent
    useImperativeHandle(ref, () => ({
      rotateTo: (lng: number, lat: number) => {
        if (!projectionRef.current) return;

        autoRotateRef.current = false;

        // Target rotation: negate longitude to center it, use latitude directly
        const targetRotation: [number, number] = [-lng, -lat];
        const startRotation: [number, number] = [...rotationRef.current];
        const startTime = Date.now();
        const duration = 1500; // 1.5 seconds

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function (ease-out cubic)
          const eased = 1 - Math.pow(1 - progress, 3);

          // Interpolate rotation
          rotationRef.current[0] = startRotation[0] + (targetRotation[0] - startRotation[0]) * eased;
          rotationRef.current[1] = startRotation[1] + (targetRotation[1] - startRotation[1]) * eased;

          projectionRef.current?.rotate(rotationRef.current);
          renderRef.current?.();

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // Resume auto-rotation after a delay
            setTimeout(() => {
              autoRotateRef.current = true;
            }, 3000);
          }
        };

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        animate();
      },
    }));

    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const containerWidth = Math.min(width, window.innerWidth - 40);
      const containerHeight = Math.min(height, window.innerHeight - 100);
      const radius = Math.min(containerWidth, containerHeight) / 2.5;
      radiusRef.current = radius;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      context.scale(dpr, dpr);

      const projection = d3
        .geoOrthographic()
        .scale(radius)
        .translate([containerWidth / 2, containerHeight / 2])
        .clipAngle(90);

      projectionRef.current = projection;

      const path = d3.geoPath().projection(projection).context(context);

      const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
        const [x, y] = point;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const [xi, yi] = polygon[i];
          const [xj, yj] = polygon[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
          }
        }
        return inside;
      };

      const pointInFeature = (point: [number, number], feature: any): boolean => {
        const geometry = feature.geometry;
        if (geometry.type === "Polygon") {
          const coordinates = geometry.coordinates;
          if (!pointInPolygon(point, coordinates[0])) return false;
          for (let i = 1; i < coordinates.length; i++) {
            if (pointInPolygon(point, coordinates[i])) return false;
          }
          return true;
        } else if (geometry.type === "MultiPolygon") {
          for (const polygon of geometry.coordinates) {
            if (pointInPolygon(point, polygon[0])) {
              let inHole = false;
              for (let i = 1; i < polygon.length; i++) {
                if (pointInPolygon(point, polygon[i])) {
                  inHole = true;
                  break;
                }
              }
              if (!inHole) return true;
            }
          }
          return false;
        }
        return false;
      };

      const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
        const dots: [number, number][] = [];
        const bounds = d3.geoBounds(feature);
        const [[minLng, minLat], [maxLng, maxLat]] = bounds;
        const stepSize = dotSpacing * 0.08;

        for (let lng = minLng; lng <= maxLng; lng += stepSize) {
          for (let lat = minLat; lat <= maxLat; lat += stepSize) {
            const point: [number, number] = [lng, lat];
            if (pointInFeature(point, feature)) {
              dots.push(point);
            }
          }
        }
        return dots;
      };

      interface DotData {
        lng: number;
        lat: number;
      }

      const allDots: DotData[] = [];
      let landFeatures: any;

      const render = () => {
        context.clearRect(0, 0, containerWidth, containerHeight);

        const currentScale = projection.scale();
        const scaleFactor = currentScale / radius;

        // Draw ocean
        context.beginPath();
        context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
        context.fillStyle = "#0f172a";
        context.fill();
        context.strokeStyle = "#14b8a6";
        context.lineWidth = 2 * scaleFactor;
        context.stroke();

        if (landFeatures) {
          // Draw graticule
          const graticule = d3.geoGraticule();
          context.beginPath();
          path(graticule());
          context.strokeStyle = "#14b8a6";
          context.lineWidth = 0.5 * scaleFactor;
          context.globalAlpha = 0.15;
          context.stroke();
          context.globalAlpha = 1;

          // Draw land outlines
          context.beginPath();
          landFeatures.features.forEach((feature: any) => {
            path(feature);
          });
          context.strokeStyle = "#14b8a6";
          context.lineWidth = 1 * scaleFactor;
          context.stroke();

          // Draw halftone dots
          allDots.forEach((dot) => {
            const projected = projection([dot.lng, dot.lat]);
            if (
              projected &&
              projected[0] >= 0 &&
              projected[0] <= containerWidth &&
              projected[1] >= 0 &&
              projected[1] <= containerHeight
            ) {
              context.beginPath();
              context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI);
              context.fillStyle = "#475569";
              context.fill();
            }
          });

          // Draw summit markers
          SEVEN_SUMMITS.forEach((summit) => {
            const coords: [number, number] = [summit.lng, summit.lat];
            const projected = projection(coords);

            // Check if point is on visible side of globe
            const distance = d3.geoDistance(coords, projection.invert!([containerWidth / 2, containerHeight / 2]) as [number, number]);

            if (projected && distance < Math.PI / 2) {
              const isActive = activeSummit === summit.id;
              const markerSize = isActive ? 8 * scaleFactor : 5 * scaleFactor;

              // Outer glow for active
              if (isActive) {
                context.beginPath();
                context.arc(projected[0], projected[1], markerSize + 4, 0, 2 * Math.PI);
                context.fillStyle = "rgba(20, 184, 166, 0.3)";
                context.fill();
              }

              // Marker circle
              context.beginPath();
              context.arc(projected[0], projected[1], markerSize, 0, 2 * Math.PI);
              context.fillStyle = isActive ? "#14b8a6" : "#f59e0b";
              context.fill();
              context.strokeStyle = "#ffffff";
              context.lineWidth = 2 * scaleFactor;
              context.stroke();

              // Label for active summit
              if (isActive) {
                context.font = `bold ${14 * scaleFactor}px Montserrat, sans-serif`;
                context.fillStyle = "#ffffff";
                context.textAlign = "center";
                context.fillText(summit.name, projected[0], projected[1] - markerSize - 8);
              }
            }
          });
        }
      };

      renderRef.current = render;

      const loadWorldData = async () => {
        try {
          setIsLoading(true);

          const response = await fetch(
            "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
          );
          if (!response.ok) throw new Error("Failed to load land data");

          landFeatures = await response.json();

          landFeatures.features.forEach((feature: any) => {
            const dots = generateDotsInPolygon(feature, 16);
            dots.forEach(([lng, lat]) => {
              allDots.push({ lng, lat });
            });
          });

          render();
          setIsLoading(false);
        } catch (err) {
          setError("Failed to load land map data");
          setIsLoading(false);
        }
      };

      const rotationSpeed = 0.2;

      const rotate = () => {
        if (autoRotateRef.current) {
          rotationRef.current[0] += rotationSpeed;
          projection.rotate(rotationRef.current);
          render();
        }
      };

      const rotationTimer = d3.timer(rotate);

      const handleMouseDown = (event: MouseEvent) => {
        autoRotateRef.current = false;
        const startX = event.clientX;
        const startY = event.clientY;
        const startRotation: [number, number] = [...rotationRef.current];

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const sensitivity = 0.5;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          rotationRef.current[0] = startRotation[0] + dx * sensitivity;
          rotationRef.current[1] = startRotation[1] - dy * sensitivity;
          rotationRef.current[1] = Math.max(-90, Math.min(90, rotationRef.current[1]));

          projection.rotate(rotationRef.current);
          render();
        };

        const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          setTimeout(() => {
            autoRotateRef.current = true;
          }, 2000);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      };

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newRadius = Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * scaleFactor));
        projection.scale(newRadius);
        render();
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("wheel", handleWheel);

      loadWorldData();

      return () => {
        rotationTimer.stop();
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("wheel", handleWheel);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [width, height]);

    // Re-render when active summit changes
    useEffect(() => {
      if (renderRef.current) {
        renderRef.current();
      }
    }, [activeSummit]);

    if (error) {
      return (
        <div className={`flex items-center justify-center bg-brand-slate rounded-2xl p-8 ${className}`}>
          <div className="text-center">
            <p className="text-red-500 font-semibold mb-2">Error loading Earth visualization</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-brand-teal">Loading globe...</div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-2xl bg-brand-dark"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    );
  }
);

RotatingGlobe.displayName = "RotatingGlobe";

export default RotatingGlobe;
