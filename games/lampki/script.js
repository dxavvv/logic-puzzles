(function () {
    const board = G.$('boardGrid');
    let N, black, num, solLamps, lamps, revealed;

    function newGame() {
        N = G.size(7);
        const lv = G.level();
        const pb = { easy: 0.15, medium: 0.2, hard: 0.24 }[lv];
        const pn = { easy: 0.85, medium: 0.6, hard: 0.4 }[lv];
        black = G.grid(N, N, false);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) black[r][c] = Math.random() < pb;
        // rozwiązanie: stawiamy lampki na nieoświetlonych polach, aż wszystko się świeci
        solLamps = G.grid(N, N, false);
        const lit = G.grid(N, N, false);
        const whites = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!black[r][c]) whites.push([r, c]);
        G.shuffle(whites);
        for (const [r, c] of whites) {
            if (lit[r][c]) continue;
            solLamps[r][c] = true;
            lit[r][c] = true;
            for (const [dr, dc] of G.N4) {
                let x = r + dr, y = c + dc;
                while (x >= 0 && y >= 0 && x < N && y < N && !black[x][y]) { lit[x][y] = true; x += dr; y += dc; }
            }
        }
        num = G.grid(N, N, -1);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (!black[r][c] || Math.random() > pn) continue;
            let k = 0;
            for (const [dr, dc] of G.N4) {
                const x = r + dr, y = c + dc;
                if (x >= 0 && y >= 0 && x < N && y < N && solLamps[x][y]) k++;
            }
            num[r][c] = k;
        }
        reset();
    }

    function reset() {
        lamps = G.grid(N, N, false);
        revealed = false;
        render();
        G.status('Oświetl wszystkie białe pola.');
    }

    // oświetlenie i konflikty dla bieżącego ustawienia
    function analyse() {
        const lit = G.grid(N, N, 0), conflict = G.grid(N, N, false);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (!lamps[r][c]) continue;
            lit[r][c]++;
            for (const [dr, dc] of G.N4) {
                let x = r + dr, y = c + dc;
                while (x >= 0 && y >= 0 && x < N && y < N && !black[x][y]) {
                    lit[x][y]++;
                    if (lamps[x][y]) { conflict[x][y] = true; conflict[r][c] = true; }
                    x += dr; y += dc;
                }
            }
        }
        return { lit, conflict };
    }

    function numberBad(r, c) {
        if (num[r][c] < 0) return false;
        let k = 0;
        for (const [dr, dc] of G.N4) {
            const x = r + dr, y = c + dc;
            if (x >= 0 && y >= 0 && x < N && y < N && lamps[x][y]) k++;
        }
        return k !== num[r][c];
    }

    function render(showErr = false) {
        const { lit, conflict } = analyse();
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            let d;
            if (black[r][c]) {
                d = document.createElement('div');
                d.className = 'cell black' + (showErr && numberBad(r, c) ? ' error-highlight' : '');
                d.textContent = num[r][c] >= 0 ? num[r][c] : '';
            } else {
                const cls = (lit[r][c] ? ' marked' : '') + (conflict[r][c] ? ' error-highlight' : '') + (revealed && lamps[r][c] ? ' revealed' : '');
                d = G.tap(lamps[r][c] ? '💡' : '', cls, () => { lamps[r][c] = !lamps[r][c]; revealed = false; render(); });
            }
            board.appendChild(d);
        }
    }

    function check() {
        const { lit, conflict } = analyse();
        let dark = 0, bad = 0, clash = 0;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (!black[r][c] && !lit[r][c]) dark++;
            if (conflict[r][c]) clash++;
            if (black[r][c] && numberBad(r, c)) bad++;
        }
        render(true);
        if (clash) G.status('Niektóre lampki oświetlają się nawzajem.', 'error');
        else if (bad) G.status('Liczby przy czarnych polach nie zgadzają się z lampkami.', 'error');
        else if (dark) G.status(`Brak błędów, ale ${dark} pól jest jeszcze ciemnych.`, 'info');
        else G.status('🎉 Brawo! Wszystko oświetlone.', 'success');
    }

    function solve() {
        lamps = G.copy(solLamps);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
