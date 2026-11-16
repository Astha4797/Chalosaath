/* ChaloSaath app shell: animated tab bar, page transitions, press feedback, and CTA flows for Meetups & Safety */
(function () {
  'use strict';
  var TABS = [
    { path: '/', key: 'right-now', icon: 'explore', label: 'Right Now' },
    { path: '/meetups.html', key: 'meetups', icon: 'diversity_3', label: 'Meetups' },
    { path: '/safety.html', key: 'profile-safety', icon: 'shield_person', label: 'Safety' }
  ];
  var here = location.pathname.replace(/index\.html$/, '') || '/';
  var current = Math.max(0, TABS.findIndex(function (t) { return t.path === here; }));

  var buzz = function (ms) {
    try {
      if (!navigator.vibrate || (navigator.userActivation && !navigator.userActivation.hasBeenActive)) return;
      navigator.vibrate(ms || 6);
    } catch (e) {}
  };
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------- Shared styles ----------
  // Shell styles live in /app.css (build/shell.css) so they apply on first paint

  // Direction-aware page transitions
  function quiet(vt) { if (!vt) return; ['ready', 'finished', 'updateCallbackDone'].forEach(function (p) { vt[p] && vt[p].catch(function () {}); }); }
  window.addEventListener('pageswap', function (e) { quiet(e.viewTransition); });
  window.addEventListener('pagereveal', function (e) {
    quiet(e.viewTransition);
    try { if (e.viewTransition && sessionStorage.getItem('cs-dir') === 'back') e.viewTransition.types.add('back'); } catch (x) {}
  });

  // ---------- Saved state (this device) ----------
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function prof() {
    return Object.assign({ name: 'Minali Rao', base: 'Jibhi, Kullu Valley', ecName: 'Priya', ecRel: 'sister', ecPhone: '+91 98765 43210' }, lsGet('cs-profile', {}));
  }
  window.csProfile = prof;
  window.csLs = { get: lsGet, set: lsSet };
  var MEET = Object.assign({ joins: {}, chats: {}, mine: [] }, lsGet('cs-meet', {}));
  function saveMeet() { lsSet('cs-meet', MEET); }

  // ---------- Toast ----------
  var toastEl;
  function toast(msg, icon) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      toastEl.style.cssText = 'position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top));transform:translate(-50%,-16px) scale(.96);width:max-content;max-width:calc(100% - 32px);display:flex;align-items:center;gap:8px;' +
        'background:#131b2e;color:#fff;font:500 13.5px/1.35 Inter,system-ui,sans-serif;padding:11px 16px;border-radius:16px;' +
        'box-shadow:0 14px 30px -10px rgba(15,23,42,.5);opacity:0;transition:opacity .25s,transform .35s cubic-bezier(.34,1.3,.64,1);z-index:9999;pointer-events:none';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = (icon ? '<span class="material-symbols-outlined" style="font-size:18px;color:#9fb0e6">' + icon + '</span>' : '') + '<span>' + esc(msg) + '</span>';
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translate(-50%,0) scale(1)';
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translate(-50%,-16px) scale(.96)';
    }, 2600);
  }
  window.csToast = toast;

  // ---------- Tab bar ----------
  // The tab bar is rendered in each page's HTML (see build/build.py) so it paints with the first frame
  var bar = document.querySelector('.cs-tabbar');
  if (!bar) {
    bar = document.createElement('nav');
    bar.className = 'cs-tabbar';
    bar.setAttribute('aria-label', 'Main');
    bar.innerHTML = '<span class="cs-ind" aria-hidden="true"></span>' + TABS.map(function (t, i) {
      return '<a class="cs-tab" href="' + t.path + '" data-i="' + i + '"' + (i === current ? ' aria-current="page"' : '') + '>' +
        '<span class="material-symbols-outlined">' + t.icon + '</span><span>' + t.label + '</span></a>';
    }).join('');
    document.body.appendChild(bar);
  }
  bar.style.setProperty('--i', current);
  var ind = bar.querySelector('.cs-ind');

  bar.addEventListener('click', function (e) {
    var a = e.target.closest('.cs-tab'); if (!a) return;
    e.preventDefault();
    var i = +a.dataset.i;
    buzz(8);
    if (i === current) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try { sessionStorage.setItem('cs-dir', i < current ? 'back' : 'forward'); } catch (x) {}
    if (i < current) document.documentElement.classList.add('cs-back');
    bar.querySelectorAll('.cs-tab').forEach(function (t) { t.removeAttribute('aria-current'); });
    a.setAttribute('aria-current', 'page');
    var dot = a.querySelector('.dot'); if (dot) dot.remove();
    // Start the slide now and navigate at once; the next page picks the slide up from wherever
    // the indicator is at hand-over (see the cs-vt head hook), so bar and screen move together.
    try { sessionStorage.setItem('cs-from', String(current)); } catch (x) {}
    navigating = true;
    bar.style.setProperty('--i', i);
    current = i;
    location.href = a.getAttribute('href');
  });
  var navigating = false;
  window.addEventListener('pageswap', function () {
    if (!navigating) return;
    try {
      var m = new DOMMatrix(getComputedStyle(ind).transform);
      if (ind.offsetWidth) sessionStorage.setItem('cs-from', (m.m41 / ind.offsetWidth).toFixed(3));
    } catch (x) {}
  });
  // Prefetch the other tabs so switching is instant
  TABS.forEach(function (t) {
    if (t.path === here) return;
    var l = document.createElement('link'); l.rel = 'prefetch'; l.href = t.path; document.head.appendChild(l);
  });
  // Hide the bar while scrolling down, bring it back on scroll up
  var lastY = scrollY, ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = scrollY, d = y - lastY;
      if (Math.abs(d) > 6) {
        var down = d > 0 && y > 120;
        bar.classList.toggle('hide', down);
        var fab = document.getElementById('open-beacon-modal');
        if (fab) fab.classList.toggle('mini', down);
        lastY = y;
      }
      ticking = false;
    });
  }, { passive: true });

  // ---------- Press feedback: haptics + ripple on CTAs ----------
  document.addEventListener('touchstart', function () {}, { passive: true }); // enables :active on iOS
  var RIPPLE = '.cs-cta, .join-btn, .details-btn, .ctl, #broadcast-btn, #cancel-modal-btn, #btn-back-safe, #btn-share-link, #btn-alarm, #open-beacon-modal, #open-filter-btn, .duration-btn, .venue-map-trigger, #dismiss-map-btn, a[href^="tel:"].rounded-full, button.rounded-full.h-12, button.rounded-full.h-11';
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('button, a'); if (!el || el.disabled) return;
    buzz(5);
    if (!el.matches(RIPPLE)) return;
    el.classList.add('cs-rippled');
    var r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
    var rp = document.createElement('span');
    rp.className = 'cs-ripple';
    rp.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
    el.appendChild(rp);
    setTimeout(function () { rp.remove(); }, 600);
  }, { passive: true });

  function byIcon(name) {
    return Array.prototype.filter.call(document.querySelectorAll('button, a'), function (el) {
      var icon = el.querySelector('.material-symbols-outlined');
      return icon && icon.textContent.trim() === name;
    });
  }
  function byText(text) {
    return Array.prototype.filter.call(document.querySelectorAll('button, a'), function (el) { return el.textContent.indexOf(text) !== -1; });
  }
  function on(els, fn) { els.forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); fn(el, e); }); }); }
  function spin(btn, label) { btn.disabled = true; btn.innerHTML = '<span class="cs-spin"></span><span>' + esc(label) + '</span>'; }

  // ---------- Right Now ----------
  var search = document.getElementById('spotSearch');
  on(byIcon('mic'), function () {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !search) { toast('Voice search isn’t supported in this browser', 'mic_off'); return; }
    var r = new SR(); r.lang = 'en-IN';
    toast('Listening… say a place or a vibe', 'mic');
    r.onresult = function (ev) { search.value = ev.results[0][0].transcript; search.dispatchEvent(new Event('input')); };
    r.onerror = function () { toast('Couldn’t hear that — try again', 'mic_off'); };
    r.start();
  });

  // ---------- Meetups ----------
  var fab = document.getElementById('open-beacon-modal');
  if (fab) {
    var ping = fab.querySelector('.animate-ping'); if (ping) ping.remove();
    var lbl = fab.querySelector('.font-headline-sm');
    if (lbl) { lbl.textContent = 'Create Beacon'; lbl.classList.add('cs-fab-label'); }
  }
  document.querySelectorAll('.duration-btn').forEach(function (b) { b.textContent = b.textContent.replace(/\s*\(Active\)/, ''); });

  // Meetups filters: host type, activity, time left
  var filterBtn = document.getElementById('open-filter-btn');
  var mfeed = document.querySelector('section[aria-label="Active Meetups"]');
  if (filterBtn && mfeed) {
    var MDEF = { host: ['women', 'guide', 'verified'], act: ['cafe', 'walk', 'work'], time: 'any', spots: false };
    var mval = JSON.parse(JSON.stringify(MDEF));
    function meta(card) {
      var t = card.textContent;
      var mins = 0, m = t.match(/Ends in (?:(\d+)h)?\s*(?:(\d+)m)?/);
      if (m) mins = (+(m[1] || 0)) * 60 + (+(m[2] || 0));
      var live = t.match(/Live (\d)h/); if (live) mins = +live[1] * 60;
      var left = t.match(/(\d+) left/);
      return {
        mine: !!card.dataset.mine,
        host: /Women-Only/.test(t) ? 'women' : /Guide/.test(t) ? 'guide' : 'verified',
        act: /Co-working|remote work/i.test(t) ? 'work' : /Trek|walk/i.test(t) ? 'walk' : 'cafe',
        mins: mins, left: left ? +left[1] : 1
      };
    }
    function match(v, c) {
      var x = meta(c);
      if (x.mine) return true;
      if (v.host.indexOf(x.host) === -1) return false;
      if (v.act.indexOf(x.act) === -1) return false;
      if (v.time === 'soon' && x.mins > 60) return false;
      if (v.time === 'later' && x.mins <= 60) return false;
      if (v.spots && x.left < 2) return false;
      return true;
    }
    function cards() { return Array.prototype.slice.call(mfeed.querySelectorAll('article')); }
    function active(v) {
      return (v.host.length < 3 ? 1 : 0) + (v.act.length < 3 ? 1 : 0) + (v.time !== 'any' ? 1 : 0) + (v.spots ? 1 : 0);
    }
    function applyM(v) {
      mval = v;
      var shown = 0;
      cards().forEach(function (card) {
        var ok = match(v, card);
        card.style.transition = 'opacity .25s, transform .25s';
        if (ok) { shown++; card.style.display = ''; requestAnimationFrame(function () { card.style.opacity = ''; card.style.transform = ''; }); }
        else { card.style.opacity = '0'; card.style.transform = 'scale(.97)'; setTimeout(function () { if (!match(mval, card)) card.style.display = 'none'; }, 250); }
      });
      var empty = mfeed.querySelector('.cs-empty');
      if (!shown && !empty) {
        empty = document.createElement('div'); empty.className = 'cs-empty';
        empty.innerHTML = '<span class="material-symbols-outlined">travel_explore</span><b>No beacons match</b><p>Try fewer filters, or start your own beacon so others can join you.</p><button type="button">Clear filters</button>';
        empty.querySelector('button').addEventListener('click', function () { applyM(JSON.parse(JSON.stringify(MDEF))); });
        mfeed.appendChild(empty);
      } else if (shown && empty) empty.remove();
      var n = active(v);
            filterBtn.style.background = n ? '#131b2e' : '';
      filterBtn.style.color = n ? '#fff' : '';
      window.csFilterBadge(filterBtn, n);
    }
    filterBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.csFilterSheet({
        title: 'Filter beacons', noun: ['beacon', 'beacons'],
        value: mval, defaults: MDEF,
        sections: [
          { id: 'host', title: 'Hosted by', type: 'multi', options: [
            { v: 'women', label: 'Women-only', icon: 'shield' }, { v: 'guide', label: 'Local guides', icon: 'military_tech' }, { v: 'verified', label: 'ID-verified', icon: 'verified' }] },
          { id: 'act', title: 'Activity', type: 'multi', options: [
            { v: 'cafe', label: '☕ Chai & cafés' }, { v: 'walk', label: '🥾 Walks & treks' }, { v: 'work', label: '💻 Co-working' }] },
          { id: 'time', title: 'Time left', type: 'single', options: [
            { v: 'any', label: 'Any' }, { v: 'soon', label: 'Ending within 1 hr' }, { v: 'later', label: 'More than 1 hr' }] },
          { id: 'spots', type: 'switch', label: 'At least 2 spots open', desc: 'Easier to join with a friend or as a pair.' }
        ],
        count: function (v) { return cards().filter(function (c) { return match(v, c); }).length; },
        onApply: function (v) {
          applyM(v);
          var n = cards().filter(function (c) { return match(v, c); }).length;
          toast(n + ' beacon' + (n === 1 ? '' : 's') + ' match your filters', 'tune');
        }
      });
    });
  }

  // Join requests: Request → Sending → Requested (tap twice to cancel) → Accepted → (Leave)
  var JOIN = {};
  document.querySelectorAll('.join-btn').forEach(function (btn) {
    var idle = btn.innerHTML, host = (btn.getAttribute('data-host') || 'the host'), first = host.split(' ')[0];
    var article = btn.closest('article'), timer;
    function spots(d) {
      if (!article) return;
      article.querySelectorAll('span').forEach(function (s) {
        var m = s.textContent.match(/^(\d+)\/(\d+) spots(?: filled)? • (\d+) left$/);
        if (m) { var f = +m[1] + d, t = +m[2]; s.textContent = f + '/' + t + ' spots filled • ' + (t - f) + ' left'; }
      });
    }
    function set(state, html) {
      btn.className = btn.className.replace(/\b(pending|accepted|confirm)\b/g, '').trim() + (state ? ' ' + state : ''); btn.innerHTML = html; btn.disabled = false; btn.dataset.state = state || '';
      if (state !== 'confirm') { if (state) MEET.joins[host] = state; else delete MEET.joins[host]; saveMeet(); }
    }
    var PENDING_HTML = '<span class="material-symbols-outlined text-[18px]">hourglass_top</span><span>Requested · waiting for ' + esc(first) + '</span>';
    var IN_HTML = '<span class="material-symbols-outlined text-[18px]" style="font-variation-settings:\'FILL\' 1">check_circle</span><span>You’re in</span>';
    function accept(quiet) {
      if (btn.dataset.state !== 'pending' && !quiet) return;
      set('accepted', IN_HTML);
      spots(1); addMessageButton();
      if (!quiet) {
        btn.classList.remove('cs-pop'); void btn.offsetWidth; btn.classList.add('cs-pop');
        buzz([12, 60, 12]);
        toast(first + ' accepted your request 🎉 You can message ' + first + ' now', 'celebration');
      }
    }
    // Leaving after being accepted: back to "Request to Join", chat cleared
    JOIN[host] = {
      leave: function () {
        clearTimeout(timer); set('', idle); spots(-1);
        if (msgBtn) { msgBtn.remove(); msgBtn = null; }
        delete MEET.chats[host]; saveMeet();
        toast('You left ' + first + '’s meetup', 'logout');
      }
    };
    // Restore what happened before a reload or tab switch
    if (MEET.joins[host] === 'accepted') setTimeout(function () { btn.dataset.state = 'pending'; accept(true); }, 0);
    else if (MEET.joins[host] === 'pending') { set('pending', PENDING_HTML); timer = setTimeout(accept, 2500); }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var s = btn.dataset.state || '';
      if (s === '') {
        spin(btn, 'Sending request…');
        setTimeout(function () {
          set('pending', PENDING_HTML);
          btn.classList.add('cs-pop');
          toast('Request sent to ' + host + '. We’ll let you know.', 'send');
          timer = setTimeout(accept, 3500);
        }, 700);
      } else if (s === 'pending') {
        set('confirm', '<span class="material-symbols-outlined text-[18px]">close</span><span>Tap again to cancel request</span>');
        timer = setTimeout(function () {
          if (btn.dataset.state === 'confirm') set('pending', PENDING_HTML);
        }, 2500);
      } else if (s === 'confirm') {
        clearTimeout(timer); set('', idle); toast('Request cancelled', 'undo');
      } else if (s === 'accepted') {
        var map = article && article.querySelector('.venue-map-trigger'); if (map) map.click();
      }
    });

    // Once approved, a Message button appears beside "You're in"
    var msgBtn;
    function addMessageButton() {
      if (msgBtn || !article) return;
      var img = article.querySelector('img');
      var title = (article.querySelector('h2, h3') || {}).textContent || 'the meetup';
      var pin = Array.prototype.filter.call(article.querySelectorAll('.material-symbols-outlined'), function (i) { return i.textContent.trim() === 'location_on'; })[0];
      var place = pin ? pin.parentElement.textContent.replace('location_on', '').replace(/^[^A-Za-z]+/, '').trim() : '';
      var endsEl = Array.prototype.filter.call(article.querySelectorAll('div, span'), function (x) { return x.children.length === 0 && /Ends in/.test(x.textContent); })[0];
      var ends = endsEl ? endsEl.textContent.replace(/[^\w\s]/g, '').trim() : '';
      msgBtn = document.createElement('button');
      msgBtn.type = 'button';
      msgBtn.className = 'cs-msg-btn';
      msgBtn.setAttribute('aria-label', 'Message ' + host);
      msgBtn.innerHTML = '<span class="material-symbols-outlined">chat</span><span>Message</span><span class="badge">1</span>';
      btn.insertAdjacentElement('afterend', msgBtn);
      msgBtn.addEventListener('click', function () {
        var b = msgBtn.querySelector('.badge'); if (b) b.remove();
        openChat({ host: host, first: first, photo: img ? img.src : '', title: title.trim(), place: place, ends: ends.replace('⏳', '').trim() });
      });
    }
  });

  // ---------- Filter sheet (shared by Right Now and Meetups) ----------
  // cfg: { title, noun, sections:[{id,title,type:'single'|'multi'|'switch',options:[{v,label,icon}],label,desc}],
  //        value, defaults, count(value) -> number, onApply(value) }
  var fsEl;
  window.csFilterSheet = function (cfg) {
    if (!fsEl) {
      fsEl = document.createElement('div');
      fsEl.className = 'cs-fsheet';
      fsEl.setAttribute('role', 'dialog'); fsEl.setAttribute('aria-modal', 'true');
      document.body.appendChild(fsEl);
      fsEl.addEventListener('click', function (e) { if (e.target === fsEl) closeFs(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fsEl.classList.contains('open')) closeFs(); });
    }
    var draft = JSON.parse(JSON.stringify(cfg.value));
    function html() {
      return '<div class="panel"><div class="grab"></div>' +
        '<div class="fhead"><h3>' + esc(cfg.title) + '</h3><button type="button" class="fx" data-x aria-label="Close"><span class="material-symbols-outlined">close</span></button></div>' +
        '<div class="fbody">' + cfg.sections.map(function (sec) {
          if (sec.type === 'switch') {
            return '<div class="fsec"><div class="cs-switch-row"><div><p>' + esc(sec.label) + '</p>' + (sec.desc ? '<small>' + esc(sec.desc) + '</small>' : '') + '</div>' +
              '<button type="button" class="cs-switch" role="switch" data-sec="' + sec.id + '" aria-checked="' + !!draft[sec.id] + '" aria-label="' + esc(sec.label) + '"></button></div></div>';
          }
          return '<div class="fsec"><h4>' + esc(sec.title) + '</h4><div class="opts">' + sec.options.map(function (o) {
            var on = sec.type === 'multi' ? draft[sec.id].indexOf(o.v) !== -1 : draft[sec.id] === o.v;
            return '<button type="button" class="cs-opt" data-sec="' + sec.id + '" data-v="' + esc(String(o.v)) + '" aria-pressed="' + on + '">' +
              (o.icon ? '<span class="material-symbols-outlined">' + o.icon + '</span>' : '') + esc(o.label) + '</button>';
          }).join('') + '</div></div>';
        }).join('') + '</div>' +
        '<div class="ffoot"><button type="button" class="reset" data-reset>Reset</button><button type="button" class="apply" data-apply></button></div></div>';
    }
    function refreshCount() {
      var n = cfg.count(draft), btn = fsEl.querySelector('[data-apply]');
      btn.textContent = n ? 'Show ' + n + ' ' + (n === 1 ? cfg.noun[0] : cfg.noun[1]) : 'No matches';
      btn.disabled = !n;
    }
    fsEl.innerHTML = html();
    fsEl.onclick = function (e) {
      var t = e.target.closest('[data-sec],[data-reset],[data-apply],[data-x]'); if (!t) return;
      if (t.hasAttribute('data-x')) { closeFs(); return; }
      if (t.hasAttribute('data-reset')) { draft = JSON.parse(JSON.stringify(cfg.defaults)); fsEl.innerHTML = html(); fsEl.classList.add('open'); refreshCount(); buzz(6); return; }
      if (t.hasAttribute('data-apply')) { cfg.onApply(draft); closeFs(); buzz(10); return; }
      var sec = cfg.sections.filter(function (s) { return s.id === t.dataset.sec; })[0];
      if (sec.type === 'switch') { draft[sec.id] = !draft[sec.id]; t.setAttribute('aria-checked', draft[sec.id]); }
      else if (sec.type === 'multi') {
        var v = t.dataset.v, arr = draft[sec.id], i = arr.indexOf(v);
        if (i === -1) arr.push(v); else if (arr.length > 1 || sec.allowNone) arr.splice(i, 1); else { t.classList.remove('cs-pop'); void t.offsetWidth; t.classList.add('cs-pop'); return; }
        t.setAttribute('aria-pressed', i === -1);
      } else {
        var val = sec.options.filter(function (o) { return String(o.v) === t.dataset.v; })[0].v;
        draft[sec.id] = val;
        fsEl.querySelectorAll('[data-sec="' + sec.id + '"]').forEach(function (b) { b.setAttribute('aria-pressed', b === t); });
      }
      buzz(5); refreshCount();
    };
    refreshCount();
    document.documentElement.style.overflow = 'hidden';
    void fsEl.offsetWidth; fsEl.classList.add('open');
  };
  function closeFs() { fsEl.classList.remove('open'); document.documentElement.style.overflow = ''; }
  // small count badge on a filter button
  window.csFilterBadge = function (btn, n) {
    var b = btn.querySelector('.cs-fbadge');
    if (!n) { if (b) b.remove(); return; }
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    if (!b) { b = document.createElement('span'); b.className = 'cs-fbadge'; btn.appendChild(b); }
    b.textContent = n;
  };

  // ---------- Profile (header avatar) ----------
  var greet = document.getElementById('greeting');
  if (greet) {
    var hr = new Date().getHours();
    greet.textContent = (hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening') + ', ' + prof().name.split(' ')[0];
  }
  // Safety page: let the profile link straight to the privacy controls
  Array.prototype.forEach.call(document.querySelectorAll('h2, h3'), function (h) {
    if (/Privacy & Safety Controls/.test(h.textContent)) { var sec = h.closest('section') || h; sec.id = 'privacy'; sec.style.scrollMarginTop = '80px'; }
  });
  if (location.hash === '#privacy') setTimeout(function () { var p = document.getElementById('privacy'); if (p) p.scrollIntoView({ behavior: 'smooth' }); }, 300);

  var profEl;
  function openProfile() {
    var avatar = document.querySelector('#profileBtn img');
    var P = prof(), saved = lsGet('cs-saved', []).length, joined = Object.keys(MEET.joins).filter(function (h) { return MEET.joins[h] === 'accepted'; }).length;
    if (!profEl) {
      profEl = document.createElement('div');
      profEl.className = 'cs-fsheet cs-profile';
      profEl.setAttribute('role', 'dialog'); profEl.setAttribute('aria-modal', 'true'); profEl.setAttribute('aria-label', 'Your profile');
      document.body.appendChild(profEl);
      profEl.addEventListener('click', function (e) {
        if (e.target === profEl || e.target.closest('[data-x]')) { closeProfile(); return; }
        var r = e.target.closest('[data-go]'); if (!r) return;
        var go = r.getAttribute('data-go');
        if (go === 'saved') {
          e.preventDefault();
          if (window.csOpenSaved) { closeProfile(); setTimeout(window.csOpenSaved, 200); }
          else location.href = '/#saved';
        } else if (go === 'privacy' && location.pathname === '/safety.html') {
          e.preventDefault(); closeProfile();
          setTimeout(function () { document.getElementById('privacy').scrollIntoView({ behavior: 'smooth' }); }, 250);
        } else if (go === 'edit') {
          e.preventDefault(); closeProfile(); if (window.csEditProfile) setTimeout(window.csEditProfile, 220);
        }
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && profEl.classList.contains('open')) closeProfile(); });
    }
    var row = function (go, href, icon, title, sub, cls) {
      return '<a class="row' + (cls ? ' ' + cls : '') + '" href="' + href + '" data-go="' + go + '"><span class="ic"><span class="material-symbols-outlined">' + icon + '</span></span>' +
        '<span class="t"><b>' + title + '</b><small>' + sub + '</small></span><span class="material-symbols-outlined go">chevron_right</span></a>';
    };
    profEl.innerHTML = '<div class="panel"><div class="grab"></div>' +
      '<div class="fhead"><h3>Profile</h3><button type="button" class="fx" data-x aria-label="Close"><span class="material-symbols-outlined">close</span></button></div>' +
      '<div class="fbody" style="padding:0">' +
        '<div class="who"><img src="' + (avatar ? avatar.src : '') + '" alt="">' +
          '<div><b>' + esc(P.name) + '</b><small>Solo explorer · ' + esc(P.base) + '</small>' +
          '<div class="chips"><span class="chip"><span class="material-symbols-outlined">verified</span>ID &amp; selfie verified</span>' +
          '<span class="chip"><span class="material-symbols-outlined">military_tech</span>Level 3 Guardian</span></div></div></div>' +
        '<div class="stats"><div class="stat"><b>' + saved + '</b><small>Saved spots</small></div>' +
          '<div class="stat"><b>' + joined + '</b><small>Meetups joined</small></div>' +
          '<div class="stat"><b>4.9</b><small>Traveller rating</small></div></div>' +
        '<div class="rows">' +
          row('saved', '/#saved', 'favorite', 'Saved spots', saved ? saved + ' place' + (saved === 1 ? '' : 's') + ' saved for this trip' : 'Swipe right on Right Now to save places') +
          row('meetups', '/meetups.html', 'diversity_3', 'My meetups', 'Beacons you’ve joined or started') +
          row('safety', '/safety.html', 'shield_person', 'Safety hub', 'Live check-in · shared with ' + esc(P.ecName) + ' (' + esc(P.ecRel) + ')') +
          row('privacy', '/safety.html#privacy', 'visibility_off', 'Privacy & visibility', 'Women-only visibility, Ghost Mode, alerts') +
          row('edit', '#', 'edit', 'Edit profile', 'Name, photo, emergency contacts') +
          row('sos', 'tel:112', 'emergency', 'Emergency · 112', 'Police, ambulance, fire', 'danger') +
        '</div>' +
        '<p class="foot">ChaloSaath · Jibhi & Tirthan Valley</p>' +
      '</div></div>';
    document.documentElement.style.overflow = 'hidden';
    void profEl.offsetWidth; profEl.classList.add('open');
    buzz(6);
  }
  function closeProfile() { profEl.classList.remove('open'); document.documentElement.style.overflow = ''; }
  var pBtn = document.getElementById('profileBtn');
  if (pBtn) pBtn.addEventListener('click', openProfile);

  // ---------- Chat with an approved host ----------
  var chatEl, chats = MEET.chats;
  function openChat(c) {
    if (!chatEl) {
      chatEl = document.createElement('div');
      chatEl.className = 'cs-chat';
      chatEl.setAttribute('role', 'dialog');
      chatEl.setAttribute('aria-modal', 'true');
      chatEl.innerHTML = '<div class="panel">' +
        '<div class="head"><span class="av"><i></i></span><span class="who"><b></b><small></small></span>' +
        '<button type="button" class="leave">Leave</button>' +
        '<button type="button" class="x" aria-label="Close chat"><span class="material-symbols-outlined">close</span></button></div>' +
        '<div class="msgs" aria-live="polite"></div>' +
        '<div class="quick"></div>' +
        '<form><input type="text" placeholder="Message…" autocomplete="off" enterkeyhint="send" maxlength="300">' +
        '<button type="submit" class="send" aria-label="Send" disabled><span class="material-symbols-outlined">send</span></button></form></div>';
      document.body.appendChild(chatEl);
      chatEl.addEventListener('click', function (e) {
        if (e.target === chatEl || e.target.closest('.x')) { closeChat(); return; }
        var lv = e.target.closest('.leave'); if (!lv) return;
        if (!lv.classList.contains('sure')) {
          lv.classList.add('sure'); lv.textContent = 'Tap to confirm';
          clearTimeout(lv._t); lv._t = setTimeout(function () { lv.classList.remove('sure'); lv.textContent = 'Leave'; }, 2500);
          return;
        }
        var h = chatEl._c.host; closeChat(); if (JOIN[h]) JOIN[h].leave();
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && chatEl.classList.contains('open')) closeChat(); });
      var input = chatEl.querySelector('input'), send = chatEl.querySelector('.send');
      input.addEventListener('input', function () { send.disabled = !input.value.trim(); });
      chatEl.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var t = input.value.trim(); if (!t) return;
        input.value = ''; send.disabled = true;
        say(chatEl._c, t);
      });
      chatEl.querySelector('.quick').addEventListener('click', function (e) {
        var q = e.target.closest('button'); if (q) say(chatEl._c, q.textContent);
      });
    }
    chatEl._c = c;
    var lvb = chatEl.querySelector('.leave'); lvb.classList.remove('sure'); lvb.textContent = 'Leave';
    var key = c.host;
    if (!chats[key]) {
      chats[key] = [
        { k: 'note', t: 'Numbers stay private. Only approved members can chat.' },
        { k: 'sys', t: c.first + ' approved you for “' + c.title + '”' + (c.place ? ' · ' + c.place : '') },
        { k: 'them', t: 'Hi! Glad you’re joining 😊 ' + (c.place ? 'I’ll be at ' + c.place + '.' : 'See you there.') + ' I’m wearing a yellow jacket.' }
      ];
      saveMeet();
    }
    var av = chatEl.querySelector('.av');
    av.style.backgroundImage = c.photo ? 'url("' + c.photo + '")' : '';
    chatEl.querySelector('.who b').textContent = c.host;
    chatEl.querySelector('.who small').textContent = 'Host · ' + (c.ends ? c.ends : 'Verified traveller');
    renderChat();
    chatEl.querySelector('.quick').innerHTML = ['On my way 🚶‍♀️', 'Running 10 min late', 'Where exactly?', 'Can’t make it, sorry'].map(function (q) {
      return '<button type="button">' + esc(q) + '</button>';
    }).join('');
    document.documentElement.style.overflow = 'hidden';
    void chatEl.offsetWidth; chatEl.classList.add('open');
  }
  function closeChat() {
    chatEl.classList.remove('open');
    document.documentElement.style.overflow = '';
  }
  function now() { var d = new Date(); return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function renderChat(typing) {
    var list = chats[chatEl._c.host], box = chatEl.querySelector('.msgs');
    box.innerHTML = list.map(function (m) {
      if (m.k === 'note') return '<div class="note"><span class="material-symbols-outlined">lock</span>' + esc(m.t) + '</div>';
      if (m.k === 'sys') return '<div class="sys">' + esc(m.t) + '</div>';
      return '<div class="b ' + m.k + '">' + esc(m.t) + '<small>' + (m.at || '') + '</small></div>';
    }).join('') + (typing ? '<div class="typing"><span></span><span></span><span></span></div>' : '');
    box.scrollTop = box.scrollHeight;
  }
  function reply(text) {
    var t = text.toLowerCase();
    if (/late|delay/.test(t)) return 'No worries, take your time! We’ll save you a seat ☕';
    if (/where|exact|find|location/.test(t)) return 'Right by the window, the table with the green tablecloth. I’ll share a pin too 📍';
    if (/can.?t|cancel|sorry|won.?t/.test(t)) return 'Ah, no problem at all! Hope to catch you at the next one 🙂';
    if (/way|coming|leaving|omw/.test(t)) return 'Yay, see you soon! 🙌';
    if (/\?/.test(t)) return 'Good question! Easier to chat in person, see you there 😊';
    return 'Sounds good! See you soon 😊';
  }
  function say(c, text) {
    var list = chats[c.host];
    list.push({ k: 'me', t: text, at: now() });
    saveMeet(); buzz(6); renderChat();
    setTimeout(function () {
      if (chatEl._c !== c) return;
      renderChat(true);
      setTimeout(function () {
        list.push({ k: 'them', t: reply(text), at: now() });
        saveMeet();
        if (chatEl._c === c) renderChat();
      }, 1100);
    }, 450);
  }

  // Broadcast a beacon: add it to the live feed (kept until you end it or its time runs out)
  var broadcast = document.getElementById('broadcast-btn');
  var feed = document.querySelector('section[aria-label="Active Meetups"]');
  function mineCard(bc, animate) {
    var left = Math.max(0, bc.until - Date.now()), mins = Math.round(left / 60000);
    var lbl = mins >= 60 ? 'Live · ' + Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm left' : 'Live · ' + mins + 'm left';
    var card = document.createElement('article');
    card.dataset.mine = '1';
    card.dataset.id = bc.id;
    card.className = 'flex flex-col p-4 rounded-3xl bg-surface-container-lowest' + (animate ? ' cs-new' : '');
    card.style.boxShadow = 'inset 0 0 0 2px #253368, 0 10px 24px -12px rgba(37,51,104,.35)';
    card.innerHTML =
      '<div class="flex items-center justify-between gap-2 pb-2.5"><div class="flex items-center gap-3 min-w-0">' +
      '<div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white" style="background:#131b2e">You</div>' +
      '<div class="min-w-0"><p class="font-semibold text-on-surface">Your beacon</p>' +
      '<p class="text-[12px] text-on-surface-variant truncate"><span class="material-symbols-outlined text-[13px] align-[-2px]">location_on</span> ' + esc(bc.venue) + '</p></div></div>' +
      '<span class="shrink-0 inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full font-semibold" style="background:#eef2f9;color:#1e2756"><span class="w-1.5 h-1.5 rounded-full" style="background:#253368"></span>' + lbl + '</span></div>' +
      '<h3 class="text-[17px] font-bold text-on-surface pb-1">' + esc(bc.title) + '</h3>' +
      '<p class="text-[13px] text-on-surface-variant pb-3">1/' + bc.max + ' spots filled • ' + (bc.max - 1) + ' left · Verified travellers nearby can request to join.</p>' +
      '<div class="flex items-center gap-2"><button type="button" class="end-beacon flex-1 h-11 rounded-full bg-surface-container text-on-surface font-semibold text-[14px]">End beacon</button>' +
      '<button type="button" class="venue-map-trigger h-11 w-11 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center" aria-label="View ' + esc(bc.venue) + ' on map"><span class="material-symbols-outlined text-[20px]">map</span></button></div>';
    card.querySelector('.end-beacon').addEventListener('click', function () {
      card.style.transition = 'opacity .25s, transform .25s'; card.style.opacity = '0'; card.style.transform = 'scale(.96)';
      setTimeout(function () { card.remove(); }, 250);
      MEET.mine = MEET.mine.filter(function (x) { return x.id !== bc.id; }); saveMeet();
      updateCount(-1); toast('Beacon ended', 'sensors_off');
    });
    return card;
  }
  if (feed) {
    MEET.mine = MEET.mine.filter(function (bc) { return bc.until > Date.now(); }); saveMeet();
    MEET.mine.forEach(function (bc) { feed.insertBefore(mineCard(bc, false), feed.firstChild); updateCount(1); });
  }
  if (broadcast && feed) {
    broadcast.addEventListener('click', function () {
      var titleIn = document.getElementById('beacon-title-input');
      var venueSel = document.getElementById('venue-select');
      var hours = +(broadcast.textContent.match(/Live (\d)h/) || [, '2'])[1];
      var people = (document.getElementById('group-count') || {}).textContent || '3 travellers';
      var bc = {
        id: 'b' + Date.now(),
        title: (titleIn && titleIn.value.trim()) || 'Open hangout — come say hi',
        venue: (venueSel ? venueSel.options[venueSel.selectedIndex].text : 'Jibhi').replace(/^[^\w]+/, '').trim(),
        max: parseInt(people, 10) || 3,
        until: Date.now() + hours * 3600000
      };
      MEET.mine.push(bc); saveMeet();
      setTimeout(function () {
        feed.insertBefore(mineCard(bc, true), feed.firstChild);
        updateCount(1);
        if (titleIn) { titleIn.value = ''; titleIn.dispatchEvent(new Event('input')); }
        window.scrollTo({ top: Math.max(0, feed.getBoundingClientRect().top + scrollY - 90), behavior: 'smooth' });
        buzz([10, 50, 10]);
        toast('Your beacon is live for ' + hours + 'h', 'sensors');
      }, 950);
    }, true); // capture: read the "Live Nh" label before the page swaps it to "Broadcasting…"
  }
  function updateCount(d) {
    Array.prototype.forEach.call(document.querySelectorAll('span'), function (s) {
      var m = s.textContent.match(/^(\d+) Active Beacons$/);
      if (m) s.textContent = (parseInt(m[1], 10) + d) + ' Active Beacons';
    });
  }

  // Arriving from a Right Now spot: pre-fill the beacon sheet
  var params = new URLSearchParams(location.search);
  var spot = params.get('beacon') || params.get('find');
  if (fab && spot) {
    var sel = document.getElementById('venue-select'), tIn = document.getElementById('beacon-title-input');
    if (sel) {
      var opt = Array.prototype.filter.call(sel.options, function (o) { return o.text.indexOf(spot) !== -1; })[0];
      if (!opt) { opt = new Option('📍 ' + spot, spot); sel.add(opt, 0); }
      sel.value = opt.value;
    }
    if (tIn) {
      tIn.value = (params.get('find') ? 'Looking for a group: ' : 'Meetup at ') + spot;
      tIn.value = tIn.value.slice(0, 60);
      tIn.dispatchEvent(new Event('input'));
    }
    history.replaceState(null, '', location.pathname);
    setTimeout(function () {
      fab.click();
      if (params.get('find')) toast('No group yet for ' + spot + ' — start one and others can join', 'groups');
    }, 450);
  }

  // ---------- Safety ----------
  on(byText('Navigate Back to Basecamp'), function (el) {
    var html = el.innerHTML;
    spin(el, 'Finding the safest lit route…');
    var win = window.open('about:blank', '_blank');
    setTimeout(function () {
      var url = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('The Hosteller Jibhi, Himachal Pradesh') + '&travelmode=walking';
      if (win) { win.opener = null; win.location.href = url; } else location.href = url;
      el.disabled = false; el.innerHTML = html;
    }, 700);
  });
  var checkin = document.getElementById('btn-back-safe');
  if (checkin) checkin.addEventListener('click', function () { buzz([10, 40, 10]); checkin.classList.add('cs-pop'); toast(prof().ecName + ' has been told you’re back safe', 'verified'); });
  var share = document.getElementById('btn-share-link');
  if (share) {
    share.addEventListener('click', function () {
      var url = location.origin + '/safety.html#live';
      if (navigator.share) {
        navigator.share({ title: 'My ChaloSaath live location', text: 'Track my trip in Jibhi live:', url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { toast('Live link copied', 'link'); }).catch(function () {});
      }
    });
  }
  var siren = document.getElementById('btn-alarm');
  if (siren) {
    var ctx, osc;
    siren.addEventListener('click', function () {
      try {
        // The page's inline handler has already flipped the label by now
        var onNow = document.getElementById('alarm-text').innerText !== 'Activate Siren';
        if (osc) { osc.onended = null; osc.stop(); osc = null; }
        buzz(onNow ? [200, 100, 200, 100, 200] : 10);
        if (!onNow) return;
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        osc = ctx.createOscillator();
        var gain = ctx.createGain(); gain.gain.value = 0.15;
        osc.type = 'square';
        var t = ctx.currentTime;
        for (var i = 0; i < 60; i++) osc.frequency.setValueAtTime(i % 2 ? 960 : 1400, t + i * 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(t + 24);
        osc.onended = function () { osc = null; siren.click(); };
      } catch (e) {}
    });
  }

  // Sheets and drawers sit above the tab bar
  ['beacon-modal-overlay', 'map-drawer'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.zIndex = '70';
  });
})();
