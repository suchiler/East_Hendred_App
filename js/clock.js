// The faceless clock plays the Angels' Song at 9am, noon, 3pm and 6pm, UK time.
export const TUNES = [9, 12, 15, 18];
const NAMES = { 9: "9am", 12: "noon", 15: "3pm", 18: "6pm" };

// Current wall-clock time in the UK, whatever the phone's own time zone.
export function ukNow(base = new Date()) {
  try {
    return new Date(base.toLocaleString("en-US", { timeZone: "Europe/London" }));
  } catch {
    return base;
  }
}

export function nextTune(now = ukNow()) {
  for (const h of TUNES) {
    const t = new Date(now);
    t.setHours(h, 0, 0, 0);
    if (t > now) return { at: t, name: NAMES[h], tomorrow: false };
  }
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  t.setHours(TUNES[0], 0, 0, 0);
  return { at: t, name: NAMES[TUNES[0]], tomorrow: true };
}

export function untilText(ms) {
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60), m = mins % 60;
  if (!h) return `in ${m} min`;
  return `in ${h} h ${m} min`;
}

// Which of today's tunes have already played.
export function bells(now = ukNow()) {
  const next = nextTune(now);
  return TUNES.map((h) => {
    const t = new Date(now);
    t.setHours(h, 0, 0, 0);
    return { label: NAMES[h], played: next.tomorrow || t <= now };
  });
}

export function summary(now = ukNow()) {
  const n = nextTune(now);
  return {
    title: `The clock plays next at ${n.name}${n.tomorrow ? " tomorrow" : ""}`,
    short: `${n.name}${n.tomorrow ? " tomorrow" : ""}, ${untilText(n.at - now)}`,
    until: untilText(n.at - now),
    bells: bells(now)
  };
}
