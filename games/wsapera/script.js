(function () {
    const board = G.$('boardGrid');
    const RING = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
    let N, sol, clue, cur, revealed, errCells = new Set();

    // długości grup zamalowanych pól w pierścieniu 8 sąsiadów (cyklicznie)
    function groups(grid, r, c) {
        const f = RING.map(([dr, dc]) => (grid[r + dr] && grid[r + dr][c + dc] ? 1 : 0));
        const total = f.reduce((a, b) => a + b, 0);
        if (total === 0) return [0];
        if (total === 8) return [8];
        let start = 0;
        while (f[start] === 1 && f[(start + 7) % 8] === 1) start = (start + 1) % 8;
        const out = []; let run = 0;
        for (let i = 0; i < 8; i++) {
            if (f[(start + i) % 8]) run++; else if (run) { out.push(run); run = 0; }
        }
        if (run) out.push(run);
        return out.sort((a, b) => b - a);
    }

    function clueOk(grid, r, c) {
        const want = clue[r][c];
        const g = groups(grid, r, c);
        if (want.length === 1) return g.reduce((a, b) => a + b, 0) === want[0];
        return g.length === want.length && g.every((v, i) => v === want[i]);
    }

    function has22(grid) {
        for (let r = 0; r < N - 1; r++) for (let c = 0; c < N - 1; c++)
            if (grid[r][c] && grid[r + 1][c] && grid[r][c + 1] && grid[r + 1][c + 1]) return true;
        return false;
    }

    function grow() {
        for (;;) {
            const g = G.grid(N, N, 0);
            g[G.rnd(N)][G.rnd(N)] = 1;
            let n = 1;
            const target = Math.round(N * N * 0.4);
            for (let t = 0; t < 3000 && n < target; t++) {
                const r = G.rnd(N), c = G.rnd(N);
                if (g[r][c]) continue;
                if (G.N4.filter(([dr, dc]) => g[r + dr] && g[r + dr][c + dc]).length !== 1) continue;
                g[r][c] = 1;
                if (has22(g)) { g[r][c] = 0; continue; }
                n++;
            }
            if (n >= target * 0.8) return g;
        }
    }

    function newGame() {
        N = G.size(6);
        sol = grow();
        const p = { easy: 0.85, medium: 0.6, hard: 0.42 }[G.level()];
        clue = G.grid(N, N, null);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (sol[r][c] || Math.random() > p) continue;
            const g = groups(sol, r, c);
            clue[r][c] = g.length === 1 ? [g[0]] : g;
        }
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Zamaluj pola tak, aby powstała jedna ścieżka.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const err = errCells.has(r * N + c) ? ' error-highlight' : '';
            if (clue[r][c]) {
                const d = document.createElement('div');
                d.className = 'cell given small' + err;
                d.textContent = clue[r][c].join('·');
                board.appendChild(d);
            } else {
                const d = G.tap('', (cur[r][c] ? 'marked' : '') + err, () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
                if (cur[r][c]) d.style.background = revealed ? '#2e6b47' : '#3b5f94';
                board.appendChild(d);
            }
        }
    }

    function check() {
        errCells = new Set();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
            if (clue[r][c] && !clueOk(cur, r, c)) errCells.add(r * N + c);
        const { comps } = G.components(N, N, (r, c) => cur[r][c] === 1);
        const square = has22(cur);
        render();
        if (errCells.size) G.status(`Cyfry w ${errCells.size} polach się nie zgadzają.`, 'error');
        else if (square) G.status('Zamalowane pola nie mogą zawierać kwadratu 2×2.', 'error');
        else if (!comps.length) G.status('Zamaluj pola.', 'info');
        else if (comps.length > 1) G.status('Zamalowane pola muszą tworzyć jedną całość.', 'error');
        else if (comps[0].length < 2) G.status('Wielokąt musi mieć co najmniej dwa pola.', 'error');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
