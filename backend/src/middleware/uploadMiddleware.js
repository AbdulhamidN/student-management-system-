/**
 * Small dependency-free multipart/form-data parser used by the admin Excel import.
 * It intentionally supports one uploaded file plus normal text fields.
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function uploadSingle(fieldName) {
  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      return res.status(400).json({ success: false, message: 'multipart/form-data is required.' });
    }

    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      return res.status(400).json({ success: false, message: 'Multipart boundary is missing.' });
    }

    const boundary = boundaryMatch[1] || boundaryMatch[2];
    const chunks = [];
    let total = 0;
    const maxBody = MAX_FILE_SIZE + 512 * 1024;

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBody) {
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('error', next);
    req.on('end', () => {
      try {
        if (total > maxBody) {
          return res.status(413).json({ success: false, message: 'Upload is too large. Maximum file size is 5 MB.' });
        }

        const body = Buffer.concat(chunks);
        const delimiter = Buffer.from(`--${boundary}`);
        const parts = [];
        let cursor = 0;

        while (true) {
          const start = body.indexOf(delimiter, cursor);
          if (start === -1) break;
          const partStart = start + delimiter.length;
          const nextBoundary = body.indexOf(delimiter, partStart);
          if (nextBoundary === -1) break;

          const part = body.subarray(partStart, nextBoundary);
          cursor = nextBoundary;
          if (!part.length) continue;

          let clean = part;
          if (clean.subarray(0, 2).equals(Buffer.from('\r\n'))) clean = clean.subarray(2);
          if (clean.subarray(clean.length - 2).equals(Buffer.from('\r\n'))) clean = clean.subarray(0, -2);
          if (!clean.length) continue;

          const separator = Buffer.from('\r\n\r\n');
          const headerEnd = clean.indexOf(separator);
          if (headerEnd === -1) continue;

          const headerText = clean.subarray(0, headerEnd).toString('utf8');
          const content = clean.subarray(headerEnd + separator.length);
          const headers = {};
          headerText.split('\r\n').forEach((line) => {
            const index = line.indexOf(':');
            if (index > 0) headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
          });

          const disposition = headers['content-disposition'] || '';
          const nameMatch = disposition.match(/name="([^"]+)"/i);
          const filenameMatch = disposition.match(/filename="([^"]*)"/i);
          if (!nameMatch) continue;

          const name = nameMatch[1];
          if (filenameMatch) {
            if (name !== fieldName) continue;
            const originalname = filenameMatch[1].split(/[/\\]/).pop();
            if (content.length > MAX_FILE_SIZE) {
              return res.status(413).json({ success: false, message: 'File is too large. Maximum file size is 5 MB.' });
            }
            req.file = {
              fieldname: name,
              originalname,
              mimetype: headers['content-type'] || 'application/octet-stream',
              size: content.length,
              buffer: Buffer.from(content),
            };
          } else {
            req.body = req.body || {};
            req.body[name] = content.toString('utf8');
          }
        }

        if (!req.file) {
          return res.status(400).json({ success: false, message: `Upload field "${fieldName}" is required.` });
        }
        next();
      } catch (error) {
        next(error);
      }
    });
  };
}

module.exports = { single: uploadSingle, MAX_FILE_SIZE };
