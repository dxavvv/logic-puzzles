(function () {
    const board = G.$('boardGrid');
    let N, sol, giv, cur, revealed;

    function partition() {
        const id = G.grid(N, N, -1);
        let n = 0;
        const cells = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) cells.push([r, c]);
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
                    if (x >= 0 && y >= 0 && x < N && y < N && id[x][y] === -1) opts.push([x, y]);
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
            outer: for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
                for (const [dr, dc] of [[0, 1], [1, 0]]) {
                    const x = r + dr, y = c + dc;
                    if (x < N && y < N && id[x][y] !== id[r][c] && size[id[x][y]] === size[id[r][c]]) {
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
        N = G.size(6);
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
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            board.appendChild(G.cell({ max: 9, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } }));
        }
    }

    function check() {
        const err = new Set();
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        for (let v = 1; v <= 9; v++) {
            const { comps } = G.components(N, N, (r, c) => cur[r][c] === v);
            for (const comp of comps) {
                const full = comp.length === v;
                const tooBig = comp.length > v;
                // za duży blok jest błędem zawsze; za mały – dopiero gdy nie ma wokół pustych pól
                let open = false;
                if (!full && !tooBig) {
                    for (const [r, c] of comp) for (const [dr, dc] of G.N4) {
                        const x = r + dr, y = c + dc;
                        if (x >= 0 && y >= 0 && x < N && y < N && !cur[x][y]) open = true;
                    }
                }
                if (tooBig || (!full && !open)) comp.forEach(([r, c]) => err.add(r * N + c));
            }
        }
        if (err.size) { render(err); G.status('Są błędy – zaznaczone bloki mają zły rozmiar.', 'error'); }
        else if (empty) G.status(`Na razie bez błędów. Puste pola: ${empty}.`, 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
