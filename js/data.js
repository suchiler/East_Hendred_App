// All of the app's content lives here, so it can be edited without touching the code.
// Facts come from the Victoria County History, Historic England, the Hendred Museum
// and the East Hendred Bulletin. Anything marked TODO still needs local knowledge.

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
    body: "The village celebrated the clock’s 500th birthday with tower tours. It was last overhauled in 1961 and still keeps good time.",
    spot: "Check the church’s events page for future tower tours.", site: "church", art: "tower" },
  { id: "oxfordshire", era: "atom", date: "1974", title: "Berkshire to Oxfordshire", gloss: "A thousand years in one county ends",
    body: "Local government reorganisation moved the village out of Berkshire, which it had belonged to for a thousand years, and into Oxfordshire.",
    spot: "Old maps and guidebooks still list it under Berkshire." },
  { id: "harwell", era: "atom", date: "1946", title: "The atom next door", gloss: "Harwell, and William Penney",
    body: "Britain’s atomic research centre opened on the airfield at neighbouring Harwell, and the western edge of today’s Harwell Science and Innovation Campus lies inside the parish. Physicist William Penney, a leader of Britain’s nuclear weapons programme, lived on Cat Street from 1963 until his death in 1991. He took the title Baron Penney of East Hendred.",
    spot: "A blue plaque marks his house, Orchard House, on Cat Street.", site: "orchard" },
  { id: "eyston-speed", era: "atom", date: "1930s", title: "The fastest man on Earth", gloss: "Captain George Eyston",
    body: "A son of the manor, Captain George Eyston held the world land speed record in the late 1930s.",
    spot: "A good story for the Eyston Arms.", site: "eyston-arms" },
  { id: "st-marys", era: "mod", date: "1865", title: "A Catholic church at last", gloss: "St Mary’s, High Street",
    body: "The Eystons built St Mary’s Catholic church, designed by Charles Alban Buckler and linked to its presbytery by a timber gallery. After three centuries of private worship, the village’s Catholics had a public church.",
    spot: "St Mary’s is on the High Street near Hendred House.", site: "st-marys" },
  { id: "enclosure", era: "mod", date: "1801", title: "Fields fenced in", gloss: "The Enclosure Act",
    body: "An Act of 1801 enclosed the western open fields, replacing medieval strips with hedged fields. Some charity land for the poor was swapped for a plot in ‘Alley Green Furlong’.",
    spot: "The straight hedgerows north and west of the village date from this era." },
  { id: "woodward", era: "mod", date: "1753", title: "A parson’s letters", gloss: "Revd George Woodward",
    body: "Rector George Woodward wrote vivid letters from East Hendred between 1753 and 1761, later published as ‘A Parson in the Vale of White Horse’. They’re a rare everyday view of 18th-century village life.",
    spot: "The rectory opposite the church was his home.", site: "church" },
  { id: "ransacked", era: "ref", date: "1688", title: "Restored, then ransacked", gloss: "The Glorious Revolution",
    body: "St Amand’s Chapel was restored in 1687 under the Catholic King James II. The next year, William III’s Protestant army passed through and wrecked it. It was repaired soon after.",
    spot: "Look for 17th-century glass roundels if you visit the chapel on an open day.", site: "hendred-house" },
  { id: "ghosts", era: "ref", date: "1640s", title: "Ghosts without feet", gloss: "Civil War billets",
    body: "Parliamentarian soldiers are said to have billeted in the village after one of the Battles of Newbury.",
    legend: "In the 1940s, a cottage reported ghostly Roundheads visible only from the ankles up, because the floor had since been raised.",
    spot: "No public site, just a good story for the walk." },
  { id: "recusants", era: "ref", date: "1540s", title: "A Catholic village in a Protestant England", gloss: "The Eyston recusants",
    body: "The Eystons refused to give up Catholicism after the Reformation, and many tenants quietly followed them. This shaped the village for centuries. The family are relatives of Sir Thomas More and still hold relics of him, including his drinking cup.",
    spot: "The Eyston chapel in the parish church holds their brasses and floor slabs.", site: "church" },
  { id: "dissolution", era: "ref", date: "1539", title: "Monks out, Crown in", gloss: "Dissolution of Sheen Priory",
    body: "Sheen Priory was dissolved and its East Hendred estate passed to the Crown, which is why it’s still called the King’s Manor. The monks’ chapel was sold off and later used as a pigeon-house, bakehouse and wash-house by the Champ family, who gave it its nickname.",
    spot: "Look at the chapel’s west end, where an upper floor was inserted.", site: "kings-manor" },
  { id: "clock", era: "med", date: "1525", title: "A clock without a face", gloss: "John Seymour of Wantage",
    body: "Seymour built the church clock in 1525. It has no dial and no hands: it tells the time by its bells alone, and every three hours from nine in the morning it plays a hymn tune, the Angels’ Song. It is thought to be one of the oldest clocks in Britain still in its original place, and it is still wound by hand every day.",
    spot: "Stand in St Augustine’s churchyard at 9am, noon, 3pm or 6pm to hear it play.", site: "church", art: "tower", clock: true,
    sources: "Victoria County History of Berkshire, vol. 4; Hendred Museum; Historic England listing for the Church of St Augustine." },
  { id: "champs-chapel", era: "med", date: "1453", title: "The Chapel of Jesus of Bethlehem", gloss: "Champs Chapel",
    body: "The Sheen monks built a small wayside chapel with a priest’s house beside it. It is now Grade I listed.",
    spot: "This is the village museum today, on the green.", site: "champs" },
  { id: "eystons", era: "med", date: "1443", title: "The Eystons move in, and stay", gloss: "Hendred House",
    body: "Isabel Stowe, heiress of the Arches family, married John Eyston, and Arches manor passed to the Eystons in the mid-15th century. They have lived at Hendred House ever since, making them old Berkshire’s longest-serving family on a single manor.",
    spot: "The Eyston Arms pub is named after them.", site: "hendred-house" },
  { id: "cloth-town", era: "med", date: "1439", title: "When Hendred was a cloth town", gloss: "The wool merchants’ brasses",
    body: "In the 15th century the cloth trade made East Hendred rich enough to be called a town. A brass of 1439 shows the Eldysley brothers with their merchants’ marks, and another of 1479 names William Whitwey as a draper and woolman.",
    legend: "Village tradition puts the old cloth fairs on a green lane called the Golden Mile.",
    spot: "Find both brasses in the church’s north transept.", site: "church" },
  { id: "carthusians", era: "med", date: "1415", title: "Silent monks arrive", gloss: "Carthusians of Sheen",
    body: "Henry V gave the King’s Manor to the Carthusian priory at Sheen in Surrey. Carthusians lived largely alone in separate cells. The prior was also granted a Tuesday market and two fairs, though these never really took off.",
    spot: "King’s Manor, a timber-framed house with its original gatehouse, still stands in the village.", site: "kings-manor" },
  { id: "st-amand", era: "med", date: "1256", title: "A private chapel, by papal leave", gloss: "St Amand’s Chapel",
    body: "The lords of Arches manor got papal permission in the mid-13th century to build a chapel inside their house. It is said to be one of only three pre-Reformation chapels in England never used for Protestant worship.",
    spot: "The chapel is part of Hendred House, a private home on the High Street.", site: "hendred-house" },
  { id: "st-augustine", era: "med", date: "c.1180", title: "St Augustine’s rises", gloss: "The parish church",
    body: "The oldest surviving part of the church is the south arcade of the nave, from the late 12th century. Its stiff-leaf capitals have never been restored, and one is carved with a face.",
    spot: "Inside, look for the medieval lectern: a carved foot standing on three winged beasts.", site: "church", art: "tower" },
  { id: "domesday", era: "saxon", date: "1086", title: "Domesday: a patchwork of manors", gloss: "Five manors, one village",
    body: "Domesday shows East Hendred split between several lords. The largest holding went to the Count of Evreux; another had eight cottagers and a mill worth 20 shillings. The village stayed divided into manors for centuries, which explains its many big houses.",
    spot: "The mill on the brook by Ludbridge sits where a Domesday mill probably stood.", site: "mill" },
  { id: "danes", era: "saxon", date: "1006", title: "The Danes take a dare", gloss: "Anglo-Saxon Chronicle",
    body: "In 1006 a Viking army marched to Cwichelm’s barrow. Local belief held that if raiders ever reached it, they would never get back to the sea. They reached it, waited, and then went home anyway.",
    spot: "Stand on the Knob and look north: the whole Vale they crossed is laid out below.", site: "knob" },
  { id: "name", era: "saxon", date: "956", title: "The village gets a name", gloss: "Hennarið, ‘wild-bird stream’",
    body: "A charter of 956 records the place as Hennarið. The most popular reading is Old English for ‘wild-bird stream’, after the brook that still runs through the village. Celtic alternatives include ‘old ford’ or ‘winter cow-shed’.",
    spot: "Follow East Hendred Brook through the village; it flows on to join the Thames at Sutton Courtenay." },
  { id: "cwichelm", era: "pre", date: "c.600", title: "Cwichelm’s mound", gloss: "Scutchamer Knob",
    body: "High on the Ridgeway sits Scutchamer (or Cuckhamsley) Knob. Tradition links it to Cwichelm, a 7th-century prince of Wessex, and the name ‘Cwichelm’s Low’ is recorded by 990. Digging found no burial, so it may have been a meeting mound rather than a grave. It later served as a meeting place for the shire court.",
    legend: "One medieval chronicle claims King Edwin of Northumbria killed Cwichelm here in revenge for a botched assassination plot.",
    spot: "The Knob is in woodland just off the Ridgeway, south of the village.", site: "knob" },
  { id: "ridgeway", era: "pre", date: "BC", title: "Two of Britain’s oldest roads", gloss: "The Ridgeway and the Icknield Way",
    body: "The parish runs from the low vale up onto the Berkshire Downs, and both the Ridgeway and the Icknield Way pass through it. People were walking these chalk ridges thousands of years before there was a village below.",
    spot: "Walk south up the downs to join the Ridgeway National Trail.", site: "knob" }
];

// x/y place each site on the painted map (a 390×757 drawing).
// lat/lng are APPROXIMATE (TODO: confirm each on the ground or from OS data).
export const SITES = [
  { id: "church", n: 1, name: "St Augustine’s Church", short: "St Augustine’s", x: 251, y: 334, lat: 51.5899, lng: -1.3338, entry: "clock",
    spot: "Hear the faceless clock play at 9am, noon, 3pm or 6pm. The wool merchants’ brasses are in the north transept." },
  { id: "champs", n: 2, name: "Champs Chapel", short: "Champs Chapel", x: 179, y: 358, lat: 51.5893, lng: -1.3362, entry: "champs-chapel",
    spot: "Built by the Sheen monks, later a pigeon-house and bakehouse. Now the Hendred Museum, open weekend afternoons in season." },
  { id: "kings-manor", n: 3, name: "King’s Manor", short: "King’s Manor", x: 124, y: 280, lat: 51.5912, lng: -1.3381, entry: "carthusians",
    spot: "A timber-framed house with its original gatehouse, given to the Carthusians of Sheen by Henry V." },
  { id: "hendred-house", n: 4, name: "Hendred House & St Amand’s", short: "Hendred House", x: 220, y: 276, lat: 51.5913, lng: -1.3349, entry: "st-amand",
    spot: "Home of the Eystons since the 1440s. A private house: the chapel opens on occasional open days." },
  { id: "st-marys", n: 5, name: "St Mary’s Catholic Church", short: "St Mary’s", x: 309, y: 260, lat: 51.5917, lng: -1.3318, entry: "st-marys",
    spot: "Designed by Charles Alban Buckler and linked to its presbytery by a timber gallery." },
  { id: "eyston-arms", n: 6, name: "The Eyston Arms", short: "Eyston Arms", x: 339, y: 356, lat: 51.5894, lng: -1.3307, entry: "eystons",
    spot: "Named after the family at Hendred House. Ask about Captain George Eyston’s land speed record." },
  { id: "orchard", n: 7, name: "Orchard House, Cat Street", short: "Orchard House", x: 75, y: 388, lat: 51.5886, lng: -1.3399, entry: "harwell",
    spot: "A blue plaque marks the home of William Penney, Baron Penney of East Hendred." },
  { id: "mill", n: 8, name: "Mill by Ludbridge", short: "Ludbridge Mill", x: 320, y: 190, lat: 51.5935, lng: -1.3312, entry: "domesday",
    spot: "The mill on the brook stands where a Domesday mill probably stood." },
  { id: "knob", n: 9, name: "Scutchamer Knob & the Ridgeway", short: "Scutchamer Knob", offMap: true, lat: 51.5575, lng: -1.3380, entry: "cwichelm",
    spot: "South of the village, up on the downs. The mound sits in woodland just off the Ridgeway National Trail." }
];

// The walk. TODO: confirm the order, and write "Getting there" directions from local knowledge.
export const WALK = {
  facts: [
    ["Distance", "[X] km, a loop"],
    ["Time", "About [X] min"],
    ["Ground", "[Pavement and lanes?]"],
    ["Step-free", "[To confirm]"]
  ],
  stops: [
    { site: "church", entry: "clock", getThere: "Start in the churchyard.",
      look: "the medieval lectern inside: a carved foot standing on three winged beasts.", sx: 224, sy: 100 },
    { site: "champs", entry: "champs-chapel", getThere: null,
      look: "the west end, where the Champ family inserted an upper floor.", sx: 160, sy: 113 },
    { site: "kings-manor", entry: "carthusians", getThere: null,
      look: "the original gatehouse of the timber-framed manor.", sx: 110, sy: 70 },
    { site: "hendred-house", entry: "st-amand", getThere: null,
      look: "the house from the High Street. It’s a private home, with St Amand’s Chapel inside.", sx: 196, sy: 68 },
    { site: "st-marys", entry: "st-marys", getThere: null,
      look: "the timber gallery linking church and presbytery.", sx: 276, sy: 60 },
    { site: "eyston-arms", entry: "eystons", getThere: null,
      look: "the pub sign, named for the family at Hendred House. Then ask about Captain George Eyston’s land speed record.", sx: 302, sy: 112 },
    { site: "orchard", entry: "harwell", getThere: null,
      look: "the blue plaque for William Penney.", sx: 66, sy: 130 },
    { site: "mill", entry: "domesday", getThere: null,
      look: "the brook and the mill, on the site of a Domesday mill worth 20 shillings.", sx: 285, sy: 21 }
  ]
};

export const STORY_FILTERS = [["all", "All"], ["work", "Work & shops"], ["school", "School"], ["church", "Church"], ["c20", "20th century"]];

export const STORIES = [
  { art: "story-anvil", cat: "work", title: "Generations at the forge", who: "The blacksmiths of Harrison’s Forge, 1920s",
    text: "Generations of blacksmiths ran the village forge. They didn’t just shoe horses: they made cart wheels, gates and ironmongery for the whole village. A photograph from 1926 shows the blacksmith at Harrison’s Forge.",
    source: "East Hendred Bulletin, Spring 2016" },
  { art: "story-label", cat: "c20", title: "The day the evacuees came", who: "Boys of Cave Road School, West Ham, 1 September 1939",
    text: "Two days before war was declared, a party of London children arrived in the village, among them boys from Cave Road School in West Ham. Decades later the Bulletin was still asking former evacuees to get in touch for a reunion.",
    source: "East Hendred Bulletin, Summer 2004" },
  { art: "story-slate", cat: "school", title: "Lessons at Snells Hall", who: "Stan Francis and Robin Hine, pupils",
    text: "Snells Hall was the village school from 1860 to 1967. Stan Francis started there in 1933. Robin Hine remembers how school life changed when war came and the evacuees arrived.",
    source: "East Hendred Bulletin, Winter 2015" },
  { art: "story-jar", cat: "work", title: "Halfpennies at Wilkins", who: "Wilkins Shop, in living memory",
    text: "Older villagers still remember spending their halfpennies at Wilkins Shop. Later there was a shop where you could get your horse shod, your wireless accumulator charged and your bike brakes fixed.",
    source: "East Hendred Bulletin, Winter 2015 and Spring 2016" },
  { art: "story-plane", cat: "work", title: "A family of carpenters", who: "Joseph Hunt, born 1771",
    text: "Joseph Hunt was born in East Hendred in 1771. He was the first of several generations of Hunts to appear in the village records as carpenters.",
    source: "The Hunts of East Hendred, family history" },
  { art: "story-quill", cat: "church", title: "The parson who wrote home", who: "Revd George Woodward, rector 1753–61",
    text: "From the rectory opposite the church, Woodward wrote long letters to a relative about himself, his parish and his neighbours, with a wry sense of humour. They were published in 1982.",
    source: "A Parson in the Vale of White Horse, ed. Donald Gibson (1982)" },
  { art: "story-bell", cat: "church", title: "Keeping the faceless clock", who: "Arthur Harrison, who overhauled it in 1961",
    text: "The 1525 clock is wound by hand every day and plays the Angels’ Song every three hours from nine. Arthur Harrison overhauled it in 1961, and it still keeps very good time.",
    source: "Hendred Museum; Berkshire History" },
  { art: "story-house", cat: "c20", title: "The physicist on Cat Street", who: "William Penney, Baron Penney of East Hendred, 1963–91",
    text: "A leader of Britain’s atomic programme at neighbouring Harwell, Penney lived at Orchard House on Cat Street for nearly thirty years and took the village’s name for his title.",
    source: "Historic England; blue plaque on Orchard House" }
];
