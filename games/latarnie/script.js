(function () {
    const board = G.$('boardGrid');
    let N, light, sol, num, cur, revealed, errCells = new Set();

    const adj8 = (g, r, c) => G.N8.some(([dr, dc]) => g[r + dr] && g[r + dr][c + dc]);

    function countFor(ships, r, c) {
        let k = 0;
        for (let i = 0; i < N; i++) { if (ships[r][i]) k++; if (ships[i][c]) k++; }
        return k;
    }

    function newGame() {
        N = G.size(7);
        const lv = G.level();
        const nl = Math.round(N * { easy: 0.7, medium: 0.55, hard: 0.42 }[lv]);
        for (;;) {
            light = G.grid(N, N, 0);
            const lights = [];
            for (let t = 0; t < 200 && lights.length < nl; t++) {
                const r = G.rnd(N), c = G.rnd(N);
                if (light[r][c] || adj8(light, r, c)) continue;
                light[r][c] = 1; lights.push([r, c]);
            }
            sol = G.grid(N, N, 0);
            const cand = [];
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
                if (light[r][c] || adj8(light, r, c)) continue;
                if (lights.some(([a, b]) => a === r || b === c)) cand.push([r, c]);
            }
            G.shuffle(cand);
            let ships = 0;
            const want = Math.round(N * 0.9);
            for (const [r, c] of cand) {
                if (ships >= want) break;
                if (adj8(sol, r, c)) continue;
                sol[r][c] = 1; ships++;
            }
            if (ships >= Math.max(3, want - 2)) {
                num = G.grid(N, N, 0);
                lights.forEach(([r, c]) => { num[r][c] = countFor(sol, r, c); });
                break;
            }
        }
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        revealed = false; errCells = new Set();
        render();
        G.status('Rozmieść statki w zasięgu latarni.');
    }

    function render() {
        board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        board.innerHTML = '';
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            const err = errCells.has(r * N + c) ? ' error-highlight' : '';
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
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
            if (light[r][c]) {
                if (countFor(cur, r, c) !== num[r][c]) errCells.add(r * N + c);
            } else if (cur[r][c]) {
                if (adj8(cur, r, c) || adj8(light, r, c)) { errCells.add(r * N + c); touch = true; }
                let lit = false;
                for (let i = 0; i < N; i++) if (light[r][i] || light[i][c]) lit = true;
                if (!lit) { errCells.add(r * N + c); unlit = true; }
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
        cur = G.copy(sol); revealed = true; errCells = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
