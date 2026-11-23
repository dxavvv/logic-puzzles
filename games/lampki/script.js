(function () {
    const board = G.$('boardGrid');
    let R, C, black, num, solLamps, lamps, revealed;

    function newGame() {
        R = C = G.size(7);
        const lv = G.level();
        const pb = { easy: 0.15, medium: 0.2, hard: 0.24 }[lv];
        const pn = { easy: 0.85, medium: 0.6, hard: 0.4 }[lv];
        black = G.grid(R, C, false);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) black[r][c] = Math.random() < pb;
        // rozwiązanie: stawiamy lampki na nieoświetlonych polach, aż wszystko się świeci
        solLamps = G.grid(R, C, false);
        const lit = G.grid(R, C, false);
        const whites = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!black[r][c]) whites.push([r, c]);
        G.shuffle(whites);
        for (const [r, c] of whites) {
            if (lit[r][c]) continue;
            solLamps[r][c] = true;
            lit[r][c] = true;
            for (const [dr, dc] of G.N4) {
                let x = r + dr, y = c + dc;
                while (x >= 0 && y >= 0 && x < R && y < C && !black[x][y]) { lit[x][y] = true; x += dr; y += dc; }
            }
        }
        num = G.grid(R, C, -1);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (!black[r][c] || Math.random() > pn) continue;
            let k = 0;
            for (const [dr, dc] of G.N4) {
                const x = r + dr, y = c + dc;
                if (x >= 0 && y >= 0 && x < R && y < C && solLamps[x][y]) k++;
            }
            num[r][c] = k;
        }
        reset();
    }

    function reset() {
        lamps = G.grid(R, C, false);
        revealed = false;
        render();
        G.status('Oświetl wszystkie białe pola.');
    }

    // oświetlenie i konflikty dla bieżącego ustawienia
    function analyse() {
        const lit = G.grid(R, C, 0), conflict = G.grid(R, C, false);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (!lamps[r][c]) continue;
            lit[r][c]++;
            for (const [dr, dc] of G.N4) {
                let x = r + dr, y = c + dc;
                while (x >= 0 && y >= 0 && x < R && y < C && !black[x][y]) {
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
            if (x >= 0 && y >= 0 && x < R && y < C && lamps[x][y]) k++;
        }
        return k !== num[r][c];
    }

    function render(showErr = false) {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        if (G.editing) {
            // klik: białe → czarne → 0 → 1 → 2 → 3 → 4 → białe
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
                const d = G.tap(black[r][c] ? (num[r][c] >= 0 ? num[r][c] : '') : '', black[r][c] ? 'black' : '', () => {
                    if (!black[r][c]) { black[r][c] = true; num[r][c] = -1; }
                    else if (num[r][c] < 4) num[r][c]++;
                    else { black[r][c] = false; num[r][c] = -1; }
                    render();
                });
                d.style.cursor = 'pointer';
                board.appendChild(d);
            }
            return;
        }
        const { lit, conflict } = analyse();
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
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
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
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
        if (!solLamps) { G.noSolution(); return; }
        lamps = G.copy(solLamps);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 20, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 20, def: C }],
        hint: 'Klikaj pola: białe → czarne → liczby 0–4 (ile lampek ma stać obok) → znów białe.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) {
                R = p.r; C = p.c; solLamps = null;
                black = G.grid(R, C, false); num = G.grid(R, C, -1);
            }
            lamps = G.grid(R, C, false); revealed = false;
            render();
        },
        play() {
            if (!black.some(row => row.some(v => !v))) return 'Potrzebne jest co najmniej jedno białe pole.';
            solLamps = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
