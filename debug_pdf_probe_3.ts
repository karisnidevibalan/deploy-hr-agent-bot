import * as fs from 'fs';
import * as path from 'path';

const logPath = path.join(__dirname, 'probe3.log');
fs.writeFileSync(logPath, '');
const log = (msg: string) => { console.log(msg); fs.appendFileSync(logPath, msg + '\n'); }

async function run() {
    try {
        // Try dynamic import to see ESM view
        // Note: ts-node might need setup for this, but let's try
        const mod = await import('pdf-parse');
        log('Import Type: ' + typeof mod);
        log('Import Keys: ' + JSON.stringify(Object.keys(mod)));
        if (mod.default) {
            log('Has default export');
            log('Default Type: ' + typeof mod.default);
        }
    } catch (e) { log('Import error (expected if CJS/ESM mismatch): ' + e); }

    const lib = require('pdf-parse');
    if (lib.PDFParse) {
        try {
            log('PDFParse static keys: ' + JSON.stringify(Object.keys(lib.PDFParse)));
            log('PDFParse prototype keys: ' + JSON.stringify(Object.keys(lib.PDFParse.prototype)));
        } catch (e) { log('Class inspection error: ' + e); }
    }
}
run();
