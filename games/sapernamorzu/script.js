(function () {
    const board = G.$('boardGrid');
    const FLEETS = { 6: [3, 2, 2, 1, 1], 7: [4, 3, 2, 2, 1, 1], 8: [4, 3, 3, 2, 2, 1, 1] };
    let R, C, fleet, sol, num, cur, revealed, errCells = new Set();

    const near = (g, r, c) => {
        let k = 0;
        for (const [dr, dc] of G.N8) if (g[r + dr] && g[r + dr][c + dc]) k++;
        return k;
    };

    function place() {
        for (;;) {
            const g = G.grid(R, C, 0);
            let ok = true;
            for (const len of fleet) {
                let placed = false;
                for (let t = 0; t < 200 && !placed; t++) {
                    const horiz = Math.random() < 0.5;
                    const r = G.rnd(horiz ? R : R - len + 1), c = G.rnd(horiz ? C - len + 1 : C);
                    const cells = Array.from({ length: len }, (_, i) => (horiz ? [r, c + i] : [r + i, c]));
                    if (cells.some(([x, y]) => g[x][y] || near(g, x, y))) continue;
                    cells.forEach(([x, y]) => { g[x][y] = 1; });
                    placed = true;
                }
                if (!placed) { ok = false; break; }
            }
            if (ok) return g;
        }
    }

    function legend() {
        const counts = {};
        fleet.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
        G.$('legend').textContent = 'Flota: ' + Object.keys(counts).sort((a, b) => b - a).map(l => `${counts[l]}× okręt ${l}-polowy`).join(', ');
    }

    function newGame() {
        R = C = G.size(7);
        fleet = FLEETS[R];
        sol = place();
        const p = { easy: 0.65, medium: 0.45, hard: 0.3 }[G.level()];
        num = G.grid(R, C, -1);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!sol[r][c] && Math.random() < p) num[r][c] = near(sol, r, c);
        legend();
        reset();
    }

    function reset() {
        cur = G.grid(R, C, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Rozmieść okręty zgodnie z cyframi.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (G.editing) { board.appendChild(G.numCell({ max: 8, min: 0, empty: -1, value: num[r][c], onChange: v => { num[r][c] = v; } })); continue; }
            const err = errCells.has(r * C + c) ? ' error-highlight' : '';
            if (num[r][c] >= 0) {
                const d = document.createElement('div');
                d.className = 'cell given' + err;
                d.textContent = num[r][c];
                board.appendChild(d);
            } else {
                const d = G.tap(cur[r][c] ? '■' : '', (cur[r][c] ? 'marked' : '') + (revealed && cur[r][c] ? ' revealed' : '') + err,
                    () => { cur[r][c] ^= 1; revealed = false; errCells = new Set(); render(); });
                board.appendChild(d);
            }
        }
    }

    function check() {
        errCells = new Set();
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++)
            if (num[r][c] >= 0 && near(cur, r, c) !== num[r][c]) errCells.add(r * C + c);
        const { comps } = G.components(R, C, (r, c) => cur[r][c] === 1, G.N8);
        let shapeBad = false;
        const sizes = [];
        for (const comp of comps) {
            const rs = comp.map(p => p[0]), cs = comp.map(p => p[1]);
            const h = Math.max(...rs) - Math.min(...rs) + 1, w = Math.max(...cs) - Math.min(...cs) + 1;
            if (h * w !== comp.length || (h > 1 && w > 1)) { shapeBad = true; comp.forEach(([r, c]) => errCells.add(r * C + c)); }
            sizes.push(comp.length);
        }
        sizes.sort((a, b) => b - a);
        const want = [...fleet].sort((a, b) => b - a);
        const fleetOk = sizes.length === want.length && sizes.every((v, i) => v === want[i]);
        render();
        if (shapeBad) G.status('Okręty muszą być prostymi liniami i nie mogą się stykać – nawet rogami.', 'error');
        else if (errCells.size) G.status(`Cyfry w ${errCells.size} polach się nie zgadzają.`, 'error');
        else if (!fleetOk) G.status('Flota nie zgadza się z podaną (rozmiary okrętów).', 'info');
        else G.status('🎉 Brawo! Rozwiązane.', 'success');
    }

    function solve() {
        if (!sol) { G.noSolution(); return; }
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    let fleetText = '';
    const parseFleet = t => t.split(/[^0-9]+/).filter(Boolean).map(Number).filter(v => v > 0).sort((a, b) => b - a);

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 20, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 20, def: C }],
        hint: 'Wpisz w polach cyfry 0–8 (ile z 8 sąsiednich pól ma być zajętych okrętami; puste = brak cyfry) i podaj długości okrętów, np. „4 3 2 2 1 1”.',
        tools(box) {
            const l = document.createElement('label');
            l.textContent = 'Flota (długości okrętów): ';
            const i = document.createElement('input');
            i.type = 'text'; i.id = 'fleetInput'; i.style.width = '10em';
            i.value = fleetText = (fleet || []).join(' ');
            i.addEventListener('input', () => { fleetText = i.value; });
            l.appendChild(i); box.appendChild(l);
        },
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; sol = null; num = G.grid(R, C, -1); }
            cur = G.grid(R, C, 0); revealed = false; errCells = new Set();
            render();
        },
        play() {
            const f = parseFleet(fleetText);
            if (!f.length) return 'Podaj flotę – długości okrętów oddzielone spacjami, np. „3 2 2 1”.';
            if (f.some(v => v > Math.max(R, C))) return 'Okręt nie zmieści się na planszy.';
            fleet = f; sol = null;
            legend();
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
