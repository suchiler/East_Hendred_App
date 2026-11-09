# East Hendred Through Time: notes for Claude

## Product backlog (always keep it up to date)
The owner keeps a product backlog in the **Backlog** tab of the Stories spreadsheet
(Google Sheet id `1HXDAIVmzE1G03FDKcYGBA3bxwfpH0N3jWjRQA-9Jt5A`).

- **Every** new feature, idea, fix, chore or user story identified in a session goes into the Backlog,
  even if it is done straight away (then add it with Status `Done`, the date done and the commit).
- When work on an existing item starts or finishes, update its Status, Date done and Commit / release.
- IDs: `EH-###` for items (next free number), `EH-E##` for epics. Use the existing columns and
  dropdown values (Type, Status, Priority = MoSCoW, Value 1–5, Effort XS–XL, Area).
- Write user stories as "As a … I want … so that …", and fill Acceptance criteria and Implementation notes
  (files, approach) so the item can be built later without re-deriving context.
- If the Google Sheets connector isn't available, list the backlog rows to add in your reply (or in
  `docs/`) and tell the owner, rather than skipping it.

## Stories content
`content/stories.json` is published from the **Library** tab of the same spreadsheet. Any change to story
text, category, type or artwork must be made in the Library tab as well as in `stories.json`, or the next
"Publish to app" will undo it.

## Scope
Decided 2026-11-09: the app stays a heritage app. Static, low-maintenance village information may be added;
live "service" content (shop hours, notices, events feeds, notifications) is parked. See Backlog epic EH-E10.
