(function () {
    const board = G.$('boardGrid');
    let R, C, sol, num, cur, revealed, errCells = new Set();

    function count(grid, r, c) {
        let k = 0;
        for (let x = r - 1; x <= r + 1; x++) for (let y = c - 1; y <= c + 1; y++)
            if (x >= 0 && y >= 0 && x < R && y < C && grid[x][y]) k++;
        return k;
    }

    function newGame() {
        R = C = G.size(8);
        sol = G.grid(R, C, 0);
        const d = 0.4 + Math.random() * 0.2;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) sol[r][c] = Math.random() < d ? 1 : 0;
        const p = { easy: 0.8, medium: 0.6, hard: 0.45 }[G.level()];
        num = G.grid(R, C, -1);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (Math.random() < p) num[r][c] = count(sol, r, c);
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Zamaluj kratki zgodnie z cyframi.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) { board.appendChild(G.numCell({ max: 9, min: 0, empty: -1, value: num[r][c], onChange: v => { num[r][c] = v; } })); continue; }
            const cls = (cur[r][c] ? 'marked' : '') + (errCells.has(r * C + c) ? ' error-highlight' : '');
            const d = G.tap(num[r][c] >= 0 ? num[r][c] : '', cls, () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
            if (cur[r][c]) { d.style.background = '#3b5f94'; d.style.color = '#fff'; }
            board.appendChild(d);
        }
    }

    function check() {
        errCells = new Set();
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++)
            if (num[r][c] >= 0 && count(cur, r, c) !== num[r][c]) errCells.add(r * C + c);
        render();
        if (errCells.size) G.status(`Cyfry w ${errCells.size} polach się nie zgadzają.`, 'error');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 20, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 20, def: C }],
        hint: 'Wpisz w polach cyfry 0–9: ile z 9 pól wokół (razem z tym) ma być zamalowanych. Puste pole = brak wskazówki.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; sol = null; num = G.grid(R, C, -1); }
            cur = G.grid(R, C, 0); revealed = false; errCells = new Set();
            render();
        },
        play() { sol = null; return null; }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
