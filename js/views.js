// Timeline, Stories, Entry and Walk screens.
import { ERAS, ENTRIES, SITES, WALK, STORIES, STORY_FILTERS } from "./data.js";
import { art } from "./art.js";
import { esc, withGaps, store } from "./util.js";
import * as clock from "./clock.js";

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
          <button type="button" class="btn-outline remind" aria-pressed="false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span>Remind me</span>
          </button>
          <p class="remind-note" role="status"></p>
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

  const remind = $(".remind");
  const showRemind = () => {
    const on = clock.reminderOn();
    remind.setAttribute("aria-pressed", String(on));
    remind.querySelector("span").textContent = on ? "Reminder on" : "Remind me";
  };
  showRemind();
  remind.addEventListener("click", async () => {
    const on = !clock.reminderOn();
    const res = await clock.setReminder(on);
    $(".remind-note").textContent = !res.ok ? res.reason
      : on ? "We’ll remind you five minutes before each tune while the app is open." : "";
    showRemind();
  });

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
        // Keep the active era visible in the rail without disturbing the page scroll.
        if (on) {
          const rail = a.parentElement;
          const left = a.offsetLeft - 10, right = a.offsetLeft + a.offsetWidth + 10;
          if (left < rail.scrollLeft) rail.scrollTo({ left, behavior: "smooth" });
          else if (right > rail.scrollLeft + rail.clientWidth) rail.scrollTo({ left: right - rail.clientWidth, behavior: "smooth" });
        }
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
  root.querySelector(".share")?.addEventListener("click", () => {
    navigator.share({ title: x.title, text: `${x.date}: ${x.title} — East Hendred through time`, url: location.href }).catch(() => {});
  });
  return () => clearInterval(tick);
}

// ---------- Stories ----------
export function storiesView(root) {
  let filter = store.get("eh.storyFilter", "all");
  root.innerHTML = `
    <div class="page">
      <header class="masthead">
        <h1>Village <em>voices</em></h1>
        <p class="lede">Blacksmiths, evacuees, schoolchildren and a letter-writing parson: everyday East Hendred, told from the records they left.</p>
      </header>
      <nav class="tabs-inline" aria-label="Filter stories">
        ${STORY_FILTERS.map(([id, label]) => `<button type="button" data-f="${id}" aria-pressed="false">${esc(label)}</button>`).join("")}
      </nav>
      <ol class="stories"></ol>
      <section class="cta">
        <div>
          <h2>Do you remember?</h2>
          <p>Grew up here, or have a family story, photo or letter? Share it with the Hendred Museum and it could appear here.</p>
          <a class="btn" href="https://www.hendredmuseum.org.uk/" target="_blank" rel="noopener">Share a memory</a>
        </div>
        ${art("envelope", { width: 76, height: 76 })}
      </section>
    </div>`;
  const list = root.querySelector(".stories");
  const paint = () => {
    root.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === filter)));
    const items = STORIES.filter((s) => filter === "all" || s.cat === filter);
    list.innerHTML = items.length ? items.map((s) => `
      <li><article>
        <div class="story-head">
          <div><h2>${esc(s.title)}</h2><p class="who">${esc(s.who)}</p></div>
          ${art(s.art, { width: 84, height: 84 })}
        </div>
        <p class="story-text">${esc(s.text)}</p>
        <p class="sources"><b>Source:</b> ${esc(s.source)}</p>
      </article></li>`).join("")
      : `<li class="empty-note">No stories here yet. <a href="https://www.hendredmuseum.org.uk/" target="_blank" rel="noopener">Know one?</a></li>`;
  };
  root.querySelector(".tabs-inline").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]");
    if (!b) return;
    filter = b.dataset.f;
    store.set("eh.storyFilter", filter);
    paint();
  });
  paint();
}

// ---------- Walk ----------
export function walkView(root) {
  const stops = WALK.stops.map((s, i) => ({ ...s, i, site: siteOf(s.site), entryObj: entryOf(s.entry) }));
  const total = stops.length;
  let step = Math.min(store.get("eh.walkStep", 0), total);
  let open = null, toast = null;

  root.innerHTML = `
    <div class="page">
      <header class="masthead">
        <h1>The village walk</h1>
        <dl class="facts">${WALK.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${withGaps(v)}</dd></div>`).join("")}</dl>
      </header>
      <section class="progress" aria-label="Your progress">
        <div class="progress-top"><span class="progress-label"></span><span class="muted small">Saved on this phone</span></div>
        <div class="bar" role="progressbar" aria-label="Walk progress" aria-valuemin="0" aria-valuemax="${total}"></div>
        <div class="strip">
          <svg viewBox="0 0 350 150" width="350" height="150" aria-hidden="true" focusable="false">
            <g filter="url(#wc)" style="mix-blend-mode:multiply">
              <ellipse cx="190" cy="88" rx="160" ry="56" fill="#e2cb9c" opacity=".6"/>
              <path d="M0 40C60 46 90 20 140 30S220 56 260 36S320 6 350 12" stroke="#7ea2d2" stroke-width="9" fill="none" opacity=".6"/>
              <circle cx="40" cy="80" r="12" fill="#6f8a55" opacity=".6"/>
              <circle cx="320" cy="132" r="14" fill="#6f8a55" opacity=".6"/>
            </g>
            <g filter="url(#ink)" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M0 98C80 94 150 100 220 96S310 92 350 94" stroke="#2b2924" stroke-width="7"/>
              <path d="M0 98C80 94 150 100 220 96S310 92 350 94" stroke="#efe6d0" stroke-width="5"/>
              <path d="M${stops.map((s) => `${s.sx} ${s.sy}`).join(" L")}" stroke="#2f4f8a" stroke-width="2.2" stroke-dasharray="5 4"/>
            </g>
          </svg>
          <div class="strip-dots"></div>
        </div>
      </section>
      <div class="walk-toast" role="status"></div>
      <section class="current" aria-live="polite"></section>
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
  const save = () => store.set("eh.walkStep", step);

  function paint() {
    const finished = step >= total;
    $(".progress-label").textContent = finished ? `All ${total} stops done` : `Stop ${step + 1} of ${total}`;
    const bar = $(".bar");
    bar.setAttribute("aria-valuenow", String(Math.min(step, total)));
    bar.innerHTML = stops.map((s) => `<span class="${s.i < step ? "done" : s.i === step ? "now" : ""}"></span>`).join("");
    $(".strip-dots").innerHTML = stops.map((s) =>
      `<span class="sdot ${s.i < step ? "done" : s.i === step ? "now" : ""}" style="left:${s.sx}px;top:${s.sy}px">${s.i + 1}</span>`).join("");

    $(".walk-toast").innerHTML = toast
      ? `<div class="toast"><span>${esc(toast)}</span><button type="button" data-act="undo">Undo</button></div>` : "";

    const cur = stops[Math.min(step, total - 1)];
    const era = eraOf(cur.entryObj.era);
    $(".current").style.setProperty("--c", era.color);
    $(".current").style.setProperty("--t", era.tint);
    $(".current").className = `current ${finished ? "done" : ""}`;
    $(".current").innerHTML = finished ? `
        <h2>Walk complete</h2>
        <p>Eight stops and eight centuries. Still have legs? Head up to Scutchamer Knob on the Ridgeway.</p>
        <button type="button" class="btn-outline" data-act="restart">Start again</button>`
      : `
        <p class="era-line">Stop ${step + 1} of ${total} · ${esc(era.name)}, ${esc(cur.entryObj.date)}</p>
        <h2>${esc(cur.site.name)}</h2>
        <p><b>Getting there.</b> ${cur.getThere ? esc(cur.getThere) : withGaps(`[From ${stops[step - 1]?.site.short || "the start"}: directions to add]`)}</p>
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

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "here") {
      const next = stops[step + 1];
      toast = `Stop ${step + 1} done.${next ? ` Next: ${next.site.name}.` : ""}`;
      step += 1; open = null; save(); paint();
      root.querySelector(".current")?.scrollIntoView({ block: "nearest" });
    } else if (act === "undo") {
      step = Math.max(0, step - 1); toast = null; save(); paint();
    } else if (act === "restart") {
      step = 0; toast = null; open = null; save(); paint();
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
