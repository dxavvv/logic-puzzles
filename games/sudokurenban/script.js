(function () {
    let N = 9, bh = 3, bw = 3;
    const board = G.$('boardGrid');
    let sol, giv, cur, lines, lineOf, revealed;

    const boxOf = (r, c) => Math.floor(r / bh) * (N / bw) + Math.floor(c / bw);
    const dims = n => (n === 4 ? [2, 2] : n === 6 ? [2, 3] : [3, 3]);

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
        N = 9; [bh, bw] = dims(N);
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

    let mode = 'lines', active = -1;

    function paint(r, c) {
        if (active < 0 || !lines[active]) { lines.push([]); active = lines.length - 1; }
        const li = lineOf[r][c];
        if (li >= 0) {
            lines[li] = lines[li].filter(([x, y]) => x !== r || y !== c);
            lineOf[r][c] = -1;
            if (li === active) { render(); return; }
        }
        lines[active].push([r, c]);
        lineOf[r][c] = active;
        render();
    }

    const HUES = [200, 40, 130, 300, 10, 170, 260, 80];

    function render(err = new Set()) {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const cls = (revealed && !giv[r][c] ? ' revealed' : '') + (err.has(r * N + c) ? ' error-highlight' : '');
            let d;
            if (G.editing && mode === 'lines') d = G.tap('', '', () => paint(r, c));
            else if (G.editing) d = G.numCell({ max: N, value: giv[r][c], onChange: v => { giv[r][c] = v; } });
            else d = G.cell({ max: N, given: giv[r][c], value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } });
            const li = lineOf[r][c];
            if (G.editing && mode === 'lines') d.style.cursor = 'pointer';
            if (G.editing && li === active) d.style.outline = '2px solid #f0c060';
            if (li >= 0 && !err.has(r * N + c) && !revealed) {
                d.style.background = `hsl(${HUES[li % HUES.length]} 45% 22%)`;
                d.style.borderColor = `hsl(${HUES[li % HUES.length]} 55% 45%)`;
            }
            // pogrubione granice bloków 3×3
            if (r % bh === 0 && r > 0) d.style.marginTop = '2px';
            if (c % bw === 0 && c > 0) d.style.marginLeft = '2px';
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
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const snap = n => (n <= 5 ? 4 : n <= 7 ? 6 : 9);

    const edit = {
        params: () => [{ id: 'n', label: 'Rozmiar (4, 6 lub 9)', min: 4, max: 9, def: N }],
        hint: 'Tryb „Linie”: kliknij pola, aby dodać je do aktywnej linii (ponowne kliknięcie zdejmuje pole z linii); „Nowa linia” zaczyna kolejną. Cyfry na linii muszą tworzyć ciąg kolejnych liczb. Tryb „Cyfry”: wpisz cyfry początkowe. Rozmiar: 4 (bloki 2×2), 6 (2×3) lub 9 (3×3).',
        tools(box) {
            G.toolSelect(box, 'Tryb:', [['lines', 'Linie'], ['digits', 'Cyfry']], mode, v => { mode = v; render(); });
            G.toolButton(box, '➕ Nowa linia', () => { lines.push([]); active = lines.length - 1; render(); });
        },
        begin(p, keep) {
            const n = snap(p.n);
            const inp = G.$('ep_n'); if (inp) inp.value = n;
            if (!(keep && n === N)) {
                N = n; [bh, bw] = dims(N); sol = null;
                lines = []; lineOf = G.grid(N, N, -1); giv = G.grid(N, N, 0); active = -1;
            }
            cur = G.copy(giv); revealed = false;
            render();
        },
        play() {
            const kept = lines.filter(l => l.length);
            for (const l of kept) {
                if (l.length < 2) return 'Każda linia musi mieć co najmniej 2 pola.';
                if (l.length > N) return `Linia nie może mieć więcej niż ${N} pól.`;
                const m = G.grid(N, N, 0);
                l.forEach(([r, c]) => { m[r][c] = 1; });
                if (G.components(N, N, (r, c) => m[r][c]).comps.length !== 1) return 'Każda linia musi być spójna (pola stykają się bokami).';
            }
            const err = G.latinErrors(giv, N, N);
            const seen = new Set();
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (giv[r][c]) {
                const k = boxOf(r, c) + ':' + giv[r][c];
                if (seen.has(k)) err.add(1);
                seen.add(k);
            }
            if (err.size) return 'Cyfry początkowe łamią zasady sudoku (powtórzenie w wierszu, kolumnie lub bloku).';
            for (const l of kept) {
                const vals = l.map(([r, c]) => giv[r][c]).filter(Boolean);
                if (new Set(vals).size !== vals.length) return 'Cyfry na jednej linii nie mogą się powtarzać.';
                if (vals.length && Math.max(...vals) - Math.min(...vals) >= l.length) return 'Cyfry początkowe na linii nie mogą się zmieścić w ciągu kolejnych liczb.';
            }
            lines = kept;
            lineOf = G.grid(N, N, -1);
            lines.forEach((l, i) => l.forEach(([r, c]) => { lineOf[r][c] = i; }));
            sol = null; active = -1;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
