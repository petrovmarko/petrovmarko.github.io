(function () {
    const terms = document.querySelectorAll('.glossary-term');
    if (!terms.length) return;

    let openWrap = null;
    let closeTimer = null;

    // Real phones report `hover: none`; only wire hover/focus behaviour on
    // devices that actually hover, so touch devices use tap-to-toggle alone
    // (avoids the synthetic mouseenter+click double-fire that would open then
    // immediately re-close the card on a single tap).
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function buildCard(term) {
        const card = document.createElement('span');
        card.className = 'glossary-card';
        card.setAttribute('role', 'tooltip');

        const def = document.createElement('span');
        def.className = 'glossary-def';
        def.textContent = term.dataset.def || '';
        card.appendChild(def);

        if (term.dataset.link) {
            const link = document.createElement('a');
            link.className = 'glossary-link';
            link.href = term.dataset.link;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = (term.dataset.linkLabel || 'Learn more') + ' →';
            card.appendChild(link);
        }
        return card;
    }

    function open(wrap) {
        clearTimeout(closeTimer);
        if (openWrap && openWrap !== wrap) close(openWrap);

        wrap.classList.add('is-open');
        wrap.querySelector('.glossary-term').setAttribute('aria-expanded', 'true');

        // Keep the card within the viewport horizontally.
        const card = wrap.querySelector('.glossary-card');
        card.style.left = '';
        const rect = card.getBoundingClientRect();
        const pad = 12;
        if (rect.right > window.innerWidth - pad) {
            card.style.left = -(rect.right - (window.innerWidth - pad)) + 'px';
        } else if (rect.left < pad) {
            card.style.left = (pad - rect.left) + 'px';
        }
        openWrap = wrap;
    }

    function close(wrap) {
        wrap.classList.remove('is-open');
        wrap.querySelector('.glossary-term').setAttribute('aria-expanded', 'false');
        if (openWrap === wrap) openWrap = null;
    }

    function scheduleClose(wrap) {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(function () { close(wrap); }, 140);
    }

    terms.forEach(function (term) {
        const wrap = term.closest('.glossary');
        const card = buildCard(term);
        wrap.appendChild(card);
        term.setAttribute('aria-expanded', 'false');
        term.setAttribute('aria-haspopup', 'true');

        if (canHover) {
            wrap.addEventListener('mouseenter', function () { open(wrap); });
            wrap.addEventListener('mouseleave', function () { scheduleClose(wrap); });
            card.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
            card.addEventListener('mouseleave', function () { scheduleClose(wrap); });
            term.addEventListener('focus', function () { open(wrap); });
            term.addEventListener('blur', function () { scheduleClose(wrap); });
        }

        // Tap / click / keyboard (Enter and Space fire click on a button)
        // toggles the card on every device.
        term.addEventListener('click', function (e) {
            e.preventDefault();
            if (wrap.classList.contains('is-open')) close(wrap);
            else open(wrap);
        });
    });

    document.addEventListener('click', function (e) {
        if (openWrap && !openWrap.contains(e.target)) close(openWrap);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && openWrap) close(openWrap);
    });
})();
