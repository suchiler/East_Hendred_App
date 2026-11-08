# content/stories.json

The app's stories and legends. **Don't edit this file by hand.** It's published from the Library tab of the
Stories spreadsheet by `tools/apps-script/Code.gs` (Stories app → Publish to app now, or the daily publish).
Only rows with **Status = Ready** that pass the checks are included.

## Shape

```json
{
  "schema": 1,
  "generated": "2026-11-08T12:30:00Z",
  "stories": [
    {
      "id": "keeping-the-clock",          // stable, used in links: #/story/<id>
      "type": "History",                   // History | Memory | Legend | Folk tale | Ghost story
      "category": "Church & chapel",       // from the Lists tab, or a custom one; "Other" if blank
      "title": "Keeping the faceless clock",
      "summary": "One line, used on map pins and lists.",
      "body": "Paragraphs separated by a blank line (\n\n).",
      "people": "John Seymour of Wantage; Arthur Harrison",
      "when": "1525–2025",                  // shown as written
      "sortYear": 1525,                     // number or null, for ordering
      "era": "Monks & wool",                // worked out from sortYear ("" if none)
      "place": "St Augustine’s Church",
      "coordinates": [51.5945, -1.3383],    // [lat, lng] or null; null = no map pin
      "source": "Where the story comes from (required)",
      "credit": "Contributor credit, e.g. A villager (may be empty)",
      "linkedEntry": "clock",               // a timeline entry id from js/data.js, or ""
      "artwork": "story-bell",              // an illustration slot (see js/art.js), or ""
      "featured": false                     // true puts it first in its section
    }
  ]
}
```

Never published: Status, Editor notes, Submitted, and anything from the Submissions tab (names, emails).
