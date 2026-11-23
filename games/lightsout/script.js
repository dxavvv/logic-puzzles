(function () {
    const boardGrid = document.getElementById('boardGrid');
    const statusArea = document.getElementById('statusArea');
    const statsRow = document.getElementById('statsRow');
    const selectSize = document.getElementById('selectSize');

    let N = 5;
    let grid = [];
    let initial = [];
    let moves = 0;
    let solved = false;

    const copy = g => g.map(r => [...r]);

    function setStatus(msg, type = 'neutral') {
        statusArea.textContent = msg;
        statusArea.className = 'status-area ' + type;
    }

    function press(g, r, c) {
        for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const rr = r + dr, cc = c + dc;
            if (rr >= 0 && rr < N && cc >= 0 && cc < N) g[rr][cc] ^= 1;
        }
    }

    // Plansza powstaje z losowych naciśnięć od stanu "wszystko zgaszone" – zawsze jest rozwiązywalna.
    function generate() {
        let g;
        do {
            g = Array.from({ length: N }, () => Array(N).fill(0));
            for (let r = 0; r < N; r++)
                for (let c = 0; c < N; c++)
                    if (Math.random() < 0.5) press(g, r, c);
        } while (g.every(row => row.every(v => v === 0)));
        return g;
    }

    // Eliminacja Gaussa w GF(2): zwraca wektor naciśnięć albo null.
    function solve(g) {
        const n = N * N;
        const rows = [];
        for (let i = 0; i < n; i++) {
            const r = Math.floor(i / N), c = i % N;
            const tmp = Array.from({ length: N }, () => Array(N).fill(0));
            press(tmp, r, c);
            const row = new Array(n + 1).fill(0);
            for (let j = 0; j < n; j++) row[j] = tmp[Math.floor(j / N)][j % N];
            row[n] = g[r][c];
            rows.push(row);
        }
        const pivotCol = [];
        let rank = 0;
        for (let col = 0; col < n && rank < n; col++) {
            let p = -1;
            for (let i = rank; i < n; i++) if (rows[i][col]) { p = i; break; }
            if (p < 0) continue;
            [rows[rank], rows[p]] = [rows[p], rows[rank]];
            for (let i = 0; i < n; i++)
                if (i !== rank && rows[i][col])
                    for (let k = col; k <= n; k++) rows[i][k] ^= rows[rank][k];
            pivotCol.push(col);
            rank++;
        }
        for (let i = rank; i < n; i++) if (rows[i][n]) return null;
        const x = new Array(n).fill(0);
        pivotCol.forEach((col, i) => { x[col] = rows[i][n]; });
        return x;
    }

    function render() {
        boardGrid.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        boardGrid.innerHTML = '';
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const b = document.createElement('button');
                b.className = 'light' + (grid[r][c] ? ' on' : '');
                b.setAttribute('aria-label', `Lampka ${r + 1}, ${c + 1}: ${grid[r][c] ? 'włączona' : 'wyłączona'}`);
                b.dataset.r = r;
                b.dataset.c = c;
                boardGrid.appendChild(b);
            }
        }
        const lit = grid.flat().filter(Boolean).length;
        statsRow.innerHTML = `<span>🎯 Ruchy: ${moves}</span><span>💡 Zapalone: ${lit}</span>`;
    }

    function start(newBoard) {
        N = parseInt(selectSize.value, 10);
        if (newBoard) initial = generate();
        grid = copy(initial);
        moves = 0;
        solved = false;
        render();
        setStatus('Zgaś wszystkie światła.');
    }

    boardGrid.addEventListener('click', e => {
        const b = e.target.closest('.light');
        if (!b || solved) return;
        press(grid, +b.dataset.r, +b.dataset.c);
        moves++;
        render();
        if (grid.every(row => row.every(v => v === 0))) {
            solved = true;
            setStatus(`🎉 Brawo! Rozwiązane w ${moves} ruchach.`, 'success');
        } else {
            setStatus('Zgaś wszystkie światła.');
        }
    });

    document.getElementById('btnNew').addEventListener('click', () => start(true));
    document.getElementById('btnReset').addEventListener('click', () => start(false));
    selectSize.addEventListener('change', () => start(true));

    document.getElementById('btnHint').addEventListener('click', () => {
        if (solved) return;
        const x = solve(grid);
        if (!x) return setStatus('Brak rozwiązania z tego stanu.', 'error');
        const idx = x.findIndex(v => v === 1);
        const btn = boardGrid.children[idx];
        btn.style.borderColor = 'var(--accent)';
        btn.style.boxShadow = '0 0 14px var(--accent-glow)';
        setStatus(`Podpowiedź: kliknij zaznaczoną lampkę (wiersz ${Math.floor(idx / N) + 1}, kolumna ${idx % N + 1}).`, 'info');
    });

    start(true);
})();
