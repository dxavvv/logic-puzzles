(function () {
    const N = 9;
    const board = G.$('boardGrid');
    let sol, giv, cur, lines, lineOf, revealed;

    const boxOf = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

    function makeLines() {
        const used = G.grid(N, N, -1);
        const out = [];
        const want = { easy: 14, medium: 11, hard: 8 }[G.level()];
        for (let t = 0; t < 400 && out.length < want; t++) {
            const len = 3 + G.rnd(3);
            const r0 = G.rnd(N), c0 = G.rnd(N);
            if (used[r0][c0] >= 0) continue;
            const path = [[r0, c0]];
            let guard = 0;
            while (path.length < len && guard++ < 20) {
                const [r, c] = path[path.length - 1];
                const [dr, dc] = G.pick(G.N4);
                const x = r + dr, y = c + dc;
                if (x < 0 || y < 0 || x >= N || y >= N || used[x][y] >= 0 || path.some(([a, b]) => a === x && b === y)) continue;
                path.push([x, y]);
            }
            if (path.length < 3) continue;
            const vals = path.map(([r, c]) => sol[r][c]);
            if (new Set(vals).size !== vals.length || Math.max(...vals) - Math.min(...vals) !== vals.length - 1) continue;
            path.forEach(([r, c]) => { used[r][c] = out.length; });
            out.push(path);
        }
        return { out, used };
    }

    function newGame() {
        const reg = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => boxOf(r, c)));
        sol = G.regionFill(N, reg);
        const m = makeLines();
        lines = m.out; lineOf = m.used;
        const p = { easy: 0.42, medium: 0.32, hard: 0.24 }[G.level()];
        giv = sol.map(row => row.map(v => (Math.random() < p ? v : 0)));
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij planszę.');
    }

    const HUES = [200, 40, 130, 300, 10, 170, 260, 80];

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            const d = G.cell({ max: N, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } });
            const li = lineOf[r][c];
            if (li >= 0 && !err.has(r * N + c) && !revealed) {
                d.style.background = `hsl(${HUES[li % HUES.length]} 45% 22%)`;
                d.style.borderColor = `hsl(${HUES[li % HUES.length]} 55% 45%)`;
            }
            // pogrubione granice bloków 3×3
            if (r % 3 === 0 && r > 0) d.style.marginTop = '2px';
            if (c % 3 === 0 && c > 0) d.style.marginLeft = '2px';
            board.appendChild(d);
        }
    }

    function check() {
        const err = G.latinErrors(cur, N, N);
        const byBox = {};
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const v = cur[r][c];
            if (!v) continue;
            const k = boxOf(r, c) + ':' + v;
            (byBox[k] = byBox[k] || []).push(r * N + c);
        }
        for (const k in byBox) if (byBox[k].length > 1) byBox[k].forEach(i => err.add(i));
        for (const path of lines) {
            const vals = path.map(([r, c]) => cur[r][c]);
            const filled = vals.filter(Boolean);
            const bad = new Set(filled).size !== filled.length ||
                (filled.length === vals.length && Math.max(...vals) - Math.min(...vals) !== vals.length - 1);
            if (bad) path.forEach(([r, c]) => err.add(r * N + c));
        }
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
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
