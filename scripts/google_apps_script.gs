/**
 * Google Apps Script Web App endpoint for lead collection.
 * Stores leads by month into separate spreadsheets: Leads_YYYY_MM
 * Tabs inside each monthly file: PL, DE, UA, RU, EU
 * Country routing:
 *   PL -> PL, DE -> DE, UA -> UA, RU -> RU, others -> EU
 */

const ROOT_FOLDER_ID = 'PASTE_GOOGLE_DRIVE_FOLDER_ID_HERE';
const SCRIPT_VERSION = 'v2-debug-2026-03-15';
const TAB_NAMES = ['PL', 'DE', 'UA', 'RU', 'EU'];
const HEADERS = ['name', 'surname', 'phone', 'about', 'language', 'country', 'source', 'date', 'time', 'created_at'];

function doPost(e) {
  try {
    const payload = parsePayload(e);
    Logger.log('SCRIPT_VERSION=%s', SCRIPT_VERSION);
    Logger.log('RAW_POST=%s', e && e.postData ? e.postData.contents : '');
    Logger.log('PAYLOAD=%s', JSON.stringify(payload));

    const now = new Date();
    const ym = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy_MM');
    const fileName = `Leads_${ym}`;

    const spreadsheet = getOrCreateMonthlySpreadsheet(fileName);
    ensureTabsAndHeaders(spreadsheet);

    const country = String(payload.country || 'UN').toUpperCase();
    const tab = routeTabByCountry(country);
    const sheet = spreadsheet.getSheetByName(tab);

    sheet.appendRow([
      payload.name || '',
      payload.surname || '',
      payload.phone || '',
      payload.about || '',
      payload.language || '',
      country,
      payload.source || 'landing-page',
      payload.date || '',
      payload.time || '',
      now.toISOString()
    ]);

    return jsonResponse({
      status: 'ok',
      success: true,
      scriptVersion: SCRIPT_VERSION,
      tab,
      country,
      spreadsheetId: spreadsheet.getId()
    });
  } catch (err) {
    Logger.log('ERROR=%s', err && err.stack ? err.stack : String(err));
    return jsonResponse({
      status: 'error',
      success: false,
      scriptVersion: SCRIPT_VERSION,
      error: String(err)
    });
  }
}

function parsePayload(e) {
  const raw = e && e.postData && e.postData.contents ? String(e.postData.contents) : '';
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (_) {
    // fallback: if frontend sent x-www-form-urlencoded with payload=<json>
    const paramPayload = e && e.parameter && e.parameter.payload ? String(e.parameter.payload) : '';
    if (paramPayload) {
      return JSON.parse(paramPayload);
    }

    throw new Error('Unable to parse request body as JSON');
  }
}

function routeTabByCountry(country) {
  if (country === 'PL') return 'PL';
  if (country === 'DE') return 'DE';
  if (country === 'UA') return 'UA';
  if (country === 'RU') return 'RU';
  return 'EU';
}

function getOrCreateMonthlySpreadsheet(fileName) {
  const folder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  }

  const spreadsheet = SpreadsheetApp.create(fileName);
  const file = DriveApp.getFileById(spreadsheet.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  return spreadsheet;
}

function ensureTabsAndHeaders(spreadsheet) {
  // remove default empty sheet if still exists
  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet && spreadsheet.getSheets().length === 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }

  TAB_NAMES.forEach((name) => {
    let sh = spreadsheet.getSheetByName(name);
    if (!sh) sh = spreadsheet.insertSheet(name);

    const firstRow = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    const hasHeaders = HEADERS.every((h, i) => firstRow[i] === h);
    if (!hasHeaders) {
      sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sh.setFrozenRows(1);
    }
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
