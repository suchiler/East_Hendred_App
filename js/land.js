// The Land page: geology, landscape, water and wildlife of the parish.
// Content comes from content/land.json; illustrations from js/land-art.js
// (or hand-painted images listed in ART_IMAGES in config.js).
import { art } from "./art.js";
import { ART_IMAGES } from "./config.js";
import * as LA from "./land-art.js";
import { esc, store, focusHeading } from "./util.js";

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

// The painted cross-section has its labels drawn in; CROSS_SECTION_LABELS is a text
// list for screen readers only, so nothing is drawn twice.
function crossSection(cs) {
  const label = esc(LA.CROSS_SECTION_DESCRIPTION || cs.label || "Cross-section through the parish from the Vale to the Ridgeway");
  const list = (LA.CROSS_SECTION_LABELS || []).map((l) => esc(l.text)).join(", ");
  const sr = list ? `<p class="sr-only">Labelled: ${list}.</p>` : "";
  if (ART_IMAGES["cross-section"]) {
    return `<img class="xsec-art" src="${ART_IMAGES["cross-section"]}" alt="${label}">${sr}`;
  }
  const d = LA.LAND_DRAWINGS["cross-section"];
  if (!d) return "";
  const [, , w, h] = d.vb.split(/\s+/).map(Number);
  return `<svg class="xsec-art" viewBox="${d.vb}" style="aspect-ratio:${w} / ${h}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${d.svg}</svg>${sr}`;
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
      ${art("red-kite", { width: 120, height: 84 })}
    </div>
    ${paras(k.body)}
    ${k.lookFor ? `<p class="look"><b>Look for</b> ${esc(k.lookFor)}</p>` : ""}
    ${sourcesBlock(k.sources)}
  </section>`;
}

// Each section has its own colour band, like the eras on the timeline.
const SECTION_COLOURS = {
  rocks: "#6d6a5f",    // flint grey
  shape: "#5f6a3e",    // turf
  ridgeway: "#8a5a14", // ochre: the chalk track
  water: "#2f5f8a",    // brook blue
  soils: "#7a5a32",    // umber
  living: "#2f6f6a",   // verdigris
  change: "#5b4a78"    // oak-gall violet
};

function sectionHtml(s, data, open) {
  const living = s.id === "living";
  return `<details class="land-section" id="land-${esc(s.id)}" data-id="${esc(s.id)}" style="--c:${SECTION_COLOURS[s.id] || "#5f6a3e"}" ${open ? "open" : ""}>
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
          <figcaption>${esc(LA.CROSS_SECTION_CAPTION || cs.caption || "")}</figcaption>
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
    // The loading screen's heading had focus; it's been replaced, so focus the new one.
    if (document.activeElement === document.body) focusHeading(root);
  });
  return () => { alive = false; };
}
