I will now update `App.jsx` inside your web code canvas to incorporate all five tab enhancements:

1. **Pipeline Overview**:
* **Master Total Pipeline Speedometer** + **4 Team Speedometers** (`ANZ ENT`, `ANZ Scale`, `ANZ SMB`, `ANZ AM`).
* **Dynamic Team & Source Filtering**: Filtering by a specific Team updates all KPI cards, hides the other speedometers, and displays only the speedometer for that selected Team; filtering by Source (`Marketing Sourced` / `BDR Sourced`) keeps all speedometers visible while dynamically recalculating every metric and speedometer for that Source.


2. **Rep Pipeline Leaderboard**:
* **1st, 2nd, and 3rd Place Podium Cards** at the top of the leaderboard.
* **Metric Toggle (`Pipeline Attained` vs. `Commit`)**: Lets you rank both the top podium tiles and the leaderboard table by either **Pipeline Attained** or **Most in Commit**, while honoring the Team and Source filters.


3. **Partner Ecosystem**:
* Removed the Source filter from this tab.
* Added **Partner Source (Column Z)** and **Partner Influence (Column Y)** dropdown filters.
* Added **1st, 2nd, and 3rd Place Partner Podium Tiles** above the leaderboard.


4. **Crossbeam Overlaps**:
* Added **BD (BDR)** filter alongside **Rep (AE)**, **Partner**, and **Stage** filters.


5. **Focus Opportunities**:
* **Left-Hand Side (LHS)**: Pulls directly from the **`ANZ Prospecting`** tab, prioritizing **`Prospecting | MQL`** and **`Prospecting | PQL`** accounts first (with search and Team/Owner/BDR visibility).
* **Right-Hand Side (RHS)**: Displays opportunities in **`Qualifying`** stage from the **`ANZ`** tab with a **Close Date between 0–90 days**.



App.jsx [generated with web_code_canvas tool]

### Required `doGet(e)` Update in `Code.gs` (for Live `ANZ Prospecting` Feed)

So the Left-Hand Side of **Focus Opportunities** receives live rows from your **`ANZ Prospecting`** tab via your Apps Script Web App URL (in addition to the CSV fallback already built into `App.jsx`), replace your **`doGet(e)`** function at the bottom of **`Code.gs`** with this version and click **Deploy > Manage deployments > Edit (pencil icon) > New version > Deploy**:

```javascript
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('ANZ') || ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    const lastCol = Math.max(sheet.getLastColumn(), 26);
    const allValues = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    const summary = {
      lastUpdated: String(allValues[4] ? allValues[4][1] : ''),
      totalTarget: 18710000,
      marketingTarget: 9300000,
      bdrTarget: 10820000,
      teams: {
        'ANZ ENT':   { target: 9650000, attained: 0, commit: 0, likely: 0 },
        'ANZ Scale': { target: 4980000, attained: 0, commit: 0, likely: 0 },
        'ANZ SMB':   { target: 1280000, attained: 0, commit: 0, likely: 0 },
        'ANZ AM':    { target: 2800000, attained: 0, commit: 0, likely: 0 }
      }
    };

    const parseNum = (v) => {
      if (typeof v === 'number') return v;
      const s = String(v || '0').trim();
      const num = parseFloat(s.replace(/[^0-9.-]/g, '')) || 0;
      return s.toUpperCase().includes('M') ? num * 1000000 : num;
    };

    for (let r = 0; r < Math.min(allValues.length, 25); r++) {
      const label = String(allValues[r][0] || '').trim();
      if (label.includes('ANZ SMB Target'))   { summary.teams['ANZ SMB'].target = parseNum(allValues[r][1]); summary.teams['ANZ SMB'].attained = parseNum(allValues[r][2]); }
      if (label.includes('ANZ Scale Target')) { summary.teams['ANZ Scale'].target = parseNum(allValues[r][1]); summary.teams['ANZ Scale'].attained = parseNum(allValues[r][2]); }
      if (label.includes('ANZ ENT Target'))   { summary.teams['ANZ ENT'].target = parseNum(allValues[r][1]); summary.teams['ANZ ENT'].attained = parseNum(allValues[r][2]); }
      if (label.includes('ANZ AM Target'))    { summary.teams['ANZ AM'].target = parseNum(allValues[r][1]); summary.teams['ANZ AM'].attained = parseNum(allValues[r][2]); }

      if (label.includes('ANZ SMB - Commit'))   summary.teams['ANZ SMB'].commit = parseNum(allValues[r][1]);
      if (label.includes('ANZ Scale - Commit')) summary.teams['ANZ Scale'].commit = parseNum(allValues[r][1]);
      if (label.includes('ANZ ENT - Commit'))   summary.teams['ANZ ENT'].commit = parseNum(allValues[r][1]);
      if (label.includes('ANZ AM - Commit'))    summary.teams['ANZ AM'].commit = parseNum(allValues[r][1]);

      if (label.includes('ANZ SMB - Likely'))   summary.teams['ANZ SMB'].likely = parseNum(allValues[r][1]);
      if (label.includes('ANZ Scale - Likely')) summary.teams['ANZ Scale'].likely = parseNum(allValues[r][1]);
      if (label.includes('ANZ ENT - Likely'))   summary.teams['ANZ ENT'].likely = parseNum(allValues[r][1]);
      if (label.includes('ANZ AM - Likely'))    summary.teams['ANZ AM'].likely = parseNum(allValues[r][1]);
    }

    let headerIdx = 31;
    for (let r = 20; r < Math.min(allValues.length, 40); r++) {
      const rowStr = allValues[r].map(c => String(c).toLowerCase()).join('|');
      if (rowStr.includes('opportunity') && rowStr.includes('stage')) {
        headerIdx = r;
        break;
      }
    }

    const deals = [];
    for (let r = headerIdx + 1; r < allValues.length; r++) {
      const row = allValues[r];
      const colA = String(row[0] || '').trim();
      const colB = String(row[1] || '').trim();
      if (!colA && !colB) continue;
      if (colA.toLowerCase().includes('total') || colB.toLowerCase().includes('total') || colA.toLowerCase() === 'cotal') continue;

      const isStandardId = colA.startsWith('006');
      if (isStandardId) {
        const rawSource = String(row[22] || '').toLowerCase();
        const source = (rawSource.includes('inbound') || rawSource.includes('marketing')) ? 'Marketing Sourced' : 'BDR Sourced';
        const sourcedDetail = String(row[9] || '').trim();

        deals.push({
          id: colA,
          name: colB || colA,
          team: String(row[2] || 'ANZ ENT').trim(),
          stage: String(row[3] || 'Qualifying').trim(),
          acv: parseNum(row[4]),
          ae: String(row[5] || 'Unassigned').trim(),
          bdr: String(row[6] || '').trim(),
          crossbeamPartners: String(row[7] || '').trim(),
          partnerAttached: String(row[8] || '').toLowerCase() === 'yes',
          partnerSourcedDetail: sourcedDetail,
          isPartnerSourced: sourcedDetail.toLowerCase().includes('sourced'),
          commitStatus: String(row[18] || 'Non Commit').trim() || 'Non Commit',
          closeDate: row[20] instanceof Date ? Utilities.formatDate(row[20], 'Australia/Sydney', 'M/d/yyyy') : String(row[20] || '').trim(),
          nextSteps: String(row[21] || '').trim(),
          source: source,
          partnerInfluence: String(row[24] || '').trim(),
          sourcePartner: String(row[25] || '').trim()
        });
      }
    }

    // Also read "ANZ Prospecting" tab (Row 33+) for Focus Opportunities LHS
    const prospecting = [];
    const prospSheet = ss.getSheetByName('ANZ Prospecting');
    if (prospSheet && prospSheet.getLastRow() >= 33) {
      const pLastRow = prospSheet.getLastRow();
      const pLastCol = Math.max(prospSheet.getLastColumn(), 26);
      const pValues = prospSheet.getRange(33, 1, pLastRow - 32, pLastCol).getValues();
      const pHeader = prospSheet.getRange(32, 1, 1, pLastCol).getValues()[0].map(h => String(h || '').toLowerCase());
      const acctIdx = pHeader[0].includes('account') ? 0 : (pHeader[1].includes('account') ? 1 : 0);

      for (let r = 0; r < pValues.length; r++) {
        const row = pValues[r];
        const acctName = String(row[acctIdx] || '').trim();
        if (!acctName || acctName.toLowerCase().includes('total')) continue;

        prospecting.push({
          id: 'prosp-' + r,
          name: acctName,
          team: String(row[2] || '').trim(),
          stage: String(row[3] || 'Prospecting').trim(),
          acv: parseNum(row[4]),
          ae: String(row[5] || '').trim(),
          bdr: String(row[6] || '').trim(),
          crossbeamPartners: String(row[7] || '').trim(),
          partnerAttached: String(row[8] || '').trim(),
          partnerSourced: String(row[9] || '').trim(),
          nextSteps: String(row[21] || '').trim(),
          partnerInfluence: String(row[24] || '').trim(),
          sourcePartner: String(row[25] || '').trim()
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', summary: summary, deals: deals, prospecting: prospecting }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

```
