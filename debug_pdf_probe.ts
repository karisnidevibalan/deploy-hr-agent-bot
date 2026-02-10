import * as fs from 'fs';
import * as path from 'path';

const lib = require('pdf-parse');
const logPath = path.join(__dirname, 'probe.log');
fs.writeFileSync(logPath, '');

const log = (msg: string) => fs.appendFileSync(logPath, msg + '\n');

try { log('Type: ' + typeof lib); } catch (e) { log('Type err: ' + e); }
try { log('Keys: ' + JSON.stringify(Object.keys(lib))); } catch (e) { log('Keys err: ' + e); }

if (lib && typeof lib === 'object') {
    if (lib.default) {
        log('Has .default');
        log('Default Type: ' + typeof lib.default);
        try { log('Default Keys: ' + JSON.stringify(Object.keys(lib.default))); } catch (e) { }
    }
}
