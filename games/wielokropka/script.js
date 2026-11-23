(function () {
    const board = G.$('boardGrid');
    const S = 48, P = 20; // rozmiar kratki i margines (jednostki SVG)
    let R, C, clue, solH, solV, H, V, revealed, shown;

    // ---- generowanie: losowy obszar bez dziur i bez styku rogami ----
    function regionOk(inside) {
        // brak dziur: dopełnienie (z ramką) musi być spójne
        const RR = R + 2, CC = C + 2;
        const seen = G.grid(RR, CC, false);
        const st = [[0, 0]]; seen[0][0] = true;
        const isIn = (r, c) => r >= 1 && c >= 1 && r <= R && c <= C && inside[r - 1][c - 1];
        let outside = 0;
        while (st.length) {
            const [r, c] = st.pop(); outside++;
            for (const [dr, dc] of G.N4) {
                const x = r + dr, y = c + dc;
                if (x < 0 || y < 0 || x >= RR || y >= CC || seen[x][y] || isIn(x, y)) continue;
                seen[x][y] = true; st.push([x, y]);
            }
        }
        let inCount = 0;
        inside.forEach(row => row.forEach(v => { if (v) inCount++; }));
        if (outside + inCount !== RR * CC) return false;
        // brak ukośnego styku w wierzchołku
        for (let r = 0; r <= R; r++) for (let c = 0; c <= C; c++) {
            const a = isIn(r, c) ? 1 : 0, b = isIn(r, c + 1) ? 1 : 0, d = isIn(r + 1, c) ? 1 : 0, e = isIn(r + 1, c + 1) ? 1 : 0;
            if ((a && e && !b && !d) || (b && d && !a && !e)) return false;
        }
        return true;
    }

    function makeLoop() {
        for (;;) {
            const inside = G.grid(R, C, false);
            inside[G.rnd(R)][G.rnd(C)] = true;
            const target = Math.round(R * C * (0.45 + Math.random() * 0.15));
            let count = 1, guard = 0;
            while (count < target && guard++ < 4000) {
                const r = G.rnd(R), c = G.rnd(C);
                if (inside[r][c]) continue;
                if (!G.N4.some(([dr, dc]) => inside[r + dr] && inside[r + dr][c + dc])) continue;
                inside[r][c] = true;
                if (regionOk(inside)) count++; else inside[r][c] = false;
            }
            if (count >= target * 0.8 && regionOk(inside)) return inside;
        }
    }

    function newGame() {
        R = C = G.size(6);
        const inside = makeLoop();
        const at = (r, c) => (r >= 0 && c >= 0 && r < R && c < C && inside[r][c] ? 1 : 0);
        solH = G.grid(R + 1, C, false);
        solV = G.grid(R, C + 1, false);
        for (let r = 0; r <= R; r++) for (let c = 0; c < C; c++) solH[r][c] = at(r - 1, c) !== at(r, c);
        for (let r = 0; r < R; r++) for (let c = 0; c <= C; c++) solV[r][c] = at(r, c - 1) !== at(r, c);
        const p = { easy: 0.85, medium: 0.6, hard: 0.42 }[G.level()];
        clue = G.grid(R, C, -1);
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (Math.random() < p) clue[r][c] = +solH[r][c] + +solH[r + 1][c] + +solV[r][c] + +solV[r][c + 1];
        }
        reset();
    }

    function reset() {
        H = G.grid(R + 1, C, false);
        V = G.grid(R, C + 1, false);
        revealed = false; shown = false;
        render();
        G.status('Narysuj jedną zamkniętą pętlę.');
    }

    function degree(r, c) {
        let d = 0;
        if (c > 0 && H[r][c - 1]) d++;
        if (c < C && H[r][c]) d++;
        if (r > 0 && V[r - 1][c]) d++;
        if (r < R && V[r][c]) d++;
        return d;
    }

    function clueCount(r, c) { return +H[r][c] + +H[r + 1][c] + +V[r][c] + +V[r][c + 1]; }

    function render() {
        const W = C * S + 2 * P, Hh = R * S + 2 * P;
        let s = `<svg viewBox="0 0 ${W} ${Hh}" width="100%" style="display:block;touch-action:manipulation">`;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
            if (clue[r][c] < 0) continue;
            const bad = shown && clueCount(r, c) !== clue[r][c];
            const ok = shown && !bad;
            s += `<text x="${P + c * S + S / 2}" y="${P + r * S + S / 2 + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="${bad ? '#f87171' : ok ? '#5cdb8b' : '#c8d4f8'}">${clue[r][c]}</text>`;
        }
        const line = (x1, y1, x2, y2, on, t, r, c) => {
            const col = revealed ? '#5cdb8b' : '#5eb8f7';
            return (on ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>` : '') +
                `<line data-t="${t}" data-r="${r}" data-c="${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="22" style="cursor:pointer"/>`;
        };
        if (G.editing) {
            // w edytorze klikamy kratki: brak, 0, 1, 2, 3, 4, brak...
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++)
                s += `<rect data-t="e" data-r="${r}" data-c="${c}" x="${P + c * S + 2}" y="${P + r * S + 2}" width="${S - 4}" height="${S - 4}" rx="6" fill="${clue[r][c] < 0 ? '#1a1a2c' : 'transparent'}" stroke="#3a3a60" style="cursor:pointer"/>`;
            for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (clue[r][c] >= 0)
                s += `<text x="${P + c * S + S / 2}" y="${P + r * S + S / 2 + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="#f0c060" pointer-events="none">${clue[r][c]}</text>`;
        } else {
            for (let r = 0; r <= R; r++) for (let c = 0; c < C; c++)
                s += line(P + c * S, P + r * S, P + (c + 1) * S, P + r * S, H[r][c], 'h', r, c);
            for (let r = 0; r < R; r++) for (let c = 0; c <= C; c++)
                s += line(P + c * S, P + r * S, P + c * S, P + (r + 1) * S, V[r][c], 'v', r, c);
        }
        for (let r = 0; r <= R; r++) for (let c = 0; c <= C; c++)
            s += `<circle cx="${P + c * S}" cy="${P + r * S}" r="3.2" fill="#8899bb" pointer-events="none"/>`;
        s += '</svg>';
        board.innerHTML = s;
        const svg = board.firstChild;
        svg.addEventListener('click', e => {
            const t = e.target.dataset;
            if (!t || !t.t) return;
            if (t.t === 'e') {
                const r = +t.r, c = +t.c;
                clue[r][c] = clue[r][c] >= 4 ? -1 : clue[r][c] + 1;
                render();
                return;
            }
            const a = t.t === 'h' ? H : V;
            a[+t.r][+t.c] = !a[+t.r][+t.c];
            revealed = false; shown = false;
            render();
        });
    }

    function loopState() {
        let edges = 0, bad = false;
        for (let r = 0; r <= R; r++) for (let c = 0; c <= C; c++) {
            const d = degree(r, c);
            if (d !== 0 && d !== 2) bad = true;
        }
        H.forEach(row => row.forEach(v => { if (v) edges++; }));
        V.forEach(row => row.forEach(v => { if (v) edges++; }));
        if (!edges) return { edges, bad: true, single: false };
        // spójność: przejdź pętlę od dowolnego wierzchołka
        let start = null;
        for (let r = 0; r <= R && !start; r++) for (let c = 0; c <= C; c++) if (degree(r, c) > 0) { start = [r, c]; break; }
        const seen = new Set([start.join()]);
        const st = [start];
        while (st.length) {
            const [r, c] = st.pop();
            const nb = [];
            if (c > 0 && H[r][c - 1]) nb.push([r, c - 1]);
            if (c < C && H[r][c]) nb.push([r, c + 1]);
            if (r > 0 && V[r - 1][c]) nb.push([r - 1, c]);
            if (r < R && V[r][c]) nb.push([r + 1, c]);
            for (const q of nb) if (!seen.has(q.join())) { seen.add(q.join()); st.push(q); }
        }
        let verts = 0;
        for (let r = 0; r <= R; r++) for (let c = 0; c <= C; c++) if (degree(r, c) > 0) verts++;
        return { edges, bad, single: seen.size === verts };
    }

    function check() {
        shown = true;
        render();
        let wrong = 0;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (clue[r][c] >= 0 && clueCount(r, c) !== clue[r][c]) wrong++;
        const st = loopState();
        if (wrong) G.status(`Liczby w ${wrong} kratkach (czerwone) się nie zgadzają.`, 'error');
        else if (!st.edges) G.status('Najpierw narysuj pętlę.', 'info');
        else if (st.bad) G.status('Pętla ma rozgałęzienia lub nie jest domknięta.', 'info');
        else if (!st.single) G.status('Jest więcej niż jedna pętla – ma być tylko jedna.', 'error');
        else G.status('🎉 Brawo! Pętla jest poprawna.', 'success');
    }

    function solve() {
        if (!solH) { G.noSolution(); return; }
        H = G.copy(solH); V = G.copy(solV);
        revealed = true; shown = false;
        render();
        G.status('Pokazano przykładowe rozwiązanie.', 'info');
    }

    const edit = {
        params: () => [{ id: 'r', label: 'Wiersze', min: 2, max: 16, def: R }, { id: 'c', label: 'Kolumny', min: 2, max: 16, def: C }],
        hint: 'Klikaj kratki, aby ustawić liczbę 0–4 (po ilu jej bokach ma biec pętla); kolejne kliknięcia zwiększają liczbę, po 4 kratka znów jest pusta.',
        begin(p, keep) {
            if (!(keep && p.r === R && p.c === C)) { R = p.r; C = p.c; solH = solV = null; clue = G.grid(R, C, -1); }
            H = G.grid(R + 1, C, false); V = G.grid(R, C + 1, false); revealed = false; shown = false;
            render();
        },
        play() {
            if (!clue.some(row => row.some(v => v >= 0))) return 'Wpisz co najmniej jedną liczbę.';
            solH = solV = null;
            return null;
        }
    };

    G.wire({ newGame, check, solve, reset, edit });
})();
