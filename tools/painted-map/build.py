#!/usr/bin/env python3
"""Builds painted-map.js: an ink-and-watercolour map of East Hendred traced from
OpenStreetMap data (map.osm + map2.osm, downloaded from the OSM API)."""
import math, json, hashlib, xml.etree.ElementTree as ET

# ---- Frame ----------------------------------------------------------------
MAP_W, MAP_H = 390, 880
NORTH, SOUTH, WEST, EAST = 51.6040, 51.5858, -1.3457, -1.3327

def project(lat, lng):
    return ((lng - WEST) / (EAST - WEST) * MAP_W, (NORTH - lat) / (NORTH - SOUTH) * MAP_H)

# ---- Load OSM ---------------------------------------------------------------
nodes, ways = {}, {}
for f in ("map.osm", "map2.osm"):
    root = ET.parse(f).getroot()
    for n in root.iter("node"):
        nodes[n.get("id")] = (float(n.get("lat")), float(n.get("lon")))
    for w in root.iter("way"):
        tags = {t.get("k"): t.get("v") for t in w.findall("tag")}
        ways[w.get("id")] = (tags, [r.get("ref") for r in w.findall("nd")])

def pts(refs):
    return [project(*nodes[r]) for r in refs if r in nodes]

# ---- Geometry helpers -------------------------------------------------------
def dp(points, tol):
    """Douglas-Peucker simplification. Closed rings are split at their farthest point first."""
    if len(points) > 3 and math.hypot(points[0][0] - points[-1][0], points[0][1] - points[-1][1]) < 1e-6:
        x0, y0 = points[0]
        k = max(range(len(points)), key=lambda i: math.hypot(points[i][0] - x0, points[i][1] - y0))
        a = _dp(points[: k + 1], tol)
        b = _dp(points[k:], tol)
        return a[:-1] + b
    return _dp(points, tol)

def _dp(points, tol):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1e-9
    best, idx = 0, 0
    for i in range(1, len(points) - 1):
        px, py = points[i]
        d = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / L
        if d > best:
            best, idx = d, i
    if best > tol:
        return _dp(points[: idx + 1], tol)[:-1] + _dp(points[idx:], tol)
    return [points[0], points[-1]]

PAD = 30
def visible(p):
    return any(-PAD <= x <= MAP_W + PAD and -PAD <= y <= MAP_H + PAD for x, y in p)

def f1(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s

def path(p, close=False):
    if len(p) < 2:
        return ""
    d = "M" + f1(p[0][0]) + " " + f1(p[0][1])
    for x, y in p[1:]:
        d += "L" + f1(x) + " " + f1(y)
    return d + ("Z" if close else "")

def area(p):
    return abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2

def centroid(p):
    return (sum(x for x, _ in p) / len(p), sum(y for _, y in p) / len(p))

def pick(seq, key):
    h = int(hashlib.md5(key.encode()).hexdigest(), 16)
    return seq[h % len(seq)]

# ---- Sort features into layers ---------------------------------------------
FIELD_WASH = ["#d8cf9a", "#c6d39e", "#dccb8f", "#bccd94", "#d2c089", "#c9d6a6", "#e0d3a2"]
fields, residential, woods, water, buildings = [], [], [], [], []
streams, roads_major, roads_minor, roads_service, paths_, hedges, rail = [], [], [], [], [], [], []

for wid, (t, refs) in ways.items():
    p = pts(refs)
    if len(p) < 2 or not visible(p):
        continue
    closed = refs[0] == refs[-1]
    lu, nat, hw, ww = t.get("landuse"), t.get("natural"), t.get("highway"), t.get("waterway")
    if lu in ("farmland", "meadow", "grass", "farmyard", "orchard", "allotments", "recreation_ground", "cemetery") or t.get("leisure") in ("pitch", "park"):
        if closed and len(p) > 3:
            fields.append((wid, dp(p, 1.2), lu or t.get("leisure")))
    elif lu in ("residential", "religious", "commercial", "retail"):
        if closed:
            residential.append(dp(p, 1.2))
    elif nat in ("wood", "scrub") or lu == "forest":
        if closed:
            woods.append((wid, dp(p, 1.5)))
    elif nat == "water":
        if closed:
            water.append(dp(p, 0.8))
    elif "building" in t:
        if closed and len(p) > 3:
            s = dp(p, 0.6)
            if area(s) > 4:
                buildings.append((wid, s))
    elif ww in ("stream", "river", "ditch", "drain"):
        streams.append((t.get("name", ""), ww, dp(p, 0.8)))
    elif hw in ("primary", "secondary", "tertiary"):
        roads_major.append((t.get("name", ""), dp(p, 0.8)))
    elif hw in ("residential", "unclassified", "living_street"):
        roads_minor.append((t.get("name", ""), dp(p, 0.8)))
    elif hw == "service":
        roads_service.append(dp(p, 0.8))
    elif hw in ("track", "bridleway", "footway", "path", "cycleway"):
        paths_.append((t.get("name", ""), dp(p, 1.0)))
    elif t.get("barrier") == "hedge" or nat == "tree_row":
        hedges.append(dp(p, 1.0))
    elif t.get("railway") in ("rail", "abandoned", "disused"):
        rail.append(dp(p, 1.0))

# ---- Paint -------------------------------------------------------------------
from collections import OrderedDict
import random
random.seed(7)

class Batch:
    """Collects path data by style so each style is one <path> element (keeps the SVG small)."""
    def __init__(self): self.d = OrderedDict()
    def add(self, style, d):
        if d: self.d.setdefault(style, []).append(d)
    def render(self): return "".join(f'<path {st} d="{"".join(ds)}"/>' for st, ds in self.d.items())

W = 'filter="url(#pm-wash)" style="mix-blend-mode:multiply"'
I = 'filter="url(#pm-ink)" fill="none" stroke-linecap="round" stroke-linejoin="round"'

defs = """<defs>
<filter id="pm-wash" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="11" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="9" xChannelSelector="R" yChannelSelector="G" result="s"/><feGaussianBlur in="s" stdDeviation="0.9" result="soft"/><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="8" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.3 1.3" result="ga"/><feComposite in="soft" in2="ga" operator="in" result="gr"/><feMorphology in="soft" operator="erode" radius="1.4" result="in"/><feComposite in="soft" in2="in" operator="out" result="edge"/><feMerge><feMergeNode in="gr"/><feMergeNode in="edge"/></feMerge></filter>
<filter id="pm-ink" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="pm-paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.25 0 0 0 0.09 0"/></filter>
<linearGradient id="pm-downs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b5c792" stop-opacity="0"/><stop offset=".3" stop-color="#a9bf86" stop-opacity=".6"/><stop offset="1" stop-color="#7f9a65" stop-opacity=".85"/></linearGradient>
</defs>"""

out = [f'<rect width="{MAP_W}" height="{MAP_H}" fill="#f3efe4"/>']
FIELD = ["#d8cb8e", "#c2d19a", "#dcc787", "#b8cc8e", "#d4bd80", "#c9d6a0", "#e2d09b", "#b4c690"]

# Washes
wb = Batch()
for wid, p, kind in fields:
    col = "#d6c99a" if kind in ("allotments", "cemetery") else ("#c2d39c" if kind in ("meadow", "grass", "recreation_ground", "pitch") else pick(FIELD, wid))
    wb.add(f'fill="{col}" opacity=".7"', path(p, True))
for p in residential:
    wb.add('fill="#e3c99a" opacity=".6"', path(p, True))
downs_top = project(51.5905, WEST)[1]
downs_edge = f'M0 {f1(downs_top)}C80 {f1(downs_top-14)} 170 {f1(downs_top+16)} 250 {f1(downs_top-6)}S350 {f1(downs_top-18)} {MAP_W} {f1(downs_top-4)}'
wb.add('fill="url(#pm-downs)"', downs_edge + f'V{MAP_H}H0Z')
for wid, p in woods:
    wb.add(f'fill="{pick(["#6f8a55", "#7f9a5f", "#5f7a4c"], wid)}" opacity=".7"', path(p, True))
for p in water:
    wb.add('fill="#7ea2d2" opacity=".75"', path(p, True))
for name, ww, p in streams:
    if ww == "stream":
        wb.add('fill="none" stroke="#86a8d6" stroke-width="6" opacity=".55"', path(p))
big = [(wid, p) for wid, p in buildings if area(p) > 14]
for wid, p in big:
    wb.add(f'fill="{pick(["#c4936c", "#b98a66", "#cfa27a"], wid)}" opacity=".8"', path(p, True))
# loose, uneven blooms over everything, as a painter would lay them
for i in range(26):
    x, y = random.uniform(0, MAP_W), random.uniform(0, MAP_H * .78)
    wb.add(f'fill="{random.choice(["#c9b37a", "#a9bf86", "#d8b98a", "#9fb6a8"])}" opacity="{random.choice([".12", ".16", ".2"])}"',
           f'M{f1(x)} {f1(y)}m-{f1(r:=random.uniform(18, 46))} 0a{f1(r)} {f1(r*random.uniform(.5, .9))} {random.randint(0,40)} 1 0 {f1(2*r)} 0a{f1(r)} {f1(r*random.uniform(.5, .9))} 0 1 0 -{f1(2*r)} 0')
out.append(f"<g {W}>{wb.render()}</g>")

# Ink
ib = Batch()
for wid, p, kind in fields:
    ib.add('stroke="#2b2924" stroke-width=".7" stroke-dasharray="1 3"', path(p, True))
for p in hedges:
    ib.add('stroke="#2b2924" stroke-width=".8" stroke-dasharray="1 2.6"', path(p))
for p in rail:
    ib.add('stroke="#2b2924" stroke-width="1.1" stroke-dasharray="6 3"', path(p))
for row in range(9):
    y0 = downs_top + 26 + row * 26
    if y0 > MAP_H - 6: break
    x = random.uniform(4, 18)
    while x < MAP_W:
        ib.add('stroke="#2b2924" stroke-width=".7"', f'M{f1(x)} {f1(y0 + random.uniform(-4, 4))}l{f1(random.uniform(1, 3))} {f1(random.uniform(7, 11))}')
        x += random.uniform(14, 26)
ib.add('stroke="#2b2924" stroke-width="1.1"', downs_edge)
for wid, p in woods:
    ib.add('stroke="#2b2924" stroke-width=".6" opacity=".7"', path(p, True))
    a = area(p)
    if a > 250:
        cx, cy = centroid(p)
        r = 5 if a < 1500 else 7
        for dx, dy in (((0, 0), (r * 1.6, r * .5), (-r * 1.5, r * .7)) if a > 900 else ((0, 0),)):
            x, y = cx + dx, cy + dy
            ib.add('stroke="#2b2924" stroke-width=".8"', f'M{f1(x - r)} {f1(y)}c{f1(-r*.3)} {f1(-r*1.2)} {f1(r*.9)} {f1(-r*1.9)} {f1(r*1.2)} {f1(-r*1.1)}c{f1(r*.6)} {f1(-r*.6)} {f1(r*1.5)} {f1(r*.1)} {f1(r*1.1)} {f1(r*1)}c{f1(r*.3)} {f1(r*.9)} {f1(-r*.6)} {f1(r*1.2)} {f1(-r*1.4)} {f1(r*.6)}M{f1(x)} {f1(y + r*.9)}v{f1(-r*.8)}')
for name, ww, p in streams:
    ib.add(f'stroke="#2f4a73" stroke-width="{1.5 if ww == "stream" else .8}"', path(p))
for p in water:
    ib.add('stroke="#2f4a73" stroke-width=".8"', path(p, True))
for name, p in paths_:
    ib.add('stroke="#2b2924" stroke-width=".9" stroke-dasharray="3 3"', path(p))
def plen(p): return sum(math.hypot(p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]) for i in range(len(p)-1))
svc = [p for p in roads_service if plen(p) > 25]
for p in svc: ib.add('stroke="#2b2924" stroke-width="3.4"', path(p))
for n, p in roads_minor: ib.add('stroke="#2b2924" stroke-width="6.4"', path(p))
for n, p in roads_major: ib.add('stroke="#2b2924" stroke-width="9"', path(p))
for p in svc: ib.add('stroke="#efe6d0" stroke-width="1.8"', path(p))
for n, p in roads_minor: ib.add('stroke="#efe6d0" stroke-width="4.4"', path(p))
for n, p in roads_major: ib.add('stroke="#ecdcae" stroke-width="6.6"', path(p))
for wid, p in big:
    ib.add('stroke="#2b2924" stroke-width=".6"', path(p, True))
cx, cy = MAP_W - 28, 84
ib.add('stroke="#2b2924" stroke-width="1.2"', f'M{cx} {cy}V{cy+30}M{cx} {cy}l-5 10M{cx} {cy}l5 10')
out.append(f"<g {I}>{ib.render()}</g>")
out.append(f'<rect width="{MAP_W}" height="{MAP_H}" filter="url(#pm-paper)" style="mix-blend-mode:multiply" pointer-events="none"/>')

# ---- Labels -------------------------------------------------------------------
def clip_run(points, m=24):
    """Longest run of consecutive points that sits well inside the frame."""
    best, cur = [], []
    for x, y in points:
        if m <= x <= MAP_W - m and m <= y <= MAP_H - m:
            cur.append((x, y))
            if len(cur) > len(best): best = cur[:]
        else:
            cur = []
    return best

def label_on(points, text, size=13, italic=True, colour="#2b2924", offset=0, at=0.5):
    """Place text along a polyline (its visible part), rotated to follow it."""
    points = clip_run(points)
    if len(points) < 2: return ""
    segs = [(points[i], points[i + 1]) for i in range(len(points) - 1)]
    lengths = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in segs]
    total, target = sum(lengths), sum(lengths) * at
    acc = 0
    for (a, b), L in zip(segs, lengths):
        if acc + L >= target and L > 0:
            t = (target - acc) / L
            x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
            if ang > 90: ang -= 180
            if ang < -90: ang += 180
            nx, ny = -math.sin(math.radians(ang)), math.cos(math.radians(ang))
            x, y = x + nx * offset, y + ny * offset
            style = ' font-style="italic"' if italic else ""
            return f'<text x="{f1(x)}" y="{f1(y)}" font-size="{size}"{style} fill="{colour}" text-anchor="middle" transform="rotate({f1(ang)} {f1(x)} {f1(y)})">{text}</text>'
        acc += L
    return ""

def longest(name, coll):
    cands = [p for n, p in coll if n == name]
    if not cands: return None
    # join into the longest single piece
    return max(cands, key=lambda p: sum(math.hypot(p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]) for i in range(len(p)-1)))

labels = ['<g font-family="IM Fell English, Georgia, serif" paint-order="stroke" stroke="#f3efe4" stroke-width="3" stroke-linejoin="round">']
hs = longest("High Street", roads_minor)
if hs: labels.append(label_on(hs, "High Street", 13, offset=9, at=0.07))
cs = longest("Cat Street", roads_minor)
if cs: labels.append(label_on(cs, "Cat Street", 13, offset=-8))
rr = longest("Reading Road", roads_major)
if rr: labels.append(label_on(rr, "Reading Road (A417)", 12, offset=-10, at=0.62))
brook = [p for n, ww, p in streams if n in ("East Hendred Brook", "Hendred Brook")]
if brook:
    b = max(brook, key=lambda p: len(clip_run(p)))
    labels.append(label_on(b, "East Hendred Brook", 13, colour="#2f4a73", offset=11, at=0.5))
iw = [p for n, p in paths_ + roads_minor if n == "Icknield Way"]
if iw:
    labels.append(label_on(max(iw, key=lambda p: len(clip_run(p))), "Icknield Way", 12, offset=-8, at=0.35))
rx, ry = project(51.60125, -1.3392)
labels.append(f'<text x="{f1(rx)}" y="{f1(ry)}" font-size="12" font-style="italic" fill="#2b2924" text-anchor="middle" transform="rotate(-1.5 {f1(rx)} {f1(ry)})">Reading Road (A417)</text>')
lx, ly = project(51.6014, -1.3452)
labels.append(f'<text x="{f1(lx)}" y="{f1(ly)}" font-size="12" font-style="italic" fill="#2b2924">Lud Bridge</text>')
labels.append(f'<text x="{f1(cx)}" y="{cy + 44}" font-size="13" text-anchor="middle" fill="#2b2924">N</text>')
labels.append(f'<text x="{MAP_W/2}" y="{f1(downs_top + 120)}" font-size="17" letter-spacing="1.5" text-anchor="middle" fill="#2b2924">THE BERKSHIRE DOWNS</text>')
labels.append("</g>")
out += labels

svg = f'<svg viewBox="0 0 {MAP_W} {MAP_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">{defs}{"".join(out)}</svg>'

js = f"""// Painted map of East Hendred, traced from OpenStreetMap data.
// Map data © OpenStreetMap contributors (ODbL). Generated by build.py — edit that, not this.
export const MAP_W = {MAP_W}, MAP_H = {MAP_H};
export const BOUNDS = {{ north: {NORTH}, south: {SOUTH}, west: {WEST}, east: {EAST} }};
export const ATTRIBUTION = "Map data © OpenStreetMap contributors";

// Same equirectangular projection the drawing was made with: x/y are in drawing pixels.
export function project(lat, lng) {{
  const x = (lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west) * MAP_W;
  const y = (BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south) * MAP_H;
  return {{ x, y, inside: x >= 0 && x <= MAP_W && y >= 0 && y <= MAP_H }};
}}
"""
open("painted-map.js", "w").write(js)
# The drawing itself only feeds render.mjs, so the app doesn't download it.
open("painted-svg.js", "w").write("// The painted map's SVG source, used only by render.mjs.\n" + f"export const PAINTED_SVG = `{svg}`;\n")
print("svg bytes", len(svg), "| fields", len(fields), "woods", len(woods), "buildings", len(buildings),
      "streams", len(streams), "roads", len(roads_major), len(roads_minor), len(roads_service), "paths", len(paths_))
