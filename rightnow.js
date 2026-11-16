/* ChaloSaath · Right Now — mood chips, filterable swipe deck, venue sheet, saved list */
(function () {
  'use strict';

  // ---------- Photos available for venues (set by the page) ----------
  var P = window.CS_PHOTOS || {};
  // Openly licensed photos from Wikimedia Commons (credited in the venue sheet)
  var CREDITS = {"waterfall": {"by": "Rohan Pinto", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Jibhi_Waterfall,_Jibhi,_Himachal_Pradesh.jpg"}, "serolsar": {"by": "Skp098", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Serolsar_Lake,_Jalori_Pass.jpg"}, "angling": {"by": "Debashritaiitmandi", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Tirthan_River_Tirthan_Valley_DSC00968.jpg"}, "raghupur": {"by": "Gannu03", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Raghupur_Fort_in_Himachal_Pradesh_01.jpg"}, "bahu": {"by": "Rajani Gairshail", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Bahu_village,_Banjar,_Himachal_Pradesh.jpg"}};

  // ---------- Illustrated scenes for outdoor spots ----------
  var PALETTES = {
    forest: { sky: ['#bfe3ff', '#eef8ff'], far: '#8fb3cf', mid: '#5b8a6f', near: '#2f5a45', sun: '#fff3c4', trees: '#24493a' },
    snow:   { sky: ['#8fc2ec', '#e6f2ff'], far: '#f7fbff', mid: '#8ea9c2', near: '#3e5a73', sun: '#ffffff', trees: '#2c4a5f', snow: true },
    river:  { sky: ['#a6d8e8', '#f0fbff'], far: '#8fb6cb', mid: '#5a8f7b', near: '#36705c', sun: '#fff6d8', water: '#4f9cc2' },
    dawn:   { sky: ['#ffc4a3', '#ffeedd'], far: '#d3a2ad', mid: '#86709a', near: '#3e4266', sun: '#ffe6b0', trees: '#2f3354' },
    meadow: { sky: ['#b9e1f5', '#f3fcff'], far: '#a6bfd6', mid: '#86b56f', near: '#4f8b45', sun: '#fff7cf' },
    sunset: { sky: ['#ff9566', '#ffd59e'], far: '#c47684', mid: '#71507a', near: '#2f2b50', sun: '#ffe38f', trees: '#231f3d' },
    night:  { sky: ['#0b1834', '#2a3d70'], far: '#2a3a68', mid: '#1b2649', near: '#0e1630', moon: true, fire: true, trees: '#0a1126' },
    dusk:   { sky: ['#46578c', '#d49fb0'], far: '#7e7aa6', mid: '#4b4d7e', near: '#262a4d', sun: '#ffd7b0', trees: '#1c2040' }
  };
  function scene(kind) {
    var c = PALETTES[kind] || PALETTES.forest;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.sky[0] + '"/><stop offset="1" stop-color="' + c.sky[1] + '"/></linearGradient></defs>' +
      '<rect width="400" height="520" fill="url(#g)"/>';
    if (c.moon) {
      s += '<circle cx="300" cy="90" r="26" fill="#f4f1de"/><circle cx="312" cy="82" r="24" fill="' + c.sky[0] + '"/>';
      for (var i = 0; i < 40; i++) s += '<circle cx="' + ((i * 97) % 400) + '" cy="' + ((i * 53) % 230) + '" r="' + (i % 3 ? 1 : 1.6) + '" fill="#fff" opacity="' + (0.4 + (i % 5) / 10) + '"/>';
    } else if (c.sun) {
      s += '<circle cx="290" cy="120" r="38" fill="' + c.sun + '" opacity=".9"/>';
    }
    s += '<path d="M0 300 L70 200 L120 250 L190 150 L260 240 L320 180 L400 260 L400 520 L0 520Z" fill="' + c.far + '"/>';
    if (c.snow) s += '<path d="M190 150 L170 180 L185 175 L195 190 L205 172 L222 183Z M320 180 L305 200 L318 197 L330 205Z" fill="#fff"/>';
    s += '<path d="M0 360 L80 280 L150 330 L230 260 L300 320 L400 270 L400 520 L0 520Z" fill="' + c.mid + '"/>';
    if (c.water) {
      s += '<path d="M0 430 Q100 400 200 425 T400 415 L400 520 L0 520Z" fill="' + c.water + '"/><path d="M40 455 h60 M180 470 h80 M300 450 h50" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>';
      s += '<path d="M0 410 Q120 380 220 405 T400 395 L400 420 Q300 430 200 420 T0 440Z" fill="' + c.near + '"/>';
    } else {
      s += '<path d="M0 420 Q100 370 210 400 T400 380 L400 520 L0 520Z" fill="' + c.near + '"/>';
    }
    if (c.trees) {
      [[30, 400], [62, 392], [330, 380], [362, 388], [392, 376]].forEach(function (t) {
        s += '<path d="M' + t[0] + ' ' + (t[1] - 70) + ' L' + (t[0] - 18) + ' ' + t[1] + ' L' + (t[0] + 18) + ' ' + t[1] + 'Z" fill="' + c.trees + '"/>';
      });
    }
    if (c.fire) {
      s += '<circle cx="200" cy="440" r="60" fill="#ff9a3c" opacity=".18"/><path d="M200 410 C185 430 190 445 200 450 C210 445 215 430 200 410Z" fill="#ffb347"/><path d="M200 425 C194 435 196 444 200 447 C204 444 206 435 200 425Z" fill="#fff1b8"/>';
    }
    s += '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
  }

  // ---------- Content ----------
  var MOODS = [
    { id: 'all', emoji: '✨', label: 'For you' },
    { id: 'adventure', emoji: '🥾', label: 'Adventure' },
    { id: 'eat', emoji: '🍜', label: 'Eat' },
    { id: 'chill', emoji: '☕', label: 'Chill' },
    { id: 'meet', emoji: '🤝', label: 'Meet people' },
    { id: 'work', emoji: '💻', label: 'Work' },
    { id: 'wellness', emoji: '🧘', label: 'Wellness' },
    { id: 'sights', emoji: '📸', label: 'Sightseeing' }
  ];

  var SPOTS = [
    {
      id: 'mudhouse', title: 'The Mudhouse Café & Roastery', type: 'Café', moods: ['eat', 'chill', 'work'], photo: 'P1',
      km: 0.65, mins: 8, mode: 'walk', hours: 'Closes 10 PM', safety: 98, rating: 4.9, reviews: 218, vetted: true,
      quote: 'Woodstove seating, a solo-friendly counter and fast Wi-Fi by the river',
      tags: [['location_on', 'Main Tirthan–Jibhi Rd'], ['lightbulb', 'Well-lit path'], ['wifi', 'Wi-Fi + 4G']],
      metric: ['volume_down', '38 dB', 'Quiet'],
      why: [['table_restaurant', 'Solo counter seating', 'A window counter so eating alone feels natural, not awkward.'],
            ['lightbulb', 'Well-lit entrance', 'Faces the main road with streetlights until midnight.'],
            ['face_3', 'Women staff on every shift', 'A verified host is always around if you need a hand.'],
            ['gavel', 'Zero-harassment policy', 'Staff trained to step in; incidents go straight to ChaloSaath.']],
      meter: ['Ambient noise', 25, 'Low · Peaceful', 'Soft acoustic music, mostly solo travellers reading or working.'],
      cta: 'beacon', maps: 'The Mudhouse Cafe Jibhi'
    },
    {
      id: 'waterfall', title: 'Jibhi Waterfall Trail', type: 'Day hike', moods: ['adventure', 'sights'], scene: 'forest', img: 'waterfall',
      km: 1.5, mins: 20, mode: 'walk', hours: 'Best 7 AM – 4 PM', safety: 95, rating: 4.8, reviews: 412, vetted: true,
      quote: 'Pine-forest walk over wooden bridges to a 30 ft waterfall',
      tags: [['hiking', 'Easy · 1.5 km'], ['groups', 'Group walk 10 AM'], ['signal_cellular_alt', 'Signal on trail']],
      metric: ['landscape', 'Easy', 'Difficulty'],
      why: [['groups', 'Daily group walks', 'Verified travellers leave the bridge together at 10 AM and 2 PM.'],
            ['signpost', 'Marked trail', 'Clear signboards and railings on every bridge crossing.'],
            ['wb_sunny', 'Daylight only', 'ChaloSaath nudges you to head back by 4:30 PM.'],
            ['local_police', 'Forest guard post', 'Staffed hut at the trailhead with a first-aid kit.']],
      meter: ['Trail difficulty', 25, 'Easy', 'A gentle 150 m climb. Wear grippy shoes after rain.'],
      cta: 'trek', maps: 'Jibhi Waterfall'
    },
    {
      id: 'serolsar', title: 'Serolsar Lake Trek via Jalori Pass', type: 'Trek', moods: ['adventure', 'sights'], scene: 'snow', img: 'serolsar',
      km: 17, mins: 35, mode: 'drive', hours: 'Start before 10 AM', safety: 92, rating: 4.9, reviews: 530, vetted: true,
      quote: 'A 5 km ridge trail through oak forest to a sacred alpine lake',
      tags: [['hiking', 'Moderate · 10 km return'], ['badge', 'Verified guides'], ['directions_car', 'Shared taxi']],
      metric: ['terrain', '3,120 m', 'Altitude'],
      why: [['badge', 'Verified local guides', 'ID-checked guides with ChaloSaath ratings from solo women.'],
            ['groups', 'Women-friendly groups', 'Join a small group instead of trekking alone.'],
            ['medical_services', 'First aid at Jalori', 'Dhaba owners keep oxygen and a first-aid kit at the pass.'],
            ['wb_sunny', 'Back by 4 PM', 'Live check-in reminders so you are off the ridge before dusk.']],
      meter: ['Trail difficulty', 60, 'Moderate', 'Steady climb at altitude. Carry layers, water and snacks.'],
      cta: 'trek', maps: 'Serolsar Lake'
    },
    {
      id: 'riverstone', title: 'Riverstone Café', type: 'Café', moods: ['chill', 'work', 'eat'], photo: 'P2',
      km: 0.35, mins: 4, mode: 'walk', hours: 'Open till 9 PM', safety: 100, rating: 4.8, reviews: 164, vetted: true,
      quote: 'Quiet corner tables over the stream and the best ginger chai in Jibhi',
      tags: [['deck', 'Riverside deck'], ['power', 'Charging points'], ['local_cafe', 'Great chai']],
      metric: ['volume_down', '42 dB', 'Calm'],
      why: [['visibility', 'Open, visible seating', 'Glass front and deck seating — never tucked away.'],
            ['face_3', 'Woman-owned', 'Run by a local family who know every regular.'],
            ['power', 'Charge your phone', 'Free charging at every table and a backup inverter.'],
            ['directions_walk', '4 min to the main road', 'Lit stone path back to the bus stop.']],
      meter: ['Ambient noise', 32, 'Calm', 'River sounds and low chatter. Good for calls.'],
      cta: 'beacon', maps: 'Jibhi Himachal Pradesh cafe'
    },
    {
      id: 'chehni', title: 'Chehni Kothi Heritage Hike', type: 'Heritage hike', moods: ['adventure', 'sights'], scene: 'dawn',
      km: 3, mins: 45, mode: 'walk', hours: 'Best 8 AM – 3 PM', safety: 96, rating: 4.8, reviews: 301, vetted: true,
      quote: 'Climb through apple orchards to a 1,500-year-old wooden tower',
      tags: [['hiking', 'Moderate · 3 km'], ['history_edu', 'Heritage site'], ['groups', 'Village guides']],
      metric: ['schedule', '2.5 hrs', 'Round trip'],
      why: [['home', 'Through the village', 'The path passes homes and orchards the whole way.'],
            ['groups', 'Village guides', 'Hire a vetted guide from the Chehni community for ₹500.'],
            ['signal_cellular_alt', 'Network coverage', 'Jio and Airtel signal along the entire route.'],
            ['wb_sunny', 'Daylight route', 'Shaded climb, comfortably done before afternoon.']],
      meter: ['Trail difficulty', 50, 'Moderate', 'Steep stone steps near the top; take it slow.'],
      cta: 'trek', maps: 'Chehni Kothi'
    },
    {
      id: 'yoga', title: 'Deodar Deck Women’s Yoga', type: 'Wellness class', moods: ['wellness', 'meet'], scene: 'meadow',
      km: 0.8, mins: 10, mode: 'walk', hours: 'Classes 7 AM & 5 PM', safety: 99, rating: 4.9, reviews: 88, vetted: true,
      quote: 'Women-only flow under deodar trees — mats and herbal tea included',
      tags: [['self_improvement', 'All levels'], ['female', 'Women only'], ['payments', '₹400 drop-in']],
      metric: ['self_improvement', '60 min', 'Session'],
      why: [['female', 'Women-only space', 'Verified women travellers and a woman instructor.'],
            ['lock', 'Private deck', 'Gated garden behind the homestay, away from the road.'],
            ['groups', 'Small groups', 'Never more than 10 people per class.'],
            ['lightbulb', 'Lit return path', 'Evening class ends with a lit walk back to the main road.']],
      meter: ['Intensity', 30, 'Gentle', 'Slow stretches and breathwork; great after a trek.'],
      cta: 'beacon', maps: 'Jibhi Himachal Pradesh'
    },
    {
      id: 'hostel', title: 'The Hosteller Common Room', type: 'Hostel lounge', moods: ['meet', 'work', 'chill'], scene: 'dusk',
      km: 1.2, mins: 15, mode: 'walk', hours: 'Game night 8 PM', safety: 97, rating: 4.7, reviews: 342, vetted: true,
      quote: 'Board games, jam sessions and verified travellers every evening',
      tags: [['sports_esports', 'Game night'], ['support_agent', 'Staff 24/7'], ['wifi', 'Fast Wi-Fi']],
      metric: ['groups', '20+', 'Travellers'],
      why: [['support_agent', 'Staff 24/7', 'Front desk is always staffed and knows ChaloSaath protocols.'],
            ['key', 'Keycard access', 'Only guests and verified visitors can enter the lounge.'],
            ['local_bar', 'No alcohol on site', 'A sober, relaxed common room.'],
            ['videocam', 'CCTV in common areas', 'Covering entrances and shared spaces.']],
      meter: ['Crowd level', 65, 'Lively', 'Busy after 8 PM; quiet corners by the fireplace.'],
      cta: 'beacon', maps: 'The Hosteller Jibhi'
    },
    {
      id: 'angling', title: 'Tirthan River Trout Angling', type: 'Outdoor activity', moods: ['adventure', 'chill'], scene: 'river', img: 'angling',
      km: 4, mins: 10, mode: 'drive', hours: '6 AM – 5 PM', safety: 94, rating: 4.6, reviews: 127, vetted: true,
      quote: 'Catch-and-release trout fishing with a licensed local guide',
      tags: [['phishing', 'Gear provided'], ['verified', 'Licensed guide'], ['water', 'Calm stretch']],
      metric: ['schedule', '3 hrs', 'Session'],
      why: [['verified', 'Licensed guides', 'Fisheries-department permits checked by ChaloSaath.'],
            ['pool', 'Shallow, calm water', 'Guides choose banks away from strong currents.'],
            ['groups', '1 guide · 3 guests', 'Small sessions, often with other solo travellers.'],
            ['directions_car', 'Pickup included', 'Verified cab from Jibhi and back.']],
      meter: ['Effort', 20, 'Relaxed', 'Mostly standing by the river; wear quick-dry clothes.'],
      cta: 'trek', maps: 'Tirthan River Gushaini'
    },
    {
      id: 'bahu', title: 'Bahu Village Sunset Point', type: 'Viewpoint', moods: ['sights', 'chill'], scene: 'sunset', img: 'bahu',
      km: 2.5, mins: 30, mode: 'walk', hours: 'Sunset ~5:30 PM', safety: 96, rating: 4.8, reviews: 199, vetted: true,
      quote: 'Golden-hour views over the Tirthan valley from a village plateau',
      tags: [['photo_camera', 'Golden hour'], ['groups', 'Sunset group 4:45 PM'], ['flashlight_on', 'Torch advised']],
      metric: ['wb_twilight', '5:31 PM', 'Sunset'],
      why: [['groups', 'Walk back together', 'A group beacon leaves the viewpoint right after sunset.'],
            ['home', 'Village plateau', 'Open fields beside homes, never isolated.'],
            ['flashlight_on', 'Torch station', 'Borrow a torch from the tea stall for the walk down.'],
            ['share_location', 'Auto check-in', 'Your contact is notified when you are back.']],
      meter: ['Trail difficulty', 35, 'Easy–moderate', 'A 30-minute uphill village path.'],
      cta: 'trek', maps: 'Bahu Village Jibhi'
    },
    {
      id: 'thali', title: 'Siddu & Thali House', type: 'Local food', moods: ['eat'], photo: 'P4',
      km: 0.5, mins: 6, mode: 'walk', hours: 'Open till 9:30 PM', safety: 97, rating: 4.7, reviews: 276, vetted: true,
      quote: 'Steamed siddu, Himachali thali and kadhi — eaten at cosy solo booths',
      tags: [['restaurant', 'Pure veg'], ['payments', '₹180 thali'], ['table_restaurant', 'Solo booths']],
      metric: ['restaurant_menu', '₹180', 'Thali'],
      why: [['table_restaurant', 'Solo booths', 'Partitioned seating so you can eat in peace.'],
            ['face_3', 'Family-run', 'The owner’s family serves every table.'],
            ['lightbulb', 'On the main road', 'Bright storefront right by the bus stop.'],
            ['verified', 'Hygiene checked', 'Rated by the ChaloSaath community each month.']],
      meter: ['Crowd level', 45, 'Moderate', 'Busy at lunch; easy to get a booth after 7 PM.'],
      cta: 'beacon', maps: 'Jibhi Bus Stand'
    },
    {
      id: 'glasshouse', title: 'Glasshouse Tea Garden', type: 'Tea garden', moods: ['wellness', 'chill'], photo: 'P3',
      km: 1, mins: 12, mode: 'walk', hours: 'Open till 8 PM', safety: 97, rating: 4.7, reviews: 96, vetted: true,
      quote: 'A sunlit greenhouse with herbal teas and quiet reading nooks',
      tags: [['spa', 'Herbal teas'], ['menu_book', 'Book swap'], ['wb_sunny', 'Sunlit']],
      metric: ['volume_down', '35 dB', 'Very quiet'],
      why: [['visibility', 'Glass walls', 'Fully visible from the path — calm but never hidden.'],
            ['face_3', 'Host on site', 'The owner lives next door and checks in on guests.'],
            ['lock', 'Gated garden', 'Single entrance with a bell.'],
            ['lightbulb', 'Lit path', 'Solar lamps along the walk back.']],
      meter: ['Ambient noise', 18, 'Very quiet', 'Birdsong and pages turning.'],
      cta: 'beacon', maps: 'Jibhi Himachal Pradesh'
    },
    {
      id: 'raghupur', title: 'Raghupur Fort Meadow Hike', type: 'Trek', moods: ['adventure', 'sights'], scene: 'meadow', img: 'raghupur',
      km: 18, mins: 40, mode: 'drive', hours: 'Start before 11 AM', safety: 89, rating: 4.8, reviews: 214, vetted: false,
      quote: 'Open meadows and 360° Himalayan views from old fort ruins',
      tags: [['hiking', 'Moderate · 6 km return'], ['signal_cellular_off', 'Patchy signal'], ['groups', 'Go with a group']],
      metric: ['terrain', '3,300 m', 'Altitude'],
      why: [['groups', 'Group recommended', 'Not yet women-vetted — join a group beacon for this one.'],
            ['signal_cellular_off', 'Patchy signal', 'Download offline maps before you start.'],
            ['medical_services', 'First aid at Jalori', 'Nearest help is back at the pass.'],
            ['wb_sunny', 'Daylight only', 'Plan to be back at Jalori by 4 PM.']],
      meter: ['Trail difficulty', 60, 'Moderate', 'Open ridge, can be windy. Carry a jacket.'],
      cta: 'trek', maps: 'Raghupur Fort'
    },
    {
      id: 'bonfire', title: 'Riverside Bonfire & Stargazing', type: 'Evening meetup', moods: ['meet', 'sights'], scene: 'night',
      km: 0.9, mins: 11, mode: 'walk', hours: '8 – 10:30 PM', safety: 90, rating: 4.6, reviews: 73, vetted: false,
      quote: 'Music, maggi and the Milky Way at a hosted campsite',
      tags: [['local_fire_department', 'Hosted bonfire'], ['nights_stay', 'Clear skies'], ['groups', '12 going']],
      metric: ['groups', '12', 'Going'],
      why: [['support_agent', 'Hosted by the campsite', 'Camp staff run the bonfire and stay till the end.'],
            ['local_bar', 'Alcohol-free', 'Hot chocolate and chai only.'],
            ['directions_walk', 'Group walk back', 'A host walks everyone back to the main road.'],
            ['info', 'Not women-vetted yet', 'Turn off Women-Only Vetted to see events like this.']],
      meter: ['Crowd level', 55, 'Social', 'A friendly circle of travellers; easy to join in.'],
      cta: 'beacon', maps: 'Jibhi Himachal Pradesh camp'
    }
  ];

  var DISTANCES = [
    { label: 'Any distance', km: Infinity },
    { label: 'Within 1 km', km: 1 },
    { label: 'Within 5 km', km: 5 },
    { label: 'Within 20 km', km: 20 }
  ];

  // ---------- State ----------
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('cs-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('cs-' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var state = {
    mood: 'all', dist: 0, vetted: true, query: '', modes: ['walk', 'drive'], minSafety: 0,
    list: [], index: 0, history: [],
    saved: store.get('saved', [])
  };

  var $ = function (id) { return document.getElementById(id); };
  var deck = $('deck'), counter = $('stackCounter'), progress = $('deckProgress');
  var toast = function (m) { (window.csToast || function () {})(m); };
  var buzz = function (ms) {
    try {
      if (!navigator.vibrate || (navigator.userActivation && !navigator.userActivation.hasBeenActive)) return;
      navigator.vibrate(ms || 8);
    } catch (e) {}
  };
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Photos: start downloading all of them as soon as the app opens. Until one arrives its card
  // shows a soft placeholder; if it ever fails, the illustrated scene is used instead.
  var IMG = {};
  function revealPhoto(id) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-img="' + id + '"]'), function (el) {
      if (IMG[id] === 'fail') { var sp = SPOTS.filter(function (x) { return x.img === id; })[0]; el.style.backgroundImage = scene(sp.scene); }
      el.classList.remove('ph');
    });
  }
  SPOTS.forEach(function (s) {
    if (!s.img || IMG[s.img]) return;
    IMG[s.img] = 'loading';
    var im = new Image();
    im.onload = function () { IMG[s.img] = 'ok'; revealPhoto(s.img); };
    im.onerror = function () { IMG[s.img] = 'fail'; revealPhoto(s.img); };
    im.src = '/img/' + s.img + '.jpg';
  });
  function bg(s) {
    if (s.img) return IMG[s.img] === 'fail' ? scene(s.scene) : 'url("/img/' + s.img + '.jpg")';
    return s.photo && P[s.photo] ? 'url("' + P[s.photo] + '")' : scene(s.scene);
  }
  function travel(s) { return (s.mode === 'drive' ? s.mins + ' min drive' : s.mins + ' min walk'); }
  function isSaved(id) { return state.saved.indexOf(id) !== -1; }

  // ---------- Mood chips ----------
  var chips = $('moodChips');
  chips.innerHTML = MOODS.map(function (m) {
    return '<button type="button" class="mood-chip" role="tab" data-mood="' + m.id + '" aria-selected="' + (m.id === state.mood) + '">' +
      '<span aria-hidden="true">' + m.emoji + '</span><span>' + m.label + '</span></button>';
  }).join('');
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.mood-chip'); if (!b) return;
    state.mood = b.dataset.mood;
    chips.querySelectorAll('.mood-chip').forEach(function (c) { c.setAttribute('aria-selected', c === b); });
    b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    buzz(); applyFilters(true);
  });

  // ---------- Distance popover ----------
  var distBtn = $('walkSelectorBtn'), distLabel = $('currentWalkTime'), distMenu = $('distMenu');
  function renderDistMenu() {
    distMenu.innerHTML = DISTANCES.map(function (d, i) {
      return '<button type="button" role="menuitemradio" aria-checked="' + (i === state.dist) + '" data-i="' + i + '">' +
        '<span>' + d.label + '</span><span class="material-symbols-outlined">check</span></button>';
    }).join('');
  }
  function toggleDist(open) {
    var willOpen = open !== undefined ? open : distMenu.hidden;
    distMenu.hidden = !willOpen; distBtn.setAttribute('aria-expanded', willOpen);
    if (willOpen) { renderDistMenu(); requestAnimationFrame(function () { distMenu.classList.add('open'); }); }
    else distMenu.classList.remove('open');
  }
  distBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleDist(); });
  distMenu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-i]'); if (!b) return;
    state.dist = +b.dataset.i; distLabel.textContent = DISTANCES[state.dist].label;
    toggleDist(false); buzz(); applyFilters(true);
  });
  document.addEventListener('click', function (e) { if (!distMenu.hidden && !e.target.closest('#distMenu')) toggleDist(false); });
  var tune = document.querySelector('[data-action="filters"]');
  function matches(v, s) {
    if (state.mood !== 'all' && s.moods.indexOf(state.mood) === -1) return false;
    if (s.km > DISTANCES[v.dist].km) return false;
    if (v.vetted && !s.vetted) return false;
    if (v.modes.indexOf(s.mode) === -1) return false;
    if (s.safety < v.minSafety) return false;
    return true;
  }
  function activeFilters() {
    return (state.dist ? 1 : 0) + (state.modes.length < 2 ? 1 : 0) + (state.minSafety ? 1 : 0) + (state.vetted ? 0 : 1);
  }
  window.csSyncFilterBadge = function () { if (tune && window.csFilterBadge) window.csFilterBadge(tune, activeFilters()); };
  if (tune) tune.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!window.csFilterSheet) { toggleDist(true); return; }
    toggleDist(false);
    window.csFilterSheet({
      title: 'Filters', noun: ['spot', 'spots'],
      value: { dist: state.dist, modes: state.modes.slice(), minSafety: state.minSafety, vetted: state.vetted },
      defaults: { dist: 0, modes: ['walk', 'drive'], minSafety: 0, vetted: true },
      sections: [
        { id: 'dist', title: 'Distance', type: 'single', options: DISTANCES.map(function (d, i) { return { v: i, label: d.label }; }) },
        { id: 'modes', title: 'Getting there', type: 'multi', options: [
          { v: 'walk', label: 'Walkable', icon: 'directions_walk' }, { v: 'drive', label: 'Short drive', icon: 'directions_car' }] },
        { id: 'minSafety', title: 'Safety score', type: 'single', options: [
          { v: 0, label: 'Any' }, { v: 95, label: '95% and up' }, { v: 98, label: '98% and up' }] },
        { id: 'vetted', type: 'switch', label: 'Women-only vetted', desc: 'Only spots checked and rated by solo women travellers.' }
      ],
      count: function (v) { return SPOTS.filter(function (s) { return matches(v, s); }).length; },
      onApply: function (v) {
        state.dist = v.dist; state.modes = v.modes; state.minSafety = v.minSafety; state.vetted = v.vetted;
        distLabel.textContent = DISTANCES[state.dist].label;
        vBtn.setAttribute('aria-pressed', state.vetted);
        vLabel.textContent = 'Women-Only Vetted: ' + (state.vetted ? 'ON' : 'OFF');
        applyFilters(true);
        toast(state.list.length + ' spot' + (state.list.length === 1 ? '' : 's') + ' match your filters');
      }
    });
  });

  // ---------- Women-only vetted toggle ----------
  var vBtn = $('vettedToggleBtn'), vLabel = $('toggleVettedLabel');
  vBtn.addEventListener('click', function () {
    state.vetted = !state.vetted;
    vBtn.setAttribute('aria-pressed', state.vetted);
    vLabel.textContent = 'Women-Only Vetted: ' + (state.vetted ? 'ON' : 'OFF');
    buzz(); applyFilters(true);
    toast(state.vetted ? 'Showing women-vetted spots only' : 'Showing all spots, including not-yet-vetted');
  });

  // ---------- Search ----------
  var search = $('spotSearch'), searchT;
  search.addEventListener('input', function () {
    clearTimeout(searchT);
    searchT = setTimeout(function () { state.query = search.value.trim().toLowerCase(); applyFilters(true); }, 180);
  });
  search.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); search.blur(); } });

  // ---------- Filtering ----------
  function applyFilters(animate) {
    var q = state.query, maxKm = DISTANCES[state.dist].km;
    state.list = SPOTS.filter(function (s) {
      if (state.mood !== 'all' && s.moods.indexOf(state.mood) === -1) return false;
      if (s.km > maxKm) return false;
      if (state.vetted && !s.vetted) return false;
      if (state.modes.indexOf(s.mode) === -1) return false;
      if (s.safety < state.minSafety) return false;
      if (q) {
        var hay = (s.title + ' ' + s.type + ' ' + s.quote + ' ' + s.tags.map(function (t) { return t[1]; }).join(' ') + ' ' +
          s.moods.map(function (m) { var o = MOODS.filter(function (x) { return x.id === m; })[0]; return o ? o.label : ''; }).join(' ')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    state.index = 0; state.history = [];
    if (window.csSyncFilterBadge) window.csSyncFilterBadge();
    if (animate) {
      deck.classList.add('refresh');
      setTimeout(function () { deck.innerHTML = ''; render(); deck.classList.remove('refresh'); }, 160);
    } else { render(); }
  }

  // ---------- Deck rendering ----------
  function cardHTML(s) {
    var tags = s.tags.map(function (t) {
      return '<span class="tag"><span class="material-symbols-outlined">' + t[0] + '</span>' + esc(t[1]) + '</span>';
    }).join('');
    return '' +
      '<div class="card-bg' + (s.img && IMG[s.img] === 'loading' ? ' ph' : '') + '"' + (s.img ? ' data-img="' + s.img + '"' : '') + ' style="background-image:' + bg(s).replace(/"/g, '&quot;') + '"></div>' +
      '<div class="card-shade"></div>' +
      '<div class="stamp stamp-save"><span class="material-symbols-outlined">favorite</span>Save</div>' +
      '<div class="stamp stamp-skip"><span class="material-symbols-outlined">close</span>Skip</div>' +
      '<div class="card-top">' +
        '<span class="pill"><span class="material-symbols-outlined">' + (s.mode === 'drive' ? 'directions_car' : 'directions_walk') + '</span>' + travel(s) + ' · ' + esc(s.hours) + '</span>' +
        '<button type="button" class="card-heart" data-act="heart" aria-pressed="' + isSaved(s.id) + '" aria-label="' + (isSaved(s.id) ? 'Remove from saved' : 'Save') + ' ' + esc(s.title) + '">' +
          '<span class="material-symbols-outlined">favorite</span></button>' +
      '</div>' +
      '<div class="card-badges">' +
        '<span class="badge"><span class="material-symbols-outlined">verified</span>' + s.safety + '% Safety Score</span>' +
        (s.vetted ? '' : '<span class="badge warn"><span class="material-symbols-outlined">info</span>Not vetted yet</span>') +
      '</div>' +
      '<div class="card-panel">' +
        '<div class="row">' +
          '<div class="min-w-0"><p class="type">' + esc(s.type) + '</p><h3>' + esc(s.title) + '</h3></div>' +
          '<div class="rating"><span><span class="material-symbols-outlined fill star">star</span>' + s.rating + '</span><small>' + s.reviews + ' reviews</small></div>' +
        '</div>' +
        '<p class="quote">“' + esc(s.quote) + '”</p>' +
        '<div class="tags">' + tags + '</div>' +
        '<div class="row foot">' +
          '<span class="zone"><i></i>' + (s.vetted ? 'Women-vetted' : 'Group recommended') + '</span>' +
          '<button type="button" class="details-btn" data-act="details">View details<span class="material-symbols-outlined">arrow_forward</span></button>' +
        '</div>' +
      '</div>';
  }

  function endHTML() {
    var none = state.list.length === 0;
    return '<div class="deck-end">' +
      '<div class="end-icon"><span class="material-symbols-outlined">' + (none ? 'travel_explore' : 'done_all') + '</span></div>' +
      '<h3>' + (none ? 'Nothing matches yet' : 'You’re all caught up') + '</h3>' +
      '<p>' + (none ? 'Try another mood, a wider distance, or turn off Women-Only Vetted.' :
        'You’ve seen every spot for this mood. Saved ' + state.saved.length + ' so far.') + '</p>' +
      '<div class="end-actions">' +
        (none ? '<button type="button" class="cs-cta primary" data-act="reset">Reset filters</button>'
              : '<button type="button" class="cs-cta primary" data-act="restart">Start over</button>' +
                (state.saved.length ? '<button type="button" class="cs-cta" data-act="saved">See saved</button>' : '')) +
      '</div></div>';
  }

  function render() {
    var total = state.list.length;
    counter.textContent = total ? Math.min(state.index + 1, total) + ' of ' + total : '0 of 0';
    progress.style.width = total ? (Math.min(state.index, total) / total * 100) + '%' : '0%';
    $('undoBtn').disabled = state.history.length === 0;
    var done = state.index >= total;
    ['passDeckBtn', 'loveDeckBtn', 'infoDeckBtn'].forEach(function (id) { $(id).disabled = done; });

    var visible = state.list.slice(state.index, state.index + 3);
    // drop nodes that are no longer visible (except ones mid-flight)
    Array.prototype.forEach.call(deck.querySelectorAll('.deck-card:not(.flying)'), function (n) {
      if (!visible.some(function (s) { return s.id === n.dataset.id; })) n.remove();
    });
    var endNode = deck.querySelector('.deck-end');
    if (done) {
      if (!endNode) { deck.insertAdjacentHTML('afterbegin', endHTML()); }
      else endNode.outerHTML = endHTML();
    } else if (endNode) endNode.remove();

    visible.forEach(function (s, pos) {
      var n = deck.querySelector('.deck-card[data-id="' + s.id + '"]:not(.flying)');
      if (!n) {
        n = document.createElement('article');
        n.className = 'deck-card';
        n.dataset.id = s.id;
        n.dataset.pos = '3';
        n.innerHTML = cardHTML(s);
        deck.insertBefore(n, deck.firstChild);
        n.getBoundingClientRect(); // commit start state so it eases in
      }
      n.dataset.pos = String(pos);
      n.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
    });
    var top = deck.querySelector('.deck-card[data-pos="0"]');
    if (top) bindDrag(top);
  }

  function currentSpot() { return state.list[state.index]; }

  // ---------- Actions ----------
  function decide(dir, viaButton) {
    var s = currentSpot(); if (!s) return;
    var node = deck.querySelector('.deck-card[data-pos="0"]');
    if (dir === 'right' && !isSaved(s.id)) { state.saved.push(s.id); store.set('saved', state.saved); updateSavedBadge(true); }
    state.history.push({ id: s.id, dir: dir });
    buzz(dir === 'right' ? 14 : 8);
    if (node) {
      node.classList.add('flying');
      node.dataset.pos = 'out';
      node.style.pointerEvents = 'none';
      node.style.transition = 'transform .38s cubic-bezier(.2,.7,.3,1), opacity .38s';
      var x = dir === 'right' ? 1 : -1;
      if (viaButton) node.classList.add(dir === 'right' ? 'show-save' : 'show-skip');
      node.style.transform = 'translate(' + (x * 140) + '%, 30px) rotate(' + (x * 18) + 'deg)';
      node.style.opacity = '0';
      setTimeout(function () { node.remove(); }, 400);
    }
    state.index++;
    render();
    if (dir === 'right') toast('Saved ' + s.title);
  }

  function undo() {
    var last = state.history.pop(); if (!last) return;
    if (last.dir === 'right') {
      state.saved = state.saved.filter(function (id) { return id !== last.id; });
      store.set('saved', state.saved); updateSavedBadge();
    }
    state.index = Math.max(0, state.index - 1);
    var s = currentSpot();
    // bring the card back from the side it left
    var n = document.createElement('article');
    n.className = 'deck-card';
    n.dataset.id = s.id; n.dataset.pos = '0';
    n.innerHTML = cardHTML(s);
    var x = last.dir === 'right' ? 1 : -1;
    n.style.transition = 'none';
    n.style.transform = 'translate(' + (x * 140) + '%, 30px) rotate(' + (x * 18) + 'deg)';
    n.style.opacity = '0';
    // push existing cards back
    Array.prototype.forEach.call(deck.querySelectorAll('.deck-card:not(.flying)'), function (c) { c.dataset.pos = String(Math.min(3, +c.dataset.pos + 1)); });
    deck.appendChild(n);
    n.getBoundingClientRect();
    n.style.transition = ''; n.style.transform = ''; n.style.opacity = '';
    buzz(6);
    render();
  }

  $('passDeckBtn').addEventListener('click', function () { decide('left', true); });
  $('loveDeckBtn').addEventListener('click', function () { decide('right', true); });
  $('infoDeckBtn').addEventListener('click', function () { var s = currentSpot(); if (s) openSheet(s); });
  $('undoBtn').addEventListener('click', undo);

  deck.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.dataset.act;
    if (act === 'details') { var s = currentSpot(); if (s) openSheet(s); }
    if (act === 'heart') { var h = currentSpot(); if (h) toggleSave(h, a); }
    if (act === 'restart') { state.index = 0; state.history = []; deck.innerHTML = ''; render(); }
    if (act === 'reset') {
      state.mood = 'all'; state.dist = 0; state.vetted = true; state.query = ''; state.modes = ['walk', 'drive']; state.minSafety = 0; search.value = '';
      distLabel.textContent = DISTANCES[0].label; vLabel.textContent = 'Women-Only Vetted: ON'; vBtn.setAttribute('aria-pressed', 'true');
      chips.querySelectorAll('.mood-chip').forEach(function (c) { c.setAttribute('aria-selected', c.dataset.mood === 'all'); });
      applyFilters(true);
    }
    if (act === 'saved') openSaved();
  });

  document.addEventListener('keydown', function (e) {
    if (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (sheetOpen()) { if (e.key === 'Escape') closeSheets(); return; }
    if (e.key === 'ArrowLeft') decide('left', true);
    else if (e.key === 'ArrowRight') decide('right', true);
    else if (e.key === 'Enter' && currentSpot()) openSheet(currentSpot());
    else if ((e.key === 'z' || e.key === 'Backspace') && state.history.length) undo();
  });

  // ---------- Trackpad two-finger swipe ----------
  (function () {
    var acc = 0, idle, lock = false;
    deck.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical scroll: leave it alone
      e.preventDefault(); // stop the browser's back/forward swipe
      var card = deck.querySelector('.deck-card[data-pos="0"]');
      if (!card || lock) return;
      acc -= e.deltaX; // fingers moving right = card moves right
      var W = deck.clientWidth, p = Math.max(-1, Math.min(1, acc / (W * 0.35)));
      card.classList.add('dragging');
      card.style.transform = 'translateX(' + acc + 'px) rotate(' + (acc / W * 14) + 'deg)';
      card.style.setProperty('--save', Math.max(0, p));
      card.style.setProperty('--skip', Math.max(0, -p));
      clearTimeout(idle);
      if (Math.abs(acc) > W * 0.3) {
        lock = true; card.classList.remove('dragging');
        decide(acc > 0 ? 'right' : 'left');
        acc = 0;
        setTimeout(function () { lock = false; }, 650); // ignore the rest of this gesture's momentum
        return;
      }
      idle = setTimeout(function () {
        acc = 0; card.classList.remove('dragging');
        card.style.transform = ''; card.style.removeProperty('--save'); card.style.removeProperty('--skip');
      }, 160);
    }, { passive: false });
  })();

  // ---------- Drag / swipe (pointer events) ----------
  function bindDrag(card) {
    if (card._bound) return; card._bound = true;
    var sx = 0, sy = 0, dx = 0, dy = 0, t0 = 0, id = null, mode = null; // mode: null | 'drag' | 'scroll'
    var W = function () { return deck.clientWidth; };

    card.addEventListener('pointerdown', function (e) {
      if (card.dataset.pos !== '0' || e.button > 0) return;
      if (e.target.closest('button')) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; dx = dy = 0; t0 = performance.now(); mode = null;
    });
    card.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (!mode) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          mode = 'drag'; card.setPointerCapture(id); card.classList.add('dragging');
        } else if (Math.abs(dy) > 8) { mode = 'scroll'; id = null; return; }
      }
      if (mode !== 'drag') return;
      var p = Math.max(-1, Math.min(1, dx / (W() * 0.35)));
      card.style.transform = 'translate(' + dx + 'px,' + (dy * 0.15) + 'px) rotate(' + (dx / W() * 14) + 'deg)';
      card.style.setProperty('--save', Math.max(0, p));
      card.style.setProperty('--skip', Math.max(0, -p));
      deck.style.setProperty('--progress', Math.abs(p));
    });
    function end(e) {
      if (e.pointerId !== id) return;
      var wasDrag = mode === 'drag'; id = null; mode = null;
      card.classList.remove('dragging');
      deck.style.setProperty('--progress', 0);
      if (!wasDrag) {
        // A tap (no movement) opens the details — it never swipes
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && e.type === 'pointerup' && !e.target.closest('button')) {
          var s = currentSpot(); if (s) openSheet(s);
        }
        return;
      }
      var v = dx / Math.max(1, performance.now() - t0); // px per ms
      var commit = Math.abs(dx) > W() * 0.3 || (Math.abs(v) > 0.6 && Math.abs(dx) > 40);
      if (commit) { decide(dx > 0 ? 'right' : 'left'); }
      else {
        card.style.transform = ''; card.style.removeProperty('--save'); card.style.removeProperty('--skip');
      }
    }
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }

  // ---------- Venue sheet ----------
  var overlay = $('venueSheetModal'), sheet = $('venueSheetContainer');
  var sheetSpot = null;
  function sheetOpen() { return overlay.classList.contains('open') || $('savedSheet').classList.contains('open'); }

  function openSheet(s) {
    sheetSpot = s;
    var banner = $('sheetBanner');
    banner.style.backgroundImage = bg(s);
    if (s.img) { banner.setAttribute('data-img', s.img); banner.classList.toggle('ph', IMG[s.img] === 'loading'); }
    else { banner.removeAttribute('data-img'); banner.classList.remove('ph'); }
    var cr = s.img && CREDITS[s.img], credit = $('sheetCredit');
    if (credit) {
      credit.hidden = !cr;
      if (cr) credit.innerHTML = 'Photo: <a href="' + esc(cr.source) + '" target="_blank" rel="noopener">' + esc(cr.by) + '</a> · ' + esc(cr.license) + ', via Wikimedia Commons';
    }
    $('sheetTitle').textContent = s.title;
    $('sheetSub').textContent = s.type + ' · Jibhi, Himachal Pradesh';
    $('sheetRating').textContent = s.rating;
    $('sheetMetrics').innerHTML = [
      [s.mode === 'drive' ? 'directions_car' : 'directions_walk', s.mins + ' min', (s.km < 1 ? Math.round(s.km * 1000) + ' m' : s.km + ' km') + (s.mode === 'drive' ? ' drive' : ' walk')],
      ['shield', s.safety + '%', 'Safety index'],
      s.metric
    ].map(function (m) {
      return '<div class="metric"><span class="material-symbols-outlined">' + m[0] + '</span><b>' + esc(m[1]) + '</b><small>' + esc(m[2]) + '</small></div>';
    }).join('');
    $('sheetWhy').innerHTML = s.why.map(function (w) {
      return '<div class="why"><span class="why-icon"><span class="material-symbols-outlined">' + w[0] + '</span></span>' +
        '<div><p>' + esc(w[1]) + '</p><small>' + esc(w[2]) + '</small></div></div>';
    }).join('');
    $('meterLabel').textContent = s.meter[0];
    $('meterValue').textContent = s.meter[2];
    $('meterText').textContent = s.meter[3];
    $('meterFill').style.width = '0%';
    setTimeout(function () { $('meterFill').style.width = s.meter[1] + '%'; }, 250);
    $('startBeaconLabel').textContent = s.cta === 'trek' ? 'Find a group to go with' : 'Start a meetup beacon here';
    $('startBeaconIcon').textContent = s.cta === 'trek' ? 'groups' : 'radar';
    resetBtn($('safeWalkNavBtn'), 'navigation', s.mode === 'drive' ? 'Get directions (verified cab routes)' : 'Navigate with Safe Walk (lit routes)');
    syncSheetSave();
    sheet.scrollTop = 0;
    overlay.classList.add('open');
    document.documentElement.classList.add('sheet-lock');
    buzz(6);
  }
  function toggleSave(s, heartBtn) {
    var on = !isSaved(s.id);
    if (on) state.saved.push(s.id); else state.saved = state.saved.filter(function (id) { return id !== s.id; });
    store.set('saved', state.saved);
    updateSavedBadge(on);
    buzz(on ? 14 : 8);
    Array.prototype.forEach.call(deck.querySelectorAll('.deck-card[data-id="' + s.id + '"] .card-heart'), function (b) {
      b.setAttribute('aria-pressed', on);
      b.classList.remove('pop'); void b.offsetWidth; if (on) b.classList.add('pop');
    });
    if (sheetSpot && sheetSpot.id === s.id) syncSheetSave();
    toast(on ? 'Saved ' + s.title : 'Removed from saved');
  }
  function syncSheetSave() {
    var on = sheetSpot && isSaved(sheetSpot.id);
    $('sheetSaveBtn').setAttribute('aria-pressed', on);
    $('sheetSaveIcon').classList.toggle('fill', on);
  }
  function closeSheets() {
    overlay.classList.remove('open'); $('savedSheet').classList.remove('open');
    document.documentElement.classList.remove('sheet-lock');
    sheet.style.transform = '';
  }
  $('closeSheetBtn').addEventListener('click', closeSheets);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSheets(); });

  // drag the sheet down to dismiss
  (function () {
    var y0 = null, dy = 0;
    sheet.addEventListener('pointerdown', function (e) {
      if (sheet.scrollTop > 0 || e.target.closest('button')) return;
      y0 = e.clientY; dy = 0;
    });
    sheet.addEventListener('pointermove', function (e) {
      if (y0 === null) return;
      dy = Math.max(0, e.clientY - y0);
      if (dy > 6) { sheet.style.transition = 'none'; sheet.style.transform = 'translateY(' + dy + 'px)'; }
    });
    function up() {
      if (y0 === null) return; y0 = null; sheet.style.transition = '';
      if (dy > 110) closeSheets(); else sheet.style.transform = '';
    }
    sheet.addEventListener('pointerup', up); sheet.addEventListener('pointercancel', up);
  })();

  $('sheetSaveBtn').addEventListener('click', function () { if (sheetSpot) toggleSave(sheetSpot); });

  function resetBtn(btn, icon, label) {
    btn.disabled = false; btn.classList.remove('done');
    btn.innerHTML = '<span class="material-symbols-outlined">' + icon + '</span><span>' + esc(label) + '</span>';
  }
  function loading(btn, label) {
    btn.disabled = true;
    btn.innerHTML = '<span class="cs-spinner"></span><span>' + esc(label) + '</span>';
  }

  $('startBeaconBtn').addEventListener('click', function () {
    var s = sheetSpot; if (!s) return;
    var btn = this;
    loading(btn, s.cta === 'trek' ? 'Finding groups nearby…' : 'Setting up your beacon…');
    setTimeout(function () {
      location.href = '/meetups.html?' + (s.cta === 'trek' ? 'find=' : 'beacon=') + encodeURIComponent(s.title);
    }, 650);
  });
  $('safeWalkNavBtn').addEventListener('click', function () {
    var s = sheetSpot; if (!s) return;
    var btn = this;
    loading(btn, 'Mapping the safest lit route…');
    var url = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(s.maps) + '&travelmode=' + (s.mode === 'drive' ? 'driving' : 'walking');
    var win = window.open('about:blank', '_blank');
    setTimeout(function () {
      if (win) { win.opener = null; win.location.href = url; } else location.href = url;
      btn.classList.add('done');
      btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span><span>Route opened · live sharing on</span>';
      btn.disabled = false;
    }, 700);
  });

  // ---------- Saved list ----------
  var savedBadge = $('savedCount');
  function updateSavedBadge(bump) {
    savedBadge.textContent = state.saved.length;
    $('savedBtn').classList.toggle('has', state.saved.length > 0);
    if (bump) { savedBadge.classList.remove('bump'); void savedBadge.offsetWidth; savedBadge.classList.add('bump'); }
  }
  function openSaved() {
    var list = state.saved.map(function (id) { return SPOTS.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean);
    $('savedList').innerHTML = list.length ? list.map(function (s) {
      return '<li><button type="button" class="saved-item" data-id="' + s.id + '">' +
        '<span class="thumb" style="background-image:' + bg(s).replace(/"/g, '&quot;') + '"></span>' +
        '<span class="meta"><b>' + esc(s.title) + '</b><small>' + esc(s.type) + ' · ' + travel(s) + '</small></span>' +
        '<span class="material-symbols-outlined">chevron_right</span></button>' +
        '<button type="button" class="unsave" data-un="' + s.id + '" aria-label="Remove ' + esc(s.title) + '"><span class="material-symbols-outlined">close</span></button></li>';
    }).join('') : '<li class="empty"><span class="material-symbols-outlined">favorite</span><p>Swipe right on a spot to save it here.</p></li>';
    $('savedSheet').classList.add('open');
    document.documentElement.classList.add('sheet-lock');
  }
  $('savedBtn').addEventListener('click', openSaved);
  $('savedSheet').addEventListener('click', function (e) {
    if (e.target === $('savedSheet') || e.target.closest('[data-close]')) { closeSheets(); return; }
    var un = e.target.closest('[data-un]');
    if (un) {
      state.saved = state.saved.filter(function (id) { return id !== un.dataset.un; });
      store.set('saved', state.saved); updateSavedBadge();
      var li = un.closest('li'); li.classList.add('removing'); setTimeout(openSaved, 220); return;
    }
    var it = e.target.closest('.saved-item');
    if (it) {
      var s = SPOTS.filter(function (x) { return x.id === it.dataset.id; })[0];
      $('savedSheet').classList.remove('open');
      setTimeout(function () { openSheet(s); }, 120);
    }
  });

  // ---------- SOS ----------
  $('sosInfoBtn').addEventListener('click', function () {
    $('sosSheet').classList.add('open'); document.documentElement.classList.add('sheet-lock'); buzz(12);
  });
  $('sosSheet').addEventListener('click', function (e) {
    if (e.target === $('sosSheet') || e.target.closest('[data-close]')) {
      $('sosSheet').classList.remove('open'); document.documentElement.classList.remove('sheet-lock');
    }
  });

  // ---------- Boot ----------
  window.csOpenSaved = openSaved;
  if (location.hash === '#saved') { history.replaceState(null, '', location.pathname); setTimeout(openSaved, 400); }
  updateSavedBadge();
  applyFilters(false);
})();
