window.API_BASE = "http://localhost:5000";

console.log("FreelanceHub Loaded");

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser"));
    }
    catch (err) {
        return null;
    }
}

function getInitials(name = "User") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("") || "U";
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    if (toggle) {
        toggle.innerHTML = document.body.classList.contains("dark-mode")
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

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
    }

    const user = getCurrentUser();
    const signIn = document.querySelector(".signin-btn");
    const navRight = document.querySelector(".nav-right");

    if (user && signIn) {
        signIn.href = "dashboard.html";
        signIn.classList.add("profile-nav-btn");
        signIn.innerHTML = `
            <span class="nav-avatar">${getInitials(user.full_name)}</span>
            <span>${user.full_name}</span>
        `;
    }

    if (user && navRight && !document.querySelector(".logout-btn")) {
        const logout = document.createElement("button");
        logout.type = "button";
        logout.className = "logout-btn";
        logout.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
        logout.title = "Logout";
        logout.addEventListener("click", logoutUser);
        navRight.appendChild(logout);
    }
});
