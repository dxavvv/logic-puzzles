/* Funkcje dla telefonów i aplikacji: ekranowa klawiatura liczbowa, zwijane zasady,
   rejestracja service workera (instalacja na ekranie głównym i gra offline). */
(function () {
    const here = document.currentScript && document.currentScript.src;
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny */ }
        }
    };
    const parts = location.pathname.split('/').filter(Boolean);
    const gi = parts.indexOf('games');
    const game = gi >= 0 && parts[gi + 1] ? parts[gi + 1].replace(/\.html$/, '') : 'home';

    // ---- zasady: zwinięte po pierwszej wizycie (widoczne tylko na wąskich ekranach) ----
    function rules() {
        const box = document.querySelector('.rules-box');
        if (!box || box.querySelector('.rb-head')) return;
        const first = box.querySelector('strong');
        if (!first) return;
        const head = document.createElement('div');
        head.className = 'rb-head';
        head.setAttribute('role', 'button');
        head.tabIndex = 0;
        first.parentNode.insertBefore(head, first);
        head.appendChild(first);
        const key = 'lp:rb:' + game;
        if (store.get(key)) box.classList.add('rb-collapsed');
        store.set(key, '1');
        const toggle = () => box.classList.toggle('rb-collapsed');
        head.addEventListener('click', toggle);
        head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    }

    // ---- ekranowa klawiatura liczbowa ----
    const forced = /[?&]numpad=1/.test(location.search);
    const coarse = forced || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
    window.NumPad = { active: coarse };

    function numpad() {
        const pad = document.createElement('div');
        pad.className = 'np';
        pad.setAttribute('role', 'group');
        pad.setAttribute('aria-label', 'Klawiatura liczbowa');
        const layout = ['1', '2', '3', '4', '5', 'x', '6', '7', '8', '9', '0', 'c'];
        const btns = {};
        layout.forEach(k => {
            const b = document.createElement('button');
            b.type = 'button';
            b.dataset.k = k;
            b.textContent = k === 'x' ? '⌫' : k === 'c' ? '▾' : k;
            if (k === 'x') { b.className = 'np-x'; b.setAttribute('aria-label', 'Backspace'); }
            if (k === 'c') { b.className = 'np-close'; b.setAttribute('aria-label', 'Close'); }
            pad.appendChild(b);
            btns[k] = b;
        });
        document.body.appendChild(pad);

        let target = null;
        const isNum = el => el && el.tagName === 'INPUT' && el.closest &&
            el.closest('#boardGrid, .board-grid, .sums-row') &&
            (el.getAttribute('inputmode') === 'numeric' || el.getAttribute('inputmode') === 'none');

        const open = () => { pad.classList.add('open'); document.documentElement.classList.add('np-open'); };
        const close = () => { pad.classList.remove('open'); document.documentElement.classList.remove('np-open'); target = null; };

        function refresh() {
            const single = !(target.maxLength > 1);
            const mn = target.dataset.min !== undefined ? +target.dataset.min : 1;
            const mx = target.dataset.max !== undefined ? +target.dataset.max : 9;
            for (let d = 0; d <= 9; d++) btns[d].disabled = single && (d < mn || d > mx);
        }

        // natywna klawiatura nie ma się pokazywać: nowym polom liczbowym ustawiamy inputmode=none
        const quiet = root => {
            if (root.nodeType !== 1) return;
            const list = root.tagName === 'INPUT' ? [root] : root.querySelectorAll('input');
            list.forEach(i => { if (isNum(i)) i.setAttribute('inputmode', 'none'); });
        };
        quiet(document.body);
        new MutationObserver(l => l.forEach(m => m.addedNodes.forEach(quiet))).observe(document.body, { childList: true, subtree: true });

        document.addEventListener('focusin', e => {
            if (!isNum(e.target)) return;
            target = e.target;
            target.setAttribute('inputmode', 'none');
            refresh(); open();
            setTimeout(() => {
                if (!target) return;
                const r = target.getBoundingClientRect(), top = pad.getBoundingClientRect().top;
                if (r.bottom > top - 8) window.scrollBy({ top: r.bottom - top + 70, behavior: 'smooth' });
            }, 60);
        });
        document.addEventListener('focusout', () => {
            setTimeout(() => { if (!isNum(document.activeElement)) close(); }, 150);
        });
        pad.addEventListener('pointerdown', e => e.preventDefault()); // nie zabieraj fokusu polu
        pad.addEventListener('click', e => {
            const b = e.target.closest('button');
            if (!b || !target || b.disabled) return;
            const k = b.dataset.k;
            if (k === 'c') { target.blur(); close(); return; }
            const maxLen = target.maxLength > 0 ? target.maxLength : 1;
            let v;
            if (k === 'x') v = '';
            else if (maxLen <= 1) v = k;
            else v = (target.value.length >= maxLen ? '' : target.value) + k;
            target.value = v;
            target.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    // ---- service worker (PWA) ----
    function pwa() {
        if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || !here) return;
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(new URL('../sw.js', here).href).catch(() => { /* brak wsparcia */ });
        });
    }

    // ---- duże plansze: komórki nie mniejsze niż ~28 px, reszta przewijana w poziomie ----
    const MIN_CELL = 28;
    function fitBoard() {
        const board = document.getElementById('boardGrid');
        if (!board || !board.classList.contains('board-grid')) return;
        const wrap = board.parentNode;
        const render = () => {
            const cols = (getComputedStyle(board).gridTemplateColumns || '').split(' ').filter(Boolean).length;
            if (!cols) return;
            const need = cols * MIN_CELL + (cols - 1) * 2 + 14;
            board.style.minWidth = need > wrap.clientWidth ? need + 'px' : '';
        };
        new MutationObserver(render).observe(board, { childList: true });
        window.addEventListener('resize', render);
        render();
    }

    function init() {
        fitBoard();
        rules();
        if (coarse) numpad();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    pwa();
})();
