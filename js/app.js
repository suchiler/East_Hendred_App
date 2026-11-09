// App shell: hash routing between the five tabs and the detail pages.
import { FILTER_DEFS } from "./art.js";
import { timelineView, entryView, storiesView, storyView, walkView } from "./views.js";
import { mapView } from "./map.js";
import { landView } from "./land.js";
import { LA_DEFS } from "./land-art.js";
import { focusHeading } from "./util.js";

document.body.insertAdjacentHTML("afterbegin", FILTER_DEFS + LA_DEFS);

const view = document.getElementById("view");
const tabs = [...document.querySelectorAll(".tabbar a")];
const scrollMemory = {};
let cleanup = null;
let current = "";

const TITLES = { timeline: "Timeline", stories: "Village voices", map: "Map", walk: "The village walk", land: "The land" };

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  // In-page anchors such as #era-med belong to the timeline.
  if (hash && !hash.includes("/") && !["stories", "map", "walk", "land", ""].includes(hash)) return;
  const [name = "", arg] = hash.split("/");
  const page = name || "timeline";

  scrollMemory[current] = view.scrollTop;
  if (cleanup) { try { cleanup(); } catch { /* ignore */ } cleanup = null; }
  view.className = `view view-${page}`;

  if (page === "entry") cleanup = entryView(view, arg);
  else if (page === "story") cleanup = storyView(view, decodeURIComponent(arg || ""));
  else if (page === "stories") cleanup = storiesView(view);
  else if (page === "map") cleanup = mapView(view, { sel: arg });
  else if (page === "walk") cleanup = walkView(view);
  else if (page === "land") cleanup = landView(view, arg);
  else cleanup = timelineView(view);

  const tab = page === "entry" ? "timeline" : page === "story" ? "stories" : page;
  tabs.forEach((a) => {
    const on = a.dataset.tab === tab;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });

  const key = hash || "timeline";
  view.scrollTop = page === "entry" || page === "story" || (page === "land" && arg) ? 0 : (scrollMemory[key] || 0);
  current = key;

  const h1 = view.querySelector("h1");
  if (page !== "story") document.title = page === "timeline" ? "East Hendred Through Time"
    : `${page === "entry" ? (h1?.textContent || "").trim() : TITLES[page]} · East Hendred Through Time`;
  // On navigation (not the first load), take focus to the new screen's heading.
  if (document.activeElement !== document.body) focusHeading(view);
}

window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
