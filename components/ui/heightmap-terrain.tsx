import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface HeightmapTerrainProps {
  heightmapUrl: string;
  color?: string;
  heightScale?: number;
}

/**
 * HeightmapTerrain
 * Renders terrain with dramatic low-angle perspective showing the mountain rising up
 */
export function HeightmapTerrain({
  heightmapUrl,
  color = "#7dd3fc",
  heightScale = 5.0,
}: HeightmapTerrainProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();

    // Low-angle camera looking up at the mountain
    const camera = new THREE.PerspectiveCamera(
      50, // Moderate FOV - not too narrow
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      200
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Start dark - light below horizon
    const initialLightPos = new THREE.Vector3(0, -5, 10);

    // Terrain geometry
    const terrainSize = 20;
    const segments = 256;
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);

    const material = new THREE.ShaderMaterial({
      side: THREE.FrontSide,
      uniforms: {
        heightMap: { value: null },
        heightScale: { value: heightScale },
        lightPos: { value: initialLightPos.clone() },
        baseColor: { value: new THREE.Color(color) },
        hasHeightmap: { value: 0.0 },
        texelSize: { value: 1.0 / segments },
      },
      vertexShader: `
        uniform sampler2D heightMap;
        uniform float heightScale;
        uniform float hasHeightmap;
        uniform float texelSize;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vHeight;

        void main() {
          vec2 uv = uv;
          float h = 0.0;
          vec3 normal = vec3(0.0, 1.0, 0.0);

          if (hasHeightmap > 0.5) {
            h = texture2D(heightMap, uv).r;

            // Sample neighbors for normal calculation
            float hL = texture2D(heightMap, uv + vec2(-texelSize, 0.0)).r;
            float hR = texture2D(heightMap, uv + vec2(texelSize, 0.0)).r;
            float hD = texture2D(heightMap, uv + vec2(0.0, -texelSize)).r;
            float hU = texture2D(heightMap, uv + vec2(0.0, texelSize)).r;

            // Compute normal from height differences
            float scale = heightScale * 0.5;
            normal = normalize(vec3(
              (hL - hR) * scale,
              1.0,
              (hD - hU) * scale
            ));
          }

          vHeight = h;

          // Displace Y position based on height
          vec3 pos = position;
          pos.y = h * heightScale;

          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

          gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 lightPos;
        uniform float heightScale;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vHeight;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(lightPos - vWorldPos);
          vec3 viewDir = normalize(cameraPosition - vWorldPos);

          // Height-based coloring
          float h = vHeight;

          // Color zones: dark base -> colored slopes -> bright peaks -> snow
          vec3 groundColor = baseColor * 0.25;
          vec3 lowColor = baseColor * 0.5;
          vec3 midColor = baseColor * 0.85;
          vec3 highColor = baseColor;
          vec3 snowColor = vec3(0.92, 0.94, 0.98);

          vec3 terrainColor;
          if (h < 0.15) {
            terrainColor = mix(groundColor, lowColor, h / 0.15);
          } else if (h < 0.4) {
            terrainColor = mix(lowColor, midColor, (h - 0.15) / 0.25);
          } else if (h < 0.75) {
            terrainColor = mix(midColor, highColor, (h - 0.4) / 0.35);
          } else {
            terrainColor = mix(highColor, snowColor, (h - 0.75) / 0.25);
          }

          // Lighting
          float NdotL = max(dot(normal, lightDir), 0.0);

          // Steeper slopes are darker (ambient occlusion approximation)
          float steepness = 1.0 - abs(dot(normal, vec3(0.0, 1.0, 0.0)));
          float ao = 1.0 - steepness * 0.4;

          // Rim/silhouette lighting
          float rim = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.5) * 0.2;

          vec3 ambient = terrainColor * 0.12 * ao;
          vec3 diffuse = terrainColor * NdotL * 0.88;
          vec3 rimColor = baseColor * rim;

          gl_FragColor = vec4(ambient + diffuse + rimColor, 1.0);
        }
      `,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      heightmapUrl,
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        material.uniforms.heightMap.value = texture;
        material.uniforms.hasHeightmap.value = 1.0;
      },
      undefined,
      (error) => console.error('Heightmap load error:', error)
    );

    const terrain = new THREE.Mesh(geometry, material);
    // Rotate to lie flat on XZ plane (Y is up)
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Camera positioned at edge of terrain, low, looking toward center/peak
    // This creates a "standing on the plains looking up at the mountain" view
    camera.position.set(0, heightScale * 0.15, terrainSize * 0.6);
    camera.lookAt(0, heightScale * 0.4, 0);

    const pointLight = new THREE.PointLight(0xffffff, 3, 200);
    pointLight.position.copy(initialLightPos);
    lightRef.current = pointLight;
    scene.add(pointLight);

    // Subtle ambient for seeing terrain silhouette even when dark
    const ambientLight = new THREE.AmbientLight(0x334455, 0.2);
    scene.add(ambientLight);

    let frameId: number;
    const animate = () => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Light moves to illuminate terrain from above/front
      // When mouse is up, light comes from above; when down, more from front
      const pos = new THREE.Vector3(
        x * 15,
        heightScale * 0.5 + y * heightScale,
        10 + y * 5
      );

      if (lightRef.current) {
        lightRef.current.position.copy(pos);
      }
      material.uniforms.lightPos.value.copy(pos);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      if (material.uniforms.heightMap.value) {
        material.uniforms.heightMap.value.dispose();
      }
    };
  }, [heightmapUrl, color, heightScale]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />;
}

export default HeightmapTerrain;
