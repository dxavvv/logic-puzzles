(function () {
    const board = G.$('boardGrid');
    let N, sol, num, cur, revealed, errCells = new Set();

    function count(grid, r, c) {
        let k = 0;
        for (let x = r - 1; x <= r + 1; x++) for (let y = c - 1; y <= c + 1; y++)
            if (x >= 0 && y >= 0 && x < N && y < N && grid[x][y]) k++;
        return k;
    }

    function newGame() {
        N = G.size(8);
        sol = G.grid(N, N, 0);
        const d = 0.4 + Math.random() * 0.2;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) sol[r][c] = Math.random() < d ? 1 : 0;
        const p = { easy: 0.8, medium: 0.6, hard: 0.45 }[G.level()];
        num = G.grid(N, N, -1);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (Math.random() < p) num[r][c] = count(sol, r, c);
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Zamaluj kratki zgodnie z cyframi.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (cur[r][c] ? 'marked' : '') + (errCells.has(r * N + c) ? ' error-highlight' : '');
            const d = G.tap(num[r][c] >= 0 ? num[r][c] : '', cls, () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
            if (cur[r][c]) { d.style.background = '#3b5f94'; d.style.color = '#fff'; }
            board.appendChild(d);
        }
    }

    function check() {
        errCells = new Set();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
            if (num[r][c] >= 0 && count(cur, r, c) !== num[r][c]) errCells.add(r * N + c);
        render();
        if (errCells.size) G.status(`Cyfry w ${errCells.size} polach się nie zgadzają.`, 'error');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
