(function () {
    const board = G.$('boardGrid');
    let N, sol, num, cur, revealed, errCells = new Set();

    function visible(grid, r, c) {
        let k = 1;
        for (const [dr, dc] of G.N4) {
            let x = r + dr, y = c + dc;
            while (x >= 0 && y >= 0 && x < N && y < N && !grid[x][y]) { k++; x += dr; y += dc; }
        }
        return k;
    }

    function whitesConnected(grid) {
        const { comps } = G.components(N, N, (r, c) => !grid[r][c]);
        return comps.length <= 1;
    }

    function newGame() {
        N = G.size(6);
        sol = G.grid(N, N, 0);
        const cells = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) cells.push([r, c]);
        G.shuffle(cells);
        const want = Math.round(N * N * 0.22);
        let n = 0;
        for (const [r, c] of cells) {
            if (n >= want) break;
            if (G.N4.some(([dr, dc]) => sol[r + dr] && sol[r + dr][c + dc])) continue;
            sol[r][c] = 1;
            if (whitesConnected(sol)) n++; else sol[r][c] = 0;
        }
        const p = { easy: 0.65, medium: 0.45, hard: 0.32 }[G.level()];
        num = G.grid(N, N, 0);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!sol[r][c] && Math.random() < p) num[r][c] = visible(sol, r, c);
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Ustaw wieże (zamaluj pola).');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const err = errCells.has(r * N + c) ? ' error-highlight' : '';
            if (num[r][c]) {
                const d = document.createElement('div');
                d.className = 'cell given' + err;
                d.textContent = num[r][c];
                board.appendChild(d);
            } else {
                const cls = (cur[r][c] ? 'black' : '') + (revealed && cur[r][c] ? ' revealed' : '') + err;
                const d = G.tap(cur[r][c] ? '🏰' : '', cls, () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
                if (cur[r][c]) d.style.cursor = 'pointer';
                board.appendChild(d);
            }
        }
    }

    function check() {
        errCells = new Set();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (cur[r][c]) {
                for (const [dr, dc] of G.N4) if (cur[r + dr] && cur[r + dr][c + dc]) errCells.add(r * N + c);
            } else if (num[r][c] && visible(cur, r, c) !== num[r][c]) errCells.add(r * N + c);
        }
        const connected = whitesConnected(cur);
        render();
        if (errCells.size) G.status('Są błędy: wieże stykają się bokami lub liczby się nie zgadzają.', 'error');
        else if (!connected) G.status('Białe pola muszą tworzyć jedną całość.', 'error');
        else if (!cur.some(r => r.some(v => v))) G.status('Ustaw wieże.', 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
