/**
 * East Hendred Through Time — Stories
 *
 * Paste this whole file into the Stories spreadsheet (Extensions → Apps Script),
 * save, then run `setup` once. It:
 *   1. builds the public Google Form and links it to this spreadsheet,
 *   2. names the form's responses tab "Submissions",
 *   3. copies every new submission into the Library tab as Status = New,
 *   4. adds a "Stories app" menu to publish Ready rows to the app on GitHub,
 *   5. publishes automatically once a day.
 *
 * Running `setup` again is safe: it repairs anything missing and updates the
 * form's category choices from the Lists tab.
 *
 * Why the Sheet pushes to GitHub (instead of GitHub reading the Sheet): reading a
 * private Sheet from GitHub needs a Google Cloud service account. Pushing from
 * here needs only a GitHub token, and the Sheet stays private.
 */

// ---------- Settings ----------
var CONFIG = {
  NOTIFY_ON_SUBMIT: true,          // email the spreadsheet owner when a story arrives
  EMAIL_ON_PUBLISH_PROBLEMS: true, // email the owner if the daily publish skips rows
  LIBRARY: 'Library',
  LISTS: 'Lists',
  SUBMISSIONS: 'Submissions',
  LOG: 'Publish log',
  DEFAULT_REPO: 'suchiler/East_Hendred_App',
  DEFAULT_BRANCH: 'claude/intelligent-cori-avr92o',
  FILE_PATH: 'content/stories.json',
  LAT: [51.50, 51.65],             // rough box around the parish, for checking coordinates
  LNG: [-1.45, -1.20],
  DAILY_HOUR: 3                    // when the daily publish runs (script time zone)
};

var COLUMNS = ['ID', 'Status', 'Type', 'Category', 'Title', 'Summary', 'Body', 'People', 'When',
  'Sort year', 'Era', 'Place name', 'Coordinates', 'Source', 'Credit', 'Linked entry', 'Artwork',
  'Featured', 'Editor notes', 'Submitted'];

var TYPES = ['History', 'Memory', 'Legend', 'Folk tale', 'Ghost story'];
var STATUSES = ['New', 'Checking', 'Ready', 'Not used'];
var DEFAULT_CATEGORIES = ['Work & trades', 'Shops & pubs', 'School & childhood', 'Church & chapel',
  'Farming & the land', 'Big houses & families', 'War & wartime', 'Harwell & science',
  'The downs & nature', 'Mischief & crime', 'Customs & celebrations', 'Other'];

// Form question titles. Submissions are matched to these titles, so if you reword a
// question in the form editor, change it here too.
var Q = {
  title: 'Give your story a title',
  type: 'What kind of story is it?',
  category: 'What is it about?',
  story: 'Tell us the story',
  people: 'Who is it about?',
  when: 'When did it happen?',
  place: 'Where did it happen?',
  coords: 'Map coordinates',
  from: 'Where does this story come from?',
  details: 'Details of the source',
  name: 'Your name',
  credit: 'How should we credit you?',
  email: 'Your email, in case we have a question',
  permission: 'Permission'
};

var TYPE_CHOICES = [
  'History: something recorded in books, papers or records',
  'Memory: something you remember yourself',
  'Legend: a tale tied to a real place or person, but unproven',
  'Folk tale: a traditional tale, not claimed to be true',
  'Ghost story: a sighting or haunting'
];
var FROM_CHOICES = ['I remember it myself', 'A family member told me', 'A book, newspaper or document', 'Village tradition'];
var CREDIT_CHOICES = ['Use my name', 'As “a villager”', 'Don’t credit me'];
var PERMISSION_CHOICE = 'I’m happy for this story to appear in the app, edited for length and clarity. It doesn’t name living people without their agreement.';

// ---------- Menu ----------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Stories app')
    .addItem('Publish to app now', 'publishNow')
    .addItem('Check rows', 'checkRows')
    .addSeparator()
    .addItem('Set GitHub token…', 'promptForToken')
    .addItem('Set up or repair (form, triggers)', 'setup')
    .addToUi();
}

// ---------- Setup ----------
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureLibrary_(ss);
  ensureLists_(ss);
  ensureLog_(ss);

  var props = PropertiesService.getScriptProperties();
  var form = null;
  var formId = props.getProperty('FORM_ID');
  if (formId) {
    try { form = FormApp.openById(formId); } catch (err) { form = null; }
  }
  if (!form) {
    form = buildForm_(ss);
    props.setProperty('FORM_ID', form.getId());
  } else {
    syncCategoryChoices_(form, ss);
  }

  // Make sure answers land in this spreadsheet, in a tab called Submissions.
  try {
    if (form.getDestinationId() !== ss.getId()) {
      form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    }
  } catch (err) {
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  }
  SpreadsheetApp.flush();
  renameResponsesTab_(ss, form);

  installTriggers_(ss);
  onOpen();

  var url = form.getPublishedUrl();
  var shortUrl = url;
  try { shortUrl = form.shortenFormUrl(url); } catch (err) { /* keep the long link */ }
  props.setProperty('FORM_URL', url);

  var html = HtmlService.createHtmlOutput(
    '<div style="font:14px/1.5 Arial,sans-serif">' +
    '<p><b>Done.</b> The form is ready and linked to this spreadsheet.</p>' +
    '<p>Link to share with people:<br><a href="' + shortUrl + '" target="_blank">' + shortUrl + '</a></p>' +
    '<p>Put this link in the app (STORY_FORM_URL in js/config.js):<br><code style="word-break:break-all">' + url + '</code></p>' +
    '<p>Edit the form: <a href="' + form.getEditUrl() + '" target="_blank">open the form editor</a></p>' +
    '<p>Last step: choose <b>Stories app → Set GitHub token…</b> so publishing can work.</p></div>'
  ).setWidth(460).setHeight(330);
  SpreadsheetApp.getUi().showModalDialog(html, 'Stories app set up');
}

function buildForm_(ss) {
  var form = FormApp.create('Share an East Hendred story');
  form.setDescription(
    'Do you know a story about East Hendred? A memory of the village, something a family member told you, ' +
    'a piece of local history, or a legend or ghost story that gets passed around?\n\n' +
    'Tell us here. Every story is read before it appears in the East Hendred Through Time app, and we may ' +
    'tidy it for length. Your email address is never published.');
  form.setConfirmationMessage('Thank you! We’ll read your story and may be in touch if we have a question.');
  form.setAllowResponseEdits(false);
  form.setProgressBar(false);
  form.setShowLinkToRespondAgain(true);

  form.addTextItem().setTitle(Q.title).setRequired(true);

  form.addMultipleChoiceItem().setTitle(Q.type).setChoiceValues(TYPE_CHOICES).setRequired(true);

  form.addMultipleChoiceItem().setTitle(Q.category)
    .setHelpText('Pick the closest, or choose Other and type your own.')
    .setChoiceValues(categoriesForForm_(ss))
    .showOtherOption(true)
    .setRequired(true);

  form.addParagraphTextItem().setTitle(Q.story)
    .setHelpText('As much detail as you like: who was there, what happened, what it was like.')
    .setRequired(true);

  form.addTextItem().setTitle(Q.people).setHelpText('Names of the people in the story, if any.');
  form.addTextItem().setTitle(Q.when).setHelpText('For example: 1920s, around 1600, or not sure.');
  form.addTextItem().setTitle(Q.place)
    .setHelpText('A place name or description, for example: outside the old forge on the High Street.');

  var coordRule = FormApp.createTextValidation()
    .setHelpText('Paste the two numbers from Google Maps, for example: 51.5899, -1.3338')
    .requireTextMatchesPattern('^\\s*-?\\d{1,2}\\.\\d+\\s*,\\s*-?\\d{1,3}\\.\\d+\\s*$')
    .build();
  form.addTextItem().setTitle(Q.coords)
    .setHelpText('Optional. In Google Maps, press and hold the spot (or right-click it on a computer). ' +
      'Tap or click the two numbers that appear to copy them, then paste them here.')
    .setValidation(coordRule);

  form.addMultipleChoiceItem().setTitle(Q.from)
    .setChoiceValues(FROM_CHOICES).showOtherOption(true).setRequired(true);
  form.addParagraphTextItem().setTitle(Q.details)
    .setHelpText('Book title and page, or who told you and when.');

  form.addTextItem().setTitle(Q.name);
  form.addMultipleChoiceItem().setTitle(Q.credit).setChoiceValues(CREDIT_CHOICES).setRequired(true);

  var emailRule = FormApp.createTextValidation().setHelpText('That doesn’t look like an email address.')
    .requireTextIsEmail().build();
  form.addTextItem().setTitle(Q.email).setHelpText('Optional. Never published or shared.').setValidation(emailRule);

  form.addCheckboxItem().setTitle(Q.permission).setChoiceValues([PERMISSION_CHOICE]).setRequired(true);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  return form;
}

function categoriesForForm_(ss) {
  // The form's own "Other" box replaces the Other category.
  return readListColumn_(ss, 'Category').filter(function (c) { return c && c !== 'Other'; });
}

function syncCategoryChoices_(form, ss) {
  var items = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE);
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === Q.category) {
      items[i].asMultipleChoiceItem().setChoiceValues(categoriesForForm_(ss)).showOtherOption(true);
    }
  }
}

function renameResponsesTab_(ss, form) {
  var formUrl = form.getPublishedUrl().replace(/\/viewform.*$/, '');
  var editUrl = form.getEditUrl().replace(/\/edit.*$/, '');
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var linked = sheets[i].getFormUrl();
    if (!linked) continue;
    var base = linked.replace(/\/(viewform|edit).*$/, '');
    if (base === formUrl || base === editUrl || linked.indexOf(form.getId()) !== -1) {
      if (sheets[i].getName() !== CONFIG.SUBMISSIONS) {
        var clash = ss.getSheetByName(CONFIG.SUBMISSIONS);
        if (clash && clash.getSheetId() !== sheets[i].getSheetId()) clash.setName(CONFIG.SUBMISSIONS + ' (old)');
        sheets[i].setName(CONFIG.SUBMISSIONS);
      }
      return;
    }
  }
}

function installTriggers_(ss) {
  var wanted = { onStorySubmitted: true, dailyPublish: true };
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (wanted[t.getHandlerFunction()]) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onStorySubmitted').forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger('dailyPublish').timeBased().everyDays(1).atHour(CONFIG.DAILY_HOUR).create();
}

function ensureLibrary_(ss) {
  var sh = ss.getSheetByName(CONFIG.LIBRARY);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.LIBRARY, 0);
    sh.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var eraCol = header.indexOf('Era') + 1;
  var yearCol = header.indexOf('Sort year') + 1;
  if (eraCol > 0 && yearCol > 0 && !sh.getRange(1, eraCol).getFormula()) {
    var y = columnLetter_(yearCol);
    sh.getRange(1, eraCol).setFormula('={"Era";ARRAYFORMULA(IF(' + y + '2:' + y + '="","",IFS(' +
      y + '2:' + y + '>=1900,"Speed & the atom",' + y + '2:' + y + '>=1700,"Parsons & enclosure",' +
      y + '2:' + y + '>=1530,"Reformation & recusants",' + y + '2:' + y + '>=1100,"Monks & wool",' +
      y + '2:' + y + '>=900,"Saxon & Domesday",TRUE,"Ancient routes")))}');
  }
}

function ensureLists_(ss) {
  if (ss.getSheetByName(CONFIG.LISTS)) return;
  var sh = ss.insertSheet(CONFIG.LISTS);
  var rows = Math.max(TYPES.length, DEFAULT_CATEGORIES.length, STATUSES.length);
  var values = [['Type', 'Category', 'Status', 'Artwork', 'Linked entry']];
  for (var i = 0; i < rows; i++) {
    values.push([TYPES[i] || '', DEFAULT_CATEGORIES[i] || '', STATUSES[i] || '', '', '']);
  }
  sh.getRange(1, 1, values.length, 5).setValues(values);
  sh.getRange(1, 1, 1, 5).setFontWeight('bold');
}

function ensureLog_(ss) {
  if (ss.getSheetByName(CONFIG.LOG)) return;
  var sh = ss.insertSheet(CONFIG.LOG);
  sh.getRange(1, 1, 1, 4).setValues([['When', 'Result', 'Stories published', 'Details']]).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function readListColumn_(ss, name) {
  var sh = ss.getSheetByName(CONFIG.LISTS);
  if (!sh) return name === 'Category' ? DEFAULT_CATEGORIES.slice() : [];
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var col = header.indexOf(name) + 1;
  if (col < 1 || sh.getLastRow() < 2) return [];
  return sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues()
    .map(function (r) { return String(r[0]).trim(); })
    .filter(function (v) { return v; });
}

// ---------- New submissions → Library ----------
function onStorySubmitted(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var nv = (e && e.namedValues) || {};
    var get = function (title) { return nv[title] && nv[title][0] ? String(nv[title][0]).trim() : ''; };

    var typeAnswer = get(Q.type);
    var type = typeAnswer.split(':')[0].trim();
    if (TYPES.indexOf(type) === -1) type = '';

    var name = get(Q.name);
    var pref = get(Q.credit);
    var credit = '';
    if (pref.indexOf('Use my name') === 0 && name) credit = name;
    else if (pref.indexOf('villager') !== -1) credit = 'A villager';

    var from = get(Q.from);
    var details = get(Q.details);
    var source = [from, details].filter(function (s) { return s; }).join(': ');

    var coords = get(Q.coords);
    var parsed = parseCoords_(coords);
    if (parsed) coords = parsed[0] + ', ' + parsed[1];

    var stamp = nv.Timestamp && nv.Timestamp[0] ? nv.Timestamp[0] : new Date();
    var lib = ss.getSheetByName(CONFIG.LIBRARY);
    var header = lib.getRange(1, 1, 1, lib.getLastColumn()).getValues()[0];
    var title = get(Q.title);

    var record = {
      'ID': uniqueId_(lib, header, title),
      'Status': 'New',
      'Type': type,
      'Category': get(Q.category),
      'Title': title,
      'Body': get(Q.story),
      'People': get(Q.people),
      'When': get(Q.when),
      'Place name': get(Q.place),
      'Coordinates': coords,
      'Source': source,
      'Credit': credit,
      'Featured': false,
      'Editor notes': name && !credit ? 'Submitted by ' + name + ' (asked not to be credited)' : '',
      'Submitted': stamp
    };
    var row = header.map(function (h) {
      if (h === 'Era') return '';            // filled by the formula in the header
      return record.hasOwnProperty(h) ? record[h] : '';
    });
    lib.appendRow(row);

    if (CONFIG.NOTIFY_ON_SUBMIT) {
      try {
        MailApp.sendEmail(ss.getOwner() ? ss.getOwner().getEmail() : Session.getEffectiveUser().getEmail(),
          'New East Hendred story: ' + (title || '(untitled)'),
          'A new story has arrived and is waiting in the Library tab (Status: New).\n\n' + ss.getUrl());
      } catch (err) { /* notifications are optional */ }
    }
  } finally {
    lock.releaseLock();
  }
}

// ---------- Checking and publishing ----------
function checkRows() {
  var result = collect_(false);
  var ui = SpreadsheetApp.getUi();
  if (!result.problems.length) {
    ui.alert('All good', result.stories.length + ' Ready ' + plural_(result.stories.length, 'story', 'stories') +
      ' would be published. Nothing needs fixing.', ui.ButtonSet.OK);
  } else {
    ui.alert('Rows to fix', problemText_(result) + '\n\nThe other ' + result.stories.length +
      ' Ready ' + plural_(result.stories.length, 'story', 'stories') + ' are fine.', ui.ButtonSet.OK);
  }
}

function publishNow() {
  var ui = SpreadsheetApp.getUi();
  var outcome = publish_();
  var msg = outcome.message;
  if (outcome.problems.length) msg += '\n\nSkipped:\n' + problemText_(outcome);
  ui.alert(outcome.ok ? 'Published' : 'Not published', msg, ui.ButtonSet.OK);
}

function dailyPublish() {
  var outcome = publish_();
  if (CONFIG.EMAIL_ON_PUBLISH_PROBLEMS && (!outcome.ok || outcome.problems.length)) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'East Hendred stories: publish needs a look',
        outcome.message + (outcome.problems.length ? '\n\nSkipped:\n' + problemText_(outcome) : '') + '\n\n' + ss.getUrl());
    } catch (err) { /* ignore */ }
  }
}

function publish_() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('GITHUB_TOKEN');
  var repo = props.getProperty('GITHUB_REPO') || CONFIG.DEFAULT_REPO;
  var branch = props.getProperty('GITHUB_BRANCH') || CONFIG.DEFAULT_BRANCH;
  var result = collect_(true);
  var outcome = { ok: false, message: '', problems: result.problems };

  if (!token) {
    outcome.message = 'No GitHub token yet. Choose Stories app → Set GitHub token…';
    log_('Not published', 0, outcome.message);
    return outcome;
  }

  var payload = { schema: 1, generated: new Date().toISOString(), stories: result.stories };
  var json = JSON.stringify(payload, null, 2) + '\n';
  var api = 'https://api.github.com/repos/' + repo + '/contents/' + CONFIG.FILE_PATH;
  var headers = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  // Read what's there now, so we can skip unchanged content and pass the file's sha.
  var sha = null;
  var current = UrlFetchApp.fetch(api + '?ref=' + encodeURIComponent(branch), { headers: headers, muteHttpExceptions: true });
  var code = current.getResponseCode();
  if (code === 200) {
    var info = JSON.parse(current.getContentText());
    sha = info.sha;
    try {
      var text = Utilities.newBlob(Utilities.base64Decode(String(info.content).replace(/\n/g, ''))).getDataAsString('UTF-8');
      var old = JSON.parse(text);
      if (JSON.stringify(old.stories) === JSON.stringify(payload.stories)) {
        outcome.ok = true;
        outcome.message = 'No changes since the last publish (' + result.stories.length + ' ' +
          plural_(result.stories.length, 'story', 'stories') + ').';
        log_('No changes', result.stories.length, problemSummary_(result));
        return outcome;
      }
    } catch (err) { /* unreadable old file: overwrite it */ }
  } else if (code !== 404) {
    outcome.message = 'GitHub said ' + code + ' when reading the stories file. Check the token and repository. ' +
      current.getContentText().slice(0, 200);
    log_('Failed', 0, outcome.message);
    return outcome;
  }

  var body = {
    message: 'Publish stories from the Sheet (' + result.stories.length + ' ' + plural_(result.stories.length, 'story', 'stories') + ')',
    content: Utilities.base64Encode(json, Utilities.Charset.UTF_8),
    branch: branch
  };
  if (sha) body.sha = sha;
  var put = UrlFetchApp.fetch(api, {
    method: 'put', headers: headers, contentType: 'application/json',
    payload: JSON.stringify(body), muteHttpExceptions: true
  });
  var putCode = put.getResponseCode();
  if (putCode === 200 || putCode === 201) {
    outcome.ok = true;
    outcome.message = 'Published ' + result.stories.length + ' ' + plural_(result.stories.length, 'story', 'stories') +
      '. The app updates within a few minutes.';
    log_('Published', result.stories.length, problemSummary_(result));
  } else {
    outcome.message = 'GitHub said ' + putCode + ' when saving. ' + put.getContentText().slice(0, 300);
    log_('Failed', 0, outcome.message);
  }
  return outcome;
}

// Reads the Library and returns valid Ready stories plus a list of problems.
// When fillIds is true, blank IDs on Ready rows are generated and saved.
function collect_(fillIds) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lib = ss.getSheetByName(CONFIG.LIBRARY);
  var values = lib.getDataRange().getValues();
  var header = values[0];
  var col = {};
  header.forEach(function (h, i) { col[h] = i; });
  var v = function (row, name) { return col.hasOwnProperty(name) ? row[col[name]] : ''; };
  var s = function (row, name) { var x = v(row, name); return x === null || x === undefined ? '' : String(x).trim(); };

  var stories = [], problems = [], seen = {};
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (s(row, 'Status') !== 'Ready') continue;
    var rowNum = r + 1;
    var issues = [];

    var title = s(row, 'Title');
    var id = s(row, 'ID');
    if (!id && title && fillIds) {
      id = uniqueId_(lib, header, title);
      lib.getRange(rowNum, col['ID'] + 1).setValue(id);
    }
    if (!id) issues.push('no ID');
    else if (seen[id]) issues.push('ID "' + id + '" is also used on row ' + seen[id]);

    var type = s(row, 'Type');
    if (!title) issues.push('no title');
    if (!s(row, 'Body')) issues.push('no story text');
    if (TYPES.indexOf(type) === -1) issues.push('type must be one of: ' + TYPES.join(', '));
    if (!s(row, 'Source')) issues.push('no source');

    var coordsText = s(row, 'Coordinates');
    var coords = null;
    if (coordsText) {
      coords = parseCoords_(coordsText);
      if (!coords) issues.push('coordinates "' + coordsText + '" aren’t two numbers like 51.5899, -1.3338');
      else if (coords[0] < CONFIG.LAT[0] || coords[0] > CONFIG.LAT[1] || coords[1] < CONFIG.LNG[0] || coords[1] > CONFIG.LNG[1]) {
        issues.push('coordinates are outside the East Hendred area');
      }
    }

    var yearRaw = v(row, 'Sort year');
    var year = null;
    if (yearRaw !== '' && yearRaw !== null) {
      year = Number(yearRaw);
      if (isNaN(year)) { issues.push('sort year "' + yearRaw + '" isn’t a number'); year = null; }
    }

    if (issues.length) { problems.push({ row: rowNum, title: title || '(untitled)', issues: issues }); continue; }
    seen[id] = rowNum;

    // Only these public fields ever leave the Sheet.
    stories.push({
      id: id,
      type: type,
      category: s(row, 'Category') || 'Other',
      title: title,
      summary: s(row, 'Summary'),
      body: s(row, 'Body').replace(/\r\n?/g, '\n'),
      people: s(row, 'People'),
      when: s(row, 'When'),
      sortYear: year,
      era: eraFor_(year),
      place: s(row, 'Place name'),
      coordinates: coords,
      source: s(row, 'Source'),
      credit: s(row, 'Credit'),
      linkedEntry: s(row, 'Linked entry'),
      artwork: s(row, 'Artwork'),
      featured: v(row, 'Featured') === true
    });
  }
  return { stories: stories, problems: problems };
}

// ---------- Token ----------
function promptForToken() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.prompt('GitHub token',
    'Paste a fine-grained GitHub token with Contents: Read and write on ' + CONFIG.DEFAULT_REPO +
    ' only. It is stored in this script’s private settings, not in the Sheet.', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  var token = res.getResponseText().trim();
  if (!token) return;
  PropertiesService.getScriptProperties().setProperty('GITHUB_TOKEN', token);
  ui.alert('Saved', 'Token saved. Try Stories app → Publish to app now.', ui.ButtonSet.OK);
}

// ---------- Helpers ----------
function parseCoords_(text) {
  var m = String(text).match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!m) return null;
  var lat = Number(m[1]), lng = Number(m[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return [Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6];
}

function eraFor_(year) {
  if (year === null || year === undefined) return '';
  if (year >= 1900) return 'Speed & the atom';
  if (year >= 1700) return 'Parsons & enclosure';
  if (year >= 1530) return 'Reformation & recusants';
  if (year >= 1100) return 'Monks & wool';
  if (year >= 900) return 'Saxon & Domesday';
  return 'Ancient routes';
}

function slug_(text) {
  return String(text).toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'story';
}

function uniqueId_(lib, header, title) {
  var idCol = header.indexOf('ID') + 1;
  var existing = {};
  if (idCol > 0 && lib.getLastRow() > 1) {
    lib.getRange(2, idCol, lib.getLastRow() - 1, 1).getValues().forEach(function (r) { existing[String(r[0])] = true; });
  }
  var base = slug_(title), id = base, n = 2;
  while (existing[id]) { id = base + '-' + n; n++; }
  return id;
}

function columnLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function problemText_(result) {
  return result.problems.map(function (p) {
    return 'Row ' + p.row + ' (' + p.title + '): ' + p.issues.join('; ');
  }).join('\n');
}

function problemSummary_(result) {
  return result.problems.length ? 'Skipped rows: ' + result.problems.map(function (p) { return p.row; }).join(', ') : '';
}

function plural_(n, one, many) { return n === 1 ? one : many; }

function log_(result, count, details) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.LOG);
  if (sh) sh.appendRow([new Date(), result, count, details || '']);
}
