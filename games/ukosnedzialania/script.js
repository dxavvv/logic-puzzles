(function () {
    const board = G.$('boardGrid');
    const wrap = G.$('boardGrid');
    let N, sol, giv, cur, circles, revealed;

    // czy dla czterech pól (a b / c d) działanie działa na obu przekątnych (a,d) i (b,c)
    function ops(a, b, c, d) {
        const res = [];
        if (a + d === b + c) res.push(['+', a + d]);
        if (a !== d && b !== c && Math.abs(a - d) === Math.abs(b - c)) res.push(['−', Math.abs(a - d)]);
        if (a * d === b * c) res.push(['×', a * d]);
        const q = (x, y) => (Math.max(x, y) % Math.min(x, y) === 0 ? Math.max(x, y) / Math.min(x, y) : 0);
        if (a !== d && b !== c && q(a, d) && q(a, d) === q(b, c)) res.push([':', q(a, d)]);
        if ([a, b, c, d].every(v => v % 2 === 0)) res.push(['P', 0]);
        if ([a, b, c, d].every(v => v % 2 === 1)) res.push(['N', 0]);
        return res;
    }

    function holds(cc, g) {
        const { r, c, op, val } = cc;
        const a = g[r][c], b = g[r][c + 1], cl = g[r + 1][c], d = g[r + 1][c + 1];
        if (!a || !b || !cl || !d) return null;
        return ops(a, b, cl, d).some(([o, v]) => o === op && v === val);
    }

    function validJunctions(g) {
        const out = [];
        for (let r = 0; r < N - 1; r++) for (let c = 0; c < N - 1; c++) {
            const list = ops(g[r][c], g[r][c + 1], g[r + 1][c], g[r + 1][c + 1]);
            if (list.length) out.push({ r, c, list });
        }
        return out;
    }

    function newGame() {
        N = G.size(5);
        // wybieramy kwadrat łaciński, który daje najwięcej sensownych kółek
        let best = null;
        for (let t = 0; t < 300; t++) {
            const g = G.latin(N);
            const v = validJunctions(g);
            if (!best || v.length > best.v.length) best = { g, v };
        }
        sol = best.g;
        const keep = { easy: 1, medium: 0.8, hard: 0.6 }[G.level()];
        circles = [];
        for (const j of best.v) {
            if (Math.random() > keep) continue;
            const [op, val] = G.pick(j.list);
            circles.push({ r: j.r, c: j.c, op, val });
        }
        const gp = { easy: 0.2, medium: 0.08, hard: 0 }[G.level()];
        giv = sol.map(row => row.map(v => (Math.random() < gp ? v : 0)));
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij planszę.');
    }

    // --- edytor ---
    let mode = 'digits', cOp = '+', cVal = 0;

    function render(err = new Set(), badCircles = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.style.position = 'relative';
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (G.editing) {
                if (mode === 'digits') board.appendChild(G.numCell({ max: N, value: giv[r][c], onChange: v => { giv[r][c] = v; } }));
                else { const e = document.createElement('div'); e.className = 'cell'; board.appendChild(e); }
                continue;
            }
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            board.appendChild(G.cell({ max: N, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } }));
        }
        if (G.editing && mode === 'circles') {
            // klikalne punkty na każdym skrzyżowaniu czterech pól
            for (let r = 0; r < N - 1; r++) for (let c = 0; c < N - 1; c++) {
                if (circles.some(cc => cc.r === r && cc.c === c)) continue;
                const d = document.createElement('div');
                d.textContent = '+';
                const pc = 100 / N;
                d.style.cssText = `position:absolute;left:${(c + 1) * pc}%;top:${(r + 1) * pc}%;transform:translate(-50%,-50%);width:24px;height:24px;` +
                    'border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#7a7a9a;border:1px dashed #555;cursor:pointer;z-index:2;background:#12121e';
                d.addEventListener('click', () => {
                    if ((cOp !== 'P' && cOp !== 'N') && !cVal) { G.status('Najpierw wpisz wynik działania (pole „Wynik”).', 'error'); return; }
                    circles.push({ r, c, op: cOp, val: cOp === 'P' || cOp === 'N' ? 0 : cVal });
                    render();
                });
                board.appendChild(d);
            }
        }
        circles.forEach((cc, i) => {
            const d = document.createElement('div');
            const lab = cc.op === 'P' || cc.op === 'N' ? cc.op : cc.val + cc.op;
            d.textContent = lab;
            const pc = 100 / N;
            d.style.cssText = `position:absolute;left:calc(${(cc.c + 1) * pc}% + 0px);top:calc(${(cc.r + 1) * pc}% + 0px);` +
                'transform:translate(-50%,-50%);min-width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
                `font-size:.72rem;font-weight:700;pointer-events:${G.editing && mode === 'circles' ? 'auto' : 'none'};cursor:pointer;z-index:2;border:2px solid ${badCircles.has(i) ? '#f87171' : '#f0c060'};` +
                `background:${badCircles.has(i) ? '#3a1a1a' : '#241e10'};color:#f0c060`;
            if (G.editing && mode === 'circles') d.addEventListener('click', () => { circles.splice(i, 1); render(); });
            board.appendChild(d);
        });
    }

    function check() {
        const err = G.latinErrors(cur, N, N);
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        const bad = new Set();
        circles.forEach((cc, i) => { if (holds(cc, cur) === false) bad.add(i); });
        if (err.size || bad.size) { render(err, bad); G.status('Są błędy – zaznaczone pola lub kółka łamią zasady.', 'error'); }
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
        hint: 'Tryb „Cyfry”: wpisz cyfry początkowe. Tryb „Kółka”: wybierz działanie i wynik, kliknij skrzyżowanie czterech pól, by dodać kółko; kliknięcie istniejącego kółka je usuwa. P = wszystkie cztery parzyste, N = wszystkie nieparzyste.',
        tools(box) {
            G.toolSelect(box, 'Tryb:', [['digits', 'Cyfry'], ['circles', 'Kółka']], mode, v => { mode = v; render(); });
            G.toolSelect(box, 'Działanie:', [['+', '+'], ['−', '−'], ['×', '×'], [':', ':'], ['P', 'P (parzyste)'], ['N', 'N (nieparzyste)']], cOp, v => { cOp = v; });
            G.toolNumber(box, 'Wynik:', 1, 999, '', v => { cVal = v; });
        },
        begin(p, keep) {
            if (!(keep && p.n === N)) { N = p.n; sol = null; circles = []; giv = G.grid(N, N, 0); }
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
