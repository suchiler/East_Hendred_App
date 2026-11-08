// Settings you may need to change. See README.md, "Maps", for how to get each one.

// The National Library of Scotland's historic OS maps are served through MapTiler.
// Personal use is free; a public app needs NLS permission (maps@nls.uk) or their
// Historic Maps subscription. Paste the MapTiler key you're given here.
export const MAPTILER_KEY = "";

// Tile URLs. {key} is replaced with MAPTILER_KEY. Check the exact tileset IDs in
// MapTiler's NLS catalogue before going live: the IDs below are a best guess.
const nls = (tileset) => MAPTILER_KEY
  ? `https://api.maptiler.com/tiles/${tileset}/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`
  : "";

export const MAP_LAYERS = [
  { id: "painted", name: "Painted", full: "Painted map", swatch: "#adc189",
    title: "Painted map, drawn for this app", credit: "Illustrated for this app", kind: "painted" },
  { id: "today", name: "Today", full: "Today", swatch: "#f7d774",
    title: "Today · © OpenStreetMap contributors", credit: "© OpenStreetMap contributors", kind: "tiles",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' },
  { id: "1920s", name: "1920s", full: "1920s: OS One-inch, Popular Edition", swatch: "#e08a4a",
    title: "OS One-inch, 1919–26 · courtesy of NLS", credit: "Courtesy of the National Library of Scotland", kind: "tiles",
    url: nls("uk-osgb63k1919"), maxZoom: 15,
    attribution: 'Courtesy of the <a href="https://maps.nls.uk/">National Library of Scotland</a>',
    missing: "Needs a National Library of Scotland map key" },
  { id: "1870s", name: "1870s", full: "1870s: OS Six-inch, first edition", swatch: "#3a3530",
    title: "OS Six-inch, 1870s · courtesy of NLS", credit: "Courtesy of the National Library of Scotland", kind: "tiles",
    url: nls("uk-osgb10k1888"), maxZoom: 17,
    attribution: 'Courtesy of the <a href="https://maps.nls.uk/">National Library of Scotland</a>',
    missing: "Needs a National Library of Scotland map key" },
  { id: "1761", name: "1761", full: "1761: John Rocque’s Berkshire", swatch: "#b0473a",
    title: "Rocque’s Survey of Berkshire, 1761", credit: "Before enclosure: the open-field strips", kind: "tiles",
    url: "", maxZoom: 17, attribution: "",
    missing: "Needs a scan lined up with today’s map" }
];

// Centre of the village, for the real-map views.
export const VILLAGE_CENTRE = [51.5902, -1.3345];

// Hand-painted artwork. When a real painting is ready, save it in /art (WebP or PNG
// on a transparent or paper background) and add it here, e.g. "tower": "art/tower.webp".
// Anything not listed uses the built-in drawing.
export const ART_IMAGES = {};
