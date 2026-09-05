/* =============================================================================
   Bangabandhu Military Museum — motion engine
   Zero dependencies. Single rAF loop, lerped scroll, IntersectionObserver reveals.
   ============================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame.bind(window);

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------------------------------------------------------------- state */
  var vh = window.innerHeight;
  var vw = window.innerWidth;
  var target = window.scrollY;   // real scroll position
  var smooth = window.scrollY;   // eased position used for transforms
  var docH = 1;

  function measure() {
    vh = window.innerHeight;
    vw = window.innerWidth;
    docH = Math.max(1, document.documentElement.scrollHeight - vh);
    cacheRects();
    sizeCanvases();
  }

  /* ================================================================ PRELOAD */
  (function preload() {
    var el = $('#preloader'), fill = $('#preloaderFill');
    if (!el) return;
    var p = 0, done = false;
    var tick = setInterval(function () {
      p = Math.min(96, p + Math.random() * 18);
      if (fill) fill.style.width = p + '%';
    }, 130);

    function finish() {
      if (done) return; done = true;
      clearInterval(tick);
      if (fill) fill.style.width = '100%';
      setTimeout(function () {
        el.classList.add('is-done');
        var hero = $('#hero');
        if (hero) hero.classList.add('is-ready');
        measure();
        setTimeout(function () { el.remove(); }, 900);
      }, 320);
    }
    window.addEventListener('load', finish);
    setTimeout(finish, 2600); // never hold the page hostage
  })();

  /* =================================================================== NAV */
  (function nav() {
    var bar = $('#nav'), toggle = $('#navToggle'), links = $('.nav__links');
    if (!bar) return;
    var last = 0;

    toggle && toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    });
    $$('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle && toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('is-locked');
      });
    });

    window.__navUpdate = function (y) {
      bar.classList.toggle('is-stuck', y > 40);
      var hide = y > last && y > 520 && !links.classList.contains('is-open');
      bar.classList.toggle('is-hidden', hide);
      last = y;
    };

    // active section highlight
    var ids = ['about', 'timeline', 'galleries', 'outdoor', 'toshakhana', 'visit'];
    var map = {};
    ids.forEach(function (id) {
      var a = $('.nav__links a[href="#' + id + '"]');
      var s = document.getElementById(id);
      if (a && s) map[id] = { a: a, s: s };
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var m = map[e.target.id];
        if (m && e.isIntersecting) {
          Object.keys(map).forEach(function (k) { map[k].a.classList.remove('is-active'); });
          m.a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (k) { io.observe(map[k].s); });
  })();

  /* ================================================================ REVEAL */
  (function reveal() {
    var items = $$('.reveal');
    if (reduced) { items.forEach(function (i) { i.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('is-in'); }, i * 70);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (i) { io.observe(i); });
  })();

  /* ============================================================ SPLIT TEXT */
  (function splitText() {
    $$('[data-split]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'word';
        s.textContent = w;
        s.style.transitionDelay = (i * 26) + 'ms';
        el.appendChild(s);
        el.appendChild(document.createTextNode(' '));
      });
      if (reduced) { $$('.word', el).forEach(function (w) { w.classList.add('is-in'); }); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          $$('.word', el).forEach(function (w) { w.classList.add('is-in'); });
          io.disconnect();
        });
      }, { threshold: 0.2 });
      io.observe(el);
    });
  })();

  /* ============================================================== COUNTERS */
  (function counters() {
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var raw = el.hasAttribute('data-raw'); // a year: render it whole, never count to it
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.disconnect();
          // Years are set outright: counting up through 1941, 1965 … would put
          // dates on screen that never happened.
          if (reduced || raw) { el.textContent = end + suffix; return; }
          var t0 = performance.now(), dur = 1500;
          (function step(now) {
            var p = clamp((now - t0) / dur, 0, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = Math.round(end * eased);
            el.textContent = val.toLocaleString('en-US') + suffix;
            if (p < 1) raf(step);
          })(t0);
        });
      }, { threshold: 0.5 });
      io.observe(el);
    });
  })();

  /* ============================================================== TILT 3D */
  (function tilt() {
    if (reduced || window.matchMedia('(hover: none)').matches) return;
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(1100px) rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' +
          (x * 5).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  })();

  /* ============================================================= STARFIELD */
  var canvases = [];
  function makeStars(canvas, opts) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    var o = opts || {};
    var density = o.density || 0.00016;
    var tint = o.tint || '226,235,240';
    var entry = { canvas: canvas, ctx: ctx, stars: stars, dpr: dpr, drift: o.drift || 0, twinkle: o.twinkle !== false };

    entry.build = function () {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      var n = Math.min(520, Math.round(r.width * r.height * density));
      stars.length = 0;
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: (Math.random() * 1.1 + 0.25) * dpr,
          a: Math.random() * 0.6 + 0.15,
          s: Math.random() * 0.02 + 0.004,
          p: Math.random() * Math.PI * 2
        });
      }
    };
    entry.draw = function (t) {
      if (!canvas.width) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = entry.twinkle ? s.a * (0.55 + 0.45 * Math.sin(t * s.s + s.p)) : s.a;
        if (entry.drift) {
          s.x += entry.drift * dpr;
          if (s.x > canvas.width + 4) s.x = -4;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + tint + ',' + a.toFixed(3) + ')';
        ctx.fill();
      }
    };
    entry.build();
    canvases.push(entry);
  }
  function sizeCanvases() { canvases.forEach(function (c) { c.build(); }); }

  makeStars($('#heroStars'), { density: 0.00012, drift: 0.012 });
  makeStars($('#skyCanvas'), { density: 0.00020, drift: 0.02, tint: '226,196,132' });

  /* ============================================================== PARALLAX */
  var pxItems = [];
  function cacheRects() {
    pxItems = $$('[data-parallax]').map(function (el) {
      var r = el.getBoundingClientRect();
      return {
        el: el,
        factor: parseFloat(el.getAttribute('data-parallax')) || 0,
        self: el.getAttribute('data-parallax-scope') === 'self',
        top: r.top + window.scrollY,
        h: r.height
      };
    });
    var rail = $('#timelineRail'), sec = $('#timeline');
    if (rail && sec) {
      TL.rail = rail;
      TL.sec = sec;
      TL.top = sec.getBoundingClientRect().top + window.scrollY;
      TL.h = sec.offsetHeight;
      TL.dist = Math.max(0, rail.scrollWidth - vw);
    }
  }
  var TL = {};

  /* ============================================================ TL / STEPS */
  (function outdoorSteps() {
    var steps = $$('.ostep'), vizzes = $$('.viz');
    if (!steps.length) return;
    function activate(i) {
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      vizzes.forEach(function (v, k) { v.classList.toggle('is-active', k === i); });
    }
    activate(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) activate(parseInt(e.target.getAttribute('data-step'), 10) || 0);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  })();

  /* =============================================================== MARQUEE */
  var marquee = $('#marqueeTrack');
  var mqX = 0, mqW = 0;
  if (marquee) {
    requestAnimationFrame(function () { mqW = marquee.scrollWidth / 2; });
  }

  /* ============================================================= MAIN LOOP */
  var progressBar = $('#scrollProgress');
  var timelineFill = $('#timelineFill');
  var tlEnabled = !window.matchMedia('(max-width:760px)').matches;
  var lastY = window.scrollY;

  function frame(now) {
    target = window.scrollY;
    smooth = reduced ? target : lerp(smooth, target, 0.12);
    if (Math.abs(smooth - target) < 0.05) smooth = target;
    var vel = target - lastY;
    lastY = target;

    // progress
    if (progressBar) progressBar.style.width = ((target / docH) * 100).toFixed(3) + '%';
    if (window.__navUpdate) window.__navUpdate(target);

    // parallax layers
    for (var i = 0; i < pxItems.length; i++) {
      var it = pxItems[i];
      var rel;
      if (it.self) {
        var center = it.top + it.h / 2 - smooth;
        rel = (vh / 2 - center) * it.factor;
      } else {
        rel = (smooth - it.top) * it.factor;
      }
      // only paint what's near the viewport
      if (it.top + it.h > smooth - vh && it.top < smooth + vh * 2) {
        it.el.style.transform = 'translate3d(0,' + rel.toFixed(2) + 'px,0)';
      }
    }

    // pinned horizontal timeline
    if (tlEnabled && TL.rail) {
      var p = clamp((smooth - TL.top) / Math.max(1, TL.h - vh), 0, 1);
      TL.rail.style.transform = 'translate3d(' + (-p * TL.dist).toFixed(2) + 'px,0,0)';
      if (timelineFill) timelineFill.style.width = (p * 100).toFixed(2) + '%';
    }

    // marquee: constant drift + scroll velocity
    if (marquee && mqW) {
      mqX -= 0.35 + vel * 0.06;
      if (mqX <= -mqW) mqX += mqW;
      if (mqX > 0) mqX -= mqW;
      marquee.style.transform = 'translate3d(' + mqX.toFixed(2) + 'px,0,0)';
    }

    // canvases
    for (var c = 0; c < canvases.length; c++) canvases[c].draw(now);

    raf(frame);
  }

  /* ================================================================= BOOT */
  var ro = 0;
  window.addEventListener('resize', function () {
    clearTimeout(ro);
    ro = setTimeout(function () {
      tlEnabled = !window.matchMedia('(max-width:760px)').matches;
      if (!tlEnabled && TL.rail) TL.rail.style.transform = '';
      measure();
      if (marquee) mqW = marquee.scrollWidth / 2;
    }, 160);
  }, { passive: true });

  window.addEventListener('load', measure);
  document.addEventListener('DOMContentLoaded', measure);
  measure();
  raf(frame);
})();
