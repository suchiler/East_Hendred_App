// Timeline, Stories, Entry and Walk screens.
import { ERAS, ENTRIES, SITES, WALK } from "./data.js";
import { art } from "./art.js";
import { esc, store, focusHeading, keepInRail } from "./util.js";
import * as clock from "./clock.js";
import { STORY_FORM_URL } from "./config.js";
import { project, MAP_W, MAP_H } from "./painted-map.js";
import { loadStories, TYPES, typeName, isFolklore, isLong, paragraphs, byline } from "./stories.js";

const eraOf = (id) => ERAS.find((e) => e.id === id);
const siteOf = (id) => SITES.find((s) => s.id === id);
const entryOf = (id) => ENTRIES.find((e) => e.id === id);

// ---------- Timeline ----------
export function timelineView(root) {
  root.innerHTML = `
    <div class="page">
      <header class="masthead">
        <p class="meta"><span>Vale of White Horse, Oxfordshire</span><span class="gridref">SU 459 887</span></p>
        <h1>East Hendred <em>through time</em></h1>
        <p class="lede">A cloth town, a family that never left, and a church clock that has played the same tune since 1525. Start at the surface and dig down.</p>
      </header>

      <section class="clock" aria-labelledby="clock-h">
        <div class="clock-art">${art("tower", { width: 100, height: 122 })}</div>
        <div class="clock-body">
          <div>
            <h2 id="clock-h" class="clock-title"></h2>
            <p class="clock-until"></p>
          </div>
          <ul class="bells" aria-label="Today’s tunes"></ul>
        </div>
      </section>

      <nav class="rail" aria-label="Jump to an era">
        ${ERAS.map((e) => `<a href="#era-${e.id}" data-era="${e.id}" style="--c:${e.color}"><span class="dot"></span>${esc(e.name)}</a>`).join("")}
      </nav>

      <div class="chronology">
        ${ERAS.map((e) => `
          <section id="era-${e.id}" class="era" style="--c:${e.color}" aria-labelledby="era-h-${e.id}">
            <div class="era-head">
              <div><h2 id="era-h-${e.id}">${esc(e.name)}</h2><p>${esc(e.span)}</p></div>
              ${art(e.art, { width: 120, height: 66 })}
            </div>
            <ol class="entries">
              ${ENTRIES.filter((x) => x.era === e.id).map((x) => `
                <li><a href="#/entry/${x.id}">
                  <span class="date">${esc(x.date)}</span>
                  <span class="entry-text">
                    <span class="entry-title">${esc(x.title)}</span>
                    <span class="entry-gloss">${esc(x.gloss)}</span>
                    ${x.legend ? `<span class="folklore">‡ Folklore</span>` : ""}
                  </span>
                </a></li>`).join("")}
            </ol>
          </section>`).join("")}
        <p class="fineprint">‡ marks folklore. Dates from the Victoria County History, Historic England and the Hendred Museum.</p>
      </div>
    </div>`;

  // Clock band
  const $ = (q) => root.querySelector(q);
  const paint = () => {
    const c = clock.summary();
    $(".clock-title").textContent = c.title;
    $(".clock-until").textContent = c.until;
    $(".bells").innerHTML = c.bells.map((b) => `
      <li class="${b.played ? "played" : ""}">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 16C6 10 8 5 12 5S18 10 18 16Z"/><path d="M4 16H20" class="rim"/><circle cx="12" cy="19" r="1.6" class="clapper"/></svg>
        <span>${b.label}<span class="sr-only">${b.played ? ", played" : ", still to come"}</span></span>
      </li>`).join("");
  };
  paint();
  const tick = setInterval(paint, 30000);

  // Era rail: smooth jump, and highlight the era you're reading.
  const scroller = root.closest(".view");
  const links = [...root.querySelectorAll(".rail a")];
  links.forEach((a) => a.addEventListener("click", (ev) => {
    ev.preventDefault();
    root.querySelector(`#era-${a.dataset.era}`)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
  const io = new IntersectionObserver((items) => {
    items.forEach((it) => {
      if (!it.isIntersecting) return;
      const id = it.target.id.replace("era-", "");
      links.forEach((a) => {
        const on = a.dataset.era === id;
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        if (on) keepInRail(a.parentElement, a);
      });
    });
  }, { root: scroller, rootMargin: "-20% 0px -70% 0px" });
  root.querySelectorAll(".era").forEach((s) => io.observe(s));

  return () => { clearInterval(tick); io.disconnect(); };
}

// ---------- Entry ----------
export function entryView(root, id) {
  const idx = ENTRIES.findIndex((e) => e.id === id);
  const x = ENTRIES[idx];
  if (!x) {
    root.innerHTML = `<div class="page empty"><h1>Not found</h1><p>That entry doesn’t exist. <a href="#/">Back to the timeline</a></p></div>`;
    return;
  }
  const era = eraOf(x.era);
  const newer = ENTRIES[idx - 1], older = ENTRIES[idx + 1];
  const site = x.site && siteOf(x.site);
  const stopIdx = WALK.stops.findIndex((s) => s.entry === x.id);
  const share = navigator.share ? `<button type="button" class="icon-btn share" aria-label="Share this entry">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></button>` : "";

  root.innerHTML = `
    <div class="entry-page" style="--c:${era.color}">
      <div class="topbar">
        <a class="back" href="#/">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>
          Timeline
        </a>
        ${share}
      </div>
      <div class="hero-art">${art(x.art || era.art, { className: "hero" })}</div>
      <article class="page entry-article">
        <header>
          <p class="era-line">${esc(era.name)}, ${esc(era.span)}</p>
          <p class="big-date" aria-hidden="true">${esc(x.date)}</p>
          <h1><span class="sr-only">${esc(x.date)}: </span>${esc(x.title)}</h1>
          <p class="entry-by">${esc(x.gloss)}</p>
        </header>
        <p class="body">${esc(x.body)}</p>
        ${x.legend ? `<p class="legend"><span class="folklore">‡ Folklore.</span> ${esc(x.legend)}</p>` : ""}
        <section class="label" aria-label="Spot it today">
          <p><b>Spot it today.</b> ${esc(x.spot)}${x.clock ? ` <b class="next-tune"></b>` : ""}</p>
          ${site || stopIdx >= 0 ? `<div class="actions">
            ${site ? `<a class="btn" href="#/map/${site.id}">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              Show on map</a>` : ""}
            ${stopIdx >= 0 ? `<a class="link" href="#/walk">Stop ${stopIdx + 1} of the village walk</a>` : ""}
          </div>` : ""}
        </section>
        <section class="related" aria-label="Stories and legends" hidden></section>
        <p class="sources"><b>Sources:</b> ${esc(x.sources || "Victoria County History of Berkshire, vol. 4; Historic England; Hendred Museum.")}</p>
      </article>
    </div>
    <nav class="neighbours" aria-label="Neighbouring entries">
      ${newer ? `<a href="#/entry/${newer.id}"><span class="dir">↑ Newer · ${esc(newer.date)}</span><span class="t">${esc(newer.title)}</span></a>` : `<span></span>`}
      ${older ? `<a class="older" href="#/entry/${older.id}"><span class="dir">Older · ${esc(older.date)} ↓</span><span class="t">${esc(older.title)}</span></a>` : `<span></span>`}
    </nav>`;

  let tick;
  const nt = root.querySelector(".next-tune");
  if (nt) {
    const paint = () => { nt.textContent = `Next: ${clock.summary().short}.`; };
    paint();
    tick = setInterval(paint, 30000);
  }
  loadStories().then((list) => {
    const rel = list.filter((st) => st.linkedEntry === x.id);
    const box = root.querySelector(".related");
    if (!rel.length || !box) return;
    box.hidden = false;
    box.innerHTML = `<h2>Stories and legends</h2><ul>${rel.map((st) => `<li><a href="#/story/${esc(st.id)}">
      <span class="t">${esc(st.title)}</span><span class="dir">${esc(typeName(st.type))}${isFolklore(st) ? " ‡" : ""}</span></a></li>`).join("")}</ul>`;
  });
  root.querySelector(".share")?.addEventListener("click", () => {
    navigator.share({ title: x.title, text: `${x.date}: ${x.title} — East Hendred through time`, url: location.href }).catch(() => {});
  });
  return () => clearInterval(tick);
}

// ---------- Stories ----------
const MUSEUM_URL = "https://www.hendredmuseum.org.uk/";
const paras = (body) => paragraphs(body).map((p) => `<p>${esc(p)}</p>`).join("");
const folkNote = (s) => (isFolklore(s) ? `<span class="folklore">‡ ${esc(typeName(s.type))}: not proven fact</span>` : "");

function storyItem(s) {
  const long = isLong(s);
  const first = paragraphs(s.body)[0] || "";
  const by = byline(s);
  const href = `#/story/${esc(s.id)}`;
  // Short stories are shown in full; long ones show a three-line preview and a link.
  // The title always links to the story's own page, where the sources are.
  const links = [long ? `<a class="link" href="${href}">Read the full story<span class="sr-only">: ${esc(s.title)}</span></a>` : "",
    s.coordinates ? `<a class="link" href="#/map/${esc(s.id)}">Show on map<span class="sr-only">: ${esc(s.title)}</span></a>` : ""].filter(Boolean);
  return `<li><article class="story">
    <div class="story-head${s.artwork ? "" : " no-art"}">
      <div>
        <h3><a class="story-title" href="${href}">${esc(s.title)}</a></h3>
        ${by ? `<p class="who">${esc(by)}</p>` : ""}
        ${folkNote(s)}
      </div>
      ${s.artwork ? art(s.artwork, { width: 84, height: 84 }) : ""}
    </div>
    <div class="story-text">${long ? `<p class="preview-clamp">${esc(first)}</p>` : paras(s.body)}</div>
    ${links.length ? `<p class="story-links">${links.join("")}</p>` : ""}
  </article></li>`;
}

// Colour for each type in the section rail (same idea as the timeline's era rail).
const TYPE_COLOURS = { History: "#2f4f8a", Memory: "#2f6f6a", Legend: "#8c3b2c", "Folk tale": "#5b4a78", "Ghost story": "#3d4540" };
const typeSlug = (t) => t.toLowerCase().replace(/[^a-z]+/g, "-");

export function storiesView(root) {
  let filter = store.get("eh.storyCat", "All");
  const openState = store.get("eh.storySections", {});
  const cta = STORY_FORM_URL
    ? `<a class="btn" href="${esc(STORY_FORM_URL)}" target="_blank" rel="noopener">Share your story</a>`
    : `<a class="btn" href="${MUSEUM_URL}" target="_blank" rel="noopener">Share a memory</a>`;
  root.innerHTML = `
    <div class="page">
      <header class="masthead">
        <h1>Village <em>voices</em></h1>
        <p class="lede">Blacksmiths, evacuees, a letter-writing parson and the parish fire brigade, plus the legends and ghost stories the village still tells.</p>
      </header>
      <div class="cat-filter">
        <label for="story-cat">Category</label>
        <span class="select-wrap"><select id="story-cat"></select></span>
      </div>
      <nav class="rail type-rail" aria-label="Jump to a kind of story"></nav>
      <div class="story-sections"><p class="empty-note">Loading stories…</p></div>
      <section class="cta">
        <div>
          <h2>Do you remember?</h2>
          <p>Grew up here, or have a family story, a legend or a ghost story? Share it and, once it’s been read, it could appear here.</p>
          ${cta}
        </div>
        ${art("envelope", { width: 76, height: 76 })}
      </section>
    </div>`;

  const select = root.querySelector("#story-cat");
  const rail = root.querySelector(".type-rail");
  const box = root.querySelector(".story-sections");
  const scroller = root.closest(".view");
  let stories = [];
  let io = null;
  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  const highlight = (id) => {
    rail.querySelectorAll("a").forEach((a) => {
      const on = a.dataset.type === id;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      if (on) keepInRail(rail, a);
    });
  };

  const paint = () => {
    const cats = [...new Set(stories.map((s) => s.category || "Other"))].sort((a, b) => (a === "Other") - (b === "Other") || a.localeCompare(b));
    if (filter !== "All" && !cats.includes(filter)) filter = "All";
    select.innerHTML = [`<option value="All">All categories</option>`, ...cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`)].join("");
    select.value = filter;
    const shown = stories.filter((s) => filter === "All" || (s.category || "Other") === filter);
    const present = TYPES.map((t) => ({ t, items: shown.filter((s) => s.type === t.id)
      .sort((a, b) => (b.featured - a.featured) || ((a.sortYear ?? 99999) - (b.sortYear ?? 99999))) })).filter((x) => x.items.length);

    rail.innerHTML = present.map(({ t, items }) =>
      `<a href="#type-${typeSlug(t.id)}" data-type="${esc(t.id)}" style="--c:${TYPE_COLOURS[t.id] || "#2f4f8a"}"><span class="dot"></span>${esc(t.label)} <span class="rail-count">${items.length}</span></a>`).join("");
    rail.hidden = present.length < 2;

    box.innerHTML = present.map(({ t, items }, i) => {
      // Only the first kind of story starts open (unless the reader has opened or closed it before).
      const open = t.id in openState ? openState[t.id] : i === 0;
      return `<details class="story-section" id="type-${typeSlug(t.id)}" data-type="${esc(t.id)}" style="--c:${TYPE_COLOURS[t.id] || "#2f4f8a"}" ${open ? "open" : ""}>
        <summary>
          <span class="sec-title"><h2>${esc(t.label)}</h2><span class="count">${items.length}</span></span>
          <span class="sec-blurb">${esc(t.blurb)}</span>
          <svg class="chev" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </summary>
        <ol class="stories">${items.map(storyItem).join("")}</ol>
      </details>`;
    }).join("") || `<p class="empty-note">No stories about this yet. <a href="${esc(STORY_FORM_URL || MUSEUM_URL)}" target="_blank" rel="noopener">Know one?</a></p>`;

    box.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", () => {
      openState[d.dataset.type] = d.open;
      store.set("eh.storySections", openState);
    }));
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) highlight(en.target.dataset.type); });
    }, { root: scroller, rootMargin: "-20% 0px -70% 0px" });
    box.querySelectorAll(".story-section").forEach((d) => io.observe(d));
    if (present[0]) highlight(present[0].t.id);
  };

  rail.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-type]");
    if (!a) return;
    e.preventDefault();
    const sec = box.querySelector(`.story-section[data-type="${CSS.escape(a.dataset.type)}"]`);
    if (!sec) return;
    if (!sec.open) sec.open = true;
    sec.scrollIntoView({ behavior: smooth(), block: "start" });
    highlight(a.dataset.type);
  });

  select.addEventListener("change", () => {
    filter = select.value;
    store.set("eh.storyCat", filter);
    paint();
  });

  let alive = true;
  loadStories().then((list) => {
    if (!alive) return;
    stories = list;
    if (!list.length) { box.innerHTML = `<p class="empty-note">Couldn’t load the stories. Check your connection and try again.</p>`; return; }
    paint();
  });
  return () => { alive = false; if (io) io.disconnect(); };
}

// ---------- One story ----------
export function storyView(root, id) {
  root.innerHTML = `<div class="page empty"><p class="empty-note">Loading…</p></div>`;
  let alive = true;
  loadStories().then((list) => {
    if (!alive) return;
    const s = list.find((x) => x.id === id);
    if (!s) {
      root.innerHTML = `<div class="page empty"><h1>Not found</h1><p>That story isn’t here. <a href="#/stories">Back to the stories</a></p></div>`;
      focusHeading(root);
      return;
    }
    const era = ERAS.find((e) => e.name === s.era);
    const linked = s.linkedEntry && entryOf(s.linkedEntry);
    // The date is already in the line above the title, so the byline is just the people.
    const by = s.type === "Memory" ? byline(s) : s.people;
    root.innerHTML = `
      <div class="entry-page story-page" style="--c:${era ? era.color : "var(--woad)"}">
        <div class="topbar">
          <a class="back" href="#/stories">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>
            Stories
          </a>
        </div>
        ${s.artwork ? `<div class="hero-art story-hero">${art(s.artwork, { className: "hero" })}</div>` : ""}
        <article class="page entry-article">
          <header>
            <p class="era-line">${esc(typeName(s.type))}${s.when ? ` · ${esc(s.when)}` : ""}</p>
            <h1>${esc(s.title)}</h1>
            ${by ? `<p class="entry-by">${esc(by)}</p>` : ""}
          </header>
          ${isFolklore(s) ? `<p class="folk-banner">‡ This is a ${esc(s.type.toLowerCase())}: part of village folklore, not proven fact.</p>` : ""}
          <div class="body story-body">${paras(s.body)}</div>
          ${s.place || s.coordinates ? `<section class="label" aria-label="Where">
            <p><b>Where.</b> ${esc(s.place || "On the map")}</p>
            ${s.coordinates ? `<div class="actions"><a class="btn" href="#/map/${esc(s.id)}">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              Show on map</a></div>` : ""}
          </section>` : ""}
          ${linked ? `<a class="linked-entry" href="#/entry/${linked.id}"><span class="dir">On the timeline</span><span class="t">${esc(linked.date)}: ${esc(linked.title)}</span></a>` : ""}
          <p class="sources"><b>Source:</b> ${esc(s.source)}${s.credit && s.type !== "Memory" ? ` · Shared by ${esc(s.credit)}` : ""}</p>
        </article>
      </div>`;
    document.title = `${s.title} · East Hendred Through Time`;
    focusHeading(root);
  });
  return () => { alive = false; };
}

// ---------- Walk ----------
export function walkView(root) {
  const stops = WALK.stops.map((s, i) => ({ ...s, i, site: siteOf(s.site), entryObj: entryOf(s.entry) }));
  const total = stops.length;
  // The key changed when the route was reordered (Nov 2026), so old progress is ignored safely.
  let step = Math.min(Math.max(0, Number(store.get("eh.walk7", 0)) || 0), total);
  let open = null, toast = null;
  const strip = stripMap(stops);

  // Facts still waiting for local knowledge (values with "[...]") aren't shown yet.
  const facts = WALK.facts.filter(([, v]) => !String(v).includes("["));
  root.innerHTML = `
    <div class="page">
      <header class="masthead">
        <h1>The village walk</h1>
        ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
      </header>
      <div class="walk-toast" role="status"></div>
      <section class="current" aria-label="Current stop"></section>
      <section class="progress" aria-label="Your progress">
        <div class="progress-top"><span class="progress-label"></span><span class="muted small">Saved on this phone</span></div>
        <div class="bar" role="progressbar" aria-label="Walk progress" aria-valuemin="0" aria-valuemax="${total}" style="grid-template-columns:repeat(${total}, minmax(0, 1fr))"></div>
        <div class="strip" style="aspect-ratio:${strip.W} / ${strip.h}; max-width:${Math.round(200 * strip.W / strip.h)}px">
          <svg viewBox="${strip.vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <image href="art/painted-map@2x.webp" width="${MAP_W}" height="${MAP_H}"/>
            <path d="M${strip.pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")}" fill="none" stroke="#2f4f8a" stroke-width="${(2.4 / strip.k).toFixed(2)}" stroke-dasharray="${(5 / strip.k).toFixed(1)} ${(4 / strip.k).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="strip-dots"></div>
        </div>
      </section>
      <section class="route" aria-labelledby="route-h">
        <h2 id="route-h">The route</h2>
        <ol class="route-list"></ol>
      </section>
      <a class="extend" href="#/map/knob">
        ${art("knob", { width: 110, height: 60 })}
        <span><span class="extend-title">Extend the walk</span>
        <span class="extend-sub">Climb to Scutchamer Knob and the Ridgeway, on the downs south of the village</span></span>
      </a>
    </div>`;

  const $ = (q) => root.querySelector(q);
  const save = () => store.set("eh.walk7", step);

  function paint() {
    const finished = step >= total;
    $(".progress-label").textContent = finished ? `All ${total} stops done` : `Stop ${step + 1} of ${total}`;
    const bar = $(".bar");
    bar.setAttribute("aria-valuenow", String(Math.min(step, total)));
    bar.setAttribute("aria-valuetext", finished ? `All ${total} stops done` : `Stop ${step + 1} of ${total}`);
    bar.innerHTML = stops.map((s) => `<span class="${s.i < step ? "done" : s.i === step ? "now" : ""}"></span>`).join("");
    $(".strip-dots").innerHTML = stops.map((s) =>
      `<span class="sdot ${s.i < step ? "done" : s.i === step ? "now" : ""}" style="left:${strip.screen[s.i].x}%;top:${strip.screen[s.i].y}%">${s.i + 1}</span>`).join("");

    $(".walk-toast").innerHTML = toast
      ? `<div class="toast"><span>${esc(toast)}</span><button type="button" data-act="undo">Undo</button></div>` : "";

    const cur = stops[Math.min(step, total - 1)];
    const era = eraOf(cur.entryObj.era);
    $(".current").style.setProperty("--c", era.color);
    $(".current").style.setProperty("--t", era.tint);
    $(".current").className = `current ${finished ? "done" : ""}`;
    $(".current").innerHTML = finished ? `
        <h2 tabindex="-1">Walk complete</h2>
        <p>Seven stops and eight centuries of village history. Still have legs? Head up to Scutchamer Knob on the Ridgeway.</p>
        <button type="button" class="btn-outline" data-act="restart">Start again</button>`
      : `
        <p class="era-line">Stop ${step + 1} of ${total} · ${esc(era.name)}, ${esc(cur.entryObj.date)}</p>
        <h2 tabindex="-1">${esc(cur.site.name)}</h2>
        <p><b>Getting there.</b> ${cur.getThere && !cur.getThere.includes("[") ? esc(cur.getThere) : `<span class="muted">Directions coming soon.</span>`}</p>
        <p><b>Look for</b> ${esc(cur.look)}</p>
        <div class="actions">
          <button type="button" class="btn big" data-act="here">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            I’m here</button>
          <a class="link" href="#/entry/${cur.entry}">Read the story</a>
        </div>`;

    $(".route-list").innerHTML = stops.map((s) => {
      const done = s.i < step, now = s.i === step, isOpen = open === s.i;
      const e = eraOf(s.entryObj.era);
      return `<li class="${done ? "done" : ""} ${now ? "now" : ""}">
        <button type="button" class="route-row" data-i="${s.i}" aria-expanded="${isOpen}" ${now ? 'aria-current="step"' : ""}>
          <span class="marker">${done ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span class="sr-only">Done: </span>` : s.i + 1}</span>
          <span class="route-text"><span class="route-name">${esc(s.site.name)}</span><span class="route-story">${esc(s.entryObj.title)}</span></span>
          <span class="route-date" style="color:${e.color}">${esc(s.entryObj.date)}</span>
        </button>
        ${isOpen ? `<div class="preview">
          <p><b>Look for</b> ${esc(s.look)}</p>
          ${now ? "" : `<button type="button" class="btn-outline small" data-act="make" data-i="${s.i}">Make this my current stop</button>`}
        </div>` : ""}
      </li>`;
    }).join("");
  }

  // Listen on this screen's own element, not the shared #view, so handlers don't pile up between visits.
  root.querySelector(".page").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "here") {
      const next = stops[step + 1];
      toast = `Stop ${step + 1} done.${next ? ` Next: ${next.site.name}.` : ""}`;
      step += 1; open = null; save(); paint();
      // The toast announces what happened; focus moves to the next stop's name.
      root.querySelector(".current h2")?.focus();
    } else if (act === "undo") {
      step = Math.max(0, step - 1); toast = null; save(); paint();
      root.querySelector('[data-act="here"]')?.focus();
    } else if (act === "restart") {
      step = 0; toast = null; open = null; save(); paint();
      root.querySelector('[data-act="here"]')?.focus();
    } else if (act === "make") {
      step = Number(b.dataset.i); open = null; toast = null; save(); paint();
    } else if (b.classList.contains("route-row")) {
      const i = Number(b.dataset.i);
      open = open === i ? null : i; paint();
      root.querySelector(`.route-row[data-i="${i}"]`)?.focus();
    }
  });
  paint();
}

// A crop of the painted map framing the walk's stops; dots are placed in % so the strip can shrink.
function stripMap(stops) {
  const W = 350, pad = 26;
  const pts = stops.map((s) => project(s.site.lat, s.site.lng));
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  let minx = Math.min(...xs) - pad, maxx = Math.max(...xs) + pad;
  let miny = Math.min(...ys) - pad, maxy = Math.max(...ys) + pad;
  let bw = maxx - minx, bh = maxy - miny;
  const h = Math.round(Math.min(320, Math.max(160, (W * bh) / bw)));
  const target = W / h;
  if (bw / bh < target) { const nw = bh * target; minx -= (nw - bw) / 2; bw = nw; }
  else { const nh = bw / target; miny -= (nh - bh) / 2; bh = nh; }
  const k = W / bw;
  const vb = `${minx.toFixed(1)} ${miny.toFixed(1)} ${bw.toFixed(1)} ${bh.toFixed(1)}`;
  return { W, h, k, vb, pts, screen: pts.map((p) => ({ x: (((p.x - minx) / bw) * 100).toFixed(2), y: (((p.y - miny) / bh) * 100).toFixed(2) })) };
}
