(function () {
    const board = G.$('boardGrid');
    let N, house, sol, rowC, colC, cur, revealed, errCells = new Set(), errLines = new Set();

    function newGame() {
        N = G.size(8);
        for (;;) {
            house = G.grid(N, N, 0);
            sol = G.grid(N, N, 0);
            const cells = [];
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) cells.push([r, c]);
            G.shuffle(cells);
            const want = Math.round(N * N * 0.17);
            let n = 0;
            for (const [r, c] of cells) {
                if (n >= want) break;
                if (house[r][c] || G.N8.some(([dr, dc]) => sol[r + dr] && sol[r + dr][c + dc])) continue;
                const opts = G.N4.map(([dr, dc]) => [r + dr, c + dc])
                    .filter(([x, y]) => x >= 0 && y >= 0 && x < N && y < N && !sol[x][y] && !house[x][y]);
                if (!opts.length) continue;
                const [x, y] = G.pick(opts);
                sol[r][c] = 1; house[x][y] = 1; n++;
            }
            if (n >= want) break;
        }
        const hide = { easy: 0, medium: 0.2, hard: 0.4 }[G.level()];
        rowC = sol.map(row => (Math.random() < hide ? -1 : row.reduce((a, b) => a + b, 0)));
        colC = Array.from({ length: N }, (_, c) => (Math.random() < hide ? -1 : sol.reduce((a, row) => a + row[c], 0)));
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        revealed = false; errCells = new Set(); errLines = new Set();
        render();
        G.status('Postaw przy każdym domku zbiornik.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${N + 1}, 1fr)`;
        board.innerHTML = '';
        const clue = (v, bad) => {
            const d = document.createElement('div');
            d.className = 'clue';
            d.textContent = v >= 0 ? v : '';
            if (bad) d.style.color = '#f87171';
            return d;
        };
        board.appendChild(clue(-1));
        for (let c = 0; c < N; c++) board.appendChild(clue(colC[c], errLines.has('c' + c)));
        for (let r = 0; r < N; r++) {
            board.appendChild(clue(rowC[r], errLines.has('r' + r)));
            for (let c = 0; c < N; c++) {
                const err = errCells.has(r * N + c) ? ' error-highlight' : '';
                if (house[r][c]) {
                    const d = document.createElement('div');
                    d.className = 'cell given' + err;
                    d.textContent = '🏠';
                    board.appendChild(d);
                } else {
                    board.appendChild(G.tap(cur[r][c] ? '⛽' : '', (cur[r][c] ? 'marked' : '') + (revealed && cur[r][c] ? ' revealed' : '') + err,
                        () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); errLines = new Set(); render(); }));
                }
            }
        }
    }

    // czy da się przypisać każdemu domkowi osobny sąsiedni zbiornik
    function matched(grid) {
        const hs = [], ts = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (house[r][c]) hs.push([r, c]); if (grid[r][c]) ts.push([r, c]); }
        if (hs.length !== ts.length) return false;
        const adj = hs.map(([r, c]) => ts.map((t, i) => (Math.abs(t[0] - r) + Math.abs(t[1] - c) === 1 ? i : -1)).filter(i => i >= 0));
        const owner = Array(ts.length).fill(-1);
        const tryH = (h, seen) => {
            for (const t of adj[h]) {
                if (seen[t]) continue;
                seen[t] = true;
                if (owner[t] < 0 || tryH(owner[t], seen)) { owner[t] = h; return true; }
            }
            return false;
        };
        return hs.every((_, h) => tryH(h, Array(ts.length).fill(false)));
    }

    function check() {
        errCells = new Set(); errLines = new Set();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (cur[r][c] && G.N8.some(([dr, dc]) => cur[r + dr] && cur[r + dr][c + dc])) errCells.add(r * N + c);
        }
        for (let r = 0; r < N; r++) if (rowC[r] >= 0 && cur[r].reduce((a, b) => a + b, 0) !== rowC[r]) errLines.add('r' + r);
        for (let c = 0; c < N; c++) if (colC[c] >= 0 && cur.reduce((a, row) => a + row[c], 0) !== colC[c]) errLines.add('c' + c);
        const ok = matched(cur);
        render();
        if (errCells.size) G.status('Zbiorniki nie mogą się stykać – nawet rogiem.', 'error');
        else if (errLines.size) G.status('Niektóre liczby (czerwone) się nie zgadzają.', 'error');
        else if (!ok) G.status('Przy każdym domku musi stać dokładnie jeden zbiornik (po jego boku).', 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        cur = G.copy(sol); revealed = true; errCells = new Set(); errLines = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
