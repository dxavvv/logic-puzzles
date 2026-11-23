(function () {
    const board = G.$('boardGrid');
    let R, C, sol, cur, rowK, colK, revealed, bad = new Set();

    const blocks = line => {
        const out = []; let run = 0;
        for (const v of line) { if (v) run++; else if (run) { out.push(run); run = 0; } }
        if (run) out.push(run);
        return out.length ? out : [0];
    };
    const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

    function newGame() {
        R = C = G.size(8);
        const d = { easy: 0.62, medium: 0.55, hard: 0.5 }[G.level()];
        sol = G.grid(R, C, 0);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) sol[r][c] = Math.random() < d ? 1 : 0;
        rowK = sol.map(blocks);
        colK = Array.from({ length: C }, (_, c) => blocks(sol.map(row => row[c])));
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; bad = new Set();
        render();
        G.status('Zamaluj pola według liczb.');
    }

    // „3 1 2” → [3, 1, 2]; puste → [0]
    const parse = t => {
        const v = t.split(/[^0-9]+/).filter(Boolean).map(Number).filter(x => x > 0);
        return v.length ? v : [0];
    };
    const fits = (k, len) => k.reduce((a, b) => a + b, 0) + k.length - 1 <= len;

    function render() {
        board.style.gridTemplateColumns = `max-content repeat(${C}, 1fr)`;
        board.innerHTML = '';
        const corner = document.createElement('div');
        board.appendChild(corner);
        for (let c = 0; c < C; c++) {
            if (G.editing) {
                board.appendChild(G.textCell({ value: colK[c][0] ? colK[c].join(' ') : '', maxLen: 12, onChange: t => { colK[c] = parse(t); } }));
                continue;
            }
            const d = document.createElement('div');
            d.className = 'clue';
            d.style.cssText = 'aspect-ratio:auto;flex-direction:column;justify-content:flex-end;font-size:.78rem;line-height:1.15;padding-bottom:2px;' + (bad.has('c' + c) ? 'color:#f87171' : '');
            d.innerHTML = colK[c].join('<br>');
            board.appendChild(d);
        }
        for (let r = 0; r < R; r++) {
            if (G.editing) {
                board.appendChild(G.textCell({ value: rowK[r][0] ? rowK[r].join(' ') : '', maxLen: 12, onChange: t => { rowK[r] = parse(t); } }));
            } else {
                const d = document.createElement('div');
                d.className = 'clue';
                d.style.cssText = 'aspect-ratio:auto;font-size:.78rem;padding:0 6px;white-space:nowrap;justify-content:flex-end;' + (bad.has('r' + r) ? 'color:#f87171' : '');
                d.textContent = rowK[r].join(' ');
                board.appendChild(d);
            }
            for (let c = 0; c < C; c++) {
                if (G.editing) { const e = document.createElement('div'); e.className = 'cell'; board.appendChild(e); continue; }
                const cell = G.tap('', cur[r][c] ? 'marked' : '', () => { cur[r][c] ^= 1; revealed = false; bad = new Set(); render(); });
                if (cur[r][c]) { cell.style.background = revealed ? '#2e6b47' : '#3b5f94'; }
                board.appendChild(cell);
            }
        }
    }

    function check() {
        bad = new Set();
        for (let r = 0; r < R; r++) if (!same(blocks(cur[r]), rowK[r])) bad.add('r' + r);
        for (let c = 0; c < C; c++) if (!same(blocks(cur.map(row => row[c])), colK[c])) bad.add('c' + c);
        render();
        if (bad.size) {
            const filled = cur.some(r => r.some(v => v));
            G.status(filled ? `Liczby w ${bad.size} wierszach/kolumnach (czerwone) nie pasują.` : 'Zamaluj pola według liczb.', filled ? 'info' : 'neutral');
        } else G.status('🎉 Brawo! Obrazek odkryty.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol); revealed = true; bad = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 25, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 25, def: C }],
        hint: 'Wpisz długości kolejnych bloków oddzielone spacją (np. „3 1 2”) przy każdym wierszu (po lewej) i kolumnie (u góry). Puste = pusty wiersz/kolumna.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) {
                R = p.r; C = p.c; sol = null;
                rowK = Array.from({ length: R }, () => [0]); colK = Array.from({ length: C }, () => [0]);
            }
            cur = G.grid(R, C, 0); revealed = false; bad = new Set();
            render();
        },
        play() {
            if (rowK.some(k => !fits(k, C))) return 'Któryś wiersz ma bloki, które nie mieszczą się w jego długości.';
            if (colK.some(k => !fits(k, R))) return 'Któraś kolumna ma bloki, które nie mieszczą się w jej długości.';
            const sr = rowK.reduce((a, k) => a + k.reduce((x, y) => x + y, 0), 0);
            const sc = colK.reduce((a, k) => a + k.reduce((x, y) => x + y, 0), 0);
            if (sr !== sc) return `Suma pól w wierszach (${sr}) musi równać się sumie w kolumnach (${sc}).`;
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
