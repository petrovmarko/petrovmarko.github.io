(function () {
    // Streams text into an element one character at a time, LLM-style, with a
    // blinking caret. Re-calling on the same element cancels any run in flight.
    const active = new WeakMap();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function type(el, text, opts) {
        opts = opts || {};
        const speed = opts.speed || 55;
        const gen = (active.get(el) || 0) + 1;
        active.set(el, gen);

        if (reduce.matches) {
            el.textContent = text;
            return;
        }

        el.textContent = '';
        const textNode = document.createTextNode('');
        const cursor = document.createElement('span');
        cursor.className = 'tw-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        el.appendChild(textNode);
        el.appendChild(cursor);

        let i = 1;
        (function step() {
            if (active.get(el) !== gen) return; // superseded by a newer run
            if (i <= text.length) {
                textNode.textContent = text.slice(0, i);
                i++;
                setTimeout(step, speed);
            } else {
                // Let the caret blink briefly, then retire it.
                setTimeout(function () {
                    if (active.get(el) === gen && cursor.parentNode) cursor.remove();
                }, 750);
            }
        })();
    }

    window.TypeWriter = { type: type };

    // Animate the main page heading on load.
    function initHeading() {
        const span = document.querySelector('h1 .typewriter');
        if (!span) return;
        const text = span.getAttribute('data-text') || span.textContent.trim();
        type(span, text, { speed: 60 });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeading);
    } else {
        initHeading();
    }
})();
