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
    toggle.textContent = theme === "light" ? "Light" : "Dark";

    if (skipAnimation) {
        setPortrait(theme);
        return;
    }

    if (selfie) {
        selfie.classList.add("flip");
        setTimeout(() => setPortrait(theme), 250);
        setTimeout(() => selfie.classList.remove("flip"), 600);
    } else {
        setPortrait(theme);
    }

    localStorage.setItem("theme", theme);
}

const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const stored = localStorage.getItem("theme");
setTheme(stored || systemTheme, true);

toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    setTheme(next, false);
});
