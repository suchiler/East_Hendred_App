// STUB: replaced by the drawings agent.
// Illustrations for the Land page. The real file keeps this exact interface:
//   LA_DEFS               extra <defs> (filters etc.), injected once into the page
//   LAND_DRAWINGS[key]    { vb, svg } for each illustration key
//   CROSS_SECTION_LABELS  [{ text, x, y, anchor, kind }] drawn over the cross-section
// Drawings may use the app's shared filters #wc, #ink, #wcs, #inks from art.js.

export const LA_DEFS = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs></defs></svg>`;

const W = 'filter="url(#wc)" style="mix-blend-mode:multiply"';
const I = 'filter="url(#ink)" fill="none" stroke="#2b2924" stroke-linecap="round" stroke-linejoin="round"';

// Ground profile from the research: 0–6.4 km north to south, 85–208 m, about 11× vertical exaggeration.
const GROUND = "M0 170 L30 163 L60 163 L81 163 L120 167 L150 172 L181 154 L212 145 L229 133 L242 128 L273 121 L304 125 L334 126 L365 125 L396 120 L427 111 L457 73 L488 49 L505 43 L508 37 L535 44 L569 52 L602 61 L640 70";

const placeholder = (fill) => ({
  vb: "0 0 200 110",
  svg: `<g ${W}><ellipse cx="110" cy="40" rx="80" ry="22" fill="#a9bedd" opacity=".45"/><path d="M0 80C50 56 110 50 200 70V110H0Z" fill="${fill}" opacity=".8"/></g>
        <g ${I}><path d="M0 80C50 56 110 50 200 70" stroke-width="2"/></g>`
});
const blob = (fill) => ({
  vb: "0 0 48 48",
  svg: `<g ${W}><circle cx="24" cy="26" r="14" fill="${fill}" opacity=".8"/></g><g ${I}><circle cx="24" cy="26" r="14" stroke-width="1.4"/></g>`
});

export const LAND_DRAWINGS = {
  "cross-section": {
    vb: "0 0 640 230",
    svg: `<defs><clipPath id="la-ground"><path d="${GROUND} L640 230 L0 230Z"/></clipPath></defs>
      <g ${W}>
        <ellipse cx="420" cy="30" rx="260" ry="40" fill="#a9bedd" opacity=".45"/>
        <g clip-path="url(#la-ground)">
          <path d="M0 0L31 0L91 230L0 230Z" fill="#8e9cab" opacity=".85"/>
          <path d="M31 0L134 0L194 230L91 230Z" fill="#a9b77f" opacity=".85"/>
          <path d="M134 0L410 0L470 230L194 230Z" fill="#d6cfb8" opacity=".9"/>
          <path d="M410 0L640 0L640 230L470 230Z" fill="#ece5d2" opacity=".95"/>
        </g>
        <path d="${GROUND}" stroke="#86a06a" stroke-width="7" fill="none" opacity=".9"/>
        <path d="M140 176C150 190 160 200 175 205" stroke="#7ea2d2" stroke-width="5" fill="none" opacity=".8"/>
      </g>
      <g ${I}>
        <path d="${GROUND}" stroke-width="2"/>
        <g clip-path="url(#la-ground)" stroke-width=".9" stroke-dasharray="3 3"><path d="M31 0L91 230M134 0L194 230M410 0L470 230"/></g>
        <path d="M146 158l0-16M141 150h10" stroke-width="1.4"/>
        <path d="M150 168c-6-6-6-10 0-14" stroke="#2f4f8a" stroke-width="1.2"/>
        <path d="M505 42L505 28" stroke-width="1"/>
      </g>`
  },
  "section-rocks": placeholder("#d6cfb8"),
  "section-shape": placeholder("#9fb57f"),
  "section-ridgeway": placeholder("#adc189"),
  "section-water": placeholder("#7ea2d2"),
  "section-soils": placeholder("#c2a46a"),
  "section-living": placeholder("#86a06a"),
  "section-change": placeholder("#b9a476"),
  "red-kite": {
    vb: "0 0 96 96",
    svg: `<g ${W}><ellipse cx="48" cy="40" rx="44" ry="26" fill="#a9bedd" opacity=".5"/><path d="M10 40C30 30 40 34 48 40C56 34 66 30 86 40C70 42 60 46 52 50L56 66L48 60L40 66L44 50C36 46 26 42 10 40Z" fill="#a4512f" opacity=".85"/></g>
      <g ${I}><path d="M10 40C30 30 40 34 48 40C56 34 66 30 86 40C70 42 60 46 52 50L56 66L48 60L40 66L44 50C36 46 26 42 10 40Z" stroke-width="1.3"/></g>`
  },
  "species-skylark": blob("#b59a6a"),
  "species-yellowhammer": blob("#e0b93a"),
  "species-kestrel": blob("#a4602f"),
  "species-brown-hare": blob("#9c7a50"),
  "species-marbled-white": blob("#e8e4d8"),
  "species-rock-rose": blob("#e8c23a"),
  "species-wild-thyme": blob("#b98ab0"),
  "species-knapweed": blob("#9a6ab0"),
  "fossil-urchin": blob("#d8cfb8")
};

export const CROSS_SECTION_LABELS = [
  { text: "Vale", x: 4, y: 146, anchor: "start", kind: "place" },
  { text: "Village", x: 128, y: 124, anchor: "middle", kind: "place" },
  { text: "Icknield Way", x: 240, y: 108, anchor: "middle", kind: "place" },
  { text: "Ridgeway", x: 505, y: 22, anchor: "middle", kind: "feature" },
  { text: "springs", x: 160, y: 196, anchor: "start", kind: "water" },
  { text: "clay", x: 14, y: 220, anchor: "start", kind: "rock" },
  { text: "greensand", x: 96, y: 220, anchor: "start", kind: "rock" },
  { text: "grey chalk", x: 270, y: 220, anchor: "start", kind: "rock" },
  { text: "white chalk", x: 630, y: 220, anchor: "end", kind: "rock" }
];
