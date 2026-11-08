# East Hendred Through Time

An installable web app (PWA) about a thousand years of East Hendred, a chalk-downland village in the Vale of White Horse:

- **Timeline:** 23 moments from the Ridgeway to the clock's 500th birthday, newest first ("start at the surface and dig down"), grouped by era. It also counts down to the next tune of the 1525 faceless clock.
- **Stories:** real local people, each with its source: blacksmiths, evacuees, schoolchildren, a letter-writing parson.
- **Map:** a painted village map, plus today's map and slots for historic Ordnance Survey maps (1920s, 1870s) and Rocque's 1761 survey.
- **Walk:** an eight-stop guided walk that remembers your progress.

It works offline once opened, and installs to a phone's home screen. There's no build step: it's plain HTML, CSS and JavaScript.

## Run it on your computer

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. A local server is needed, because opening `index.html` straight from disk won't run the app.

## Put it online (GitHub Pages, free)

1. On GitHub, open the repo, then go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Pick the branch that holds this code, choose the folder **/ (root)**, and select **Save**.
4. After a minute or two the app is live at `https://<your-username>.github.io/East_Hendred_App/`.

## Install it on a phone

- **iPhone (Safari):** open the link, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the link, tap the **⋮** menu, then **Install app** (or **Add to Home screen**).

## Editing content

Everything people read is in **`js/data.js`**: eras, timeline entries, stories, map sites and the walk. Edit the text there and reload the app.

These still need local knowledge. They show in the app as red `[bracketed]` placeholders:

- [ ] Walk facts: distance, time, ground, step-free access (`WALK.facts`)
- [ ] "Getting there" directions between stops (`WALK.stops[].getThere`)
- [ ] Confirm the walk order
- [ ] Real positions: each site's `lat`/`lng` is approximate, and `x`/`y` place it on the painted map
- [ ] Opening quotes for stories, from Woodward's letters or the Bulletin (optional)

## Maps

| Map | Status | What's needed |
|---|---|---|
| Painted | ✅ Works | Nothing |
| Today | ✅ Works | OpenStreetMap, free with attribution (fine for a community app) |
| 1920s OS One-inch | ⏳ Disabled | A National Library of Scotland (NLS) map key |
| 1870s OS Six-inch | ⏳ Disabled | Same NLS key |
| 1761 Rocque | ⏳ Disabled | A scan of the Berkshire sheet, lined up with today's map and served as tiles |

**Getting the NLS key:** email **maps@nls.uk** and explain that this is a free, non-commercial community app for East Hendred, or use their Historic Maps subscription through MapTiler. Paste the key into `MAPTILER_KEY` in **`js/config.js`**. Before going live, check the tileset IDs in that file against MapTiler's NLS catalogue. The credit "Courtesy of the National Library of Scotland" is already shown.

## Hand-painted artwork

The illustrations are drawn in code, in an ink-and-watercolour style. To use real paintings:

1. Save each scan in an `art/` folder, as WebP or PNG on a transparent or paper-coloured background, at twice the display size.
2. List it in `ART_IMAGES` in **`js/config.js`**, for example `"tower": "art/tower.webp"`.

The slot names are `tower`, `era-pre`, `era-saxon`, `era-med`, `era-ref`, `era-mod`, `era-atom`, `knob`, `envelope` and `story-anvil`, `story-label`, `story-slate`, `story-jar`, `story-plane`, `story-quill`, `story-bell`, `story-house`.

## Clock reminders

"Remind me" sends a notification five minutes before each tune while the app is open or running in the background. Reminders that arrive when the app is fully closed would need a small push server. That can be added later.

## After changing files

Bump `VERSION` in **`sw.js`** (for example `eh-v2`). Otherwise phones that have already installed the app may keep showing the old version until it refreshes.

## Credits

- Timeline facts: Victoria County History of Berkshire, vol. 4; Historic England; Hendred Museum.
- Stories: the East Hendred Bulletin; *A Parson in the Vale of White Horse*, ed. Donald Gibson (1982); The Hunts of East Hendred.
- Maps: © OpenStreetMap contributors; historic OS maps courtesy of the National Library of Scotland.
- Fonts: IM Fell English (Igino Marini), Libre Franklin, IBM Plex Mono, served from Google Fonts.
- [Leaflet](https://leafletjs.com) 1.9.4 (BSD-2-Clause), included in `vendor/`.
