// App shell: hash routing between the four tabs and the entry pages.
import { FILTER_DEFS } from "./art.js";
import { timelineView, entryView, storiesView, walkView } from "./views.js";
import { mapView } from "./map.js";
import { scheduleReminder } from "./clock.js";

document.body.insertAdjacentHTML("afterbegin", FILTER_DEFS);

const view = document.getElementById("view");
const tabs = [...document.querySelectorAll(".tabbar a")];
const scrollMemory = {};
let cleanup = null;
let current = "";

const TITLES = { timeline: "Timeline", stories: "Village voices", map: "Map", walk: "The village walk", entry: "" };

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  // In-page anchors such as #era-med belong to the timeline.
  if (hash && !hash.includes("/") && !["stories", "map", "walk", ""].includes(hash)) return;
  const [name = "", arg] = hash.split("/");
  const page = name || "timeline";

  scrollMemory[current] = view.scrollTop;
  if (cleanup) { try { cleanup(); } catch { /* ignore */ } cleanup = null; }
  view.className = `view view-${page}`;

  if (page === "entry") cleanup = entryView(view, arg);
  else if (page === "stories") cleanup = storiesView(view);
  else if (page === "map") cleanup = mapView(view, { sel: arg });
  else if (page === "walk") cleanup = walkView(view);
  else cleanup = timelineView(view);

  const tab = page === "entry" ? "timeline" : page;
  tabs.forEach((a) => {
    const on = a.dataset.tab === tab;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });

  const key = hash || "timeline";
  view.scrollTop = page === "entry" ? 0 : (scrollMemory[key] || 0);
  current = key;

  const h1 = view.querySelector("h1");
  document.title = page === "timeline" ? "East Hendred Through Time"
    : `${page === "entry" ? (h1?.textContent || "").trim() : TITLES[page]} · East Hendred Through Time`;
  // Move focus to the new screen's heading for screen-reader and keyboard users.
  if (h1 && document.activeElement !== document.body) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
}

window.addEventListener("hashchange", route);
route();
scheduleReminder();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
