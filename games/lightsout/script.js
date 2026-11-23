(function () {
    const boardGrid = document.getElementById('boardGrid');
    const statusArea = document.getElementById('statusArea');
    const statsRow = document.getElementById('statsRow');
    const selectSize = document.getElementById('selectSize');

    let R = 5, C = 5;
    let editing = false;
    let grid = [];
    let initial = [];
    let moves = 0;
    let solved = false;

    const copy = g => g.map(r => [...r]);

    function setStatus(msg, type = 'neutral') {
        statusArea.textContent = msg;
        statusArea.className = 'status-area ' + type;
    }

    function press(g, r, c) {
        for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const rr = r + dr, cc = c + dc;
            if (rr >= 0 && rr < R && cc >= 0 && cc < C) g[rr][cc] ^= 1;
        }
    }

    // Plansza powstaje z losowych naciśnięć od stanu "wszystko zgaszone" – zawsze jest rozwiązywalna.
    function generate() {
        let g;
        do {
            g = Array.from({ length: R }, () => Array(C).fill(0));
            for (let r = 0; r < R; r++)
                for (let c = 0; c < C; c++)
                    if (Math.random() < 0.5) press(g, r, c);
        } while (g.every(row => row.every(v => v === 0)));
        return g;
    }

    // Eliminacja Gaussa w GF(2): zwraca wektor naciśnięć albo null.
    function solve(g) {
        const n = R * C;
        const rows = [];
        for (let i = 0; i < n; i++) {
            const r = Math.floor(i / C), c = i % C;
            const tmp = Array.from({ length: R }, () => Array(C).fill(0));
            press(tmp, r, c);
            const row = new Array(n + 1).fill(0);
            for (let j = 0; j < n; j++) row[j] = tmp[Math.floor(j / C)][j % C];
            row[n] = g[r][c];
            rows.push(row);
        }
        const pivotCol = [];
        let rank = 0;
        for (let col = 0; col < n && rank < n; col++) {
            let p = -1;
            for (let i = rank; i < n; i++) if (rows[i][col]) { p = i; break; }
            if (p < 0) continue;
            [rows[rank], rows[p]] = [rows[p], rows[rank]];
            for (let i = 0; i < n; i++)
                if (i !== rank && rows[i][col])
                    for (let k = col; k <= n; k++) rows[i][k] ^= rows[rank][k];
            pivotCol.push(col);
            rank++;
        }
        for (let i = rank; i < n; i++) if (rows[i][n]) return null;
        const x = new Array(n).fill(0);
        pivotCol.forEach((col, i) => { x[col] = rows[i][n]; });
        return x;
    }

    function render() {
        boardGrid.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
        boardGrid.innerHTML = '';
        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                const b = document.createElement('button');
                b.className = 'light' + (grid[r][c] ? ' on' : '');
                b.setAttribute('aria-label', `Lampka ${r + 1}, ${c + 1}: ${grid[r][c] ? 'włączona' : 'wyłączona'}`);
                b.dataset.r = r;
                b.dataset.c = c;
                boardGrid.appendChild(b);
            }
        }
        const lit = grid.flat().filter(Boolean).length;
        statsRow.innerHTML = `<span>🎯 Ruchy: ${moves}</span><span>💡 Zapalone: ${lit}</span>`;
    }

    let custom = false;

    function start(newBoard, keepCustom) {
        if (newBoard && !keepCustom) custom = false;
        startInner(newBoard);
    }

    function startInner(newBoard) {
        leaveEditor();
        if (newBoard && !custom) R = C = parseInt(selectSize.value, 10);
        if (newBoard) initial = generate();
        grid = copy(initial);
        moves = 0;
        solved = false;
        render();
        setStatus('Zgaś wszystkie światła.');
    }

    boardGrid.addEventListener('click', e => {
        const b = e.target.closest('.light');
        if (editing && b) {
            const r = +b.dataset.r, c = +b.dataset.c;
            initial[r][c] ^= 1;
            grid = copy(initial);
            render();
            return;
        }
        if (!b || solved) return;
        press(grid, +b.dataset.r, +b.dataset.c);
        moves++;
        render();
        if (grid.every(row => row.every(v => v === 0))) {
            solved = true;
            setStatus(`🎉 Brawo! Rozwiązane w ${moves} ruchach.`, 'success');
        } else {
            setStatus('Zgaś wszystkie światła.');
        }
    });

    // --- edytor własnej planszy ---
    const row = document.getElementById('btnNew').parentNode;
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Własna plansza';
    row.appendChild(editBtn);
    const panel = document.createElement('div');
    panel.className = 'edit-panel';
    panel.hidden = true;
    panel.style.cssText = 'margin:14px auto;padding:12px 14px;border:1px dashed #c49a5a;border-radius:12px;max-width:560px';
    panel.innerHTML = '<div style="font-weight:700;margin-bottom:8px">✏️ Ułóż własną planszę</div>' +
        '<div class="controls-row"><label>Wiersze: <input type="number" id="loR" min="1" max="12" value="5" style="width:4.2em"></label>' +
        '<label>Kolumny: <input type="number" id="loC" min="1" max="12" value="5" style="width:4.2em"></label></div>' +
        '<div style="font-size:.85rem;opacity:.85;margin:8px 0">Klikaj lampki, aby ustawić, które mają być zapalone na starcie. Plansza musi dać się rozwiązać.</div>' +
        '<div class="controls-row"><button class="primary" id="loPlay">▶ Zagraj</button><button id="loClear">🧹 Wyczyść</button><button class="danger" id="loCancel">✖ Anuluj</button></div>';
    row.parentNode.insertBefore(panel, row.nextSibling);
    const hideBtns = () => ['btnNew', 'btnHint', 'btnReset'].forEach(id => { document.getElementById(id).style.display = editing ? 'none' : ''; });

    function leaveEditor() {
        if (!editing) return;
        editing = false; panel.hidden = true; editBtn.style.display = ''; hideBtns();
    }
    function sizeFromInputs() {
        const clamp = (id) => { const e = document.getElementById(id); let v = parseInt(e.value, 10) || 1; v = Math.max(1, Math.min(12, v)); e.value = v; return v; };
        R = clamp('loR'); C = clamp('loC');
    }
    function blank() {
        initial = Array.from({ length: R }, () => Array(C).fill(0));
        grid = copy(initial); moves = 0; solved = false;
        render();
    }
    editBtn.addEventListener('click', () => {
        editing = true; panel.hidden = false; editBtn.style.display = 'none'; hideBtns();
        document.getElementById('loR').value = R; document.getElementById('loC').value = C;
        grid = copy(initial); render();
        setStatus('Tryb edycji: klikaj lampki, aby ustawić układ startowy.', 'info');
    });
    ['loR', 'loC'].forEach(id => document.getElementById(id).addEventListener('change', () => { sizeFromInputs(); blank(); }));
    document.getElementById('loClear').addEventListener('click', () => { sizeFromInputs(); blank(); });
    document.getElementById('loCancel').addEventListener('click', () => { custom = false; start(true); });
    document.getElementById('loPlay').addEventListener('click', () => {
        sizeFromInputs();
        if (initial.length !== R || initial[0].length !== C) blank();
        if (initial.every(r => r.every(v => v === 0))) return setStatus('Zapal przynajmniej jedną lampkę.', 'error');
        if (!solve(initial)) return setStatus('Tego układu nie da się rozwiązać – zmień zapalone lampki.', 'error');
        custom = true;
        start(false);
        setStatus('Własna plansza – zgaś wszystkie światła.', 'info');
    });

    document.getElementById('btnNew').addEventListener('click', () => start(true));
    document.getElementById('btnReset').addEventListener('click', () => start(false));
    selectSize.addEventListener('change', () => { custom = false; start(true); });

    document.getElementById('btnHint').addEventListener('click', () => {
        if (solved) return;
        const x = solve(grid);
        if (!x) return setStatus('Brak rozwiązania z tego stanu.', 'error');
        const idx = x.findIndex(v => v === 1);
        const btn = boardGrid.children[idx];
        btn.style.borderColor = 'var(--accent)';
        btn.style.boxShadow = '0 0 14px var(--accent-glow)';
            setStatus(`Podpowiedź: kliknij zaznaczoną lampkę (wiersz ${Math.floor(idx / C) + 1}, kolumna ${idx % C + 1}).`, 'info');
    });

    start(true);
})();
