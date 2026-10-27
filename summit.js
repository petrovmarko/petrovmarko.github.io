(function () {
    const stage = document.querySelector('.sketch-card');
    if (!stage) return;

    const canvas = stage.querySelector('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const illustration = new Image();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sourceCanvas = document.createElement('canvas');
    const sourceContext = sourceCanvas.getContext('2d');
    const maskCanvas = document.createElement('canvas');
    const maskContext = maskCanvas.getContext('2d');

    let animationFrame = 0;
    let imageReady = false;
    let started = false;
    let onScreen = false;
    let progress = 0;
    let previousTime = 0;
    let renderedSize = '';
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let strokes = [];
    let totalLength = 1;

    // Deliberate plotter order: ridges, foreground, trees, sky, then hikers.
    // Coordinates are ratios so the same motion works at every screen size.
    const drawingPlan = [
        { width: 0.055, paths: [
            [[0.29, 0.54], [0.39, 0.46], [0.49, 0.36], [0.55, 0.41], [0.63, 0.31], [0.70, 0.42], [0.78, 0.39], [0.86, 0.49], [0.97, 0.41]],
            [[0.27, 0.60], [0.40, 0.53], [0.53, 0.46], [0.65, 0.48], [0.77, 0.51], [0.91, 0.56]],
            [[0.30, 0.66], [0.44, 0.60], [0.58, 0.58], [0.72, 0.61], [0.86, 0.64], [0.98, 0.62]]
        ]},
        { width: 0.075, paths: [
            [[0.02, 0.63], [0.14, 0.71], [0.27, 0.79], [0.43, 0.84], [0.59, 0.84], [0.76, 0.82], [0.91, 0.74], [0.99, 0.70]],
            [[0.01, 0.72], [0.14, 0.80], [0.29, 0.88], [0.47, 0.90], [0.66, 0.89], [0.84, 0.83], [0.99, 0.77]],
            [[0.01, 0.83], [0.16, 0.89], [0.33, 0.94], [0.52, 0.95], [0.70, 0.94], [0.86, 0.90], [0.99, 0.85]],
            [[0.04, 0.94], [0.20, 0.96], [0.38, 0.98], [0.58, 0.98], [0.78, 0.96], [0.96, 0.93]]
        ]},
        { width: 0.065, paths: [
            [[0.04, 0.58], [0.04, 0.12]], [[0.07, 0.61], [0.07, 0.05]],
            [[0.10, 0.64], [0.10, 0.14]], [[0.13, 0.67], [0.13, 0.05]],
            [[0.16, 0.70], [0.16, 0.15]], [[0.20, 0.73], [0.20, 0.31]],
            [[0.24, 0.76], [0.24, 0.39]], [[0.28, 0.78], [0.28, 0.46]],
            [[0.33, 0.80], [0.33, 0.56]], [[0.37, 0.81], [0.37, 0.58]]
        ]},
        { width: 0.032, paths: [
            [[0.19, 0.10], [0.31, 0.11]], [[0.38, 0.12], [0.54, 0.12]],
            [[0.55, 0.16], [0.71, 0.16]], [[0.83, 0.12], [0.98, 0.12]],
            [[0.18, 0.20], [0.36, 0.21]], [[0.52, 0.23], [0.72, 0.23]],
            [[0.78, 0.27], [0.97, 0.27]], [[0.27, 0.30], [0.51, 0.30]],
            [[0.63, 0.32], [0.86, 0.32]]
        ]},
        { width: 0.058, paths: [
            [[0.50, 0.86], [0.50, 0.67]], [[0.57, 0.86], [0.57, 0.67]],
            [[0.64, 0.86], [0.64, 0.67]], [[0.71, 0.85], [0.71, 0.65]],
            [[0.43, 0.86], [0.43, 0.73]], [[0.78, 0.80], [0.78, 0.64]]
        ]}
    ];

    function makeStroke(points, strokeWidth, pace) {
        const scaled = points.map(function (point) {
            return [point[0] * width, point[1] * height];
        });
        let length = 0;
        for (let index = 1; index < scaled.length; index += 1) {
            length += Math.hypot(
                scaled[index][0] - scaled[index - 1][0],
                scaled[index][1] - scaled[index - 1][1]
            );
        }
        return {
            points: scaled,
            width: strokeWidth * height,
            length: length,
            timingLength: length * (pace || 1)
        };
    }

    function configureCanvas() {
        const bounds = stage.getBoundingClientRect();
        const nextWidth = Math.round(bounds.width);
        const nextHeight = Math.round(bounds.height);
        if (!nextWidth || !nextHeight) return false;

        const sizeKey = nextWidth + 'x' + nextHeight;
        if (sizeKey === renderedSize) return true;
        renderedSize = sizeKey;
        width = nextWidth;
        height = nextHeight;
        pixelRatio = Math.min(2, window.devicePixelRatio || 1);

        [canvas, sourceCanvas, maskCanvas].forEach(function (target) {
            target.width = Math.round(width * pixelRatio);
            target.height = Math.round(height * pixelRatio);
        });
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        sourceContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        sourceContext.clearRect(0, 0, width, height);
        sourceContext.drawImage(illustration, 0, 0, width, height);

        // Remove the paper color before revealing the artwork. This ensures the
        // virtual pen exposes only real ink, never the edge of its reveal mask.
        sourceContext.setTransform(1, 0, 0, 1, 0, 0);
        const sourcePixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        for (let index = 0; index < sourcePixels.data.length; index += 4) {
            const red = sourcePixels.data[index];
            const green = sourcePixels.data[index + 1];
            const blue = sourcePixels.data[index + 2];
            const orangeInk = red > 120 && red > green * 1.2 && red > blue * 1.55;

            if (orangeInk) {
                const coverage = Math.min(1, (255 - Math.min(green, blue)) / 150);
                sourcePixels.data[index] = 197;
                sourcePixels.data[index + 1] = 113;
                sourcePixels.data[index + 2] = 48;
                sourcePixels.data[index + 3] = Math.round(255 * coverage);
                continue;
            }

            const lightness = red * 0.2126 + green * 0.7152 + blue * 0.0722;
            const coverage = Math.min(1, Math.max(0, (252 - lightness) / 235));
            sourcePixels.data[index] = 9;
            sourcePixels.data[index + 1] = 12;
            sourcePixels.data[index + 2] = 10;
            sourcePixels.data[index + 3] = Math.round(255 * coverage);
        }
        sourceContext.putImageData(sourcePixels, 0, 0);

        strokes = [];
        drawingPlan.forEach(function (phase) {
            phase.paths.forEach(function (path) {
                strokes.push(makeStroke(path, phase.width, phase.pace));
            });
        });
        totalLength = strokes.reduce(function (sum, stroke) {
            return sum + stroke.timingLength;
        }, 0) || 1;
        return true;
    }

    function addStrokePart(target, stroke, amount) {
        if (amount <= 0) return;
        const stop = stroke.length * Math.min(1, amount);
        let covered = 0;
        const points = stroke.points;

        target.beginPath();
        target.moveTo(points[0][0], points[0][1]);
        for (let index = 1; index < points.length; index += 1) {
            const previous = points[index - 1];
            const current = points[index];
            const segment = Math.hypot(current[0] - previous[0], current[1] - previous[1]);
            if (covered + segment <= stop) {
                target.lineTo(current[0], current[1]);
                covered += segment;
                continue;
            }
            const fraction = Math.max(0, Math.min(1, (stop - covered) / (segment || 1)));
            target.lineTo(
                previous[0] + (current[0] - previous[0]) * fraction,
                previous[1] + (current[1] - previous[1]) * fraction
            );
            break;
        }
        target.lineWidth = stroke.width;
        target.lineCap = 'round';
        target.lineJoin = 'round';
        target.strokeStyle = '#fff';
        target.stroke();
    }

    function renderScene(amount) {
        if (!imageReady || !configureCanvas()) return;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, width, height);

        if (amount >= 1 || reduceMotion.matches) {
            // Finish on the untouched source so the approved illustration is
            // pixel-for-pixel identical once the drawing is complete.
            context.drawImage(illustration, 0, 0, width, height);
            return;
        }

        maskContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        maskContext.clearRect(0, 0, width, height);

        let remaining = amount * totalLength;
        strokes.forEach(function (stroke) {
            const localAmount = Math.max(0, Math.min(1, remaining / stroke.timingLength));
            addStrokePart(maskContext, stroke, localAmount);
            remaining -= stroke.timingLength;
        });

        context.drawImage(sourceCanvas, 0, 0, width, height);
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(maskCanvas, 0, 0, width, height);
        context.globalCompositeOperation = 'source-over';

        // A light construction drawing develops beneath the darker plotter
        // strokes. Every part of the composition is therefore present during
        // the animation, and it reaches full strength before the final frame.
        context.globalAlpha = Math.min(1, Math.pow(amount / 0.86, 1.7));
        context.drawImage(sourceCanvas, 0, 0, width, height);
        context.globalAlpha = 1;
    }

    function frame(now) {
        animationFrame = 0;
        if (!previousTime) previousTime = now;
        progress = Math.min(1, progress + Math.min(50, now - previousTime) / 6200);
        previousTime = now;
        renderScene(progress);

        if (progress >= 1) {
            stage.classList.add('is-drawn');
            return;
        }
        if (onScreen) animationFrame = requestAnimationFrame(frame);
    }

    function resume() {
        if (!started || !onScreen || animationFrame || progress >= 1) return;
        previousTime = performance.now();
        animationFrame = requestAnimationFrame(frame);
    }

    function begin() {
        if (started || !imageReady) return;
        started = true;
        stage.classList.add('is-drawing');
        if (reduceMotion.matches) {
            progress = 1;
            renderScene(progress);
            stage.classList.add('is-drawn');
            return;
        }
        resume();
    }

    illustration.addEventListener('load', function () {
        imageReady = true;
        configureCanvas();

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                const entry = entries[entries.length - 1];
                onScreen = entry.isIntersecting;
                if (entry.intersectionRatio >= 0.25) begin();
                if (onScreen) resume();
                else if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = 0;
                }
            }, { threshold: [0, 0.25] }).observe(stage);
        } else {
            onScreen = true;
            begin();
        }
    });
    illustration.src = 'summit-sketch-simple.webp';

    if ('ResizeObserver' in window) {
        let resizeTimer;
        new ResizeObserver(function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                renderedSize = '';
                renderScene(progress);
            }, 120);
        }).observe(stage);
    }

    reduceMotion.addEventListener('change', function () {
        if (!reduceMotion.matches || !imageReady) return;
        progress = 1;
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        renderScene(progress);
        stage.classList.add('is-drawn');
    });

    window.addEventListener('pagehide', function () {
        cancelAnimationFrame(animationFrame);
    });
})();
