(function () {
    const middle = document.getElementById('middle');
    if (!middle) return;

    const h1 = document.querySelector('h1');
    const fullName = ((h1 && (h1.getAttribute('aria-label') || h1.textContent)) || '').trim();

    // Sections: "About" (top of page) plus every h2. toc.js has usually already
    // assigned the heading ids; fall back to deriving them here just in case.
    const headings = Array.from(middle.querySelectorAll('h2'));
    const entries = [{ title: 'About', id: null }].concat(
        headings.map(function (h) {
            if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return { title: h.textContent.trim(), id: h.id };
        })
    );

    // --- Top bar ---
    const bar = document.createElement('header');
    bar.id = 'mobile-bar';
    bar.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.id = 'mobile-name';
    name.className = 'typewriter';
    name.textContent = fullName;
    bar.appendChild(name);

    const toggle = document.createElement('button');
    toggle.id = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open sections');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    bar.appendChild(toggle);

    document.body.appendChild(bar);

    // --- Slide-down menu + backdrop ---
    const backdrop = document.createElement('div');
    backdrop.id = 'mobile-menu-backdrop';

    const menu = document.createElement('div');
    menu.id = 'mobile-menu';

    const label = document.createElement('span');
    label.className = 'mobile-menu-label';
    label.textContent = 'Contents';
    menu.appendChild(label);

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Sections');
    entries.forEach(function (e) {
        const a = document.createElement('a');
        a.className = 'mobile-menu-link';
        a.href = e.id ? '#' + e.id : '#top';
        a.textContent = e.title;
        a.addEventListener('click', closeMenu);
        nav.appendChild(a);
    });
    menu.appendChild(nav);

    document.body.appendChild(backdrop);
    document.body.appendChild(menu);

    // --- Menu open / close ---
    function openMenu() {
        document.body.classList.add('menu-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close sections');
        // Keep the bar (and its close button) pinned while the menu is open.
        setShown(true);
    }
    function closeMenu() {
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open sections');
    }
    toggle.addEventListener('click', function () {
        if (document.body.classList.contains('menu-open')) closeMenu();
        else openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    // --- Reveal the bar on scroll-up, hide on scroll-down or at the top ---
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
            closeMenu();
        }
        lastY = y;
    }

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
})();
