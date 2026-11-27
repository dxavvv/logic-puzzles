(function () {
    const board = G.$('boardGrid');
    const SYM = ['', '🔵', '🟠'];
    let R, C, sol, giv, cur, revealed;

    // indeksy (r*C+c) pól łamiących zasady: trójki, nadmiar jednego koloru, identyczne pełne linie
    function errors(g) {
        const err = new Set();
        const lines = [];
        for (let r = 0; r < R; r++) lines.push({ kind: 'r', cells: Array.from({ length: C }, (_, c) => [r, c]), half: C / 2 });
        for (let c = 0; c < C; c++) lines.push({ kind: 'c', cells: Array.from({ length: R }, (_, r) => [r, c]), half: R / 2 });
        for (const ln of lines) {
            const v = ln.cells.map(([r, c]) => g[r][c]);
            for (let i = 0; i + 2 < v.length; i++)
                if (v[i] && v[i] === v[i + 1] && v[i] === v[i + 2]) [0, 1, 2].forEach(k => err.add(ln.cells[i + k][0] * C + ln.cells[i + k][1]));
            for (const col of [1, 2])
                if (v.filter(x => x === col).length > ln.half)
                    v.forEach((x, i) => { if (x === col) err.add(ln.cells[i][0] * C + ln.cells[i][1]); });
        }
        const full = ln => ln.cells.every(([r, c]) => g[r][c]);
        for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
            const a = lines[i], b = lines[j];
            if (a.kind !== b.kind || !full(a) || !full(b)) continue;
            if (a.cells.every(([r, c], k) => g[r][c] === g[b.cells[k][0]][b.cells[k][1]]))
                [a, b].forEach(ln => ln.cells.forEach(([r, c]) => err.add(r * C + c)));
        }
        return err;
    }

    function fullGrid() {
        for (;;) {
            const g = G.grid(R, C, 0);
            const rc = Array.from({ length: R }, () => [0, 0, 0]), cc = Array.from({ length: C }, () => [0, 0, 0]);
            let steps = 0;
            const go = i => {
                if (i === R * C) {
                    for (let a = 0; a < C; a++) for (let b = a + 1; b < C; b++)
                        if (g.every(row => row[a] === row[b])) return false;
                    return true;
                }
                if (++steps > 200000) return false;
                const r = Math.floor(i / C), c = i % C;
                for (const v of G.shuffle([1, 2])) {
                    if (rc[r][v] >= C / 2 || cc[c][v] >= R / 2) continue;
                    if (c >= 2 && g[r][c - 1] === v && g[r][c - 2] === v) continue;
                    if (r >= 2 && g[r - 1][c] === v && g[r - 2][c] === v) continue;
                    g[r][c] = v; rc[r][v]++; cc[c][v]++;
                    let ok = true;
                    if (c === C - 1) for (let k = 0; k < r; k++) if (g[k].every((x, j) => x === g[r][j])) { ok = false; break; }
                    if (ok && go(i + 1)) return true;
                    g[r][c] = 0; rc[r][v]--; cc[c][v]--;
                }
                return false;
            };
            if (go(0)) return g;
        }
    }

    function newGame() {
        R = C = G.size(8);
        sol = fullGrid();
        const keep = { easy: 0.5, medium: 0.4, hard: 0.32 }[G.level()];
        giv = sol.map(row => row.map(v => (Math.random() < keep ? v : 0)));
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Wypełnij planszę kółkami.');
    }

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) {
                const d = G.tap(SYM[giv[r][c]], giv[r][c] ? 'given' : '', () => { giv[r][c] = (giv[r][c] + 1) % 3; render(); });
                d.style.cursor = 'pointer';
                board.appendChild(d);
                continue;
            }
            const bad = err.has(r * C + c) ? ' error-highlight' : '';
            if (giv[r][c]) {
                const d = document.createElement('div');
                d.className = 'cell given' + bad;
                d.textContent = SYM[giv[r][c]];
                board.appendChild(d);
            } else {
                board.appendChild(G.tap(SYM[cur[r][c]], (cur[r][c] ? 'marked' : '') + (revealed && cur[r][c] ? ' revealed' : '') + bad,
                    () => { cur[r][c] = (cur[r][c] + 1) % 3; revealed = false; render(); }));
            }
        }
    }

    function check() {
        const err = errors(cur);
        let empty = 0;
        cur.forEach(row => row.forEach(v => { if (!v) empty++; }));
        if (err.size) { render(err); G.status('Są błędy – zaznaczone pola łamią zasady.', 'error'); }
        else if (empty) G.status(`Na razie bez błędów. Puste pola: ${empty}.`, 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const even = n => n + (n % 2);
    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze (parzysta liczba)', min: 4, max: 14, def: R }, { id: 'c', label: 'Kolumny (parzysta liczba)', min: 4, max: 14, def: C }],
        hint: 'Klikaj pola, aby ustawić kółka startowe: niebieskie, pomarańczowe, puste. Liczba wierszy i kolumn musi być parzysta.',
        begin(p, keep) {
            const r = even(p.r), c = even(p.c);
            const ir = G.$('ep_r'), ic = G.$('ep_c');
            if (ir) ir.value = r;
            if (ic) ic.value = c;
            if (!(keep && r === R && c === C)) { R = r; C = c; sol = null; giv = G.grid(R, C, 0); }
            cur = G.copy(giv); revealed = false;
            render();
        },
        play() {
            if (errors(giv).size) return 'Kółka startowe łamią zasady (trzy takie same obok siebie, za dużo jednego koloru lub identyczne linie).';
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
