// The map view: a painted village map (pins locked to the drawing), plus real
// tiled maps (today and historic) through Leaflet.
import { SITES, ENTRIES } from "./data.js";
import { MAP_LAYERS, VILLAGE_CENTRE } from "./config.js";
import { esc } from "./util.js";

const STAGE_W = 390, STAGE_H = 757;
const T = 'transform="translate(0 120) scale(1.0656 1)"';

const PAINTED = `
<svg viewBox="0 0 390 757" width="390" height="757" aria-hidden="true" focusable="false">
  <rect width="390" height="757" fill="#f3efe4"/>
  <g filter="url(#wcm)" style="mix-blend-mode:multiply">
    <path d="M0 0H180L160 90L0 110Z" fill="#d5cf98" opacity=".6"/>
    <path d="M200 0H390V100L230 120Z" fill="#bfd09a" opacity=".6"/>
    <rect x="0" y="560" width="390" height="197" fill="#86a06a" opacity=".55"/>
    <g ${T}>
      <path d="M10 10L130 0L150 70L20 100Z" fill="#c2d19c" opacity=".6"/>
      <path d="M170 0L366 0L366 40L250 110L190 70Z" fill="#dccb8f" opacity=".6"/>
      <path d="M0 230L40 210L60 300L0 320Z" fill="#b0c58a" opacity=".55"/>
      <path d="M300 250L366 230L366 320L290 310Z" fill="#d2bf86" opacity=".55"/>
      <path d="M120 270L250 262L270 300L140 312Z" fill="#bccd94" opacity=".5"/>
      <ellipse cx="205" cy="198" rx="150" ry="70" fill="#e2cb9c" opacity=".6"/>
      <path d="M-10 110C60 120 90 70 150 86S230 130 270 96S330 40 380 52" stroke="#7ea2d2" stroke-width="12" fill="none" opacity=".6"/>
      <path d="M0 330C60 310 120 340 190 322S310 300 366 316V440H0Z" fill="#adc189" opacity=".7"/>
      <path d="M0 362C70 346 140 374 210 358S320 340 366 352V440H0Z" fill="#94ab74" opacity=".6"/>
      <circle cx="40" cy="150" r="15" fill="#6f8a55" opacity=".7"/>
      <circle cx="330" cy="290" r="17" fill="#6f8a55" opacity=".65"/>
      <circle cx="150" cy="40" r="13" fill="#6f8a55" opacity=".65"/>
    </g>
  </g>
  <g filter="url(#inkm)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g ${T}>
      <path d="M-10 110C60 120 90 70 150 86S230 130 270 96S330 40 380 52" stroke="#2f4a73" stroke-width="1.4"/>
      <path d="M-10 196C80 190 150 200 220 192S320 186 380 190" stroke="#2b2924" stroke-width="10"/>
      <path d="M-10 196C80 190 150 200 220 192S320 186 380 190" stroke="#efe6d0" stroke-width="7.6"/>
      <path d="M96 194C92 230 84 260 70 300" stroke="#2b2924" stroke-width="8"/>
      <path d="M96 194C92 230 84 260 70 300" stroke="#efe6d0" stroke-width="5.8"/>
      <path d="M236 192C240 160 248 130 262 100" stroke="#2b2924" stroke-width="7"/>
      <path d="M236 192C240 160 248 130 262 100" stroke="#efe6d0" stroke-width="5"/>
      <path d="M10 10L130 0L150 70L20 100ZM170 0L250 110M300 250L290 310M120 270L270 300M40 210L60 300" stroke="#2b2924" stroke-width=".8" stroke-dasharray="1 3.5"/>
      <path d="M0 330C60 310 120 340 190 322S310 300 366 316" stroke="#2b2924" stroke-width="1.1"/>
      <path d="M0 362C70 346 140 374 210 358S320 340 366 352" stroke="#2b2924" stroke-width=".9"/>
      <path d="M0 396C80 384 150 406 230 392S330 380 366 388" stroke="#2b2924" stroke-width=".8"/>
      <path d="M60 345l6-8M90 348l6-8M120 350l6-8M240 340l6-8M270 336l6-8M300 334l6-8M330 336l6-8" stroke="#2b2924" stroke-width=".7"/>
      <path d="M32 152c-6-8 2-18 10-16c8-2 12 8 8 14c-2 8-12 8-18 2M40 164v-8" stroke="#2b2924" stroke-width=".9"/>
      <path d="M322 292c-6-8 2-18 10-16c8-2 12 8 8 14c-2 8-12 8-18 2M330 304v-8" stroke="#2b2924" stroke-width=".9"/>
      <path d="M142 42c-6-8 2-18 10-16c8-2 12 8 8 14c-2 8-12 8-18 2M150 54v-8" stroke="#2b2924" stroke-width=".9"/>
    </g>
    <path d="M0 110L160 90L180 0M230 120L390 100" stroke="#2b2924" stroke-width=".8" stroke-dasharray="1 3.5"/>
    <path d="M356 100V128M356 100l-5 10M356 100l5 10" stroke="#2b2924" stroke-width="1.2"/>
  </g>
  <g font-family="IM Fell English, Georgia, serif" fill="#2b2924">
    <text x="356" y="142" font-size="13" text-anchor="middle">N</text>
    <text x="318" y="306" font-style="italic" font-size="14" text-anchor="middle">High Street</text>
    <text x="56" y="380" font-style="italic" font-size="14" transform="rotate(-72 56 380)">Cat Street</text>
    <text x="40" y="224" font-style="italic" font-size="15" fill="#2f4a73">East Hendred Brook</text>
    <text x="195" y="512" font-size="17" text-anchor="middle" letter-spacing="1">The Berkshire Downs</text>
  </g>
</svg>`;

const entryDate = (id) => ENTRIES.find((e) => e.id === id)?.date || "";
const entryTitle = (id) => ENTRIES.find((e) => e.id === id)?.title || "";

export function mapView(root, { sel = "champs" } = {}) {
  const state = {
    sel: SITES.find((s) => s.id === sel) ? sel : "champs",
    layer: localStorage.getItem("eh.layer") || "painted",
    menu: false
  };
  if (!MAP_LAYERS.find((l) => l.id === state.layer && (l.kind === "painted" || l.url))) state.layer = "painted";

  root.innerHTML = `
    <section class="map" aria-labelledby="map-h">
      <div class="map-canvas">
        <div class="map-stage" style="width:${STAGE_W}px;height:${STAGE_H}px">
          ${PAINTED}
          <div class="pins">
            ${SITES.filter((s) => !s.offMap).map((s) => `
              <button type="button" class="pin" data-site="${s.id}" style="left:${s.x - 22}px;top:${s.y - 22}px"
                aria-label="${s.n}. ${esc(s.name)}"><span>${s.n}</span></button>`).join("")}
            <span class="pin-tag" aria-hidden="true"></span>
          </div>
        </div>
        <div class="map-leaflet" hidden></div>
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
        <button type="button" class="pill knob" data-site="knob">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
          Scutchamer Knob
        </button>
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
  let lmap = null, tiles = null, markers = {}, you = null;

  // Scale the painted stage to cover the screen; pins scale with it, so they stay put.
  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const s = Math.max(w / STAGE_W, h / STAGE_H);
    const dx = (w - STAGE_W * s) / 2;
    const dy = Math.min(0, (h - STAGE_H * s) / 2);
    stage.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
  };
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);

  function ensureLeaflet() {
    if (lmap || !window.L) return;
    lmap = L.map(leafletEl, { zoomControl: false, attributionControl: true }).setView(VILLAGE_CENTRE, 16);
    L.control.zoom({ position: "topright" }).addTo(lmap);
    SITES.forEach((s) => {
      const icon = L.divIcon({ className: "", html: `<span class="lpin" data-n="${s.n}">${s.n}</span>`, iconSize: [36, 36], iconAnchor: [18, 18] });
      markers[s.id] = L.marker([s.lat, s.lng], { icon, title: `${s.n}. ${s.name}`, keyboard: true })
        .addTo(lmap).on("click", () => select(s.id));
    });
  }

  function setLayer(id) {
    const l = MAP_LAYERS.find((x) => x.id === id);
    if (!l || (l.kind !== "painted" && !l.url)) return;
    state.layer = id;
    try { localStorage.setItem("eh.layer", id); } catch { /* ignore */ }
    const painted = l.kind === "painted";
    stage.hidden = !painted;
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
    renderSel();
  }

  function select(id) {
    state.sel = id;
    toggleMenu(false);
    renderSel();
    const s = SITES.find((x) => x.id === id);
    if (lmap && !leafletEl.hidden && s) lmap.panTo([s.lat, s.lng]);
  }

  function renderSel() {
    const s = SITES.find((x) => x.id === state.sel);
    root.querySelectorAll(".pin").forEach((p) => {
      const on = p.dataset.site === state.sel;
      p.classList.toggle("on", on);
      p.setAttribute("aria-pressed", String(on));
    });
    Object.entries(markers).forEach(([k, m]) => m.getElement()?.querySelector(".lpin")?.classList.toggle("on", k === state.sel));
    $(".knob").classList.toggle("on", state.sel === "knob");
    const tag = $(".pin-tag");
    if (s && !s.offMap) {
      tag.hidden = false;
      tag.textContent = s.short;
      const left = s.x > 250;
      tag.style.top = `${s.y - 13}px`;
      tag.style.left = left ? "" : `${s.x + 24}px`;
      tag.style.right = left ? `${STAGE_W - s.x + 24}px` : "";
    } else tag.hidden = true;
    const dir = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
    $(".place").innerHTML = `
      <span class="grab" aria-hidden="true"></span>
      <div class="place-head">
        <span class="num">${s.n}</span>
        <div>
          <h2>${esc(s.name)}</h2>
          <p class="place-sub">${esc(entryDate(s.entry))}. ${esc(entryTitle(s.entry))}</p>
        </div>
      </div>
      <p class="place-spot">${esc(s.spot)}</p>
      <div class="actions">
        <a class="btn" href="#/entry/${s.entry}">Read the story</a>
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
      if (state.layer === "painted") {
        const ready = MAP_LAYERS.find((l) => l.id === "today");
        if (ready?.url) setLayer("today");
      }
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
    if (b.dataset.site) select(b.dataset.site);
    else if (b.dataset.layer) { setLayer(b.dataset.layer); toggleMenu(false); }
    else if (b.dataset.act === "menu") toggleMenu(!state.menu);
    else if (b.dataset.act === "close") toggleMenu(false);
    else if (b.dataset.act === "locate") locate();
  });
  root.addEventListener("keydown", (e) => { if (e.key === "Escape" && state.menu) toggleMenu(false); });

  setLayer(state.layer);
  fit();
  return () => { ro.disconnect(); if (lmap) lmap.remove(); };
}

function distanceKm([a, b], [c, d]) {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
