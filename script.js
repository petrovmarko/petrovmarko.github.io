const speed = 25;
const elements = Array.from(document.querySelectorAll("[data-type]"));
async function typeElement(el) {
    const text = el.textContent;
    el.textContent = "";
    el.style.visibility = "visible";
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    el.appendChild(cursor);

    for (let char of text) {
        cursor.insertAdjacentText("beforebegin", char);
        await new Promise(r => setTimeout(r, speed));
    }

    cursor.remove();
}

async function startTyping() {
    for (let el of elements) {
        await typeElement(el);
    }
}

window.addEventListener("load", startTyping);

const toggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function setTheme(theme, skip) {
    const root = document.documentElement;
    if (skip) {
        if (theme === "light") {
            root.setAttribute("data-theme", "light");
            toggle.textContent = "🌞";
        } else {
            root.removeAttribute("data-theme");
            toggle.textContent = "🌙";
        }
        return;
    }
    const selfie = document.getElementById("selfie");

    selfie.classList.add("flip");
    setTimeout(() => {
        // switch theme halfway through flip
        if (theme === "light") {
            root.setAttribute("data-theme", "light");
            toggle.textContent = "🌞";
        } else {
            root.removeAttribute("data-theme");
            toggle.textContent = "🌙";
        }
    }, 300);

    setTimeout(() => {
        selfie.classList.remove("flip");
    }, 600);

    localStorage.setItem("theme", theme);
}
let sys = "light";
if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    sys = "light"
} else {
    sys = "dark"
}
console.log(sys, localStorage.getItem("system_theme"));

if (localStorage.getItem("system_theme") != sys) {
    localStorage.setItem("system_theme", sys)
    localStorage.setItem("theme", sys);
}

setTheme(localStorage.getItem("theme"), true);

toggle.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", false);
});


window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    document.getElementById("footer").style.transform =
      `translateY(${scrollY * 0.1}px)`;
  });

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });