// content.js
// This file runs INSIDE the actual webpage (injected by Chrome).
// It can see the page's real DOM — the popup cannot, which is why
// we need this separate script and a message-passing bridge.

/**
 * Turns one <table> element into a clean array of arrays.
 * e.g. [["Name","Price"], ["Widget","$5"], ["Gadget","$9"]]
 *
 * Why we do it this way: tables can have merged cells (colspan/rowspan),
 * nested elements, whitespace, hidden rows, etc. We keep this function
 * deliberately simple (just .innerText per cell) — good enough for the
 * vast majority of real-world tables, and easy to extend later if a
 * specific site needs special handling.
 */
function extractTableData(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  return rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    return cells.map(cell => cell.innerText.trim());
  }).filter(row => row.length > 0); // skip empty rows
}

/**
 * Scans the whole page and returns a summary of every table found,
 * plus its extracted data. We also grab a short "label" for each table
 * (nearby heading, or just "Table 1", "Table 2"...) so the user can
 * tell them apart in the popup UI.
 */
function scanPageForTables() {
  const tables = Array.from(document.querySelectorAll('table'));

  return tables.map((table, index) => {
    // Try to find a nearby heading to use as a friendly label.
    // We look at the table's previous siblings and its parent's
    // previous siblings — a common pattern is <h2>Title</h2><table>...
    let label = `Table ${index + 1}`;
    let el = table.previousElementSibling;
    if (el && /^H[1-6]$/.test(el.tagName)) {
      label = el.innerText.trim();
    }

    const data = extractTableData(table);

    return {
      index,
      label,
      rowCount: data.length,
      colCount: data[0] ? data[0].length : 0,
      data
    };
  }).filter(t => t.rowCount > 1); // ignore tables with 0-1 rows (likely layout tables, not data)
}

// --- The message-passing bridge ---
// This is how popup.js "asks" this script for data. Chrome's extension
// APIs let different parts of the extension send messages to each other.
// Here, we listen for a message of type "SCAN_TABLES" and respond with
// the result of scanPageForTables().
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_TABLES') {
    const tables = scanPageForTables();
    sendResponse({ tables });
  }
  // Returning true tells Chrome "I'll respond asynchronously" — good
  // practice even here, since it costs nothing and avoids a subtle bug
  // if this function ever becomes async later.
  return true;
});
