(function () {
    const board = G.$('boardGrid');
    let N, reg, sol, giv, cur, revealed;

    function connected(cells) {
        if (!cells.length) return false;
        const set = new Set(cells.map(([r, c]) => r * N + c));
        const seen = new Set([cells[0][0] * N + cells[0][1]]);
        const st = [cells[0]];
        while (st.length) {
            const [r, c] = st.pop();
            for (const [dr, dc] of G.N4) {
                const k = (r + dr) * N + (c + dc);
                if (r + dr < 0 || c + dc < 0 || r + dr >= N || c + dc >= N) continue;
                if (set.has(k) && !seen.has(k)) { seen.add(k); st.push([r + dr, c + dc]); }
            }
        }
        return seen.size === set.size;
    }

    // start od zwykłych bloków, potem losowe wymiany sąsiednich pól między obszarami
    function makeRegions() {
        const bw = N === 6 ? 3 : 3, bh = N === 6 ? 2 : 3;
        const g = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => Math.floor(r / bh) * (N / bw) + Math.floor(c / bw)));
        const cellsOf = id => {
            const out = [];
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] === id) out.push([r, c]);
            return out;
        };
        for (let t = 0; t < N * N * 40; t++) {
            const r = G.rnd(N), c = G.rnd(N);
            const [dr, dc] = G.pick(G.N4);
            const x = r + dr, y = c + dc;
            if (x < 0 || y < 0 || x >= N || y >= N || g[x][y] === g[r][c]) continue;
            const a = g[r][c], b = g[x][y];
            g[r][c] = b; g[x][y] = a;
            if (!(connected(cellsOf(a)) && connected(cellsOf(b)))) { g[r][c] = a; g[x][y] = b; }
        }
        return g;
    }

    function newGame() {
        N = G.size(9);
        do { reg = makeRegions(); sol = G.regionFill(N, reg); } while (!sol);
        const p = { easy: 0.5, medium: 0.38, hard: 0.28 }[G.level()];
        giv = sol.map(row => row.map(v => (Math.random() < p ? v : 0)));
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij planszę.');
    }

    // domyślny podział na prostokątne bloki (dzielniki N najbliższe pierwiastkowi)
    function defaultReg(n) {
        let bh = 1;
        for (let h = 1; h * h <= n; h++) if (n % h === 0) bh = h;
        const bw = n / bh;
        return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => Math.floor(r / bh) * (n / bw) + Math.floor(c / bw)));
    }

    let mode = 'regions', active = 0;
    const hue = id => `hsl(${(id * 47) % 360} 45% 24%)`;

    const PALETTE = ['#1a1a35', '#1e2238', '#222030'];

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            let d;
            if (G.editing && mode === 'regions') d = G.tap(reg[r][c] + 1, '', () => { reg[r][c] = active; render(); });
            else if (G.editing) d = G.numCell({ max: N, value: giv[r][c], onChange: v => { giv[r][c] = v; } });
            else {
                const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
                d = G.cell({ max: N, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } });
            }
            const id = reg[r][c];
            if (G.editing && mode === 'regions') { d.style.background = hue(id); d.style.cursor = 'pointer'; }
            const same = (x, y) => x >= 0 && y >= 0 && x < N && y < N && reg[x][y] === id;
            const b = '3px solid #8aa0d8', t = '1px solid transparent';
            d.style.borderTop = same(r - 1, c) ? t : b;
            d.style.borderBottom = same(r + 1, c) ? t : b;
            d.style.borderLeft = same(r, c - 1) ? t : b;
            d.style.borderRight = same(r, c + 1) ? t : b;
            if (!G.editing && !giv[r][c] && !revealed && !err.has(r * N + c)) d.style.background = PALETTE[id % 3];
            board.appendChild(d);
        }
    }

    function check() {
        const err = G.latinErrors(cur, N, N);
        const byReg = {};
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const v = cur[r][c];
            if (!v) continue;
            const k = reg[r][c] + ':' + v;
            (byReg[k] = byReg[k] || []).push(r * N + c);
        }
        for (const k in byReg) if (byReg[k].length > 1) byReg[k].forEach(i => err.add(i));
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        if (err.size) { render(err); G.status('Są błędy – zaznaczone pola łamią zasady.', 'error'); }
        else if (empty) G.status(`Na razie bez błędów. Puste pola: ${empty}.`, 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'n', label: 'Rozmiar n×n', min: 4, max: 9, def: N }],
        hint: 'Tryb „Obszary”: wybierz numer obszaru i klikaj pola, aby je do niego przypisać (każdy obszar ma mieć dokładnie n spójnych pól). Tryb „Cyfry”: wpisz cyfry początkowe.',
        tools(box) {
            G.toolSelect(box, 'Tryb:', [['regions', 'Obszary'], ['digits', 'Cyfry']], mode, v => { mode = v; render(); });
            G.toolSelect(box, 'Obszar:', Array.from({ length: N }, (_, i) => [i, String(i + 1)]), active, v => { active = +v; });
        },
        begin(p, keep) {
            if (!(keep && p.n === N)) {
                N = p.n; sol = null; reg = defaultReg(N); giv = G.grid(N, N, 0);
                if (active >= N) active = 0;
            }
            cur = G.copy(giv); revealed = false;
            render();
        },
        play() {
            for (let id = 0; id < N; id++) {
                const cells = [];
                for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (reg[r][c] === id) cells.push([r, c]);
                if (cells.length !== N) return `Obszar ${id + 1} ma ${cells.length} pól, a powinien mieć ${N}.`;
                if (!connected(cells)) return `Obszar ${id + 1} nie jest spójny.`;
            }
            const err = G.latinErrors(giv, N, N);
            const seen = new Set();
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (giv[r][c]) {
                const k = reg[r][c] + ':' + giv[r][c];
                if (seen.has(k)) err.add(1);
                seen.add(k);
            }
            if (err.size) return 'Cyfry początkowe łamią zasady (powtórzenie w wierszu, kolumnie lub obszarze).';
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
