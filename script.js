// Scroll-reactive scientific background + responsive navigation.
(() => {
    const canvas = document.getElementById("particle-background");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, particles = [];
    const pointer = { x: -1000, y: -1000 };
    const spacing = 115;

    function resize() {
        if (!canvas || !ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(90, Math.max(32, Math.floor((width * height) / 17000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - .5) * .24,
            vy: (Math.random() - .5) * .24,
            r: Math.random() * 1.5 + .5,
            phase: Math.random() * Math.PI * 2
        }));
        draw();
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        const time = performance.now() * .00035;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!reduceMotion) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = i % 3 === 0 ? "rgba(84, 225, 232, .62)" : "rgba(132, 139, 255, .56)";
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j], dx = p.x - q.x, dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < spacing) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(92, 156, 255, ${(1 - dist / spacing) * .12})`;
                    ctx.lineWidth = .7; ctx.stroke();
                }
            }
            const dx = p.x - pointer.x, dy = p.y - pointer.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 145) {
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pointer.x, pointer.y);
                ctx.strokeStyle = `rgba(84, 225, 232, ${(1 - dist / 145) * .2})`;
                ctx.lineWidth = .8; ctx.stroke();
            }
        }
        if (!reduceMotion) requestAnimationFrame(draw);
    }

    if (canvas && ctx) {
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
        window.addEventListener("pointerleave", () => { pointer.x = -1000; pointer.y = -1000; });
        resize();
    }

    // The background glows move at different rates relative to the scroll position.
    const orbs = Array.from(document.querySelectorAll(".scroll-orb"));
    function updateParallax() {
        const y = window.scrollY || 0;
        orbs.forEach((orb, index) => {
            const speeds = [0.18, -0.12, 0.08];
            const speed = speeds[index] ?? 0.1;
            const drift = Math.sin(y * 0.002 + index * 1.6) * 18;
            orb.style.transform = `translate3d(0, ${-y * speed + drift}px, 0)`;
        });
        if (canvas) {
            // Shift the particle canvas subtly with scroll to reinforce the parallax effect.
            canvas.style.transform = `translate3d(0, ${-y * 0.035}px, 0)`;
        }
    }
    window.addEventListener("scroll", () => requestAnimationFrame(updateParallax), { passive: true });
    updateParallax();

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
        });
        navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        }));
    }
    const year = document.getElementById("current-year");
    if (year) year.textContent = new Date().getFullYear();
})();
