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

    function newGame() {
        N = G.size(5);
        sol = G.latin(N);
        const keep = { easy: 0.55, medium: 0.4, hard: 0.28 }[G.level()];
        circles = [];
        const spots = [];
        for (let r = 0; r < N - 1; r++) for (let c = 0; c < N - 1; c++) spots.push([r, c]);
        G.shuffle(spots);
        for (const [r, c] of spots) {
            if (Math.random() > keep) continue;
            const list = ops(sol[r][c], sol[r][c + 1], sol[r + 1][c], sol[r + 1][c + 1]);
            if (!list.length) continue;
            const [op, val] = G.pick(list);
            circles.push({ r, c, op, val });
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

    function render(err = new Set(), badCircles = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.style.position = 'relative';
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            board.appendChild(G.cell({ max: N, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } }));
        }
        circles.forEach((cc, i) => {
            const d = document.createElement('div');
            const lab = cc.op === 'P' || cc.op === 'N' ? cc.op : cc.val + cc.op;
            d.textContent = lab;
            const pc = 100 / N;
            d.style.cssText = `position:absolute;left:calc(${(cc.c + 1) * pc}% + 0px);top:calc(${(cc.r + 1) * pc}% + 0px);` +
                'transform:translate(-50%,-50%);min-width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
                `font-size:.72rem;font-weight:700;pointer-events:none;z-index:2;border:2px solid ${badCircles.has(i) ? '#f87171' : '#f0c060'};` +
                `background:${badCircles.has(i) ? '#3a1a1a' : '#241e10'};color:#f0c060`;
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
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
