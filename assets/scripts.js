function toggleDarkMode(el) {
    if (el.classList.contains("fa-sun")) {
        document.documentElement.setAttribute('theme', 'light');
    }
    else {
        document.documentElement.setAttribute('theme', 'dark');
    }
    el.classList.toggle("fa-sun");
}

const menu = document.querySelector(".menu");
function toggleMenu(el) {
    menu.classList.toggle("active");
    el.classList.toggle("fa-times");
}  