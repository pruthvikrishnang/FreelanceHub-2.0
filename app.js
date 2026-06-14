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
        const profileDropdown = document.createElement("div");
        profileDropdown.className = "profile-dropdown-wrapper";
        profileDropdown.innerHTML = `
            <div class="profile-nav-btn">
                <span class="nav-avatar">${getInitials(user.full_name)}</span>
                <span>${user.full_name}</span>
                <i class="fa-solid fa-chevron-down" style="font-size: 12px; margin-left: 4px; opacity: 0.7;"></i>
            </div>
            <div class="profile-dropdown">
                <a href="dashboard.html" class="dropdown-link"><i class="fa-solid fa-chart-line"></i> My Dashboard</a>
                <button type="button" class="dropdown-link logout-dropdown-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
            </div>
        `;
        signIn.replaceWith(profileDropdown);

        const logoutBtn = profileDropdown.querySelector('.logout-dropdown-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener("click", logoutUser);
        }
    }
});

function openProjectPopupFromAnywhere(){

    sessionStorage.setItem(
        "openProjectPopup",
        "true"
    );

    window.location.href =
    "projects.html";

}
