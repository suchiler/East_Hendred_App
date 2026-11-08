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

// Reminders: a notification five minutes before the next tune.
// Web apps can only do this while the app is open or in the background;
// true push reminders would need a server (see README).
const KEY = "eh.remind";
let timer = null;

export function reminderOn() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export async function setReminder(on) {
  if (on) {
    if (!("Notification" in window)) return { ok: false, reason: "This browser can’t show notifications." };
    const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (perm !== "granted") return { ok: false, reason: "Notifications are turned off for this app in your settings." };
  }
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* private mode */ }
  scheduleReminder();
  return { ok: true };
}

export function scheduleReminder() {
  clearTimeout(timer);
  if (!reminderOn() || !("Notification" in window) || Notification.permission !== "granted") return;
  const now = ukNow();
  const n = nextTune(now);
  let wait = n.at - now - 5 * 60000;
  if (wait < 0) wait += 3 * 3600000; // already inside the five minutes: wait for the one after
  timer = setTimeout(async () => {
    const body = `The faceless clock plays the Angels’ Song at ${n.name}. Head for St Augustine’s churchyard.`;
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) reg.showNotification("Five minutes to the tune", { body, icon: "icons/icon-192.png", tag: "clock" });
      else new Notification("Five minutes to the tune", { body });
    } catch { /* ignore */ }
    scheduleReminder();
  }, wait);
}
