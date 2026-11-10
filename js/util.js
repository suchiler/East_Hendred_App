// Escape text for safe use in HTML.
export const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  }
};

// True only while the app is first loading: focus isn't moved then, so the page reads from the top.
export const nav = { initial: true };

// Move focus to a screen's heading after it renders, for screen-reader and keyboard users.
// Skipped on the very first load.
export function focusHeading(root) {
  if (nav.initial) return;
  const h1 = root.querySelector("h1");
  if (!h1) return;
  h1.setAttribute("tabindex", "-1");
  h1.focus({ preventScroll: true });
}

// Scroll a sticky rail sideways so its active item is in view, without moving the page.
export function keepInRail(rail, a) {
  const left = a.offsetLeft - 10, right = a.offsetLeft + a.offsetWidth + 10;
  if (left < rail.scrollLeft) rail.scrollTo({ left, behavior: "smooth" });
  else if (right > rail.scrollLeft + rail.clientWidth) rail.scrollTo({ left: right - rail.clientWidth, behavior: "smooth" });
}

// Rails wrap onto extra lines on narrow screens. If one grows taller than about two lines
// (large text), it stops being sticky so it doesn't cover the page. Returns a cleanup function.
export function watchRail(rail) {
  if (!rail || !window.ResizeObserver) return () => {};
  const ro = new ResizeObserver(() => rail.classList.toggle("tall", rail.offsetHeight > 100));
  ro.observe(rail);
  return () => ro.disconnect();
}
