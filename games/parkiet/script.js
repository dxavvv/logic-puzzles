(function () {
    const board = G.$('boardGrid');
    let N, L, plank, sol, giv, cur, revealed;

    function tile() {
        const id = G.grid(N, N, -1);
        let n = 0;
        const go = () => {
            let r = -1, c = -1;
            outer: for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (id[i][j] < 0) { r = i; c = j; break outer; }
            if (r < 0) return true;
            for (const horiz of G.shuffle([true, false])) {
                const cells = Array.from({ length: L }, (_, k) => (horiz ? [r, c + k] : [r + k, c]));
                if (cells.some(([x, y]) => x >= N || y >= N || id[x][y] >= 0)) continue;
                cells.forEach(([x, y]) => { id[x][y] = n; });
                n++;
                if (go()) return true;
                n--;
                cells.forEach(([x, y]) => { id[x][y] = -1; });
            }
            return false;
        };
        return go() ? id : null;
    }

    function fill() {
        const per = N / L;
        const g = G.grid(N, N, 0);
        const rc = Array.from({ length: N }, () => Array(L + 1).fill(0));
        const cc = Array.from({ length: N }, () => Array(L + 1).fill(0));
        const used = {};
        let steps = 0;
        const go = i => {
            if (i === N * N) return true;
            if (++steps > 200000) return false;
            const r = Math.floor(i / N), c = i % N;
            const pid = plank[r][c];
            for (const v of G.shuffle(Array.from({ length: L }, (_, k) => k + 1))) {
                if (used[pid + ':' + v]) continue;
                if (rc[r][v] >= per || cc[c][v] >= per) continue;
                if ((r > 0 && g[r - 1][c] === v) || (c > 0 && g[r][c - 1] === v)) continue;
                g[r][c] = v; rc[r][v]++; cc[c][v]++; used[pid + ':' + v] = true;
                if (go(i + 1)) return true;
                g[r][c] = 0; rc[r][v]--; cc[c][v]--; used[pid + ':' + v] = false;
            }
            return false;
        };
        return go(0) ? g : null;
    }

    function newGame() {
        N = G.size(6);
        L = N === 8 ? 2 : N === 9 ? 3 : (Math.random() < 0.5 ? 2 : 3);
        for (;;) {
            plank = tile();
            if (!plank) continue;
            sol = fill();
            if (sol) break;
        }
        const p = { easy: 0.35, medium: 0.22, hard: 0.12 }[G.level()];
        giv = sol.map(row => row.map(v => (Math.random() < p ? v : 0)));
        G.$('legend').textContent = `Klepki mają długość ${L}: w każdej cyfry ${L === 2 ? '1 i 2' : '1, 2 i 3'}. W każdym wierszu i kolumnie po ${N / L} razy każda cyfra.`;
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij klepki.');
    }

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            const d = G.cell({ max: L, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } });
            const id = plank[r][c];
            const same = (x, y) => x >= 0 && y >= 0 && x < N && y < N && plank[x][y] === id;
            const b = '3px solid #c49a5a', t = '1px solid transparent';
            d.style.borderTop = same(r - 1, c) ? t : b;
            d.style.borderBottom = same(r + 1, c) ? t : b;
            d.style.borderLeft = same(r, c - 1) ? t : b;
            d.style.borderRight = same(r, c + 1) ? t : b;
            board.appendChild(d);
        }
    }

    function check() {
        const err = new Set();
        const per = N / L;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const v = cur[r][c];
            if (!v) continue;
            if ((r + 1 < N && cur[r + 1][c] === v) || (c + 1 < N && cur[r][c + 1] === v)) {
                err.add(r * N + c);
                if (r + 1 < N && cur[r + 1][c] === v) err.add((r + 1) * N + c);
                if (c + 1 < N && cur[r][c + 1] === v) err.add(r * N + c + 1);
            }
        }
        const byPlank = {};
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (!cur[r][c]) continue;
            const k = plank[r][c] + ':' + cur[r][c];
            (byPlank[k] = byPlank[k] || []).push(r * N + c);
        }
        for (const k in byPlank) if (byPlank[k].length > 1) byPlank[k].forEach(i => err.add(i));
        for (let i = 0; i < N; i++) {
            for (let v = 1; v <= L; v++) {
                const rowIdx = [], colIdx = [];
                for (let j = 0; j < N; j++) { if (cur[i][j] === v) rowIdx.push(i * N + j); if (cur[j][i] === v) colIdx.push(j * N + i); }
                if (rowIdx.length > per) rowIdx.forEach(x => err.add(x));
                if (colIdx.length > per) colIdx.forEach(x => err.add(x));
            }
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
