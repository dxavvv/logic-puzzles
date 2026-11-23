(function () {
    const board = G.$('boardGrid');
    let N, white, sol, cur, across, down, revealed;

    function runs() {
        // lista serii: {cells:[[r,c]...], sum, dir}
        const list = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (!white[r][c]) continue;
            if (c === 0 || !white[r][c - 1]) {
                const cells = [];
                for (let x = c; x < N && white[r][x]; x++) cells.push([r, x]);
                list.push({ cells, dir: 'a' });
            }
            if (r === 0 || !white[r - 1][c]) {
                const cells = [];
                for (let x = r; x < N && white[x][c]; x++) cells.push([x, c]);
                list.push({ cells, dir: 'd' });
            }
        }
        return list;
    }

    function layout() {
        const w = G.grid(N, N, true);
        for (let i = 0; i < N; i++) { w[0][i] = false; w[i][0] = false; }
        for (let r = 1; r < N; r++) for (let c = 1; c < N; c++) if (Math.random() < 0.22) w[r][c] = false;
        for (let pass = 0; pass < 40; pass++) {
            let changed = false;
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
                if (!w[r][c]) continue;
                let h = 1, v = 1;
                for (let x = c - 1; x >= 0 && w[r][x]; x--) h++;
                for (let x = c + 1; x < N && w[r][x]; x++) h++;
                for (let x = r - 1; x >= 0 && w[x][c]; x--) v++;
                for (let x = r + 1; x < N && w[x][c]; x++) v++;
                if (h < 2 || v < 2) { w[r][c] = false; changed = true; }
                else if (h > 6 && c > 0 && w[r][c - 1] && w[r][c + 1] === true && Math.random() < 0.3) { w[r][c] = false; changed = true; }
                else if (v > 6 && r > 0 && w[r - 1][c] && w[r + 1] && w[r + 1][c] && Math.random() < 0.3) { w[r][c] = false; changed = true; }
            }
            if (!changed) break;
        }
        return w;
    }

    function fill() {
        const cells = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (white[r][c]) cells.push([r, c]);
        const val = G.grid(N, N, 0);
        let steps = 0;
        const ok = (r, c, v) => {
            for (let x = c - 1; x >= 0 && white[r][x]; x--) if (val[r][x] === v) return false;
            for (let x = c + 1; x < N && white[r][x]; x++) if (val[r][x] === v) return false;
            for (let x = r - 1; x >= 0 && white[x][c]; x--) if (val[x][c] === v) return false;
            for (let x = r + 1; x < N && white[x][c]; x++) if (val[x][c] === v) return false;
            return true;
        };
        const go = i => {
            if (i === cells.length) return true;
            if (++steps > 20000) return false;
            const [r, c] = cells[i];
            for (const v of G.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
                if (!ok(r, c, v)) continue;
                val[r][c] = v;
                if (go(i + 1)) return true;
                val[r][c] = 0;
            }
            return false;
        };
        return go(0) ? val : null;
    }

    function newGame() {
        N = G.size(8);
        for (;;) {
            white = layout();
            let count = 0;
            white.forEach(r => r.forEach(v => { if (v) count++; }));
            if (count < N * N * 0.4) continue;
            sol = fill();
            if (sol) break;
        }
        across = G.grid(N, N, 0); down = G.grid(N, N, 0);
        for (const run of runs()) {
            const sum = run.cells.reduce((a, [r, c]) => a + sol[r][c], 0);
            const [r, c] = run.cells[0];
            if (run.dir === 'a') across[r][c - 1] = sum; else down[r - 1][c] = sum;
        }
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        // łatwiejszy poziom: kilka cyfr danych
        const k = { easy: 0.25, medium: 0.1, hard: 0 }[G.level()];
        givenMask = G.grid(N, N, false);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (white[r][c] && Math.random() < k) { givenMask[r][c] = true; cur[r][c] = sol[r][c]; }
        revealed = false;
        render();
        G.status('Uzupełnij białe pola cyframi 1–9.');
    }
    let givenMask;

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (!white[r][c]) {
                const d = document.createElement('div');
                d.className = 'cell black small';
                const a = across[r][c], dn = down[r][c];
                d.style.background = (a || dn) ? 'linear-gradient(to top right, #05050c 48%, #3a3a60 48%, #3a3a60 52%, #05050c 52%)' : '#05050c';
                d.style.position = 'relative';
                d.innerHTML = (a ? `<span style="position:absolute;top:6%;right:10%;font-size:.78rem;color:#c0d8ff">${a}</span>` : '') +
                    (dn ? `<span style="position:absolute;bottom:6%;left:10%;font-size:.78rem;color:#c0d8ff">${dn}</span>` : '');
                board.appendChild(d);
                continue;
            }
            const cls = (revealed && !givenMask[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            board.appendChild(G.cell({ max: 9, given: givenMask[r][c] ? cur[r][c] : 0, value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } }));
        }
    }

    function check() {
        const err = new Set();
        let empty = 0;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (white[r][c] && !cur[r][c]) empty++;
        for (const run of runs()) {
            const vals = run.cells.map(([r, c]) => cur[r][c]);
            const [r0, c0] = run.cells[0];
            const target = run.dir === 'a' ? across[r0][c0 - 1] : down[r0 - 1][c0];
            const bad = new Set();
            const seen = {};
            vals.forEach((v, i) => { if (v) { if (seen[v] !== undefined) { bad.add(i); bad.add(seen[v]); } seen[v] = i; } });
            if (!vals.includes(0) && vals.reduce((a, b) => a + b, 0) !== target) vals.forEach((_, i) => bad.add(i));
            bad.forEach(i => err.add(run.cells[i][0] * N + run.cells[i][1]));
        }
        if (err.size) { render(err); G.status('Są błędy – zaznaczone pola łamią zasady.', 'error'); }
        else if (empty) G.status(`Na razie bez błędów. Puste pola: ${empty}.`, 'info');
        else G.status('🎉 Brawo! Wszystkie sumy się zgadzają.', 'success');
    }

    function solve() {
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
