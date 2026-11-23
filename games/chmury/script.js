(function () {
    const board = G.$('boardGrid');
    let N, sol, cur, rowC, colC, revealed, errCells = new Set(), errLines = new Set();

    function newGame() {
        N = G.size(6);
        sol = G.grid(N, N, 0);
        const near = (r, c) => {
            for (let x = r - 1; x <= r + 1; x++) for (let y = c - 1; y <= c + 1; y++)
                if (x >= 0 && y >= 0 && x < N && y < N && sol[x][y]) return true;
            return false;
        };
        let covered = 0;
        const want = Math.round(N * N * 0.32);
        for (let t = 0; t < 400 && covered < want; t++) {
            const w = 2 + G.rnd(Math.min(3, N - 1)), h = 2 + G.rnd(Math.min(3, N - 1));
            const r = G.rnd(N - h + 1), c = G.rnd(N - w + 1);
            let ok = true;
            for (let x = r - 1; x <= r + h && ok; x++) for (let y = c - 1; y <= c + w && ok; y++)
                if (x >= 0 && y >= 0 && x < N && y < N && sol[x][y]) ok = false;
            if (!ok) continue;
            for (let x = r; x < r + h; x++) for (let y = c; y < c + w; y++) sol[x][y] = 1;
            covered += w * h;
        }
        const hide = { easy: 0.05, medium: 0.25, hard: 0.45 }[G.level()];
        rowC = sol.map(row => (Math.random() < hide ? -1 : row.reduce((a, b) => a + b, 0)));
        colC = Array.from({ length: N }, (_, c) => (Math.random() < hide ? -1 : sol.reduce((a, row) => a + row[c], 0)));
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        revealed = false; errCells = new Set(); errLines = new Set();
        render();
        G.status('Zamaluj pola, w których są chmury.');
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
                const cls = (cur[r][c] ? 'marked' : '') + (revealed && cur[r][c] ? ' revealed' : '') + (errCells.has(r * N + c) ? ' error-highlight' : '');
                board.appendChild(G.tap(cur[r][c] ? '☁' : '', cls, () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); errLines = new Set(); render(); }));
            }
        }
    }

    function check() {
        errCells = new Set(); errLines = new Set();
        const { comps } = G.components(N, N, (r, c) => cur[r][c] === 1, G.N8);
        for (const comp of comps) {
            const rs = comp.map(p => p[0]), cs = comp.map(p => p[1]);
            const h = Math.max(...rs) - Math.min(...rs) + 1, w = Math.max(...cs) - Math.min(...cs) + 1;
            if (h * w !== comp.length || h < 2 || w < 2) comp.forEach(([r, c]) => errCells.add(r * N + c));
        }
        for (let r = 0; r < N; r++) if (rowC[r] >= 0 && cur[r].reduce((a, b) => a + b, 0) !== rowC[r]) errLines.add('r' + r);
        for (let c = 0; c < N; c++) if (colC[c] >= 0 && cur.reduce((a, row) => a + row[c], 0) !== colC[c]) errLines.add('c' + c);
        render();
        if (errCells.size) G.status('Chmury muszą być prostokątami o bokach ≥ 2 i nie mogą się stykać (nawet rogami).', 'error');
        else if (errLines.size) G.status('Niektóre liczby (czerwone) się nie zgadzają.', 'error');
        else if (!cur.some(r => r.some(v => v))) G.status('Zamaluj pola chmur.', 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        cur = G.copy(sol); revealed = true; errCells = new Set(); errLines = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
