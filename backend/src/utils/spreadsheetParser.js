const zlib = require('zlib');

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function unzipEntries(buffer) {
  const entries = new Map();
  let eocd = -1;
  for (let i = Math.max(0, buffer.length - 65557); i <= buffer.length - 22; i += 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) eocd = i;
  }
  if (eocd < 0) throw new Error('Invalid XLSX file: ZIP end record not found.');

  const centralOffset = buffer.readUInt32LE(eocd + 16);
  const entryCount = buffer.readUInt16LE(eocd + 10);
  let offset = centralOffset;

  for (let i = 0; i < entryCount; i += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('Invalid XLSX central directory.');
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const filenameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const filename = buffer.subarray(offset + 46, offset + 46 + filenameLength).toString('utf8');

    if (!filename.endsWith('/')) {
      if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error('Invalid XLSX local file header.');
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      let data;
      if (compression === 0) data = compressed;
      else if (compression === 8) data = zlib.inflateRawSync(compressed);
      else throw new Error(`Unsupported XLSX compression method: ${compression}`);
      entries.set(filename, data);
    }

    offset += 46 + filenameLength + extraLength + commentLength;
  }
  return entries;
}

function xmlText(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, '')) : '';
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/gi)].map((m) =>
    [...m[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/gi)].map((x) => decodeXml(x[1])).join('')
  );
}

function columnNumber(ref) {
  const letters = ref.match(/^[A-Z]+/i)?.[0]?.toUpperCase() || '';
  let result = 0;
  for (const char of letters) result = result * 26 + char.charCodeAt(0) - 64;
  return result - 1;
}

function parseWorksheet(xml, sharedStrings) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/gi)) {
    const row = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = attrs.match(/\br="([^"]+)"/i)?.[1] || '';
      const type = attrs.match(/\bt="([^"]+)"/i)?.[1] || '';
      const index = ref ? columnNumber(ref) : row.length;
      let value = xmlText(body, 'v');
      if (!value) {
        const inline = xmlText(body, 't');
        value = inline;
      }
      if (type === 's') value = sharedStrings[Number(value)] ?? '';
      else if (type === 'b') value = value === '1' ? 'TRUE' : 'FALSE';
      row[index] = decodeXml(value);
    }
    rows.push(row.map((value) => (value == null ? '' : String(value).trim())));
  }
  return rows;
}

function parseCsv(buffer) {
  const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell.trim()); cell = ''; }
    else if (char === '\n') { row.push(cell.trim()); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  if (cell.length || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ''));
}

function parseXlsx(buffer) {
  const entries = unzipEntries(buffer);
  const workbook = entries.get('xl/workbook.xml');
  const rels = entries.get('xl/_rels/workbook.xml.rels');
  if (!workbook || !rels) throw new Error('Invalid XLSX: workbook metadata is missing.');

  const firstSheet = workbook.toString('utf8').match(/<sheet\b[^>]*r:id="([^"]+)"[^>]*>/i);
  if (!firstSheet) throw new Error('XLSX does not contain a worksheet.');
  const relationId = firstSheet[1];
  const rel = rels.toString('utf8').match(new RegExp(`<Relationship[^>]*Id="${relationId}"[^>]*Target="([^"]+)"[^>]*/?>`, 'i'));
  if (!rel) throw new Error('XLSX worksheet relationship is missing.');
  let target = rel[1].replace(/^\//, '');
  if (!target.startsWith('xl/')) target = `xl/${target}`;

  const sheet = entries.get(target);
  if (!sheet) throw new Error('XLSX worksheet could not be read.');
  const shared = entries.get('xl/sharedStrings.xml');
  return parseWorksheet(sheet.toString('utf8'), parseSharedStrings(shared?.toString('utf8')));
}

function parseSpreadsheet(buffer, filename) {
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  if (extension === '.csv') return parseCsv(buffer);
  if (extension === '.xlsx') return parseXlsx(buffer);
  throw new Error('Only .xlsx and .csv files are supported. Save older .xls files as .xlsx before uploading.');
}

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeHeader);
  if (!headers.includes('name') || !headers.includes('email')) {
    throw new Error('The first worksheet must contain "name" and "email" columns. Optional columns: phone, department.');
  }
  return rows.slice(1).filter((row) => row.some((value) => String(value || '').trim() !== '')).map((row) => {
    const object = {};
    headers.forEach((header, index) => { if (header) object[header] = String(row[index] ?? '').trim(); });
    return object;
  });
}

module.exports = { parseSpreadsheet, rowsToObjects };
