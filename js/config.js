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
    title: "Painted map", credit: "Traced from OpenStreetMap, painted for this app", kind: "painted",
    attribution: 'Painted for this app from map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' },
  { id: "today", name: "Today", full: "Today", swatch: "#f7d774",
    title: "Today’s map", credit: "© OpenStreetMap contributors", kind: "tiles",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19,
    attribution: 'Map &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' },
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
    missing: "Needs a scan lined up with today’s map" },
  // Overlays: a semi-transparent WMS layer drawn over today's OpenStreetMap.
  // Living England (Natural England) covers every field, so habitats show clearly.
  { id: "habitats", name: "Habitats", full: "Habitats: Natural England’s Living England map", swatch: "#38a800",
    title: "Habitats (Living England)", credit: "© Natural England · Open Government Licence", kind: "overlay",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19, zoom: 14,
    wms: { url: "https://environment.data.gov.uk/spatialdata/living-england-habitat-map-phase4/wms",
      layers: "Living_England_Habitat_Map_Phase_4", opacity: 0.6 },
    attribution: 'Habitats: Living England &copy; Natural England, <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener">OGL</a> · Map &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    key: [["Arable and horticultural", "#ffd37f"], ["Grassland (chalk, acid, neutral)", "#ffbee8"], ["Improved grassland", "#cdf57a"],
      ["Broadleaved and mixed woodland", "#38a800"], ["Coniferous woodland", "#00a884"], ["Scrub", "#897044"],
      ["Built-up areas and gardens", "#343434"], ["Water", "#bee8ff"]] },
  // British Geological Survey 1:625,000 bedrock (Open Government Licence). Broad bands only at village scale.
  { id: "geology", name: "Geology", full: "Rocks: BGS bedrock geology, 1:625,000", swatch: "#cdfd35",
    title: "Bedrock geology (BGS 1:625,000)", credit: "British Geological Survey · Open Government Licence", kind: "overlay",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19, zoom: 13,
    wms: { url: "https://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/ows", layers: "GBR_BGS_625k_BLS", opacity: 0.55 },
    // Units under the parish, checked with the BGS server's feature info (Nov 2026).
    key: [["Gault clay and Upper Greensand (the Vale and village)", "#33ffaf"], ["Grey Chalk (the shelf)", "#c9ff33"], ["White Chalk (the scarp and Ridgeway)", "#dbff54"]],
    attribution: 'Rocks: contains <a href="https://www.bgs.ac.uk/" target="_blank" rel="noopener">British Geological Survey</a> materials &copy; UKRI, <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener">OGL</a> · Map &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }
];

// A layer is usable when it has tiles and isn't switched off.
export const layerReady = (l) => l.kind === "painted" || (!!l.url && !l.disabled);

// Centre of the village, for the real-map views.
export const VILLAGE_CENTRE = [51.5955, -1.3372];

// The public "Share a story" Google Form. Run setup in the Stories spreadsheet's
// Apps Script, then paste the form link it shows you here. While empty, the app
// points people to the Hendred Museum instead.
export const STORY_FORM_URL = "";

// Hand-painted artwork. When a real painting is ready, save it in /art (WebP or PNG
// on a transparent or paper background) and add it here, e.g. "tower": "art/tower.webp".
// Anything not listed uses the built-in drawing.
export const ART_IMAGES = {};
