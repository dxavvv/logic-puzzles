(function () {
    const board = G.$('boardGrid');
    let R, C, white, sol, cur, across, down, revealed, givenMask;

    function runs() {
        // lista serii: {cells:[[r,c]...], dir}
        const list = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (!white[r][c]) continue;
            if (c === 0 || !white[r][c - 1]) {
                const cells = [];
                for (let x = c; x < C && white[r][x]; x++) cells.push([r, x]);
                list.push({ cells, dir: 'a' });
            }
            if (r === 0 || !white[r - 1][c]) {
                const cells = [];
                for (let x = r; x < R && white[x][c]; x++) cells.push([x, c]);
                list.push({ cells, dir: 'd' });
            }
        }
        return list;
    }

    function layout() {
        const w = G.grid(R, C, true);
        for (let i = 0; i < C; i++) w[0][i] = false;
        for (let i = 0; i < R; i++) w[i][0] = false;
        for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) if (Math.random() < 0.22) w[r][c] = false;
        for (let pass = 0; pass < 40; pass++) {
            let changed = false;
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
                if (!w[r][c]) continue;
                let h = 1, v = 1;
                for (let x = c - 1; x >= 0 && w[r][x]; x--) h++;
                for (let x = c + 1; x < C && w[r][x]; x++) h++;
                for (let x = r - 1; x >= 0 && w[x][c]; x--) v++;
                for (let x = r + 1; x < R && w[x][c]; x++) v++;
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
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (white[r][c]) cells.push([r, c]);
        const val = G.grid(R, C, 0);
        let steps = 0;
        const ok = (r, c, v) => {
            for (let x = c - 1; x >= 0 && white[r][x]; x--) if (val[r][x] === v) return false;
            for (let x = c + 1; x < C && white[r][x]; x++) if (val[r][x] === v) return false;
            for (let x = r - 1; x >= 0 && white[x][c]; x--) if (val[x][c] === v) return false;
            for (let x = r + 1; x < R && white[x][c]; x++) if (val[x][c] === v) return false;
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
        R = C = G.size(8);
        for (;;) {
            white = layout();
            let count = 0;
            white.forEach(r => r.forEach(v => { if (v) count++; }));
            if (count < R * C * 0.4) continue;
            sol = fill();
            if (sol) break;
        }
        across = G.grid(R, C, 0); down = G.grid(R, C, 0);
        for (const run of runs()) {
            const sum = run.cells.reduce((a, [r, c]) => a + sol[r][c], 0);
            const [r, c] = run.cells[0];
            if (run.dir === 'a') across[r][c - 1] = sum; else down[r - 1][c] = sum;
        }
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        // łatwiejszy poziom: kilka cyfr danych (własna plansza nie ma gotowego rozwiązania)
        const k = G.custom || !sol ? 0 : { easy: 0.25, medium: 0.1, hard: 0 }[G.level()];
        givenMask = G.grid(R, C, false);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (white[r][c] && Math.random() < k) { givenMask[r][c] = true; cur[r][c] = sol[r][c]; }
        revealed = false;
        render();
        G.status('Uzupełnij białe pola cyframi 1–9.');
    }

    // --- edytor ---
    let mode = 'layout';

    function renderEdit() {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (white[r][c]) {
                const d = G.tap('', '', () => { if (mode === 'layout') { white[r][c] = false; renderEdit(); } });
                d.style.cursor = mode === 'layout' ? 'pointer' : 'default';
                board.appendChild(d);
                continue;
            }
            const d = document.createElement('div');
            d.className = 'cell black small';
            d.style.position = 'relative';
            d.style.background = 'linear-gradient(to top right, #05050c 48%, #3a3a60 48%, #3a3a60 52%, #05050c 52%)';
            if (mode === 'sums') {
                const mk = (arr, css) => {
                    const i = document.createElement('input');
                    i.type = 'text'; i.inputMode = 'numeric'; i.maxLength = 2; i.autocomplete = 'off';
                    i.style.cssText = 'position:absolute;width:46%;height:38%;font-size:.7rem;text-align:center;background:#1c2230;color:#c0d8ff;border:1px solid #3a3a60;padding:0;' + css;
                    if (arr[r][c]) i.value = arr[r][c];
                    i.addEventListener('input', () => {
                        const n = parseInt(i.value.replace(/[^0-9]/g, ''), 10);
                        const ok = n >= 1 && n <= 45;
                        i.value = ok ? String(n) : '';
                        arr[r][c] = ok ? n : 0;
                    });
                    return i;
                };
                if (c + 1 < C && white[r][c + 1]) d.appendChild(mk(across, 'top:4%;right:4%'));
                if (r + 1 < R && white[r + 1][c]) d.appendChild(mk(down, 'bottom:4%;left:4%'));
            } else {
                d.style.cursor = r === 0 || c === 0 ? 'default' : 'pointer';
                if (r > 0 && c > 0) d.addEventListener('click', () => { white[r][c] = true; renderEdit(); });
            }
            board.appendChild(d);
        }
    }

    function render(err = new Set()) {
        if (G.editing) { renderEdit(); return; }
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
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
            const cls = (revealed && !givenMask[r][c] ? ' revealed' : '') + (err.has(r * C + c) ? ' error-highlight' : '');
            board.appendChild(G.cell({ max: 9, given: givenMask[r][c] ? cur[r][c] : 0, value: cur[r][c], cls, onChange: v => { cur[r][c] = v; } }));
        }
    }

    function check() {
        const err = new Set();
        let empty = 0;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (white[r][c] && !cur[r][c]) empty++;
        for (const run of runs()) {
            const vals = run.cells.map(([r, c]) => cur[r][c]);
            const [r0, c0] = run.cells[0];
            const target = run.dir === 'a' ? across[r0][c0 - 1] : down[r0 - 1][c0];
            const bad = new Set();
            const seen = {};
            vals.forEach((v, i) => { if (v) { if (seen[v] !== undefined) { bad.add(i); bad.add(seen[v]); } seen[v] = i; } });
            if (!vals.includes(0) && vals.reduce((a, b) => a + b, 0) !== target) vals.forEach((_, i) => bad.add(i));
            bad.forEach(i => err.add(run.cells[i][0] * C + run.cells[i][1]));
        }
        if (err.size) { render(err); G.status('Są błędy – zaznaczone pola łamią zasady.', 'error'); }
        else if (empty) G.status(`Na razie bez błędów. Puste pola: ${empty}.`, 'info');
        else G.status('🎉 Brawo! Wszystkie sumy się zgadzają.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol);
        revealed = true;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 3, max: 16, def: R }, { id: 'c', label: 'Kolumny', min: 3, max: 16, def: C }],
        hint: 'Tryb „Układ”: klikaj pola, aby zrobić czarne/białe (pierwszy wiersz i kolumna są zawsze czarne). Tryb „Sumy”: wpisz sumy w czarnych polach – górna dla serii w prawo, dolna dla serii w dół.',
        tools(box) {
            G.toolSelect(box, 'Tryb:', [['layout', 'Układ planszy'], ['sums', 'Sumy']], mode, v => { mode = v; renderEdit(); });
        },
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) {
                R = p.r; C = p.c; sol = null;
                white = G.grid(R, C, true);
                for (let i = 0; i < C; i++) white[0][i] = false;
                for (let i = 0; i < R; i++) white[i][0] = false;
                across = G.grid(R, C, 0); down = G.grid(R, C, 0);
            }
            cur = G.grid(R, C, 0); givenMask = G.grid(R, C, false); revealed = false;
            render();
        },
        play() {
            const list = runs();
            if (!list.length) return 'Plansza nie ma żadnych białych pól.';
            const na = G.grid(R, C, 0), nd = G.grid(R, C, 0);
            for (const run of list) {
                const n = run.cells.length, [r, c] = run.cells[0];
                if (n > 9) return 'Seria może mieć najwyżej 9 pól (cyfry się nie powtarzają).';
                const v = run.dir === 'a' ? across[r][c - 1] : down[r - 1][c];
                const lo = n * (n + 1) / 2, hi = 45 - (9 - n) * (10 - n) / 2;
                if (!v) return `Brak sumy przy serii zaczynającej się w wierszu ${r + 1}, kolumnie ${c + 1}.`;
                if (v < lo || v > hi) return `Suma ${v} jest niemożliwa dla serii ${n} pól (dozwolone ${lo}–${hi}).`;
                if (run.dir === 'a') na[r][c - 1] = v; else nd[r - 1][c] = v;
            }
            across = na; down = nd; sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
