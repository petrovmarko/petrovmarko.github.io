(function () {
    const coda = document.querySelector('.summit-coda');
    if (!coda) return;

    const canvas = coda.querySelector('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    function seededRandom(seed) {
        let value = seed >>> 0;
        return function () {
            value += 0x6d2b79f5;
            let result = value;
            result = Math.imul(result ^ (result >>> 15), result | 1);
            result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
            return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
        };
    }

    function valueNoise(seed) {
        const random = seededRandom(seed);
        const samples = Array.from({ length: 256 }, random);

        return function (position) {
            const index = Math.floor(position);
            const fraction = position - index;
            const eased = fraction * fraction * (3 - 2 * fraction);
            const start = samples[index & 255];
            const end = samples[(index + 1) & 255];
            return start + (end - start) * eased;
        };
    }

    const ridgeNoise = [13, 29, 43, 61].map(valueNoise);
    const grainNoise = [79, 101].map(valueNoise);

    function ridgeHeight(layer, x) {
        const noise = ridgeNoise[layer];
        const frequency = 1.55 + layer * 0.92;
        const sharpPeak = 1 - Math.abs(noise(x * frequency + layer * 6.7) * 2 - 1);

        return (
            sharpPeak * 0.56 +
            noise(x * frequency * 2.2 + 3.4) * 0.29 +
            noise(x * frequency * 5.5 + 8.7) * 0.15
        );
    }

    function surfaceTexture(x, y) {
        const broad = grainNoise[0](x * 8.5 + y * 4.2);
        const fine = grainNoise[1](y * 10.8 - x * 3.1 + 5);
        const fleck = grainNoise[1](x * 22.5 + y * 16.4);
        return broad * fine * 0.62 + fleck * 0.38;
    }

    let renderedSize = '';

    function drawHills() {
        const bounds = coda.getBoundingClientRect();
        const width = Math.round(bounds.width);
        const height = Math.round(bounds.height);
        if (!width || !height) return;

        const sizeKey = width + 'x' + height;
        if (renderedSize === sizeKey) return;
        renderedSize = sizeKey;

        const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, width, height);

        const spacing = width < 600 ? 4 : 5;
        const baselines = [0.4, 0.54, 0.68, 0.86];
        const amplitudes = [0.36, 0.34, 0.32, 0.34];
        const densities = [0.22, 0.34, 0.48, 0.64];

        context.beginPath();

        for (let y = spacing / 2, row = 0; y < height; y += spacing, row += 1) {
            for (let x = spacing / 2; x < width + spacing; x += spacing) {
                const offsetX = x - (row % 2 ? spacing / 2 : 0);
                const normalizedX = offsetX / width;
                const normalizedY = y / height;
                let visibleLayer = -1;
                let ridgeTop = 0;

                for (let layer = 3; layer >= 0; layer -= 1) {
                    ridgeTop = baselines[layer] - amplitudes[layer] * ridgeHeight(layer, normalizedX);
                    if (normalizedY > ridgeTop) {
                        visibleLayer = layer;
                        break;
                    }
                }

                if (visibleLayer < 0) continue;

                const depth = Math.min(1, (normalizedY - ridgeTop) * (3.4 - visibleLayer * 0.5));
                const texture = surfaceTexture(normalizedX * (1 + visibleLayer * 0.3), normalizedY);
                const density = densities[visibleLayer] * (1 - 0.8 * Math.sqrt(depth)) + (texture - 0.5) * 0.22;
                if (density <= 0.05) continue;

                const radius = spacing * 0.5 * Math.sqrt(Math.min(0.86, density));
                context.moveTo(offsetX + radius, y);
                context.arc(offsetX, y, radius, 0, Math.PI * 2);
            }
        }

        context.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--hill-ink')
            .trim();
        context.fill();
        coda.classList.add('is-drawn');
    }

    function beginDrawing() {
        drawHills();
        if ('ResizeObserver' in window) {
            let resizeTimer;
            new ResizeObserver(function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    renderedSize = '';
                    drawHills();
                }, 150);
            }).observe(coda);
        }
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
            observer.disconnect();
            beginDrawing();
        }, { rootMargin: '400px 0px' });
        observer.observe(coda);
    } else {
        beginDrawing();
    }

    window.addEventListener('themechange', function () {
        if (!coda.classList.contains('is-drawn')) return;
        renderedSize = '';
        drawHills();
    });
})();
