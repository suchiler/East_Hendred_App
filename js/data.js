// All of the app's content lives here, so it can be edited without touching the code.
// Each entry carries its own `sources`; "Source to be added." marks ones still to find.
// Anything marked TODO still needs local knowledge.

export const ERAS = [
  { id: "atom", name: "Speed & the atom", span: "1900 to today", color: "#2f6f6a", tint: "rgba(47,111,106,0.10)", art: "era-atom" },
  { id: "mod", name: "Parsons & enclosure", span: "1700–1900", color: "#7a5a32", tint: "rgba(122,90,50,0.10)", art: "era-mod" },
  { id: "ref", name: "Reformation & recusants", span: "1530–1700", color: "#5b4a78", tint: "rgba(91,74,120,0.10)", art: "era-ref" },
  { id: "med", name: "Monks & wool", span: "1100–1530", color: "#8c3b2c", tint: "rgba(140,59,44,0.10)", art: "era-med" },
  { id: "saxon", name: "Saxon & Domesday", span: "900–1100", color: "#8a5a14", tint: "rgba(138,90,20,0.10)", art: "era-saxon" },
  { id: "pre", name: "Ancient routes", span: "Before 900", color: "#5f6a3e", tint: "rgba(95,106,62,0.10)", art: "era-pre" }
];

// Newest first: the timeline starts at the surface and digs down.
export const ENTRIES = [
  { id: "clock-500", era: "atom", date: "2025", title: "The clock turns 500", gloss: "Clock500 tower tours",
    body: "The village celebrated the clock’s 500th birthday with tower tours. It was overhauled in 1961 and restored again in 2024, and still keeps good time.",
    spot: "Check the church’s events page for future tower tours.", site: "church", art: "tower",
    sources: "BBC News, ‘Oxfordshire clock still keeping village on time after 500 years’, 28 May 2025; Hendred Museum, ‘Points of interest’ (1961 overhaul)." },
  { id: "oxfordshire", era: "atom", date: "1974", title: "Berkshire to Oxfordshire", gloss: "A thousand years in one county ends",
    body: "Local government reorganisation moved the village out of Berkshire, which it had belonged to for a thousand years, and into Oxfordshire.",
    spot: "Old maps and guidebooks still list it under Berkshire.",
    sources: "Local Government Act 1972, in force from 1 April 1974." },
  { id: "harwell", era: "atom", date: "1946", title: "The atom next door", gloss: "Harwell, and William Penney",
    body: "Britain’s atomic research centre opened on the airfield at neighbouring Harwell, and the western edge of today’s Harwell Science and Innovation Campus lies inside the parish. Physicist William Penney, a leader of Britain’s nuclear weapons programme, lived at Orchard House on Cat Street until his death in 1991. He took the title Baron Penney of East Hendred.",
    spot: "A blue plaque, unveiled in 2014, marks his house, Orchard House, on Cat Street. It’s a private home, so view it from the street.", site: "orchard",
    sources: "Oxfordshire Blue Plaques Board, ‘William Penney’; ‘William Penney, Baron Penney’, Wikipedia; ‘RAF Harwell’, Wikipedia." },
  { id: "eyston-speed", era: "atom", date: "1937–38", title: "The fastest man on Earth", gloss: "Captain George Eyston",
    body: "Captain George Eyston, born at Bampton into the family whose seat was Hendred House, set the world land speed record three times in his giant eight-wheeled car Thunderbolt, on the Bonneville Salt Flats in Utah: 312 mph in November 1937, about 345 mph in August 1938, and 357.5 mph on 16 September 1938, the day after John Cobb had briefly taken the record from him.",
    spot: "A good story for the Eyston Arms.", site: "eyston-arms",
    sources: "Motor Sport, ‘Eyston’s great record’, September 1938; ‘Thunderbolt (car)’, Wikipedia." },
  { id: "st-marys", era: "mod", date: "1865", title: "A Catholic church at last", gloss: "St Mary’s, St Mary’s Road",
    body: "The Eystons built St Mary’s Catholic church, designed by Charles Alban Buckler and linked to its presbytery by a timber gallery. After three centuries of private worship, the village’s Catholics had a public church.",
    spot: "St Mary’s is on St Mary’s Road, a short walk from Hendred House.", site: "st-marys",
    sources: "Historic England list entry 1048148 (Roman Catholic Church of St Mary); Taking Stock (Catholic Church in England and Wales), ‘East Hendred – St Mary’." },
  { id: "enclosure", era: "mod", date: "1801", title: "Fields fenced in", gloss: "The Enclosure Act",
    body: "An Act of 1801 enclosed the western open fields, replacing medieval strips with hedged fields. Some charity land for the poor was swapped for a plot in ‘Alley Green Furlong’.",
    spot: "The straight hedgerows north and west of the village date from this era.",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "woodward", era: "mod", date: "1753", title: "A parson’s letters", gloss: "Revd George Woodward",
    body: "Rector George Woodward, who served the parish until his death on 5 May 1790, wrote letters to his uncle from East Hendred between 1753 and 1761. They were later published as ‘A Parson in the Vale of White Horse’, and give a rare, informal view of a Georgian parson’s household.",
    spot: "The rectory opposite the church was his home.", site: "church",
    sources: "D. Gibson (ed.), A Parson in the Vale of White Horse: George Woodward’s Letters from East Hendred 1753–1761 (1982); Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "ransacked", era: "ref", date: "1688", title: "Restored, then ransacked", gloss: "The Glorious Revolution",
    body: "St Amand’s Chapel was restored in 1687 under the Catholic King James II. The next year, William of Orange’s army passed through and wrecked it. It was repaired soon after.",
    spot: "Look for 17th-century glass roundels if you visit the chapel on an open day.", site: "hendred-house",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "ghosts", era: "ref", date: "1640s", title: "Ghosts without feet", gloss: "Civil War billets",
    body: "Parliamentarian soldiers are said to have billeted in the village after one of the Battles of Newbury.",
    legend: "In the 1940s, a cottage reported ghostly Roundheads visible only from the ankles up, because the floor had since been raised.",
    spot: "No public site, just a good story for the walk.",
    sources: "Royal Berkshire History, ‘East Hendred’ (Nash Ford Publishing, 2001)." },
  { id: "recusants", era: "ref", date: "From 1559", title: "A Catholic village in a Protestant England", gloss: "The Eyston recusants",
    body: "After the Elizabethan Settlement of 1559 made Protestant worship the law, the Eystons refused to give up Catholicism, and many tenants quietly followed them. This shaped the village for centuries. The family are also linked to Sir Thomas More: a later Charles Eyston married Maria Theresa Throckmorton, one of More’s descendants, and relics of More, including a drinking cup, came to Hendred House through her family.",
    spot: "The Eyston chapel in the parish church holds their brasses and floor slabs.", site: "church",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’. The Throckmorton marriage and More relics: source to be added." },
  { id: "dissolution", era: "ref", date: "1539", title: "Monks out, Crown in", gloss: "Dissolution of Sheen Priory",
    body: "Sheen Priory was dissolved and its East Hendred estate was once more in royal hands. The manor had belonged to the Crown before Henry V gave it to the monks, and the name King’s Manor stuck. The monks’ chapel was sold off and later used as a pigeon-house, bakehouse and wash-house by the Champ family, who gave it its nickname.",
    spot: "Look at the chapel’s west end, where an upper floor was inserted.", site: "kings-manor",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "clock", era: "med", date: "1525", title: "A clock without a face", gloss: "John Seymour of Wantage",
    body: "Seymour built the church clock in 1525. It has no dial and no hands: it tells the time by its bells alone, and every three hours from nine in the morning it now plays a hymn tune, the Angels’ Song by Orlando Gibbons, published in 1623 (so the tune was added long after the clock was made). It is thought to be one of the oldest clocks in Britain still in its original place. It was overhauled in 1961 and restored again in 2024.",
    spot: "Stand in St Augustine’s churchyard at 9am, noon, 3pm or 6pm to hear it play.", site: "church", art: "tower", clock: true,
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’; C.F.C. Beeson, Clockmaking in Oxfordshire 1400–1850 (3rd edn, 1989), p. 20; Historic England listing for the Church of St Augustine." },
  { id: "champs-chapel", era: "med", date: "1453", title: "The Chapel of Jesus of Bethlehem", gloss: "Champs Chapel",
    body: "The Sheen monks built a small wayside chapel with a priest’s house beside it. It is now Grade I listed.",
    spot: "This is the village museum today, in Chapel Square.", site: "champs",
    sources: "Historic England list entry 1048167 (Jesus Chapel and attached house); Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "eystons", era: "med", date: "1443", title: "The Eystons move in, and stay", gloss: "Hendred House",
    body: "Isabel Stowe, heiress of the Arches family, married John Eyston, and Arches manor passed to the Eystons in the mid-15th century. They have lived at Hendred House ever since, making them old Berkshire’s longest-serving family on a single manor.",
    spot: "The Eyston Arms pub is named after them.", site: "hendred-house",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "cloth-town", era: "med", date: "1439", title: "When Hendred was a cloth town", gloss: "The wool merchants’ brasses",
    body: "In the 15th century the cloth trade made East Hendred rich enough to be called a town. A brass of 1439 shows the Eldysley brothers with their merchants’ marks, and another of 1479 names William Whitwey as a draper and woolman.",
    legend: "Village tradition puts the old cloth fairs on a green lane called the Golden Mile, but nobody has proved it.",
    spot: "Find both brasses in the church’s north transept.", site: "church",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "carthusians", era: "med", date: "1415", title: "Silent monks arrive", gloss: "Carthusians of Sheen",
    body: "Henry V gave the King’s Manor to the Carthusian priory at Sheen in Surrey. Carthusians lived largely alone in separate cells. The prior was also granted a Tuesday market and two fairs, though these never really took off.",
    spot: "King’s Manor, a timber-framed house with its original gatehouse, still stands in the village.", site: "kings-manor",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "st-amand", era: "med", date: "1256", title: "A private chapel, by papal leave", gloss: "St Amand’s Chapel",
    body: "The lords of Arches manor got papal permission in the mid-13th century to build a chapel inside their house. It is said to be one of only three pre-Reformation chapels in England never used for Protestant worship.",
    spot: "The chapel is part of Hendred House, a private home on the High Street.", site: "hendred-house",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’. The ‘one of only three chapels’ claim: source to be added." },
  { id: "st-augustine", era: "med", date: "c.1180", title: "St Augustine’s rises", gloss: "The parish church",
    body: "The oldest surviving part of the church is the south arcade of the nave, from the late 12th century. Its stiff-leaf capitals have never been restored, and one is carved with a face.",
    spot: "Inside, look for the medieval lectern: a carved foot standing on three winged beasts.", site: "church", art: "tower",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’; Historic England listing for the Church of St Augustine." },
  { id: "domesday", era: "saxon", date: "1086", title: "Domesday: a patchwork of manors", gloss: "Five manors, one village",
    body: "Domesday shows East Hendred split between several lords. The largest holding went to the Count of Evreux; another had eight cottagers and a mill worth 20 shillings. The village stayed divided into manors for centuries, which explains its many big houses.",
    spot: "The mill on the brook by Ludbridge sits where a Domesday mill probably stood.", site: "mill",
    sources: "Domesday Book (1086), East Hendred entries; Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "danes", era: "saxon", date: "1006", title: "The Danes take a dare", gloss: "Anglo-Saxon Chronicle",
    body: "In the winter of 1006 a Danish army raiding Wessex marched up to Cwichelm’s barrow on the downs, waited there, and then went back to the sea by another way. The Anglo-Saxon Chronicle records it, naming the barrow Cwichelmeshlæw.",
    legend: "The Chronicle explains why they went: it had long been said that if raiders ever reached the barrow, they would never get back to the sea. They reached it, and went home anyway.",
    spot: "Stand on the Knob and look north: the whole Vale they crossed is laid out below.", site: "knob",
    sources: "Anglo-Saxon Chronicle, annal for 1006; Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." },
  { id: "name", era: "saxon", date: "956", title: "The village gets a name", gloss: "Hennarið, ‘wild-bird stream’",
    body: "A charter of 956 records the place as Hennarið. The most popular reading is Old English for ‘wild-bird stream’, after the brook that still runs through the village.",
    spot: "Follow East Hendred Brook through the village. It flows north across the Vale, joins the Ginge Brook and reaches the Thames near Sutton Courtenay.",
    sources: "Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’ (the 956 charter). The meaning ‘wild-bird stream’: source to be added." },
  { id: "cwichelm", era: "pre", date: "c.600", title: "Cwichelm’s mound", gloss: "Scutchamer Knob",
    body: "High on the Ridgeway sits Scutchamer (or Cuckhamsley) Knob, a round barrow that Historic England thinks probably began as a Bronze Age burial mound, later reused. Its old name, Cwichelm’s barrow, links it to Cwichelm, a 7th-century West Saxon king, and is recorded around 990, when a court, probably the shire court, met there. Repeated digging for Cwichelm’s grave left the mound lopsided, and no king’s grave has ever been found.",
    legend: "One medieval chronicle claims King Edwin of Northumbria killed Cwichelm here in revenge for a botched assassination plot.",
    spot: "The Knob is in woodland just off the Ridgeway, south of the village.", site: "knob",
    sources: "Historic England list entry 1006312 (Scutchamer Knob); Bede, Ecclesiastical History, book 2 ch. 9; Anglo-Saxon Chronicle; charter S 1454 (Electronic Sawyer)." },
  { id: "ridgeway", era: "pre", date: "BC", title: "Two of Britain’s oldest roads", gloss: "The Ridgeway and the Icknield Way",
    body: "The parish runs from the low vale up onto the Berkshire Downs, and both the Ridgeway and the Icknield Way pass through it. People were walking these chalk ridges thousands of years before there was a village below.",
    spot: "Walk south up the downs to join the Ridgeway National Trail.", site: "knob",
    sources: "National Trails, ‘The Ridgeway’; Victoria County History, Berkshire vol. 4 (1924), pp. 294–302, ‘Parishes: East Hendred’." }
];

// lat/lng from OpenStreetMap building outlines and Historic England listings (Nov 2026).
// TODO: ground-check the mill (Mills Archive grid ref; a postcode source differs by ~150 m).
// The painted map places sites from these coordinates automatically (js/painted-map.js).
export const SITES = [
  { id: "church", n: 1, name: "St Augustine’s Church", short: "St Augustine’s", lat: 51.5945, lng: -1.3383, entry: "clock",
    spot: "Hear the faceless clock play at 9am, noon, 3pm or 6pm. The wool merchants’ brasses are in the north transept." },
  { id: "champs", n: 6, name: "Champs Chapel", short: "Champs Chapel", lat: 51.597, lng: -1.3366, entry: "champs-chapel",
    spot: "Built by the Sheen monks, later a pigeon-house and bakehouse. Now the Hendred Museum, in Chapel Square, open some afternoons in season." },
  { id: "kings-manor", n: 5, name: "King’s Manor", short: "King’s Manor", lat: 51.5964, lng: -1.3368, entry: "carthusians",
    spot: "A timber-framed house with its original gatehouse, given to the Carthusians of Sheen by Henry V." },
  { id: "hendred-house", n: 3, name: "Hendred House & St Amand’s", short: "Hendred House", lat: 51.5946, lng: -1.336, entry: "st-amand",
    spot: "Home of the Eystons since the 1440s. A private house: the chapel opens on occasional open days." },
  { id: "st-marys", n: 2, name: "St Mary’s Catholic Church", short: "St Mary’s", lat: 51.5938, lng: -1.3363, entry: "st-marys",
    spot: "Designed by Charles Alban Buckler and linked to its presbytery by a timber gallery." },
  { id: "eyston-arms", n: 4, name: "The Eyston Arms", short: "Eyston Arms", lat: 51.5962, lng: -1.3362, entry: "eystons",
    spot: "Named after the family at Hendred House. Ask about Captain George Eyston’s land speed record." },
  { id: "orchard", n: 7, name: "Orchard House, Cat Street", short: "Orchard House", lat: 51.5966, lng: -1.3382, entry: "harwell",
    spot: "A blue plaque marks the home of William Penney, Baron Penney of East Hendred." },
  { id: "mill", n: null, name: "Mill by Ludbridge", short: "Ludbridge Mill", lat: 51.6025, lng: -1.3444, entry: "domesday",
    spot: "The mill on the brook stands where a Domesday mill probably stood." },
  { id: "knob", n: null, name: "Scutchamer Knob & the Ridgeway", short: "Scutchamer Knob", tiny: "Knob", lat: 51.5624, lng: -1.3428, entry: "cwichelm",
    spot: "South of the village, up on the downs. The mound sits in woodland just off the Ridgeway National Trail." }
];

// Nature and landscape places for the Land page (public access only; never rare-species locations).
// Scutchamer Knob is in SITES above and is reused. `section` links to a section of the Land page.
export const NATURE_SITES = [
  { id: "ridgeway-car-park", name: "Ridgeway car park", short: "Ridgeway car park", lat: 51.5621, lng: -1.3403, section: "ridgeway",
    kind: "Access point", why: "Free informal car park at the top of Newbury Road: the easiest start for the Ridgeway and Scutchamer Knob.",
    access: "The road up is potholed in places." },
  { id: "ridgeway-down", name: "The Ridgeway at East Hendred Down", short: "The Ridgeway", lat: 51.5623, lng: -1.3407, section: "ridgeway",
    kind: "National Trail", why: "Britain’s oldest road, here also the county boundary. A restricted byway: walkers, cyclists and horse riders only.",
    access: "Public right of way." },
  { id: "icknield-way", name: "Icknield Way crossing", short: "Icknield Way", lat: 51.5874, lng: -1.3359, section: "shape",
    kind: "Ancient route", why: "The Ridgeway’s lower twin, crossing the chalk shelf at about 120 metres, just above the spring line.",
    access: "On the public road; check the exact crossing point." },
  { id: "brook-ford-lane", name: "East Hendred Brook at Ford Lane", short: "The brook", lat: 51.596, lng: -1.341, section: "water",
    kind: "Chalk stream", why: "The spring-fed brook running north through the village, by the old ford lanes.",
    access: "View from the public lanes." }
];

// The walk. TODO: confirm the order, and write "Getting there" directions from local knowledge.
export const WALK = {
  facts: [
    ["Distance", "[X] km, a loop"],
    ["Time", "About [X] min"],
    ["Ground", "[Pavement and lanes?]"],
    ["Step-free", "[To confirm]"]
  ],
  // Walk order (pins on the map carry the same numbers; the mill and Scutchamer Knob have no stop number).
  stops: [
    { site: "church", entry: "clock", getThere: "Start in the churchyard.",
      look: "the medieval lectern inside: a carved foot standing on three winged beasts." },
    { site: "st-marys", entry: "st-marys", getThere: null,
      look: "the timber gallery linking church and presbytery." },
    { site: "hendred-house", entry: "st-amand", getThere: null,
      look: "the house from the High Street. It’s a private home, with St Amand’s Chapel inside." },
    { site: "eyston-arms", entry: "eystons", getThere: null,
      look: "the pub sign, named for the family at Hendred House. Then ask about Captain George Eyston’s land speed record." },
    { site: "kings-manor", entry: "carthusians", getThere: null,
      look: "the original gatehouse of the timber-framed manor." },
    { site: "champs", entry: "champs-chapel", getThere: null,
      look: "the west end, where the Champ family inserted an upper floor." },
    { site: "orchard", entry: "harwell", getThere: null,
      look: "the blue plaque for William Penney." }
  ]
};

// Stories and legends now live in content/stories.json, published from the Stories spreadsheet.
