# Google Apps Script — Setup Guide

## Step 1 — Fix your Sheet headers

Your `Leads_CRM` tab row 1 must have these EXACT headers (in this order):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|Lead ID|Created At|Name|Phone|Source|Area (Preferred)|Budget Range|BHK|Furnishing|Move-in|Profile|Score|Stage|Agent|Notes|Next Follow-up|Last Contacted|Status Reason|

Your current sheet already has most of these. The script is matched to them exactly.

## Step 2 — Paste the script

1. Open your Google Sheet
2. Click **Extensions → Apps Script**
3. Delete all existing code
4. Paste the full contents of `Code.gs`
5. Update these 3 lines at the top:
   ```js
   var NOTIFY_TO = "ayushjha5987@gmail.com";  // your email
   var BUSINESS_WA_NUMBER = "917498369191";    // 91 + your number
   var AGENT_NAME = "Ayush";                   // your name
   ```
6. Click **Save** (Ctrl+S)

## Step 3 — Redeploy (IMPORTANT)

Every time you edit the script, you MUST redeploy:

1. Click **Deploy → Manage deployments**
2. Click the **pencil (edit) icon**
3. Change **Version** to **"New version"**
4. Click **Deploy**
5. Copy the `/exec` URL — paste it in your `.env.local` as `VITE_LEAD_API_URL`

⚠️ If you only save the script but don't redeploy as a new version, the old code keeps running.

## Step 4 — Test it

Paste this in your browser console:
```js
fetch("YOUR_EXEC_URL_HERE", {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({
    name: "Test User",
    phone: "9876543210",
    area: "Malad West",
    budgetRange: "40-60k",
    bhk: "2",
    furnishing: "S",
    moveIn: "Immediate",
    profile: "Family",
    source: "Website"
  })
}).then(r => r.json()).then(console.log)
```

Expected response:
```json
{ "ok": true, "leadId": "LD-0001", "action": "created" }
```

And in your sheet, row 2 should have all fields filled including the Lead ID.

---

## What was broken (and why it's fixed now)

### Bug 1 — Wrong column order
Your sheet has 18 columns in a specific order. The old script was writing to
different columns (it had a `Locality` column that your sheet doesn't have,
and was missing `Agent`, `Last Contacted`, `Status Reason`).
**Fix:** Script now maps every value to the exact column it belongs in.

### Bug 2 — Lead ID race condition
Old code:
```js
sheet.appendRow(rowValues);           // empty Lead ID in col A
const row = sheet.getLastRow();       // ← sometimes wrong due to buffering
sheet.getRange(row, 1).setValue(id);  // ← wrote to wrong row
```
Apps Script buffers writes. `appendRow` + `getLastRow()` + `setValue` is 3
separate API calls. The buffering means row number can be wrong.

**Fix:** We now write the formula directly into column A and all other values
in one `setValues()` call, then call `SpreadsheetApp.flush()` to force
evaluation before reading back the resolved Lead ID.

```js
sheet.getRange(newRow, 1).setFormula('="LD-"&TEXT(ROW()-1,"0000")');
sheet.getRange(newRow, 2, 1, 17).setValues([[now, name, phone, ...]]);
SpreadsheetApp.flush();
leadId = sheet.getRange(newRow, 1).getDisplayValue(); // reads LD-0001
```

### Bug 3 — Email typo
`ayushjha5987@gamil.com` → `ayushjha5987@gmail.com` (corrected)
