(function () {
    const board = G.$('boardGrid');
    let R, C, clue, sol, cur, revealed, errCells = new Set();

    // błędy: zalane 2×2, rozspójnienie wody, wyspy bez liczby / z kilkoma / o złym rozmiarze
    function analyse(water) {
        const pool = new Set(), split = new Set(), isle = new Set();
        for (let r = 0; r + 1 < R; r++) for (let c = 0; c + 1 < C; c++) {
            if (water[r][c] && water[r + 1][c] && water[r][c + 1] && water[r + 1][c + 1]) {
                [[r, c], [r + 1, c], [r, c + 1], [r + 1, c + 1]].forEach(([a, b]) => pool.add(a * C + b));
            }
        }
        const sea = G.components(R, C, (r, c) => water[r][c]);
        if (sea.comps.length > 1) {
            sea.comps.sort((a, b) => b.length - a.length);
            sea.comps.slice(1).forEach(k => k.forEach(([r, c]) => split.add(r * C + c)));
        }
        const land = G.components(R, C, (r, c) => !water[r][c]);
        for (const comp of land.comps) {
            const nums = comp.filter(([r, c]) => clue[r][c] > 0);
            const bad = nums.length !== 1 || clue[nums[0][0]][nums[0][1]] !== comp.length;
            if (bad) comp.forEach(([r, c]) => isle.add(r * C + c));
        }
        return { pool, split, isle };
    }

    // losowa plansza: wyspy rosną z ziaren i nie stykają się, morze jest spójne i bez kwadratów 2×2
    function generate() {
        const dens = { easy: 0.32, medium: 0.35, hard: 0.38 }[G.level()];
        for (let attempt = 0; attempt < 2500; attempt++) {
            const id = G.grid(R, C, -1); // numer wyspy lub -1
            const sizes = [];
            const free = (r, c, k) => r >= 0 && c >= 0 && r < R && c < C && id[r][c] === -1 &&
                G.N4.every(([dr, dc]) => { const x = r + dr, y = c + dc; return !(x >= 0 && y >= 0 && x < R && y < C) || id[x][y] === -1 || id[x][y] === k; });
            const seaOk = () => G.components(R, C, (r, c) => id[r][c] === -1).comps.length === 1;
            const cells = [];
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cells.push([r, c]);
            G.shuffle(cells);
            const land = Math.round(R * C * dens);
            let used = 0;
            for (const [r, c] of cells) {
                if (used >= land) break;
                if (!free(r, c, sizes.length)) continue;
                const k = sizes.length;
                id[r][c] = k;
                if (!seaOk()) { id[r][c] = -1; continue; } sizes.push(1); used++;
                const target = 1 + G.rnd(Math.max(2, Math.min(7, Math.round(R / 1.4))));
                const list = [[r, c]], banned = new Set();
                while (sizes[k] < target && used < land) {
                    const opts = [];
                    for (const [a, b] of list) for (const [dr, dc] of G.N4) if (free(a + dr, b + dc, k) && !banned.has((a + dr) * C + b + dc)) opts.push([a + dr, b + dc]);
                    if (!opts.length) break;
                    const [x, y] = G.pick(opts);
                    id[x][y] = k;
                    if (!seaOk()) { id[x][y] = -1; banned.add(x * C + y); continue; }
                    list.push([x, y]); sizes[k]++; used++;
                }
            }
            // usuń kwadraty wody 2×2 dokładając ląd
            let ok = true;
            for (let pass = 0; pass < 200 && ok; pass++) {
                let found = null;
                for (let r = 0; r + 1 < R && !found; r++) for (let c = 0; c + 1 < C && !found; c++) {
                    const q = [[r, c], [r + 1, c], [r, c + 1], [r + 1, c + 1]];
                    if (q.every(([a, b]) => id[a][b] === -1)) found = q;
                }
                if (!found) break;
                G.shuffle(found);
                let fixed = false;
                for (const [a, b] of found) {
                    const near = new Set();
                    for (const [dr, dc] of G.N4) { const x = a + dr, y = b + dc; if (x >= 0 && y >= 0 && x < R && y < C && id[x][y] !== -1) near.add(id[x][y]); }
                    if (near.size <= 1) {
                        const k = near.size ? [...near][0] : sizes.length;
                        id[a][b] = k;
                        if (!seaOk()) { id[a][b] = -1; continue; }
                        if (!near.size) sizes.push(1); else sizes[k]++;
                        fixed = true; break;
                    }
                }
                if (!fixed) ok = false;
            }
            if (!ok) continue;
            const water = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => (id[r][c] === -1 ? 1 : 0)));
            if (!sizes.length || G.components(R, C, (r, c) => water[r][c]).comps.length !== 1) continue;
            // numer w losowym polu każdej wyspy
            const cl = G.grid(R, C, 0);
            sizes.forEach((sz, k) => {
                const mine = [];
                for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (id[r][c] === k) mine.push([r, c]);
                const [r, c] = G.pick(mine);
                cl[r][c] = sz;
            });
            clue = cl; sol = water;
            return true;
        }
        return false;
    }

    function newGame() {
        R = C = G.size(7);
        if (!generate()) { clue = G.grid(R, C, 0); sol = G.grid(R, C, 1); clue[0][0] = 0; }
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Zamaluj morze tak, aby każda wyspa miała dokładnie jedną liczbę i tyle pól, ile ona wskazuje.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) { board.appendChild(G.numCell({ max: 30, min: 1, empty: 0, value: clue[r][c], onChange: v => { clue[r][c] = v > 0 ? v : 0; } })); continue; }
            const bad = errCells.has(r * C + c) ? ' error-highlight' : '';
            const has = clue[r][c] > 0;
            const d = G.tap(has ? clue[r][c] : '', (cur[r][c] ? 'black' : '') + (revealed && cur[r][c] ? ' revealed' : '') + bad,
                () => { if (has) return; cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
            if (!has) d.style.cursor = 'pointer';
            if (cur[r][c]) { d.style.background = revealed ? '#1c3a5e' : '#2b6cb0'; }
            else if (has) d.style.fontWeight = '700';
            board.appendChild(d);
        }
    }

    function check() {
        const a = analyse(cur);
        errCells = new Set([...a.pool, ...a.split, ...a.isle]);
        render();
        if (a.isle.size) G.status('Każda wyspa musi mieć dokładnie jedną liczbę i tyle pól, ile ona wskazuje.', 'error');
        else if (a.pool.size) G.status('Morze nie może zawierać kwadratu 2×2.', 'error');
        else if (a.split.size) G.status('Całe morze musi tworzyć jedną całość.', 'error');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 3, max: 12, def: R }, { id: 'c', label: 'Kolumny', min: 3, max: 12, def: C }],
        hint: 'Wpisz liczby w polach, które mają być wyspami (puste pola to wolne miejsce). Gracz zamaluje morze.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; sol = null; clue = G.grid(R, C, 0); }
            cur = G.grid(R, C, 0); revealed = false; errCells = new Set();
            render();
        },
        play() {
            if (!clue.some(row => row.some(v => v > 0))) return 'Wpisz przynajmniej jedną liczbę.';
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
