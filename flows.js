/* ChaloSaath · end-to-end flows that need their own screens:
   notifications, edit profile, community safety guide, beacon map,
   and the Safety page's check-in, privacy toggles and cab booking. */
(function () {
  'use strict';
  var toast = function (m, i) { (window.csToast || function () {})(m, i); };
  var ls = window.csLs || { get: function (k, d) { return d; }, set: function () {} };
  var prof = window.csProfile || function () { return { name: 'Minali Rao', base: 'Jibhi, Kullu Valley', ecName: 'Priya', ecRel: 'sister', ecPhone: '+91 98765 43210' }; };
  var buzz = function (ms) {
    try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms || 6); } catch (e) {}
  };
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var page = location.pathname.replace(/index\.html$/, '') || '/';

  // ---------- Generic bottom sheet (same look as the filter sheet) ----------
  function sheet(title, bodyHTML, footHTML, onClick) {
    var el = document.createElement('div');
    el.className = 'cs-fsheet';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', title);
    el.innerHTML = '<div class="panel"><div class="grab"></div>' +
      '<div class="fhead"><h3>' + esc(title) + '</h3><button type="button" class="fx" data-x aria-label="Close"><span class="material-symbols-outlined">close</span></button></div>' +
      '<div class="fbody">' + bodyHTML + '</div>' + (footHTML ? '<div class="ffoot">' + footHTML + '</div>' : '') + '</div>';
    document.body.appendChild(el);
    function close() {
      el.classList.remove('open'); document.documentElement.style.overflow = '';
      setTimeout(function () { el.remove(); }, 450);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    el.addEventListener('click', function (e) {
      if (e.target === el || e.target.closest('[data-x]')) { close(); return; }
      if (onClick) onClick(e, close, el);
    });
    document.documentElement.style.overflow = 'hidden';
    void el.offsetWidth; el.classList.add('open');
    buzz(6);
    return { el: el, close: close };
  }

  // ---------- Profile: apply saved edits everywhere on the page ----------
  var DEFAULTS = { name: 'Minali Rao', ecName: 'Priya', ecRel: 'sister' };
  var applied = { name: DEFAULTS.name, ecName: DEFAULTS.ecName, ecRel: DEFAULTS.ecRel };
  function applyProfile() {
    var p = prof();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n, edits = [];
    while ((n = walker.nextNode())) {
      var t = n.nodeValue, o = t;
      if (applied.name !== p.name) t = t.split(applied.name).join(p.name);
      if (applied.ecRel !== p.ecRel) t = t.split('(' + applied.ecRel + ')').join('(' + p.ecRel + ')');
      if (applied.ecName !== p.ecName) t = t.replace(new RegExp('\\b' + applied.ecName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), p.ecName);
      if (t !== o) edits.push([n, t]);
    }
    edits.forEach(function (e) { e[0].nodeValue = e[1]; });
    applied = { name: p.name, ecName: p.ecName, ecRel: p.ecRel };
    var g = document.getElementById('greeting');
    if (g) g.textContent = g.textContent.replace(/,\s*.*$/, ', ' + p.name.split(' ')[0]);
  }
  applyProfile();

  window.csEditProfile = function () {
    var p = prof();
    var field = function (id, label, val, type, hint) {
      return '<label class="cs-field"><span>' + label + '</span><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val) + '" autocomplete="off"' + (hint ? ' placeholder="' + esc(hint) + '"' : '') + '></label>';
    };
    var s = sheet('Edit profile',
      '<div class="fsec"><h4>About you</h4>' + field('pf-name', 'Name', p.name) + field('pf-base', 'Staying in', p.base, 'text', 'e.g. Jibhi, Kullu Valley') + '</div>' +
      '<div class="fsec"><h4>Emergency contact</h4><p class="cs-help">Gets your live location during check-ins and SOS.</p>' +
        field('pf-ec', 'Name', p.ecName) + field('pf-rel', 'Relationship', p.ecRel, 'text', 'e.g. sister, friend') + field('pf-phone', 'Phone', p.ecPhone, 'tel', '+91 …') + '</div>',
      '<button type="button" class="reset" data-x>Cancel</button><button type="button" class="apply" data-save>Save changes</button>',
      function (e, close, el) {
        if (!e.target.closest('[data-save]')) return;
        var v = function (id) { return el.querySelector('#' + id).value.trim(); };
        var next = { name: v('pf-name'), base: v('pf-base'), ecName: v('pf-ec'), ecRel: v('pf-rel'), ecPhone: v('pf-phone') };
        var bad = !next.name ? 'pf-name' : !next.ecName ? 'pf-ec' : !/^\+?[\d\s-]{8,}$/.test(next.ecPhone) ? 'pf-phone' : '';
        if (bad) {
          var inp = el.querySelector('#' + bad); inp.closest('.cs-field').classList.add('err'); inp.focus();
          toast(bad === 'pf-phone' ? 'Enter a valid phone number for your contact' : 'This field can’t be empty', 'error');
          return;
        }
        if (!next.ecRel) next.ecRel = 'contact';
        ls.set('cs-profile', next);
        applyProfile();
        close(); buzz([10, 40, 10]);
        toast('Profile saved', 'check_circle');
      });
    s.el.addEventListener('input', function (e) { var f = e.target.closest('.cs-field'); if (f) f.classList.remove('err'); });
  };

  // ---------- Notifications (bell on Right Now) ----------
  var NOTES = [
    { id: 'n1', icon: 'diversity_3', title: 'Pooja started a beacon nearby', sub: 'Sunset Chai & Journaling · Café Jungle Valley · 800 m', go: '/meetups.html', when: '5 min ago' },
    { id: 'n2', icon: 'hiking', title: 'Waterfall walk leaves in 40 min', sub: 'Rohan K., a verified local guide, has 1 spot left', go: '/meetups.html', when: '12 min ago' },
    { id: 'n3', icon: 'schedule', title: 'Evening check-in closes at 10:30 PM', sub: 'Tap “I’m back safe” when you reach your stay', go: '/safety.html', when: '1 hr ago' },
    { id: 'n4', icon: 'spa', title: 'New women-vetted spot', sub: 'Glasshouse Tea Garden · 12 min walk', go: '/', when: 'Today' }
  ];
  var bell = document.getElementById('bellNotificationBtn');
  function unread() { var r = ls.get('cs-notes-read', []); return NOTES.filter(function (n) { return r.indexOf(n.id) === -1; }); }
  function syncBell() {
    if (!bell) return;
    var dot = bell.querySelector('span:not(.material-symbols-outlined)');
    if (dot) dot.style.display = unread().length ? '' : 'none';
    bell.setAttribute('aria-label', 'Notifications' + (unread().length ? ', ' + unread().length + ' unread' : ''));
  }
  if (bell) {
    bell.setAttribute('role', 'button'); bell.setAttribute('tabindex', '0');
    syncBell();
    var openNotes = function () {
      var read = ls.get('cs-notes-read', []);
      var rows = NOTES.map(function (n) {
        var isNew = read.indexOf(n.id) === -1;
        return '<a class="cs-note' + (isNew ? ' new' : '') + '" href="' + n.go + '" data-note="' + n.id + '">' +
          '<span class="ic"><span class="material-symbols-outlined">' + n.icon + '</span></span>' +
          '<span class="t"><b>' + esc(n.title) + '</b><small>' + esc(n.sub) + '</small><em>' + esc(n.when) + '</em></span>' +
          (isNew ? '<i aria-label="Unread"></i>' : '') + '</a>';
      }).join('');
      sheet('Notifications', '<div class="cs-notes">' + rows + '</div>',
        '<button type="button" class="apply" data-readall' + (unread().length ? '' : ' disabled') + '>Mark all as read</button>',
        function (e, close, el) {
          if (e.target.closest('[data-readall]')) {
            ls.set('cs-notes-read', NOTES.map(function (n) { return n.id; }));
            el.querySelectorAll('.cs-note').forEach(function (r) { r.classList.remove('new'); var i = r.querySelector('i'); if (i) i.remove(); });
            e.target.closest('[data-readall]').disabled = true;
            syncBell(); toast('All caught up', 'done_all'); return;
          }
          var a = e.target.closest('[data-note]'); if (!a) return;
          var r = ls.get('cs-notes-read', []); if (r.indexOf(a.dataset.note) === -1) { r.push(a.dataset.note); ls.set('cs-notes-read', r); }
          syncBell();
          if (a.getAttribute('href') === '/' && page === '/') {
            e.preventDefault(); close();
            var s = document.getElementById('spotSearch');
            if (s) { s.value = 'Glasshouse'; s.dispatchEvent(new Event('input')); setTimeout(function () { document.getElementById('deck').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); }
          }
        });
    };
    bell.addEventListener('click', openNotes);
    bell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNotes(); } });
  }

  // ---------- Community safety guide (shield on Meetups) ----------
  var guideBtn = document.querySelector('[aria-label="Quick Safety Guide"]');
  if (guideBtn) guideBtn.addEventListener('click', function () {
    var rule = function (icon, t, s) { return '<div class="cs-rule"><span class="ic"><span class="material-symbols-outlined">' + icon + '</span></span><span><b>' + t + '</b><small>' + s + '</small></span></div>'; };
    sheet('Community safety code',
      '<div class="cs-rules">' +
        rule('wb_sunny', 'Daylight & public places only', 'Beacons run in verified cafés, trailheads and viewpoints — never private rooms.') +
        rule('verified_user', 'Everyone is verified', 'ID and live selfie checked before anyone can join or host.') +
        rule('no_drinks', 'No alcohol on treks', 'Keep trails sober; hosts can remove anyone who doesn’t.') +
        rule('front_hand', 'You can say no', 'Hosts accept or decline requests, and you can leave any meetup at any time.') +
        rule('lock', 'Numbers stay private', 'Chat inside ChaloSaath; share your number only if you choose to.') +
        rule('share_location', 'Check in when you’re back', 'Your emergency contact is alerted if you don’t check in after sundown.') +
      '</div>',
      '<a class="reset" href="tel:1091" style="display:grid;place-items:center;text-decoration:none">Call 1091</a><button type="button" class="apply" data-report>Report a concern</button>',
      function (e, close) {
        if (!e.target.closest('[data-report]')) return;
        close(); setTimeout(openReport, 250);
      });
  });
  function openReport() {
    var reasons = ['Made me uncomfortable', 'Unsafe venue', 'Fake profile', 'Asked for my number', 'Something else'];
    sheet('Report a concern',
      '<div class="fsec"><h4>What happened?</h4><div class="opts">' + reasons.map(function (r, i) {
        return '<button type="button" class="cs-opt" data-r="' + i + '" aria-pressed="false">' + r + '</button>';
      }).join('') + '</div></div>' +
      '<div class="fsec"><label class="cs-field"><span>Details (optional)</span><textarea id="rp-text" rows="3" placeholder="Who, where, when…"></textarea></label>' +
      '<p class="cs-help">Reports are private. Our safety team reviews them within 15 minutes, 24/7.</p></div>',
      '<button type="button" class="apply" data-send disabled>Send report</button>',
      function (e, close, el) {
        var o = e.target.closest('[data-r]');
        if (o) {
          el.querySelectorAll('[data-r]').forEach(function (b) { b.setAttribute('aria-pressed', b === o); });
          el.querySelector('[data-send]').disabled = false; return;
        }
        var send = e.target.closest('[data-send]'); if (!send || send.disabled) return;
        send.disabled = true; send.innerHTML = '<span class="cs-spin" style="display:inline-block;vertical-align:-4px"></span>';
        setTimeout(function () { close(); buzz([10, 40, 10]); toast('Report sent · our safety team will reply in the chat', 'verified_user'); }, 900);
      });
  }

  // ---------- Beacon map: show the venue that was tapped ----------
  var drawer = document.getElementById('map-drawer');
  var COORDS = [
    [/Jungle Valley/i, 31.5876, 77.3478], [/Waterfall/i, 31.5899, 77.3447], [/Mudhouse/i, 31.5862, 77.3503],
    [/Bahu/i, 31.5978, 77.3528], [/Hosteller/i, 31.5841, 77.3523], [/Riverstone|Riverside/i, 31.5868, 77.3486]
  ];
  if (drawer) {
    var mapBox = drawer.querySelector('[data-location]');
    var title = drawer.querySelector('h3'), sub = drawer.querySelector('h3 + p');
    var pill = mapBox && mapBox.querySelector('span:last-child');
    var dismiss = document.getElementById('dismiss-map-btn');
    var dir = document.createElement('a');
    dir.className = 'w-full h-11 rounded-full text-white font-label-md text-label-md flex items-center justify-center gap-2';
    dir.style.background = '#131b2e';
    dir.target = '_blank'; dir.rel = 'noopener';
    dir.innerHTML = '<span class="material-symbols-outlined text-[18px]">directions_walk</span><span>Get walking directions</span>';
    if (dismiss) dismiss.parentNode.insertBefore(dir, dismiss);
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.venue-map-trigger'); if (!t) return;
      var card = t.closest('article'); if (!card) return;
      var pin = Array.prototype.filter.call(card.querySelectorAll('.material-symbols-outlined'), function (i) { return i.textContent.trim() === 'location_on'; })[0];
      var place = pin ? pin.parentElement.textContent.replace('location_on', '').replace(/^[^A-Za-z]+/, '').trim() : 'Jibhi';
      var host = card.dataset.mine ? 'You' : ((card.querySelector('.join-btn') || {}).getAttribute ? card.querySelector('.join-btn').getAttribute('data-host') : '');
      var c = COORDS.filter(function (x) { return x[0].test(place); })[0] || [null, 31.5869, 77.349];
      var lat = c[1], lon = c[2], d = 0.006;
      title.textContent = place;
      if (sub) sub.textContent = (host === 'You' ? 'Your beacon' : 'Hosted by ' + host) + ' · Verified daylight venue · Jibhi';
      if (pill) pill.textContent = place;
      if (mapBox && !mapBox.querySelector('iframe')) {
        mapBox.style.position = 'relative';
        // Drawn fallback map (river, roads, pin) so the box is never empty if the live map can't load
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice">' +
          '<rect width="400" height="180" fill="#e8efe4"/>' +
          '<path d="M0 30 C80 10 120 60 200 50 S320 20 400 40 L400 0 L0 0Z" fill="#d6e4cf"/>' +
          '<path d="M0 150 C70 120 150 170 230 135 S340 110 400 130 L400 180 L0 180Z" fill="#d6e4cf"/>' +
          '<path d="M-10 120 C60 100 110 130 180 105 S300 70 410 90" stroke="#9cc6e0" stroke-width="16" fill="none" stroke-linecap="round"/>' +
          '<path d="M30 0 C60 60 120 80 170 90 S260 120 300 180" stroke="#fff" stroke-width="7" fill="none"/>' +
          '<path d="M0 70 C100 75 200 60 400 70" stroke="#fff" stroke-width="5" fill="none"/>' +
          '<g transform="translate(200 78)"><circle r="22" fill="#253368" opacity=".15"/><path d="M0 -20 C-11 -20 -18 -12 -18 -3 C-18 9 0 22 0 22 C0 22 18 9 18 -3 C18 -12 11 -20 0 -20Z" fill="#d92534"/><circle cy="-4" r="6" fill="#fff"/></g></svg>';
        mapBox.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
        mapBox.style.backgroundSize = 'cover';
        var f = document.createElement('iframe');
        f.title = 'Map'; f.loading = 'lazy';
        f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:16px';
        mapBox.insertBefore(f, mapBox.firstChild);
        var tag = mapBox.querySelector('div'); if (tag) { tag.style.position = 'absolute'; tag.style.bottom = '10px'; tag.style.left = '50%'; tag.style.transform = 'translateX(-50%)'; tag.style.zIndex = '1'; tag.style.whiteSpace = 'nowrap'; }
      }
      var fr = mapBox && mapBox.querySelector('iframe');
      if (fr) fr.src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + (lon - d) + '%2C' + (lat - d * 0.7) + '%2C' + (lon + d) + '%2C' + (lat + d * 0.7) + '&layer=mapnik&marker=' + lat + '%2C' + lon;
      dir.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(place + ', Jibhi, Himachal Pradesh') + '&travelmode=walking';
      // also open it for map buttons the page's own script doesn't know about (your beacons)
      drawer.classList.remove('hidden'); drawer.classList.add('flex');
    }, true);
  }

  // ---------- Safety page ----------
  var checkBtn = document.getElementById('btn-back-safe');
  if (checkBtn) {
    var orig = { html: checkBtn.innerHTML, cls: checkBtn.className };
    var restart = document.createElement('button');
    restart.type = 'button';
    restart.className = 'w-full h-11 rounded-full font-label-md text-label-md flex items-center justify-center gap-2';
    restart.style.cssText = 'background:#eef2f9;color:#1e2756;display:none';
    restart.innerHTML = '<span class="material-symbols-outlined text-[18px]">restart_alt</span><span>Start a new check-in</span>';
    checkBtn.insertAdjacentElement('afterend', restart);
    var status = Array.prototype.filter.call(document.querySelectorAll('span'), function (s) { return /Evening Check-In Active/.test(s.textContent); })[0];
    var bar = document.querySelector('#checkin-container') && document.querySelector('#checkin-container').closest('section').querySelector('.h-2 > div');
    function safeState(at) {
      if (typeof confirmSafeCheckin === 'function') confirmSafeCheckin();
      checkBtn.querySelector('span:last-child').textContent = 'Checked in safe at ' + at;
      restart.style.display = 'flex';
      if (status) status.textContent = 'Check-in complete';
      if (bar) bar.style.width = '100%';
    }
    var saved = ls.get('cs-checkin', null);
    if (saved && saved.state === 'safe') safeState(saved.at);
    checkBtn.addEventListener('click', function () {
      var at = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      ls.set('cs-checkin', { state: 'safe', at: at });
      setTimeout(function () { safeState(at); }, 0);
    });
    restart.addEventListener('click', function () {
      ls.set('cs-checkin', null);
      checkBtn.className = orig.cls; checkBtn.innerHTML = orig.html; checkBtn.disabled = false;
      restart.style.display = 'none';
      if (status) status.textContent = 'Evening Check-In Active';
      if (bar) bar.style.width = '';
      buzz(8); toast('Check-in started · ' + prof().ecName + ' can see your live location until 10:30 PM', 'share_location');
    });
  }

  // Privacy toggles: labelled, explained, and remembered
  var switches = Array.prototype.slice.call(document.querySelectorAll('button[role="switch"][onclick]'));
  var MSG = [
    ['Only verified women can see your profile and beacons', 'Your profile is visible to all verified travellers'],
    ['Ghost Mode on · your pin is blurred within 250 m', 'Ghost Mode off · your exact pin is shown to people you meet'],
    [function () { return prof().ecName + ' will be alerted if you don’t check in after sundown'; }, 'Sundown check-in alerts are off']
  ];
  var priv = ls.get('cs-privacy', null);
  switches.forEach(function (sw, i) {
    var row = sw.parentElement, t = row.querySelector('.font-semibold');
    if (t) sw.setAttribute('aria-label', t.textContent.trim());
    if (priv && typeof priv[i] === 'boolean' && (sw.getAttribute('aria-checked') === 'true') !== priv[i] && typeof toggleSwitch === 'function') toggleSwitch(sw);
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') === 'true';
      var state = switches.map(function (x) { return x.getAttribute('aria-checked') === 'true'; });
      ls.set('cs-privacy', state);
      var m = MSG[i] ? MSG[i][on ? 0 : 1] : (on ? 'On' : 'Off');
      toast(typeof m === 'function' ? m() : m, on ? 'toggle_on' : 'toggle_off');
    });
  });

  // Cab: request → booked (driver, plate, ETA) → cancel
  var cabBtn = Array.prototype.filter.call(document.querySelectorAll('button'), function (b) { return /Book a cab/.test(b.textContent); })[0];
  if (cabBtn) {
    var cabCard = cabBtn.parentElement;
    var cabTitle = cabCard.querySelector('p'), cabSub = cabCard.querySelectorAll('p')[1], eta = cabCard.querySelector('.rounded-full');
    var idle = { html: cabBtn.innerHTML, t: cabTitle && cabTitle.textContent, s: cabSub && cabSub.textContent, e: eta && eta.textContent };
    function booked(b) {
      var mins = Math.max(1, Math.round((b.at + 6 * 60000 - Date.now()) / 60000));
      if (cabTitle) cabTitle.textContent = 'Ramesh · HP-66 4821';
      if (cabSub) cabSub.textContent = 'White Bolero · ★ 4.9 · shared with ' + prof().ecName;
      if (eta) eta.textContent = mins + ' min';
      cabBtn.innerHTML = '<span>Cancel cab</span>'; cabBtn.dataset.state = 'booked';
      cabBtn.style.background = '#fdecee'; cabBtn.style.color = '#b3121f';
    }
    function reset() {
      cabBtn.innerHTML = idle.html; cabBtn.dataset.state = ''; cabBtn.style.background = ''; cabBtn.style.color = '';
      if (cabTitle) cabTitle.textContent = idle.t; if (cabSub) cabSub.textContent = idle.s; if (eta) eta.textContent = idle.e;
    }
    var cab = ls.get('cs-cab', null);
    if (cab && Date.now() - cab.at < 30 * 60000) booked(cab); else ls.set('cs-cab', null);
    cabBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var st = cabBtn.dataset.state || '';
      if (st === '') {
        cabBtn.dataset.state = 'busy'; cabBtn.disabled = true;
        cabBtn.innerHTML = '<span class="cs-spin" style="width:14px;height:14px;border-width:2px"></span><span>Finding a driver…</span>';
        setTimeout(function () {
          cabBtn.disabled = false;
          var b = { at: Date.now() }; ls.set('cs-cab', b); booked(b);
          buzz([10, 40, 10]); toast('Cab confirmed · Ramesh is 6 min away · trip shared with ' + prof().ecName, 'local_taxi');
        }, 1500);
      } else if (st === 'booked') {
        cabBtn.dataset.state = 'sure'; cabBtn.innerHTML = '<span>Tap to confirm cancel</span>';
        setTimeout(function () { if (cabBtn.dataset.state === 'sure') booked(ls.get('cs-cab', { at: Date.now() })); }, 2500);
      } else if (st === 'sure') {
        ls.set('cs-cab', null); reset(); toast('Cab cancelled', 'cancel');
      }
    });
  }
})();
