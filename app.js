/* সমাধান (Shomadhan) — app logic. No dependencies. */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var FS_STEPS = [0.9, 1, 1.15, 1.3, 1.5];
  var FS_LABELS = ['ছোট', 'স্বাভাবিক', 'বড়', 'আরও বড়', 'সবচেয়ে বড়'];

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var bn = function (n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); };

  var mem = {};
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('shomadhan.' + k); return v == null ? d : JSON.parse(v); }
      catch (e) { return k in mem ? mem[k] : d; }
    },
    set: function (k, v) {
      mem[k] = v;
      try { localStorage.setItem('shomadhan.' + k, JSON.stringify(v)); } catch (e) { /* memory fallback */ }
    }
  };

  var ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14c2.8.2 4.5 2.1 4.5 5"/>',
    bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M9 12h6M9 16h6"/>',
    idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.8-2.3 3-2.3s2.4.7 3 2.3M14 10h4M14 14h4"/>',
    book: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M9 17h6"/>',
    baby: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>',
    wifi: '<path d="M2.5 9a14 14 0 0119 0M5.5 12.5a9.5 9.5 0 0113 0M8.5 16a5 5 0 017 0"/><circle cx="12" cy="19" r="1"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
    building: '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    msg: '<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>'
  };
  var ic = function (n, c) {
    return '<svg class="ic ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || '') + '</svg>';
  };

  /* ---------- state ---------- */
  var DATA = null, CATS = {}, GUIDES = {}, INDEX = [];
  var saved = store.get('saved', []);
  if (!Array.isArray(saved)) saved = [];
  var fsIdx = store.get('fs', 1);
  if (typeof fsIdx !== 'number' || fsIdx < 0 || fsIdx >= FS_STEPS.length) fsIdx = 1;
  var cur = 'home', stack = [], scrolls = {};
  var sq = '', sCat = 'all';
  var pv = { cat: 'all', dist: 'all', q: '' };
  var deferredInstall = null;

  var view = $('#view'), topbar = $('#topbar'), tabs = $('#tabs');

  function applyFs() { document.documentElement.style.setProperty('--fs', FS_STEPS[fsIdx]); }
  function setFs(i) { fsIdx = Math.max(0, Math.min(FS_STEPS.length - 1, i)); store.set('fs', fsIdx); applyFs(); }
  applyFs();

  var isSaved = function (id) { return saved.indexOf(id) > -1; };
  function toggleSave(id) {
    var i = saved.indexOf(id);
    if (i > -1) saved.splice(i, 1); else saved.push(id);
    store.set('saved', saved);
    toast(i > -1 ? 'সংরক্ষণ থেকে সরানো হয়েছে' : 'সংরক্ষিত হয়েছে');
  }

  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- search index ---------- */
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[‌‍]/g, '')
      .replace(/[০-৯]/g, function (d) { return '০১২৩৪৫৬৭৮৯'.indexOf(d); })
      .replace(/[.,;:!?()\[\]{}"'‘’“”।\-–—\/]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function buildIndex() {
    INDEX = DATA.guides.map(function (g) {
      var body = [];
      (g.steps || []).forEach(function (s) { body.push(s[0], s[1]); });
      (g.faq || []).forEach(function (f) { body.push(f[0], f[1]); });
      return {
        g: g, t: norm(g.title), k: norm((g.keywords || []).join(' ')),
        s: norm(g.summary), b: norm(body.join(' ') + ' ' + (g.needs || []).join(' '))
      };
    });
  }
  function search(q) {
    var toks = norm(q).split(' ').filter(Boolean);
    if (!toks.length) return [];
    var out = [];
    INDEX.forEach(function (e) {
      var score = 0, hit = 0;
      toks.forEach(function (t) {
        var s = 0;
        if (e.t.indexOf(t) > -1) s += 6;
        if (e.k.indexOf(t) > -1) s += 4;
        if (e.s.indexOf(t) > -1) s += 2;
        if (e.b.indexOf(t) > -1) s += 1;
        if (s) hit++;
        score += s;
      });
      if (hit) out.push({ g: e.g, score: score + (hit === toks.length ? 10 : 0) });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.map(function (x) { return x.g; });
  }

  /* ---------- components ---------- */
  function gcard(g) {
    var on = isSaved(g.id);
    return '<article class="card gcard">' +
      '<button class="gmain" data-go="guide/' + g.id + '">' +
      '<span class="tag">' + esc(CATS[g.cat] ? CATS[g.cat].name : '') + '</span>' +
      '<strong>' + esc(g.title) + '</strong>' +
      '<span class="sum">' + esc(g.summary) + '</span></button>' +
      '<button class="bm ' + (on ? 'on' : '') + '" data-act="bm" data-id="' + g.id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'সংরক্ষণ থেকে সরান: ' : 'সংরক্ষণ করুন: ') + esc(g.title) + '">' + ic('bookmark') + '</button>' +
      '</article>';
  }
  function crow(c, extra) {
    return '<button class="listrow" data-go="cat/' + c.id + '"><span class="badge ' + (c.gov ? '' : 'green') + '">' + ic(c.icon) + '</span>' +
      '<span class="txt"><b>' + esc(c.name) + '</b><span class="sub">' + esc(c.desc) + '</span></span>' + (extra || '') + ic('chev') + '</button>';
  }
  function emptyState(icon, title, text, btn) {
    return '<div class="empty"><span class="badge">' + ic(icon) + '</span><h2>' + esc(title) + '</h2><p>' + esc(text) + '</p>' + (btn || '') + '</div>';
  }
  function banner(kind, icon, html) { return '<div class="banner ' + kind + '">' + ic(icon) + '<div>' + html + '</div></div>'; }

  /* ---------- views ---------- */
  var TABS = [
    ['home', 'হোম', 'home'], ['categories', 'বিভাগ', 'grid'], ['providers', 'সেবাদাতা', 'users'],
    ['saved', 'সংরক্ষিত', 'bookmark'], ['settings', 'সেটিংস', 'settings']
  ];

  function head(o) {
    // o.brand | o.title ; o.back parent route ; o.right html
    var h = '<div class="col g" style="padding-inline:0">';
    if (o.brand) {
      h += '<div class="brand"><span class="logo" aria-hidden="true">স</span><div><small>স্বাগতম</small><b>সমাধান</b></div></div>';
    } else {
      h += '<button class="iconbtn" data-act="back" data-parent="' + (o.back || 'home') + '" aria-label="পেছনে যান">' + ic('back') + '</button><h1>' + esc(o.title) + '</h1>';
    }
    return h + (o.right || '') + '</div>';
  }

  function vHome() {
    var gov = DATA.categories.filter(function (c) { return c.gov; });
    var pop = DATA.guides.filter(function (g) { return g.popular; }).slice(0, 6);
    var rec = DATA.guides.filter(function (g) { return g.recommended; });
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'সুপ্রভাত' : hour < 17 ? 'শুভ দুপুর' : hour < 20 ? 'শুভ সন্ধ্যা' : 'শুভ রাত্রি';
    var h = '<div class="stack">';
    h += '<p class="muted">' + greet + '! আজ কোন সমস্যার সমাধান খুঁজছেন?</p>';
    h += '<button class="searchbar" data-go="search" aria-label="সমস্যা খুঁজুন">' + ic('search') + '<span>আপনার সমস্যাটি লিখুন</span></button>';
    h += '<div class="grid2">' +
      qtile('gov', 'building', 'সরকারি সেবা', 'জন্মনিবন্ধন, NID, পাসপোর্ট') +
      qtile('categories', 'bulb', 'সমস্যা সমাধান', 'ফোন, নেট, অ্যাকাউন্ট') +
      qtile('providers', 'users', 'সেবাদাতা খোঁজা', 'নমুনা তালিকা') +
      qtile('saved', 'bookmark', 'সংরক্ষিত গাইড', saved.length ? bn(saved.length) + 'টি সংরক্ষিত' : 'পরে পড়ার জন্য') + '</div>';
    if (deferredInstall) {
      h += banner('info', 'download', '<b>ফোনে ইনস্টল করুন</b><br>হোম স্ক্রিন থেকে অ্যাপের মতো খুলুন, অফলাইনেও চলবে।<br><button class="btn green" style="margin-top:.5rem" data-act="install">ইনস্টল করুন</button>');
    }
    h += '<div class="sec-h"><h2>সরকারি সেবা ও কাগজপত্র</h2><button class="chip" data-go="gov">সব দেখুন</button></div>';
    h += '<div class="stack" style="gap:.6rem">' + gov.map(function (c) { return crow(c); }).join('') + '</div>';
    h += '<div class="sec-h"><h2>জনপ্রিয় গাইড</h2></div>';
    h += '<div class="stack" style="gap:.6rem">' + pop.map(gcard).join('') + '</div>';
    if (rec.length) {
      h += '<div class="sec-h"><h2>সুপারিশকৃত গাইড</h2></div><div class="stack" style="gap:.6rem">' + rec.map(gcard).join('') + '</div>';
    }
    h += banner('info', 'info', 'সমাধান একটি স্বাধীন তথ্য অ্যাপ, সরকারি নয়। <button class="chip" data-go="disclaimer" style="min-height:2rem">দাবিত্যাগ</button>');
    return { html: h + '</div>', top: head({ brand: 1, right: '<button class="iconbtn" data-go="search" aria-label="খুঁজুন">' + ic('search') + '</button>' }) };
  }
  function qtile(route, icon, t, sub) {
    return '<button class="tile" data-go="' + route + '"><span class="badge">' + ic(icon) + '</span><b>' + t + '</b><span class="sub">' + sub + '</span></button>';
  }

  function vCategories() {
    var list = DATA.categories.slice();
    var h = '<div class="stack"><p class="muted">যে বিষয়ে সাহায্য দরকার তা বেছে নিন।</p><div class="stack" style="gap:.6rem">' +
      list.map(function (c) { return crow(c); }).join('') +
      '<button class="listrow" data-go="providers"><span class="badge green">' + ic('users') + '</span><span class="txt"><b>সেবাদাতা</b><span class="sub">ইলেকট্রিশিয়ান, প্লাম্বার, টেকনিশিয়ান (নমুনা তালিকা)</span></span>' + ic('chev') + '</button>' +
      '</div></div>';
    return { html: h, top: head({ title: 'বিভাগ' }) };
  }

  function vGov() {
    var gov = DATA.categories.filter(function (c) { return c.gov; });
    var h = '<div class="stack">' +
      banner('warn', 'alert', 'এই গাইডগুলো অনলাইন সূত্র থেকে সংকলিত খসড়া। ফি, কাগজ ও নিয়ম বদলাতে পারে, তাই অফিসিয়াল সাইটে নিশ্চিত করুন। আমরা সরকারি সংস্থা নই।') +
      '<div class="stack" style="gap:.6rem">' + gov.map(function (c) {
        var n = DATA.guides.filter(function (g) { return g.cat === c.id; }).length;
        return crow(c, n ? '<span class="tag">' + bn(n) + 'টি</span>' : '');
      }).join('') + '</div></div>';
    return { html: h, top: head({ title: 'সরকারি সেবা', back: 'home' }) };
  }

  function vCat(id) {
    var c = CATS[id];
    if (!c) return vNotFound('categories');
    var list = DATA.guides.filter(function (g) { return g.cat === id; });
    var h = '<div class="stack"><p class="muted">' + esc(c.desc) + '</p>';
    if (c.gov && list.length) h += banner('warn', 'alert', 'অনলাইন সূত্র থেকে সংকলিত খসড়া। অফিসিয়াল সাইটে নিশ্চিত করুন।');
    if (id === 'nid') {
      h += '<div class="stack" style="gap:.6rem">' + list.map(function (g, i) {
        return '<button class="listrow" data-go="guide/' + g.id + '"><span class="badge">' + bn(i + 1) + '</span><span class="txt"><b>' + esc(g.title) + '</b><span class="sub">' + esc(g.summary) + '</span></span>' + ic('chev') + '</button>';
      }).join('') + '</div>';
    } else if (list.length) {
      h += '<div class="stack" style="gap:.6rem">' + list.map(gcard).join('') + '</div>';
    } else {
      h += emptyState('clock', 'শিগগিরই আসছে', 'এই বিভাগে যাচাই করা সেবার গাইড এখনো যোগ হয়নি। তাড়াহুড়ো করে ভুল তথ্য দেওয়ার চেয়ে আমরা যাচাই করে যোগ করব।', '<button class="btn secondary" data-go="gov">সরকারি সেবায় ফিরুন</button>');
    }
    return { html: h + '</div>', top: head({ title: c.name, back: c.gov ? 'gov' : 'categories' }) };
  }

  function vGuide(id) {
    var g = GUIDES[id];
    if (!g) return vNotFound('home');
    var c = CATS[g.cat], on = isSaved(g.id);
    var h = '<div class="stack">';
    h += '<div class="title stack" style="gap:.5rem"><span class="tag">' + esc(c ? c.name : '') + '</span>' +
      (g.gov ? '<span class="tag warn">অফিসিয়াল সাইটে নিশ্চিত করুন</span>' : '') +
      '<h1>' + esc(g.title) + '</h1><p class="muted">' + esc(g.summary) + '</p></div>';
    h += '<div class="row">' +
      '<button class="btn ' + (on ? 'green' : 'secondary') + '" data-act="bm" data-id="' + g.id + '" aria-pressed="' + on + '">' + ic('bookmark', on ? 'fill' : '') + (on ? 'সংরক্ষিত' : 'সংরক্ষণ') + '</button>' +
      '<button class="btn secondary" data-act="share" data-id="' + g.id + '">' + ic('share') + 'শেয়ার</button></div>';
    h += '<div class="fsbar" role="group" aria-label="লেখার আকার"><span class="muted small">লেখার আকার:</span>' +
      '<button class="btn secondary" data-act="fs-" aria-label="লেখা ছোট করুন"' + (fsIdx === 0 ? ' disabled' : '') + '>অ−</button>' +
      '<button class="btn secondary" data-act="fs+" aria-label="লেখা বড় করুন"' + (fsIdx === FS_STEPS.length - 1 ? ' disabled' : '') + '>অ+</button>' +
      '<span class="muted small">' + FS_LABELS[fsIdx] + '</span></div>';
    if (g.needs && g.needs.length) {
      h += '<div class="card"><h2 style="font-size:1.1rem;margin-bottom:.6rem">কী কী লাগবে</h2><ul class="needs">' +
        g.needs.map(function (n) { return '<li>' + ic('check') + '<span>' + esc(n) + '</span></li>'; }).join('') + '</ul></div>';
    }
    if (g.steps && g.steps.length) {
      h += '<div class="sec-h"><h2>ধাপে ধাপে</h2><span class="muted small">ধাপ শেষ হলে ছুঁয়ে চিহ্ন দিন</span></div><div class="stack" style="gap:.6rem">' +
        g.steps.map(function (s, i) {
          return '<button class="step" data-act="step" aria-pressed="false"><span class="n">' + bn(i + 1) + '</span><span><span class="lbl">ধাপ ' + bn(i + 1) + '</span><b>' + esc(s[0]) + '</b><p>' + esc(s[1]) + '</p></span></button>';
        }).join('') + '</div>';
    }
    if (g.faq && g.faq.length) {
      h += '<div class="faq stack" style="gap:.6rem">' + g.faq.map(function (f) {
        return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>';
      }).join('') + '</div>';
    }
    if (g.warnings && g.warnings.length) {
      h += banner('warn', 'alert', '<b>সতর্কতা</b><ul>' + g.warnings.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>');
    }
    if (g.links && g.links.length) {
      h += '<div class="sec-h"><h2>অফিসিয়াল লিংক</h2><span class="muted small">ইন্টারনেট লাগবে</span></div><div class="stack" style="gap:.6rem">' +
        g.links.map(function (k) {
          var r = DATA.resources[k]; if (!r) return '';
          return '<a class="btn primary link-btn" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer"><span>' + esc(r.name) + '</span>' + ic('ext') + '</a>';
        }).join('') + '</div>';
    }
    if (g.gov) {
      h += '<p class="muted small">খসড়া: ' + esc(DATA.drafted) + ' তারিখে অনলাইন সূত্র থেকে সংকলিত। কোনো মানবিক পর্যালোচনা হয়নি, তাই “সর্বশেষ যাচাই” তারিখ দেওয়া হয়নি।</p>';
    }
    var rel = (g.related || []).map(function (r) { return GUIDES[r]; }).filter(Boolean);
    if (rel.length) h += '<div class="sec-h"><h2>সংশ্লিষ্ট গাইড</h2></div><div class="stack" style="gap:.6rem">' + rel.map(gcard).join('') + '</div>';
    return { html: h + '</div>', top: head({ title: c ? c.name : 'গাইড', back: g.cat === 'daily' ? 'categories' : 'cat/' + g.cat }) };
  }

  function vSearch() {
    var h = '<div class="stack"><div class="field">' + ic('search') +
      '<input id="q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="আপনার সমস্যাটি লিখুন" aria-label="সমস্যা খুঁজুন" value="' + esc(sq) + '">' +
      '<button class="iconbtn" data-act="clearq" aria-label="লেখা মুছুন" id="clearq"' + (sq ? '' : ' hidden') + '>' + ic('x') + '</button></div>' +
      '<div id="sres" class="stack"></div></div>';
    return { html: h, top: head({ title: 'খুঁজুন', back: 'home' }), after: function () { runSearch(); var q = $('#q'); if (q && !sq) q.focus(); } };
  }
  function runSearch() {
    var box = $('#sres'); if (!box) return;
    var clr = $('#clearq'); if (clr) clr.hidden = !sq;
    if (!norm(sq)) {
      box.innerHTML = '<p class="muted">কয়েকটি শব্দ লিখুন, যেমন:</p><div class="chips">' +
        ['জন্মনিবন্ধন', 'NID', 'পাসপোর্ট', 'ফোন স্লো', 'ওয়াইফাই', 'OTP'].map(function (w) { return '<button class="chip" data-act="qword" data-w="' + w + '">' + w + '</button>'; }).join('') + '</div>';
      return;
    }
    var all = search(sq);
    if (!all.length) {
      box.innerHTML = emptyState('search', 'কিছু পাওয়া যায়নি', '“' + sq + '” নিয়ে কোনো গাইড নেই। অন্য শব্দ বা ছোট শব্দ দিয়ে চেষ্টা করুন।');
      return;
    }
    var catIds = [], counts = {};
    all.forEach(function (g) { if (!counts[g.cat]) { counts[g.cat] = 0; catIds.push(g.cat); } counts[g.cat]++; });
    if (sCat !== 'all' && !counts[sCat]) sCat = 'all';
    var list = sCat === 'all' ? all : all.filter(function (g) { return g.cat === sCat; });
    var chips = '';
    if (catIds.length > 1) {
      chips = '<div class="chips"><button class="chip ' + (sCat === 'all' ? 'on' : '') + '" data-act="scat" data-c="all">সব (' + bn(all.length) + ')</button>' +
        catIds.map(function (c) { return '<button class="chip ' + (sCat === c ? 'on' : '') + '" data-act="scat" data-c="' + c + '">' + esc(CATS[c].name) + ' (' + bn(counts[c]) + ')</button>'; }).join('') + '</div>';
    }
    box.innerHTML = chips + '<p class="muted small">' + bn(list.length) + 'টি ফল</p>' + '<div class="stack" style="gap:.6rem">' + list.map(gcard).join('') + '</div>';
  }

  function vProviders() {
    var h = '<div class="stack">' +
      banner('warn', 'alert', '<b>ডেমো ডেটা।</b> নিচের প্রোফাইলগুলো শুধু লেআউট দেখানোর জন্য বানানো নমুনা। এরা বাস্তব বা যাচাইকৃত সেবাদাতা নয়, এবং কোনো যোগাযোগ তথ্য দেওয়া হয়নি।') +
      '<div class="chips" id="pcats"></div>' +
      '<select id="dist" aria-label="জেলা বেছে নিন"><option value="all">সব জেলা</option>' +
      DATA.providers.districts.map(function (d) { return '<option value="' + d + '"' + (pv.dist === d ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select>' +
      '<div class="field">' + ic('search') + '<input id="pq" type="search" autocomplete="off" placeholder="নাম বা এলাকা লিখুন" aria-label="সেবাদাতা খুঁজুন" value="' + esc(pv.q) + '"></div>' +
      '<div id="plist" class="stack" style="gap:.6rem"></div>' +
      '<p class="muted small">ভবিষ্যতে: যাচাইকৃত প্রোফাইল, রিভিউ ও নিবন্ধন। এগুলো এখনো চালু হয়নি।</p></div>';
    return { html: h, top: head({ title: 'সেবাদাতা' }), after: updateProviders };
  }
  function updateProviders() {
    var pc = $('#pcats'); if (!pc) return;
    var cats = [{ id: 'all', name: 'সব' }].concat(DATA.providers.categories);
    pc.innerHTML = cats.map(function (c) { return '<button class="chip ' + (pv.cat === c.id ? 'on' : '') + '" data-act="pcat" data-c="' + c.id + '">' + esc(c.name) + '</button>'; }).join('');
    var q = norm(pv.q);
    var list = DATA.providers.items.filter(function (p) {
      return (pv.cat === 'all' || p.cat === pv.cat) && (pv.dist === 'all' || p.district === pv.dist) &&
        (!q || norm(p.name + ' ' + p.area + ' ' + p.district).indexOf(q) > -1);
    });
    var names = {}; DATA.providers.categories.forEach(function (c) { names[c.id] = c.name; });
    $('#plist').innerHTML = list.length ? list.map(function (p) {
      return '<article class="card stack" style="gap:.35rem"><div class="row" style="gap:.4rem"><span class="tag demo">ডেমো</span><span class="tag">' + esc(names[p.cat]) + '</span></div>' +
        '<b>' + esc(p.name) + '</b><span class="muted small">' + esc(p.district) + ' · ' + esc(p.area) + '</span><p class="small">' + esc(p.desc) + '</p>' +
        '<p class="muted small">যাচাইকৃত যোগাযোগ তথ্য নেই</p></article>';
    }).join('') : emptyState('users', 'কোনো সেবাদাতা নেই', 'এই বাছাইয়ে কোনো নমুনা প্রোফাইল নেই। জেলা বা বিভাগ বদলে দেখুন।');
  }

  function vSaved() {
    var list = saved.map(function (id) { return GUIDES[id]; }).filter(Boolean);
    var h = list.length
      ? '<div class="stack"><p class="muted">' + bn(list.length) + 'টি গাইড সংরক্ষিত আছে। এগুলো আপনার ফোনেই থাকে।</p><div class="stack" style="gap:.6rem">' + list.map(gcard).join('') + '</div></div>'
      : emptyState('bookmark', 'কোনো গাইড সংরক্ষিত নেই', 'যে গাইড পরে পড়তে চান, তার পাশের বুকমার্ক চিহ্নে চাপুন।', '<button class="btn primary" data-go="categories">গাইড খুঁজুন</button>');
    return { html: h, top: head({ title: 'সংরক্ষিত' }) };
  }

  function vSettings() {
    var ctl = navigator.serviceWorker && navigator.serviceWorker.controller;
    var h = '<div class="stack">' +
      '<div class="card stack" style="gap:.6rem"><h2 style="font-size:1.1rem">লেখার আকার</h2><div class="chips" role="group" aria-label="লেখার আকার">' +
      FS_LABELS.map(function (l, i) { return '<button class="chip ' + (i === fsIdx ? 'on' : '') + '" data-act="fsset" data-i="' + i + '" aria-pressed="' + (i === fsIdx) + '">' + l + '</button>'; }).join('') +
      '</div><p>এই লেখাটি দেখে আকার ঠিক করুন: সমস্যার সহজ সমাধান।</p></div>' +
      '<div class="card stack" style="gap:.5rem"><h2 style="font-size:1.1rem">অফলাইন ও ইনস্টল</h2>' +
      '<p>' + (ctl ? '<span class="tag green">অফলাইনের জন্য প্রস্তুত</span> গাইডগুলো ইন্টারনেট ছাড়াই পড়া যাবে।' : '<span class="tag warn">এখনো প্রস্তুত নয়</span> একবার ইন্টারনেটে পুরো অ্যাপ খুলে রাখলে পরে অফলাইনে চলবে।') + '</p>' +
      (deferredInstall ? '<button class="btn green" data-act="install">ফোনে ইনস্টল করুন</button>' : '<p class="muted small">ইনস্টল করতে Chrome মেনু (⋮) থেকে “হোম স্ক্রিনে যোগ করুন” বা “Install app” বেছে নিন।</p>') +
      '<p class="muted small">অফিসিয়াল ওয়েবসাইট লিংক খুলতে সবসময় ইন্টারনেট লাগবে।</p></div>' +
      '<div class="stack" style="gap:.6rem">' +
      sl('about', 'info', 'অ্যাপ সম্পর্কে') + sl('privacy', 'lock', 'গোপনীয়তা নীতি') + sl('disclaimer', 'alert', 'দাবিত্যাগ') + '</div>' +
      '<div class="card stack" style="gap:.5rem"><h2 style="font-size:1.1rem">ভাষা</h2><p>বাংলা (বাংলাদেশ)। অন্য ভাষা এখনো যোগ হয়নি।</p></div>' +
      '<button class="btn secondary block" data-act="clearsaved"' + (saved.length ? '' : ' disabled') + '>সব সংরক্ষিত গাইড মুছুন</button>' +
      '<p class="muted small" style="text-align:center">সমাধান · সংস্করণ ' + bn(VERSION) + '</p></div>';
    return { html: h, top: head({ title: 'সেটিংস' }) };
  }
  function sl(r, i, t) { return '<button class="listrow" data-go="' + r + '"><span class="badge">' + ic(i) + '</span><span class="txt"><b>' + t + '</b></span>' + ic('chev') + '</button>'; }

  function vPage(kind) {
    var T = {
      about: ['অ্যাপ সম্পর্কে', '<h2>সমাধান কী</h2><p>সমাধান বাংলাদেশের মানুষের জন্য বাংলা ভাষার একটি তথ্য ও গাইড অ্যাপ। এখানে সরকারি সেবার সাধারণ ধাপ, ফোন ও ইন্টারনেটের সমস্যার সমাধান এবং অফিসিয়াল ওয়েবসাইটের লিংক পাবেন।</p><h2>আমরা কারা নই</h2><p>সমাধান একটি স্বাধীন অ্যাপ। এটি কোনো সরকারি সংস্থা নয় এবং সরকারের অনুমোদিত নয়। সরকারি সেবার জন্য সবসময় অফিসিয়াল সাইট ও অফিসের তথ্যই চূড়ান্ত।</p><h2>এখন যা আছে</h2><ul><li>স্থানীয় গাইড ও দ্রুত সার্চ</li><li>সংরক্ষিত গাইড (আপনার ফোনে)</li><li>সেবাদাতার নমুনা তালিকা (ডেমো)</li></ul><h2>এখনো নেই</h2><ul><li>নোটিফিকেশন, রিভিউ, প্রোফাইল নিবন্ধন</li><li>যাচাইকৃত সেবাদাতা</li></ul>'],
      privacy: ['গোপনীয়তা নীতি', '<h2>আমরা কী সংগ্রহ করি</h2><p>কিছুই না। অ্যাপে লগইন বা নিবন্ধন নেই এবং আপনার তথ্য কোনো সার্ভারে পাঠানো হয় না।</p><h2>ফোনে যা থাকে</h2><ul><li>সংরক্ষিত গাইডের তালিকা</li><li>লেখার আকারের পছন্দ</li></ul><p>এগুলো শুধু আপনার ব্রাউজারে সংরক্ষিত থাকে এবং ব্রাউজারের ডেটা মুছলে চলে যায়।</p><h2>আমরা কখনো চাই না</h2><p>NID নম্বর, পাসওয়ার্ড, OTP, কনট্যাক্ট বা সঠিক অবস্থান। কেউ এসব সমাধানের নামে চাইলে দেবেন না।</p><h2>বাইরের লিংক</h2><p>অফিসিয়াল লিংকে চাপলে আপনি অন্য ওয়েবসাইটে যাবেন। সেই সাইটের নিজস্ব গোপনীয়তা নীতি প্রযোজ্য।</p><h2>ফন্ট</h2><p>অনলাইনে থাকলে লেখার ফন্ট Google Fonts থেকে নামতে পারে।</p>'],
      disclaimer: ['দাবিত্যাগ', '<p>সমাধান একটি স্বাধীন তথ্য ও গাইড অ্যাপ। এটি কোনো সরকারি কর্তৃপক্ষ নয় এবং সরকারের পক্ষে কাজ করে না।</p><p>সরকারি সেবার গাইডগুলো প্রকাশিত অনলাইন সূত্র থেকে সংকলিত খসড়া। ফি, কাগজপত্র, যোগ্যতা ও প্রক্রিয়া যেকোনো সময় বদলাতে পারে। সিদ্ধান্ত নেওয়ার আগে অফিসিয়াল ওয়েবসাইট বা সংশ্লিষ্ট অফিস থেকে তথ্য নিশ্চিত করুন।</p><p>সেবাদাতার তালিকার নমুনা প্রোফাইল বাস্তব নয়।</p>']
    }[kind];
    return { html: '<div class="card prose">' + T[1] + '</div>', top: head({ title: T[0], back: 'settings' }) };
  }

  function vNotFound(parent) {
    return { html: emptyState('info', 'পাতাটি পাওয়া যায়নি', 'লিংকটি ভুল বা পুরনো হতে পারে।', '<button class="btn primary" data-go="home">হোমে যান</button>'), top: head({ title: 'পাওয়া যায়নি', back: parent }) };
  }

  /* ---------- router ---------- */
  var ROOTS = { home: 1, categories: 1, providers: 1, saved: 1, settings: 1 };
  function parse(r) { var p = String(r || 'home').split('/'); return { n: p[0] || 'home', a: decodeURIComponent(p.slice(1).join('/')) }; }

  function render() {
    var p = parse(cur), v;
    switch (p.n) {
      case 'home': v = vHome(); break;
      case 'categories': v = vCategories(); break;
      case 'gov': v = vGov(); break;
      case 'cat': v = vCat(p.a); break;
      case 'guide': v = vGuide(p.a); break;
      case 'search': v = vSearch(); break;
      case 'providers': v = vProviders(); break;
      case 'saved': v = vSaved(); break;
      case 'settings': v = vSettings(); break;
      case 'about': case 'privacy': case 'disclaimer': v = vPage(p.n); break;
      default: v = vNotFound('home');
    }
    topbar.innerHTML = '<div class="g">' + v.top + '</div><div id="offline" class="g"><div class="col">আপনি অফলাইনে আছেন। গাইড পড়া যাবে, কিন্তু অফিসিয়াল লিংকে ইন্টারনেট লাগবে।</div></div>';
    view.innerHTML = '<div class="col">' + v.html + '</div>';
    var root = ROOTS[p.n] ? p.n : (p.n === 'search' ? 'home' : null);
    tabs.querySelectorAll('.tab').forEach(function (b) {
      var on = root && b.getAttribute('data-go') === root;
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    document.title = (p.n === 'home' ? 'সমাধান – সমস্যার সহজ সমাধান' : 'সমাধান');
    if (v.after) v.after();
  }
  function setHash(r) { try { if (location.hash !== '#/' + r) location.hash = '/' + r; } catch (e) { /* sandboxed */ } }
  function go(r) {
    if (r === cur) return;
    scrolls[cur] = window.scrollY;
    if (ROOTS[r]) { stack = []; } else { stack.push(cur); }
    cur = r; setHash(r); render(); window.scrollTo(0, 0);
  }
  function back(parent) {
    if (stack.length) {
      var before = cur;
      try { history.back(); } catch (e) { /* fall through */ }
      setTimeout(function () {
        if (cur === before && stack.length) { cur = stack.pop(); render(); window.scrollTo(0, scrolls[cur] || 0); }
      }, 150);
    } else {
      cur = parent || 'home'; setHash(cur); render(); window.scrollTo(0, 0);
    }
  }
  function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
  window.addEventListener('hashchange', function () {
    var r = location.hash.replace(/^#\/?/, '') || 'home';
    if (r === cur) return;
    if (stack.length && stack[stack.length - 1] === r) stack.pop(); else if (!ROOTS[r]) stack.push(cur); else stack = [];
    scrolls[cur] = window.scrollY; cur = r; render(); window.scrollTo(0, scrolls[r] || 0);
  });

  /* ---------- share ---------- */
  function guideText(g, url) {
    var t = g.title + '\n\n' + g.summary + '\n';
    if (g.steps && g.steps.length) t += '\nধাপসমূহ:\n' + g.steps.map(function (s, i) { return bn(i + 1) + '. ' + s[0] + ': ' + s[1]; }).join('\n') + '\n';
    if (g.faq && g.faq.length) t += '\n' + g.faq.map(function (f) { return f[0] + '\n' + f[1]; }).join('\n\n') + '\n';
    if (g.gov) t += '\nসতর্কতা: ফি ও নিয়ম বদলাতে পারে, অফিসিয়াল সাইটে নিশ্চিত করুন।\n';
    return t + '\n— সমাধান (স্বাধীন তথ্য অ্যাপ, সরকারি নয়)' + (url ? '\n' + url : '');
  }
  function shareGuide(id) {
    var g = GUIDES[id]; if (!g) return;
    var base = location.href.split('#')[0];
    var url = /^https?:/.test(base) ? base + '#/guide/' + g.id : '';
    var text = guideText(g, url);
    if (navigator.share) {
      navigator.share({ title: g.title, text: text }).catch(function (e) { if (e && e.name !== 'AbortError') shareSheet(g, text, url); });
    } else { shareSheet(g, text, url); }
  }
  function shareSheet(g, text, url) {
    var enc = encodeURIComponent(text);
    var h = '<div class="sheet"><h2>শেয়ার করুন</h2><p class="muted small">' + esc(g.title) + '</p>' +
      '<a class="btn primary link-btn" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + enc + '"><span>WhatsApp</span>' + ic('chat') + '</a>' +
      (url ? '<a class="btn primary link-btn" target="_blank" rel="noopener noreferrer" href="fb-messenger://share/?link=' + encodeURIComponent(url) + '"><span>Messenger (লিংক)</span>' + ic('chat') + '</a>' : '') +
      '<a class="btn primary link-btn" href="sms:?&body=' + enc + '"><span>এসএমএস</span>' + ic('msg') + '</a>' +
      '<button class="btn secondary link-btn" data-act="copy"><span>লেখা কপি করুন</span>' + ic('copy') + '</button>' +
      '<button class="btn secondary" data-act="closemodal">বন্ধ করুন</button></div>';
    shareSheet.text = text;
    openModal(h);
  }
  function openModal(h) { var m = $('#modal'); m.innerHTML = h; m.hidden = false; }
  function closeModal() { var m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.id === 'modal') { closeModal(); return; }
    var el = e.target.closest('[data-go],[data-act]');
    if (!el) return;
    var go_ = el.getAttribute('data-go');
    if (go_) { closeModal(); go(go_); return; }
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    switch (a) {
      case 'back': back(el.getAttribute('data-parent')); break;
      case 'bm': toggleSave(id); rerender(); break;
      case 'share': shareGuide(id); break;
      case 'fs+': setFs(fsIdx + 1); rerender(); break;
      case 'fs-': setFs(fsIdx - 1); rerender(); break;
      case 'fsset': setFs(+el.getAttribute('data-i')); rerender(); break;
      case 'step': el.classList.toggle('done'); el.setAttribute('aria-pressed', el.classList.contains('done')); break;
      case 'clearq': sq = ''; sCat = 'all'; var q = $('#q'); if (q) { q.value = ''; q.focus(); } runSearch(); break;
      case 'qword': sq = el.getAttribute('data-w'); var qi = $('#q'); if (qi) qi.value = sq; runSearch(); break;
      case 'scat': sCat = el.getAttribute('data-c'); runSearch(); break;
      case 'pcat': pv.cat = el.getAttribute('data-c'); updateProviders(); break;
      case 'install': if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; rerender(); } break;
      case 'closemodal': closeModal(); break;
      case 'copy':
        var txt = shareSheet.text || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () { toast('কপি হয়েছে'); closeModal(); }, function () { toast('কপি করা যায়নি'); });
        } else { toast('কপি করা যায়নি'); }
        break;
      case 'clearsaved':
        openModal('<div class="sheet" role="alertdialog" aria-label="নিশ্চিত করুন"><h2>সব সংরক্ষিত গাইড মুছবেন?</h2><p class="muted">এটি ফিরিয়ে আনা যাবে না।</p><button class="btn danger" data-act="clearsaved-yes">হ্যাঁ, মুছুন</button><button class="btn secondary" data-act="closemodal">না, থাক</button></div>');
        break;
      case 'clearsaved-yes': saved = []; store.set('saved', saved); closeModal(); toast('মুছে ফেলা হয়েছে'); rerender(); break;
    }
  });
  var sT;
  document.addEventListener('input', function (e) {
    if (e.target.id === 'q') { clearTimeout(sT); sT = setTimeout(function () { sq = e.target.value; sCat = 'all'; runSearch(); }, 120); }
    if (e.target.id === 'pq') { pv.q = e.target.value; updateProviders(); }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'dist') { pv.dist = e.target.value; updateProviders(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; if (cur === 'home' || cur === 'settings') rerender(); });
  window.addEventListener('appinstalled', function () { deferredInstall = null; });
  function netState() { document.body.classList.toggle('is-offline', !navigator.onLine); }
  window.addEventListener('online', netState); window.addEventListener('offline', netState);

  /* ---------- tabs, splash, onboarding ---------- */
  tabs.innerHTML = '<div class="col">' + TABS.map(function (t) {
    return '<button class="tab" data-go="' + t[0] + '"><span class="pill">' + ic(t[2]) + '</span><span>' + t[1] + '</span></button>';
  }).join('') + '</div>';

  var SLIDES = [
    ['bulb', 'দৈনন্দিন সমস্যার সমাধান খুঁজুন', 'ফোন, ইন্টারনেট ও অনলাইন অ্যাকাউন্টের সমস্যার সহজ বাংলা গাইড।'],
    ['building', 'সরকারি সেবা বুঝে নিন', 'জন্মনিবন্ধন, NID ও পাসপোর্টের ধাপ এবং অফিসিয়াল লিংক এক জায়গায়।'],
    ['bookmark', 'দরকারি গাইড সংরক্ষণ করুন', 'পরে পড়ার জন্য রেখে দিন। অফলাইনেও পড়া যাবে।']
  ];
  function onboard(i) {
    var o = $('#onboard'); o.hidden = false;
    var s = SLIDES[i], last = i === SLIDES.length - 1;
    o.innerHTML = '<div class="g top"><button class="btn" data-ob="skip" style="background:transparent;color:var(--muted)">এড়িয়ে যান</button></div>' +
      '<div class="mid g"><span class="big">' + ic(s[0]) + '</span><h2>' + s[1] + '</h2><p>' + s[2] + '</p>' +
      '<div class="dots" aria-hidden="true">' + SLIDES.map(function (_, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('') + '</div></div>' +
      '<div class="bot g"><div class="nav">' + (i > 0 ? '<button class="btn secondary" data-ob="prev" data-i="' + i + '">পূর্ববর্তী</button>' : '') +
      '<button class="btn primary" data-ob="' + (last ? 'skip' : 'next') + '" data-i="' + i + '">' + (last ? 'শুরু করুন' : 'পরবর্তী') + '</button></div>' +
      '<p class="muted small">সমাধান একটি স্বাধীন তথ্য অ্যাপ, সরকারি নয়।</p></div>';
  }
  $('#onboard').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ob]'); if (!b) return;
    var k = b.getAttribute('data-ob'), i = +b.getAttribute('data-i') || 0;
    if (k === 'next') onboard(i + 1); else if (k === 'prev') onboard(i - 1);
    else { store.set('onboarded', true); $('#onboard').hidden = true; }
  });

  /* ---------- boot ---------- */
  function boot(d) {
    DATA = d;
    d.categories.forEach(function (c) { CATS[c.id] = c; });
    d.guides.forEach(function (g) { GUIDES[g.id] = g; });
    buildIndex();
    saved = saved.filter(function (id) { return GUIDES[id]; });
    var start = location.hash.replace(/^#\/?/, '');
    cur = start || 'home';
    render();
    netState();
    setTimeout(function () { var s = $('#splash'); s.classList.add('hide'); setTimeout(function () { s.remove(); }, 300); }, 900);
    if (!store.get('onboarded', false)) onboard(0);
  }
  function loadFail() {
    $('#splash').remove();
    view.innerHTML = '<div class="col">' + emptyState('alert', 'তথ্য লোড হয়নি', 'ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন। একবার লোড হলে পরে অফলাইনে চলবে।', '<button class="btn primary" onclick="location.reload()">আবার চেষ্টা করুন</button>') + '</div>';
  }
  if (window.__DATA__) boot(window.__DATA__);
  else fetch('data.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(boot).catch(loadFail);

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* offline mode unavailable */ }); });
  }
})();
