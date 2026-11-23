(function () {
    const board = G.$('boardGrid');
    let N, sol, cages, cageOf, giv, cur, revealed;

    function makeCages() {
        const id = G.grid(N, N, -1), list = [];
        const cells = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) cells.push([r, c]);
        G.shuffle(cells);
        for (const [r, c] of cells) {
            if (id[r][c] !== -1) continue;
            const roll = Math.random();
            const size = roll < 0.12 ? 1 : roll < 0.55 ? 2 : roll < 0.87 ? 3 : 4;
            const cg = [[r, c]];
            id[r][c] = list.length;
            while (cg.length < size) {
                const opts = [];
                for (const [a, b] of cg) for (const [dr, dc] of G.N4) {
                    const x = a + dr, y = b + dc;
                    if (x >= 0 && y >= 0 && x < N && y < N && id[x][y] === -1) opts.push([x, y]);
                }
                if (!opts.length) break;
                const [x, y] = G.pick(opts);
                id[x][y] = list.length; cg.push([x, y]);
            }
            cg.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
            list.push({ cells: cg });
        }
        return { id, list };
    }

    function assignOps() {
        for (const cg of cages) {
            const v = cg.cells.map(([r, c]) => sol[r][c]);
            if (v.length === 1) { cg.op = '='; cg.val = v[0]; continue; }
            const ops = ['+', '×'];
            if (v.length === 2) {
                ops.push('−');
                if (Math.max(...v) % Math.min(...v) === 0) ops.push(':', ':');
            }
            cg.op = G.pick(ops);
            cg.val = cg.op === '+' ? v.reduce((a, b) => a + b, 0)
                : cg.op === '×' ? v.reduce((a, b) => a * b, 1)
                : cg.op === '−' ? Math.abs(v[0] - v[1]) : Math.max(...v) / Math.min(...v);
        }
    }

    function cageOk(cg, grid) {
        const v = cg.cells.map(([r, c]) => grid[r][c]);
        if (v.includes(0)) return null;
        switch (cg.op) {
            case '=': return v[0] === cg.val;
            case '+': return v.reduce((a, b) => a + b, 0) === cg.val;
            case '×': return v.reduce((a, b) => a * b, 1) === cg.val;
            case '−': return Math.abs(v[0] - v[1]) === cg.val;
            default: return Math.max(...v) / Math.min(...v) === cg.val;
        }
    }

    function newGame() {
        N = G.size(5);
        sol = G.latin(N);
        const m = makeCages();
        cages = m.list; cageOf = m.id;
        assignOps();
        const gp = { easy: 0.2, medium: 0.08, hard: 0 }[G.level()];
        giv = G.grid(N, N, 0);
        for (const cg of cages) if (cg.op === '=') { const [r, c] = cg.cells[0]; giv[r][c] = sol[r][c]; }
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (Math.random() < gp) giv[r][c] = sol[r][c];
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij planszę.');
    }

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            const d = G.cell({ max: N, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } });
            const id = cageOf[r][c];
            const same = (x, y) => x >= 0 && y >= 0 && x < N && y < N && cageOf[x][y] === id;
            const b = '3px solid #8aa0d8', t = '1px solid transparent';
            d.style.borderTop = same(r - 1, c) ? t : b;
            d.style.borderBottom = same(r + 1, c) ? t : b;
            d.style.borderLeft = same(r, c - 1) ? t : b;
            d.style.borderRight = same(r, c + 1) ? t : b;
            d.style.position = 'relative';
            const cg = cages[id];
            if (cg.cells[0][0] === r && cg.cells[0][1] === c && cg.op !== '=') {
                const l = document.createElement('span');
                l.textContent = cg.val + cg.op;
                l.style.cssText = 'position:absolute;top:1px;left:3px;font-size:.62rem;color:#f0c060;pointer-events:none;font-weight:700';
                d.appendChild(l);
            }
            board.appendChild(d);
        }
    }

    function check() {
        const err = G.latinErrors(cur, N, N);
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        for (const cg of cages) if (cageOk(cg, cur) === false) cg.cells.forEach(([r, c]) => err.add(r * N + c));
        if (err.size) { render(err); G.status('Są błędy – zaznaczone pola łamią zasady.', 'error'); }
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
