# Table Exporter — Chrome Extension

Scan any webpage for HTML tables and export them straight to CSV (opens natively in Excel, Google Sheets, and every spreadsheet tool) — no copy-pasting, no manual reformatting.

![status](https://img.shields.io/badge/status-active-brightgreen) ![manifest](https://img.shields.io/badge/manifest-v3-blue) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

## Demo

*(GIF/screenshot goes here — see "Adding a demo" below)*

## Features

- Detects every `<table>` on the current page in one click
- Auto-labels tables using nearby headings, so you can tell them apart
- Exports clean, correctly-escaped CSV files (handles commas, quotes, and newlines inside cells correctly)
- UTF-8 BOM included, so special characters display correctly when opened in Excel
- Only runs when you click "Scan" — never silently reads pages in the background

## Why this exists

Built as a practical, freelance-ready tool: manually copy-pasting tables out of websites into spreadsheets is slow and error-prone (merged formatting, broken rows, lost data). This automates that entire step.

## Installation (until published on the Chrome Web Store)

1. Clone or download this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select this folder
5. Pin the extension icon for easy access

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
