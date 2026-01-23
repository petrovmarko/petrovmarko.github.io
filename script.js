const toggle = document.getElementById("theme-toggle");
const root = document.documentElement;
const selfie = document.getElementById("selfie");

function setPortrait(theme) {
    if (!selfie) {
        return;
    }
    const next = theme === "light" ? selfie.dataset.light : selfie.dataset.dark;
    if (next) {
        selfie.src = next;
    }
}

function setTheme(theme, skipAnimation) {
    root.setAttribute("data-theme", theme);
    toggle.textContent = theme === "light" ? "☀" : "☾";

    if (skipAnimation) {
        setPortrait(theme);
        return;
    }

    if (selfie) {
        selfie.classList.add("swap");
        setTimeout(() => setPortrait(theme), 140);
        setTimeout(() => selfie.classList.remove("swap"), 480);
    } else {
        setPortrait(theme);
    }

    localStorage.setItem("theme", theme);
}

const stored = localStorage.getItem("theme");
setTheme(stored || "light", true);

const textTargets = document.querySelectorAll(
    ".visit-card h1, .visit-card h2, .visit-card h3, .visit-card p, .visit-card li, .visit-card span, .visit-card a"
);

function startTextReveal() {
    textTargets.forEach((element) => {
        element.classList.remove("text-reveal");
        element.style.animationDelay = "";
    });
    // Force reflow so the animation restarts.
    void document.body.offsetHeight;
    textTargets.forEach((element, index) => {
        element.classList.add("text-reveal");
        element.style.animationDelay = `${0.12 + index * 0.03}s`;
    });
}

startTextReveal();

toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    setTheme(next, false);
    startTextReveal();
});
