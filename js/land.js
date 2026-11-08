// The Land page: geology, landscape, water and wildlife of the parish.
// Content comes from content/land.json; illustrations from js/land-art.js
// (or hand-painted images listed in ART_IMAGES in config.js).
import { art } from "./art.js";
import { ART_IMAGES } from "./config.js";
import { LAND_DRAWINGS, CROSS_SECTION_LABELS } from "./land-art.js";
import { esc, store } from "./util.js";

let cache = null;
export function loadLand() {
  if (!cache) {
    cache = fetch("content/land.json")
      .then((r) => { if (!r.ok) throw new Error(`land.json: ${r.status}`); return r.json(); })
      .catch((err) => { console.warn("Couldn’t load the Land page", err); cache = null; return null; });
  }
  return cache;
}

const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
const paras = (list = []) => list.map((p) => `<p>${esc(p)}</p>`).join("");

function sourcesBlock(sources = [], check) {
  if (!sources.length && !check) return "";
  return `<details class="land-sources">
    <summary>Sources${sources.length ? ` (${sources.length})` : ""}</summary>
    ${check ? `<p class="check"><b>Still to check:</b> ${esc(check)}</p>` : ""}
    <ul>${sources.map((s) => `<li>${s.url ? ext(s.url, s.label) : esc(s.label)}</li>`).join("")}</ul>
  </details>`;
}

function crossSection(cs) {
  const label = esc(cs.label || "Cross-section through the parish from the Vale to the Ridgeway");
  if (ART_IMAGES["cross-section"]) {
    return `<img class="xsec-art" src="${ART_IMAGES["cross-section"]}" alt="${label}">`;
  }
  const d = LAND_DRAWINGS["cross-section"];
  if (!d) return "";
  const labels = (CROSS_SECTION_LABELS || []).map((l) =>
    `<text x="${l.x}" y="${l.y}" text-anchor="${l.anchor || "start"}" class="xl ${esc(l.kind || "")}">${esc(l.text)}</text>`).join("");
  return `<svg class="xsec-art" viewBox="${d.vb}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${d.svg}${labels}</svg>`;
}

function speciesList(species = [], further) {
  return `<section class="species" aria-labelledby="species-h">
    <h3 id="species-h">What you might see</h3>
    <ul>${species.map((s) => `<li>
      <span class="sp-art">${s.art ? art(s.art, { width: 48, height: 48 }) : ""}</span>
      <span class="sp-text"><span class="sp-name">${esc(s.name)} <span class="sp-sci">(${esc(s.scientific)})</span></span>
      <span class="sp-when">${esc(s.when)}. ${esc(s.habitat)}.</span></span>
    </li>`).join("")}</ul>
    ${further ? `<p class="further">${esc(further)}</p>` : ""}
  </section>`;
}

function redKitePanel(k) {
  if (!k) return "";
  return `<section class="kite" aria-labelledby="kite-h">
    <div class="kite-head">
      <div><p class="kicker">A success story</p><h3 id="kite-h">${esc(k.title)}</h3></div>
      ${art("red-kite", { width: 96, height: 96 })}
    </div>
    ${paras(k.body)}
    ${k.lookFor ? `<p class="look"><b>Look for</b> ${esc(k.lookFor)}</p>` : ""}
    ${sourcesBlock(k.sources)}
  </section>`;
}

function sectionHtml(s, data, open) {
  const living = s.id === "living";
  return `<details class="land-section${s.feature ? " feature" : ""}" id="land-${esc(s.id)}" data-id="${esc(s.id)}" ${open ? "open" : ""}>
    <summary>
      <span class="ls-title"><h2>${esc(s.title)}</h2></span>
      <span class="ls-summary">${esc(s.summary)}</span>
      <svg class="chev" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </summary>
    <div class="ls-body">
      ${s.art ? `<div class="ls-art">${art(s.art, { className: "vignette" })}</div>` : ""}
      ${paras(s.body)}
      ${living ? speciesList(data.species, data.speciesFurther) + redKitePanel(data.redKite) : ""}
      ${s.lookFor ? `<p class="look"><b>Look for</b> ${esc(s.lookFor)}</p>` : ""}
      ${s.place ? `<a class="link" href="#/map/${esc(s.place)}">Show on the map</a>` : ""}
      ${s.issues ? `<section class="issues" aria-label="Current issues">
        <p class="kicker">Current issues</p>
        <h3>${esc(s.issues.title)}</h3>
        ${paras(s.issues.body)}
        ${s.link ? `<a class="issue-link" href="${esc(s.link.url)}" target="_blank" rel="noopener">${esc(s.link.label)} <span aria-hidden="true">→</span><span class="sr-only"> (opens in a new tab)</span></a>` : ""}
      </section>` : ""}
      ${sourcesBlock(s.sources, s.check)}
    </div>
  </details>`;
}

export function landView(root, arg) {
  root.innerHTML = `<div class="page"><header class="masthead"><h1>The <em>land</em></h1></header><p class="empty-note">Loading…</p></div>`;
  let alive = true;
  loadLand().then((data) => {
    if (!alive) return;
    if (!data) {
      root.innerHTML = `<div class="page"><header class="masthead"><h1>The <em>land</em></h1></header><p class="empty-note">Couldn’t load this page. Check your connection and try again.</p></div>`;
      return;
    }
    const openState = store.get("eh.landSections", { ridgeway: true });
    if (arg) openState[arg] = true;
    const cs = data.crossSection || {};
    root.innerHTML = `
      <div class="land">
        <div class="page">
          <header class="masthead">
            <p class="meta"><span>Rocks, water and living things</span><span class="gridref">85–208 m</span></p>
            <h1>The <em>land</em></h1>
            <p class="lede">How chalk, clay and water put the village where it is, shaped its history, and what to look for on a walk today.</p>
          </header>
        </div>
        <figure class="xsec">
          ${crossSection(cs)}
          <figcaption>${esc(cs.caption || "")}</figcaption>
        </figure>
        <div class="page">
          <section class="why" aria-labelledby="why-h">
            <h2 id="why-h">${esc(data.intro.title)}</h2>
            ${paras(data.intro.body)}
            ${sourcesBlock(data.intro.sources, cs.accuracy)}
          </section>
        </div>
        <section class="deep" aria-labelledby="deep-h">
          <h2 id="deep-h">Before people</h2>
          <ol>${(data.deepTime || []).map((d) => `<li><span class="when">${esc(d.when)}</span><span class="what">${esc(d.what)}</span></li>`).join("")}</ol>
          <div class="deep-src">${sourcesBlock(data.deepTimeSources)}</div>
        </section>
        <div class="page">
          <div class="land-sections">${data.sections.map((s) => sectionHtml(s, data, !!openState[s.id])).join("")}</div>
          <section class="afield" aria-labelledby="afield-h">
            <h2 id="afield-h">Further afield</h2>
            <ul>${(data.furtherAfield || []).map((f) => `<li>${ext(f.url, f.name)}<span>${esc(f.why)}</span></li>`).join("")}</ul>
          </section>
        </div>
      </div>`;

    root.querySelectorAll(".land-section").forEach((d) => d.addEventListener("toggle", () => {
      openState[d.dataset.id] = d.open;
      store.set("eh.landSections", openState);
    }));
    if (arg) {
      const el = root.querySelector(`#land-${CSS.escape(arg)}`);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
    const h1 = root.querySelector("h1");
    if (h1) document.title = "The land · East Hendred Through Time";
  });
  return () => { alive = false; };
}
