// Stories and legends, loaded from content/stories.json.
// That file is published from the Stories spreadsheet (see tools/apps-script/Code.gs).

export const TYPES = [
  { id: "History", one: "History", label: "History", blurb: "Documented and sourced." },
  { id: "Memory", one: "Memory", label: "Memories", blurb: "Remembered by the people who were there." },
  { id: "Legend", one: "Legend", label: "Legends", blurb: "Tied to real places and people, never proven." },
  { id: "Folk tale", one: "Folk tale", label: "Folk tales", blurb: "Traditional tales, not claimed to be true." },
  { id: "Ghost story", one: "Ghost story", label: "Ghost stories", blurb: "Sightings and hauntings." }
];

export const FOLKLORE = new Set(["Legend", "Folk tale", "Ghost story"]);
export const typeName = (t) => (TYPES.find((x) => x.id === t) || { one: t }).one;
export const isFolklore = (s) => FOLKLORE.has(s.type);

let cache = null;

export function loadStories() {
  if (!cache) {
    cache = fetch("content/stories.json", { cache: "no-cache" })
      .then((r) => { if (!r.ok) throw new Error(`stories.json: ${r.status}`); return r.json(); })
      .then((d) => (Array.isArray(d.stories) ? d.stories : []).filter((s) => s && s.id && s.title))
      .catch((err) => { console.warn("Couldn’t load stories", err); cache = null; return []; });
  }
  return cache;
}

export const paragraphs = (body = "") => String(body).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

// Long stories get their own page; short ones are shown in full in the list.
export const isLong = (s) => {
  const ps = paragraphs(s.body);
  return ps.length > 2 || String(s.body).length > 650;
};

// "Remembered by …", "Shared by …", or the people involved.
export function byline(s) {
  if (s.type === "Memory") return s.credit ? `Remembered by ${s.credit}` : (s.people || "");
  // Skip the date if the people line already carries one ("rector 1753–61").
  const when = s.people && /\d{3,4}/.test(s.people) ? "" : s.when;
  return [s.people, when].filter(Boolean).join(", ");
}
