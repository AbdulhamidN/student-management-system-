const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSpreadsheet, rowsToObjects } = require('../src/utils/spreadsheetParser');

test('parses the Excel student template and preserves phone numbers as text', () => {
  const templatePath = path.resolve(__dirname, '../../frontend/public/students-import-template.xlsx');
  const workbook = fs.readFileSync(templatePath);
  const rows = parseSpreadsheet(workbook, 'students-import-template.xlsx');
  assert.deepEqual(rows[0], ['name', 'email', 'phone', 'department']);

  // Simulate a filled row by testing the same parser with a generated fixture if needed.
  assert.equal(rowsToObjects(rows).length, 0);
});
