(function () {
    const board = G.$('boardGrid');
    const COLORS = ['#ff6b6b', '#ff9a4d', '#ffd35c', '#5cdb8b', '#5eb8f7', '#b58cff', '#ff9ad5', '#9af0f5', '#d9a066', '#f2f4ff'];
    let n, k, pegs, start, sel, moves, minMoves;

    const classic = (nn, kk) => Array.from({ length: kk }, (_, i) => (i === 0 ? Array.from({ length: nn }, (_, j) => nn - j) : []));
    const copy = p => p.map(a => [...a]);
    const solved = p => p[p.length - 1].length === n;

    // najmniejsza liczba ruchów dla 3 słupków z dowolnego układu (BFS po układach: słupek każdego krążka)
    function bfs3(p) {
        const pegOf = Array(n + 1).fill(0);
        p.forEach((stack, i) => stack.forEach(d => { pegOf[d] = i; }));
        const enc = a => { let x = 0; for (let d = 1; d <= n; d++) x = x * 3 + a[d]; return x; };
        const goal = enc(Array(n + 1).fill(2));
        const first = enc(pegOf);
        if (first === goal) return 0;
        const seen = new Map([[first, 0]]);
        let frontier = [pegOf.slice()];
        let dist = 0;
        while (frontier.length) {
            dist++;
            const next = [];
            for (const s of frontier) {
                const tops = [Infinity, Infinity, Infinity];
                for (let d = n; d >= 1; d--) tops[s[d]] = d; // najmniejszy krążek na słupku
                for (let a = 0; a < 3; a++) {
                    const d = tops[a];
                    if (d === Infinity) continue;
                    for (let b = 0; b < 3; b++) {
                        if (a === b || d > tops[b]) continue;
                        const t = s.slice(); t[d] = b;
                        const key = enc(t);
                        if (seen.has(key)) continue;
                        if (key === goal) return dist;
                        seen.set(key, dist);
                        next.push(t);
                    }
                }
            }
            frontier = next;
        }
        return -1;
    }

    // Frame–Stewart: minimalna (przypuszczalnie) liczba ruchów dla k słupków i klasycznego startu
    function frameStewart(nn, kk) {
        const memo = {};
        const f = (m, q) => {
            if (m <= 1) return m;
            if (q === 3) return Math.pow(2, m) - 1;
            const key = m + ':' + q;
            if (memo[key] !== undefined) return memo[key];
            let best = Infinity;
            for (let t = 1; t < m; t++) best = Math.min(best, 2 * f(t, q) + f(m - t, q - 1));
            return (memo[key] = best);
        };
        return f(nn, kk);
    }

    const computeMin = () => (k === 3 ? bfs3(pegs) : frameStewart(n, k));

    function newGame() {
        n = G.size(4); k = 3;
        const lv = G.level();
        let p, d;
        if (lv === 'easy') { p = classic(n, 3); d = bfs3(p); }
        else {
            const want = lv === 'hard' ? Math.floor((Math.pow(2, n) - 1) * 0.6) : Math.floor((Math.pow(2, n) - 1) * 0.3);
            let tries = 0;
            do {
                p = Array.from({ length: 3 }, () => []);
                for (let disc = n; disc >= 1; disc--) p[G.rnd(3)].push(disc);
                d = bfs3(p);
            } while ((d < Math.max(2, want) || p[2].length === n) && ++tries < 200);
        }
        start = copy(p);
        reset();
    }

    function reset() {
        pegs = copy(start);
        sel = -1; moves = 0;
        minMoves = computeMin();
        render();
        G.status('Przenieś wszystkie krążki na ostatni słupek.');
    }

    function stats() {
        G.stats(`<span>🎯 Ruchy: ${moves}</span><span>🏆 Minimum: ${minMoves}</span>`);
    }

    function render() {
        const W = k * 130, base = 14, ph = n * 20 + 34, H = ph + base + 26;
        let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;touch-action:manipulation;max-width:640px;margin:0 auto" shape-rendering="crispEdges">`;
        for (let i = 0; i < k; i++) {
            const cx = i * 130 + 65;
            const target = i === k - 1;
            s += `<rect x="${cx - 40}" y="${H - base - 8}" width="80" height="${base}" fill="#8a5a30"/>`;
            s += `<rect x="${cx - 4}" y="${H - base - 8 - ph}" width="8" height="${ph}" fill="${target ? '#d9a066' : '#8a5a30'}"/>`;
            pegs[i].forEach((d, j) => {
                const w = 22 + d * 8;
                const top = sel === i && j === pegs[i].length - 1;
                const y = top ? H - base - 8 - ph - 22 : H - base - 8 - (j + 1) * 20;
                s += `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="18" fill="${COLORS[(d - 1) % COLORS.length]}" stroke="${top ? '#ffd35c' : '#151528'}" stroke-width="${top ? 3 : 2}"/>`;
            });
            s += `<rect data-peg="${i}" x="${i * 130 + 2}" y="0" width="126" height="${H}" fill="transparent" style="cursor:pointer"/>`;
        }
        s += '</svg>';
        board.innerHTML = s;
        board.firstChild.addEventListener('click', onClick);
        stats();
    }

    function onClick(e) {
        if (G.editing) return;
        const t = e.target.dataset;
        if (!t || t.peg === undefined) return;
        const p = +t.peg;
        if (sel < 0) {
            if (pegs[p].length) { sel = p; render(); }
            return;
        }
        if (p === sel) { sel = -1; render(); return; }
        const d = pegs[sel][pegs[sel].length - 1];
        const top = pegs[p][pegs[p].length - 1];
        if (top !== undefined && top < d) {
            sel = -1; render();
            G.status('Nie można położyć większego krążka na mniejszym.', 'error');
            return;
        }
        pegs[sel].pop(); pegs[p].push(d);
        sel = -1; moves++;
        render();
        if (solved(pegs)) {
            G.status(moves === minMoves ? `🎉 Brawo! Rozwiązane w ${moves} ruchach – to optymalnie!` : `🎉 Brawo! Rozwiązane w ${moves} ruchach.`, 'success');
        } else G.status('Przenieś wszystkie krążki na ostatni słupek.');
    }

    function check() {
        if (solved(pegs)) G.status(`🎉 Brawo! Rozwiązane w ${moves} ruchach.`, 'success');
        else G.status('Przenieś wszystkie krążki na ostatni słupek.', 'info');
    }

    function solve() {
        pegs = Array.from({ length: k }, (_, i) => (i === k - 1 ? Array.from({ length: n }, (_, j) => n - j) : []));
        sel = -1;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'n', label: 'Krążki (1–10)', min: 1, max: 10, def: n }, { id: 'k', label: 'Słupki (3–5)', min: 3, max: 5, def: k }],
        hint: 'Wybierz liczbę krążków i słupków. Wszystkie krążki startują na pierwszym słupku; trzeba je przenieść na ostatni.',
        begin(p, keep) {
            n = p.n; k = p.k;
            start = classic(n, k);
            pegs = copy(start); sel = -1; moves = 0; minMoves = computeMin();
            render();
        },
        play() { start = classic(n, k); return null; }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
