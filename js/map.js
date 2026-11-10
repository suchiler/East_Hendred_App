// The map view: the painted village map (a pre-rendered image), plus real tiled maps
// (today, habitats, geology) through Leaflet. Places are positioned from their lat/lng;
// places beyond the painted drawing have no pin there, but are in the List and on the real maps.
//
// Accessibility: the header and controls come first in tab order, then the pins (walk
// stops in number order, then other places, nature and stories). "List" offers every
// place as a plain list. Choosing a place moves focus to its sheet; closing returns
// focus to the pin. The layer and list sheets are modal dialogs that trap focus.
import { SITES, ENTRIES, NATURE_SITES } from "./data.js";
import { MAP_LAYERS, VILLAGE_CENTRE, layerReady } from "./config.js";
import { MAP_W, MAP_H, project } from "./painted-map.js";
import { loadStories, isFolklore, typeName } from "./stories.js";
import { esc } from "./util.js";

const entryOf = (id) => ENTRIES.find((e) => e.id === id);
const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const LEAF = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19 13 11"/></svg>';
const MAX_ZOOM = 3.5;
// The painted map is shown as a pre-rendered image (see tools/painted-map/render.mjs):
// big SVG watercolour filters are too heavy for some phones.
const PAINTED_IMG = `<img class="painted-img" src="art/painted-map@2x.webp" srcset="art/painted-map@2x.webp 2x, art/painted-map@3x.webp 3x" width="${MAP_W}" height="${MAP_H}" alt="" decoding="async" draggable="false">`;
// Landscape phones: sheets become a side panel (must match the CSS media query).
const SIDE_PANEL = "(orientation: landscape) and (max-height: 500px)";

const RANK = { site: 0, nature: 1, story: 2 };
// Pin order for tab order and the list: walk stops by number, other places, nature, stories.
const order = (a, b) => (RANK[a.kind] - RANK[b.kind]) || ((a.n ?? 99) - (b.n ?? 99));

function siteItems() {
  return SITES.map((s) => ({ key: `site:${s.id}`, kind: "site", id: s.id, n: s.n, name: s.name, short: s.short, lat: s.lat, lng: s.lng, site: s }));
}
function natureItems() {
  return NATURE_SITES.map((s) => ({ key: `nature:${s.id}`, kind: "nature", id: s.id, name: s.name, short: s.short, lat: s.lat, lng: s.lng, place: s }));
}
function storyItems(stories) {
  return stories.filter((s) => Array.isArray(s.coordinates) && s.coordinates.length === 2)
    .map((s) => ({ key: `story:${s.id}`, kind: "story", id: s.id, name: s.title, short: s.title,
      lat: Number(s.coordinates[0]), lng: Number(s.coordinates[1]), folk: isFolklore(s), story: s }));
}

// The little marker each kind of place uses (shared by pins, the key and the list).
// Story pins: an open book; legends, folk tales and ghost stories: a crescent moon.
const BOOK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z"/><path d="M12 6.5v13"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M19.5 15.5A8 8 0 0 1 9 4.2a8 8 0 1 0 10.5 11.3Z" fill="currentColor"/><path d="M17 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z" fill="currentColor"/></svg>';
export const storyIcon = (folk) => (folk ? MOON : BOOK);

function glyph(it) {
  if (it.kind === "site") return it.n ? String(it.n) : "";
  if (it.kind === "nature") return LEAF;
  return storyIcon(it.folk);
}
function pinLabel(it) {
  if (it.kind === "site") return `${it.n ? `Walk stop ${it.n}: ` : ""}${it.name}`;
  if (it.kind === "nature") return `Nature: ${it.name}`;
  return `${typeName(it.story.type)}: ${it.name}`;
}

export function mapView(root, { sel } = {}) {
  const state = {
    sel: null,
    opener: null,    // the place whose pin opened the sheet, to return focus to
    wanted: sel || null,
    layer: "painted", // always open on the painted map
    dialog: null,     // the open modal sheet, if any
    you: null,        // last known position {lat, lng}
    items: [...siteItems(), ...natureItems()]
  };
  const ready = MAP_LAYERS.filter(layerReady);

  root.innerHTML = `
    <section class="map" aria-labelledby="map-h">
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
        <div class="map-key" id="map-key" hidden></div>
        <div class="pill-row">
          <button type="button" class="pill" data-act="menu" aria-haspopup="dialog" aria-expanded="false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="m2 12.5 10 5 10-5"/></svg>
            Map: <span class="layer-name"></span>
          </button>
          <button type="button" class="pill" data-act="list" aria-haspopup="dialog" aria-expanded="false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>
            List
          </button>
          <button type="button" class="pill key-btn" data-act="key" aria-expanded="false" aria-controls="map-key">Key</button>
        </div>
        <p class="map-attrib">
          <button type="button" class="attrib-toggle" data-act="attrib" aria-expanded="false" aria-label="Show full map credits" hidden>i</button>
          <span class="attrib-text"></span>
        </p>
      </div>

      <div class="map-canvas" role="region" aria-label="Painted map. Use the arrow keys to move it, and plus and minus to zoom." tabindex="0">
        <div class="map-stage" style="width:${MAP_W}px;height:${MAP_H}px">${PAINTED_IMG}</div>
        <div class="map-leaflet" hidden></div>
        <div class="pins"></div>
        <div class="zoom-ctl">
          <button type="button" data-act="zoom-in" aria-label="Zoom in">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
          <button type="button" data-act="zoom-out" aria-label="Zoom out">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>
        </div>
      </div>

      <section class="sheet place" aria-labelledby="place-h" hidden></section>

      <section class="sheet layers" role="dialog" aria-modal="true" aria-labelledby="layers-h" hidden>
        <div class="sheet-head">
          <h2 id="layers-h">Choose a map</h2>
          <button type="button" class="icon-btn" data-act="close-dialog" aria-label="Close">${CLOSE}</button>
        </div>
        <ul class="layer-list" role="radiogroup" aria-labelledby="layers-h">
          ${ready.map((l) => `<li role="none"><button type="button" role="radio" class="layer-row" data-layer="${l.id}" aria-checked="false">
              <span class="swatch" style="background:${l.swatch}"></span>
              <span class="layer-text"><span class="layer-full">${esc(l.full)}</span>
              <span class="layer-sub">${esc(l.credit)}</span></span>
              <svg class="tick" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            </button></li>`).join("")}
        </ul>
      </section>

      <section class="sheet list-sheet" role="dialog" aria-modal="true" aria-labelledby="list-h" hidden>
        <div class="sheet-head">
          <h2 id="list-h">Places on the map</h2>
          <button type="button" class="icon-btn" data-act="close-dialog" aria-label="Close">${CLOSE}</button>
        </div>
        <div class="place-list"></div>
      </section>
    </section>`;

  const $ = (q) => root.querySelector(q);
  const mapEl = $(".map"), canvas = $(".map-canvas"), stage = $(".map-stage"), leafletEl = $(".map-leaflet");
  const pinsEl = $(".pins"), place = $(".place");
  let lmap = null, tiles = null, overlay = null, you = null;
  let markers = {};
  // Painted map view: base cover scale, zoom factor and offset (screen px).
  const view = { base: 1, z: 1, dx: 0, dy: 0, ready: false };
  const S = () => view.base * view.z;
  const sidePanel = () => matchMedia(SIDE_PANEL).matches;

  // The part of the map not covered by the header, the pills or an open sheet.
  const visible = () => {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const head = $(".map-head").offsetHeight;
    const pills = $(".map-pills");
    const panel = sidePanel() && !place.hidden ? place.offsetWidth : 0;
    return { l: 0, r: W - panel, t: head, b: Math.max(head + 80, pills.offsetTop - 8), W, H };
  };

  function clampView() {
    const { W, H, t, b, r } = visible();
    const w = MAP_W * S(), h = MAP_H * S();
    // The map may slide in from under the side panel (landscape), down from under the header,
    // and up from under the place sheet, so places near any edge can be shown.
    const vw = Math.min(W, r);
    view.dx = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, view.dx));
    view.dy = h <= H ? (H - h) / 2 : Math.min(t, Math.max(Math.min(H, b) - h, view.dy));
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
      // A deep-linked place opens its sheet (a side panel in landscape) after this first layout,
      // so centre again once it has its size.
      if (it) requestAnimationFrame(() => { if (state.sel === it.key && c !== VILLAGE_CENTRE) { centreOn(c[0], c[1]); applyView(); } });
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
  let pinsSig = "";
  function placePins() {
    if (stage.hidden) { pinsEl.innerHTML = ""; pinsSig = ""; return; }
    const s = S();
    const placed = [];
    const html = [], moves = [], keys = [];
    for (const it of [...state.items].sort(order)) {
      const p = project(it.lat, it.lng);
      it.inside = p.inside;
      if (!p.inside) { it.sx = undefined; continue; }
      let x = view.dx + p.x * s, y = view.dy + p.y * s;
      // Nudge pins off pins already placed so their 44px touch targets don't overlap
      // (walk stops are placed first, so they move least). Zooming in separates them anyway.
      const ox = x, oy = y;
      for (let k = 0; k < 18 && placed.some((q) => Math.hypot(q.x - x, q.y - y) < 44); k++) {
        const a = (k * 45 + 22.5) * Math.PI / 180, r = 44 + 14 * Math.floor(k / 8);
        x = ox + r * Math.cos(a); y = oy - r * Math.sin(a);
      }
      placed.push({ x, y });
      it.sx = x; it.sy = y;
      const on = it.key === state.sel;
      const r = it.kind === "site" ? 22 : 20;
      moves.push([x - r, y - r]); keys.push(it.key);
      const cls = it.kind === "site" ? "pin" : it.kind === "nature" ? "npin" : `spin${it.folk ? " folk" : ""}`;
      const inner = it.kind === "site" && !it.n ? `<span class="plain"></span>` : `<span aria-hidden="true">${glyph(it)}</span>`;
      html.push(`<button type="button" class="${cls}${on ? " on" : ""}" data-key="${it.key}" style="left:${x - r}px;top:${y - r}px"
        aria-label="${esc(pinLabel(it))}"${on ? ' aria-current="true"' : ""}>${inner}</button>`);
    }
    if (state.you) {
      const p = project(state.you.lat, state.you.lng);
      if (p.inside) {
        const [l, t] = [view.dx + p.x * s - 10, view.dy + p.y * s - 10];
        moves.push([l, t]); keys.push("you");
        html.push(`<span class="you-dot" style="left:${l}px;top:${t}px" role="img" aria-label="You are here"></span>`);
      }
    }
    // Rebuild only when the pins themselves change; while panning or pinching just move them,
    // which is much cheaper on phones and keeps keyboard focus on a pin.
    const sig = `${keys.join(",")}|${state.sel}`;
    if (sig !== pinsSig) {
      const focusedKey = document.activeElement?.closest?.(".pins [data-key]")?.dataset.key;
      pinsEl.innerHTML = html.join("") + '<span class="pin-tag" aria-hidden="true" hidden></span>';
      pinsSig = sig;
      if (focusedKey) pinsEl.querySelector(`[data-key="${CSS.escape(focusedKey)}"]`)?.focus({ preventScroll: true });
    } else {
      moves.forEach(([l, t], i) => { const el = pinsEl.children[i]; el.style.left = `${l}px`; el.style.top = `${t}px`; });
    }
    // Pins under the header or the controls can't be tapped there: fade them out and let taps
    // pass through. They stay in the tab order, and focusing one scrolls it into view.
    const v = visible();
    for (const el of pinsEl.querySelectorAll("[data-key]")) {
      const it = state.items.find((x) => x.key === el.dataset.key);
      const under = it && (it.sy < v.t + 4 || it.sy > v.b + 6);
      el.classList.toggle("offstage", !!under && el !== document.activeElement);
    }
    placeTag(placed);
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

  // Keyboard alternative to dragging (WCAG 2.5.7): arrows pan, + and − zoom.
  canvas.addEventListener("keydown", (e) => {
    if (stage.hidden || e.target !== canvas) return;
    const step = 60, v = visible();
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) { view.dx += moves[e.key][0]; view.dy += moves[e.key][1]; applyView(); e.preventDefault(); }
    else if (e.key === "+" || e.key === "=") { zoomAt(1.4, (v.l + v.r) / 2, (v.t + v.b) / 2); e.preventDefault(); }
    else if (e.key === "-" || e.key === "_") { zoomAt(1 / 1.4, (v.l + v.r) / 2, (v.t + v.b) / 2); e.preventDefault(); }
  });

  // A pin that gets keyboard focus while hidden under the header or controls scrolls into view.
  pinsEl.addEventListener("focusin", (e) => {
    const key = e.target.closest("[data-key]")?.dataset.key;
    const it = key && state.items.find((x) => x.key === key);
    if (!it || it.sx === undefined) return;
    const v = visible();
    if (it.sx < v.l + 22 || it.sx > v.r - 22 || it.sy < v.t + 22 || it.sy > v.b - 22) { centreOn(it.lat, it.lng); applyView(); }
  });

  const ro = new ResizeObserver(() => { fit(); fitAttrib(); positionPills(); });
  ro.observe(canvas);

  // ---- Real maps (Leaflet) ----
  function addLeafletMarkers() {
    if (!lmap) return;
    Object.values(markers).forEach((m) => lmap.removeLayer(m));
    markers = {};
    for (const it of [...state.items].sort(order)) {
      const cls = it.kind === "site" ? `lpin${it.n ? "" : " plain"}` : it.kind === "nature" ? "lnpin" : `lspin${it.folk ? " folk" : ""}`;
      const html = `<span class="${cls}" aria-hidden="true">${glyph(it)}</span>`;
      const size = it.kind === "site" ? 32 : 26;
      const icon = L.divIcon({ className: "lmark", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      const m = L.marker([it.lat, it.lng], { icon, title: pinLabel(it), alt: pinLabel(it), keyboard: true, zIndexOffset: it.kind === "site" ? 100 : 0 })
        .addTo(lmap).on("click", () => select(it.key, { focus: true }));
      const el = m.getElement();
      if (el) { el.setAttribute("role", "button"); el.setAttribute("aria-label", pinLabel(it)); el.dataset.key = it.key; }
      markers[it.key] = m;
    }
    nudgeMarkers();
    renderSel();
  }

  // Overlapping markers on the real maps are nudged apart so each stays visible and tappable.
  function nudgeMarkers() {
    if (!lmap) return;
    const placed = [];
    for (const it of [...state.items].sort(order)) {
      const m = markers[it.key];
      const inner = m?.getElement()?.firstElementChild;
      if (!inner) continue;
      const p = lmap.latLngToContainerPoint([it.lat, it.lng]);
      let x = p.x, y = p.y;
      for (let k = 0; k < 12 && placed.some((q) => Math.hypot(q.x - x, q.y - y) < 28); k++) {
        const a = (k * 60 + 30) * Math.PI / 180, r = 30 + 10 * Math.floor(k / 6);
        x = p.x + r * Math.cos(a); y = p.y - r * Math.sin(a);
      }
      placed.push({ x, y });
      inner.style.transform = x !== p.x || y !== p.y ? `translate(${(x - p.x).toFixed(0)}px, ${(y - p.y).toFixed(0)}px)` : "";
    }
  }

  // Centre a real-map position in the part of the screen not covered by the header or sheet.
  function centreLeaflet(lat, lng, zoom) {
    if (!lmap) return;
    lmap.setView([lat, lng], zoom ?? lmap.getZoom(), { animate: false });
    const v = visible();
    lmap.panBy([(v.W - (v.l + v.r)) / 2, v.H / 2 - (v.t + v.b) / 2], { animate: false });
  }

  function ensureLeaflet() {
    if (lmap || !window.L) return;
    // No floating attribution box: the credit is shown as text under the layer pill.
    lmap = L.map(leafletEl, { zoomControl: false, attributionControl: false }).setView(VILLAGE_CENTRE, 16);
    L.control.zoom({ position: "topright" }).addTo(lmap);
    lmap.on("zoomend", nudgeMarkers);
    addLeafletMarkers();
  }

  // The Key: pin styles always, plus the colour key for overlay maps.
  function renderKey(l) {
    const pins = [
      ['<span class="pin-sample pin"><span>1</span></span>', "Walk stop (numbered in walk order)"],
      ['<span class="pin-sample pin"><span class="plain"></span></span>', "Other place"],
      [`<span class="pin-sample spin"><span>${BOOK}</span></span>`, "Story from village history"],
      [`<span class="pin-sample spin folk"><span>${MOON}</span></span>`, "Legend, folk tale or ghost story"],
      [`<span class="pin-sample npin"><span>${LEAF}</span></span>`, "Nature"],
      ['<span class="pin-sample"><span class="you-dot sample"></span></span>', "You are here (after you tap the location button)"]
    ];
    $(".map-key").innerHTML = `
      <h2 class="key-h">Pins</h2>
      <ul>${pins.map(([sample, name]) => `<li>${sample}<span>${name}</span></li>`).join("")}</ul>
      ${l.key ? `<h2 class="key-h">${esc(l.name)} colours</h2>
      <ul>${l.key.map(([name, colour]) => `<li><span class="sw" style="background:${colour}"></span><span>${esc(name)}</span></li>`).join("")}</ul>` : ""}`;
  }

  // The credit is one line; an "i" button expands it when it doesn't fit.
  function fitAttrib() {
    const p = $(".map-attrib"), text = $(".attrib-text"), btn = $(".attrib-toggle");
    if (p.classList.contains("open")) return;
    btn.hidden = !(text.scrollWidth > text.clientWidth + 1);
  }

  function setLayer(id) {
    const l = MAP_LAYERS.find((x) => x.id === id);
    if (!l || !layerReady(l)) return;
    state.layer = id;
    const painted = l.kind === "painted";
    stage.hidden = !painted;
    $(".zoom-ctl").hidden = !painted;
    leafletEl.hidden = painted;
    canvas.tabIndex = painted ? 0 : -1;
    if (painted) canvas.setAttribute("role", "region"); else canvas.removeAttribute("role");
    canvas.toggleAttribute("aria-label", painted);
    if (painted) canvas.setAttribute("aria-label", "Painted map. Use the arrow keys to move it, and plus and minus to zoom.");
    const attrib = $(".map-attrib");
    attrib.classList.remove("loading");
    if (!painted) {
      ensureLeaflet();
      if (!lmap) toast("This map couldn’t start. Check your signal and reload the app.");
      if (lmap) {
        if (tiles) lmap.removeLayer(tiles);
        if (overlay) { lmap.removeLayer(overlay); overlay = null; }
        // crossOrigin: OSM allows it, and the offline cache stores CORS tiles far more compactly than opaque ones.
        tiles = L.tileLayer(l.url, { maxZoom: l.maxZoom || 18, crossOrigin: /openstreetmap\.org/.test(l.url) }).addTo(lmap);
        // Say so if the base map can't load (offline, or the map server refusing), rather than a blank screen.
        let warned = false;
        tiles.on("tileerror", () => { if (!warned) { warned = true; toast(navigator.onLine === false ? "You’re offline, so only map areas you’ve already viewed will show." : "Some of this map couldn’t load. Check your signal and try again."); } });
        if (l.wms) {
          const big = l.wms.tileSize === 512;
          overlay = L.tileLayer.wms(l.wms.url, { layers: l.wms.layers, format: "image/png", transparent: true,
            opacity: l.wms.opacity ?? 0.6, maxZoom: l.maxZoom || 18,
            ...(big ? { tileSize: 512, zoomOffset: -1 } : {}) });
          // Government map servers can be busy and turn requests away (503). Retry each failed
          // image up to 5 times with growing pauses, and say "Loading…" until every image has
          // arrived; if some still fail, say so rather than leaving silent gaps.
          const status = () => {
            const imgs = [...(overlay?.getContainer()?.querySelectorAll("img") || [])];
            const gaveUp = imgs.filter((i) => i.dataset.failed === "1").length;
            const waiting = imgs.filter((i) => i.dataset.failed !== "1" && !(i.complete && i.naturalWidth)).length;
            if (waiting) { attrib.dataset.loading = `Loading ${l.name.toLowerCase()}…`; attrib.classList.add("loading"); }
            else if (gaveUp) { attrib.dataset.loading = `Some ${l.name.toLowerCase()} areas couldn’t load (the map server is busy).`; attrib.classList.add("loading"); }
            else attrib.classList.remove("loading");
          };
          const later = () => setTimeout(status, 0);
          overlay.on("loading tileloadstart tileload tileunload load", later);
          overlay.on("tileerror", (ev) => {
            const img = ev.tile, n = Number(img.dataset.retries || 0);
            if (n >= 5) { img.dataset.failed = "1"; later(); return; }
            img.dataset.retries = String(n + 1);
            setTimeout(() => { if (img.isConnected) img.src = `${img.src.replace(/&retry=\d+/, "")}&retry=${n + 1}`; }, 1000 * 2 ** n + Math.random() * 500);
            later();
          });
          overlay.addTo(lmap);
        }
        // Once the map has measured itself: centre on the selected place (or keep the view),
        // zoomed out a little for overlays so the whole parish's pattern shows.
        setTimeout(() => {
          lmap.invalidateSize();
          const z = l.zoom ? Math.min(lmap.getZoom(), l.zoom) : lmap.getZoom();
          const sel = state.items.find((x) => x.key === state.sel);
          if (sel) centreLeaflet(sel.lat, sel.lng, z); else lmap.setZoom(z);
          nudgeMarkers();
        }, 0);
      }
    }
    $(".layer-name").textContent = l.name;
    $(".map-credit").textContent = l.title;
    $(".attrib-text").innerHTML = l.attribution || "";
    attrib.classList.remove("open");
    $(".attrib-toggle").setAttribute("aria-expanded", "false");
    renderKey(l);
    root.querySelectorAll(".layer-row").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.layer === id)));
    if (painted) applyView(); else placePins();
    renderSel();
    requestAnimationFrame(fitAttrib);
  }

  // ---- Selection and the place sheet ----
  function focusPin(key) {
    const sel = `[data-key="${CSS.escape(key)}"]`;
    const el = pinsEl.querySelector(sel) || markers[key]?.getElement() || $('[data-act="list"]');
    el?.focus({ preventScroll: false });
  }

  function select(key, { focus = false } = {}) {
    // Choosing the selected place again closes its sheet.
    if (key && key === state.sel) key = null;
    const closing = !key && state.sel;
    const returnTo = state.opener;
    state.sel = key;
    if (key) state.opener = key;
    const it = state.items.find((x) => x.key === key);
    if (it && lmap && !leafletEl.hidden) setTimeout(() => centreLeaflet(it.lat, it.lng), 0);
    renderSel();
    if (it && !stage.hidden) {
      const v = visible();
      if (it.inside && (it.sx === undefined || it.sx < v.l + 30 || it.sx > v.r - 30 || it.sy < v.t + 30 || it.sy > v.b - 10)) centreOn(it.lat, it.lng);
      applyView();
    }
    if (key && focus) $("#place-h")?.focus();
    if (closing && focus && returnTo) focusPin(returnTo);
  }

  function renderSel() {
    const it = state.items.find((x) => x.key === state.sel);
    Object.entries(markers).forEach(([k, m]) => {
      const el = m.getElement();
      el?.firstElementChild?.classList.toggle("on", !!it && k === it.key);
      if (el) { if (it && k === it.key) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current"); }
    });
    if (!it) {
      state.sel = null;
      place.hidden = true;
      mapEl.classList.remove("has-sheet");
      positionPills();
      return;
    }
    place.hidden = false;
    mapEl.classList.add("has-sheet");

    const dir = `https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}`;
    let head, sub, text, link;
    if (it.kind === "site") {
      const e = entryOf(it.site.entry);
      head = it.n ? `<span class="num" aria-hidden="true">${it.n}</span>` : `<span class="num plain" aria-hidden="true"></span>`;
      sub = `${it.n ? `Walk stop ${it.n}. ` : ""}${e ? `${esc(e.date)}: ${esc(e.title)}` : ""}`;
      text = it.site.spot;
      link = `#/entry/${it.site.entry}`;
    } else if (it.kind === "nature") {
      const p = it.place;
      head = `<span class="num nature" aria-hidden="true">${LEAF}</span>`;
      sub = esc(p.kind);
      text = `${p.why} ${p.access || ""}`.trim();
      link = `#/land/${p.section}`;
    } else {
      const s = it.story;
      head = `<span class="num story${it.folk ? " folk" : ""}" aria-hidden="true">${storyIcon(it.folk)}</span>`;
      sub = `${esc(typeName(s.type))}${s.when ? ` · ${esc(s.when)}` : ""}`;
      text = s.summary || String(s.body).split(/\n\s*\n/)[0];
      link = `#/story/${s.id}`;
    }
    place.innerHTML = `
      <span class="grab" aria-hidden="true"></span>
      <button type="button" class="icon-btn sheet-close" data-act="close-place" aria-label="Close">${CLOSE}</button>
      <div class="place-head">
        ${head}
        <div>
          <h2 id="place-h" tabindex="-1">${esc(it.name)}</h2>
          <p class="place-sub">${sub}</p>
        </div>
      </div>
      <p class="place-spot">${esc(text)}</p>
      <div class="actions">
        <a class="btn" href="${link}">${it.kind === "nature" ? "Read about it" : "Read the story"}</a>
        <a class="link" href="${dir}" target="_blank" rel="noopener">Directions<span class="sr-only"> (opens a maps app)</span></a>
      </div>`;
    positionPills();
  }

  // The pill row sits just above the place sheet when one is open (beside it on landscape phones).
  function positionPills() {
    const pills = $(".map-pills");
    const shown = !place.hidden;
    if (sidePanel()) {
      pills.style.bottom = "12px";
      pills.style.right = `${shown ? place.offsetWidth + 12 : 12}px`;
    } else {
      pills.style.right = "";
      pills.style.bottom = `${shown ? place.offsetHeight + 10 : 12}px`;
    }
    if (!stage.hidden) applyView();
  }

  // ---- Modal sheets (Choose a map, List) ----
  const focusables = (el) => [...el.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.closest("[hidden]"));
  function openDialog(sheet, trigger, focusEl) {
    closeDialog(false);
    state.dialog = { sheet, trigger };
    sheet.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    for (const el of [canvas, $(".map-pills"), $(".map-head"), place]) el.inert = true;
    (focusEl || focusables(sheet)[0])?.focus();
  }
  function closeDialog(returnFocus = true) {
    const d = state.dialog;
    if (!d) return;
    state.dialog = null;
    d.sheet.hidden = true;
    d.trigger.setAttribute("aria-expanded", "false");
    for (const el of [canvas, $(".map-pills"), $(".map-head"), place]) el.inert = false;
    if (returnFocus) d.trigger.focus();
  }
  root.querySelectorAll('.sheet[role="dialog"]').forEach((sheet) => sheet.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const f = focusables(sheet);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && e.target.getAttribute("role") === "radio") {
      // Radio group: arrows move between the maps.
      const radios = [...sheet.querySelectorAll('[role="radio"]')];
      const i = radios.indexOf(e.target) + (e.key === "ArrowDown" ? 1 : -1);
      radios[(i + radios.length) % radios.length].focus();
      e.preventDefault();
    }
  }));

  function openLayers() {
    openDialog($(".layers"), $('[data-act="menu"]'), root.querySelector('.layer-row[aria-checked="true"]'));
  }

  function openList() {
    const items = [...state.items].sort(order);
    const groups = [
      ["Walk stops", items.filter((i) => i.kind === "site" && i.n)],
      ["Other places", items.filter((i) => i.kind === "site" && !i.n)],
      ["Nature", items.filter((i) => i.kind === "nature")],
      ["Stories", items.filter((i) => i.kind === "story")]
    ].filter(([, list]) => list.length);
    $(".place-list").innerHTML = groups.map(([title, list], gi) => `
      <h3 class="list-h" id="list-g${gi}">${title}</h3>
      <ul aria-labelledby="list-g${gi}">${list.map((it) => {
        const mark = it.kind === "site" ? `<span class="pin-sample pin"><span class="${it.n ? "" : "plain"}">${it.n ?? ""}</span></span>`
          : it.kind === "nature" ? `<span class="pin-sample npin"><span>${LEAF}</span></span>`
          : `<span class="pin-sample spin${it.folk ? " folk" : ""}"><span>${glyph(it)}</span></span>`;
        const sub = it.kind === "story" ? typeName(it.story.type) : it.kind === "nature" ? it.place.kind : (it.n ? `Walk stop ${it.n}` : "");
        return `<li><button type="button" class="list-row" data-pick="${it.key}">${mark}
          <span class="list-text"><span class="list-name">${esc(it.name)}</span>${sub ? `<span class="list-sub">${esc(sub)}</span>` : ""}</span></button></li>`;
      }).join("")}</ul>`).join("");
    openDialog($(".list-sheet"), $('[data-act="list"]'));
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
      state.you = { lat: latitude, lng: longitude };
      if (!stage.hidden) {
        // Painted map: centre on you if you're inside the drawing; otherwise just say how far away you are.
        const p = project(latitude, longitude);
        if (p.inside) {
          if (view.z < 1.6) view.z = 1.6;
          centreOn(latitude, longitude);
          applyView();
        } else {
          toast(`You’re about ${km < 10 ? km.toFixed(1) : Math.round(km)} km from the village, outside this painted map.`);
          placePins();
        }
      }
      if (lmap) {
        if (you) lmap.removeLayer(you);
        you = L.marker([latitude, longitude], { icon: L.divIcon({ className: "lmark", html: '<span class="you-dot" role="img" aria-label="You are here"></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
          interactive: false, keyboard: false, zIndexOffset: 1000 }).addTo(lmap);
        if (!leafletEl.hidden) lmap.setView([latitude, longitude], Math.max(lmap.getZoom(), 16));
      }
    }, () => toast("Couldn’t get your location. Check that location is allowed for this app."), { enableHighAccuracy: true, timeout: 10000 });
  }

  // Listen on this view's own element: #view is shared by every screen, so a listener on it
  // would outlive this map and keep acting on a removed Leaflet map.
  mapEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const act = b.dataset.act;
    if (b.dataset.key) { if (!moved) select(b.dataset.key, { focus: true }); }
    else if (b.dataset.pick) { closeDialog(false); state.sel = null; select(b.dataset.pick, { focus: true }); }
    else if (b.dataset.layer) { setLayer(b.dataset.layer); closeDialog(); }
    else if (act === "close-place") select(null, { focus: true });
    else if (act === "close-dialog") closeDialog();
    else if (act === "menu") openLayers();
    else if (act === "list") openList();
    else if (act === "key") {
      const key = $(".map-key"), open = key.hidden;
      key.hidden = !open; b.setAttribute("aria-expanded", String(open));
      if (!stage.hidden) applyView();
    } else if (act === "attrib") {
      const p = $(".map-attrib"), open = !p.classList.contains("open");
      p.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open));
      b.setAttribute("aria-label", open ? "Show less of the map credits" : "Show full map credits");
      if (!stage.hidden) applyView();
    } else if (act === "locate") locate();
    else if (act === "zoom-in" || act === "zoom-out") {
      const v = visible();
      zoomAt(act === "zoom-in" ? 1.6 : 1 / 1.6, (v.l + v.r) / 2, (v.t + v.b) / 2);
    }
  });
  // Leaflet markers are focusable divs: Enter or Space chooses them like a button.
  leafletEl.addEventListener("keydown", (e) => {
    const el = e.target.closest(".leaflet-marker-icon[data-key]");
    if (el && (e.key === "Enter" || e.key === " ")) { select(el.dataset.key, { focus: true }); e.preventDefault(); }
  });
  const onKey = (e) => {
    if (e.key !== "Escape") return;
    if (state.dialog) closeDialog();
    else if (state.sel) select(null, { focus: true });
  };
  document.addEventListener("keydown", onKey);

  // Route argument: a site id, or a story id.
  const pickWanted = () => {
    // Only a deep link (#/map/<id>) opens a place; otherwise the map opens with no sheet.
    const w = state.wanted;
    if (!w) return;
    const hit = state.items.find((i) => i.key === `site:${w}`) || state.items.find((i) => i.key === `nature:${w}`) || state.items.find((i) => i.key === `story:${w}`);
    if (hit) { state.sel = hit.key; state.opener = hit.key; }
  };

  pickWanted();
  setLayer(state.layer);
  fit();

  let alive = true;
  loadStories().then((stories) => {
    if (!alive) return;
    state.items = [...siteItems(), ...natureItems(), ...storyItems(stories)];
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

  return () => { alive = false; ro.disconnect(); document.removeEventListener("keydown", onKey); if (lmap) lmap.remove(); };
}

function distanceKm([a, b], [c, d]) {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
