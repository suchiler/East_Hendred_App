# Painted map of East Hendred: notes

## Source
- OpenStreetMap data, downloaded 8 November 2026 from the OSM API (`/api/0.6/map`), in two tiles:
  - `-1.3480,51.5780,-1.3220,51.5980`
  - `-1.3480,51.5980,-1.3220,51.6040`
- Saved as `map.osm` and `map2.osm`. Rebuild with `python3 build.py`, which writes `painted-map.js`.
- **Attribution (required):** "Map data © OpenStreetMap contributors" (ODbL). The same text is exported as `ATTRIBUTION` from `painted-map.js`.

## Frame and projection
- Drawing size: `MAP_W = 390`, `MAP_H = 880` (portrait, north up). The SVG viewBox is `0 0 390 880`.
- `BOUNDS = { north: 51.6040, south: 51.5858, west: -1.3457, east: -1.3327 }`.
- Local equirectangular projection, linear in latitude and longitude:
  - `x = (lng - west) / (east - west) * 390`
  - `y = (north - lat) / (north - south) * 880`
- Aspect ratio: 899 m wide × 2,026 m tall, about 2.3 m per pixel. At this small scale the distortion is well under 1%.
- `project(lat, lng)` uses exactly this formula, so a coordinate lands on the drawn feature.

## What was drawn, and simplified
- **Fields, meadows, allotments and recreation grounds:** varied warm and green washes, edged as dotted hedges.
- **Residential land:** a warm wash.
- **Woods:** green washes with ink tree scribbles.
- **The Moat:** a blue wash.
- **Streams:** a blue wash with a wobbly ink line. East Hendred Brook and Hendred Brook are labelled.
- **Roads:** inked double lines with a paper-coloured fill.
  - The A417 is widest, with a buff fill.
  - Residential and unclassified roads are medium width.
  - Service roads are thin, and those shorter than about 25 px are dropped.
- **Tracks, bridleways and footpaths:** dashed lines.
- **Buildings:** footprints larger than about 14 px² (roughly 75 m²) are drawn as small ink-outlined washes. Sheds and garages are dropped.
- **The Berkshire Downs:** the scarp south of the Icknield Way (from about 51.5905° N) is painted as a gradient wash, with rows of down-slope hatching.
- **Finishing:** a few loose watercolour blooms, plus a faint paper grain.
- **Simplification:** geometry uses Douglas–Peucker at 0.6–1.5 px, with coordinates rounded to 0.1 px, and paths are batched by style. The SVG is about 117 KB.
- **Labels** are in IM Fell English: High Street, Cat Street, East Hendred Brook, Reading Road (A417), Icknield Way, Lud Bridge, THE BERKSHIRE DOWNS, and N on the compass.
- The compass sits top-right at y ≈ 84–128, below the app's floating header.

## Corrected site coordinates (to replace the approximate values in js/data.js SITES)

| # | Site | lat | lng | Source |
|---|---|---|---|---|
| 1 | St Augustine's Church | 51.5945 | -1.3383 | OSM building centroid |
| 2 | Champs Chapel (museum) | 51.5970 | -1.3366 | OSM building centroid |
| 3 | King's Manor | 51.5964 | -1.3368 | Historic England 1199882, via British Listed Buildings (SU460888) |
| 4 | Hendred House & St Amand's | 51.5946 | -1.3360 | OSM (St Amand's Chapel 51.59455, -1.33595) |
| 5 | St Mary's Catholic Church | 51.5938 | -1.3363 | OSM building centroid |
| 6 | The Eyston Arms | 51.5962 | -1.3362 | OSM building centroid |
| 7 | Orchard House, Cat Street | 51.5966 | -1.3382 | Historic England 1368661, via British Listed Buildings and Wikidata (SU459888) |
| 8 | Ludbridge Mill | 51.6025 | -1.3444 | Mills Archive entry (NGR SU 455 895). A postcode source gives 51.6011, -1.3451. Ground-check this one |
| 9 | Scutchamer Knob | 51.5624 | -1.3428 | OSM / Nominatim (archaeological site). Off the drawing (`inside: false`), so it gets an edge marker |

Other useful points found:
- Snells Hall: 51.5949, -1.3403
- War Memorial: 51.5969, -1.3365
- The Plough: 51.5976, -1.3386
- Lud Bridge (A417 over the brook): 51.6002, -1.3450
- The Moat: 51.5940, -1.3349

## Notes for whoever wires this in
- Pins 2, 3 and 6 (Champs Chapel, King's Manor, the Eyston Arms) are only 45–90 m apart, which is 20–40 px on the drawing. 30 px pins will touch. Options:
  - smaller pins (about 24 px) on the painted map;
  - nudging overlapping pins apart;
  - allowing pinch-zoom on the painted stage.
- The app's stage is 390 px wide, so at a 390 px screen it scales 1:1, and the 880 px height scrolls or crops.
- The village sits in the upper-middle of the drawing (y ≈ 200–520). The downs fill the lower third, which the app's bottom sheet covers, so nothing important is hidden.
