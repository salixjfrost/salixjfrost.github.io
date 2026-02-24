// WebGL Shader Background
class ShaderBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }
    
    this.startTime = Date.now();
    this.init();
  }
  
  init() {
    const gl = this.gl;
    
    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    // Fragment shader (wave lines shader)
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      
      #define S smoothstep
      
      vec4 Line(vec2 uv, float speed, float height, vec3 col) {
        uv.y += S(1., 0., abs(uv.x)) * sin(iTime * speed + uv.x * height) * .2;
        return vec4(S(.06 * S(.2, .9, abs(uv.x)), 0., abs(uv.y) - .004) * col, 1.0) * S(1., .3, abs(uv.x));
      }
      
      void mainImage(out vec4 O, in vec2 I) {
        vec2 uv = (I - .5 * iResolution.xy) / iResolution.y;
        O = vec4(0.);
        for (float i = 0.; i <= 5.; i += 1.) {
          float t = i / 5.;
          O += Line(uv, 0.3 + t * 0.3, 4. + t, vec3(.2 + t * .7, .2 + t * .4, 0.3));
        }
      }
      
      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;
    
    // Compile shaders
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    // Create program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
      return;
    }
    
    // Create buffer
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Get attribute and uniform locations
    this.positionLocation = gl.getAttribLocation(this.program, 'position');
    this.resolutionLocation = gl.getUniformLocation(this.program, 'iResolution');
    this.timeLocation = gl.getUniformLocation(this.program, 'iTime');
    
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Start animation
    this.resize();
    this.animate();
  }
  
  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  
  animate() {
    const gl = this.gl;
    const time = (Date.now() - this.startTime) / 1000;
    
    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.timeLocation, time);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize shader background
window.addEventListener('load', () => {
  const canvas = document.getElementById('shaderCanvas');
  if (canvas) {
    new ShaderBackground(canvas);
    
    window.addEventListener('resize', () => {
      if (window.shaderBg) {
        window.shaderBg.resize();
      }
    });
  }
});
