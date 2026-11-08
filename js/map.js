// The map view: the painted village map (from js/painted-map.js), plus real tiled
// maps (today and historic) through Leaflet. Sites and stories are placed from their
// lat/lng; anything beyond the drawing gets a marker at the edge pointing to it.
import { SITES, ENTRIES } from "./data.js";
import { MAP_LAYERS, VILLAGE_CENTRE } from "./config.js";
import { MAP_W, MAP_H, project, PAINTED_SVG } from "./painted-map.js";
import { loadStories, isFolklore, typeName } from "./stories.js";
import { esc } from "./util.js";

const entryOf = (id) => ENTRIES.find((e) => e.id === id);
const typeLabel = typeName;
const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
const MAX_ZOOM = 3.5;
const SHEET_RESERVE = 236 + 52; // place sheet + pill row, measured from the bottom

function siteItems() {
  return SITES.map((s) => ({ key: `site:${s.id}`, kind: "site", id: s.id, n: s.n, name: s.name, short: s.short, lat: s.lat, lng: s.lng, site: s }));
}
function storyItems(stories) {
  return stories.filter((s) => Array.isArray(s.coordinates) && s.coordinates.length === 2)
    .map((s) => ({ key: `story:${s.id}`, kind: "story", id: s.id, name: s.title, short: s.title,
      lat: Number(s.coordinates[0]), lng: Number(s.coordinates[1]), folk: isFolklore(s), story: s }));
}

export function mapView(root, { sel } = {}) {
  const state = {
    sel: null,
    wanted: sel || "champs",
    layer: localStorage.getItem("eh.layer") || "painted",
    menu: false,
    items: siteItems()
  };
  if (!MAP_LAYERS.find((l) => l.id === state.layer && (l.kind === "painted" || l.url))) state.layer = "painted";

  root.innerHTML = `
    <section class="map" aria-labelledby="map-h">
      <div class="map-canvas">
        <div class="map-stage" style="width:${MAP_W}px;height:${MAP_H}px">${PAINTED_SVG}</div>
        <div class="pins"></div>
        <div class="map-leaflet" hidden></div>
        <div class="edge-markers"></div>
        <div class="zoom-ctl">
          <button type="button" data-act="zoom-in" aria-label="Zoom in">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
          <button type="button" data-act="zoom-out" aria-label="Zoom out">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>
        </div>
      </div>

      <header class="map-head">
        <div>
          <h1 id="map-h">The village</h1>
          <p class="map-credit"></p>
        </div>
        <button type="button" class="round-btn" data-act="locate" aria-label="Show my location">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 19-9-9 19-2-8-8-2Z"/></svg>
        </button>
      </header>
      <p class="map-toast" role="status" hidden></p>

      <div class="map-pills">
        <button type="button" class="pill" data-act="menu" aria-haspopup="dialog" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="m2 12.5 10 5 10-5"/></svg>
          Map: <span class="layer-name"></span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>
        </button>
        <div class="bottom-edges"></div>
      </div>

      <section class="sheet place" aria-live="polite"></section>

      <section class="sheet layers" role="dialog" aria-modal="false" aria-labelledby="layers-h" hidden>
        <div class="sheet-head">
          <h2 id="layers-h">Choose a map</h2>
          <button type="button" class="icon-btn" data-act="close" aria-label="Close">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
        <ul class="layer-list">
          ${MAP_LAYERS.map((l) => {
            const ready = l.kind === "painted" || !!l.url;
            return `<li><button type="button" class="layer-row" data-layer="${l.id}" ${ready ? "" : "disabled"} aria-pressed="false">
              <span class="swatch" style="background:${l.swatch}"></span>
              <span class="layer-text"><span class="layer-full">${esc(l.full)}</span>
              <span class="layer-sub">${esc(ready ? l.credit : l.missing)}</span></span>
              <svg class="tick" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            </button></li>`;
          }).join("")}
        </ul>
      </section>
    </section>`;

  const $ = (q) => root.querySelector(q);
  const canvas = $(".map-canvas"), stage = $(".map-stage"), leafletEl = $(".map-leaflet");
  const pinsEl = $(".pins");
  let lmap = null, tiles = null, you = null;
  let markers = {};
  // Painted map view: base cover scale, zoom factor and offset (screen px).
  const view = { base: 1, z: 1, dx: 0, dy: 0, ready: false };
  const S = () => view.base * view.z;

  // Visible area not hidden by the header or the bottom sheet.
  const visible = () => {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const head = $(".map-head").offsetHeight;
    return { l: 0, r: W, t: head, b: Math.max(head + 80, H - SHEET_RESERVE), W, H };
  };

  function clampView() {
    const { W, H } = visible();
    const w = MAP_W * S(), h = MAP_H * S();
    view.dx = w <= W ? (W - w) / 2 : Math.min(0, Math.max(W - w, view.dx));
    view.dy = h <= H ? (H - h) / 2 : Math.min(0, Math.max(H - h, view.dy));
  }

  function centreOn(lat, lng) {
    const p = project(lat, lng);
    const v = visible();
    view.dx = (v.l + v.r) / 2 - p.x * S();
    view.dy = (v.t + v.b) / 2 - p.y * S();
    clampView();
  }

  function applyView() {
    clampView();
    stage.style.transform = `translate(${view.dx}px, ${view.dy}px) scale(${S()})`;
    placePins();
  }

  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    view.base = Math.max(w / MAP_W, h / MAP_H);
    if (!view.ready) {
      view.ready = true;
      const it = state.items.find((x) => x.key === state.sel);
      const c = it && project(it.lat, it.lng).inside ? [it.lat, it.lng] : VILLAGE_CENTRE;
      centreOn(c[0], c[1]);
    }
    applyView();
  };

  function zoomAt(factor, sx, sy) {
    const z = Math.max(1, Math.min(MAX_ZOOM, view.z * factor));
    const k = z / view.z;
    view.dx = sx - (sx - view.dx) * k;
    view.dy = sy - (sy - view.dy) * k;
    view.z = z;
    applyView();
  }

  // ---- Pins (screen space, so they stay the same size at any zoom) ----
  let offMap = [];
  function placePins() {
    if (stage.hidden) { pinsEl.innerHTML = ""; placeEdges(); return; }
    const s = S();
    const placed = [];
    offMap = [];
    const html = [];
    const ordered = [...state.items].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "site" ? -1 : 1));
    for (const it of ordered) {
      const p = project(it.lat, it.lng);
      it.inside = p.inside;
      if (!p.inside) { offMap.push({ ...it, p }); it.sx = undefined; continue; }
      let x = view.dx + p.x * s, y = view.dy + p.y * s;
      if (it.kind === "story") {
        const ox = x, oy = y;
        for (let k = 0; k < 12 && placed.some((q) => Math.hypot(q.x - x, q.y - y) < 30); k++) {
          const a = (k * 60 + 30) * Math.PI / 180, r = 32 + 12 * Math.floor(k / 6);
          x = ox + r * Math.cos(a); y = oy - r * Math.sin(a);
        }
      }
      placed.push({ x, y });
      it.sx = x; it.sy = y;
      const on = it.key === state.sel;
      if (it.kind === "site") {
        html.push(`<button type="button" class="pin${on ? " on" : ""}" data-key="${it.key}" style="left:${x - 22}px;top:${y - 22}px"
          aria-label="${it.n}. ${esc(it.name)}" aria-pressed="${on}"><span>${it.n}</span></button>`);
      } else {
        html.push(`<button type="button" class="spin${it.folk ? " folk" : ""}${on ? " on" : ""}" data-key="${it.key}" style="left:${x - 20}px;top:${y - 20}px"
          aria-label="${esc(typeLabel(it.story.type))}: ${esc(it.name)}" aria-pressed="${on}"><span>${it.folk ? "‡" : ""}</span></button>`);
      }
    }
    pinsEl.innerHTML = html.join("") + '<span class="pin-tag" aria-hidden="true" hidden></span>';
    placeTag(placed);
    placeEdges();
  }

  // The selected place's name, on whichever side doesn't cover a neighbouring pin.
  function placeTag(placed) {
    const tag = pinsEl.querySelector(".pin-tag");
    const it = state.items.find((x) => x.key === state.sel);
    if (!tag || !it || it.sx === undefined) return;
    tag.hidden = false;
    tag.textContent = it.short;
    const w = tag.offsetWidth, h = tag.offsetHeight;
    const g = 16;
    const options = [
      [it.sx + g, it.sy - h / 2], [it.sx - g - w, it.sy - h / 2],
      [it.sx - w / 2, it.sy - g - h], [it.sx - w / 2, it.sy + g]
    ];
    const v = visible();
    const score = ([x, y]) => {
      let n = 0;
      for (const q of placed) {
        if (q.x === it.sx && q.y === it.sy) continue;
        if (q.x > x - 12 && q.x < x + w + 12 && q.y > y - 12 && q.y < y + h + 12) n += 1;
      }
      if (x < v.l + 4 || x + w > v.r - 4 || y < v.t + 4 || y + h > v.b) n += 5;
      return n;
    };
    let best = options[0], bestScore = Infinity;
    for (const o of options) { const sc = score(o); if (sc < bestScore) { best = o; bestScore = sc; } }
    tag.style.left = `${best[0]}px`;
    tag.style.top = `${best[1]}px`;
  }

  // One marker per distinct off-map spot, at the edge, pointing towards it.
  function placeEdges() {
    const edges = $(".edge-markers"), bottom = $(".bottom-edges");
    edges.innerHTML = ""; bottom.innerHTML = "";
    if (stage.hidden) return;
    const groups = {};
    for (const it of offMap) (groups[`${it.lat.toFixed(3)},${it.lng.toFixed(3)}`] ||= []).push(it);
    const v = visible();
    const R = { l: 12, r: v.W - 60, t: v.t + 12, b: v.b - 8 };
    const cx = (R.l + R.r) / 2, cy = (R.t + R.b) / 2;
    const s = S();
    Object.values(groups).forEach((g) => {
      const lead = g.find((i) => i.kind === "site") || g[0];
      const label = lead.short;
      const extra = g.length > 1 ? `, and ${g.length - 1} more ${g.length === 2 ? "story" : "stories"} there` : "";
      const vx = view.dx + lead.p.x * s - cx, vy = view.dy + lead.p.y * s - cy;
      const angle = Math.atan2(vx, -vy) * 180 / Math.PI;
      const tx = vx ? ((vx > 0 ? R.r : R.l) - cx) / vx : Infinity;
      const ty = vy ? ((vy > 0 ? R.b : R.t) - cy) / vy : Infinity;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `pill edge${lead.key === state.sel ? " on" : ""}`;
      btn.dataset.key = lead.key;
      btn.setAttribute("aria-label", `${lead.name}${extra}, beyond the edge of this map`);
      btn.innerHTML = `<span class="arrow" style="transform:rotate(${angle}deg)">${ARROW}</span>${esc(label)}`;
      if (ty <= tx && vy > 0) { bottom.appendChild(btn); return; }
      edges.appendChild(btn);
      const t = Math.min(tx, ty), w = btn.offsetWidth, h = btn.offsetHeight;
      const px = Math.max(R.l + w / 2, Math.min(R.r - w / 2, cx + vx * t));
      const py = Math.max(R.t + h / 2, Math.min(R.b - h / 2, cy + vy * t));
      btn.style.left = `${px - w / 2}px`;
      btn.style.top = `${py - h / 2}px`;
    });
  }

  // ---- Drag, pinch and wheel on the painted map ----
  const pointers = new Map();
  let gesture = null, moved = false;
  canvas.addEventListener("pointerdown", (e) => {
    if (!pointers.size) moved = false;
    if (stage.hidden || e.target.closest("button")) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    moved = false;
    const pts = [...pointers.values()];
    gesture = pts.length === 2
      ? { kind: "pinch", d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), z: view.z }
      : { kind: "pan", x: e.clientX, y: e.clientY, dx: view.dx, dy: view.dy };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId) || !gesture) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = canvas.getBoundingClientRect();
    if (gesture.kind === "pan") {
      const ddx = e.clientX - gesture.x, ddy = e.clientY - gesture.y;
      if (Math.abs(ddx) + Math.abs(ddy) > 4) moved = true;
      view.dx = gesture.dx + ddx; view.dy = gesture.dy + ddy;
      applyView();
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2 - rect.left, my = (a.y + b.y) / 2 - rect.top;
      zoomAt((gesture.z * d / gesture.d) / view.z, mx, my);
      moved = true;
    }
  });
  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (!pointers.size) gesture = null;
    else { const [p] = [...pointers.values()]; gesture = { kind: "pan", x: p.x, y: p.y, dx: view.dx, dy: view.dy }; }
  };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("wheel", (e) => {
    if (stage.hidden) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  const ro = new ResizeObserver(fit);
  ro.observe(canvas);

  // ---- Real maps (Leaflet) ----
  function addLeafletMarkers() {
    if (!lmap) return;
    Object.values(markers).forEach((m) => lmap.removeLayer(m));
    markers = {};
    for (const it of state.items) {
      const html = it.kind === "site"
        ? `<span class="lpin">${it.n}</span>`
        : `<span class="lspin${it.folk ? " folk" : ""}">${it.folk ? "‡" : ""}</span>`;
      const size = it.kind === "site" ? 32 : 26;
      const icon = L.divIcon({ className: "", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      markers[it.key] = L.marker([it.lat, it.lng], { icon, title: it.name, keyboard: true, zIndexOffset: it.kind === "site" ? 100 : 0 })
        .addTo(lmap).on("click", () => select(it.key));
    }
    renderSel();
  }

  function ensureLeaflet() {
    if (lmap || !window.L) return;
    lmap = L.map(leafletEl, { zoomControl: false, attributionControl: true }).setView(VILLAGE_CENTRE, 16);
    L.control.zoom({ position: "topright" }).addTo(lmap);
    addLeafletMarkers();
  }

  function setLayer(id) {
    const l = MAP_LAYERS.find((x) => x.id === id);
    if (!l || (l.kind !== "painted" && !l.url)) return;
    state.layer = id;
    try { localStorage.setItem("eh.layer", id); } catch { /* ignore */ }
    const painted = l.kind === "painted";
    stage.hidden = !painted;
    $(".zoom-ctl").hidden = !painted;
    leafletEl.hidden = painted;
    if (!painted) {
      ensureLeaflet();
      if (lmap) {
        if (tiles) lmap.removeLayer(tiles);
        tiles = L.tileLayer(l.url, { maxZoom: l.maxZoom || 18, attribution: l.attribution }).addTo(lmap);
        setTimeout(() => lmap.invalidateSize(), 0);
      }
    }
    $(".layer-name").textContent = l.name;
    $(".map-credit").textContent = l.title;
    root.querySelectorAll(".layer-row").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.layer === id)));
    if (painted) applyView(); else placePins();
    renderSel();
  }

  // ---- Selection and the place sheet ----
  function select(key) {
    state.sel = key;
    toggleMenu(false);
    const it = state.items.find((x) => x.key === key);
    if (it && lmap && !leafletEl.hidden) lmap.panTo([it.lat, it.lng]);
    if (it && !stage.hidden) {
      const v = visible();
      if (it.inside && (it.sx === undefined || it.sx < v.l + 30 || it.sx > v.r - 30 || it.sy < v.t + 30 || it.sy > v.b - 10)) centreOn(it.lat, it.lng);
      applyView();
    }
    renderSel();
  }

  function renderSel() {
    const it = state.items.find((x) => x.key === state.sel) || state.items[0];
    if (!it) return;
    state.sel = it.key;
    root.querySelectorAll(".pin, .spin, .edge").forEach((p) => {
      const on = p.dataset.key === it.key;
      p.classList.toggle("on", on);
      if (!p.classList.contains("edge")) p.setAttribute("aria-pressed", String(on));
    });
    Object.entries(markers).forEach(([k, m]) => m.getElement()?.firstElementChild?.classList.toggle("on", k === it.key));

    const dir = `https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}`;
    let head, sub, text, link;
    if (it.kind === "site") {
      const e = entryOf(it.site.entry);
      head = `<span class="num">${it.n}</span>`;
      sub = e ? `${esc(e.date)}. ${esc(e.title)}` : "";
      text = it.site.spot;
      link = `#/entry/${it.site.entry}`;
    } else {
      const s = it.story;
      head = `<span class="num story${it.folk ? " folk" : ""}" aria-hidden="true">${it.folk ? "‡" : "¶"}</span>`;
      sub = `${esc(typeLabel(s.type))}${s.when ? ` · ${esc(s.when)}` : ""}`;
      text = s.summary || String(s.body).split(/\n\s*\n/)[0];
      link = `#/story/${s.id}`;
    }
    $(".place").innerHTML = `
      <span class="grab" aria-hidden="true"></span>
      <div class="place-head">
        ${head}
        <div>
          <h2>${esc(it.name)}</h2>
          <p class="place-sub">${sub}</p>
        </div>
      </div>
      <p class="place-spot">${esc(text)}</p>
      <div class="actions">
        <a class="btn" href="${link}">Read the story</a>
        <a class="link" href="${dir}" target="_blank" rel="noopener">Directions</a>
      </div>`;
  }

  function toggleMenu(open) {
    state.menu = open;
    $(".layers").hidden = !open;
    $(".place").hidden = open;
    $('[data-act="menu"]').setAttribute("aria-expanded", String(open));
    if (open) root.querySelector(".layer-row[aria-pressed='true']")?.focus();
  }

  function toast(msg) {
    const t = $(".map-toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, 5000);
  }

  function locate() {
    if (!navigator.geolocation) return toast("Location isn’t available on this device.");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const km = distanceKm([latitude, longitude], VILLAGE_CENTRE);
      if (km > 3) toast(`You’re about ${Math.round(km)} km from the village.`);
      if (state.layer === "painted" && MAP_LAYERS.find((l) => l.id === "today")?.url) setLayer("today");
      if (lmap) {
        if (you) lmap.removeLayer(you);
        you = L.circleMarker([latitude, longitude], { radius: 8, color: "#ffffff", weight: 3, fillColor: "#2f4f8a", fillOpacity: 1 }).addTo(lmap);
        if (km <= 3) lmap.panTo([latitude, longitude]);
      }
    }, () => toast("Couldn’t get your location. Check that location is allowed for this app."), { enableHighAccuracy: true, timeout: 10000 });
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.key) { if (!moved) select(b.dataset.key); }
    else if (b.dataset.layer) { setLayer(b.dataset.layer); toggleMenu(false); }
    else if (b.dataset.act === "menu") toggleMenu(!state.menu);
    else if (b.dataset.act === "close") toggleMenu(false);
    else if (b.dataset.act === "locate") locate();
    else if (b.dataset.act === "zoom-in" || b.dataset.act === "zoom-out") {
      const v = visible();
      zoomAt(b.dataset.act === "zoom-in" ? 1.6 : 1 / 1.6, (v.l + v.r) / 2, (v.t + v.b) / 2);
    }
  });
  root.addEventListener("keydown", (e) => { if (e.key === "Escape" && state.menu) toggleMenu(false); });

  // Route argument: a site id, or a story id.
  const pickWanted = () => {
    const w = state.wanted;
    const hit = state.items.find((i) => i.key === `site:${w}`) || state.items.find((i) => i.key === `story:${w}`);
    if (hit) state.sel = hit.key;
    else if (!state.sel) state.sel = state.items[0].key;
  };

  pickWanted();
  setLayer(state.layer);
  fit();

  let alive = true;
  loadStories().then((stories) => {
    if (!alive) return;
    state.items = [...siteItems(), ...storyItems(stories)];
    const before = state.sel;
    pickWanted();
    if (state.sel !== before) {
      const it = state.items.find((x) => x.key === state.sel);
      if (it && it.inside !== false && project(it.lat, it.lng).inside) centreOn(it.lat, it.lng);
    }
    if (!stage.hidden) applyView(); else placePins();
    addLeafletMarkers();
    renderSel();
  });

  return () => { alive = false; ro.disconnect(); if (lmap) lmap.remove(); };
}

function distanceKm([a, b], [c, d]) {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
