(function () {
    const board = G.$('boardGrid');
    let R, C, white, num, cur, revealed, errCells = new Set();
    // white[r][c] = 1 → tratwa (rozwiązanie), cur[r][c] = 1 → zamalowane (czarne)

    function has22(isBlack) {
        for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++)
            if (isBlack(r, c) && isBlack(r + 1, c) && isBlack(r, c + 1) && isBlack(r + 1, c + 1)) return true;
        return false;
    }

    function build() {
        const N = Math.min(R, C);
        for (let attempt = 0; attempt < 400; attempt++) {
            const w = G.grid(R, C, 0);
            const rafts = [];
            const put = (r, c, h, ww) => {
                if (r < 0 || c < 0 || r + h > R || c + ww > C) return false;
                for (let x = r; x < r + h; x++) for (let y = c; y < c + ww; y++) {
                    if (w[x][y]) return false;
                    for (const [dr, dc] of G.N4) {
                        const p = x + dr, q = y + dc;
                        const inside = p >= r && p < r + h && q >= c && q < c + ww;
                        if (!inside && p >= 0 && q >= 0 && p < R && q < C && w[p][q]) return false;
                    }
                }
                for (let x = r; x < r + h; x++) for (let y = c; y < c + ww; y++) w[x][y] = 1;
                rafts.push({ r, c, h, w: ww });
                return true;
            };
            const dim = () => 1 + G.rnd(Math.min(3, N - 2));
            while (!put(G.rnd(R - 1), G.rnd(C - 1), dim(), dim()));
            for (let t = 0; t < 120 && rafts.length < N * 2; t++) {
                const Rf = G.pick(rafts);
                const h = dim(), ww = dim();
                const corner = G.rnd(4);
                let r, c;
                if (corner === 0) { r = Rf.r + Rf.h; c = Rf.c + Rf.w; }
                else if (corner === 1) { r = Rf.r + Rf.h; c = Rf.c - ww; }
                else if (corner === 2) { r = Rf.r - h; c = Rf.c + Rf.w; }
                else { r = Rf.r - h; c = Rf.c - ww; }
                put(r, c, h, ww);
                if (rafts.length >= 3 && !has22((x, y) => !w[x][y])) break;
            }
            if (rafts.length >= 3 && !has22((x, y) => !w[x][y])) return { w, rafts };
        }
        return null;
    }

    function newGame() {
        R = C = G.size(6);
        let b;
        do { b = build(); } while (!b);
        white = b.w;
        const p = { easy: 0.9, medium: 0.65, hard: 0.45 }[G.level()];
        num = G.grid(R, C, 0);
        for (const Rf of b.rafts) {
            if (Math.random() > p) continue;
            num[Rf.r + G.rnd(Rf.h)][Rf.c + G.rnd(Rf.w)] = Rf.h * Rf.w;
        }
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Zamaluj pola, aby powstały tratwy-prostokąty.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) { board.appendChild(G.numCell({ max: R * C, value: num[r][c], onChange: v => { num[r][c] = v; } })); continue; }
            const err = errCells.has(r * C + c) ? ' error-highlight' : '';
            if (num[r][c]) {
                const d = document.createElement('div');
                d.className = 'cell given' + err;
                d.textContent = num[r][c];
                board.appendChild(d);
            } else {
                const d = G.tap('', (cur[r][c] ? 'black' : '') + (revealed && cur[r][c] ? ' revealed' : '') + err,
                    () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
                if (cur[r][c]) { d.style.cursor = 'pointer'; d.style.background = revealed ? '#14281c' : '#05050c'; }
                board.appendChild(d);
            }
        }
    }

    function check() {
        errCells = new Set();
        const isWhite = (r, c) => !cur[r][c];
        const sq = has22((r, c) => cur[r][c]);
        const { comps } = G.components(R, C, isWhite);
        let bad = false;
        for (const comp of comps) {
            const rs = comp.map(p => p[0]), cs = comp.map(p => p[1]);
            const h = Math.max(...rs) - Math.min(...rs) + 1, w = Math.max(...cs) - Math.min(...cs) + 1;
            const nums = comp.filter(([r, c]) => num[r][c]);
            let wrong = h * w !== comp.length || nums.length > 1 || (nums.length === 1 && num[nums[0][0]][nums[0][1]] !== comp.length);
            if (wrong) { bad = true; comp.forEach(([r, c]) => errCells.add(r * C + c)); }
        }
        const joined = G.components(R, C, isWhite, G.N8).comps.length <= 1;
        render();
        if (bad) G.status('Tratwy muszą być prostokątami z jedną liczbą równą ich polu (lub bez liczby).', 'error');
        else if (sq) G.status('Zamalowane pola nie mogą zawierać kwadratu 2×2.', 'error');
        else if (!joined) G.status('Wszystkie tratwy muszą tworzyć całość połączoną rogami.', 'error');
        else if (!cur.some(r => r.some(v => v))) G.status('Zamaluj pola.', 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!white) { G.noSolution(); return; }
        cur = white.map(row => row.map(v => 1 - v)); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 3, max: 16, def: R }, { id: 'c', label: 'Kolumny', min: 3, max: 16, def: C }],
        hint: 'Wpisz w polach liczby – pole tratwy, do której należą (np. 6 dla tratwy 2×3). Puste pola uzupełni gracz.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; white = null; num = G.grid(R, C, 0); }
            cur = G.grid(R, C, 0); revealed = false; errCells = new Set();
            render();
        },
        play() {
            if (!num.some(row => row.some(v => v))) return 'Wpisz co najmniej jedną liczbę.';
            white = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
