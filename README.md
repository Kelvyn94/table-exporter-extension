# Table Exporter — Chrome Extension

Scan any webpage for HTML tables and export them straight to CSV (opens natively in Excel, Google Sheets, and every spreadsheet tool) — no copy-pasting, no manual reformatting.

## Demo

<img width="1350" height="764" alt="image" src="https://github.com/user-attachments/assets/ca4ef2ac-3cc2-4f88-bde1-256ba9fdd7cc" />


## Features

- Detects every `<table>` on the current page in one click
- Auto-labels tables using nearby headings, so you can tell them apart
- Exports clean, correctly-escaped CSV files (handles commas, quotes, and newlines inside cells correctly)
- UTF-8 BOM included, so special characters display correctly when opened in Excel
- Only runs when you click "Scan" — never silently reads pages in the background

## Why this exists

Built as a practical, freelance-ready tool: manually copy-pasting tables out of websites into spreadsheets is slow and error-prone (merged formatting, broken rows, lost data). This automates that entire step.

## Installation (until published on the Chrome Web Store)

comming soon... you can contact me for source code 

## Usage

1. Visit any page with a data table (try a Wikipedia list page)
2. Click the extension icon
3. Click **Scan this page for tables**
4. Click **Export CSV** next to the table you want

## Tech notes / how it works

Built with vanilla JavaScript and Manifest V3 — no frameworks, no build step, no external dependencies. Uses Chrome's message-passing architecture: a content script reads the page's DOM, and the popup communicates with it via `chrome.tabs.sendMessage` to retrieve and export the data.

See `popup.js` for a fully-commented walkthrough of the extraction and export logic, including notes on extending this to true `.xlsx` binary export via SheetJS.

## Roadmap

- [ ] True `.xlsx` export (SheetJS integration)
- [ ] Handle merged cells (`colspan`/`rowspan`) more robustly
- [ ] Publish to the Chrome Web Store

## License

MIT — free to use, modify, and build on.
"# table-exporter-extension" 
