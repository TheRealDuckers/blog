async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadPost() {
  const id = getQueryParam("id");
  const container = document.getElementById("post");

  if (!id) {
    container.textContent = "No post specified.";
    return;
  }

  try {
    const post = await fetchJSON(`posts/${id}.json`);
    const date = new Date(post.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const hero = post.heroImage
      ? `<div class="post-page-hero"><img src="${post.heroImage}" alt="${post.title} hero"></div>`
      : "";

    const html = marked.parse(post.content || "");

    container.innerHTML = `
      <header class="post-page-header">
        <h1 class="post-page-title">${post.title}</h1>
        <p class="post-page-meta">
          ${post.author || "Unknown"} • ${date}
        </p>
      </header>
      ${hero}
      <section class="post-content">
        ${html}
      </section>
    `;
  } catch (err) {
    console.error(err);
    container.textContent = "Failed to load post.";
  }
}

document.addEventListener("DOMContentLoaded", loadPost);
