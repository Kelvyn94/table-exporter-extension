// popup.js
// This runs when the user clicks the extension icon. It does NOT have
// access to the webpage's content directly — it has to (1) inject
// content.js into the active tab, then (2) send it a message asking
// for the scanned table data, then (3) wait for the reply.

const scanBtn = document.getElementById('scanBtn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');

let lastScannedTables = []; // keep the data in memory so export buttons can use it

scanBtn.addEventListener('click', async () => {
  statusEl.textContent = 'Scanning...';
  resultsEl.innerHTML = '';

  // Step 1: find the tab the user is currently looking at.
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    // Step 2: inject content.js into that tab. We do this on-demand
    // (rather than always-on via manifest) so the extension only ever
    // touches a page when the user explicitly asks — better for
    // performance and for the user's trust in what the extension does.
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Step 3: send a message to that tab asking it to scan for tables.
    // chrome.tabs.sendMessage talks specifically to content scripts
    // running in a given tab (as opposed to chrome.runtime.sendMessage,
    // which is for messaging between the popup/background/etc).
    chrome.tabs.sendMessage(tab.id, { type: 'SCAN_TABLES' }, (response) => {
      if (chrome.runtime.lastError) {
        // This fires if content.js couldn't run at all — e.g. the page
        // is a chrome:// internal page, or a PDF viewer, where
        // extensions aren't allowed to inject scripts.
        statusEl.textContent = 'Cannot scan this page (restricted page type).';
        return;
      }

      const tables = response?.tables || [];
      lastScannedTables = tables;
      renderResults(tables);
    });
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
  }
});

function renderResults(tables) {
  if (tables.length === 0) {
    statusEl.textContent = 'No data tables found on this page.';
    return;
  }

  statusEl.textContent = `Found ${tables.length} table${tables.length > 1 ? 's' : ''}.`;

  resultsEl.innerHTML = '';
  tables.forEach(table => {
    const item = document.createElement('div');
    item.className = 'table-item';
    item.innerHTML = `
      <div class="label">${escapeHtml(table.label)}</div>
      <div class="meta">${table.rowCount} rows × ${table.colCount} columns</div>
      <button data-index="${table.index}" data-format="csv">Export CSV</button>
    `;
    resultsEl.appendChild(item);
  });

  // Wire up the export buttons we just created.
  resultsEl.querySelectorAll('button[data-format="csv"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const table = lastScannedTables.find(t => t.index == btn.dataset.index);
      exportAsCsv(table);
    });
  });
}

/**
 * Converts a table's data (array of arrays) into a real CSV file and
 * triggers a download.
 *
 * Why CSV, and not a "real" .xlsx binary file: CSV is the pragmatic,
 * zero-dependency choice — Excel, Google Sheets, and every spreadsheet
 * tool opens CSV natively with zero setup. Building genuine .xlsx
 * files requires a real library (like SheetJS) bundled into the
 * extension, which is a great next step once this works end-to-end
 * (see the note at the bottom of this file).
 */
function exportAsCsv(table) {
  const csvContent = table.data.map(row =>
    row.map(cell => escapeCsvCell(cell)).join(',')
  ).join('\r\n');

  // Prepend a UTF-8 BOM so Excel correctly detects encoding (without
  // this, special characters like currency symbols can display wrong
  // when opened directly in Excel on Windows).
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const filename = sanitizeFilename(table.label) + '.csv';

  chrome.downloads.download({
    url,
    filename,
    saveAs: true // prompts the user for a save location, rather than
                 // silently dropping it in Downloads — better UX and
                 // more transparent about what the extension is doing
  });
}

/** Escapes a single CSV cell: wraps in quotes if it contains a comma,
 * quote, or newline, and doubles up any internal quotes (the standard
 * CSV escaping rule). */
function escapeCsvCell(value) {
  if (/[",\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-]+/gi, '_').slice(0, 50) || 'table_export';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/*
  NEXT STEP, if you want real .xlsx files (not just CSV):
  1. Download SheetJS's community edition (xlsx.full.min.js) from
     https://sheetjs.com — it's free and open-source.
  2. Put that file in this folder and add it to popup.html:
       <script src="xlsx.full.min.js"></script>
     BEFORE the <script src="popup.js"> line.
  3. Replace exportAsCsv's Blob-building logic with:
       const ws = XLSX.utils.aoa_to_sheet(table.data);
       const wb = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
       XLSX.writeFile(wb, filename.replace('.csv', '.xlsx'));
  This gives you a genuine binary .xlsx file with real Excel formatting
  support, rather than a plain-text CSV.
*/
