function fetchNotices() {
  fetch("/get_notices")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("noticesContainer");
      container.innerHTML = "";

      for (const [category, notices] of Object.entries(data)) {
        const section = document.createElement("section");
        section.className = "bg-gray-100 p-4 rounded shadow";
        section.innerHTML = `<h2 class="text-lg font-semibold mb-2">${category.toUpperCase()}</h2>`;
        const ul = document.createElement("ul");

        notices.forEach((notice) => {
          const li = document.createElement("li");
          li.className = "bg-white p-4 rounded shadow mb-2 flex justify-between items-center";
          li.innerHTML = `
            <span>${notice.text}</span>
            <div class="space-x-2">
              <button onclick="editNotice('${category}', '${notice.id}', '${notice.text.replace(/'/g, "\\'")}')"
                      class="text-sm bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
              <button onclick="deleteNotice('${category}', '${notice.id}')"
                      class="text-sm bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
            </div>
          `;
          ul.appendChild(li);
        });

        section.appendChild(ul);
        container.appendChild(section);
      }
    })
    .catch((err) => {
      console.error("Error loading notices:", err);
    });
}

function submitNotice(e) {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const text = document.getElementById("noticeText").value.trim();
  if (!text) return;

  fetch("/post_notice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, text }),
  })
    .then(() => {
      document.getElementById("noticeText").value = "";
      fetchNotices();
    });
}

function deleteNotice(category, id) {
  if (!id || id === "undefined") {
    console.error("Invalid ID passed to deleteNotice:", category, id);
    return;
  }

  fetch(`/delete_notice/${category}/${id}`, {
    method: "DELETE",
  }).then(fetchNotices);
}

function editNotice(category, id, oldText) {
  const newText = prompt("Edit notice:", oldText);
  if (!newText || newText === oldText) return;

  fetch(`/edit_notice/${category}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: newText }),
  }).then(fetchNotices);
}


function logout() {
  document.cookie = "admin_auth=; max-age=0; path=/"; // Clear the cookie
  window.location.href = "/user";
}

window.onload = fetchNotices;
