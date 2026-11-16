#!/usr/bin/env python3
"""Build step for the ChaloSaath app (run by deploy.sh).

1. Compiles Tailwind + the app shell styles into /app.css, so pages arrive fully styled
   (no flash while the Tailwind CDN restyles the page in the browser).
2. Puts the tab bar and the page-transition hook straight into each page's HTML,
   so they exist on the very first frame.
3. Stamps asset links with a content hash so phones never run a stale cached copy.
"""
import hashlib, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build')
PAGES = {'index.html': 0, 'meetups.html': 1, 'safety.html': 2}
TABS = [('/', 'explore', 'Right Now'), ('/meetups.html', 'diversity_3', 'Meetups'), ('/safety.html', 'shield_person', 'Safety')]

def read(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def write(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf-8').write(s)

# ---------- 1. Tailwind ----------
src = read('index.html')
m = re.search(r'tailwind\.config\s*=\s*(\{.*?\})\s*</script>', src, re.S)
if m:  # first run: capture the config from the prototype pages
    write('build/tailwind.config.js',
          '// Captured from the original prototype pages\nmodule.exports = Object.assign(' + m.group(1) +
          ', { content: ["./index.html", "./meetups.html", "./safety.html", "./mobile.js", "./rightnow.js"] });\n')
write('build/input.css', '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' + read('build/shell.css'))
subprocess.run(['npx', '-y', 'tailwindcss@3.4.17', '-c', 'build/tailwind.config.js', '-i', 'build/input.css',
                '-o', 'app.css', '--minify'], cwd=ROOT, check=True)

HEAD_HOOK = ('<script id="cs-vt">(function(){function q(v){v&&["ready","finished","updateCallbackDone"].forEach(function(p){v[p]&&v[p].catch(function(){})})}'
             'addEventListener("pageswap",function(e){q(e.viewTransition)});'
             'addEventListener("pagereveal",function(e){var v=e.viewTransition;'
             'try{var f=sessionStorage.getItem("cs-from");if(f!==null){sessionStorage.removeItem("cs-from");var h=document.documentElement;'
             'h.style.setProperty("--from",f);if(h.classList.contains("cs-slide")){h.classList.remove("cs-slide");void h.offsetWidth}h.classList.add("cs-slide")}}catch(x){}'
             'if(!v)return;q(v);'
             'try{sessionStorage.getItem("cs-dir")==="back"&&v.types.add("back")}catch(x){}})})();</script>')

def tabbar(cur):
    tabs = ''.join(
        '<a class="cs-tab" href="%s" data-i="%d"%s><span class="material-symbols-outlined">%s</span><span>%s</span>%s</a>' % (
            path, i, ' aria-current="page"' if i == cur else '', icon, label,
            '<span class="dot" aria-label="New beacons nearby"></span>' if i == 1 and cur != 1 else '')
        for i, (path, icon, label) in enumerate(TABS))
    return '<nav class="cs-tabbar" aria-label="Main" style="--i:%d"><span class="cs-ind" aria-hidden="true"></span>%s</nav>' % (cur, tabs)

for page, cur in PAGES.items():
    s = read(page)
    # drop the Tailwind CDN runtime + its inline config; use the compiled stylesheet instead
    s = re.sub(r'<script src="https://cdn\.tailwindcss\.com[^"]*"></script>', '', s)
    s = re.sub(r'<script id="tailwind-config">.*?</script>', '', s, flags=re.S)
    # app.css must come after the Google font stylesheets (as the CDN's styles did), or the icon
    # font's default 24px size would override Tailwind's text-[14px] etc.
    s = re.sub(r'<link rel="stylesheet" href="/app\.css[^"]*">', '', s)
    s = re.sub(r'<script id="cs-vt">.*?</script>', '', s, flags=re.S)
    anchor = '<link rel="stylesheet" href="/rightnow.css' if '/rightnow.css' in s else '</head>'
    s = s.replace(anchor, '<link rel="stylesheet" href="/app.css">' + anchor, 1)
    s = s.replace('<title>', HEAD_HOOK + '<title>', 1)
    # tab bar markup, rendered server-side
    s = re.sub(r'<nav class="cs-tabbar".*?</nav>', '', s, flags=re.S)
    s = re.sub(r'(<body[^>]*>)', lambda mm: mm.group(1) + tabbar(cur), s, count=1)
    # end-to-end flows (notifications, edit profile, guide, map, safety) load after mobile.js
    if '/flows.js' not in s:
        s = re.sub(r'(<script src="/mobile\.js[^"]*"></script>)', r'\1<script src="/flows.js"></script>', s, count=1)
    write(page, s)

# ---------- 3. Cache-busting ----------
assets = ['app.css', 'mobile.js', 'flows.js', 'rightnow.js', 'rightnow.css']
ver = {a: hashlib.md5(open(os.path.join(ROOT, a), 'rb').read()).hexdigest()[:8] for a in assets}
for page in PAGES:
    s = read(page)
    for a, v in ver.items():
        s = re.sub(r'(["\'])/' + re.escape(a) + r'(\?v=[0-9a-f]+)?\1', r'\1/' + a + '?v=' + v + r'\1', s)
    write(page, s)
print('built app.css (%d KB); versions: %s' % (os.path.getsize(os.path.join(ROOT, 'app.css')) // 1024, ver))
