console.log("FreelanceHub Loaded");

document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("themeToggle");

    if (!toggle) return;

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        toggle.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

    toggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        const isDark =
        document.body.classList.contains("dark-mode");

        toggle.innerHTML = isDark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        localStorage.setItem(
            "theme",
            isDark ? "dark" : "light"
        );

    });

});