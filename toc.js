(function () {
    const middle = document.getElementById('middle');
    if (!middle) return;
    const headings = Array.from(middle.querySelectorAll('h2'));
    if (!headings.length) return;

    // Give each section heading an anchor id derived from its text.
    headings.forEach(function (h) {
        if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    });

    // "About" points at the top of the page, then one entry per section.
    const entries = [{ title: 'About', el: null }].concat(
        headings.map(function (h) { return { title: h.textContent.trim(), el: h }; })
    );

    const nav = document.createElement('nav');
    nav.id = 'toc';
    nav.setAttribute('aria-label', 'Contents');

    const label = document.createElement('span');
    label.className = 'toc-label';
    label.textContent = 'Contents';
    nav.appendChild(label);

    // Plain anchors — native navigation, smoothed by `scroll-behavior` in CSS.
    const links = entries.map(function (entry) {
        const a = document.createElement('a');
        a.className = 'toc-link';
        a.href = entry.el ? '#' + entry.el.id : '#top';
        a.textContent = entry.title;
        nav.appendChild(a);
        return a;
    });

    document.body.appendChild(nav);

    // Scroll spy: the active section is the last heading above the reading
    // line (30% down the viewport). At the very bottom of the page the last
    // section wins even if its heading never reaches that line.
    function update() {
        const readingLine = window.scrollY + window.innerHeight * 0.3;
        let active = 0;
        headings.forEach(function (h, i) {
            if (h.offsetTop <= readingLine) active = i + 1;
        });
        if (window.scrollY < 8) active = 0;
        else if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4)
            active = entries.length - 1;
        links.forEach(function (l, i) { l.classList.toggle('is-active', i === active); });
    }

    update();
    // Capture on document so the spy hears scrolls regardless of which
    // element ends up being the scroller.
    document.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
})();
