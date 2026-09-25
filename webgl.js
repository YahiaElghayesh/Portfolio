// ---------- WebGL layer ----------
//
// CSS 3D transforms have a ceiling. They can rotate and translate a flat
// rectangle in a fake camera, and that is all they can ever do: no vertex
// displacement, no per-pixel work, no real volume. Everything below needs a
// GPU, so it runs on three.js.
//
// The canvas is fixed behind #main, which is transparent, exactly like the
// CSS light pools already behind it. Anything the shaders draw is therefore
// visible *through* the page, and the elements it stands in for keep their
// real layout, border and shadow in the DOM. The DOM stays the source of
// truth for where things are; WebGL only paints.
//
// It is strictly additive. If the browser has no WebGL, if three.js fails to
// load, if a texture 404s, or if the reader asked for reduced motion, none of
// this runs and the CSS version of the site is what shows. The DOM <img> is
// only hidden once its texture is on the GPU, so a failure anywhere leaves a
// working page rather than an empty frame.

// Leading "./" is required: a dynamic import() treats a bare specifier as a
// module name to resolve, not a path, and throws before it ever fetches.
var GL_SRC = "./assets/vendor/three.module.min.js";
var glRuntime = null;

// Synchronous, because two CSS systems need to know the answer before the
// module has finished loading: the depth flow and the hero must not also
// animate an element WebGL is about to take over, or the element's box and
// the plane drawn over it would disagree every frame.
function willUseWebGL() {
  if (prefersReduced) return false;
  if (typeof document === "undefined") return false;
  try {
    var c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

var VERT = [
  "uniform float uVel;",
  "uniform float uTime;",
  "uniform vec2  uHover;",
  "uniform float uHoverAmt;",
  "varying vec2  vUv;",
  "varying float vWave;",
  "void main() {",
  "  vUv = uv;",
  "  vec3 p = position;",
  // The plane is 1x1 in local space and scaled to the element's pixel size,
  // so x and y stay in fractions of the element while z is already in pixels.
  "  float arc = sin(uv.x * 3.14159265);",
  // Zero at all four edges. Everything that displaces the surface while the
  // page is still gets multiplied by it, so the plane's outline always
  // matches the frame it is standing in and never leaks a sliver past the
  // border. Only the scroll bend is allowed outside the box, because a
  // photograph bulging out of its frame as the page moves is the point.
  "  float edge = arc * sin(uv.y * 3.14159265);",
  // Scroll speed bends the sheet. This is the move CSS cannot make: the
  // geometry itself curves, so the photo is a surface being pulled through
  // the viewport rather than a rectangle being rotated.
  "  float bend = arc * uVel;",
  "  p.z += bend * 150.0;",
  "  p.y += arc * uVel * 0.06;",
  // A slow travelling ripple, so a still page is never completely dead.
  "  p.z += sin(uv.x * 5.0 + uTime * 0.6) * cos(uv.y * 3.0 - uTime * 0.4) * 7.0 * edge;",
  // And the pointer pushes a bulge up out of the surface.
  "  float d = distance(uv * 2.0 - 1.0, uHover);",
  "  p.z += uHoverAmt * 110.0 * exp(-d * d * 2.5) * edge;",
  "  vWave = bend;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
  "}",
].join("\n");

var FRAG = [
  "uniform sampler2D uTex;",
  "uniform vec2  uPlane;",
  "uniform vec2  uImage;",
  "uniform float uVel;",
  "uniform float uRadius;",
  "uniform float uHoverAmt;",
  "uniform float uFade;",
  "varying vec2  vUv;",
  "varying float vWave;",
  // CSS object-fit: cover, done in the shader, so the plane can be any
  // aspect ratio without the photograph stretching.
  "vec2 coverUv(vec2 uv, vec2 plane, vec2 img) {",
  "  float s = max(plane.x / img.x, plane.y / img.y);",
  "  vec2 size = img * s;",
  "  vec2 off = (plane - size) * 0.5;",
  "  return (uv * plane - off) / size;",
  "}",
  "void main() {",
  "  vec2 uv = coverUv(vUv, uPlane, uImage);",
  // The three colour channels are sampled a hair apart, by an amount that
  // grows with scroll speed: the lens smears when the page moves fast.
  "  float split = abs(uVel) * 0.010 + uHoverAmt * 0.003;",
  "  vec3 col = vec3(",
  "    texture2D(uTex, uv + vec2(split, 0.0)).r,",
  "    texture2D(uTex, uv).g,",
  "    texture2D(uTex, uv - vec2(split, 0.0)).b",
  "  );",
  // Light catches the curve: the part of the sheet bent toward the camera
  // brightens, which is what sells the bend as geometry and not a filter.
  "  col += clamp(vWave, -1.0, 1.0) * 0.16;",
  "  col += uHoverAmt * 0.05;",
  // Rounded corners, so the plane matches the frame it stands in for.
  "  vec2 q = abs(vUv - 0.5) * uPlane;",
  "  vec2 h = max(uPlane * 0.5 - uRadius, vec2(0.0));",
  "  float d = length(max(q - h, 0.0)) - uRadius;",
  "  float a = (1.0 - smoothstep(-1.0, 1.0, d)) * uFade;",
  "  if (a <= 0.001) discard;",
  "  gl_FragColor = vec4(col, a);",
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
  // Motes fade out as they pass the camera and as they recede, so the field
  // has no visible front or back wall.
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

function initWebGL() {
  if (!willUseWebGL() || glRuntime) return;
  if (!document.querySelector(".depth-bg")) return;
  import(GL_SRC).then(buildScene).catch(function () {
    // No three.js, no problem: the CSS layer underneath is a whole site.
  });
}

function buildScene(THREE) {
  var host = document.querySelector(".depth-bg");
  var canvas = document.createElement("canvas");
  canvas.className = "gl-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch (e) {
    canvas.remove();
    return;
  }
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, 1, 10, 9000);
  var planes = [];
  var dust = null;
  var pointer = { x: 0, y: 0 };
  var time = 0;
  var lost = false;

  // 1 world unit = 1 CSS pixel at z = 0. Every position below is then just
  // the number the DOM already reports, with no scale factor to keep in sync.
  var CAM_Z = 900;
  function sizeToViewport() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.75 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = CAM_Z;
    camera.fov = 2 * Math.atan(h / 2 / CAM_Z) * (180 / Math.PI);
    camera.updateProjectionMatrix();
  }
  sizeToViewport();

  // ---------- the dust field ----------
  // Real volume, which is the thing a fixed background gradient can never
  // be: motes at genuinely different depths, so they separate as the camera
  // travels and the page gets a sense of being somewhere rather than on
  // something.
  (function buildDust() {
    var COUNT = isCoarsePointer ? 1400 : 2600;
    var pos = new Float32Array(COUNT * 3);
    var size = new Float32Array(COUNT);
    var phase = new Float32Array(COUNT);
    var spreadX = Math.max(window.innerWidth, 900) * 1.8;
    var spreadY = Math.max(window.innerHeight, 700) * 2.2;
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spreadX;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      pos[i * 3 + 2] = -Math.random() * 4600;
      size[i] = 1.1 + Math.random() * 2.6;
      phase[i] = Math.random() * 6.283;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    var mat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xe0b47e) } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    dust = new THREE.Points(geo, mat);
    scene.add(dust);
  })();

  // ---------- one plane per opted-in photograph ----------
  var geometry = new THREE.PlaneGeometry(1, 1, 28, 28);

  function addPlane(img) {
    if (img.dataset.glBound) return;
    img.dataset.glBound = "1";

    var frame = img.closest("[data-gl-frame]") || img.parentNode;
    var radius = parseFloat(getComputedStyle(frame).borderRadius) || 0;

    new THREE.TextureLoader().load(
      img.currentSrc || img.src,
      function (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        var mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          uniforms: {
            uTex: { value: tex },
            uPlane: { value: new THREE.Vector2(1, 1) },
            uImage: { value: new THREE.Vector2(tex.image.width || 1, tex.image.height || 1) },
            uVel: { value: 0 },
            uTime: { value: 0 },
            uHover: { value: new THREE.Vector2(0, 0) },
            uHoverAmt: { value: 0 },
            uRadius: { value: radius },
            uFade: { value: 1 },
          },
        });
        var mesh = new THREE.Mesh(geometry, mat);
        mesh.frustumCulled = false;
        scene.add(mesh);
        planes.push({ mesh: mesh, mat: mat, el: frame, img: img, hover: 0, target: 0 });

        // Only now is it safe to take the real image away. Hiding it any
        // earlier would leave an empty frame for as long as the texture took
        // to arrive, and forever if it never did.
        img.style.opacity = "0";
        // Tells the stylesheet the GPU has this one. The frame drops its
        // border and shadow, because a photograph turning in real space
        // inside a hard rectangle reads as a picture that does not fit its
        // window; on its own it reads as an object. The class only ever
        // appears once a texture is actually drawing, so the framed CSS
        // version stays the fallback.
        frame.classList.add("gl-active");

        if (!isCoarsePointer) {
          frame.addEventListener("pointermove", function (e) {
            var r = frame.getBoundingClientRect();
            mat.uniforms.uHover.value.set(
              ((e.clientX - r.left) / r.width) * 2 - 1,
              (1 - (e.clientY - r.top) / r.height) * 2 - 1
            );
          }, { passive: true });
          frame.addEventListener("pointerenter", function () { setTarget(mesh, 1); });
          frame.addEventListener("pointerleave", function () { setTarget(mesh, 0); });
        }
      },
      undefined,
      function () {
        // Texture failed: the DOM image was never hidden, so the photo is
        // still on the page. Nothing to undo.
      }
    );
  }

  function setTarget(mesh, v) {
    for (var i = 0; i < planes.length; i++) if (planes[i].mesh === mesh) planes[i].target = v;
  }

  document.querySelectorAll("img[data-gl]").forEach(function (img) {
    if (img.complete) addPlane(img);
    else img.addEventListener("load", function () { addPlane(img); }, { once: true });
  });

  // ---------- frame ----------
  var vw = window.innerWidth;
  var vh = window.innerHeight;

  function frame(t) {
    if (lost) return;
    time = (typeof t === "number" ? t : 0);

    var vel = typeof scrollVelocitySigned === "number" ? scrollVelocitySigned : 0;

    if (dust) {
      dust.material.uniforms.uTime.value = time;
      // The camera travels forward through the field as the page scrolls, so
      // scrolling is movement through a space rather than a background
      // sliding past.
      var max = Math.max(document.body.scrollHeight - vh, 1);
      dust.position.z = (window.scrollY / max) * 3600;
      dust.position.x += (pointer.x * 70 - dust.position.x) * 0.04;
      dust.position.y += (pointer.y * 50 - dust.position.y) * 0.04;
    }

    for (var i = 0; i < planes.length; i++) {
      var p = planes[i];
      var r = p.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200 || r.width === 0) {
        p.mesh.visible = false;
        continue;
      }
      p.mesh.visible = true;
      p.mesh.scale.set(r.width, r.height, 1);

      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      p.mesh.position.x = cx - vw / 2;
      p.mesh.position.y = -(cy - vh / 2);

      // The 3D these frames gave up in CSS, done properly. Each photograph
      // turns to face the middle of the screen and sits further back the
      // further it is from it, so the page is a wall of pictures seen
      // through one real camera rather than a stack of rectangles each
      // rotated in its own private fake one. Level and full-forward exactly
      // when it is centred, which is when it is being looked at.
      var up = 1 - 2 * (cy / vh);        // +1 at the top of the screen, -1 at the bottom
      var across = (cx - vw / 2) / (vw / 2);
      p.mesh.rotation.x = up * -0.20;
      p.mesh.rotation.y = across * 0.16;
      p.mesh.position.z = -Math.abs(up) * 150;
      p.mat.uniforms.uFade.value = 1 - Math.min(Math.abs(up), 1) * 0.35;

      p.hover += (p.target - p.hover) * 0.09;
      p.mat.uniforms.uPlane.value.set(r.width, r.height);
      p.mat.uniforms.uVel.value = vel;
      p.mat.uniforms.uTime.value = time;
      p.mat.uniforms.uHoverAmt.value = p.hover;
    }

    renderer.render(scene, camera);
  }

  // Rides the ticker GSAP is already running rather than opening a second
  // rAF loop, so the shaders and the scroll tweens are always reading the
  // same frame.
  if (typeof gsap !== "undefined") gsap.ticker.add(frame);
  else (function loop(t) { frame(t / 1000); requestAnimationFrame(loop); })(0);

  window.addEventListener("resize", function () {
    vw = window.innerWidth;
    vh = window.innerHeight;
    sizeToViewport();
  });

  if (!isCoarsePointer) {
    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = -(e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
  }

  // A lost context would otherwise freeze on the last frame drawn while the
  // real photographs stay hidden underneath it.
  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    lost = true;
    canvas.style.display = "none";
    planes.forEach(function (p) {
      p.img.style.opacity = "";
      p.el.classList.remove("gl-active");
    });
  });

  glRuntime = { renderer: renderer, scene: scene, planes: planes };
}
