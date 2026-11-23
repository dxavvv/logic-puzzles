(function () {
    const board = G.$('boardGrid');
    let N, sol, cl, giv, cur, revealed;

    const vis = a => { let m = 0, c = 0; for (const v of a) if (v > m) { m = v; c++; } return c; };

    function newGame() {
        N = G.size(6);
        sol = G.latin(N);
        const lv = G.level();
        const hide = { easy: 0.1, medium: 0.3, hard: 0.5 }[lv];
        const gp = { easy: 0.3, medium: 0.1, hard: 0 }[lv];
        cl = { t: [], b: [], l: [], r: [] };
        for (let i = 0; i < N; i++) {
            const col = sol.map(r => r[i]), row = sol[i];
            const h = () => Math.random() < hide;
            cl.t[i] = h() ? 0 : vis(col);
            cl.b[i] = h() ? 0 : vis([...col].reverse());
            cl.l[i] = h() ? 0 : vis(row);
            cl.r[i] = h() ? 0 : vis([...row].reverse());
        }
        giv = sol.map(r => r.map(v => (Math.random() < gp ? v : 0)));
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij planszę.');
    }

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N + 2}, 1fr)`;
        board.innerHTML = '';
        for (let r = -1; r <= N; r++) {
            for (let c = -1; c <= N; c++) {
                const inR = r >= 0 && r < N, inC = c >= 0 && c < N;
                if (!inR || !inC) {
                    let arr = null, i = 0;
                    if (r < 0 && inC) { arr = cl.t; i = c; }
                    else if (r >= N && inC) { arr = cl.b; i = c; }
                    else if (c < 0 && inR) { arr = cl.l; i = r; }
                    else if (c >= N && inR) { arr = cl.r; i = r; }
                    if (G.editing && arr) { board.appendChild(G.numCell({ max: N, value: arr[i], onChange: v => { arr[i] = v; } })); continue; }
                    const d = document.createElement('div');
                    d.className = 'clue';
                    d.textContent = (arr && arr[i]) || '';
                    board.appendChild(d);
                    continue;
                }
                if (G.editing) {
                    board.appendChild(G.numCell({ max: N, value: giv[r][c], onChange: v => { giv[r][c] = v; } }));
                    continue;
                }
                const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
                board.appendChild(G.cell({
                    max: N, given: giv[r][c], value: cur[r][c], cls,
                    onChange: v => { cur[r][c] = v; }
                }));
            }
        }
    }

    function check() {
        const err = G.latinErrors(cur, N, N);
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        const mark = (cells, want, line) => {
            if (!want || line.some(v => !v)) return;
            if (vis(line) !== want) cells.forEach(i => err.add(i));
        };
        for (let i = 0; i < N; i++) {
            const col = cur.map(r => r[i]), row = cur[i];
            const colIdx = col.map((_, r) => r * N + i), rowIdx = row.map((_, c) => i * N + c);
            mark(colIdx, cl.t[i], col);
            mark(colIdx, cl.b[i], [...col].reverse());
            mark(rowIdx, cl.l[i], row);
            mark(rowIdx, cl.r[i], [...row].reverse());
        }
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

    const edit = {
        params: () => [{ id: 'n', label: 'Rozmiar n×n', min: 3, max: 9, def: N }],
        hint: 'Wpisz liczby widocznych piramid przy brzegach (puste = brak wskazówki) oraz, jeśli chcesz, cyfry początkowe w polach.',
        begin(p, keep) {
            if (!(keep && p.n === N)) {
                N = p.n; sol = null;
                cl = { t: Array(N).fill(0), b: Array(N).fill(0), l: Array(N).fill(0), r: Array(N).fill(0) };
                giv = G.grid(N, N, 0);
            }
            cur = G.copy(giv); revealed = false;
            render();
        },
        play() {
            if (G.latinErrors(giv, N, N).size) return 'Cyfry początkowe powtarzają się w wierszu lub kolumnie.';
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
