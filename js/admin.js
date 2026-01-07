const API_BASE = "https://your-backend.example.com"; // change this

function wrapSelection(textarea, wrapper) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);
  textarea.value = before + wrapper + selected + wrapper + after;
  textarea.focus();
  textarea.selectionStart = start + wrapper.length;
  textarea.selectionEnd = end + wrapper.length;
}

function prefixLine(textarea, prefix) {
  const start = textarea.selectionStart;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  textarea.value =
    value.slice(0, lineStart) + prefix + value.slice(lineStart);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
}

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const value = textarea.value;
  textarea.value = value.slice(0, start) + text + value.slice(start);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

async function login(password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.body;
  const loginStatus = document.getElementById("login-status");
  const statusEl = document.getElementById("status");
  const content = document.getElementById("content");
  const preview = document.getElementById("preview");
  const togglePreviewBtn = document.getElementById("toggle-preview");

  // Start in login mode
  root.classList.add("login-visible");

  document.getElementById("login").addEventListener("click", async () => {
    const password = document.getElementById("password").value;
    loginStatus.textContent = "Logging in…";
    try {
      await login(password);
      loginStatus.textContent = "";
      root.classList.remove("login-visible");
      root.classList.add("editor-visible");
    } catch (err) {
      console.error(err);
      loginStatus.textContent = "Invalid password.";
    }
  });

  // Toolbar
  document.querySelectorAll(".toolbar button").forEach(btn => {
    const wrap = btn.dataset.wrap;
    const prefix = btn.dataset.prefix;
    const insert = btn.dataset.insert;

    if (btn.id === "toggle-preview") return;

    btn.addEventListener("click", () => {
      if (wrap) {
        wrapSelection(content, wrap);
      } else if (prefix) {
        prefixLine(content, prefix);
      } else if (insert) {
        insertAtCursor(content, insert);
      }
      updatePreview();
    });
  });

  function updatePreview() {
    if (preview.style.display === "none") return;
    preview.innerHTML = marked.parse(content.value || "");
  }

  content.addEventListener("input", updatePreview);

  togglePreviewBtn.addEventListener("click", () => {
    const isVisible = preview.style.display !== "none";
    if (isVisible) {
      preview.style.display = "none";
      togglePreviewBtn.classList.remove("active");
    } else {
      preview.style.display = "block";
      togglePreviewBtn.classList.add("active");
      updatePreview();
    }
  });

  document.getElementById("publish").addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const excerpt = document.getElementById("excerpt").value.trim();
    const thumbFile = document.getElementById("thumb").files[0];
    const heroFile = document.getElementById("hero").files[0];
    const contentVal = content.value;

    if (!title || !author || !contentVal || !thumbFile) {
      statusEl.textContent = "Title, author, content, and thumbnail are required.";
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("author", author);
    form.append("excerpt", excerpt);
    form.append("content", contentVal);
    form.append("thumbnail", thumbFile);
    if (heroFile) form.append("hero", heroFile);

    statusEl.textContent = "Publishing…";

    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        body: form,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed");
      statusEl.textContent = "Published!";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Failed to publish.";
    }
  });
});
