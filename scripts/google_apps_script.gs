/**
 * Reliable Google Apps Script Web App endpoint for lead collection.
 *
 * - 1 spreadsheet per month: Leads_YYYY_MM
 * - tabs: PL, DE, UA, RU, EU
 * - routing by country: PL/DE/UA/RU, others -> EU
 * - default sheet is NEVER deleted; it is reused/renamed to PL.
 */

const ROOT_FOLDER_ID = 'PASTE_GOOGLE_DRIVE_FOLDER_ID_HERE';
const SCRIPT_VERSION = 'v3-reliable-sheets-2026-03-15';
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
    const sheetsByTab = ensureTabsAndHeaders(spreadsheet);

    const country = String(payload.country || 'UN').toUpperCase();
    const tab = routeTabByCountry(country);
    const sheet = sheetsByTab[tab] || spreadsheet.getSheetByName(tab);

    if (!sheet) {
      throw new Error(`Target sheet not found for tab=${tab}`);
    }

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
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName()
    });
  } catch (err) {
    const message = err && err.stack ? err.stack : String(err);
    Logger.log('ERROR=%s', message);

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
    const paramPayload = e && e.parameter && e.parameter.payload ? String(e.parameter.payload) : '';
    if (paramPayload) return JSON.parse(paramPayload);
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
    return SpreadsheetApp.openById(files.next().getId());
  }

  const spreadsheet = SpreadsheetApp.create(fileName);
  const file = DriveApp.getFileById(spreadsheet.getId());

  // Move to target folder. In some environments removeFile can fail if permissions differ;
  // this must not block lead writes.
  folder.addFile(file);
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (err) {
    Logger.log('WARN removeFile(root) failed: %s', String(err));
  }

  return spreadsheet;
}

function ensureTabsAndHeaders(spreadsheet) {
  const sheetsByTab = {};
  const allSheets = spreadsheet.getSheets();
  const firstSheet = allSheets.length ? allSheets[0] : spreadsheet.insertSheet('PL');

  // Requirement: do not delete default sheet; rename/reuse it as PL.
  let plSheet = spreadsheet.getSheetByName('PL');
  if (!plSheet) {
    firstSheet.setName('PL');
    plSheet = firstSheet;
  }
  sheetsByTab.PL = plSheet;

  // Ensure all required tabs exist.
  TAB_NAMES.forEach((tab) => {
    if (tab === 'PL') return;
    let sh = spreadsheet.getSheetByName(tab);
    if (!sh) {
      sh = spreadsheet.insertSheet(tab);
    }
    sheetsByTab[tab] = sh;
  });

  // Ensure headers for every required tab.
  TAB_NAMES.forEach((tab) => {
    const sh = sheetsByTab[tab];
    if (!sh) throw new Error(`Missing required tab: ${tab}`);

    const current = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    const hasHeaders = HEADERS.every((h, i) => current[i] === h);
    if (!hasHeaders) {
      sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sh.setFrozenRows(1);
    }
  });

  return sheetsByTab;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
