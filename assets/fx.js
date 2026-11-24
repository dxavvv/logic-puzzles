/* Efekty i drobne funkcje wspólne dla wszystkich gier: licznik czasu, rekordy,
   konfetti z pikseli, dźwięki (WebAudio), motywy kolorystyczne, losowanie z ziarnem.
   Wszystko działa lokalnie w przeglądarce (localStorage), więc nadaje się do GitHub Pages. */
(function () {
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny itp. */ } }
    };
    const json = (k, d) => { try { return JSON.parse(store.get(k)) || d; } catch (e) { return d; } };

    // identyfikator gry z adresu: .../games/<id>/...
    const parts = location.pathname.split('/').filter(Boolean);
    const gi = parts.indexOf('games');
    const game = gi >= 0 && parts[gi + 1] ? parts[gi + 1].replace(/\.html$/, '') : 'home';

    const THEMES = [
        { id: 'noc', name: 'Noc' },
        { id: 'retro', name: 'Retro' },
        { id: 'dusk', name: 'Zmierzch' },
        { id: 'ice', name: 'Lód' }
    ];

    const css = document.createElement('style');
    css.textContent = `
html[data-theme="retro"]{--bg:#06140a;--surface:#0c2414;--surface2:#123320;--border:#1f5a35;--text:#c8f5d2;--text-secondary:#7fc795;--accent:#5cff8a;--accent-glow:#5cff8a55;--gold:#d6ff6a;--cell-given:#0d2a18;--cell-empty:#0b2012;--cell-user:#10301c}
html[data-theme="dusk"]{--bg:#1a0f24;--surface:#2a1838;--surface2:#36204a;--border:#55337a;--text:#f1dff7;--text-secondary:#c4a3d6;--accent:#ff8fb1;--accent-glow:#ff8fb155;--gold:#ffc36b;--cell-given:#2d1a3d;--cell-empty:#261633;--cell-user:#35204a}
html[data-theme="ice"]{--bg:#08141c;--surface:#0f2431;--surface2:#153245;--border:#25506b;--text:#dff4ff;--text-secondary:#9cc3d8;--accent:#7fe3ff;--accent-glow:#7fe3ff55;--gold:#fff0a8;--cell-given:#102b3b;--cell-empty:#0d2230;--cell-user:#14354a}
html[data-theme] body{background-image:radial-gradient(ellipse at 50% 0%,var(--surface2) 0%,transparent 60%)}
.fx-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin:10px auto 6px;max-width:640px}
.fx-chip,.fx-btn{display:inline-flex;align-items:center;gap:6px;font:600 .82rem/1 'Segoe UI',system-ui,sans-serif;padding:7px 10px;color:var(--text,#d8d8e8);
 background:var(--surface,#161630);border:2px solid var(--border,#2a2a50);border-radius:0;
 clip-path:polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))}
.fx-chip .px,.fx-btn .px{width:16px;height:16px;margin:0}
.fx-chip[hidden]{display:none}
.fx-chip b{font-variant-numeric:tabular-nums;color:var(--gold,#f0c060)}
.fx-btn{cursor:pointer}
.fx-btn:hover{border-color:var(--accent,#5eb8f7);color:var(--accent,#5eb8f7)}
.fx-btn.on{border-color:var(--accent,#5eb8f7)}
.fx-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,40px);opacity:0;z-index:50;display:flex;gap:10px;align-items:center;
 padding:12px 18px;background:var(--surface,#161630);border:3px solid var(--gold,#f0c060);color:var(--text,#d8d8e8);font:700 1rem 'Segoe UI',system-ui,sans-serif;
 box-shadow:5px 5px 0 rgba(0,0,0,.45);transition:transform .35s steps(6),opacity .25s;pointer-events:none;text-align:center}
.fx-toast.show{transform:translate(-50%,0);opacity:1}
.fx-toast .px{width:28px;height:28px}
.fx-confetti{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60}
@media (prefers-reduced-motion:reduce){.fx-toast{transition:none}}
`;
    document.head.appendChild(css);

    // --- motyw ---
    function applyTheme(id) {
        if (id && id !== 'noc') document.documentElement.setAttribute('data-theme', id);
        else document.documentElement.removeAttribute('data-theme');
    }
    let themeId = store.get('lp:theme') || 'noc';
    if (!THEMES.some(t => t.id === themeId)) themeId = 'noc';
    applyTheme(themeId);

    // --- dźwięk ---
    let actx = null;
    const FX = {
        game, store, THEMES, managed: false, cheated: false, won: false, custom: false,
        sound: store.get('lp:sound') !== '0',
        beep(freq, dur = 0.12, when = 0, type = 'square', vol = 0.035) {
            if (!FX.sound) return;
            try {
                actx = actx || new (window.AudioContext || window.webkitAudioContext)();
                const t0 = actx.currentTime + when;
                const o = actx.createOscillator(), g = actx.createGain();
                o.type = type; o.frequency.value = freq;
                g.gain.setValueAtTime(vol, t0);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
                o.connect(g); g.connect(actx.destination);
                o.start(t0); o.stop(t0 + dur + 0.02);
            } catch (e) { /* brak audio */ }
        },
        jingle() { [523, 659, 784, 1047].forEach((f, i) => FX.beep(f, 0.16, i * 0.09)); },
        blip() { FX.beep(660, 0.06); },

        // --- losowanie z ziarnem (ta sama plansza dla tego samego ziarna) ---
        hash(str) {
            let h = 1779033703 ^ str.length;
            for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
            return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
        },
        prng(seedStr) {
            const next = FX.hash(String(seedStr));
            let a = next();
            return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        },
        withSeed(seedStr, fn) {
            const orig = Math.random;
            Math.random = FX.prng(seedStr);
            try { return fn(); } finally { Math.random = orig; }
        },
        randSeed() { return Math.random().toString(36).slice(2, 8); },
        dailySeed() {
            const d = new Date();
            const p = n => String(n).padStart(2, '0');
            return 'D' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
        },

        // --- licznik czasu ---
        elapsed: 0, _t0: 0, _run: false, _iv: null,
        fmt(ms) {
            const s = Math.floor(ms / 1000);
            return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
        },
        now() { return FX.elapsed + (FX._run ? Date.now() - FX._t0 : 0); },
        paint() {
            const e = document.getElementById('fxTime');
            if (e) e.textContent = FX.fmt(FX.now());
        },
        timerStart() {
            FX.elapsed = 0; FX._t0 = Date.now(); FX._run = true; FX.won = false; FX.cheated = false;
            clearInterval(FX._iv);
            FX._iv = setInterval(FX.paint, 500);
            FX.paint(); FX.paintBest();
        },
        timerStop() {
            if (FX._run) { FX.elapsed += Date.now() - FX._t0; FX._run = false; }
            clearInterval(FX._iv); FX.paint();
        },
        timerHide() { FX.timerStop(); FX.elapsed = 0; FX.paint(); },

        // --- rekordy i statystyki ---
        variant: () => {
            return ['selectSize', 'selectH', 'selectW', 'selectDifficulty']
                .map(id => { const e = document.getElementById(id); return e ? e.value : ''; }).join('-');
        },
        bestKey() { return 'lp:best:' + game + ':' + FX.variant(); },
        best() { const v = parseInt(store.get(FX.bestKey()), 10); return v > 0 ? v : 0; },
        paintBest() {
            const e = document.getElementById('fxBest');
            if (!e) return;
            const b = FX.best();
            e.textContent = FX.custom ? '—' : b ? FX.fmt(b) : '—';
        },
        solved() { return json('lp:solved', {}); },
        recordWin() {
            const all = FX.solved();
            all[game] = (all[game] || 0) + 1;
            store.set('lp:solved', JSON.stringify(all));
            const days = json('lp:days', []);
            const today = FX.dailySeed().slice(1);
            if (!days.includes(today)) { days.push(today); store.set('lp:days', JSON.stringify(days.slice(-400))); }
        },
        streak() {
            const days = new Set(json('lp:days', []));
            let n = 0;
            const d = new Date();
            const key = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0');
            if (!days.has(key(d))) d.setDate(d.getDate() - 1);
            while (days.has(key(d))) { n++; d.setDate(d.getDate() - 1); }
            return n;
        },

        // --- toast i konfetti ---
        toast(html, ms = 3200) {
            let t = document.getElementById('fxToast');
            if (!t) { t = document.createElement('div'); t.id = 'fxToast'; t.className = 'fx-toast'; document.body.appendChild(t); }
            t.innerHTML = html;
            void t.offsetWidth;
            t.classList.add('show');
            clearTimeout(FX._tt);
            FX._tt = setTimeout(() => t.classList.remove('show'), ms);
        },
        confetti() {
            if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const cv = document.createElement('canvas');
            cv.className = 'fx-confetti';
            cv.width = innerWidth; cv.height = innerHeight;
            document.body.appendChild(cv);
            const ctx = cv.getContext('2d');
            const colors = Object.values((window.Px && Px.palette) || { a: '#5eb8f7', b: '#ffd35c', c: '#ff6b6b', d: '#5cdb8b' }).filter(c => c !== '#151528' && c !== '#4a5073');
            const ps = Array.from({ length: 140 }, () => {
                const a = Math.random() * Math.PI * 2, v = 6 + Math.random() * 10;
                return { x: cv.width / 2, y: cv.height * 0.55, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 7, s: 6 + Math.floor(Math.random() * 3) * 3, c: colors[Math.floor(Math.random() * colors.length)] };
            });
            const t0 = performance.now();
            (function frame(t) {
                const k = t - t0;
                ctx.clearRect(0, 0, cv.width, cv.height);
                ps.forEach(p => {
                    p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy;
                    ctx.fillStyle = p.c;
                    ctx.fillRect(Math.round(p.x / 3) * 3, Math.round(p.y / 3) * 3, p.s, p.s);
                });
                if (k < 2600) requestAnimationFrame(frame); else cv.remove();
            })(t0);
        },

        // --- wygrana ---
        win() {
            if (FX.won) return;
            FX.won = true;
            if (FX.cheated) return; // pokazane rozwiązanie nie liczy się jako wygrana
            FX.timerStop();
            const ms = FX.now();
            let msg = '🎉 Rozwiązane w ' + FX.fmt(ms) + '!';
            if (!FX.custom) {
                const b = FX.best();
                if (!b || ms < b) {
                    store.set(FX.bestKey(), String(Math.max(1, ms)));
                    if (b) msg += '<br>🏆 Nowy rekord!';
                    else msg += '<br>🏆 Pierwszy wynik zapisany!';
                }
                FX.recordWin();
                FX.paintBest();
            }
            FX.toast(msg);
            FX.confetti();
            FX.jingle();
        },

        // --- pasek narzędzi ---
        bar: null,
        addButton(icon, label, fn, id) {
            if (!FX.bar) return null;
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'fx-btn'; if (id) b.id = id;
            b.textContent = icon + ' ' + label;
            b.addEventListener('click', fn);
            FX.bar.appendChild(b);
            return b;
        },
        mount() {
            const anchor = document.querySelector('.grid-wrapper');
            if (!anchor || document.getElementById('fxBar')) return;
            const bar = document.createElement('div');
            bar.className = 'fx-bar'; bar.id = 'fxBar';
            bar.innerHTML = '<span class="fx-chip">⏱ <b id="fxTime">00:00</b></span><span class="fx-chip">🏆 <b id="fxBest">—</b></span><span class="fx-chip" id="fxSeedChip" hidden></span>';
            anchor.parentNode.insertBefore(bar, anchor);
            FX.bar = bar;
            FX.soundBtn = FX.addButton(FX.sound ? '🔊' : '🔇', 'Dźwięk', () => FX.toggleSound(), 'fxSound');
            FX.themeBtn = FX.addButton('🎨', THEMES.find(t => t.id === themeId).name, () => FX.nextTheme(), 'fxTheme');
        },
        toggleSound() {
            FX.sound = !FX.sound;
            store.set('lp:sound', FX.sound ? '1' : '0');
            const b = document.getElementById('fxSound');
            if (b) b.textContent = (FX.sound ? '🔊' : '🔇') + ' Dźwięk';
            if (FX.sound) FX.blip();
        },
        nextTheme() {
            const i = THEMES.findIndex(t => t.id === themeId);
            themeId = THEMES[(i + 1) % THEMES.length].id;
            store.set('lp:theme', themeId);
            applyTheme(themeId);
            const b = document.getElementById('fxTheme');
            if (b) b.textContent = '🎨 ' + THEMES.find(t => t.id === themeId).name;
        },
        copy(text) {
            const done = () => FX.toast('📤 Link skopiowany do schowka');
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => prompt('Skopiuj link:', text));
            else prompt('Skopiuj link:', text);
        },
        init() {
            FX.mount();
            // wygrana = status „success” w #statusArea
            const st = document.getElementById('statusArea');
            if (st) {
                let was = false;
                new MutationObserver(() => {
                    const ok = st.classList.contains('success');
                    if (ok && !was) FX.win();
                    was = ok;
                }).observe(st, { attributes: true, attributeFilter: ['class'] });
            }
            // gry bez G.wire (Sudoku, OD 0 DO 9, Zgaś światła): licznik uruchamiany przyciskami
            const generic = (ids, fn) => ids.forEach(id => {
                const e = document.getElementById(id);
                if (e) e.addEventListener('click', () => { if (!FX.managed) fn(); });
            });
            generic(['btnNew', 'btnGenerate', 'btnGenerateEmpty', 'btnReset'], () => FX.timerStart());
            generic(['btnSolve'], () => { FX.cheated = true; });
            ['selectSize', 'selectDifficulty', 'selectH', 'selectW'].forEach(id => {
                const e = document.getElementById(id);
                if (e) e.addEventListener('change', () => { if (!FX.managed) FX.timerStart(); else FX.paintBest(); });
            });
            if (!FX.managed) FX.timerStart();
        }
    };

    window.FX = FX;
    if (game !== 'home') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', FX.init);
        else FX.init();
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { if (FX._run) { FX.elapsed += Date.now() - FX._t0; FX._run = false; } }
        else if (!FX.won && FX.elapsed > 0 && !FX._run && !FX.paused) { FX._t0 = Date.now(); FX._run = true; }
    });
})();
