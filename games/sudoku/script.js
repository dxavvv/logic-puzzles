(function() {
    const boardGrid = document.getElementById('boardGrid');
    const statusArea = document.getElementById('statusArea');
    const statsRow = document.getElementById('statsRow');
    const maxDigitSpan = document.getElementById('maxDigit');
    const selectSize = document.getElementById('selectSize');
    const selectDifficulty = document.getElementById('selectDifficulty');
    const btnGenerate = document.getElementById('btnGenerate');
    const btnGenerateEmpty = document.getElementById('btnGenerateEmpty');
    const btnCheck = document.getElementById('btnCheck');
    const btnSolve = document.getElementById('btnSolve');
    const btnReset = document.getElementById('btnReset');

    let N = 9;                // rozmiar planszy
    let blokW = 3, blokH = 3; // wymiary bloku
    let initialPuzzle = null;
    let currentGrid = null;
    let givenMask = null;
    let isRevealed = false;
    let solution = null;

    // ----- konfiguracja rozmiaru -----
    function updateBlockDimensions() {
        N = parseInt(selectSize.value);
        if (N === 6) { blokW = 2; blokH = 3; }
        else if (N === 9) { blokW = 3; blokH = 3; }
        else if (N === 12) { blokW = 3; blokH = 4; }
        maxDigitSpan.textContent = N;
    }

    function deepCopy(grid) { return grid.map(row => [...row]); }

    function setStatus(msg, type = 'neutral') {
        statusArea.textContent = msg;
        statusArea.className = 'status-area ' + type;
    }

    function updateStats() {
        if (!initialPuzzle) { statsRow.innerHTML = ''; return; }
        let given = 0, user = 0, empty = 0;
        for (let r = 0; r < N; r++)
            for (let c = 0; c < N; c++) {
                if (givenMask[r][c]) given++;
                else if (currentGrid[r][c] !== 0) user++;
                else empty++;
            }
        statsRow.innerHTML = `<span>🔒 Dane: ${given}</span><span>✏️ Twoje: ${user}</span><span>⬜ Puste: ${empty}</span>`;
    }

    // ==================== SOLVER ====================
    function isValid(grid, r, c, num) {
        for (let i = 0; i < N; i++) {
            if (grid[r][i] === num && i !== c) return false;
            if (grid[i][c] === num && i !== r) return false;
        }
        const br = Math.floor(r / blokH) * blokH;
        const bc = Math.floor(c / blokW) * blokW;
        for (let i = br; i < br + blokH; i++)
            for (let j = bc; j < bc + blokW; j++)
                if ((i !== r || j !== c) && grid[i][j] === num) return false;
        return true;
    }

    function solve(grid, maxSolutions = 2) {
        const solutions = [];
        const copy = deepCopy(grid);
        function backtrack() {
            if (solutions.length >= maxSolutions) return;
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (copy[r][c] === 0) {
                        for (let n = 1; n <= N; n++) {
                            if (isValid(copy, r, c, n)) {
                                copy[r][c] = n;
                                backtrack();
                                copy[r][c] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            solutions.push(deepCopy(copy));
        }
        backtrack();
        return solutions;
    }

    // ==================== GENERATOR ====================
    function generateFullGrid() {
        const grid = Array.from({ length: N }, () => Array(N).fill(0));
        const nums = Array.from({ length: N }, (_, i) => i + 1);
        function fill(r, c) {
            if (r === N) return true;
            if (c === N) return fill(r + 1, 0);
            const shuffled = nums.sort(() => Math.random() - 0.5);
            for (const n of shuffled) {
                if (isValid(grid, r, c, n)) {
                    grid[r][c] = n;
                    if (fill(r, c + 1)) return true;
                    grid[r][c] = 0;
                }
            }
            return false;
        }
        return fill(0, 0) ? grid : null;
    }

    function createPuzzle(fullGrid, difficulty) {
        const counts = { easy: 0.5, medium: 0.35, hard: 0.25 }; // proporcja podanych
        const targetGiven = Math.floor(N * N * counts[difficulty]);
        const puzzle = deepCopy(fullGrid);
        const mask = Array.from({ length: N }, () => Array(N).fill(true));
        const positions = [];
        for (let r = 0; r < N; r++)
            for (let c = 0; c < N; c++)
                positions.push([r, c]);
        const shuffled = positions.sort(() => Math.random() - 0.5);
        let removed = 0;
        const toRemove = N * N - targetGiven;

        for (const [r, c] of shuffled) {
            if (removed >= toRemove) break;
            const saved = puzzle[r][c];
            puzzle[r][c] = 0;
            mask[r][c] = false;
            if (solve(puzzle, 2).length === 1) removed++;
            else { puzzle[r][c] = saved; mask[r][c] = true; }
        }
        // dodatkowa próba, jeśli mało pól usunięto
        if (removed < toRemove * 0.8) {
            for (const [r, c] of shuffled) {
                if (removed >= toRemove) break;
                if (!mask[r][c]) continue;
                const saved = puzzle[r][c];
                puzzle[r][c] = 0;
                mask[r][c] = false;
                if (solve(puzzle, 2).length === 1) removed++;
                else { puzzle[r][c] = saved; mask[r][c] = true; }
            }
        }
        return { puzzle, mask };
    }

    function generateNew(emptyMode = false) {
        updateBlockDimensions();
        setStatus(emptyMode ? 'Przygotowywanie pustej planszy...' : 'Generowanie...', 'info');
        btnGenerate.disabled = btnGenerateEmpty.disabled = true;
        setTimeout(() => {
            const full = generateFullGrid();
            if (!full) {
                setStatus('Błąd generowania – spróbuj ponownie.', 'error');
                btnGenerate.disabled = btnGenerateEmpty.disabled = false;
                return;
            }
            solution = full;
            if (emptyMode) {
                initialPuzzle = Array.from({ length: N }, () => Array(N).fill(0));
                givenMask = Array.from({ length: N }, () => Array(N).fill(false));
                currentGrid = deepCopy(initialPuzzle);
                isRevealed = false;
                renderGrid();
                setStatus('Pusta plansza gotowa. Wpisz cyfry i sprawdź, czy istnieje rozwiązanie.', 'info');
            } else {
                const diff = selectDifficulty.value;
                const { puzzle, mask } = createPuzzle(full, diff);
                initialPuzzle = deepCopy(puzzle);
                currentGrid = deepCopy(puzzle);
                givenMask = deepCopy(mask);
                isRevealed = false;
                renderGrid();
                const givenCount = mask.flat().filter(Boolean).length;
                setStatus(`Nowa plansza (${N}×${N}, ${diff}). Podanych: ${givenCount}.`, 'success');
            }
            btnGenerate.disabled = btnGenerateEmpty.disabled = false;
        }, 50);
    }

    // ==================== RENDER ====================
    function renderGrid() {
        boardGrid.innerHTML = '';
        boardGrid.style.gridTemplateColumns = `repeat(${N}, 1fr)`;

        if (!currentGrid) {
            for (let r = 0; r < N; r++)
                for (let c = 0; c < N; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell empty';
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    boardGrid.appendChild(cell);
                }
            return;
        }

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const cell = document.createElement('div');
                cell.dataset.row = r;
                cell.dataset.col = c;
                const val = currentGrid[r][c];
                const isGiven = givenMask[r][c];
                const isUser = !isGiven && val !== 0 && !isRevealed;
                const isRev = isRevealed && !isGiven && val !== 0;

                if (isGiven) {
                    cell.className = 'cell given';
                    cell.textContent = val;
                } else if (isRev) {
                    cell.className = 'cell revealed';
                    cell.textContent = val;
                } else if (isUser) {
                    cell.className = 'cell user-filled';
                    cell.textContent = val;
                } else {
                    cell.className = 'cell empty';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.inputMode = 'numeric';
                    input.pattern = `[1-${N}]`;
                    input.dataset.row = r;
                    input.dataset.col = c;
                    input.addEventListener('input', handleInput);
                    input.addEventListener('keydown', handleKeydown);
                    cell.appendChild(input);
                }

                // grube linie bloków
                if (c % blokW === blokW - 1 && c < N - 1) cell.style.borderRight = '2px solid #5a5a90';
                if (c % blokW === 0 && c > 0) cell.style.borderLeft = '2px solid #5a5a90';
                if (r % blokH === blokH - 1 && r < N - 1) cell.style.borderBottom = '2px solid #5a5a90';
                if (r % blokH === 0 && r > 0) cell.style.borderTop = '2px solid #5a5a90';

                boardGrid.appendChild(cell);
            }
        }
        updateStats();
    }

    function handleInput(e) {
        const input = e.target;
        const raw = input.value.replace(new RegExp(`[^1-${N}]`, 'g'), '');
        input.value = raw.slice(0, 1);
        const r = +input.dataset.row, c = +input.dataset.col;
        currentGrid[r][c] = raw.length ? +raw[0] : 0;
        isRevealed = false;
        renderGrid();
        setTimeout(() => {
            const inp = document.querySelector(`.cell.empty input[data-row="${r}"][data-col="${c}"]`);
            if (inp) inp.focus();
        }, 50);
    }

    function handleKeydown(e) {
        const input = e.target;
        const r = +input.dataset.row, c = +input.dataset.col;
        let nr = r, nc = c;
        switch(e.key) {
            case 'ArrowUp': nr = Math.max(0, r-1); break;
            case 'ArrowDown': nr = Math.min(N-1, r+1); break;
            case 'ArrowLeft': nc = Math.max(0, c-1); break;
            case 'ArrowRight': nc = Math.min(N-1, c+1); break;
            default: return;
        }
        e.preventDefault();
        const target = document.querySelector(`.cell.empty input[data-row="${nr}"][data-col="${nc}"]`);
        if (target) { target.focus(); target.select(); }
    }

    // ==================== CHECK ====================
    function checkPuzzle() {
        if (!currentGrid) return;
        // szybkie sprawdzenie konfliktów
        const conflicts = new Set();
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const val = currentGrid[r][c];
                if (val === 0) continue;
                // wiersz, kolumna, blok
                for (let i = 0; i < N; i++) {
                    if (i !== c && currentGrid[r][i] === val) { conflicts.add(`${r},${c}`); conflicts.add(`${r},${i}`); }
                    if (i !== r && currentGrid[i][c] === val) { conflicts.add(`${r},${c}`); conflicts.add(`${i},${c}`); }
                }
                const br = Math.floor(r/blokH)*blokH, bc = Math.floor(c/blokW)*blokW;
                for (let i = br; i < br+blokH; i++)
                    for (let j = bc; j < bc+blokW; j++)
                        if ((i!==r || j!==c) && currentGrid[i][j] === val) {
                            conflicts.add(`${r},${c}`); conflicts.add(`${i},${j}`);
                        }
            }
        }

        document.querySelectorAll('.cell.error-highlight').forEach(el => el.classList.remove('error-highlight'));
        for (const key of conflicts) {
            const [r,c] = key.split(',').map(Number);
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) cell.classList.add('error-highlight');
        }

        // solver
        const solutions = solve(currentGrid, 1);
        const solvable = solutions.length > 0;

        if (conflicts.size > 0) {
            setStatus('❌ Znaleziono konflikty – popraw zaznaczone pola.', 'error');
            setTimeout(() => document.querySelectorAll('.cell.error-highlight').forEach(el => el.classList.remove('error-highlight')), 3000);
        } else if (!solvable) {
            setStatus('❌ Brak możliwego rozwiązania przy tych cyfrach.', 'error');
            // podświetlamy całą planszę delikatnie?
        } else {
            const filled = currentGrid.flat().filter(v => v !== 0).length;
            if (filled === N*N) setStatus('🎉 Gratulacje! Sudoku rozwiązane!', 'success');
            else setStatus('✅ Poprawnie – istnieje co najmniej jedno rozwiązanie.', 'success');
        }
    }

    function resetPuzzle() {
        if (!initialPuzzle || !givenMask) return;
        currentGrid = deepCopy(initialPuzzle);
        isRevealed = false;
        renderGrid();
        setStatus('Plansza zresetowana.', 'neutral');
    }

    function solvePuzzle() {
        if (!currentGrid) return;
        const solutions = solve(currentGrid, 1);
        if (solutions.length === 1) {
            currentGrid = solutions[0];
            isRevealed = false;
            renderGrid();
            setStatus('🤖 Plansza rozwiązana.', 'success');
        } else {
            setStatus('❌ Brak rozwiązania – sprawdź wpisane cyfry.', 'error');
        }
    }

    // inicjalizacja
    selectSize.addEventListener('change', () => {
        updateBlockDimensions();
    });
    btnGenerate.addEventListener('click', () => generateNew(false));
    btnGenerateEmpty.addEventListener('click', () => generateNew(true));
    btnCheck.addEventListener('click', checkPuzzle);
    btnSolve.addEventListener('click', solvePuzzle);
    btnReset.addEventListener('click', resetPuzzle);

    updateBlockDimensions();
    generateNew(false);
})();