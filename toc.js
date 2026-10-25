(function () {
    const links = Array.from(document.querySelectorAll('.section-index a[data-section]'));
    if (!links.length) return;

    const sections = links
        .map(function (link) {
            return {
                link: link,
                section: document.getElementById(link.dataset.section)
            };
        })
        .filter(function (entry) { return entry.section; });

    function updateIndex() {
        const readingLine = window.scrollY + window.innerHeight * 0.36;
        let active = sections[0];

        sections.forEach(function (entry) {
            if (entry.section.offsetTop <= readingLine) active = entry;
        });

        sections.forEach(function (entry) {
            if (entry === active) entry.link.setAttribute('aria-current', 'true');
            else entry.link.removeAttribute('aria-current');
        });
    }

    updateIndex();
    window.addEventListener('scroll', updateIndex, { passive: true });
    window.addEventListener('resize', updateIndex);
})();
