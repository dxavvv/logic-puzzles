(function() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = 0;
            this.size = Math.random() * 1.5 + 0.5;
            this.speed = Math.random() * 0.4 + 0.2;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        update() {
            this.y += this.speed;
            if (this.y > canvas.height + 5) {
                this.reset();
                this.y = -5;
            }
        }
        draw(ctx) {
            const px = Math.max(2, Math.round(this.size * 2));
            ctx.fillStyle = `rgba(94, 184, 247, ${this.opacity})`;
            ctx.fillRect(Math.round(this.x / 3) * 3, Math.round(this.y / 3) * 3, px, px);
        }
    }

    function initParticles(count = 80) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            p.update();
            p.draw(ctx);
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        initParticles(80);
    });

    resize();
    initParticles(80);
    animate();
})();

// ---- strona główna: filtry, wyszukiwarka, losowa gra, statystyki ----
(function () {
    const CATS = {
        digits: ['od0do9', 'sudoku', 'lancuchsudoku', 'sudokurenban', 'piramidy', 'dzialania', 'ukosnedzialania', 'mniejszewieksze', 'parkiet', 'filomino', 'krzyzowkaliczbowa'],
        paint: ['obrazeklogiczny', 'mozaika', 'wsapera', 'chmury', 'tratwy', 'wieze'],
        place: ['lampki', 'architekt', 'sapernamorzu', 'latarnie', 'wielokropka', 'lightsout']
    };
    const catOf = id => Object.keys(CATS).find(c => CATS[c].includes(id)) || 'other';
    const cards = [...document.querySelectorAll('.game-card[href]')];
    cards.forEach(c => {
        const m = c.getAttribute('href').match(/games\/([^/]+)\//);
        c.dataset.id = m ? m[1] : '';
        c.dataset.cat = catOf(c.dataset.id);
    });
    const grid = document.querySelector('.games-grid');
    const soon = document.querySelector('.game-card.coming-soon');
    const search = document.getElementById('homeSearch');
    let cat = 'all';

    function apply() {
        const q = (search.value || '').trim().toLowerCase();
        let shown = 0;
        cards.forEach(c => {
            const text = (c.textContent || '').toLowerCase();
            const ok = (cat === 'all' || c.dataset.cat === cat) && (!q || text.includes(q));
            c.classList.toggle('hidden', !ok);
            if (ok) shown++;
        });
        if (soon) soon.classList.toggle('hidden', cat !== 'all' || !!q);
        let nr = document.getElementById('noResults');
        if (!shown) {
            if (!nr) { nr = document.createElement('p'); nr.id = 'noResults'; nr.className = 'no-results'; nr.textContent = 'Brak gier pasujących do wyszukiwania.'; grid.appendChild(nr); }
        } else if (nr) nr.remove();
    }

    document.getElementById('homeChips').addEventListener('click', e => {
        const b = e.target.closest('.chip');
        if (!b) return;
        cat = b.dataset.cat;
        document.querySelectorAll('#homeChips .chip').forEach(x => x.classList.toggle('on', x === b));
        apply();
    });
    search.addEventListener('input', apply);
    document.getElementById('homeRandom').addEventListener('click', () => {
        const pool = cards.filter(c => !c.classList.contains('hidden'));
        const list = pool.length ? pool : cards;
        location.href = list[Math.floor(Math.random() * list.length)].getAttribute('href');
    });

    // statystyki zapisane lokalnie w przeglądarce
    const solved = (window.FX && FX.solved()) || {};
    const total = Object.values(solved).reduce((a, b) => a + b, 0);
    const distinct = Object.keys(solved).filter(k => solved[k] > 0).length;
    const streak = window.FX ? FX.streak() : 0;
    document.getElementById('homeStats').innerHTML =
        `<span class="stat">🧩 Gry: <b>${cards.length}</b></span>` +
        `<span class="stat">🏆 Rozwiązane: <b>${total}</b></span>` +
        `<span class="stat">⭐ Różne gry: <b>${distinct}/${cards.length}</b></span>` +
        `<span class="stat">🔥 Seria dni: <b>${streak}</b></span>`;
    cards.forEach(c => {
        const n = solved[c.dataset.id];
        if (n > 0) {
            const b = document.createElement('span');
            b.className = 'solved-badge';
            b.title = 'Rozwiązano ' + n + ' razy';
            b.textContent = '⭐ ' + n;
            c.appendChild(b);
        }
    });

    // przyciski motywu i dźwięku
    if (window.FX) {
        const f = document.createElement('div');
        f.className = 'home-float';
        f.innerHTML = '<button type="button" class="chip" id="fxSound" aria-label="Dźwięk">' + (FX.sound ? '🔊' : '🔇') + '<span class="lbl"> Dźwięk</span></button>' +
            '<button type="button" class="chip" id="fxTheme" aria-label="Motyw">🎨<span class="lbl"> ' + FX.THEMES.find(t => t.id === (FX.store.get('lp:theme') || 'noc')).name + '</span></button>' +
            (window.I18N ? '<button type="button" class="chip" id="fxLang" aria-label="Language">🌐<span class="lbl"> ' + (I18N.lang === 'en' ? 'Polski' : 'English') + '</span></button>' : '');
        document.body.appendChild(f);
        document.getElementById('fxSound').addEventListener('click', () => FX.toggleSound());
        document.getElementById('fxTheme').addEventListener('click', () => FX.nextTheme());
        const lb = document.getElementById('fxLang');
        if (lb) lb.addEventListener('click', () => I18N.toggle());
    }
})();
