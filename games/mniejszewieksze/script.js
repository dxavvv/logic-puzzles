(function () {
    const board = G.$('boardGrid');
    let N, sol, giv, cur, hs, vs, revealed;
    // hs[r][c]: znak między (r,c) a (r,c+1): 1 = lewe mniejsze, -1 = lewe większe, 0 brak
    // vs[r][c]: znak między (r,c) a (r+1,c)

    function newGame() {
        N = G.size(5);
        sol = G.latin(N);
        const ps = { easy: 0.55, medium: 0.4, hard: 0.28 }[G.level()];
        const gp = { easy: 0.2, medium: 0.08, hard: 0 }[G.level()];
        hs = G.grid(N, N - 1, 0); vs = G.grid(N - 1, N, 0);
        for (let r = 0; r < N; r++) for (let c = 0; c < N - 1; c++) if (Math.random() < ps) hs[r][c] = sol[r][c] < sol[r][c + 1] ? 1 : -1;
        for (let r = 0; r < N - 1; r++) for (let c = 0; c < N; c++) if (Math.random() < ps) vs[r][c] = sol[r][c] < sol[r + 1][c] ? 1 : -1;
        giv = sol.map(row => row.map(v => (Math.random() < gp ? v : 0)));
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij planszę.');
    }

    function render(err = new Set()) {
        const W = 2 * N - 1;
        board.style.gridTemplateColumns = Array.from({ length: W }, (_, i) => (i % 2 ? '0.45fr' : '1fr')).join(' ');
        board.innerHTML = '';
        for (let r = 0; r < W; r++) for (let c = 0; c < W; c++) {
            if (r % 2 === 0 && c % 2 === 0) {
                const rr = r / 2, cc = c / 2;
                const cls = (revealed && !giv[rr][cc] ? ' revealed' : '') + (err.has(rr * N + cc) ? ' error-highlight' : '');
                board.appendChild(G.cell({ max: N, given: giv[rr][cc], value: cur[rr][cc], cls, onChange: v => { cur[rr][cc] = v; } }));
            } else {
                const d = document.createElement('div');
                d.className = 'clue';
                if (r % 2 === 0) { const s = hs[r / 2][(c - 1) / 2]; d.textContent = s === 1 ? '<' : s === -1 ? '>' : ''; }
                else if (c % 2 === 0) { const s = vs[(r - 1) / 2][c / 2]; d.textContent = s === 1 ? '⋀' : s === -1 ? '⋁' : ''; }
                d.style.aspectRatio = 'auto';
                board.appendChild(d);
            }
        }
    }

    function check() {
        const err = G.latinErrors(cur, N, N);
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        for (let r = 0; r < N; r++) for (let c = 0; c < N - 1; c++) {
            const a = cur[r][c], b = cur[r][c + 1];
            if (hs[r][c] && a && b && (hs[r][c] === 1 ? a >= b : a <= b)) { err.add(r * N + c); err.add(r * N + c + 1); }
        }
        for (let r = 0; r < N - 1; r++) for (let c = 0; c < N; c++) {
            const a = cur[r][c], b = cur[r + 1][c];
            if (vs[r][c] && a && b && (vs[r][c] === 1 ? a >= b : a <= b)) { err.add(r * N + c); err.add((r + 1) * N + c); }
        }
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
