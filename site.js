(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme');
  var col = { a: '64,84,150', b: '118,72,110', c: '52,104,112', alpha: 0.32, star: 1 };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var c = document.getElementById('haze');
  var ctx = c ? c.getContext('2d') : null;
  var W = 0, H = 0, dpr = 1;

  function readColors() {
    var s = getComputedStyle(root);
    col.a = s.getPropertyValue('--haze-a').trim() || col.a;
    col.b = s.getPropertyValue('--haze-b').trim() || col.b;
    col.c = s.getPropertyValue('--haze-c').trim() || col.c;
    col.alpha = parseFloat(s.getPropertyValue('--haze-alpha')) || 0.3;
    var st = parseFloat(s.getPropertyValue('--star'));
    col.star = isNaN(st) ? 1 : st;
    if (reduce) draw(0);
  }

  function setTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (save) { try { localStorage.setItem('plimm-theme', t); } catch (e) {} }
    readColors();
  }

  var stored = null;
  try { stored = localStorage.getItem('plimm-theme'); } catch (e) {}
  if (btn) btn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true);
  });

  var blobs = [
    { k: 'a', x: 0.15, y: 0.2, r: 0.55, sx: 0.00007, sy: 0.00005, p: 0 },
    { k: 'b', x: 0.85, y: 0.35, r: 0.5, sx: 0.00006, sy: 0.00008, p: 2 },
    { k: 'c', x: 0.4, y: 0.85, r: 0.6, sx: 0.00005, sy: 0.00006, p: 4 },
    { k: 'a', x: 0.75, y: 0.9, r: 0.45, sx: 0.00008, sy: 0.00004, p: 1 }
  ];
  var stars = [];
  for (var i = 0; i < 150; i++) {
    stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.2, t: Math.random() * 6.28, s: 0.0004 + Math.random() * 0.0012 });
  }

  function resize() {
    if (!c) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) draw(0);
  }

  function draw(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var m = Math.max(W, H);
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var x = (b.x + Math.sin(t * b.sx + b.p) * 0.12) * W;
      var y = (b.y + Math.cos(t * b.sy + b.p) * 0.1) * H;
      var g = ctx.createRadialGradient(x, y, 0, x, y, b.r * m);
      g.addColorStop(0, 'rgba(' + col[b.k] + ',' + col.alpha + ')');
      g.addColorStop(1, 'rgba(' + col[b.k] + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    if (col.star > 0) {
      for (var j = 0; j < stars.length; j++) {
        var s = stars[j];
        var a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.t))) * col.star * 0.8;
        ctx.fillStyle = 'rgba(225,230,255,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.2832); ctx.fill();
      }
    }
  }
  function loop(t) { draw(t); requestAnimationFrame(loop); }

  window.addEventListener('resize', resize);
  resize();
  setTheme(stored === 'light' ? 'light' : 'dark', false);
  if (!reduce && ctx) requestAnimationFrame(loop);

  /* copy email */
  var copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', function () {
    var addr = 'plimm98000@gmail.com';
    function reset(txt) { copy.textContent = txt; setTimeout(function () { copy.textContent = 'copy'; }, 1800); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById('email'));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); reset('selected');
    }
    try { navigator.clipboard.writeText(addr).then(function () { reset('copied'); }, fallback); } catch (e) { fallback(); }
  });

  /* generic toggles: <div class="toggle" data-group="x"> buttons with data-show="id" */
  document.querySelectorAll('.toggle').forEach(function (tg) {
    var bs = tg.querySelectorAll('button[data-show]');
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        bs.forEach(function (o) {
          o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
          var p = document.getElementById(o.getAttribute('data-show'));
          if (p) p.hidden = o !== b;
        });
      });
    });
  });
})();
