async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

async function loadPosts() {
  const container = document.getElementById("posts");
  container.innerHTML = "Loading…";

  try {
    const index = await fetchJSON("posts/index.json");
    const posts = await Promise.all(index.map(file => fetchJSON(`posts/${file}`)));

    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = "";
    posts.forEach((post, i) => {
      const card = document.createElement("article");
      card.className = "post-card";
      card.style.animationDelay = `${i * 60}ms`;

      const thumb = post.thumbnail
        ? `<div class="post-thumb"><img src="${post.thumbnail}" alt="${post.title} thumbnail"></div>`
        : "";

      const date = new Date(post.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      card.innerHTML = `
        <a href="post.html?id=${encodeURIComponent(post.id)}">
          ${thumb}
          <div class="post-body">
            <div class="post-meta">
              <span>${post.author || "Unknown"}</span>
              <span>${date}</span>
            </div>
            <h2 class="post-title">${post.title}</h2>
            <p class="post-excerpt">${post.excerpt || ""}</p>
          </div>
        </a>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "Failed to load posts.";
  }
}

document.addEventListener("DOMContentLoaded", loadPosts);


