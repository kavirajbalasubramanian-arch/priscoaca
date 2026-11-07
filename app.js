/* PRISCO MedCode Solutions – shared behaviour (no dependencies) */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header: scrolled state + mobile menu ---- */
  var hdr = d.querySelector('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var burger = d.querySelector('.burger');
  if (burger && hdr) {
    burger.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    d.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { hdr.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---- hero ledger: one orchestrated verification sequence ---- */
  var ledger = d.querySelector('.ledger');
  if (ledger) {
    var rows = ledger.querySelectorAll('.lrow');
    var timers = [];
    var clear = function () { timers.forEach(clearTimeout); timers = []; };
    var play = function () {
      clear();
      ledger.classList.remove('done');
      rows.forEach(function (r) { r.classList.remove('on', 'ok'); });
      rows.forEach(function (r, i) {
        timers.push(setTimeout(function () { r.classList.add('on'); }, 700 + i * 1300));
        timers.push(setTimeout(function () { r.classList.add('ok'); }, 1300 + i * 1300));
      });
      timers.push(setTimeout(function () { ledger.classList.add('done'); }, 1500 + rows.length * 1300));
    };
    if (reduce) {
      rows.forEach(function (r) { r.classList.add('on', 'ok'); });
      ledger.classList.add('done');
    } else {
      play();
      timers.push(setTimeout(function loop() { play(); setTimeout(loop, 16000); }, 16000));
    }
  }

  /* ---- generic tabs ---- */
  d.querySelectorAll('[data-tabs]').forEach(function (wrap) {
    var tabs = wrap.querySelectorAll('[role="tab"]');
    var panels = wrap.querySelectorAll('[role="tabpanel"]');
    function select(i) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { select((i + 1) % tabs.length); tabs[(i + 1) % tabs.length].focus(); }
        if (e.key === 'ArrowLeft') { select((i - 1 + tabs.length) % tabs.length); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
      });
    });
    select(0);
  });

  /* ---- service index (list + detail panel) ---- */
  d.querySelectorAll('[data-svc]').forEach(function (wrap) {
    var items = wrap.querySelectorAll('.svc-item');
    var panels = wrap.querySelectorAll('.svc-panel');
    function select(i) {
      items.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
    }
    items.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) select(i); });
      t.addEventListener('focus', function () { select(i); });
    });
    select(0);
  });

  /* ---- deck viewer ---- */
  var deck = d.querySelector('[data-deck]');
  if (deck) {
    var slides = deck.querySelectorAll('.slide');
    var idx = 0;
    var count = d.querySelector('.deck-bar .count');
    var prog = d.querySelector('.deck-prog i');
    var show = function (i) {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach(function (s, k) { s.classList.toggle('active', k === idx); });
      if (count) count.textContent = (idx + 1) + ' of ' + slides.length;
      if (prog) prog.style.width = ((idx + 1) / slides.length * 100) + '%';
    };
    show(0);
    var prev = d.querySelector('[data-prev]'), next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { show(idx - 1); });
    if (next) next.addEventListener('click', function () { show(idx + 1); });
    d.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') show(idx + 1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') show(idx - 1);
    });
    var tsx = null;
    deck.addEventListener('touchstart', function (e) { tsx = e.touches[0].clientX; }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      if (tsx === null) return;
      var dx = e.changedTouches[0].clientX - tsx;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
      tsx = null;
    });
    var fs = d.querySelector('[data-full]');
    if (fs) fs.addEventListener('click', function () {
      var el = deck.querySelector('.deck-stage');
      if (el.requestFullscreen) el.requestFullscreen();
    });
    var pr = d.querySelector('[data-print]');
    if (pr) pr.addEventListener('click', function () { window.print(); });
  }

  /* ---- insights: filter + in-page reader ---- */
  var insights = d.querySelector('[data-insights]');
  if (insights) {
    var chips = insights.querySelectorAll('.chip');
    var cards = insights.querySelectorAll('.post-grid .pcard');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        var f = c.getAttribute('data-filter');
        cards.forEach(function (card) { card.hidden = !(f === 'all' || card.getAttribute('data-cat') === f); });
      });
    });
    var posts = insights.querySelectorAll('.post');
    var route = function () {
      var id = decodeURIComponent((location.hash || '').replace('#', ''));
      var found = null;
      posts.forEach(function (p) { var on = p.id === id; p.classList.toggle('show', on); if (on) found = p; });
      d.body.classList.toggle('reading', !!found);
      if (found) { window.scrollTo(0, 0); setTimeout(function () { window.scrollTo(0, 0); }, 60); d.title = (found.getAttribute('data-title') || d.title); }
    };
    window.addEventListener('hashchange', route);
    route();
  }

  /* ---- forms: compose an email (no counts, no PHI) ---- */
  d.querySelectorAll('form[data-mailto]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var q = new URLSearchParams(window.__QS||location.search);
    var pre = q.get('interest');
    if (pre) {
      var sel = form.querySelector('select[name="interest"]');
      if (sel) Array.prototype.forEach.call(sel.options, function (o) { if (o.value === pre) sel.value = pre; });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var to = form.getAttribute('data-mailto');
      var subject = form.getAttribute('data-subject') || 'Website enquiry';
      var lines = [];
      new FormData(form).forEach(function (v, k) {
        if (!v) return;
        var lab = form.querySelector('[name="' + k + '"]');
        var name = (lab && lab.getAttribute('data-label')) || k;
        lines.push(name + ': ' + v);
      });
      var sel2 = form.querySelector('select[name="interest"],select[name="course"]');
      if (sel2 && sel2.value) subject += ' – ' + sel2.value;
      var body = lines.join('\n') + '\n\n(Sent from the website enquiry form. No patient information included.)';
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (status) status.textContent = 'Your email app should open with the message ready to send. If it does not, write to ' + to + '.';
      window.location.href = href;
    });
  });

  /* ---- year ---- */
  d.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();

/* ===== PRISCO brand: wordmark fit + interactive 3D revenue-cycle ring ===== */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- keep the gold sub-line exactly as wide as "Prisco", whichever font renders ---- */
  function fit() {
    d.querySelectorAll('svg.lk').forEach(function (s) {
      var n = s.querySelector('.n'), t = s.querySelector('.s');
      if (!n || !t || !n.getComputedTextLength) return;
      try { var w = n.getComputedTextLength(); if (w > 60) { t.setAttribute('textLength', w.toFixed(1)); t.setAttribute('lengthAdjust', 'spacing'); } } catch (e) {}
    });
  }
  fit();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);

  /* ---- revenue-cycle ring ---- */
  var NS = 'http://www.w3.org/2000/svg';
  var ICON = [
    'M9 4h6v3H9z M7 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-1 M12 11v6 M9 14h6',
    'M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5 M8 14h2 M12 14h2 M8 17h2',
    'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2.2 2.2L15.5 10',
    'M7 3h8l4 4v14H7z M15 3v4h4 M10 14.5l2 2 3.5-4.5',
    'M12 4a3.2 3.2 0 1 0 0 6.4A3.2 3.2 0 0 0 12 4z M5 20c0-4 3-6.2 7-6.2s7 2.200 7 6.200',
    'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 7.200v9.600 M14.700 9.400c-.5-.9-1.500-1.400-2.700-1.400-1.500 0-2.600.8-2.600 2 0 2.800 5.400 1.400 5.400 4.100 0 1.200-1.100 2-2.800 2-1.300 0-2.400-.6-2.900-1.500',
    'M8.500 8L4.500 12l4 4 M15.500 8l4 4-4 4 M13.200 6l-2.400 12',
    'M3 6h18v12H3z M3.500 7l8.500 6 8.500-6',
    'M12 4v16 M8 20h8 M4 7h16 M6 7l-3 7h6z M18 7l-3 7h6z',
    'M3 7h18v10H3z M12 9.500a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5z M6.500 10v4 M17.500 10v4',
    'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M12 8v5 M12 15.600v.4',
    'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8v4.500l3 2',
    'M4 20h16 M7 20v-7 M12 20V6 M17 20v-10'
  ];
  var PH = {
    f: { name: 'Front-end', a: ['#22cfcf', '#0aa5a6'], b: ['#12b9ba', '#08898a'], side: '#055f62', ink: '#fff' },
    m: { name: 'Mid-cycle', a: ['#b3191d', '#86090c'], b: ['#9c1014', '#6f0709'], side: '#420405', ink: '#fff' },
    b: { name: 'Back-end', a: ['#dccaa2', '#bfab82'], b: ['#cdb98f', '#ad9a72'], side: '#8a7a4f', ink: '#3b1220' }
  };

  function el(n, a, p) { var e = d.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  function build(root) {
    var dataEl = root.querySelector('[data-rcm-data]');
    if (!dataEl) return;
    var data = JSON.parse(dataEl.textContent), steps = data.steps, N = steps.length;
    var svg = root.querySelector('.rcm-svg'), stage = root.querySelector('.rcm-stage');
    var W = 680, H = 440, cx = 340, cy = 188, RX = 312, RIN = 172, K = 0.5, T = 30, GAP = 1.5;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = '';
    var defs = el('defs', {}, svg);
    ['f', 'm', 'b'].forEach(function (p) {
      ['a', 'b'].forEach(function (v) {
        var g = el('linearGradient', { id: 'rg-' + p + v, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        el('stop', { offset: 0, 'stop-color': PH[p][v][0] }, g); el('stop', { offset: 1, 'stop-color': PH[p][v][1] }, g);
      });
    });
    var bl = el('filter', { id: 'rg-blur', x: '-20%', y: '-40%', width: '140%', height: '180%' }, defs);
    el('feGaussianBlur', { stdDeviation: 16 }, bl);
    var fl = el('radialGradient', { id: 'rg-floor' }, defs);
    el('stop', { offset: 0, 'stop-color': '#5b1e2e', 'stop-opacity': .14 }, fl);
    el('stop', { offset: 1, 'stop-color': '#5b1e2e', 'stop-opacity': 0 }, fl);

    /* floor + shadow */
    el('ellipse', { cx: cx, cy: cy + T + 8, rx: RX + 40, ry: RX * K + 34, fill: 'url(#rg-floor)' }, svg);
    el('ellipse', { cx: cx, cy: cy + T + 22, rx: RX - 10, ry: RX * K - 20, fill: 'rgba(27,10,16,.32)', filter: 'url(#rg-blur)' }, svg);

    el('ellipse', { cx: cx, cy: cy + T * .55, rx: RIN + 4, ry: RIN * K + 3, fill: '#fbf7f4' }, svg);
    /* hub: the brand lockup sits in the hole */
    var src = d.querySelector('svg.lk');
    if (src) {
      var lk = src.cloneNode(true); lk.removeAttribute('class'); lk.setAttribute('class', 'lk lk-hub');
      lk.setAttribute('x', cx - 120); lk.setAttribute('y', cy + T * .9 - 34); lk.setAttribute('width', 240); lk.setAttribute('height', 68);
      svg.appendChild(lk);
    }

    var S = 360 / N, segs = [];
    function pt(r, a) { var t = a * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * K * Math.sin(t)]; }
    function f2(n) { return n.toFixed(1); }
    for (var i = 0; i < N; i++) {
      var a0 = -90 + i * S + GAP / 2, a1 = -90 + (i + 1) * S - GAP / 2, am = (a0 + a1) / 2;
      var o0 = pt(RX, a0), o1 = pt(RX, a1), i1 = pt(RIN, a1), i0 = pt(RIN, a0);
      var dd = 'M' + f2(o0[0]) + ' ' + f2(o0[1]) + 'A' + RX + ' ' + (RX * K) + ' 0 0 1 ' + f2(o1[0]) + ' ' + f2(o1[1]) +
        'L' + f2(i1[0]) + ' ' + f2(i1[1]) + 'A' + RIN + ' ' + (RIN * K) + ' 0 0 0 ' + f2(i0[0]) + ' ' + f2(i0[1]) + 'Z';
      var id = 'rs' + i; el('path', { id: id, d: dd }, defs);
      var mid = pt((RX + RIN) / 2, am);
      segs.push({ i: i, id: id, mx: mid[0], my: mid[1], y: mid[1] });
    }
    segs.slice().sort(function (p, q) { return p.y - q.y; }).forEach(function (s) {
      var st = steps[s.i], ph = PH[st.ph], v = s.i % 2 ? 'b' : 'a';
      var g = el('g', { 'class': 'seg', 'data-i': s.i, tabindex: 0, role: 'button', 'aria-label': 'Step ' + (s.i + 1) + ': ' + st.name }, svg);
      g.style.setProperty('--d', (s.i * 55) + 'ms');
      var side = el('g', { 'class': 'side', fill: ph.side }, g);
      for (var k = T; k >= 2; k -= 2) el('use', { href: '#' + s.id, y: k }, side);
      el('use', { 'class': 'top', href: '#' + s.id, fill: 'url(#rg-' + st.ph + v + ')', stroke: 'rgba(255,255,255,.38)', 'stroke-width': 1.2 }, g);
      var ic = el('g', { transform: 'translate(' + f2(s.mx - 12 * 1.05) + ' ' + f2(s.my - 20) + ') scale(1.05)', fill: 'none', stroke: ph.ink, 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'none' }, g);
      el('path', { d: ICON[s.i] }, ic);
      var tx = el('text', { x: f2(s.mx), y: f2(s.my + 22), 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ph.ink, 'font-family': 'Montserrat,Segoe UI,Arial,sans-serif', 'pointer-events': 'none' }, g);
      tx.textContent = (s.i + 1 < 10 ? '0' : '') + (s.i + 1);
      s.g = g;
    });

    /* panel */
    var card = root.querySelector('.rcm-card'), list = root.querySelector('.rcm-list'), cur = -1, timer = null, playing = !reduce, held = false;
    var q = function (s) { return card.querySelector(s); };
    var btns = list ? [].slice.call(list.querySelectorAll('button')) : [];
    function select(i, user) {
      i = (i + N) % N; if (i === cur) return; cur = i;
      var st = steps[i], ph = PH[st.ph];
      segs.forEach(function (s) { s.g.classList.toggle('on', s.i === i); });
      btns.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      root.setAttribute('data-phase', st.ph);
      q('[data-n]').textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
      q('[data-ph]').textContent = ph.name;
      q('[data-name]').textContent = st.name;
      var ul = q('[data-bul]'); ul.innerHTML = ''; st.bul.forEach(function (b) { var li = d.createElement('li'); li.textContent = b; ul.appendChild(li); });
      q('[data-help]').textContent = st.help;
      var tg = q('[data-tag]'); if (tg) { tg.hidden = !st.tag; tg.textContent = st.tag || ''; }
      card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
      if (user) { playing = false; sync(); }
    }
    function sync() { var p = root.querySelector('[data-play]'); if (p) { p.setAttribute('aria-pressed', playing ? 'true' : 'false'); p.textContent = playing ? 'Pause' : 'Play'; } }
    function tick() { if (playing && !held) select(cur + 1); }
    segs.forEach(function (s) {
      s.g.addEventListener('click', function () { select(s.i, true); });
      s.g.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { held = true; select(s.i); } });
      s.g.addEventListener('pointerleave', function () { held = false; });
      s.g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(s.i, true); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); segs[(s.i + 1) % N].g.focus(); select(s.i + 1, true); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); segs[(s.i - 1 + N) % N].g.focus(); select(s.i - 1, true); }
      });
    });
    btns.forEach(function (b, k) { b.addEventListener('click', function () { select(k, true); }); });
    var pv = root.querySelector('[data-prev]'), nx = root.querySelector('[data-next]'), pl = root.querySelector('[data-play]');
    if (pv) pv.addEventListener('click', function () { select(cur - 1, true); });
    if (nx) nx.addEventListener('click', function () { select(cur + 1, true); });
    if (pl) pl.addEventListener('click', function () { playing = !playing; sync(); });
    root.querySelectorAll('[data-phase-jump]').forEach(function (b) {
      b.addEventListener('click', function () { var ph = b.getAttribute('data-phase-jump'); for (var k = 0; k < N; k++) if (steps[k].ph === ph) { select(k, true); break; } });
    });

    /* depth: gentle tilt toward the pointer (mouse only) */
    if (!reduce && window.matchMedia('(hover:hover)').matches) {
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        stage.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); stage.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
      });
      stage.addEventListener('pointerleave', function () { stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg'); });
    }

    select(0); sync();
    /* entrance + autoplay only while on screen */
    var start = function () { root.classList.add('in'); setTimeout(function () { root.classList.add('ready'); }, 1500); };
    if ('IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting && !seen) { seen = true; start(); }
          if (x.isIntersecting) { if (!timer) timer = setInterval(tick, 4200); }
          else if (timer) { clearInterval(timer); timer = null; }
        });
      }, { threshold: .3 }).observe(root);
    } else { start(); timer = setInterval(tick, 4200); }
  }

  d.querySelectorAll('[data-rcm]').forEach(build);
})();


/* ===== v3 · reading progress, hero sequence, scroll reveal ===== */
(function () {
  'use strict';
  var d = document, reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (d.querySelector('[data-deck]')) d.body.classList.add('is-deck');

  /* progress bar */
  if (!reduce) {
    var bar = d.createElement('div'); bar.className = 'sprog'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
    var tick = false;
    var upd = function () {
      tick = false;
      var h = d.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0).toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* hero: stagger the first column */
  var heroCol = d.querySelector('.hero .hero-grid > div:first-child, .hero .hero-grid > :first-child');
  if (heroCol && !reduce) {
    heroCol.classList.add('hero-seq');
    [].forEach.call(heroCol.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 6)); });
    d.querySelectorAll('.hero .dcard, .hero .ledger').forEach(function (c, i) { c.style.setProperty('--i', Math.min(i, 6)); });
  }

  /* scroll reveal: below-the-fold groups only; content is visible if this never runs */
  if (reduce || !('IntersectionObserver' in window)) return;
  var sel = '.sec-head, .cols-2 > *, .cols-3 > *, .cols-4 > *, .vstep, .step, .pcard, .sol-row, .dcard, .quote-row > *, .formcard, .faq details, .kpi, .modules > *, .course, .tl > *';
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('rv-in'); io.unobserve(x.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  d.querySelectorAll(sel).forEach(function (el) {
    if (el.closest('.hero, [hidden], .rcm, .svc, [data-insights], .deck-stage, .sc, .pa')) return;
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * .92) return;
    var sibs = [].filter.call(el.parentNode.children, function (s) { return s.tagName === el.tagName; });
    el.style.setProperty('--d', Math.min(sibs.indexOf(el), 4) * 60 + 'ms');
    el.classList.add('rv'); io.observe(el);
  });
})();

window.PRISCO_KB={"fab": "Ask Prisco", "title": "Prisco Academy assistant", "sub": "Quick answers about programmes, courses and exams.", "placeholder": "e.g. Which exam should I start with?", "note": "Answers come from this website and are general. Exam fees and formats are set by AAPC and AHIMA and can change, so please confirm on their websites.", "hello": ["Hello, I can help you choose a programme and answer questions about courses, the CPC, COC and CCS exams, fees and placement support.", "Pick a topic below or type your own question."], "miss": ["I do not have a good answer to that one. Our team can answer it directly, including batch dates and fees."], "missLinks": [["Enquire to enrol", "enrol.html"], ["Email us", "mailto:info@priscomedcodesolutions.com"]], "start": ["choose", "programmes", "exams", "fees", "eligibility", "placement"], "items": [{"id": "choose", "title": "Help me choose a programme", "chip": "Help me choose", "keys": ["choose", "which programme", "which program", "which course", "recommend", "suitable", "right for me", "where do i start", "best for me", "confused"], "a": ["Happy to help. Which sounds most like you?"], "next": ["c_fresher", "c_working", "c_exam", "c_billing", "c_auditor"]}, {"id": "c_fresher", "title": "I am a fresher or new to coding", "chip": "I am new to coding", "keys": ["fresher", "beginner", "new to coding", "no experience", "start from zero", "graduate", "student", "non life science", "nonmedical"], "a": ["Start with Medical Coding and Billing, the foundation programme. It covers medical terminology, anatomy and physiology, ICD-10-CM, CPT and HCPCS, and revenue cycle basics, with trainer feedback throughout.", "You do not need a medical background. Graduates from any stream can join."], "links": [["See the programmes", "courses.html"], ["Enquire to enrol", "enrol.html"]], "next": ["exams", "online", "fees", "placement"]}, {"id": "c_working", "title": "I already work in coding or billing", "chip": "I already work in coding", "keys": ["already working", "working professional", "experienced", "cross training", "cross-training", "upskill", "switch", "already a coder"], "a": ["Ask about the cross-training track. Depending on your goal you may also look at E/M Coding, Denial Management, or CPC, COC and CCS preparation. For eligible experienced learners there is also Advanced Coding and Quality Assurance."], "links": [["See the programmes", "courses.html"], ["Enquire about cross-training", "enrol.html"]], "next": ["c_exam", "c_auditor", "fees"]}, {"id": "c_exam", "title": "I want to pass a certification exam", "chip": "I want to get certified", "keys": ["certification", "certified", "get certified", "pass the exam", "exam preparation", "exam prep", "prepare for exam"], "a": ["The CPC, COC and CCS preparation course gives you domain-based review, timed practice, error analysis and one-to-one assist support, aligned to AAPC CPC and COC and AHIMA CCS credentials.", "We are not the certifying body. AAPC and AHIMA set and award the exams."], "links": [["Exam details and fees", "courses.html"]], "next": ["exams", "cpc_ccs", "mock", "fees"]}, {"id": "c_billing", "title": "I am interested in billing and denials", "chip": "Billing and denials", "keys": ["billing", "denial", "denials", "insurance", "eob", "claim forms", "appeals", "payment side"], "a": ["Denial Management is built for billers, coders and graduates who want the payment side. You learn US insurance, read claim forms and EOBs, then find, appeal and prevent denials."], "links": [["See the programmes", "courses.html"]], "next": ["programmes", "fees", "online"]}, {"id": "c_auditor", "title": "I want to become an auditor", "chip": "Auditing and quality", "keys": ["auditor", "auditing", "quality assurance", "qa", "audit", "error classification"], "a": ["Advanced Coding and Quality Assurance is for eligible experienced learners. It focuses on coding accuracy, auditing techniques, error classification, documentation review and quality improvement."], "links": [["Enquire about eligibility", "enrol.html"]], "next": ["programmes", "eligibility", "fees"]}, {"id": "programmes", "title": "What programmes do you offer?", "chip": "All programmes", "keys": ["programmes", "programs", "programme", "courses", "course list", "what do you teach", "offer", "training", "classes", "syllabus"], "a": ["Our programmes are: Medical Coding and Billing (foundation), CPC, COC and CCS Examination Preparation, E/M Coding for IP, OP, ED, professional and facility, Denial Management and RCM, and Advanced Coding and Quality Assurance for eligible experienced learners."], "links": [["See programme details", "courses.html"]], "next": ["choose", "curriculum", "exams", "fees"]}, {"id": "curriculum", "title": "What is in the curriculum?", "chip": "Curriculum", "keys": ["curriculum", "modules", "syllabus", "topics", "covered", "what will i learn", "content", "learn"], "a": ["The guide has ten modules: healthcare and RCM foundations, medical terminology, anatomy and physiology, ICD-10-CM, CPT, HCPCS Level II and modifiers, E/M and documentation, claims, payers and denials, project chart practice with audit feedback, and mock examinations with interview readiness.", "Your trainer confirms the sequence for your batch."], "links": [["View the curriculum", "courses.html"]], "next": ["programmes", "online", "mock"]}, {"id": "exams", "title": "Tell me about the CPC, COC and CCS exams", "chip": "CPC, COC and CCS exams", "keys": ["exam", "exams", "examination", "cpc", "coc", "ccs", "aapc", "ahima", "pass mark", "questions", "duration", "format"], "a": ["CPC (AAPC): 100 multiple-choice questions, 4 hours, 70% to pass. Built around physician-office and outpatient professional coding.", "COC (AAPC): 100 multiple-choice questions, 4 hours, 70% to pass. Focused on hospital outpatient and facility coding.", "CCS (AHIMA): 107 questions (97 scored, 10 unscored), 4 hours, scaled passing score of 300 out of 400. Built around hospital and facility coding, including inpatient."], "links": [["Full exam breakdown", "courses.html"]], "next": ["exam_fees", "cpc_ccs", "mock", "c_exam"]}, {"id": "exam_fees", "title": "How much do the exams cost?", "chip": "Exam fees", "keys": ["exams", "exams cost", "exam charges", "exam price", "cost of the exam", "exam fee", "exam fees", "exam cost", "membership", "aapc fee", "ahima fee", "how much is the exam", "cost of exam"], "a": ["Exam fees are paid to AAPC or AHIMA, not to Prisco. At the time of writing: CPC and COC are $425 for one attempt or $499 for two attempts, with a mandatory AAPC membership of $229 a year ($164 for students). CCS is $299 per attempt for members and $399 for non-members, with optional AHIMA membership.", "Fees change, so please confirm on the official AAPC and AHIMA websites before you register."], "links": [["Fee tables", "courses.html"]], "next": ["exams", "cpc_ccs", "fees"]}, {"id": "cpc_ccs", "title": "Should I choose CPC or CCS?", "chip": "CPC or CCS?", "keys": ["cpc or ccs", "cpc vs ccs", "which exam", "which credential", "first credential", "difference between cpc", "outpatient or inpatient", "choose between"], "a": ["Broadly, CPC suits physician-office and outpatient professional coding, while CCS suits hospital and facility coding including inpatient records. COC sits with outpatient facility coding.", "Our short article walks through the choice, and an advisor can help based on your goals."], "links": [["Read: CPC or CCS?", "insights.html"], ["Talk to an advisor", "enrol.html"]], "next": ["exams", "exam_fees", "c_exam"]}, {"id": "mock", "title": "Do you offer mock tests and practice?", "chip": "Mock tests and practice", "keys": ["mock", "practice", "practise", "practice questions", "free tools", "icd lookup", "tracker", "readiness", "test series"], "a": ["Yes. Preparation includes mock assessments, timed practice and error analysis. On this site you can also use three free study tools: a chart practice quiz, an ICD-10-CM lookup and an exam readiness tracker.", "They are study aids. Always verify codes in the official code books or a licensed encoder."], "links": [["Open the free tools", "tools.html"]], "next": ["exams", "c_exam", "enrol"]}, {"id": "eligibility", "title": "Who can join?", "chip": "Who can join?", "keys": ["who can join", "eligibility", "eligible", "qualification", "qualifications", "age", "medical background", "life science", "non life science", "requirements", "prerequisite"], "a": ["Freshers, graduates from any background including non-life-science graduates, and working professionals. We begin from the basics and also offer a cross-training track for people already in coding or billing.", "You do not need a medical background. Terminology and anatomy are taught step by step."], "links": [["Enquire to enrol", "enrol.html"]], "next": ["choose", "online", "fees"]}, {"id": "online", "title": "Is it online or classroom?", "chip": "Online or classroom", "keys": ["online", "classroom", "offline", "mode", "batch", "batches", "timing", "schedule", "weekend", "coimbatore", "duration", "how long", "start date"], "a": ["Both. Online batches are live and trainer-led. Classroom batches run face to face in Coimbatore, with the same curriculum, trainers and feedback.", "Batch dates and duration change, so please ask for the current schedule."], "links": [["Request the current schedule", "enrol.html"]], "next": ["fees", "eligibility", "placement"]}, {"id": "fees", "title": "What are the course fees?", "chip": "Course fees and refunds", "keys": ["fee", "fees", "course fee", "price", "cost", "how much", "refund", "refunds", "payment", "emi", "installment", "discount", "scholarship"], "a": ["Course fees depend on the programme and batch, so they are shared when you enquire. Fees and refunds are described in our Terms and conditions.", "Exam fees are separate and are paid to AAPC or AHIMA."], "links": [["Request course details", "enrol.html"], ["Terms and conditions", "https://priscomedcodesolutions.com/terms"]], "next": ["exam_fees", "online", "placement"]}, {"id": "placement", "title": "Will you help me find a job?", "chip": "Placement support", "keys": ["placement", "job", "jobs", "career", "careers", "hiring", "interview", "resume", "employment", "guarantee", "salary"], "a": ["We support your career, not just your exam: resume guidance, interview preparation, technical assessments and access to our hiring network, depending on the programme.", "We cannot guarantee a job. Outcomes depend on your effort, eligibility and employer openings."], "links": [["Career support", "index.html#placement"], ["Discuss your career path", "enrol.html"]], "next": ["choose", "fees", "eligibility"]}, {"id": "body", "title": "Are you the certifying body?", "chip": "Who awards the certificate?", "keys": ["certifying body", "who awards", "certificate", "recognised", "recognized", "valid", "approved", "accredited", "affiliated"], "a": ["No. Certification exams are set and awarded by AAPC and AHIMA. Prisco Academy prepares you for them with focused review, mock tests and one-to-one support."], "links": [["Exam details", "courses.html"]], "next": ["exams", "exam_fees", "c_exam"]}, {"id": "employers", "title": "I am an employer. Can I hire your learners?", "chip": "For employers", "keys": ["employer", "hire", "hiring candidates", "trained candidates", "recruit", "corporate training", "company training"], "a": ["Yes. We can discuss your training requirements and suitable candidate profiles for coding, billing, denial management and quality roles."], "links": [["Enquire about trained candidates", "enrol.html"]], "next": ["programmes", "contact"]}, {"id": "contact", "title": "How do I contact you?", "chip": "Contact and enrol", "keys": ["contact", "email", "phone", "call", "talk", "advisor", "counsellor", "counselor", "address", "enrol", "enroll", "admission", "register", "apply"], "a": ["Send an enquiry from the enrol page, or write to info@priscomedcodesolutions.com. Our classroom is in Ganapathy, Coimbatore, Tamil Nadu, India."], "links": [["Enquire to enrol", "enrol.html"], ["Email us", "mailto:info@priscomedcodesolutions.com"]], "next": ["fees", "online", "choose"]}, {"id": "hello", "title": "Hello", "keys": ["hello", "hi", "hey", "good morning", "good afternoon", "thanks", "thank you"], "a": ["Hello. Would you like help choosing a programme, or do you have a question about exams or fees?"], "next": ["choose", "exams", "fees", "placement"]}]};

/* ===== v3 · FAQ assistant (rule-based, runs entirely in the browser; nothing is sent anywhere) ===== */
(function () {
  'use strict';
  var KB = window.PRISCO_KB, d = document;
  if (!KB || !d.body) return;
  var byId = {}; KB.items.forEach(function (it) { byId[it.id] = it; });

  function h(tag, attrs, kids) {
    var e = d.createElement(tag);
    for (var k in (attrs || {})) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.500l1.500-4.600A8 8 0 1 1 21 12z"/><path d="M8.500 11h7M8.500 14h4"/></svg>';

  var root = h('div', { 'class': 'pa' });
  var fab = h('button', { 'class': 'pa-fab', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'pa-panel' });
  fab.innerHTML = ICON + '<span>' + KB.fab + '</span>';
  var panel = h('section', { 'class': 'pa-panel', id: 'pa-panel', role: 'dialog', 'aria-label': KB.title });
  var close = h('button', { 'class': 'pa-x', type: 'button', 'aria-label': 'Close assistant', text: '×' });
  var head = h('div', { 'class': 'pa-head' }, [h('div', {}, [h('b', { text: KB.title }), h('small', { text: KB.sub })]), close]);
  var log = h('div', { 'class': 'pa-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation' });
  var chips = h('div', { 'class': 'pa-chips', role: 'group', 'aria-label': 'Suggested questions' });
  var input = h('input', { id: 'pa-q', type: 'text', autocomplete: 'off', maxlength: '200', placeholder: KB.placeholder });
  var form = h('form', { 'class': 'pa-form' }, [
    h('label', { 'for': 'pa-q', text: 'Your question' }),
    h('div', { 'class': 'row' }, [input, h('button', { type: 'submit', text: 'Send question' })])
  ]);
  var note = h('p', { 'class': 'pa-note', text: KB.note });
  [head, log, chips, form, note].forEach(function (n) { panel.appendChild(n); });
  root.appendChild(panel); root.appendChild(fab); d.body.appendChild(root);

  function say(who, paras, links) {
    var m = h('div', { 'class': 'pa-msg ' + who });
    (Array.isArray(paras) ? paras : [paras]).forEach(function (p) { m.appendChild(h('p', { text: p })); });
    if (links && links.length) {
      var l = h('div', { 'class': 'pa-links' });
      links.forEach(function (x) { var a = h('a', { href: x[1], text: x[0] }); if (/^https?:/.test(x[1])) { a.target = '_blank'; a.rel = 'noopener'; } l.appendChild(a); });
      m.appendChild(l);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function setChips(ids) {
    chips.innerHTML = '';
    ids.forEach(function (id) {
      var it = byId[id]; if (!it) return;
      var b = h('button', { type: 'button', text: it.chip || it.title });
      b.addEventListener('click', function () { say('me', it.title); answer(it); });
      chips.appendChild(b);
    });
  }
  function answer(it) { say('bot', it.a, it.links); setChips((it.next && it.next.length ? it.next : KB.start).slice(0, 6)); }

  function norm(s) { return ' ' + s.toLowerCase().replace(/[^a-z0-9$\/ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function find(q) {
    var n = norm(q), best = null, bs = 0;
    KB.items.forEach(function (it) {
      var s = 0;
      (it.keys || []).forEach(function (k) {
        var kk = norm(k);
        if (n.indexOf(kk) > -1) { var w = kk.trim().split(' ').length; s += w * w + 1; }
      });
      if (s > bs) { bs = s; best = it; }
    });
    return bs >= 2 ? best : null;
  }
  function ask(q) {
    q = q.trim(); if (!q) return;
    say('me', q);
    var it = find(q);
    if (it) answer(it);
    else { say('bot', KB.miss, KB.missLinks); setChips(KB.start); }
  }

  var opened = false;
  function open() {
    root.classList.add('open'); fab.setAttribute('aria-expanded', 'true');
    if (!opened) { opened = true; say('bot', KB.hello); setChips(KB.start); }
    setTimeout(function () { input.focus(); }, 60);
  }
  function shut(back) { root.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); if (back) fab.focus(); }
  fab.addEventListener('click', function () { root.classList.contains('open') ? shut(true) : open(); });
  close.addEventListener('click', function () { shut(true); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) shut(true); });
  /* anything on the page can open it: <a href="#assistant"> or [data-assistant] */
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-assistant], a[href="#assistant"]');
    if (t) { e.preventDefault(); open(); }
  });
})();
