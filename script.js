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
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(94, 184, 247, ${this.opacity})`;
            ctx.fill();
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