(function () {
    const board = G.$('boardGrid');
    let R, C, nums, sol, cur, revealed, errCells = new Set(), shown = false;

    // błędy bieżącego zamalowania: powtórki wśród niezamalowanych, styk zamalowanych, rozspójnienie bieli
    function analyse(shade) {
        const dup = new Set(), adj = new Set();
        const groups = [];
        for (let r = 0; r < R; r++) groups.push(Array.from({ length: C }, (_, c) => [r, c]));
        for (let c = 0; c < C; c++) groups.push(Array.from({ length: R }, (_, r) => [r, c]));
        for (const g of groups) {
            const seen = {};
            for (const [r, c] of g) {
                if (shade[r][c] || !nums[r][c]) continue;
                (seen[nums[r][c]] = seen[nums[r][c]] || []).push(r * C + c);
            }
            for (const k in seen) if (seen[k].length > 1) seen[k].forEach(i => dup.add(i));
        }
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (!shade[r][c]) continue;
            if (r + 1 < R && shade[r + 1][c]) { adj.add(r * C + c); adj.add((r + 1) * C + c); }
            if (c + 1 < C && shade[r][c + 1]) { adj.add(r * C + c); adj.add(r * C + c + 1); }
        }
        const { comps } = G.components(R, C, (r, c) => !shade[r][c]);
        const split = new Set();
        if (comps.length > 1) {
            comps.sort((a, b) => b.length - a.length);
            comps.slice(1).forEach(comp => comp.forEach(([r, c]) => split.add(r * C + c)));
        }
        return { dup, adj, split };
    }

    function newGame() {
        R = C = G.size(6);
        const L = G.latin(R);
        const dens = { easy: 0.2, medium: 0.26, hard: 0.3 }[G.level()];
        const want = Math.round(R * C * dens);
        const shade = G.grid(R, C, 0);
        const cells = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cells.push([r, c]);
        G.shuffle(cells);
        let count = 0;
        for (const [r, c] of cells) {
            if (count >= want) break;
            if (G.N4.some(([dr, dc]) => shade[r + dr] && shade[r + dr][c + dc])) continue;
            shade[r][c] = 1;
            if (G.components(R, C, (x, y) => !shade[x][y]).comps.length === 1) count++; else shade[r][c] = 0;
        }
        nums = G.copy(L);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (!shade[r][c]) continue;
            // zamalowane pole dostaje liczbę powtarzającą jakąś niezamalowaną w jego wierszu lub kolumnie
            const pool = [];
            for (let i = 0; i < C; i++) if (!shade[r][i]) pool.push(L[r][i]);
            for (let i = 0; i < R; i++) if (!shade[i][c]) pool.push(L[i][c]);
            nums[r][c] = G.pick(pool);
        }
        sol = shade;
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Zamaluj powtarzające się liczby tak, aby w żadnym wierszu i kolumnie nie zostały dwie takie same.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) { board.appendChild(G.numCell({ max: 9, value: nums[r][c], onChange: v => { nums[r][c] = v; } })); continue; }
            const bad = errCells.has(r * C + c) ? ' error-highlight' : '';
            const d = G.tap(nums[r][c], (cur[r][c] ? 'black' : '') + (revealed && cur[r][c] ? ' revealed' : '') + bad,
                () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
            d.style.cursor = 'pointer';
            if (cur[r][c]) { d.style.background = revealed ? '#14281c' : '#05050c'; d.style.color = '#4a4a66'; }
            board.appendChild(d);
        }
    }

    function check() {
        const a = analyse(cur);
        errCells = new Set([...a.dup, ...a.adj, ...a.split]);
        render();
        if (a.dup.size) G.status('Niezamalowane liczby powtarzają się w wierszu lub kolumnie.', 'error');
        else if (a.adj.size) G.status('Zamalowane pola nie mogą stykać się bokami.', 'error');
        else if (a.split.size) G.status('Niezamalowane pola muszą tworzyć jedną całość.', 'error');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 3, max: 9, def: R }, { id: 'c', label: 'Kolumny', min: 3, max: 9, def: C }],
        hint: 'Wpisz w polach liczby 1–9. Gracz zamaluje powtarzające się liczby tak, aby w każdym wierszu i kolumnie zostały unikalne.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; sol = null; nums = G.grid(R, C, 0); }
            cur = G.grid(R, C, 0); revealed = false; errCells = new Set();
            render();
        },
        play() {
            if (nums.some(row => row.some(v => !v))) return 'Wypełnij wszystkie pola liczbami 1–9.';
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
