import * as fs from 'fs';
import * as path from 'path';
const lib = require('pdf-parse');
const logPath = path.join(__dirname, 'probe2.log');
fs.writeFileSync(logPath, '');
const log = (msg: string) => { console.log(msg); fs.appendFileSync(logPath, msg + '\n'); }

// Create dummy PDF buffer
const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 12 >>
stream
(Hello World)
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000206 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
265
%%EOF`;
const buffer = Buffer.from(pdfContent);

async function tryCall() {
    log('PDFParse Type: ' + typeof lib.PDFParse);

    if (typeof lib.PDFParse === 'function') {
        try {
            log('Attempting lib.PDFParse(buffer)...');
            const res = await lib.PDFParse(buffer);
            log('Success! Text: ' + (res ? res.text : 'undefined'));
        } catch (e) {
            log('Error calling PDFParse: ' + e);
        }
    } else {
        log('lib.PDFParse is not a function');
    }
}
tryCall();
