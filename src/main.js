import "./style.css";

const API_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";
const app = document.querySelector("#app");

function renderLoading() {
  app.innerHTML = `
    <main class="shell shell--loading" aria-busy="true">
      <div class="loading-orbit" aria-hidden="true"></div>
      <p class="eyebrow">NASA / Astronomy Picture of the Day</p>
      <h1>Scanning the sky<span class="blink">.</span></h1>
      <p class="loading-copy">Finding today&apos;s view from beyond our atmosphere.</p>
    </main>
  `;
}

function renderError(message) {
  app.innerHTML = `
    <main class="shell shell--error" role="alert">
      <p class="eyebrow">Signal interrupted</p>
      <h1>The cosmos is taking a moment.</h1>
      <p class="error-copy">${message}</p>
      <button class="button" id="retry-button" type="button">Try again</button>
    </main>
  `;
  document.querySelector("#retry-button").addEventListener("click", loadPicture);
}

function renderPicture(data) {
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <a class="wordmark" href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noreferrer">
          <span class="wordmark-mark" aria-hidden="true">✦</span>
          <span>APOD / 01</span>
        </a>
        <span class="status"><span class="status-dot"></span>Live from NASA</span>
      </header>

      <section class="intro" aria-labelledby="page-title">
        <p class="eyebrow">Astronomy picture of the day</p>
        <h1 id="page-title">A window into<br /><em>elsewhere.</em></h1>
        <p class="intro-copy">One remarkable frame from our universe, delivered daily by NASA.</p>
      </section>

      <article class="picture-card">
        <div class="media-frame" id="media-frame"></div>
        <div class="picture-details">
          <div class="details-heading">
            <div>
              <p class="date" id="picture-date"></p>
              <h2 id="picture-title"></h2>
            </div>
            <a class="external-link" id="source-link" href="#" target="_blank" rel="noreferrer" aria-label="Open original media">↗</a>
          </div>
          <p class="explanation" id="picture-explanation"></p>
          <p class="credit" id="picture-credit"></p>
        </div>
      </article>

      <footer class="footer">
        <span>Keep looking up.</span>
        <button class="text-button" id="refresh-button" type="button">Refresh picture <span aria-hidden="true">↗</span></button>
      </footer>
    </main>
  `;

  const mediaFrame = document.querySelector("#media-frame");
  const mediaUrl = data.url || data.hdurl;
  const media = data.media_type === "image" ? document.createElement("img") : document.createElement("iframe");
  media.className = "cosmic-media";

  if (data.media_type === "image") {
    // NASA's HD image host can reject browser requests, while the standard URL is public.
    media.src = mediaUrl;
    media.alt = data.title;
    media.loading = "eager";
  } else {
    media.src = data.url;
    media.title = data.title;
    media.allowFullscreen = true;
    media.loading = "lazy";
  }

  mediaFrame.append(media);
  document.querySelector("#picture-date").textContent = formatDate(data.date);
  document.querySelector("#picture-title").textContent = data.title;
  document.querySelector("#picture-explanation").textContent = data.explanation;
  document.querySelector("#picture-credit").textContent = data.copyright ? `Image credit: ${data.copyright}` : "Image credit: NASA";
  document.querySelector("#source-link").href = mediaUrl;
  document.querySelector("#refresh-button").addEventListener("click", loadPicture);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`));
}

async function loadPicture() {
  renderLoading();

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`NASA returned an error (${response.status}).`);
    const data = await response.json();
    if (!data.url || !data.title) throw new Error("The picture data was incomplete.");
    renderPicture(data);
  } catch (error) {
    renderError(error.message || "We could not reach the NASA image service.");
  }
}

loadPicture();