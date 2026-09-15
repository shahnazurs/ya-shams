/**
 * WAYFARER — Van & Car Rental backend
 * ------------------------------------------------------------------
 * Deploy this as a Google Apps Script Web App bound to a Google Sheet.
 * The sheet must have two tabs: "Vehicles" and "Bookings".
 *
 * Vehicles columns (row 1 = header):
 *   id | name | type | seats | transmission | pricePerDay | description | images | available
 *   - "images" is a comma-separated list of direct image URLs
 *   - "available" is TRUE or FALSE
 *
 * Bookings columns (row 1 = header):
 *   id | vehicleId | vehicleName | customerName | email | phone |
 *   startDate | endDate | notes | status | createdAt
 *
 * SETUP
 *   1. Create a Google Sheet with the two tabs and header rows above.
 *   2. Extensions > Apps Script, paste this file in as Code.gs.
 *   3. Project Settings > Script Properties: add a key ADMIN_TOKEN with
 *      the password you want admins to log in with.
 *   4. Deploy > New deployment > type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *   5. Copy the /exec URL into src/config.js as APPS_SCRIPT_URL in the
 *      React app.
 *   6. Re-deploy (Manage deployments > Edit > New version) any time you
 *      change this file — edits are not picked up otherwise.
 * ------------------------------------------------------------------
 */

const VEHICLES_SHEET = 'Vehicles';
const BOOKINGS_SHEET = 'Bookings';

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Missing sheet: ' + name);
  return sheet;
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
}

function findRowIndexById_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function checkAdmin_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!expected) throw new Error('Server is missing ADMIN_TOKEN script property.');
  if (token !== expected) throw new Error('Not authorized.');
}

function uid_() {
  return Utilities.getUuid().split('-')[0];
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

function listVehicles_() {
  const sheet = getSheet_(VEHICLES_SHEET);
  return sheetToObjects_(sheet).map((v) => ({
    ...v,
    seats: Number(v.seats) || 0,
    pricePerDay: Number(v.pricePerDay) || 0,
    images: v.images ? String(v.images).split(',').map((s) => s.trim()).filter(Boolean) : [],
    available: v.available === true || String(v.available).toUpperCase() === 'TRUE',
  }));
}

function addVehicle_(payload) {
  const sheet = getSheet_(VEHICLES_SHEET);
  const id = uid_();
  sheet.appendRow([
    id,
    payload.name || '',
    payload.type || '',
    Number(payload.seats) || 0,
    payload.transmission || '',
    Number(payload.pricePerDay) || 0,
    payload.description || '',
    (payload.images || []).join(','),
    payload.available !== false,
  ]);
  return { id, ...payload };
}

function updateVehicle_(payload) {
  const sheet = getSheet_(VEHICLES_SHEET);
  const row = findRowIndexById_(sheet, payload.id);
  if (row === -1) throw new Error('Vehicle not found.');
  sheet.getRange(row, 1, 1, 9).setValues([[
    payload.id,
    payload.name || '',
    payload.type || '',
    Number(payload.seats) || 0,
    payload.transmission || '',
    Number(payload.pricePerDay) || 0,
    payload.description || '',
    (payload.images || []).join(','),
    payload.available !== false,
  ]]);
  return payload;
}

function deleteVehicle_(id) {
  const sheet = getSheet_(VEHICLES_SHEET);
  const row = findRowIndexById_(sheet, id);
  if (row === -1) throw new Error('Vehicle not found.');
  sheet.deleteRow(row);
  return true;
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

function listBookings_() {
  const sheet = getSheet_(BOOKINGS_SHEET);
  return sheetToObjects_(sheet);
}

function createBooking_(payload) {
  const sheet = getSheet_(BOOKINGS_SHEET);
  const id = uid_();
  const createdAt = new Date().toISOString();
  sheet.appendRow([
    id,
    payload.vehicleId || '',
    payload.vehicleName || '',
    payload.customerName || '',
    payload.email || '',
    payload.phone || '',
    payload.startDate || '',
    payload.endDate || '',
    payload.notes || '',
    'pending',
    createdAt,
  ]);

  // Optional: email the admin whenever a new request comes in.
  // Uncomment and set an address to enable.
  // MailApp.sendEmail('you@example.com', 'New reservation request',
  //   `${payload.customerName} requested ${payload.vehicleName} from ${payload.startDate} to ${payload.endDate}.`);

  return { id, status: 'pending', createdAt, ...payload };
}

function updateBookingStatus_(id, status) {
  const sheet = getSheet_(BOOKINGS_SHEET);
  const row = findRowIndexById_(sheet, id);
  if (row === -1) throw new Error('Booking not found.');
  const statusCol = 10; // column J
  sheet.getRange(row, statusCol).setValue(status);
  return { id, status };
}

// ---------------------------------------------------------------------------
// HTTP entry points
// ---------------------------------------------------------------------------

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;
    if (action === 'listVehicles') {
      result = listVehicles_();
    } else if (action === 'listBookings') {
      checkAdmin_(e.parameter.token);
      result = listBookings_();
    } else {
      throw new Error('Unknown action: ' + action);
    }
    return jsonResponse_({ ok: true, result });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};
    let result;

    if (action === 'login') {
      const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
      result = payload.token === expected;
    } else if (action === 'createBooking') {
      result = createBooking_(payload);
    } else if (action === 'addVehicle') {
      checkAdmin_(body.token);
      result = addVehicle_(payload);
    } else if (action === 'updateVehicle') {
      checkAdmin_(body.token);
      result = updateVehicle_(payload);
    } else if (action === 'deleteVehicle') {
      checkAdmin_(body.token);
      result = deleteVehicle_(payload.id);
    } else if (action === 'updateBookingStatus') {
      checkAdmin_(body.token);
      result = updateBookingStatus_(payload.id, payload.status);
    } else {
      throw new Error('Unknown action: ' + action);
    }

    return jsonResponse_({ ok: true, result });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message });
  }
}
