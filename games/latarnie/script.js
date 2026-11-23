(function () {
    const board = G.$('boardGrid');
    let R, C, light, sol, num, cur, revealed, errCells = new Set();

    const adj8 = (g, r, c) => G.N8.some(([dr, dc]) => g[r + dr] && g[r + dr][c + dc]);

    // ile statków stoi w wierszu i kolumnie latarni (samo pole latarni jest puste)
    function countFor(ships, r, c) {
        let k = 0;
        for (let i = 0; i < C; i++) if (ships[r][i]) k++;
        for (let i = 0; i < R; i++) if (ships[i][c]) k++;
        return k;
    }

    function newGame() {
        R = C = G.size(7);
        const lv = G.level();
        const nl = Math.round(Math.min(R, C) * { easy: 0.7, medium: 0.55, hard: 0.42 }[lv]);
        for (;;) {
            light = G.grid(R, C, 0);
            const lights = [];
            for (let t = 0; t < 200 && lights.length < nl; t++) {
                const r = G.rnd(R), c = G.rnd(C);
                if (light[r][c] || adj8(light, r, c)) continue;
                light[r][c] = 1; lights.push([r, c]);
            }
            sol = G.grid(R, C, 0);
            const cand = [];
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
                if (light[r][c] || adj8(light, r, c)) continue;
                if (lights.some(([a, b]) => a === r || b === c)) cand.push([r, c]);
            }
            G.shuffle(cand);
            let ships = 0;
            const want = Math.round(Math.min(R, C) * 0.9);
            for (const [r, c] of cand) {
                if (ships >= want) break;
                if (adj8(sol, r, c)) continue;
                sol[r][c] = 1; ships++;
            }
            if (ships >= Math.max(3, want - 2)) {
                num = G.grid(R, C, 0);
                lights.forEach(([r, c]) => { num[r][c] = countFor(sol, r, c); });
                break;
            }
        }
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Rozmieść statki w zasięgu latarni.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) {
                board.appendChild(G.numCell({
                    max: R + C, min: 0, empty: -1, value: light[r][c] ? num[r][c] : -1,
                    onChange: v => { light[r][c] = v >= 0 ? 1 : 0; num[r][c] = v >= 0 ? v : 0; }
                }));
                continue;
            }
            const err = errCells.has(r * C + c) ? ' error-highlight' : '';
            if (light[r][c]) {
                const d = document.createElement('div');
                d.className = 'cell given' + err;
                d.style.color = '#f0c060';
                d.textContent = num[r][c];
                board.appendChild(d);
            } else {
                board.appendChild(G.tap(cur[r][c] ? '🚢' : '', (cur[r][c] ? 'marked' : '') + (revealed && cur[r][c] ? ' revealed' : '') + err,
                    () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); }));
            }
        }
    }

    function check() {
        errCells = new Set();
        let unlit = false, touch = false;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (light[r][c]) {
                if (countFor(cur, r, c) !== num[r][c]) errCells.add(r * C + c);
            } else if (cur[r][c]) {
                if (adj8(cur, r, c) || adj8(light, r, c)) { errCells.add(r * C + c); touch = true; }
                let lit = false;
                for (let i = 0; i < C; i++) if (light[r][i]) lit = true;
                for (let i = 0; i < R; i++) if (light[i][c]) lit = true;
                if (!lit) { errCells.add(r * C + c); unlit = true; }
            }
        }
        render();
        if (touch) G.status('Statki nie mogą stykać się ze sobą ani z latarniami – także rogami.', 'error');
        else if (unlit) G.status('Każdy statek musi być oświetlony przez latarnię.', 'error');
        else if (errCells.size) G.status('Liczby przy latarniach (czerwone) się nie zgadzają.', 'error');
        else if (!cur.some(r => r.some(v => v))) G.status('Rozmieść statki.', 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 20, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 20, def: C }],
        hint: 'Wpisz liczbę w polu, aby postawić tam latarnię (liczba = ile statków ma stać w jej wierszu i kolumnie, 0 też można). Puste pole to zwykłe pole.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; sol = null; light = G.grid(R, C, 0); num = G.grid(R, C, 0); }
            cur = G.grid(R, C, 0); revealed = false; errCells = new Set();
            render();
        },
        play() {
            if (!light.some(row => row.some(v => v))) return 'Wpisz co najmniej jedną latarnię.';
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++)
                if (light[r][c] && adj8(light, r, c)) return 'Latarnie nie mogą się stykać (nawet rogami).';
            sol = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
