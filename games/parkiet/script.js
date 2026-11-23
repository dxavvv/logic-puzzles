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

    function legend() {
        const digits = Array.from({ length: L }, (_, i) => i + 1);
        const list = digits.length > 1 ? digits.slice(0, -1).join(', ') + ' i ' + digits[L - 1] : '1';
        G.$('legend').textContent = `Klepki mają długość ${L}: w każdej cyfry ${list}. W każdym wierszu i kolumnie po ${N / L} razy każda cyfra.`;
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
        legend();
        reset();
    }

    function reset() {
        cur = G.copy(giv);
        revealed = false;
        render();
        G.status('Uzupełnij klepki.');
    }

    let mode = 'layout', orient = 'h';

    function place(r, c) {
        if (plank[r][c] >= 0) {
            const id = plank[r][c];
            for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (plank[x][y] === id) plank[x][y] = -1;
            return;
        }
        const cells = Array.from({ length: L }, (_, k) => (orient === 'h' ? [r, c + k] : [r + k, c]));
        if (cells.some(([x, y]) => x >= N || y >= N || plank[x][y] >= 0)) { G.status('Klepka się tu nie mieści lub zachodzi na inną.', 'error'); return; }
        const id = 1 + Math.max(-1, ...plank.map(row => Math.max(...row)));
        cells.forEach(([x, y]) => { plank[x][y] = id; });
    }

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            let d;
            if (G.editing && mode === 'layout') d = G.tap('', '', () => { place(r, c); render(); });
            else if (G.editing) d = G.numCell({ max: L, value: giv[r][c], onChange: v => { giv[r][c] = v; } });
            else {
                const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
                d = G.cell({ max: L, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } });
            }
            const id = plank[r][c];
            if (G.editing && id < 0) d.style.background = '#07070f';
            const same = (x, y) => x >= 0 && y >= 0 && x < N && y < N && plank[x][y] === id && id >= 0;
            const b = '3px solid #c49a5a', t = '1px solid transparent';
            d.style.borderTop = same(r - 1, c) ? t : b;
            d.style.borderBottom = same(r + 1, c) ? t : b;
            d.style.borderLeft = same(r, c - 1) ? t : b;
            d.style.borderRight = same(r, c + 1) ? t : b;
            board.appendChild(d);
        }
    }

    function errors(cur) {
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
        return err;
    }

    function check() {
        const err = errors(cur);
        let empty = 0;
        cur.forEach(r => r.forEach(v => { if (!v) empty++; }));
        if (err.size) { render(err); G.status('Są błędy – zaznaczone pola łamią zasady.', 'error'); }
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
        params: () => [
            { id: 'n', label: 'Rozmiar n×n', min: 2, max: 12, def: N },
            { id: 'l', label: 'Długość klepki', min: 2, max: 4, def: L }
        ],
        hint: 'Tryb „Układ”: kliknij pole, aby położyć klepkę w wybranym kierunku (kliknięcie klepki ją zdejmuje). Tryb „Cyfry”: wpisz cyfry początkowe. Rozmiar musi dzielić się przez długość klepki.',
        tools(box) {
            G.toolSelect(box, 'Tryb:', [['layout', 'Układ klepek'], ['digits', 'Cyfry']], mode, v => { mode = v; render(); });
            G.toolSelect(box, 'Kierunek:', [['h', 'poziomo'], ['v', 'pionowo']], orient, v => { orient = v; });
            G.toolButton(box, '🎲 Losowy układ', () => {
                if ((N * N) % L) { G.status('Plansza nie dzieli się na klepki tej długości.', 'error'); return; }
                const t = tile();
                if (t) { plank = t; render(); }
            });
        },
        begin(p, keep) {
            if (!(keep && p.n === N && p.l === L)) {
                N = p.n; L = p.l; sol = null;
                plank = G.grid(N, N, -1); giv = G.grid(N, N, 0);
            }
            cur = G.copy(giv); revealed = false;
            render();
        },
        play() {
            if (N % L) return `Rozmiar ${N} musi dzielić się przez długość klepki ${L}.`;
            if (plank.some(row => row.some(v => v < 0))) return 'Klepki muszą pokrywać całą planszę.';
            const map = new Map();
            plank = plank.map(row => row.map(v => { if (!map.has(v)) map.set(v, map.size); return map.get(v); }));
            if (errors(giv).size) return 'Cyfry początkowe łamią zasady (powtórzenia w klepce, sąsiednie jednakowe lub za dużo w wierszu/kolumnie).';
            sol = null;
            legend();
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
