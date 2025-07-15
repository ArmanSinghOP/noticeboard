function adminLogin() {
  const password = prompt("Enter admin password:");
  if (password === "admin123") {
    // Set cookie for 10 minutes (600 seconds)
    document.cookie = "admin_auth=1; max-age=600; path=/";
    window.location.href = "/admin";
  } else {
    alert("Incorrect password!");
  }
}

function fetchNotices() {
  fetch("/get_notices")
    .then((res) => res.json())
    .then((data) => {
      const mapping = {
        announcements: "announcementList",
        events: "eventList",
        market: "marketList",
      };

      for (const [category, notices] of Object.entries(data)) {
        const listElement = document.getElementById(mapping[category]);
        if (!listElement) continue;
        listElement.innerHTML = "";

        notices.forEach((notice) => {
          const li = document.createElement("li");
          li.className =
            "bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition border dark:border-gray-700";
          li.innerHTML = `
            <p class="text-gray-800 dark:text-gray-100">${notice.text}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">🕒 ${new Date(notice.timestamp).toLocaleString()}</p>
          `;
          listElement.appendChild(li);
        });
      }
    })
    .catch((err) => {
      console.error("Failed to load notices:", err);
    });
}

// Auto-refresh every 30 seconds
setInterval(fetchNotices, 2000);
window.onload = fetchNotices;

// Dark mode toggle
function toggleDarkMode() {
  const html = document.documentElement;
  html.classList.toggle("dark");

  if (html.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// Apply saved theme on load
(function () {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
})();
