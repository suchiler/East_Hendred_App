# East Hendred Through Time

An installable web app (PWA) about a thousand years of East Hendred, a chalk-downland village in the Vale of White Horse:

- **Timeline:** 23 moments from the Ridgeway to the clock's 500th birthday, newest first ("start at the surface and dig down"), grouped by era. It also counts down to the next tune of the 1525 faceless clock.
- **Stories:** real local people, each with its source: blacksmiths, evacuees, schoolchildren, a letter-writing parson.
- **Map:** a painted village map, plus today's map and slots for historic Ordnance Survey maps (1920s, 1870s) and Rocque's 1761 survey.
- **Walk:** a seven-stop guided walk that remembers your progress.

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

- **Stories and legends** live in the Stories spreadsheet and are published to `content/stories.json`. See "Stories: from the form to the app" below.
- **Everything else** (eras, timeline entries, map sites and the walk) is in **`js/data.js`**. Edit the text there and reload the app.

These still need local knowledge. They show in the app as red `[bracketed]` placeholders:

- [ ] Walk facts: distance, time, ground, step-free access (`WALK.facts`)
- [ ] "Getting there" directions between stops (`WALK.stops[].getThere`)
- [x] Walk order confirmed (Nov 2026): St Augustine’s, St Mary’s, Hendred House, the Eyston Arms, King’s Manor, Champs Chapel, Orchard House
- [ ] Ground-check the mill's position (`SITES`, id `mill`): two sources differ by about 150 m
- [ ] Confirm with the church: the clock's 2024 restoration and automatic winding

## Stories: from the form to the app

```
Google Form  →  Submissions tab  →  Library tab  →  Publish  →  content/stories.json  →  app
 (public)        (raw answers)       (you edit,       (menu or     (on GitHub)
                                      set Status)      daily)
```

1. People fill in the **form**. Their answers land in the **Submissions** tab, which you shouldn't edit.
2. Each submission is copied into the **Library** tab with **Status = New**, and you get an email.
3. You tidy the text, add a source line, check coordinates, and set **Status = Ready** when it's good to go.
   Use Checking while you're working on it, and Not used for anything you won't publish.
4. **Stories app → Publish to app now** (or the daily 3am publish) sends the Ready rows to GitHub.
   The app picks them up within a few minutes. Rows with problems are skipped and listed for you.

The spreadsheet stays private. Only these columns are ever published: title, type, category, summary, story, people,
when, sort year, era, place, coordinates, source, credit, linked entry, artwork and featured.
Status, editor's notes, submission times and anything in Submissions (names, emails) never leave the Sheet.

**Why the Sheet pushes to GitHub.** It would also be possible for GitHub to read the Sheet, but reading a private Sheet
needs a Google Cloud service account. Pushing from the Sheet needs only a GitHub token, so this way is simpler to set up.

### One-time setup

1. Open the Stories spreadsheet, then **Extensions → Apps Script**.
2. Delete what's in `Code.gs`, paste in all of **`tools/apps-script/Code.gs`**, and click **Save**.
   (Optional: in Project Settings, tick "Show appsscript.json" and paste in `tools/apps-script/appsscript.json`, which sets the UK time zone.)
3. Choose **setup** in the function menu and click **Run**. Google asks you to allow access: click through, and choose **Advanced → Go to project** if it warns that the app isn't verified. It's your own script.
4. A box shows the form link. Share the short link with people. Paste the long link into `STORY_FORM_URL` in **`js/config.js`**.
5. Make a GitHub token: on GitHub, go to **Settings → Developer settings → Fine-grained tokens → Generate new token**.
   - Under **Repository access**, choose **Only select repositories** and pick East_Hendred_App.
   - Under **Permissions → Contents**, choose **Read and write**.
6. Back in the spreadsheet, reload the page. Choose **Stories app → Set GitHub token…** and paste the token.
   (Or add it under Apps Script **Project Settings → Script properties** as `GITHUB_TOKEN`.)
   If the app lives on a different branch, add `GITHUB_BRANCH` there too. The default is the branch this code is on.
7. Choose **Stories app → Publish to app now**. It should say "No changes" or "Published".

### Adding a category

Add it to the **Category** column of the **Lists** tab, then run **Stories app → Set up or repair**.
That updates the form's choices to match. Contributors can always pick **Other** and type their own,
and custom categories are allowed in the Library too.

### Story types

| Type | Meaning | In the app |
|---|---|---|
| History | Documented and sourced | Its own section |
| Memory | First-hand recollection | Its own section, with "Remembered by …" |
| Legend | Tied to a real place or person, unproven | Its own section, marked ‡ |
| Folk tale | Traditional tale, not claimed as true | Its own section, marked ‡ |
| Ghost story | Sightings and hauntings | Its own section, marked ‡ |

Stories with coordinates also appear as pins on the map: blue for history and memories, red with ‡ for folklore.

## Maps

The Map screen always opens on the painted map. "Choose a map" only lists maps that can be shown right now. The others keep their settings in `js/config.js` and appear automatically once they're ready (a key or URL is added). The credit for the current map is shown as small text under the "Map:" pill.

| Map | Status | What's needed |
|---|---|---|
| Painted | ✅ Works | Nothing. Traced from OpenStreetMap; rebuild the drawing with `tools/painted-map/build.py` (see its NOTES.md). It's shown as a pre-rendered image (`art/painted-map@2x.webp` and `@3x.webp`), because large SVG watercolour filters are too heavy for some phones. **After changing the drawing, re-render it:** `NODE_PATH=$(npm root -g) node tools/painted-map/render.mjs` |
| Today | ✅ Works | OpenStreetMap, free with attribution (fine for a community app) |
| Habitats | ✅ Works | Natural England's Living England habitat map (every field classified), drawn over OpenStreetMap, with a key |
| Geology | ✅ Works | British Geological Survey 1:625,000 bedrock, with a key (Gault and Greensand, Grey Chalk, White Chalk) |
| 1920s OS One-inch | ⏳ Hidden | A National Library of Scotland (NLS) map key |
| 1870s OS Six-inch | ⏳ Hidden | Same NLS key |
| 1761 Rocque | ⏳ Hidden | A scan of the Berkshire sheet, lined up with today's map and served as tiles |

**Getting the NLS key:** email **maps@nls.uk** and explain that this is a free, non-commercial community app for East Hendred, or use their Historic Maps subscription through MapTiler. Paste the key into `MAPTILER_KEY` in **`js/config.js`**. Before going live, check the tileset IDs in that file against MapTiler's NLS catalogue. The credit "Courtesy of the National Library of Scotland" is already shown.

## Land page

The **Land** tab covers the parish's rocks, the shape of the land, the Ridgeway, water, soils and farming, wildlife and how the landscape has changed. Each section ends with a "Look for" note, a "Current issues" panel and one link for further reading or action.

- **Content:** everything is in **`content/land.json`**: the intro, the "Before people" deep-time strip, the seven sections, the red kite panel, the species list, "Further afield" and the cross-section caption. Edit the text there. A section's `place` links it to a map pin, and `check` shows a "Still to check" note in its sources.
- **Map pins:** the nature places (Ridgeway car park, the Ridgeway at East Hendred Down, the Icknield Way crossing, the brook at Ford Lane) are `NATURE_SITES` in **`js/data.js`**. Only public places are pinned, and rare or protected species are never given locations.
- **Map layers** (in "Choose a map", drawn over today's OpenStreetMap):

  | Layer | Status | Licence and credit |
  |---|---|---|
  | Habitats: Natural England's Living England habitat map | ✅ Works | Made freely available by Defra and Natural England (Open Government Licence). Credit: "Living England © Natural England". The earlier Priority Habitat Inventory only covered about 4% of the parish, so it looked almost the same as today's map. |
  | Rocks: British Geological Survey 1:625,000 geology | ✅ Works | Open Government Licence. Credit: "Contains British Geological Survey materials © UKRI". Layer `GBR_BGS_625k_BLS`; the key's three units were checked with the server's feature info. |

  The more detailed BGS 1:50,000 geology isn't included: its data is commercially licensed, so ask BGS first.
- **Illustrations:** the cross-section and vignettes are in **`js/land-art.js`**. To use hand-painted scans, add them to `ART_IMAGES` in `js/config.js` with these keys: `cross-section`, `section-rocks`, `section-shape`, `section-ridgeway`, `section-water`, `section-soils`, `section-living`, `section-change`, `red-kite`, `species-skylark`, `species-yellowhammer`, `species-kestrel`, `species-brown-hare`, `species-marbled-white`, `species-rock-rose`, `species-wild-thyme`, `species-knapweed`, `fossil-urchin`. Paint the cross-section to the same frame as the drawing (640 × 230), so the labels still line up, or bake the labels into the painting.

**Questions only a local can answer** (from the research):

- [ ] Where exactly are the springs that feed East Hendred Brook, and are any on public land?
- [ ] Has the village flooded from the brook or from groundwater in living memory (e.g. 2007, 2014)? No published records were found.
- [ ] Which local building stones are used in the village (clunch, flint, sarsen, greensand, brick)? The Conservation Area Appraisal has a section on this that couldn't be opened here.
- [ ] Is the brook known locally as East Hendred Brook, Hendred Brook or Ginge Brook through the village? Maps disagree.
- [ ] Are brown trout, bullhead or water voles in East Hendred Brook today?
- [ ] Exact parish boundaries north and south (does the parish reach the Ridgeway along its whole southern edge?).
- [ ] Is Diamond Jubilee Wood (and any other plantation) publicly accessible?
- [ ] Does the village itself lie inside the North Wessex Downs National Landscape, or only the downs?
- [ ] Golden Mile Row North/South are named woodland strips east of the village (OSM) — do they relate to the 'Golden Mile' cloth-fair legend?
- [ ] Is there a parish species list available from TVERC to confirm which species to feature?

## Hand-painted artwork

The illustrations are drawn in code, in an ink-and-watercolour style. To use real paintings:

1. Save each scan in an `art/` folder, as WebP or PNG on a transparent or paper-coloured background, at twice the display size.
2. List it in `ART_IMAGES` in **`js/config.js`**, for example `"tower": "art/tower.webp"`.

The slot names are `tower`, `era-pre`, `era-saxon`, `era-med`, `era-ref`, `era-mod`, `era-atom`, `knob`, `envelope` and `story-anvil`, `story-label`, `story-slate`, `story-jar`, `story-plane`, `story-quill`, `story-bell`, `story-house`.

## After changing files

Bump `VERSION` in **`sw.js`** (for example `eh-v2`). Otherwise phones that have already installed the app may keep showing the old version until it refreshes.

## Credits

- Timeline facts: Victoria County History of Berkshire, vol. 4; Historic England; Hendred Museum.
- Stories: the East Hendred Bulletin; *A Parson in the Vale of White Horse*, ed. Donald Gibson (1982); The Hunts of East Hendred.
- Maps: © OpenStreetMap contributors (the painted map is traced from OpenStreetMap data, ODbL); historic OS maps courtesy of the National Library of Scotland.
- Fonts: IM Fell English (Igino Marini), Libre Franklin, IBM Plex Mono, served from Google Fonts.
- [Leaflet](https://leafletjs.com) 1.9.4 (BSD-2-Clause), included in `vendor/`.
