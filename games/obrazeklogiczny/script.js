(function () {
    const board = G.$('boardGrid');
    let N, sol, cur, rowK, colK, revealed, bad = new Set();

    const blocks = line => {
        const out = []; let run = 0;
        for (const v of line) { if (v) run++; else if (run) { out.push(run); run = 0; } }
        if (run) out.push(run);
        return out.length ? out : [0];
    };
    const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

    function newGame() {
        N = G.size(8);
        const d = { easy: 0.62, medium: 0.55, hard: 0.5 }[G.level()];
        sol = G.grid(N, N, 0);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) sol[r][c] = Math.random() < d ? 1 : 0;
        rowK = sol.map(blocks);
        colK = Array.from({ length: N }, (_, c) => blocks(sol.map(row => row[c])));
        reset();
    }

    function reset() {
        cur = G.grid(N, N, 0);
        revealed = false; bad = new Set();
        render();
        G.status('Zamaluj pola według liczb.');
    }

    function render() {
        board.style.gridTemplateColumns = `max-content repeat(${N}, 1fr)`;
        board.innerHTML = '';
        const corner = document.createElement('div');
        board.appendChild(corner);
        for (let c = 0; c < N; c++) {
            const d = document.createElement('div');
            d.className = 'clue';
            d.style.cssText = 'aspect-ratio:auto;flex-direction:column;justify-content:flex-end;font-size:.78rem;line-height:1.15;padding-bottom:2px;' + (bad.has('c' + c) ? 'color:#f87171' : '');
            d.innerHTML = colK[c].join('<br>');
            board.appendChild(d);
        }
        for (let r = 0; r < N; r++) {
            const d = document.createElement('div');
            d.className = 'clue';
            d.style.cssText = 'aspect-ratio:auto;font-size:.78rem;padding:0 6px;white-space:nowrap;justify-content:flex-end;' + (bad.has('r' + r) ? 'color:#f87171' : '');
            d.textContent = rowK[r].join(' ');
            board.appendChild(d);
            for (let c = 0; c < N; c++) {
                const cell = G.tap('', cur[r][c] ? 'marked' : '', () => { cur[r][c] ^= 1; revealed = false; bad = new Set(); render(); });
                if (cur[r][c]) { cell.style.background = revealed ? '#2e6b47' : '#3b5f94'; }
                board.appendChild(cell);
            }
        }
    }

    function check() {
        bad = new Set();
        for (let r = 0; r < N; r++) if (!same(blocks(cur[r]), rowK[r])) bad.add('r' + r);
        for (let c = 0; c < N; c++) if (!same(blocks(cur.map(row => row[c])), colK[c])) bad.add('c' + c);
        render();
        if (bad.size) {
            const filled = cur.some(r => r.some(v => v));
            G.status(filled ? `Liczby w ${bad.size} wierszach/kolumnach (czerwone) nie pasują.` : 'Zamaluj pola według liczb.', filled ? 'info' : 'neutral');
        } else G.status('🎉 Brawo! Obrazek odkryty.', 'success');
    }

    function solve() {
        cur = G.copy(sol); revealed = true; bad = new Set();
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    G.wire({ newGame, check, solve, reset });
})();
