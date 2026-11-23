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

    const PALETTE = ['#1a1a35', '#1e2238', '#222030'];

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            const d = G.cell({ max: N, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } });
            const id = reg[r][c];
            const same = (x, y) => x >= 0 && y >= 0 && x < N && y < N && reg[x][y] === id;
            const b = '3px solid #8aa0d8', t = '1px solid transparent';
            d.style.borderTop = same(r - 1, c) ? t : b;
            d.style.borderBottom = same(r + 1, c) ? t : b;
            d.style.borderLeft = same(r, c - 1) ? t : b;
            d.style.borderRight = same(r, c + 1) ? t : b;
            if (!giv[r][c] && !revealed && !err.has(r * N + c)) d.style.background = PALETTE[id % 3];
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
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
