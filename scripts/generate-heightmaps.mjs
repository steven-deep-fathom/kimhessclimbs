/**
 * Generate heightmaps for mountains using Open-Elevation API
 * Creates grayscale PNG images where brightness = elevation
 */

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

// Resolution for heightmap - higher = more detail but slower API fetching
// 256 = good balance of detail vs speed (65k elevation points per mountain)
const RESOLUTION = 256;

// Mountain regions with bounding boxes [minLon, minLat, maxLon, maxLat]
// Expanded to capture surrounding terrain for dramatic effect
const mountains = {
  everest: {
    name: 'Mount Everest & Himalayan Ridge',
    // Expanded to include Lhotse, Nuptse, Pumori, and surrounding 8000m peaks
    // Shows the dramatic saddles and ridge system
    bounds: [86.70, 27.85, 87.10, 28.10],
    minElevation: 4500,  // Base camps are around 5000m
    maxElevation: 8849,
  },
  kilimanjaro: {
    name: 'Mount Kilimanjaro',
    // Expanded significantly to show the dramatic rise from the plains
    // Kilimanjaro is a freestanding volcano - this is what makes it special
    bounds: [37.10, -3.25, 37.60, -2.85],
    minElevation: 800,   // Surrounding savanna/plains
    maxElevation: 5895,
  }
};

async function fetchElevation(lat, lon) {
  const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results?.[0]?.elevation || 0;
  } catch (error) {
    console.error(`Error fetching elevation for ${lat},${lon}:`, error.message);
    return 0;
  }
}

async function fetchBatchElevations(locations, retries = 3) {
  const url = 'https://api.open-elevation.com/api/v1/lookup';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.results?.map(r => r.elevation) || locations.map(() => 0);
    } catch (error) {
      if (attempt < retries) {
        console.log(`    Retry ${attempt}/${retries} after error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        console.error(`    Failed after ${retries} attempts: ${error.message}`);
        return locations.map(() => 0);
      }
    }
  }
  return locations.map(() => 0);
}

async function generateHeightmap(mountainKey) {
  const mountain = mountains[mountainKey];
  console.log(`Generating heightmap for ${mountain.name}...`);

  const [minLon, minLat, maxLon, maxLat] = mountain.bounds;
  const canvas = createCanvas(RESOLUTION, RESOLUTION);
  const ctx = canvas.getContext('2d');

  // Create a grid of points
  const locations = [];
  for (let y = 0; y < RESOLUTION; y++) {
    for (let x = 0; x < RESOLUTION; x++) {
      const lat = maxLat - (y / (RESOLUTION - 1)) * (maxLat - minLat);
      const lon = minLon + (x / (RESOLUTION - 1)) * (maxLon - minLon);
      locations.push({ latitude: lat, longitude: lon });
    }
  }

  const totalBatches = Math.ceil(locations.length / 100);
  console.log(`Fetching ${locations.length} elevation points in ${totalBatches} batches...`);
  console.log(`Bounds: ${minLon.toFixed(2)}°E to ${maxLon.toFixed(2)}°E, ${minLat.toFixed(2)}°N to ${maxLat.toFixed(2)}°N`);

  // Batch fetch elevations
  const BATCH_SIZE = 100;
  const elevations = [];
  const startTime = Date.now();

  for (let i = 0; i < locations.length; i += BATCH_SIZE) {
    const batch = locations.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const percent = Math.round((batchNum / totalBatches) * 100);

    // Show progress on same line
    process.stdout.write(`\r  Progress: ${percent}% (batch ${batchNum}/${totalBatches})    `);

    const results = await fetchBatchElevations(batch);
    elevations.push(...results);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  Completed in ${elapsed}s`);

  // Calculate actual min/max from data
  const validElevations = elevations.filter(e => e > 0);
  const actualMin = Math.min(...validElevations);
  const actualMax = Math.max(...validElevations);
  console.log(`  Elevation range: ${actualMin.toFixed(0)}m - ${actualMax.toFixed(0)}m`);

  // Use actual data range for better contrast, but clamp to expected bounds
  const { minElevation, maxElevation } = mountain;
  const useMin = Math.max(minElevation, actualMin - 100);
  const useMax = Math.min(maxElevation, actualMax + 100);
  const elevationRange = useMax - useMin;
  console.log(`  Using range: ${useMin.toFixed(0)}m - ${useMax.toFixed(0)}m for normalization`);

  const imageData = ctx.createImageData(RESOLUTION, RESOLUTION);
  for (let i = 0; i < elevations.length; i++) {
    const normalized = Math.max(0, Math.min(1, (elevations[i] - useMin) / elevationRange));
    const value = Math.round(normalized * 255);
    const pixelIndex = i * 4;
    imageData.data[pixelIndex] = value;     // R
    imageData.data[pixelIndex + 1] = value; // G
    imageData.data[pixelIndex + 2] = value; // B
    imageData.data[pixelIndex + 3] = 255;   // A
  }

  ctx.putImageData(imageData, 0, 0);

  // Save the image
  const outputPath = path.join(process.cwd(), 'public', 'heightmaps', `${mountainKey}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${outputPath}`);
}

// Alternative: Generate synthetic heightmaps that approximate the mountains
// This is faster and doesn't require API calls
function generateSyntheticHeightmap(mountainKey) {
  const mountain = mountains[mountainKey];
  console.log(`Generating synthetic heightmap for ${mountain.name}...`);

  const canvas = createCanvas(RESOLUTION, RESOLUTION);
  const ctx = canvas.getContext('2d');

  const imageData = ctx.createImageData(RESOLUTION, RESOLUTION);
  const center = RESOLUTION / 2;

  for (let y = 0; y < RESOLUTION; y++) {
    for (let x = 0; x < RESOLUTION; x++) {
      // Distance from center (normalized 0-1)
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base mountain shape - cone with some variation
      let elevation = Math.max(0, 1 - dist * 1.2);

      // Add some ridges and variation using sine waves
      elevation += Math.sin(x * 0.15) * Math.sin(y * 0.15) * 0.1;
      elevation += Math.sin(x * 0.08 + y * 0.05) * 0.15;

      // Add asymmetry based on mountain type
      if (mountainKey === 'everest') {
        // Everest is part of a ridge, elongated shape
        elevation *= 1 + Math.sin(x * 0.02) * 0.3;
        // Add secondary peaks
        const dx2 = (x - center * 0.7) / center;
        const dy2 = (y - center * 0.8) / center;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        elevation = Math.max(elevation, Math.max(0, 0.8 - dist2 * 1.5));
      } else if (mountainKey === 'kilimanjaro') {
        // Kilimanjaro is a stratovolcano - more symmetrical with a crater
        elevation = Math.pow(elevation, 0.8); // Wider base
        // Add subtle crater
        if (dist < 0.15) {
          elevation *= 0.9 + dist * 0.5;
        }
      }

      // Clamp and normalize
      elevation = Math.max(0, Math.min(1, elevation));
      const value = Math.round(elevation * 255);

      const pixelIndex = (y * RESOLUTION + x) * 4;
      imageData.data[pixelIndex] = value;     // R
      imageData.data[pixelIndex + 1] = value; // G
      imageData.data[pixelIndex + 2] = value; // B
      imageData.data[pixelIndex + 3] = 255;   // A
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Save the image
  const outputPath = path.join(process.cwd(), 'public', 'heightmaps', `${mountainKey}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${outputPath}`);
}

// Main
const args = process.argv.slice(2);
const useRealData = args.includes('--real');

console.log('Heightmap Generator');
console.log('==================');
console.log(useRealData ? 'Using real elevation data (slow)' : 'Using synthetic data (fast)');
console.log('');

if (useRealData) {
  // Sequential to avoid overwhelming the API
  for (const key of Object.keys(mountains)) {
    await generateHeightmap(key);
  }
} else {
  // Generate synthetic heightmaps
  for (const key of Object.keys(mountains)) {
    generateSyntheticHeightmap(key);
  }
}

console.log('');
console.log('Done! Heightmaps saved to public/heightmaps/');
