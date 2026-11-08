// Escape text for safe use in HTML.
export const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Wraps "[to add]"-style placeholders so they stand out until real text is written.
export const withGaps = (s = "") => esc(s).replace(/\[([^\]]+)\]/g, '<span class="gap">[$1]</span>');

export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  }
};
