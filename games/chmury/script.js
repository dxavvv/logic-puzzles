(function () {
    const board = G.$('boardGrid');
    let R, C, sol, cur, rowC, colC, revealed, errCells = new Set(), errLines = new Set();

    function newGame() {
        R = C = G.size(6);
        sol = G.grid(R, C, 0);
        let covered = 0;
        const want = Math.round(R * C * 0.32);
        for (let t = 0; t < 400 && covered < want; t++) {
            const w = 2 + G.rnd(Math.min(3, C - 1)), h = 2 + G.rnd(Math.min(3, R - 1));
            const r = G.rnd(R - h + 1), c = G.rnd(C - w + 1);
            let ok = true;
            for (let x = r - 1; x <= r + h && ok; x++) for (let y = c - 1; y <= c + w && ok; y++)
                if (x >= 0 && y >= 0 && x < R && y < C && sol[x][y]) ok = false;
            if (!ok) continue;
            for (let x = r; x < r + h; x++) for (let y = c; y < c + w; y++) sol[x][y] = 1;
            covered += w * h;
        }
        const hide = { easy: 0.05, medium: 0.25, hard: 0.45 }[G.level()];
        rowC = sol.map(row => (Math.random() < hide ? -1 : row.reduce((a, b) => a + b, 0)));
        colC = Array.from({ length: C }, (_, c) => (Math.random() < hide ? -1 : sol.reduce((a, row) => a + row[c], 0)));
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; errCells = new Set(); errLines = new Set();
        render();
        G.status('Zamaluj pola, w których są chmury.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${C + 1}, 1fr)`;
        board.innerHTML = '';
        const clue = (v, bad, set) => {
            if (G.editing && set) return G.numCell({ max: 99, min: 0, empty: -1, value: v, onChange: set });
            const d = document.createElement('div');
            d.className = 'clue';
            d.textContent = v >= 0 ? v : '';
            if (bad) d.style.color = '#f87171';
            return d;
        };
        board.appendChild(clue(-1));
        for (let c = 0; c < C; c++) board.appendChild(clue(colC[c], errLines.has('c' + c), v => { colC[c] = v; }));
        for (let r = 0; r < R; r++) {
            board.appendChild(clue(rowC[r], errLines.has('r' + r), v => { rowC[r] = v; }));
            for (let c = 0; c < C; c++) {
                if (G.editing) { const e = document.createElement('div'); e.className = 'cell'; board.appendChild(e); continue; }
                const cls = (cur[r][c] ? 'marked' : '') + (revealed && cur[r][c] ? ' revealed' : '') + (errCells.has(r * C + c) ? ' error-highlight' : '');
                board.appendChild(G.tap(cur[r][c] ? '☁' : '', cls, () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); errLines = new Set(); render(); }));
            }
        }
    }

    function check() {
        errCells = new Set(); errLines = new Set();
        const { comps } = G.components(R, C, (r, c) => cur[r][c] === 1, G.N8);
        for (const comp of comps) {
            const rs = comp.map(p => p[0]), cs = comp.map(p => p[1]);
            const h = Math.max(...rs) - Math.min(...rs) + 1, w = Math.max(...cs) - Math.min(...cs) + 1;
            if (h * w !== comp.length || h < 2 || w < 2) comp.forEach(([r, c]) => errCells.add(r * C + c));
        }
        for (let r = 0; r < R; r++) if (rowC[r] >= 0 && cur[r].reduce((a, b) => a + b, 0) !== rowC[r]) errLines.add('r' + r);
        for (let c = 0; c < C; c++) if (colC[c] >= 0 && cur.reduce((a, row) => a + row[c], 0) !== colC[c]) errLines.add('c' + c);
        render();
        if (errCells.size) G.status('Chmury muszą być prostokątami o bokach ≥ 2 i nie mogą się stykać (nawet rogami).', 'error');
        else if (errLines.size) G.status('Niektóre liczby (czerwone) się nie zgadzają.', 'error');
        else if (!cur.some(r => r.some(v => v))) G.status('Zamaluj pola chmur.', 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol); revealed = true; errCells = new Set(); errLines = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 20, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 20, def: C }],
        hint: 'Wpisz, ile pól zajmują chmury w wierszach (po lewej) i kolumnach (u góry). Puste = brak wskazówki; 0 też jest dozwolone.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; sol = null; rowC = Array(R).fill(-1); colC = Array(C).fill(-1); }
            cur = G.grid(R, C, 0); revealed = false; errCells = new Set(); errLines = new Set();
            render();
        },
        play() { sol = null; return null; }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
