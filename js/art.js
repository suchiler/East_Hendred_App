// Ink-and-watercolour illustrations, drawn in SVG.
// Each one can be swapped for a hand-painted scan via ART_IMAGES in config.js.
import { ART_IMAGES } from "./config.js";
import { LAND_DRAWINGS } from "./land-art.js";

const W = 'filter="url(#wc)" style="mix-blend-mode:multiply"';
const I = 'filter="url(#ink)" fill="none" stroke="#2b2924" stroke-linecap="round" stroke-linejoin="round"';
const WS = 'filter="url(#wcs)" style="mix-blend-mode:multiply"';
const IS = 'filter="url(#inks)" fill="none" stroke="#2b2924" stroke-linecap="round" stroke-linejoin="round"';

const DRAWINGS = {
  tower: { vb: "0 0 200 240", svg: `
    <g ${W}><ellipse cx="118" cy="72" rx="88" ry="58" fill="#a9bedd" opacity=".55"/><path d="M58 72H142V214H58Z" fill="#d8c596" opacity=".9"/><path d="M58 72H96V214H58Z" fill="#a8935f" opacity=".45"/><path d="M86 136V110a14 14 0 0 1 28 0V136Z" fill="#5f6a76" opacity=".8"/><path d="M0 214C50 204 150 206 200 212V240H0Z" fill="#9fb57f" opacity=".85"/><ellipse cx="28" cy="188" rx="26" ry="36" fill="#6f8a55" opacity=".75"/><ellipse cx="172" cy="196" rx="24" ry="26" fill="#86a06a" opacity=".7"/><path d="M86 214V192a14 14 0 0 1 28 0V214Z" fill="#5f574a" opacity=".7"/></g>
    <g ${I}><path d="M60 214L61 74M140 74L141 214" stroke-width="2"/><path d="M54 74H146M54 74V58H64V66H74V58H84V66H94V58H106V66H116V58H126V66H136V58H146V74" stroke-width="1.7"/><path d="M60 150H140M61 153H139" stroke-width=".9"/><path d="M86 136V110a14 14 0 0 1 28 0V136Z" stroke-width="1.6"/><path d="M88 116H112M87 122H113M87 128H113" stroke-width=".9"/><path d="M86 214V192a14 14 0 0 1 28 0V214" stroke-width="1.6"/><path d="M96 180V168a4 4 0 0 1 8 0V180" stroke-width="1"/><path d="M60 214H50L54 176L60 172M140 214H150L146 176L140 172" stroke-width="1.3"/><path d="M64 160l8-8M64 172l10-10M64 184l12-12M64 196l12-12M66 206l10-10" stroke-width=".7"/><path d="M8 214C60 208 140 210 192 214" stroke-width="1.3"/><path d="M12 196c-6-14 4-30 14-34c10-6 24 4 22 16c6 10-2 24-14 24M30 214V196" stroke-width="1.1"/><path d="M156 204c-4-12 6-22 16-22c12 0 18 12 12 22M172 214V200" stroke-width="1.1"/><path d="M150 40q5-5 10 0q5-5 10 0M128 30q4-4 8 0q4-4 8 0" stroke-width="1"/></g>` },

  "era-pre": { vb: "0 0 200 110", svg: `
    <g ${W}><ellipse cx="120" cy="30" rx="90" ry="24" fill="#a9bedd" opacity=".55"/><path d="M0 80C40 52 90 44 130 52S190 70 200 66V110H0Z" fill="#9fb57f" opacity=".85"/><ellipse cx="118" cy="50" rx="26" ry="12" fill="#6f8a55" opacity=".8"/><path d="M10 104C60 92 110 88 196 76" stroke="#e9dfc4" stroke-width="7" fill="none"/></g>
    <g ${I}><path d="M0 80C40 52 90 44 130 52S190 70 200 66" stroke-width="2.2"/><path d="M92 52C96 38 140 36 144 52" stroke-width="1.8"/><path d="M104 40c-4-8 6-14 10-8c4-6 14-2 10 6M126 38c-2-7 8-11 11-5c4-4 12 0 8 6" stroke-width="1.1"/><path d="M10 102C60 90 110 86 196 74M14 108C64 96 114 92 198 80" stroke-width=".9"/><path d="M30 80l6-8M44 74l6-8M58 70l6-8" stroke-width=".8"/><path d="M160 20q5-6 10 0q5-6 10 0" stroke-width="1.2"/></g>` },

  "era-saxon": { vb: "0 0 200 110", svg: `
    <g ${W}><path d="M0 60C60 54 140 58 200 56V76C150 70 100 86 0 78Z" fill="#a8bd8a" opacity=".75"/><path d="M0 78C50 66 90 90 140 78S190 70 200 74V98C150 102 120 90 80 100S20 98 0 102Z" fill="#7ea2d2" opacity=".7"/><ellipse cx="38" cy="60" rx="24" ry="18" fill="#8fa874" opacity=".7"/></g>
    <g ${I}><path d="M0 78C50 66 90 90 140 78S190 70 200 74" stroke-width="2"/><path d="M10 88c10-3 20 3 30 0M70 92c10-3 20 3 30 0M130 86c10-3 20 3 30 0" stroke-width="1"/><path d="M30 76c-2-16 0-28 4-36M38 76c0-14 4-24 10-30M46 78c2-12 6-20 12-24M24 78c-4-10-6-18-6-26" stroke-width="1.3"/><path d="M118 30q9-11 18 0q9-11 18 0" stroke-width="1.8"/><path d="M164 18q5-6 10 0q5-6 10 0" stroke-width="1.2"/></g>` },

  "era-med": { vb: "0 0 200 110", svg: `
    <g ${W}><path d="M0 84C60 76 140 80 200 78V110H0Z" fill="#9fb57f" opacity=".85"/><ellipse cx="82" cy="62" rx="34" ry="20" fill="#ddd4bf" opacity=".95"/><ellipse cx="88" cy="72" rx="28" ry="9" fill="#b3a88d" opacity=".6"/><ellipse cx="150" cy="68" rx="24" ry="14" fill="#ddd4bf" opacity=".95"/></g>
    <g ${I}><path d="M50 62c-6-10 4-20 14-16c4-10 18-10 22-2c8-6 22-2 22 8c10 4 8 18-2 20c0 8-14 12-22 6c-6 6-20 6-24-2c-10 0-14-10-10-14Z" stroke-width="1.7"/><path d="M48 54c-10-2-16 6-12 14c4 4 10 2 12-2Z" fill="#2b2924" stroke-width="1.2"/><path d="M66 80v12M76 82v12M96 82v12M106 80v12" stroke-width="1.8"/><path d="M128 66c-4-7 3-14 10-11c3-7 13-7 15-1c6-4 15-1 15 6c7 3 5 12-2 14c-1 6-10 8-15 4c-4 4-14 4-16-2c-7 0-9-7-7-10Z" stroke-width="1.4"/><ellipse cx="174" cy="63" rx="6" ry="5" fill="#2b2924" stroke-width="1"/><path d="M140 80v8M160 80v8" stroke-width="1.5"/><path d="M4 94C60 88 140 92 196 90" stroke-width="1.2"/></g>` },

  "era-ref": { vb: "0 0 200 110", svg: `
    <g ${W}><ellipse cx="110" cy="34" rx="86" ry="26" fill="#a9bedd" opacity=".5"/><path d="M60 50L100 22L140 50V96H60Z" fill="#d8c596" opacity=".9"/><path d="M60 50L100 22V96H60Z" fill="#a8935f" opacity=".4"/><path d="M90 96V78a10 10 0 0 1 20 0V96Z" fill="#5f574a" opacity=".7"/><path d="M0 96C60 92 140 94 200 92V110H0Z" fill="#9fb57f" opacity=".85"/><ellipse cx="34" cy="70" rx="18" ry="26" fill="#4f6b45" opacity=".7"/></g>
    <g ${I}><path d="M60 96V50L100 22L140 50V96" stroke-width="2.2"/><path d="M100 22V6M93 12H107" stroke-width="1.9"/><path d="M90 96V78a10 10 0 0 1 20 0V96" stroke-width="1.6"/><path d="M96 62V50a4 6 0 0 1 8 0V62Z" stroke-width="1.2"/><path d="M64 70l8-8M64 82l10-10M64 92l8-8" stroke-width=".8"/><path d="M20 96H180" stroke-width="1.5"/><path d="M24 92c-8-12-6-34 10-46c14 10 18 32 8 46M34 96v-8" stroke-width="1.2"/></g>` },

  "era-mod": { vb: "0 0 200 110", svg: `
    <g ${W}><ellipse cx="100" cy="18" rx="100" ry="18" fill="#a9bedd" opacity=".45"/><path d="M0 50L80 40L90 70L0 82Z" fill="#c2d19c" opacity=".85"/><path d="M80 40L200 34V62L90 70Z" fill="#dccb8f" opacity=".85"/><path d="M0 82L90 70L110 110H0Z" fill="#a9bf86" opacity=".85"/><path d="M90 70L200 62V110H110Z" fill="#d2bf86" opacity=".75"/></g>
    <g ${I}><path d="M0 50L200 34M0 82L200 62M80 40L110 110M150 37L172 110" stroke-width="1.5"/><path d="M20 48c2-4 6-4 8 0M50 45c2-4 6-4 8 0M110 40c2-4 6-4 8 0M170 36c2-4 6-4 8 0M30 78c2-4 6-4 8 0M120 69c2-4 6-4 8 0" stroke-width="1"/><path d="M74 42c-6-8 2-16 8-12c6-4 12 4 8 10c-4 4-12 4-16 2M146 38c-5-7 2-13 7-10c5-3 10 3 7 8" stroke-width="1.1"/><path d="M184 34V18L188 6L192 18V34" stroke-width="1.3"/></g>` },

  "era-atom": { vb: "0 0 200 110", svg: `
    <g ${W}><path d="M50 52H150V98H50Z" fill="#e2cb9c" opacity=".9"/><path d="M42 54L70 28H130L158 54Z" fill="#94604a" opacity=".65"/><circle cx="128" cy="68" r="7" fill="#2f5fb8" opacity=".95"/><path d="M0 98C60 94 140 96 200 94V110H0Z" fill="#9fb57f" opacity=".85"/><ellipse cx="178" cy="66" rx="18" ry="28" fill="#6f8a55" opacity=".75"/></g>
    <g ${I}><path d="M50 98V54H150V98" stroke-width="2.2"/><path d="M42 54L70 28H130L158 54" stroke-width="1.9"/><path d="M80 34V18H90V30" stroke-width="1.4"/><path d="M94 98V76H108V98" stroke-width="1.6"/><path d="M62 62H80V80H62ZM71 62V80M62 71H80" stroke-width="1.1"/><circle cx="128" cy="68" r="7" stroke-width="1"/><path d="M118 82H140V94H118Z" stroke-width="1.1"/><path d="M20 98H184" stroke-width="1.5"/><path d="M170 92c-8-12-6-40 8-52c14 12 14 38 6 52M178 98v-8" stroke-width="1.1"/></g>` },

  "story-quill": { vb: "0 0 48 48", svg: `<g ${WS}><rect x="6" y="16" width="26" height="22" fill="#e2d4ae" opacity=".95"/><path d="M42 4C30 7 23 17 21 30C31 27 41 18 42 4Z" fill="#8fa9d4" opacity=".75"/></g><g ${IS}><path d="M6 16H32V38H6Z" stroke-width="1.2"/><path d="M10 23H26M10 28H26M10 33H20" stroke-width=".7"/><path d="M42 4C30 7 23 17 21 30C31 27 41 18 42 4Z" stroke-width="1.1"/><path d="M42 4L17 36" stroke-width="1.3"/><path d="M30 14l3 2M27 19l3 2M25 24l3 2" stroke-width=".6"/></g>` },
  "story-anvil": { vb: "0 0 48 48", svg: `<g ${WS}><path d="M8 18H34C34 23 30 25 26 25V32H32V37H14V32H20V25C13 25 8 23 8 18Z" fill="#6f7680" opacity=".8"/><circle cx="38" cy="9" r="7" fill="#e39a48" opacity=".7"/><path d="M2 38H46V44H2Z" fill="#a8935f" opacity=".45"/></g><g ${IS}><path d="M8 18H34C34 23 30 25 26 25V32H32V37H14V32H20V25C13 25 8 23 8 18Z" stroke-width="1.3"/><path d="M34 18C40 18 44 20 46 22H34" stroke-width="1.1"/><path d="M36 12l-3-4M40 11l1-5M43 14l4-2" stroke-width=".8"/><path d="M11 21H30" stroke-width=".6"/><path d="M2 41H46" stroke-width="1"/></g>` },
  "story-plane": { vb: "0 0 48 48", svg: `<g ${WS}><path d="M6 32L10 24H38L42 32Z" fill="#c69f62" opacity=".9"/><path d="M2 38H46V43H2Z" fill="#b8955e" opacity=".55"/></g><g ${IS}><path d="M6 32L10 24H38L42 32Z" stroke-width="1.3"/><path d="M16 24C16 17 23 15 26 19L24 24" stroke-width="1.1"/><path d="M40 26c5-3 8 2 4 5c-3 2-6-1-3-3" stroke-width=".8"/><path d="M12 28H36" stroke-width=".5"/><path d="M2 38H46" stroke-width="1"/></g>` },
  "story-label": { vb: "0 0 48 48", svg: `<g ${WS}><path d="M6 14H32L40 24L32 34H6Z" fill="#e2d09a" opacity=".95"/><rect x="4" y="36" width="22" height="9" fill="#7a5a32" opacity=".55"/></g><g ${IS}><path d="M6 14H32L40 24L32 34H6Z" stroke-width="1.2"/><circle cx="33" cy="24" r="2" stroke-width=".9"/><path d="M35 24C40 22 44 18 46 12" stroke-width=".9"/><path d="M10 21H26M10 26H24" stroke-width=".7"/><path d="M4 36H26V45H4ZM15 36V45" stroke-width=".9"/></g>` },
  "story-slate": { vb: "0 0 48 48", svg: `<g ${WS}><rect x="4" y="8" width="26" height="20" fill="#56606c" opacity=".8"/><circle cx="34" cy="34" r="10" fill="#c69f62" opacity=".4"/></g><g ${IS}><rect x="4" y="8" width="26" height="20" stroke-width="1.3"/><path d="M9 15h5M9 20h10" stroke="#f3efe4" stroke-width=".9"/><circle cx="34" cy="34" r="10" stroke-width="1.1"/><path d="M34 34L44 46" stroke-width="1.1"/></g>` },
  "story-jar": { vb: "0 0 48 48", svg: `<g ${WS}><path d="M12 16H36V40H12Z" fill="#c6dbe2" opacity=".8"/><circle cx="19" cy="32" r="3.5" fill="#c4553f" opacity=".9"/><circle cx="27" cy="34" r="3.5" fill="#e0a43a" opacity=".9"/><circle cx="23" cy="26" r="3.5" fill="#7fa25a" opacity=".9"/><circle cx="30" cy="27" r="3" fill="#b8568a" opacity=".8"/></g><g ${IS}><path d="M14 10H34V16H14Z" stroke-width="1.2"/><path d="M12 16H36V38C36 40 34 42 32 42H16C14 42 12 40 12 38Z" stroke-width="1.3"/><path d="M16 20V36" stroke-width=".7"/></g>` },
  "story-bell": { vb: "0 0 48 48", svg: `<g ${WS}><path d="M14 34C14 22 16 10 24 10C32 10 34 22 34 34Z" fill="#c9a24e" opacity=".85"/><path d="M14 34C14 22 16 10 24 10V34Z" fill="#9c7a2e" opacity=".4"/></g><g ${IS}><path d="M14 34C14 22 16 10 24 10C32 10 34 22 34 34" stroke-width="1.3"/><path d="M10 34H38" stroke-width="1.3"/><path d="M24 6V10" stroke-width="1.2"/><circle cx="24" cy="38" r="2.5" stroke-width="1"/><path d="M6 20c-2 4-2 8 0 12M42 20c2 4 2 8 0 12" stroke-width=".8"/></g>` },
  "story-house": { vb: "0 0 48 48", svg: `<g ${WS}><path d="M8 22H40V42H8Z" fill="#e2cb9c" opacity=".95"/><path d="M5 23L15 12H33L43 23Z" fill="#94604a" opacity=".7"/><circle cx="32" cy="29" r="3.2" fill="#2f5fb8" opacity=".95"/></g><g ${IS}><path d="M8 42V23H40V42" stroke-width="1.3"/><path d="M5 23L15 12H33L43 23" stroke-width="1.2"/><path d="M21 42V32H27V42" stroke-width="1"/><path d="M11 27H18V34H11Z" stroke-width=".8"/><circle cx="32" cy="29" r="3.2" stroke-width=".6"/><path d="M2 42H46" stroke-width="1"/></g>` },
  envelope: { vb: "0 0 48 48", svg: `<g ${WS}><path d="M4 14H44V40H4Z" fill="#e6d7b0" opacity=".95"/><circle cx="36" cy="22" r="4" fill="#b0473a" opacity=".85"/></g><g ${IS}><path d="M4 14H44V40H4Z" stroke-width="1.3"/><path d="M4 14L24 30L44 14" stroke-width="1.1"/><path d="M4 40L18 26M44 40L30 26" stroke-width=".8"/></g>` },
  knob: { vb: "0 0 200 110", svg: `<g ${W}><ellipse cx="120" cy="30" rx="90" ry="24" fill="#a9bedd" opacity=".55"/><path d="M0 80C40 52 90 44 130 52S190 70 200 66V110H0Z" fill="#9fb57f" opacity=".85"/><ellipse cx="118" cy="50" rx="26" ry="12" fill="#6f8a55" opacity=".8"/></g><g ${I}><path d="M0 80C40 52 90 44 130 52S190 70 200 66" stroke-width="2.4"/><path d="M92 52C96 38 140 36 144 52" stroke-width="2"/><path d="M10 102C60 90 110 86 196 74" stroke-width="1.2" stroke-dasharray="4 4"/></g>` }
};

// Filters shared by every drawing. Injected once into the page.
export const FILTER_DEFS = `
<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <defs>
    <filter id="wc" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="3" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="9" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feGaussianBlur in="shape" stdDeviation="0.8" result="soft"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.25" result="grainA"/>
      <feComposite in="soft" in2="grainA" operator="in" result="grained"/>
      <feMorphology in="soft" operator="erode" radius="1.4" result="inner"/>
      <feComposite in="soft" in2="inner" operator="out" result="edge"/>
      <feMerge><feMergeNode in="grained"/><feMergeNode in="edge"/></feMerge>
    </filter>
    <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" seed="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="wcs" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="4" seed="3" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feGaussianBlur in="shape" stdDeviation="0.3" result="soft"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="8" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.25" result="grainA"/>
      <feComposite in="soft" in2="grainA" operator="in" result="grained"/>
      <feMorphology in="soft" operator="erode" radius="0.5" result="inner"/>
      <feComposite in="soft" in2="inner" operator="out" result="edge"/>
      <feMerge><feMergeNode in="grained"/><feMergeNode in="edge"/></feMerge>
    </filter>
    <filter id="inks" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="0.7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="wcm" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="11" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="14" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feGaussianBlur in="shape" stdDeviation="1.1" result="soft"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="8" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.25" result="grainA"/>
      <feComposite in="soft" in2="grainA" operator="in" result="grained"/>
      <feMorphology in="soft" operator="erode" radius="1.6" result="inner"/>
      <feComposite in="soft" in2="inner" operator="out" result="edge"/>
      <feMerge><feMergeNode in="grained"/><feMergeNode in="edge"/></feMerge>
    </filter>
    <filter id="inkm" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>`;

// Returns markup for one illustration: a hand-painted image if one is configured,
// otherwise the built-in drawing. Always decorative (hidden from screen readers).
export function art(key, { width, height, className = "" } = {}) {
  const size = `${width ? `width="${width}"` : ""} ${height ? `height="${height}"` : ""}`;
  if (ART_IMAGES[key]) {
    return `<img src="${ART_IMAGES[key]}" alt="" class="art ${className}" ${size} loading="lazy" decoding="async">`;
  }
  const d = DRAWINGS[key] || LAND_DRAWINGS[key];
  if (!d) return "";
  return `<svg viewBox="${d.vb}" class="art ${className}" ${size} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">${d.svg}</svg>`;
}
