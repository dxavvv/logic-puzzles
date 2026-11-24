(function () {
    const $ = id => document.getElementById(id);
    const G = {
        $,
        N4: [[1, 0], [-1, 0], [0, 1], [0, -1]],
        N8: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        rnd: n => Math.floor(Math.random() * n),
        pick(a) { return a[G.rnd(a.length)]; },
        shuffle(a) {
            for (let i = a.length - 1; i > 0; i--) {
                const j = G.rnd(i + 1);
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        },
        grid(r, c, v) { return Array.from({ length: r }, () => Array(c).fill(v)); },
        copy(g) { return g.map(r => [...r]); },
        status(msg, type = 'neutral') {
            const s = $('statusArea');
            if (s) { s.textContent = msg; s.className = 'status-area ' + type; }
        },
        stats(html) { const s = $('statsRow'); if (s) s.innerHTML = html; },
        size(def) { const s = $('selectSize'); return s ? parseInt(s.value, 10) : def; },
        level() { const s = $('selectDifficulty'); return s ? s.value : 'medium'; },
        // losowy kwadrat łaciński n×n o wartościach 1..n
        latin(n) {
            const idx = [...Array(n).keys()];
            const p = G.shuffle([...idx]), r = G.shuffle([...idx]), c = G.shuffle([...idx]);
            return idx.map(i => idx.map(j => p[(r[i] + c[j]) % n] + 1));
        },
        // indeksy (r*W+c) komórek powtarzających wartość w wierszu lub kolumnie
        latinErrors(cur, R, W) {
            const err = new Set();
            for (let r = 0; r < R; r++) {
                const seen = {};
                for (let c = 0; c < W; c++) {
                    const v = cur[r][c];
                    if (!v) continue;
                    (seen[v] = seen[v] || []).push(r * W + c);
                }
                for (const k in seen) if (seen[k].length > 1) seen[k].forEach(i => err.add(i));
            }
            for (let c = 0; c < W; c++) {
                const seen = {};
                for (let r = 0; r < R; r++) {
                    const v = cur[r][c];
                    if (!v) continue;
                    (seen[v] = seen[v] || []).push(r * W + c);
                }
                for (const k in seen) if (seen[k].length > 1) seen[k].forEach(i => err.add(i));
            }
            return err;
        },
        // komórka z polem na cyfrę (albo cyfrą daną z góry)
        cell({ max, given, value, cls = '', onChange }) {
            const d = document.createElement('div');
            if (given) { d.className = 'cell given' + cls; d.textContent = given; return d; }
            d.className = 'cell empty' + cls;
            const i = document.createElement('input');
            i.type = 'text'; i.inputMode = 'numeric'; i.maxLength = 1; i.autocomplete = 'off';
            if (value) i.value = value;
            i.addEventListener('input', () => {
                const n = parseInt(i.value.replace(/[^0-9]/g, ''), 10);
                const ok = n >= 1 && n <= max;
                i.value = ok ? String(n) : '';
                onChange(ok ? n : 0);
            });
            d.appendChild(i);
            return d;
        },
        // komórka przełączana kliknięciem; zwraca element
        tap(text, cls, onClick) {
            const d = document.createElement('div');
            d.className = 'cell tap ' + cls;
            d.textContent = text;
            d.addEventListener('click', onClick);
            return d;
        },
        // spójne składowe (4-sąsiedztwo) komórek spełniających pred(r,c)
        components(R, W, pred, dirs = G.N4) {
            const id = G.grid(R, W, -1), comps = [];
            for (let r = 0; r < R; r++) for (let c = 0; c < W; c++) {
                if (id[r][c] !== -1 || !pred(r, c)) continue;
                const list = [[r, c]]; id[r][c] = comps.length;
                for (let k = 0; k < list.length; k++) {
                    const [a, b] = list[k];
                    for (const [dr, dc] of dirs) {
                        const x = a + dr, y = b + dc;
                        if (x >= 0 && y >= 0 && x < R && y < W && id[x][y] === -1 && pred(x, y)) {
                            id[x][y] = comps.length; list.push([x, y]);
                        }
                    }
                }
                comps.push(list);
            }
            return { id, comps };
        },
        // wypełnia kwadrat łaciński n×n tak, by każdy obszar reg[r][c] (0..n-1) zawierał wszystkie cyfry; zwraca siatkę lub null
        regionFill(n, reg) {
            const grid = G.grid(n, n, 0);
            const rm = Array(n).fill(0), cm = Array(n).fill(0), gm = Array(n).fill(0);
            const full = (1 << n) - 1;
            let steps = 0;
            const pop = x => { let k = 0; while (x) { x &= x - 1; k++; } return k; };
            const go = filled => {
                if (filled === n * n) return true;
                if (++steps > 300000) return false;
                let br = -1, bc = -1, bn = 99, bm = 0;
                for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
                    if (grid[r][c]) continue;
                    const m = ~(rm[r] | cm[c] | gm[reg[r][c]]) & full;
                    const k = pop(m);
                    if (k < bn) { bn = k; br = r; bc = c; bm = m; if (!k) return false; }
                }
                const ds = [];
                for (let d = 0; d < n; d++) if (bm & (1 << d)) ds.push(d);
                for (const d of G.shuffle(ds)) {
                    grid[br][bc] = d + 1;
                    rm[br] |= 1 << d; cm[bc] |= 1 << d; gm[reg[br][bc]] |= 1 << d;
                    if (go(filled + 1)) return true;
                    grid[br][bc] = 0;
                    rm[br] &= ~(1 << d); cm[bc] &= ~(1 << d); gm[reg[br][bc]] &= ~(1 << d);
                }
                return false;
            };
            return go(0) ? grid : null;
        },
        // pole na liczbę 0..max (puste = 0); używane w edytorze własnych plansz
        numCell({ max, value, cls = '', onChange, ph = '', min = 1, empty = 0 }) {
            const d = document.createElement('div');
            d.className = 'cell empty edit ' + cls;
            const i = document.createElement('input');
            i.type = 'text'; i.inputMode = 'numeric'; i.maxLength = String(max).length; i.autocomplete = 'off';
            if (ph) i.placeholder = ph;
            if (value !== empty && value != null) i.value = value;
            i.addEventListener('input', () => {
                const t = i.value.replace(/[^0-9]/g, '');
                const n = t === '' ? NaN : parseInt(t, 10);
                const ok = n >= min && n <= max;
                i.value = ok ? String(n) : '';
                onChange(ok ? n : empty);
            });
            d.appendChild(i);
            return d;
        },
        // pole tekstowe w komórce (np. grupy „2·1”); onChange dostaje surowy tekst
        textCell({ value = '', cls = '', onChange, maxLen = 6 }) {
            const d = document.createElement('div');
            d.className = 'cell empty edit small ' + cls;
            const i = document.createElement('input');
            i.type = 'text'; i.maxLength = maxLen; i.autocomplete = 'off'; i.style.width = '100%';
            i.value = value;
            i.addEventListener('input', () => onChange(i.value));
            d.appendChild(i);
            return d;
        },
        // drobne kontrolki do paska narzędzi edytora
        toolButton(box, text, fn) {
            const b = document.createElement('button');
            b.textContent = text; b.addEventListener('click', fn); box.appendChild(b); return b;
        },
        toolSelect(box, label, options, value, fn) {
            const l = document.createElement('label');
            l.textContent = label + ' ';
            const sel = document.createElement('select');
            options.forEach(([v, t]) => {
                const o = document.createElement('option');
                o.value = v; o.textContent = t; if (String(v) === String(value)) o.selected = true;
                sel.appendChild(o);
            });
            sel.addEventListener('change', () => fn(sel.value));
            l.appendChild(sel); box.appendChild(l); return sel;
        },
        toolNumber(box, label, min, max, value, fn) {
            const l = document.createElement('label');
            l.textContent = label + ' ';
            const i = document.createElement('input');
            i.type = 'number'; i.min = min; i.max = max; i.value = value;
            i.addEventListener('input', () => { const v = parseInt(i.value, 10); fn(v >= min && v <= max ? v : 0); });
            l.appendChild(i); box.appendChild(l); return i;
        },
        editing: false,
        custom: false,
        wire(h) {
            G.h = h;
            const fx = typeof FX !== 'undefined' ? FX : null;
            const on = (id, fn) => { const e = $(id); if (e && fn) e.addEventListener('click', () => fn()); };
            const baseNew = h.newGame, baseReset = h.reset, baseSolve = h.solve;
            const ss = $('selectSize'), sd = $('selectDifficulty');
            let pending = null; // ziarno z adresu lub z „Wyzwania dnia”
            if (fx) {
                fx.managed = true;
                const q = new URLSearchParams(location.search);
                pending = q.get('seed');
                const pick = (sel, v) => { if (sel && v && [...sel.options].some(o => o.value === v)) sel.value = v; };
                pick(ss, q.get('n')); pick(sd, q.get('d'));
                fx.mount();
            }
            const seedUi = () => {
                const chip = $('fxSeedChip');
                if (!chip || !G.seed) return;
                chip.hidden = false;
                chip.textContent = G.seed.charAt(0) === 'D' && /^D\d{8}$/.test(G.seed)
                    ? '📅 Wyzwanie dnia ' + G.seed.slice(7) + '.' + G.seed.slice(5, 7)
                    : 'Plansza #' + G.seed;
            };
            h.newGame = seed => {
                G.exitEdit(false); G.custom = false;
                if (!fx) { baseNew(); return; }
                fx.custom = false;
                const sd0 = typeof seed === 'string' ? seed : (pending || fx.randSeed());
                pending = null;
                G.seed = sd0;
                fx.withSeed(sd0 + '|' + (ss ? ss.value : '') + '|' + G.level(), baseNew);
                fx.timerStart(); seedUi(); fx.blip();
            };
            h.reset = () => { baseReset(); if (fx) fx.timerStart(); };
            h.solve = () => { if (fx && !G.custom) fx.cheated = true; baseSolve(); };
            on('btnNew', h.newGame); on('btnCheck', h.check); on('btnSolve', h.solve); on('btnReset', h.reset);
            ['selectSize', 'selectDifficulty'].forEach(id => {
                const e = $(id); if (e) e.addEventListener('change', () => h.newGame());
            });
            if (fx) {
                fx.addButton('📅', 'Wyzwanie dnia', () => h.newGame(fx.dailySeed()));
                G.shareUrl = () => {
                    const q = new URLSearchParams();
                    q.set('seed', G.seed);
                    if (ss) q.set('n', ss.value);
                    if (sd) q.set('d', sd.value);
                    return location.origin + location.pathname + '?' + q.toString();
                };
                fx.addButton('📤', 'Udostępnij', () => {
                    if (G.custom) { fx.toast('✏️ Własnej planszy nie da się udostępnić linkiem'); return; }
                    fx.copy(G.shareUrl());
                });
            }
            if (h.edit) G.setupEdit(h);
            h.newGame();
        },
        // --- edytor własnych plansz ---
        setupEdit(h) {
            const row = $('btnNew') && $('btnNew').parentNode;
            if (!row) return;
            const hide = ['btnNew', 'btnCheck', 'btnSolve', 'btnReset'];
            const btn = document.createElement('button');
            btn.id = 'btnEdit'; btn.textContent = '✏️ Własna plansza';
            row.appendChild(btn);
            const panel = document.createElement('div');
            panel.className = 'edit-panel'; panel.id = 'editPanel'; panel.hidden = true;
            panel.innerHTML = '<div class="edit-title">✏️ Ułóż własną planszę</div>' +
                '<div class="controls-row" id="editParams"></div>' +
                '<div class="controls-row" id="editTools"></div>' +
                '<div class="edit-hint" id="editHint"></div>' +
                '<div class="controls-row"><button class="primary" id="btnPlay">▶ Zagraj</button>' +
                '<button id="btnClearEdit">🧹 Wyczyść</button><button class="danger" id="btnCancelEdit">✖ Anuluj</button></div>';
            row.parentNode.insertBefore(panel, row.nextSibling);
            const read = () => {
                const p = {};
                (G._params || []).forEach(q => {
                    const e = $('ep_' + q.id);
                    let v = parseInt(e.value, 10);
                    if (!(v >= q.min)) v = q.min;
                    if (v > q.max) v = q.max;
                    e.value = v; p[q.id] = v;
                });
                return p;
            };
            G.exitEdit = () => {
                G.editing = false; panel.hidden = true;
                hide.forEach(id => { const e = $(id); if (e) e.style.display = ''; });
                btn.style.display = '';
            };
            const enter = () => {
                if (window.FX) FX.timerHide();
                G.editing = true; panel.hidden = false;
                hide.forEach(id => { const e = $(id); if (e) e.style.display = 'none'; });
                btn.style.display = 'none';
                G._params = h.edit.params();
                const box = $('editParams'); box.innerHTML = '';
                G._params.forEach(q => {
                    const l = document.createElement('label');
                    l.textContent = q.label + ': ';
                    const i = document.createElement('input');
                    i.type = 'number'; i.id = 'ep_' + q.id; i.min = q.min; i.max = q.max; i.value = q.def;
                    i.addEventListener('change', () => h.edit.begin(read(), false));
                    l.appendChild(i); box.appendChild(l);
                });
                $('editHint').textContent = h.edit.hint;
                const tb = $('editTools'); tb.innerHTML = '';
                if (h.edit.tools) h.edit.tools(tb);
                h.edit.begin(read(), true);
                G.status('Tryb edycji: ' + h.edit.hint, 'info');
            };
            btn.addEventListener('click', enter);
            $('btnClearEdit').addEventListener('click', () => h.edit.begin(read(), false));
            $('btnCancelEdit').addEventListener('click', () => h.newGame());
            $('btnPlay').addEventListener('click', () => {
                const err = h.edit.play(read());  // sprawdza i zapisuje stan, bez rysowania
                if (err) { G.status(err, 'error'); return; }
                G.exitEdit(); G.custom = true; if (window.FX) FX.custom = true; h.reset(); if (window.FX) FX.paintBest();
                G.status('Własna plansza – powodzenia! (Przycisk „Rozwiąż” nie jest dla niej dostępny).', 'info');
            });
        },
        exitEdit() { },
        noSolution() { G.status('Dla własnej planszy nie ma rozwiązania wzorcowego – sprawdź ją przyciskiem „Sprawdź”.', 'info'); }
    };
    window.G = G;
})();
