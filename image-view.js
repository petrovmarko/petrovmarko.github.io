(function () {
    const image = document.querySelector('[data-cow-image]');
    const button = document.querySelector('[data-cow-view]');
    const nextLabel = document.querySelector('[data-next-view]');
    const status = document.querySelector('[data-view-status]');

    if (!image || !button || !nextLabel || !status) return;

    const modes = [
        {
            id: 'original',
            label: 'Original',
            src: 'pfp-original-hires.webp',
            alt: 'Monochrome engraved illustration of a cow overlooking a mountain lake at sunset'
        },
        {
            id: 'edges',
            label: 'Edges',
            src: 'pfp-edges-hires.webp',
            alt: 'Reddish edge rendering of a cow overlooking a mountain lake at sunset'
        },
        {
            id: 'depth',
            label: 'Depth',
            src: 'pfp-depth-hires.webp',
            alt: 'False-color depth rendering of a cow overlooking a mountain lake at sunset'
        },
        {
            id: 'normals',
            label: 'Normals',
            src: 'pfp-normals-hires.webp',
            alt: 'Surface-normal rendering of a cow overlooking a mountain lake at sunset'
        }
    ];

    let modeIndex = 0;

    modes.forEach(function (mode) {
        const preload = new Image();
        preload.src = mode.src;
    });

    function render(announce) {
        const mode = modes[modeIndex];
        const nextMode = modes[(modeIndex + 1) % modes.length];

        image.src = mode.src;
        image.alt = mode.alt;
        image.dataset.view = mode.id;
        nextLabel.textContent = nextMode.label;
        button.setAttribute('aria-label', 'View: ' + mode.label + '. Next: ' + nextMode.label);
        button.title = 'Next: ' + nextMode.label + ' (S)';

        if (announce) status.textContent = 'Current view: ' + mode.label;
    }

    function cycleMode() {
        modeIndex = (modeIndex + 1) % modes.length;
        render(true);
    }

    button.addEventListener('click', cycleMode);

    document.addEventListener('keydown', function (event) {
        const target = event.target;
        const isTyping = target instanceof HTMLElement &&
            (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

        if (event.key.toLowerCase() !== 's' || event.altKey || event.ctrlKey || event.metaKey || isTyping) return;

        event.preventDefault();
        cycleMode();
    });

    render(false);
})();
