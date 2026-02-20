/**
 * ══════════════════════════════════════════════════════════════
 *  MUMBAI RENTALS — Lead CRM Script
 *  Matched to your exact Leads_CRM sheet columns:
 *
 *  A  Lead ID         (formula: ="LD-"&TEXT(ROW()-1,"0000"))
 *  B  Created At
 *  C  Name
 *  D  Phone
 *  E  Source
 *  F  Area (Preferred)
 *  G  Budget Range
 *  H  BHK
 *  I  Furnishing
 *  J  Move-in
 *  K  Profile
 *  L  Score
 *  M  Stage
 *  N  Agent
 *  O  Notes
 *  P  Next Follow-up
 *  Q  Last Contacted
 *  R  Status Reason
 * ══════════════════════════════════════════════════════════════
 */

var SHEET_NAME        = "Leads_CRM";
var NOTIFY_TO         = "ayushjha5987@gmail.com";  // ← your email
var NOTIFY_CC         = "";                         // optional extra email
var BUSINESS_WA_NUMBER = "917498369191";            // 91 + 10-digit number
var AGENT_NAME        = "Ayush";                    // shown in Agent column

// ── Column numbers (1-indexed, matching your sheet exactly) ──
var COL = {
  LEAD_ID:      1,   // A
  CREATED_AT:   2,   // B
  NAME:         3,   // C
  PHONE:        4,   // D
  SOURCE:       5,   // E
  AREA:         6,   // F
  BUDGET:       7,   // G
  BHK:          8,   // H
  FURNISHING:   9,   // I
  MOVE_IN:      10,  // J
  PROFILE:      11,  // K
  SCORE:        12,  // L
  STAGE:        13,  // M
  AGENT:        14,  // N
  NOTES:        15,  // O
  NEXT_FOLLOWUP:16,  // P
  LAST_CONTACTED:17, // Q
  STATUS_REASON: 18  // R
};

var TOTAL_COLS = 18;
var HEADER_ROW = 1;
var DATA_START  = 2; // first data row (row 2 onwards)

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safe(v) {
  return (v === null || v === undefined) ? "" : String(v);
}

function normalizePhone(p) {
  if (!p) return "";
  var d = String(p).replace(/\D/g, "");
  return d.length > 10 ? d.slice(-10) : d;
}

function computeScore(moveIn) {
  var v = (moveIn || "").toLowerCase().trim();
  if (v === "immediate" || v === "7" || v === "15") return "Hot";
  if (v === "30" || v === "30+") return "Warm";
  return "Cold";
}

function nextFollowUpDate(score) {
  var d = new Date();
  if (score === "Hot")  return d;
  if (score === "Warm") { d.setDate(d.getDate() + 1); return d; }
  d.setDate(d.getDate() + 3);
  return d;
}

function fmtDate(d) {
  try {
    return Utilities.formatDate(
      new Date(d), Session.getScriptTimeZone(), "dd-MMM-yyyy HH:mm"
    );
  } catch (_) { return safe(d); }
}

function waLink(phone10, text) {
  return "https://wa.me/91" + normalizePhone(phone10) +
         "?text=" + encodeURIComponent(text || "");
}

// ══════════════════════════════════════════════════════════════
//  FIND EXISTING LEAD ROW BY PHONE
//  Returns row number (1-indexed) or -1 if not found
// ══════════════════════════════════════════════════════════════

function findRowByPhone(sheet, phone) {
  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START) return -1;

  var phones = sheet
    .getRange(DATA_START, COL.PHONE, lastRow - HEADER_ROW, 1)
    .getValues();

  for (var i = 0; i < phones.length; i++) {
    if (normalizePhone(phones[i][0]) === phone) {
      return DATA_START + i;
    }
  }
  return -1;
}

// ══════════════════════════════════════════════════════════════
//  GET LEAD ID FROM ROW
//  The sheet uses a formula ="LD-"&TEXT(ROW()-1,"0000")
//  We read the DISPLAYED value (getDisplayValue) not the formula
// ══════════════════════════════════════════════════════════════

function getLeadIdFromRow(sheet, rowNum) {
  var cell = sheet.getRange(rowNum, COL.LEAD_ID);
  // getDisplayValue gives us what is SHOWN (resolves the formula)
  var display = cell.getDisplayValue();
  if (display && display.startsWith("LD-")) return display;
  // Fallback: compute manually
  return "LD-" + String(rowNum - 1).padStart(4, "0");
}

// ══════════════════════════════════════════════════════════════
//  EMAIL NOTIFICATION
// ══════════════════════════════════════════════════════════════

function sendEmail(action, leadId, lead, createdAt) {
  try {
    var name    = safe(lead.name);
    var phone   = normalizePhone(lead.phone);
    var area    = safe(lead.area);
    var budget  = safe(lead.budget);
    var bhk     = safe(lead.bhk);
    var furnish = safe(lead.furnishing);
    var moveIn  = safe(lead.moveIn);
    var profile = safe(lead.profile);
    var score   = safe(lead.score);
    var notes   = safe(lead.notes);

    var msgDraft =
      "Hi " + name + "! Your Lead ID is *" + leadId + "*. " +
      "Confirming your requirement: " + area + ", " + bhk + " BHK, " +
      "move-in " + moveIn + ", budget " + budget + ". " +
      "Furnishing: " + (furnish || "any") + ". Profile: " + profile + ". " +
      "I'll share matching options shortly!";

    var subject =
      "[" + action.toUpperCase() + "] " + leadId +
      " • " + name + " • " + area + " • " + bhk + " BHK • " + budget;

    var body =
      "Lead " + action + "\n" +
      "════════════════════\n\n" +
      "Lead ID   : " + leadId  + "\n" +
      "Created At: " + fmtDate(createdAt) + "\n" +
      "Score     : " + score   + "\n\n" +
      "── Customer ──\n" +
      "Name      : " + name    + "\n" +
      "Phone     : " + phone   + "\n" +
      "Area      : " + area    + "\n" +
      "Budget    : " + budget  + "\n" +
      "BHK       : " + bhk     + "\n" +
      "Furnishing: " + furnish + "\n" +
      "Move-in   : " + moveIn  + "\n" +
      "Profile   : " + profile + "\n" +
      "Notes     : " + notes   + "\n\n" +
      "── Quick Actions ──\n" +
      "Call      : tel:+91" + phone + "\n" +
      "WhatsApp  : " + waLink(phone, msgDraft) + "\n\n" +
      "── Pre-written WhatsApp Message ──\n" +
      msgDraft;

    var opts = {};
    if (NOTIFY_CC) opts.cc = NOTIFY_CC;
    MailApp.sendEmail(NOTIFY_TO, subject, body, opts);
  } catch (e) {
    Logger.log("Email error: " + e);
    // Never crash the lead save because of email failure
  }
}

// ══════════════════════════════════════════════════════════════
//  GET (health check)
// ══════════════════════════════════════════════════════════════

function doGet() {
  return jsonResponse({ ok: true, message: "Mumbai Rentals Lead API is running" });
}

// ══════════════════════════════════════════════════════════════
//  POST (main)
// ══════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    // ── Open sheet ──
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, error: "Sheet '" + SHEET_NAME + "' not found. Check the tab name." });
    }

    // ── Parse body ──
    var raw  = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var body = {};
    try { body = JSON.parse(raw); } catch (_) {}

    // ── Extract & validate ──
    var name       = (body.name       || "").trim();
    var phone      = normalizePhone(body.phone);
    var area       = (body.area       || "").trim();
    var budget     = (body.budgetRange || "").trim();
    var bhk        = (body.bhk        || "").trim();
    var furnishing = (body.furnishing  || "").trim();
    var moveIn     = (body.moveIn      || "").trim();
    var profile    = (body.profile     || "").trim();
    var notes      = (body.notes       || "").trim();
    var source     = (body.source      || "Website").trim();

    if (!name)                         return jsonResponse({ ok: false, error: "Name is required" });
    if (!phone || phone.length !== 10) return jsonResponse({ ok: false, error: "Valid 10-digit phone required" });
    if (!area)                         return jsonResponse({ ok: false, error: "Area is required" });
    if (!bhk)                          return jsonResponse({ ok: false, error: "BHK is required" });
    if (!moveIn)                       return jsonResponse({ ok: false, error: "Move-in is required" });
    if (!profile)                      return jsonResponse({ ok: false, error: "Profile is required" });

    // ── Compute CRM fields ──
    var score   = computeScore(moveIn);
    var nextFU  = nextFollowUpDate(score);
    var now     = new Date();

    // ── Check duplicate by phone ──
    var existingRow = findRowByPhone(sheet, phone);

    var leadId;
    var action;

    if (existingRow > 0) {
      // ══ UPDATE existing row ══
      // Keep Lead ID and Created At unchanged — only update the rest
      leadId = getLeadIdFromRow(sheet, existingRow);
      action = "updated";

      // Write columns C through R (cols 3–18), preserving A (Lead ID) and B (Created At)
      sheet.getRange(existingRow, COL.NAME, 1, TOTAL_COLS - 2).setValues([[
        name,        // C  Name
        phone,       // D  Phone
        source,      // E  Source
        area,        // F  Area (Preferred)
        budget,      // G  Budget Range
        bhk,         // H  BHK
        furnishing,  // I  Furnishing
        moveIn,      // J  Move-in
        profile,     // K  Profile
        score,       // L  Score
        "Updated",   // M  Stage
        AGENT_NAME,  // N  Agent
        notes,       // O  Notes
        nextFU,      // P  Next Follow-up
        now,         // Q  Last Contacted
        "Re-submitted from website"  // R  Status Reason
      ]]);

    } else {
      // ══ INSERT new row ══
      action = "created";

      // Find the first empty data row
      var lastRow    = sheet.getLastRow();
      var newRow     = lastRow + 1;

      // Lead ID: use the sheet formula so it auto-fills like existing rows
      // We set the formula in column A, everything else as values
      var leadIdFormula = '="LD-"&TEXT(ROW()-1,"0000")';

      sheet.getRange(newRow, COL.LEAD_ID).setFormula(leadIdFormula);

      // Write B through R as values
      sheet.getRange(newRow, COL.CREATED_AT, 1, TOTAL_COLS - 1).setValues([[
        now,         // B  Created At
        name,        // C  Name
        phone,       // D  Phone
        source,      // E  Source
        area,        // F  Area (Preferred)
        budget,      // G  Budget Range
        bhk,         // H  BHK
        furnishing,  // I  Furnishing
        moveIn,      // J  Move-in
        profile,     // K  Profile
        score,       // L  Score
        "New",       // M  Stage
        AGENT_NAME,  // N  Agent
        notes,       // O  Notes
        nextFU,      // P  Next Follow-up
        now,         // Q  Last Contacted
        "New from website"  // R  Status Reason
      ]]);

      // Read back the resolved Lead ID (formula now rendered)
      // Small flush: SpreadsheetApp.flush() ensures formula is evaluated
      SpreadsheetApp.flush();
      leadId = getLeadIdFromRow(sheet, newRow);
    }

    // ── Send email notification ──
    sendEmail(action, leadId, { name, phone, area, budget, bhk, furnishing, moveIn, profile, score, notes }, now);

    return jsonResponse({ ok: true, leadId: leadId, action: action });

  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    Logger.log("doPost error: " + msg);
    return jsonResponse({ ok: false, error: msg });
  }
}
