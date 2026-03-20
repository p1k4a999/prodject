/**
 * Reliable Google Apps Script Web App endpoint for lead collection.
 *
 * - 1 spreadsheet per month: Leads_YYYY_MM
 * - tabs are country-code based and created on demand
 * - invalid / empty country values are written to OTHER
 * - default sheet is NEVER deleted; it is reused/renamed to OTHER on first creation
 */

const ROOT_FOLDER_ID = 'PASTE_GOOGLE_DRIVE_FOLDER_ID_HERE';
const SCRIPT_VERSION = 'v4-country-tabs-2026-03-20';
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
    const normalizedCountry = normalizeCountryCode(payload.country);
    const tab = normalizedCountry || 'OTHER';
    const sheet = getOrCreateCountrySheet(spreadsheet, tab);

    sheet.appendRow([
      payload.name || '',
      payload.surname || '',
      payload.phone || '',
      payload.about || '',
      payload.language || '',
      tab,
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
      country: tab,
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

function normalizeCountryCode(country) {
  const normalized = String(country == null ? '' : country).trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : 'OTHER';
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

function getOrCreateCountrySheet(spreadsheet, tabName) {
  const allSheets = spreadsheet.getSheets();
  const firstSheet = allSheets.length ? allSheets[0] : spreadsheet.insertSheet('OTHER');

  let targetSheet = spreadsheet.getSheetByName(tabName);
  if (!targetSheet) {
    if (allSheets.length === 1 && firstSheet.getLastRow() === 0 && firstSheet.getLastColumn() === 0) {
      firstSheet.setName(tabName);
      targetSheet = firstSheet;
    } else {
      targetSheet = spreadsheet.insertSheet(tabName);
    }
  }

  ensureHeaders(targetSheet);
  return targetSheet;
}

function ensureHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => current[index] === header);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
