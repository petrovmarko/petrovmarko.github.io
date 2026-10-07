(function () {
    const h1 = document.querySelector('h1');
    if (!h1) return;
    const fullName = ((h1 && (h1.getAttribute('aria-label') || h1.textContent)) || '').trim();

    const bar = document.createElement('header');
    bar.id = 'mobile-bar';
    bar.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.id = 'mobile-name';
    name.className = 'typewriter';
    name.textContent = fullName;
    bar.appendChild(name);
    document.body.appendChild(bar);

    // Reveal the name bar on scroll-up; hide it on scroll-down or at the top.
    let lastY = window.scrollY;
    let shown = false;
    // Keep the bar hidden while the real heading is still on screen.
    const hideBelow = h1 ? h1.getBoundingClientRect().bottom + window.scrollY : 120;

    function setShown(v) {
        if (v === shown) return;
        shown = v;
        bar.classList.toggle('is-visible', v);
        bar.setAttribute('aria-hidden', v ? 'false' : 'true');
        // Re-type the name each time the bar appears (only when actually visible,
        // i.e. on phone-width viewports — skips wasted timers on desktop).
        if (v && window.TypeWriter && getComputedStyle(bar).display !== 'none') {
            window.TypeWriter.type(name, fullName, { speed: 48 });
        }
    }

    function onScroll() {
        const y = window.scrollY;
        if (y <= hideBelow) {
            setShown(false);
        } else if (y < lastY - 2) {          // scrolling up
            setShown(true);
        } else if (y > lastY + 2) {          // scrolling down
            setShown(false);
        }
        lastY = y;
    }

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
})();
