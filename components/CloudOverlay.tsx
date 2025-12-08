
import React, { useRef, useEffect } from 'react';

const CloudOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader with FBM noise for cloud effect
    const fragmentShaderSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      // Random hash function
      float hash(float n) { return fract(sin(n) * 43758.5453123); }

      // 2D Noise function
      float noise(vec2 x) {
        vec2 p = floor(x);
        vec2 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        float n = p.x + p.y * 57.0;
        return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                   mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
      }

      // Fractal Brownian Motion
      float fbm(vec2 p) {
        float f = 0.0;
        float m = 0.5;
        mat2 m2 = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 4; i++) {
          f += m * noise(p);
          p = m2 * p;
          m *= 0.5;
        }
        return f;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio
        
        // Slow time for majestic movement
        float time = u_time * 0.03;
        
        // Domain warping for swirling cloud effect
        // Layer 1
        float q = fbm(uv * 2.0 + vec2(time * 0.5, time * 0.2));
        
        // Layer 2 (warped by Layer 1)
        float r = fbm(uv * 4.0 + q + vec2(time * 0.8, -time * 0.1));
        
        // Final noise mix
        float f = fbm(uv + r);
        
        // Cloud color: very subtle cool white
        vec3 color = vec3(0.85, 0.92, 1.0);
        
        // Alpha mask: smoothstep to create cloud patches
        // 0.3 to 0.7 range gives a nice balance of empty sky vs cloud
        float alpha = smoothstep(0.3, 0.8, f);
        
        // Output color
        // We reduce overall opacity (alpha * 0.3) so it's not too thick
        gl_FragColor = vec4(color, alpha * 0.3); 
      }
    `;

    // Helper to create and compile shader
    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    // Full screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

    let animationFrameId: number;
    let startTime = Date.now();

    const render = () => {
      // Check if canvas still exists
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Resize handling
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      // Calculate time
      const currentTime = (Date.now() - startTime) / 1000;

      // Set uniforms
      gl.uniform1f(timeUniformLocation, currentTime);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen z-10 opacity-60"
    />
  );
};

export default CloudOverlay;
