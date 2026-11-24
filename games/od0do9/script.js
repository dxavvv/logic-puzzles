(function() {
    // DOM references
    const selectH = document.getElementById('selectH');
    const selectW = document.getElementById('selectW');
    const btnGenerate = document.getElementById('btnGenerate');
    const btnGenerateEmpty = document.getElementById('btnGenerateEmpty');
    const btnCheck = document.getElementById('btnCheck');
    const btnSolve = document.getElementById('btnSolve');
    const btnReset = document.getElementById('btnReset');
    const boardGrid = document.getElementById('boardGrid');
    const sumsRow = document.getElementById('sumsRow');
    const statusArea = document.getElementById('statusArea');
    const statsRow = document.getElementById('statsRow');

    // Game state
    let H = 6;
    let W = 6;
    let fullSolution = null;        // unused now, but kept for internal logic if needed
    let initialPuzzle = null;
    let currentGrid = null;
    let targetSums = null;
    let isRevealed = false;
    let givenMask = null;
    let sumsEdited = false;

    // Utility functions
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function deepCopy(grid) {
        return grid.map(row => [...row]);
    }

    function setStatus(msg, type = 'neutral') {
        statusArea.textContent = msg;
        statusArea.className = 'status-area ' + type;
    }

    function updateStats() {
        if (!initialPuzzle) {
            statsRow.innerHTML = '';
            return;
        }
        const totalCells = H * W;
        let givenCount = 0;
        let userFilled = 0;
        let emptyCount = 0;
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                if (givenMask[r][c]) givenCount++;
                else if (currentGrid[r][c] !== null && !isRevealed) userFilled++;
                else if (currentGrid[r][c] === null) emptyCount++;
            }
        }
        let html = `<span>📋 Pól: ${totalCells}</span>`;
        if (givenCount > 0) html += `<span>🔒 Dane: ${givenCount}</span>`;
        if (userFilled > 0) html += `<span>✏️ Wypełnione: ${userFilled}</span>`;
        if (emptyCount > 0 && !isRevealed) html += `<span>⬜ Puste: ${emptyCount}</span>`;
        if (isRevealed) html += `<span>👁️ Odkryte</span>`;
        if (sumsEdited) html += `<span>⚠️ Sumy zmienione</span>`;
        statsRow.innerHTML = html;
    }

    // Adjacency check (8 directions)
    function hasAdjacencyConflict(grid, r, c, digit) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                    if (grid[nr][nc] === digit) return true;
                }
            }
        }
        return false;
    }

    // ==================== SOLVER ====================
    function solveGrid(inputGrid, targetSums, maxSolutions = 2, maxSteps = 800000) {
        const grid = deepCopy(inputGrid);
        const height = grid.length;
        const width = grid[0].length;
        const solutions = [];

        const colSum = new Array(width).fill(0);
        const colEmpty = new Array(width).fill(0);
        const emptyPositions = [];

        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                if (grid[r][c] === null) {
                    emptyPositions.push([r, c]);
                    colEmpty[c]++;
                } else {
                    colSum[c] += grid[r][c];
                }
            }
        }

        for (let c = 0; c < width; c++) {
            if (colSum[c] > targetSums[c]) return [];
            if (colSum[c] + 9 * colEmpty[c] < targetSums[c]) return [];
        }

        let steps = 0;

        function getCandidates(r, c) {
            const usedInRow = new Set();
            for (let cc = 0; cc < width; cc++) {
                if (grid[r][cc] !== null) usedInRow.add(grid[r][cc]);
            }
            const candidates = [];
            for (let d = 0; d <= 9; d++) {
                if (usedInRow.has(d)) continue;
                if (hasAdjacencyConflict(grid, r, c, d)) continue;
                const newColSum = colSum[c] + d;
                if (newColSum > targetSums[c]) continue;
                const remaining = targetSums[c] - newColSum;
                const left = colEmpty[c] - 1;
                if (remaining > 9 * left) continue;
                candidates.push(d);
            }
            return candidates;
        }

        function backtrack(depth) {
            if (steps++ > maxSteps) return;
            if (solutions.length >= maxSolutions) return;

            if (depth >= emptyPositions.length) {
                for (let c = 0; c < width; c++) {
                    if (colSum[c] !== targetSums[c]) return;
                }
                solutions.push(deepCopy(grid));
                return;
            }

            let bestPos = null;
            let bestCands = null;
            let minCount = Infinity;

            for (const [r, c] of emptyPositions) {
                if (grid[r][c] !== null) continue;
                const cands = getCandidates(r, c);
                if (cands.length < minCount) {
                    minCount = cands.length;
                    bestPos = [r, c];
                    bestCands = cands;
                    if (minCount === 0) return;
                    if (minCount === 1) break;
                }
            }

            if (!bestPos || minCount === 0) return;

            const [br, bc] = bestPos;
            for (const digit of bestCands) {
                grid[br][bc] = digit;
                colSum[bc] += digit;
                colEmpty[bc]--;

                backtrack(depth + 1);

                grid[br][bc] = null;
                colSum[bc] -= digit;
                colEmpty[bc]++;

                if (solutions.length >= maxSolutions) return;
            }
        }

        backtrack(0);
        return solutions;
    }

    function hasUniqueSolution(grid, targetSums) {
        const solutions = solveGrid(grid, targetSums, 2);
        return solutions.length === 1;
    }

    // ==================== COMPLETE GRID GENERATOR ====================
    function generateCompleteGrid(height, width) {
        const grid = Array.from({ length: height }, () => Array(width).fill(null));
        let backtracks = 0;
        const maxBacktracks = 500000;

        function solveCell(r, c) {
            if (backtracks > maxBacktracks) return false;
            if (r >= height) return true;
            const nextR = c + 1 >= width ? r + 1 : r;
            const nextC = c + 1 >= width ? 0 : c + 1;
            const usedInRow = new Set();
            for (let cc = 0; cc < width; cc++) {
                if (grid[r][cc] !== null) usedInRow.add(grid[r][cc]);
            }
            const available = [];
            for (let d = 0; d <= 9; d++) {
                if (!usedInRow.has(d)) available.push(d);
            }
            const shuffled = shuffle(available);
            for (const digit of shuffled) {
                if (!hasAdjacencyConflict(grid, r, c, digit)) {
                    grid[r][c] = digit;
                    if (solveCell(nextR, nextC)) return true;
                    grid[r][c] = null;
                    backtracks++;
                }
            }
            return false;
        }
        return solveCell(0, 0) ? grid : null;
    }

    function generateWithRetries(height, width, maxRetries = 20) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const grid = generateCompleteGrid(height, width);
            if (grid) return grid;
        }
        return null;
    }

    // ==================== PUZZLE CREATION ====================
    function createPuzzle(fullGrid, minRemovalPercent = 0.30, maxRemovalPercent = 0.70) {
        const height = fullGrid.length;
        const width = fullGrid[0].length;
        const totalCells = height * width;
        const sums = new Array(width).fill(0);
        for (let c = 0; c < width; c++)
            for (let r = 0; r < height; r++)
                sums[c] += fullGrid[r][c];

        const puzzle = deepCopy(fullGrid);
        const mask = Array.from({ length: height }, () => Array(width).fill(true));
        const targetRemovalPercent = minRemovalPercent + Math.random() * (maxRemovalPercent - minRemovalPercent);
        const targetRemoved = Math.floor(totalCells * targetRemovalPercent);
        const positions = [];
        for (let r = 0; r < height; r++)
            for (let c = 0; c < width; c++)
                positions.push([r, c]);
        const shuffledPositions = shuffle(positions);

        let removedCount = 0;
        for (const [r, c] of shuffledPositions) {
            if (removedCount >= targetRemoved) break;
            const saved = puzzle[r][c];
            puzzle[r][c] = null;
            mask[r][c] = false;
            if (hasUniqueSolution(puzzle, sums)) {
                removedCount++;
            } else {
                puzzle[r][c] = saved;
                mask[r][c] = true;
            }
        }

        if (removedCount < Math.floor(totalCells * 0.15) && totalCells > 4) {
            const retryPositions = shuffle(positions);
            for (const [r, c] of retryPositions) {
                if (!mask[r][c]) continue;
                if (removedCount >= Math.floor(totalCells * 0.25)) break;
                const saved = puzzle[r][c];
                puzzle[r][c] = null;
                mask[r][c] = false;
                if (hasUniqueSolution(puzzle, sums)) removedCount++;
                else {
                    puzzle[r][c] = saved;
                    mask[r][c] = true;
                }
            }
        }
        return { puzzle, mask, targetSums: sums, removedCount };
    }

    // ==================== VALIDATION ====================
    function validateCurrentGrid() {
        const errors = [];
        const errorCells = new Set();
        for (let r = 0; r < H; r++) {
            const seen = new Map();
            for (let c = 0; c < W; c++) {
                const val = currentGrid[r][c];
                if (val === null) continue;
                if (seen.has(val)) {
                    errors.push(`Wiersz ${r+1}: cyfra ${val} powtarza się.`);
                    errorCells.add(`${r},${seen.get(val)}`);
                    errorCells.add(`${r},${c}`);
                }
                seen.set(val, c);
            }
        }
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                const val = currentGrid[r][c];
                if (val === null) continue;
                const neighbors = [[r+1,c],[r+1,c-1],[r+1,c+1],[r,c+1]];
                for (const [nr,nc] of neighbors) {
                    if (nr>=0 && nr<H && nc>=0 && nc<W && currentGrid[nr][nc]===val) {
                        errors.push(`Sąsiedztwo ${val} na (${r+1},${c+1}) i (${nr+1},${nc+1}).`);
                        errorCells.add(`${r},${c}`);
                        errorCells.add(`${nr},${nc}`);
                    }
                }
            }
        }
        for (let c = 0; c < W; c++) {
            let sum = 0, filled = 0;
            for (let r = 0; r < H; r++) {
                if (currentGrid[r][c] !== null) { sum += currentGrid[r][c]; filled++; }
            }
            if (filled === H && sum !== targetSums[c]) {
                errors.push(`Kol. ${c+1}: suma ${sum} ≠ ${targetSums[c]}.`);
                for (let r=0;r<H;r++) errorCells.add(`${r},${c}`);
            } else if (filled < H) {
                let empty = H - filled;
                if (sum > targetSums[c] || sum + 9*empty < targetSums[c]) {
                    errors.push(`Kol. ${c+1}: suma niemożliwa do osiągnięcia.`);
                    for (let r=0;r<H;r++) if (currentGrid[r][c]!==null) errorCells.add(`${r},${c}`);
                }
            }
        }
        return { errors, errorCells };
    }

    // ==================== RENDER ====================
    function renderGrid() {
        boardGrid.innerHTML = '';
        sumsRow.innerHTML = '';
        boardGrid.style.gridTemplateColumns = `repeat(${W}, 1fr)`;
        sumsRow.style.gridTemplateColumns = `repeat(${W}, 1fr)`;

        if (!currentGrid) {
            for (let r = 0; r < H; r++)
                for (let c = 0; c < W; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell empty';
                    cell.textContent = '·';
                    boardGrid.appendChild(cell);
                }
            for (let c = 0; c < W; c++) {
                const sc = document.createElement('div');
                sc.className = 'sum-cell';
                sc.textContent = '?';
                sumsRow.appendChild(sc);
            }
            return;
        }

        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                const cell = document.createElement('div');
                const val = currentGrid[r][c];
                const isGiven = givenMask[r][c];
                const isUser = !isGiven && val !== null && !isRevealed;
                const isRev = isRevealed && !isGiven && val !== null;
                const isEmpty = val === null && !isRevealed;

                if (isGiven) {
                    cell.className = 'cell given';
                    cell.textContent = val;
                } else if (isRev) {
                    cell.className = 'cell revealed';
                    cell.textContent = val;
                } else if (isUser) {
                    cell.className = 'cell user-filled';
                    cell.textContent = val;
                } else if (isEmpty) {
                    cell.className = 'cell empty';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.inputMode = 'numeric';
                    input.pattern = '[0-9]';
                    input.dataset.row = r;
                    input.dataset.col = c;
                    input.addEventListener('input', handleCellInput);
                    input.addEventListener('keydown', handleCellKeydown);
                    cell.appendChild(input);
                }
                cell.dataset.row = r;
                cell.dataset.col = c;
                boardGrid.appendChild(cell);
            }
        }

        for (let c = 0; c < W; c++) {
            const sc = document.createElement('div');
            sc.className = 'sum-cell';
            const input = document.createElement('input');
            input.type = 'text';
            input.inputMode = 'numeric';
            input.pattern = '[0-9]*';
            input.value = targetSums ? targetSums[c] : '';
            input.dataset.col = c;
            input.addEventListener('input', handleSumInput);
            sc.appendChild(input);
            sumsRow.appendChild(sc);
        }

        updateStats();
    }

    function highlightErrors(errorCells) {
        document.querySelectorAll('.cell.error-highlight').forEach(el => el.classList.remove('error-highlight'));
        for (const key of errorCells) {
            const [r,c] = key.split(',').map(Number);
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) cell.classList.add('error-highlight');
        }
        if (errorCells.size) setTimeout(() => {
            document.querySelectorAll('.cell.error-highlight').forEach(el => el.classList.remove('error-highlight'));
        }, 2500);
    }

    function handleCellInput(e) {
        const input = e.target;
        const raw = input.value.replace(/[^0-9]/g, '');
        input.value = raw.slice(0,1);
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        currentGrid[r][c] = raw.length ? parseInt(raw[0]) : null;
        isRevealed = false;
        renderGrid();
        setTimeout(() => {
            const newInp = document.querySelector(`.cell.empty input[data-row="${r}"][data-col="${c}"]`);
            if (newInp) newInp.focus();
        }, 50);
    }

    function handleCellKeydown(e) {
        const input = e.target;
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        let nr=r, nc=c;
        switch(e.key) {
            case 'ArrowUp': nr = Math.max(0,r-1); break;
            case 'ArrowDown': nr = Math.min(H-1,r+1); break;
            case 'ArrowLeft': nc = Math.max(0,c-1); break;
            case 'ArrowRight': nc = Math.min(W-1,c+1); break;
            default: return;
        }
        e.preventDefault();
        const target = document.querySelector(`.cell.empty input[data-row="${nr}"][data-col="${nc}"]`);
        if (target) { target.focus(); target.select(); }
    }

    function handleSumInput(e) {
        const input = e.target;
        const c = parseInt(input.dataset.col);
        const raw = input.value.replace(/[^0-9]/g, '');
        const newSum = raw.length ? parseInt(raw) : 0;
        targetSums[c] = newSum;
        sumsEdited = true;
        isRevealed = false;
        setStatus('Sumy zmienione – teraz to własna łamigłówka.', 'info');
        updateStats();
    }

    function generate(emptyMode = false) {
        H = parseInt(selectH.value);
        W = parseInt(selectW.value);
        setStatus(emptyMode ? 'Generowanie pustej planszy...' : 'Generowanie łamigłówki...', 'info');
        btnGenerate.disabled = true;
        btnGenerateEmpty.disabled = true;
        renderEmptyPlaceholder();

        setTimeout(() => {
            const complete = generateWithRetries(H, W, 25);
            if (!complete) {
                setStatus('❌ Nie udało się wygenerować planszy.', 'error');
                btnGenerate.disabled = false;
                btnGenerateEmpty.disabled = false;
                return;
            }
            targetSums = new Array(W).fill(0);
            for (let c=0;c<W;c++) for (let r=0;r<H;r++) targetSums[c] += complete[r][c];
            sumsEdited = false;

            if (emptyMode) {
                initialPuzzle = Array.from({length:H}, ()=>Array(W).fill(null));
                givenMask = Array.from({length:H}, ()=>Array(W).fill(false));
                currentGrid = deepCopy(initialPuzzle);
                isRevealed = false;
                renderGrid();
                setStatus('📝 Pusta plansza gotowa. Możesz też edytować sumy.', 'info');
            } else {
                const result = createPuzzle(complete, 0.30, 0.70);
                initialPuzzle = deepCopy(result.puzzle);
                currentGrid = deepCopy(result.puzzle);
                targetSums = [...result.targetSums];
                givenMask = deepCopy(result.mask);
                isRevealed = false;
                renderGrid();
                setStatus(`✅ Usunięto ${result.removedCount} z ${H*W} pól. Rozwiązanie jednoznaczne.`, 'info');
            }
            btnGenerate.disabled = false;
            btnGenerateEmpty.disabled = false;
        }, 80);
    }

    function renderEmptyPlaceholder() {
        boardGrid.innerHTML = ''; sumsRow.innerHTML = '';
        boardGrid.style.gridTemplateColumns = `repeat(${W}, 1fr)`;
        sumsRow.style.gridTemplateColumns = `repeat(${W}, 1fr)`;
        for (let r=0;r<H;r++) for (let c=0;c<W;c++) {
            const cell = document.createElement('div'); cell.className='cell empty'; cell.textContent='·';
            boardGrid.appendChild(cell);
        }
        for (let c=0;c<W;c++) {
            const sc = document.createElement('div'); sc.className='sum-cell'; sc.textContent='…';
            sumsRow.appendChild(sc);
        }
        statsRow.innerHTML = '';
    }

    function checkPuzzle() {
        if (!currentGrid || !targetSums) { setStatus('Najpierw wygeneruj łamigłówkę.', 'info'); return; }
        if (isRevealed) { setStatus('Rozwiązanie pokazane. Zresetuj, by sprawdzać.', 'info'); return; }
        const { errors, errorCells } = validateCurrentGrid();
        document.querySelectorAll('.cell.error-highlight').forEach(el => el.classList.remove('error-highlight'));
        if (errors.length === 0) {
            const allFilled = currentGrid.every(row => row.every(v => v !== null));
            setStatus(allFilled ? '🎉 Gratulacje! Plansza całkowicie poprawna!' : '✅ Dotychczas poprawne.', allFilled ? 'success' : 'info');
        } else {
            setStatus(`❌ ${errors.length} błędów: ${errors[0]}`, 'error');
            highlightErrors(errorCells);
        }
    }

    function resetPuzzle() {
        if (!initialPuzzle || !givenMask) { setStatus('Najpierw wygeneruj.', 'info'); return; }
        currentGrid = deepCopy(initialPuzzle);
        isRevealed = false;
        renderGrid();
        setStatus('🔄 Plansza zresetowana.', 'neutral');
    }

    function solveForMe() {
        if (!currentGrid || !targetSums) { setStatus('Najpierw wygeneruj.', 'info'); return; }
        if (isRevealed) { setStatus('Rozwiązanie już pokazane.', 'info'); return; }
        setStatus('🤖 Solver pracuje...', 'info');
        const solutions = solveGrid(currentGrid, targetSums, 1, 800000);
        if (solutions.length === 1) {
            currentGrid = solutions[0];
            isRevealed = false;
            renderGrid();
            setStatus('🤖 Rozwiązanie znalezione!', 'info');
        } else if (solutions.length === 0) {
            setStatus('❌ Solver nie znalazł rozwiązania. Sprawdź wpisane cyfry i sumy.', 'error');
        }
    }

    // Init
    selectH.addEventListener('change', () => H = parseInt(selectH.value));
    selectW.addEventListener('change', () => W = parseInt(selectW.value));
    btnGenerate.addEventListener('click', () => generate(false));
    btnGenerateEmpty.addEventListener('click', () => generate(true));
    btnCheck.addEventListener('click', checkPuzzle);
    btnReset.addEventListener('click', resetPuzzle);
    btnSolve.addEventListener('click', solveForMe);

    H = parseInt(selectH.value); W = parseInt(selectW.value);
    renderEmptyPlaceholder();
    setStatus('Gotowy. Możesz edytować sumy kolumn (szare pola).', 'neutral');
    setTimeout(() => generate(false), 300);
})();