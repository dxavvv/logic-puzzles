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
        wire(h) {
            G.h = h;
            const on = (id, fn) => { const e = $(id); if (e && fn) e.addEventListener('click', () => fn()); };
            on('btnNew', h.newGame); on('btnCheck', h.check); on('btnSolve', h.solve); on('btnReset', h.reset);
            ['selectSize', 'selectDifficulty'].forEach(id => {
                const e = $(id); if (e) e.addEventListener('change', () => h.newGame());
            });
            h.newGame();
        }
    };
    window.G = G;
})();
