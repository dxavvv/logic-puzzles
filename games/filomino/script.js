(function () {
    const board = G.$('boardGrid');
    let R, C, sol, giv, cur, revealed;

    function partition() {
        const N = R;
        const id = G.grid(R, C, -1);
        let n = 0;
        const cells = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cells.push([r, c]);
        G.shuffle(cells);
        for (const [r, c] of cells) {
            if (id[r][c] !== -1) continue;
            const size = 1 + G.rnd(5);
            const cg = [[r, c]];
            id[r][c] = n;
            while (cg.length < size) {
                const opts = [];
                for (const [a, b] of cg) for (const [dr, dc] of G.N4) {
                    const x = a + dr, y = b + dc;
                    if (x >= 0 && y >= 0 && x < R && y < C && id[x][y] === -1) opts.push([x, y]);
                }
                if (!opts.length) break;
                const [x, y] = G.pick(opts);
                id[x][y] = n; cg.push([x, y]);
            }
            n++;
        }
        // łączymy sąsiednie obszary o tym samym rozmiarze, aż do braku konfliktów
        for (let pass = 0; pass < 200; pass++) {
            const size = {};
            id.forEach(row => row.forEach(v => { size[v] = (size[v] || 0) + 1; }));
            let merged = false;
            outer: for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
                for (const [dr, dc] of [[0, 1], [1, 0]]) {
                    const x = r + dr, y = c + dc;
                    if (x < R && y < C && id[x][y] !== id[r][c] && size[id[x][y]] === size[id[r][c]]) {
                        const from = id[x][y], to = id[r][c];
                        id.forEach(row => row.forEach((v, j) => { if (v === from) row[j] = to; }));
                        merged = true; break outer;
                    }
                }
            }
            if (!merged) break;
        }
        const size = {};
        id.forEach(row => row.forEach(v => { size[v] = (size[v] || 0) + 1; }));
        if (Object.values(size).some(s => s > 9)) return null;
        return id.map(row => row.map(v => size[v]));
    }

    function newGame() {
        R = C = G.size(6);
        do { sol = partition(); } while (!sol);
        const p = { easy: 0.5, medium: 0.36, hard: 0.25 }[G.level()];
        giv = sol.map(row => row.map(v => (Math.random() < p ? v : 0)));
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij brakujące cyfry.');
    }

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) { board.appendChild(G.numCell({ max: 9, value: giv[r][c], onChange: v => { giv[r][c] = v; } })); continue; }
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * C + c) ? ' error-highlight' : '');
            board.appendChild(G.cell({ max: 9, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } }));
        }
    }

    function check() {
        const err = new Set();
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        for (let v = 1; v <= 9; v++) {
            const { comps } = G.components(R, C, (r, c) => cur[r][c] === v);
            for (const comp of comps) {
                const full = comp.length === v;
                const tooBig = comp.length > v;
                // za duży blok jest błędem zawsze; za mały – dopiero gdy nie ma wokół pustych pól
                let open = false;
                if (!full && !tooBig) {
                    for (const [r, c] of comp) for (const [dr, dc] of G.N4) {
                        const x = r + dr, y = c + dc;
                        if (x >= 0 && y >= 0 && x < R && y < C && !cur[x][y]) open = true;
                    }
                }
                if (tooBig || (!full && !open)) comp.forEach(([r, c]) => err.add(r * C + c));
            }
        }
        if (err.size) { render(err); G.status('Są błędy – zaznaczone bloki mają zły rozmiar.', 'error'); }
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
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 14, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 14, def: C }],
        hint: 'Wpisz cyfry początkowe (1–9). Cyfra n musi na końcu tworzyć spójny blok dokładnie n pól; puste pola uzupełni gracz.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; sol = null; giv = G.grid(R, C, 0); }
            cur = G.copy(giv); revealed = false;
            render();
        },
        play() {
            if (!giv.some(row => row.some(v => v))) return 'Wpisz co najmniej jedną cyfrę.';
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
