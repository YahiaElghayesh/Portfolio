// ---------- The stage: every WebGL scene on the site ----------
//
// Two canvases, because the site needs WebGL on both sides of the page:
//
//   bg  fixed behind #main  — the dust volume the whole page floats in.
//   fg  fixed above #main   — things that are *objects*: the point-cloud
//                             portrait, the product reliefs, the sparks, the
//                             showroom ring. It has pointer-events: none and
//                             is transparent wherever nothing is drawn, so
//                             every link and button underneath still works.
//
// The DOM stays the source of truth for layout. Every GL object is pinned to a
// DOM element's rectangle each frame, and every one of those elements carries
// a real <img> that stays visible until its texture is actually on the GPU. If
// WebGL is missing, three.js fails to load, a texture 404s, the context is lost,
// or the reader asked for reduced motion, the page underneath is complete.

var STAGE_SRC = "./assets/vendor/three.module.min.js";
var stage = null;

function willUseWebGL() {
  if (prefersReduced) return false;
  try {
    var c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

// Phones and low-core machines get fewer points and coarser meshes. The
// scenes are identical, only their resolution changes.
function stageTier() {
  var cores = navigator.hardwareConcurrency || 8;
  var mem = navigator.deviceMemory || 8;
  return isCoarsePointer || cores <= 4 || mem <= 4 ? "low" : "high";
}

// ---------------------------------------------------------------- shaders ---

// The portrait as a point cloud: every point takes its colour from the
// cut-out photograph and its distance from the depth map, so the cloud is a
// real relief of the sitter rather than a flat picture. Three states blend:
//   uAssemble  0 scattered in a shell   -> 1 formed into the figure
//   uDisperse  0 formed                 -> 1 blown away as warm dust
//   uMouse     a soft repulsion field where the pointer is
var AVATAR_VERT = [
  "uniform sampler2D uDepth;",
  "uniform vec2  uSize;",
  "uniform float uRelief;",
  "uniform float uAssemble;",
  "uniform float uDisperse;",
  "uniform float uTime;",
  "uniform vec3  uMouse;",
  "uniform float uPoint;",
  "uniform float uCamZ;",
  "uniform float uOpacity;",
  "attribute vec2 aUv;",
  "attribute vec4 aRand;",
  "varying vec2  vUv;",
  "varying float vDepth;",
  "varying float vAlpha;",
  "varying float vHeat;",
  "float easeOut(float x) { return 1.0 - pow(1.0 - clamp(x, 0.0, 1.0), 3.0); }",
  "void main() {",
  "  vUv = aUv;",
  "  float d = texture2D(uDepth, aUv).r;",
  "  vDepth = d;",
  "  vec3 p = vec3((aUv.x - 0.5) * uSize.x, (aUv.y - 0.5) * uSize.y, (d - 0.5) * uRelief);",
  // Assembly: each point flies in from its own spot on a shell, on its own
  // delay, so the figure condenses rather than fading in.
  "  vec3 dir = normalize(aRand.xyz * 2.0 - 1.0 + vec3(0.0001));",
  "  float t = easeOut((uAssemble - aRand.w * 0.45) / 0.55);",
  "  p = mix(p + dir * (uSize.y * 1.1), p, t);",
  // Dispersal: points lift off upward and outward, the nearest ones first,
  // with a little turbulence so they read as drifting dust, not a uniform
  // explosion.
  "  float k = clamp(uDisperse * (0.65 + aRand.w * 0.7), 0.0, 1.0);",
  "  vec3 drift = vec3(dir.x * 0.9, 0.55 + aRand.y * 0.9, dir.z * 0.8 + 0.4);",
  "  p += drift * k * k * uSize.y * 1.25;",
  "  p.x += sin(uTime * 1.3 + aRand.x * 40.0) * k * 26.0;",
  "  p.y += cos(uTime * 1.1 + aRand.y * 40.0) * k * 18.0;",
  // Pointer repulsion, in the figure's own plane.
  "  vec2 dm = p.xy - uMouse.xy;",
  "  float f = exp(-dot(dm, dm) / (uSize.x * uSize.x * 0.018)) * uMouse.z;",
  "  p.xy += normalize(dm + 0.0001) * f * 34.0;",
  "  p.z  += f * 70.0;",
  "  vHeat = max(k, f * 0.8);",
  "  vAlpha = t * (1.0 - smoothstep(0.55, 1.0, k)) * uOpacity;",
  "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
  "  gl_PointSize = uPoint * (uCamZ / max(-mv.z, 1.0)) * (1.0 + k * 0.8 * aRand.z);",
  "  gl_Position = projectionMatrix * mv;",
  "}",
].join("\n");

var AVATAR_FRAG = [
  "uniform sampler2D uColor;",
  "uniform vec3 uTint;",
  "varying vec2  vUv;",
  "varying float vDepth;",
  "varying float vAlpha;",
  "varying float vHeat;",
  "void main() {",
  "  vec2 q = gl_PointCoord - 0.5;",
  "  if (dot(q, q) > 0.25) discard;",
  "  vec4 c = texture2D(uColor, vUv);",
  "  if (c.a < 0.5 || vAlpha < 0.01) discard;",
  // Nearer points a touch brighter: the depth reads even with the figure
  // held still. Points breaking away heat toward the site's tan.
  "  vec3 col = c.rgb * (0.80 + 0.34 * vDepth);",
  "  col = mix(col, uTint, clamp(vHeat, 0.0, 1.0) * 0.75);",
  "  gl_FragColor = vec4(col, vAlpha);",
  "}",
].join("\n");

// A photograph as a lit relief. Two modes:
//   object (cutout, contain) — the plane turns in real 3D; with a depth map
//     it has real thickness, and a light that follows the pointer rakes
//     across it, so a product reads as a thing, not a picture of one.
//   window (context photo, cover) — the plane stays locked to its frame
//     (a photo has edges that must line up with the card), and the depth
//     map shifts near and far parts of the image by different amounts:
//     the scene moves *inside* the frame instead.
var RELIEF_VERT = [
  "uniform sampler2D uDepth;",
  "uniform float uHasDepth;",
  "uniform float uRelief;",
  "uniform vec4  uXform;",
  "uniform float uReflect;",
  "uniform float uStep;",
  "varying vec2  vUv;",
  "varying vec2  vImg;",
  "varying float vD;",
  "varying float vEdge;",
  "varying vec3  vView;",
  "void main() {",
  "  vUv = uv;",
  "  vec2 iuv = uv * uXform.xy + uXform.zw;",
  "  vImg = iuv;",
  "  float d = uHasDepth > 0.5 ? texture2D(uDepth, iuv).r : 0.5;",
  "  vD = d;",
  // How steep the depth is around this vertex, one mesh cell each way. A
  // relief built from a single photo has no data behind a near object, so
  // a triangle spanning a depth cliff (a head in front of a chair back)
  // would be stretched into a smeared sheet as the mesh turns. Those
  // triangles are cut in the fragment shader instead, which reads as the
  // gap you would really see there.
  "  vEdge = 0.0;",
  "  if (uHasDepth > 0.5) {",
  "    vec2 sx = vec2(uStep * uXform.x, 0.0), sy = vec2(0.0, uStep * uXform.y);",
  "    vEdge = max(abs(texture2D(uDepth, iuv - sx).r - texture2D(uDepth, iuv + sx).r),",
  "                abs(texture2D(uDepth, iuv - sy).r - texture2D(uDepth, iuv + sy).r));",
  "  }",
  "  vec3 p = position;",
  "  p.z += (d - 0.5) * uRelief * (1.0 - uReflect * 2.0);",
  "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
  "  vView = mv.xyz;",
  "  gl_Position = projectionMatrix * mv;",
  "}",
].join("\n");

var RELIEF_FRAG = [
  "uniform sampler2D uTex;",
  "uniform sampler2D uDepth;",
  "uniform float uHasDepth;",
  "uniform float uWindow;",
  "uniform vec2  uPlane;",
  "uniform vec4  uRadius;",
  "uniform float uFade;",
  "uniform float uHover;",
  "uniform vec2  uParallax;",
  "uniform vec3  uLight;",
  "uniform vec3  uTint;",
  "uniform float uReflect;",
  "varying vec2  vUv;",
  "varying vec2  vImg;",
  "varying float vD;",
  "varying float vEdge;",
  "varying vec3  vView;",
  "uniform float uEdgeCut;",
  "float roundedMask(vec2 uv, vec2 size, vec4 r) {",
  "  vec2 p = (uv - 0.5) * size;",
  "  float rad = p.x < 0.0 ? (p.y > 0.0 ? r.x : r.w) : (p.y > 0.0 ? r.y : r.z);",
  "  vec2 q = abs(p) - size * 0.5 + rad;",
  "  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rad;",
  "  return 1.0 - smoothstep(-1.0, 1.0, d);",
  "}",
  "void main() {",
  "  vec2 iuv = vImg;",
  "  if (uWindow > 0.5 && uHasDepth > 0.5) {",
  // Parallax inside the frame: near pixels shift with the view, far ones
  // against it. Sampled from the depth at this pixel, which is enough for
  // the few percent of shift used here.
  "    float d = texture2D(uDepth, vImg).r;",
  "    iuv += uParallax * (d - 0.45);",
  "  }",
  "  vec4 c = texture2D(uTex, iuv);",
  "  float a = c.a;",
  "  if (uWindow > 0.5) { a = roundedMask(vUv, uPlane, uRadius); }",
  "  else if (a < 0.45) { discard; }",
  "  if (uWindow < 0.5 && vEdge > uEdgeCut) discard;",
  // Lighting from the relief's own surface normal, reconstructed per pixel.
  "  vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));",
  "  float lit = max(dot(n, normalize(uLight)), 0.0);",
  "  float shade = uHasDepth > 0.5 ? (0.80 + 0.36 * lit) : 1.0;",
  "  vec3 col = c.rgb * shade;",
  "  float rim = pow(1.0 - abs(n.z), 2.0) * uHover;",
  "  col += uTint * rim * 0.55 + uHover * 0.03;",
  "  float alpha = a * uFade;",
  "  if (uReflect > 0.5) {",
  // The showroom floor: a mirrored copy fading out with distance from the
  // object's base.
  "    alpha *= 0.20 * smoothstep(0.35, 1.0, vUv.y);",
  "    col *= 0.7;",
  "  }",
  "  if (alpha < 0.004) discard;",
  "  gl_FragColor = vec4(col, alpha);",
  "}",
].join("\n");

// Sparks, solved analytically on the GPU: every spark's position is a
// closed-form ballistic arc of (birth, angle, speed), so there is no
// per-frame simulation on the CPU at all. Each spark is a two-vertex line
// from where it was a few hundredths of a second ago to where it is now, so
// fast sparks draw long streaks and slow ones short, like a real exposure.
var SPARK_VERT = [
  "uniform float uTime;",
  "uniform vec2  uOrigin;",
  "uniform float uScale;",
  "uniform float uActive;",
  "uniform float uBurst;",
  "uniform float uBurstAt;",
  "uniform vec2  uAngle;",
  "attribute float aEnd;",
  "attribute vec4  aSeed;",
  "varying float vLife;",
  "varying float vEnd;",
  "varying float vOn;",
  "void main() {",
  "  float life = mix(0.55, 1.35, aSeed.x);",
  "  float age;",
  "  float on = 1.0;",
  "  if (uBurst > 0.5) {",
  "    age = uTime - uBurstAt - aSeed.w * 0.06;",
  "    on = step(0.0, age) * step(age, life);",
  "  } else {",
  "    float period = life + aSeed.w * 0.9;",
  "    age = mod(uTime + aSeed.w * 7.13, period);",
  "    on = step(age, life) * step(aSeed.z, uActive);",
  "  }",
  "  float ang = mix(uAngle.x, uAngle.y, pow(aSeed.y, 0.8));",
  "  float spd = mix(0.45, 1.25, fract(aSeed.x * 7.31 + aSeed.z * 3.7)) * uScale;",
  "  vec2 v = vec2(cos(ang), sin(ang)) * spd;",
  "  vec2 g = vec2(0.0, -1.35 * uScale);",
  "  float t = max(age - (1.0 - aEnd) * 0.035, 0.0);",
  "  vec2 p = uOrigin + v * t + 0.5 * g * t * t;",
  "  vLife = clamp(age / life, 0.0, 1.0);",
  "  vEnd = aEnd;",
  "  vOn = on;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 30.0, 1.0);",
  "}",
].join("\n");

var SPARK_FRAG = [
  "varying float vLife;",
  "varying float vEnd;",
  "varying float vOn;",
  "void main() {",
  "  if (vOn < 0.5) discard;",
  // White-hot at birth, through orange, to a dull red as it cools.
  "  vec3 hot = vec3(1.0, 0.96, 0.86);",
  "  vec3 warm = vec3(1.0, 0.66, 0.26);",
  "  vec3 cool = vec3(0.85, 0.32, 0.06);",
  "  vec3 col = vLife < 0.35 ? mix(hot, warm, vLife / 0.35) : mix(warm, cool, (vLife - 0.35) / 0.65);",
  "  float a = (1.0 - smoothstep(0.6, 1.0, vLife)) * mix(0.25, 1.0, vEnd);",
  "  gl_FragColor = vec4(col * a, a);",
  "}",
].join("\n");

var DUST_VERT = [
  "attribute float aSize;",
  "attribute float aPhase;",
  "uniform float uTime;",
  "varying float vFade;",
  "void main() {",
  "  vec3 p = position;",
  "  p.x += sin(uTime * 0.25 + aPhase) * 14.0;",
  "  p.y += cos(uTime * 0.19 + aPhase * 1.7) * 11.0;",
  "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
  "  float dist = -mv.z;",
  "  vFade = smoothstep(0.0, 500.0, dist) * (1.0 - smoothstep(3200.0, 5200.0, dist));",
  "  gl_PointSize = aSize * (900.0 / max(dist, 1.0));",
  "  gl_Position = projectionMatrix * mv;",
  "}",
].join("\n");

var DUST_FRAG = [
  "uniform vec3 uColor;",
  "varying float vFade;",
  "void main() {",
  "  float d = length(gl_PointCoord - 0.5);",
  "  if (d > 0.5) discard;",
  "  float a = (1.0 - smoothstep(0.15, 0.5, d)) * vFade;",
  "  gl_FragColor = vec4(uColor, a * 0.5);",
  "}",
].join("\n");

// ------------------------------------------------------------------ build ---

// Resolves once three.js is loaded and both renderers exist. Individual
// scenes add themselves as their textures arrive.
function initStage() {
  if (stage) return Promise.resolve(stage);
  if (!willUseWebGL()) return Promise.reject(new Error("no-webgl"));
  return import(STAGE_SRC).then(function (THREE) {
    stage = buildStage(THREE);
    if (!stage) throw new Error("renderer-failed");
    return stage;
  });
}

function buildStage(THREE) {
  var tier = stageTier();
  var dpr = Math.min(window.devicePixelRatio || 1, tier === "low" ? 1.75 : 2);

  function makeRenderer(cls, host) {
    var canvas = document.createElement("canvas");
    canvas.className = cls;
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    try {
      var r = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: tier === "high", powerPreference: "high-performance" });
      r.setClearColor(0x000000, 0);
      r.setPixelRatio(dpr);
      return r;
    } catch (e) {
      canvas.remove();
      return null;
    }
  }

  var bgHost = document.querySelector(".depth-bg") || document.body;
  var bg = makeRenderer("gl-bg", bgHost);
  var fg = makeRenderer("gl-fg", document.body);
  if (!fg) { if (bg) bg.domElement.remove(); return null; }

  // 1 world unit = 1 CSS pixel on the z = 0 plane, so every DOM rectangle
  // is already in world units. The fg camera sits further back than the bg
  // one: objects turning in front of the reader want less wide-angle
  // distortion than dust drifting behind the page.
  var FG_Z = 1400, BG_Z = 900;
  var fgCam = new THREE.PerspectiveCamera(45, 1, 10, 8000);
  var bgCam = new THREE.PerspectiveCamera(45, 1, 10, 9000);
  var fgScene = new THREE.Scene();
  var bgScene = new THREE.Scene();

  var vw = window.innerWidth, vh = window.innerHeight;
  function fitCamera(cam, z) {
    cam.aspect = vw / vh;
    cam.position.set(0, 0, z);
    cam.fov = 2 * Math.atan(vh / 2 / z) * (180 / Math.PI);
    cam.updateProjectionMatrix();
  }
  function resize() {
    vw = window.innerWidth; vh = window.innerHeight;
    fg.setSize(vw, vh, false);
    if (bg) bg.setSize(vw, vh, false);
    fitCamera(fgCam, FG_Z);
    fitCamera(bgCam, BG_Z);
  }
  resize();
  window.addEventListener("resize", resize);

  var loader = new THREE.TextureLoader();
  function loadTex(url) {
    return new Promise(function (res, rej) {
      loader.load(url, function (t) {
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        res(t);
      }, undefined, rej);
    });
  }

  // DOM rect -> world centre and size.
  function worldRect(r) {
    return { x: r.left + r.width / 2 - vw / 2, y: -(r.top + r.height / 2 - vh / 2), w: r.width, h: r.height };
  }

  var pointer = { x: 0, y: 0, cx: -9999, cy: -9999 };
  if (!isCoarsePointer) {
    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX / vw - 0.5;
      pointer.y = e.clientY / vh - 0.5;
      pointer.cx = e.clientX; pointer.cy = e.clientY;
    }, { passive: true });
  }

  var actors = [];
  var lost = false;
  var S = {
    THREE: THREE, tier: tier, fg: fg, bg: bg, fgScene: fgScene, bgScene: bgScene,
    fgCam: fgCam, pointer: pointer, loadTex: loadTex, worldRect: worldRect,
    vw: function () { return vw; }, vh: function () { return vh; },
    add: function (a) { actors.push(a); return a; },
    time: 0,
  };

  function frame(t) {
    if (lost) return;
    S.time = typeof t === "number" ? t : 0;
    for (var i = 0; i < actors.length; i++) actors[i].update(S.time);
    fg.render(fgScene, fgCam);
    if (bg) bg.render(bgScene, bgCam);
  }
  if (typeof gsap !== "undefined") gsap.ticker.add(frame);
  else (function loop(t) { frame(t / 1000); requestAnimationFrame(loop); })(0);

  // A lost context would freeze the last frame over photos that are hidden
  // underneath it. Put every real <img> back and step out of the way.
  function onLost(e) {
    e.preventDefault();
    lost = true;
    fg.domElement.style.display = "none";
    if (bg) bg.domElement.style.display = "none";
    document.querySelectorAll(".gl-active").forEach(function (el) { el.classList.remove("gl-active"); });
    document.documentElement.classList.remove("has-stage");
  }
  fg.domElement.addEventListener("webglcontextlost", onLost);
  if (bg) bg.domElement.addEventListener("webglcontextlost", onLost);

  document.documentElement.classList.add("has-stage");
  if (bg) addDust(S);
  return S;
}

// ------------------------------------------------------------------- dust ---
function addDust(S) {
  var THREE = S.THREE;
  var COUNT = S.tier === "low" ? 1000 : 2400;
  var pos = new Float32Array(COUNT * 3), size = new Float32Array(COUNT), phase = new Float32Array(COUNT);
  var sx = Math.max(S.vw(), 900) * 1.8, sy = Math.max(S.vh(), 700) * 2.2;
  for (var i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * sx;
    pos[i * 3 + 1] = (Math.random() - 0.5) * sy;
    pos[i * 3 + 2] = -Math.random() * 4600;
    size[i] = 1.1 + Math.random() * 2.6;
    phase[i] = Math.random() * 6.283;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  var mat = new THREE.ShaderMaterial({
    vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xe0b47e) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  var pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  S.bgScene.add(pts);
  S.add({
    update: function (t) {
      mat.uniforms.uTime.value = t;
      // The camera travels forward through the field as the page scrolls.
      var max = Math.max(document.documentElement.scrollHeight - S.vh(), 1);
      pts.position.z = (window.scrollY / max) * 3600;
      pts.position.x += (S.pointer.x * 70 - pts.position.x) * 0.04;
      pts.position.y += (-S.pointer.y * 50 - pts.position.y) * 0.04;
    },
  });
}

// ----------------------------------------------------------------- avatar ---
// opts: { el (anchor), img (fallback <img>), color, depth, progress () -> 0..1 }
function addAvatar(S, opts) {
  var THREE = S.THREE;
  return Promise.all([S.loadTex(opts.color), S.loadTex(opts.depth), sampleAlpha(opts.color, S.tier === "low" ? 175 : 290)])
    .then(function (res) {
      var colorTex = res[0], depthTex = res[1], grid = res[2];
      var n = grid.uv.length / 2;
      var geo = new THREE.BufferGeometry();
      // position is unused by the shader but three needs one for bounds
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      geo.setAttribute("aUv", new THREE.BufferAttribute(grid.uv, 2));
      var rnd = new Float32Array(n * 4);
      for (var i = 0; i < rnd.length; i++) rnd[i] = Math.random();
      geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 4));

      var mat = new THREE.ShaderMaterial({
        vertexShader: AVATAR_VERT, fragmentShader: AVATAR_FRAG, transparent: true, depthWrite: false,
        uniforms: {
          uColor: { value: colorTex }, uDepth: { value: depthTex },
          uSize: { value: new THREE.Vector2(1, 1) }, uRelief: { value: 1 },
          uAssemble: { value: 0 }, uDisperse: { value: 0 }, uTime: { value: 0 },
          uMouse: { value: new THREE.Vector3(0, 0, 0) }, uPoint: { value: 2 }, uCamZ: { value: 1400 }, uOpacity: { value: 1 },
          uTint: { value: new THREE.Color(0xe8c088) },
        },
      });
      var pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;

      // At rest the figure is a solid relief mesh, not points: a face needs
      // every pixel of the photograph to still look like the person. The
      // cloud takes over only while the figure is condensing on arrival and
      // coming apart on scroll, where individual points are the effect.
      var seg = S.tier === "low" ? 96 : 180;
      var meshMat = new THREE.ShaderMaterial({
        vertexShader: RELIEF_VERT, fragmentShader: RELIEF_FRAG, transparent: true, side: THREE.DoubleSide,
        uniforms: {
          uTex: { value: colorTex }, uDepth: { value: depthTex }, uHasDepth: { value: 1 }, uWindow: { value: 0 },
          uRelief: { value: 1 }, uXform: { value: new THREE.Vector4(1, 1, 0, 0) },
          uPlane: { value: new THREE.Vector2(1, 1) }, uRadius: { value: new THREE.Vector4(0, 0, 0, 0) },
          uFade: { value: 0 }, uHover: { value: 0 }, uParallax: { value: new THREE.Vector2(0, 0) },
          uLight: { value: new THREE.Vector3(-0.4, 0.5, 0.8) }, uTint: { value: new THREE.Color(0xe8c088) },
          uReflect: { value: 0 }, uStep: { value: 1 / seg }, uEdgeCut: { value: 0.11 },
        },
      });
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, seg, seg), meshMat);
      mesh.frustumCulled = false;

      var group = new THREE.Group();
      group.add(mesh);
      group.add(pts);
      S.fgScene.add(group);
      function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

      var aspect = grid.aspect;
      var rotY = 0, rotX = 0, mouseAmt = 0;
      var assembled = { v: 0 };
      var avatar = {
        assembled: assembled,
        assemble: function (dur) {
          if (typeof gsap === "undefined") { assembled.v = 1; return; }
          gsap.to(assembled, { v: 1, duration: dur || 2.2, ease: "power2.inOut" });
        },
        update: function (t) {
          var r = opts.el.getBoundingClientRect();
          if (r.bottom < -r.height || r.top > S.vh() + r.height || r.width === 0) { group.visible = false; return; }
          group.visible = true;
          var w = S.worldRect(r);
          // Fit the figure inside its anchor, keeping the photo's aspect.
          var fw = w.w, fh = w.w / aspect;
          if (fh > w.h) { fh = w.h; fw = fh * aspect; }
          group.position.set(w.x, w.y, 0);
          mat.uniforms.uSize.value.set(fw, fh);
          mat.uniforms.uRelief.value = fh * 0.28;
          mat.uniforms.uPoint.value = (fw / grid.cols) * 1.55 * S.fg.getPixelRatio();
          mat.uniforms.uTime.value = t;
          mat.uniforms.uAssemble.value = assembled.v;
          var prog = opts.progress ? opts.progress() : 0;
          mat.uniforms.uDisperse.value = prog;

          var formed = smooth(0.84, 1.0, assembled.v);
          var meshOn = formed * (1 - smooth(0.015, 0.1, prog));
          var ptsOn = Math.max(1 - formed, smooth(0.0, 0.05, prog));
          mat.uniforms.uOpacity.value = ptsOn;
          pts.visible = ptsOn > 0.01;
          mesh.visible = meshOn > 0.01;
          mesh.scale.set(fw, fh, 1);
          meshMat.uniforms.uRelief.value = fh * 0.28;
          meshMat.uniforms.uFade.value = meshOn;
          meshMat.uniforms.uLight.value.set(-0.5 + S.pointer.x * 1.6, 0.55 - S.pointer.y * 1.2, 0.75);

          // The figure turns to follow the pointer on a desktop; on a phone
          // it sways on its own and the scroll turns it, so the depth is
          // never something only a mouse can reveal.
          var ty, tx;
          if (isCoarsePointer) {
            ty = Math.sin(t * 0.45) * 0.30 + prog * 0.9;
            tx = Math.sin(t * 0.31) * 0.05;
          } else {
            ty = S.pointer.x * 0.75 + Math.sin(t * 0.4) * 0.05 + prog * 0.6;
            tx = S.pointer.y * 0.22;
          }
          rotY += (ty - rotY) * 0.06;
          rotX += (tx - rotX) * 0.06;
          group.rotation.set(rotX, rotY, 0);
          group.position.z = -prog * 400;

          // Pointer in the figure's local plane (approximate: ignores the
          // small rotation, which is imperceptible for a soft field).
          if (!isCoarsePointer) {
            var lx = S.pointer.cx - (r.left + r.width / 2);
            var ly = -(S.pointer.cy - (r.top + r.height / 2));
            var inside = Math.abs(lx) < fw * 0.6 && Math.abs(ly) < fh * 0.6;
            mouseAmt += ((inside ? 1 : 0) - mouseAmt) * 0.08;
            mat.uniforms.uMouse.value.set(lx, ly, mouseAmt);
          }
        },
      };
      S.add(avatar);
      if (opts.img) opts.el.classList.add("gl-active");
      return avatar;
    });
}

// Reads the cut-out's alpha on the CPU at the point grid's resolution, so the
// cloud only contains points that land on the figure (about half the grid).
function sampleAlpha(url, cols) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () {
      var aspect = im.naturalWidth / im.naturalHeight;
      var rows = Math.round(cols / aspect);
      var c = document.createElement("canvas");
      c.width = cols; c.height = rows;
      var g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(im, 0, 0, cols, rows);
      var data = g.getImageData(0, 0, cols, rows).data;
      var uv = [];
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          if (data[(y * cols + x) * 4 + 3] > 140) {
            // jitter within the cell so the cloud has no visible grid
            uv.push((x + 0.5 + (Math.random() - 0.5) * 0.7) / cols, 1 - (y + 0.5 + (Math.random() - 0.5) * 0.7) / rows);
          }
        }
      }
      res({ uv: new Float32Array(uv), cols: cols, rows: rows, aspect: aspect });
    };
    im.onerror = rej;
    im.src = url;
  });
}

// ---------------------------------------------------------------- reliefs ---
// opts: { el, img, color, depth?, mode: "object"|"window", radius?: [tl,tr,br,bl],
//         pad?: 0..1 (object only), hoverEl?, reflect?, place?: function(mesh, S, t) }
function addRelief(S, opts) {
  var THREE = S.THREE;
  var loads = [S.loadTex(opts.color)];
  if (opts.depth) loads.push(S.loadTex(opts.depth).catch(function () { return null; }));
  return Promise.all(loads).then(function (res) {
    var tex = res[0], depthTex = res[1] || null;
    var iw = tex.image.width || 1, ih = tex.image.height || 1;
    var seg = S.tier === "low" ? 56 : 110;
    var geo = new THREE.PlaneGeometry(1, 1, depthTex ? seg : 1, depthTex ? seg : 1);
    var isWindow = opts.mode === "window";

    function makeMat(reflect) {
      return new THREE.ShaderMaterial({
        vertexShader: RELIEF_VERT, fragmentShader: RELIEF_FRAG, transparent: true,
        depthWrite: !reflect, side: THREE.DoubleSide,
        uniforms: {
          uTex: { value: tex }, uDepth: { value: depthTex },
          uHasDepth: { value: depthTex ? 1 : 0 }, uWindow: { value: isWindow ? 1 : 0 },
          uRelief: { value: 0 }, uXform: { value: new THREE.Vector4(1, 1, 0, 0) },
          uPlane: { value: new THREE.Vector2(1, 1) }, uRadius: { value: new THREE.Vector4(0, 0, 0, 0) },
          uFade: { value: 1 }, uHover: { value: 0 }, uParallax: { value: new THREE.Vector2(0, 0) },
          uLight: { value: new THREE.Vector3(-0.4, 0.5, 0.8) }, uTint: { value: new THREE.Color(0xe8c088) },
          uReflect: { value: reflect ? 1 : 0 }, uStep: { value: 1 / seg }, uEdgeCut: { value: opts.edgeCut || 0.34 },
        },
      });
    }
    var mat = makeMat(false);
    var mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    S.fgScene.add(mesh);
    var mirror = null;
    if (opts.reflect) {
      mirror = new THREE.Mesh(geo, makeMat(true));
      mirror.frustumCulled = false;
      S.fgScene.add(mirror);
    }

    var hover = 0, hoverTarget = 0, hx = 0, hy = 0, rotX = 0, rotY = 0;
    var seed = Math.random() * 10;
    var hEl = opts.hoverEl || opts.el;
    if (!isCoarsePointer && hEl) {
      hEl.addEventListener("pointerenter", function () { hoverTarget = 1; });
      hEl.addEventListener("pointerleave", function () { hoverTarget = 0; hx = 0; hy = 0; });
      hEl.addEventListener("pointermove", function (e) {
        var r = hEl.getBoundingClientRect();
        hx = (e.clientX - r.left) / r.width - 0.5;
        hy = (e.clientY - r.top) / r.height - 0.5;
      }, { passive: true });
    }

    var relief = {
      mesh: mesh, mirror: mirror, mat: mat, aspect: iw / ih, visible: true,
      setVisible: function (v) { relief.visible = v; },
      update: function (t) {
        hover += (hoverTarget - hover) * 0.1;
        mat.uniforms.uHover.value = hover;
        // The light swings with the pointer, so the relief is raked from a
        // different side as you move and its surface visibly changes.
        mat.uniforms.uLight.value.set(-0.4 + S.pointer.x * 1.4, 0.5 - S.pointer.y * 1.2, 0.8);

        if (opts.place) {
          // A caller that positions this object itself (the showroom ring).
          opts.place(relief, t);
          if (mirror) {
            mirror.visible = mesh.visible;
            mirror.material.uniforms.uFade.value = mat.uniforms.uFade.value;
            mirror.material.uniforms.uRelief.value = mat.uniforms.uRelief.value;
            mirror.material.uniforms.uLight.value.copy(mat.uniforms.uLight.value);
          }
          return;
        }

        var r = opts.el.getBoundingClientRect();
        if (!relief.visible || r.bottom < -120 || r.top > S.vh() + 120 || r.width === 0) { mesh.visible = false; return; }
        mesh.visible = true;
        var w = S.worldRect(r);
        var up = 1 - 2 * ((r.top + r.height / 2) / S.vh()); // +1 top of screen, -1 bottom
        up = Math.max(-1.3, Math.min(1.3, up));

        if (isWindow) {
          mesh.scale.set(w.w, w.h, 1);
          mesh.position.set(w.x, w.y, 0);
          mesh.rotation.set(0, 0, 0);
          // cover-fit UVs
          var pa = w.w / w.h, ia = iw / ih, sx = 1, sy = 1;
          if (pa > ia) sy = ia / pa; else sx = pa / ia;
          mat.uniforms.uXform.value.set(sx, sy, (1 - sx) / 2, (1 - sy) / 2);
          mat.uniforms.uPlane.value.set(w.w, w.h);
          var rr = opts.radius || [0, 0, 0, 0];
          mat.uniforms.uRadius.value.set(rr[0], rr[1], rr[2], rr[3]);
          mat.uniforms.uRelief.value = 0;
          // Scroll moves the scene inside the frame; the pointer adds to it.
          var px = (isCoarsePointer ? Math.sin(t * 0.5 + seed) * 0.6 : hx * 1.6 * hover);
          var py = up * 0.9 + (isCoarsePointer ? 0 : -hy * 1.2 * hover);
          mat.uniforms.uParallax.value.set(px * 0.035 * sx, py * 0.035 * sy);
          return;
        }

        // object: fit the product inside the anchor with some air
        var pad = opts.pad || 0.84;
        var fw = w.w * pad, fh = fw / relief.aspect;
        if (fh > w.h * pad) { fh = w.h * pad; fw = fh * relief.aspect; }
        mesh.scale.set(fw, fh, 1);
        mesh.position.set(w.x, w.y, 0);
        mat.uniforms.uRelief.value = Math.min(fw, fh) * 0.30;
        // Turns with the scroll on every device, idles on a phone, and
        // swings hard toward the pointer on hover — enough to see round the
        // relief, which is the whole point of giving it depth.
        var ty = (isCoarsePointer ? Math.sin(t * 0.55 + seed) * 0.22 : 0) + hx * 0.9 * hover;
        var tx = up * -0.2 + hy * 0.6 * hover;
        rotY += (ty - rotY) * 0.08;
        rotX += (tx - rotX) * 0.08;
        mesh.rotation.set(rotX, rotY, 0);
        mesh.position.z = hover * 60;
      },
    };
    S.add(relief);
    if (opts.img) opts.el.classList.add("gl-active");
    return relief;
  });
}

// ----------------------------------------------------------------- sparks ---
// opts: { el, point: [u, v] in the element's *image* space, img (for cover
//         mapping), angle: [a0, a1] radians, count, burst?: bool }
function addSparks(S, opts) {
  var THREE = S.THREE;
  var N = opts.count || (S.tier === "low" ? 420 : 1100);
  var ends = new Float32Array(N * 2), seeds = new Float32Array(N * 2 * 4);
  var pos = new Float32Array(N * 2 * 3);
  for (var i = 0; i < N; i++) {
    var s = [Math.random(), Math.random(), Math.random(), Math.random()];
    for (var e = 0; e < 2; e++) {
      ends[i * 2 + e] = e;
      for (var k = 0; k < 4; k++) seeds[(i * 2 + e) * 4 + k] = s[k];
    }
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  var mat = new THREE.ShaderMaterial({
    vertexShader: SPARK_VERT, fragmentShader: SPARK_FRAG,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uOrigin: { value: new THREE.Vector2() }, uScale: { value: 1000 },
      uActive: { value: 0 }, uBurst: { value: opts.burst ? 1 : 0 }, uBurstAt: { value: -99 },
      uAngle: { value: new THREE.Vector2(opts.angle[0], opts.angle[1]) },
    },
  });
  var lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  lines.renderOrder = 10;
  S.fgScene.add(lines);

  var active = 0;
  var sparks = {
    fire: function (clientX, clientY) {
      mat.uniforms.uBurstAt.value = S.time;
      mat.uniforms.uOrigin.value.set(clientX - S.vw() / 2, -(clientY - S.vh() / 2));
      mat.uniforms.uScale.value = Math.min(S.vw(), 1200) * 0.55;
    },
    update: function (t) {
      mat.uniforms.uTime.value = t;
      if (opts.burst) return;
      var r = opts.el.getBoundingClientRect();
      var onScreen = r.bottom > 0 && r.top < S.vh() && r.width > 0;
      // Only spend fill-rate while the photo is actually being looked at.
      var vis = onScreen ? Math.min(1, Math.min(r.bottom, S.vh()) - Math.max(r.top, 0)) / Math.min(r.height, S.vh()) : 0;
      active += (Math.min(1, vis * 1.4) - active) * 0.06;
      mat.uniforms.uActive.value = active;
      lines.visible = active > 0.01;
      if (!lines.visible) return;
      // Map the grinder's contact point from image space through CSS
      // object-fit: cover and object-position to the screen.
      var img = opts.img, nw = img.naturalWidth || 2000, nh = img.naturalHeight || 1333;
      var sc = Math.max(r.width / nw, r.height / nh);
      var dw = nw * sc, dh = nh * sc;
      var op = (getComputedStyle(img).objectPosition || "50% 50%").split(" ");
      var ox = (r.width - dw) * (parseFloat(op[0]) / 100), oy = (r.height - dh) * (parseFloat(op[1]) / 100);
      var sx = r.left + ox + opts.point[0] * dw, sy = r.top + oy + opts.point[1] * dh;
      mat.uniforms.uOrigin.value.set(sx - S.vw() / 2, -(sy - S.vh() / 2));
      mat.uniforms.uScale.value = dw * 0.62;
    },
  };
  S.add(sparks);
  return sparks;
}
