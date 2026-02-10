console.log('Start imports...');
try {
    const fs = require('fs');
    console.log('fs ok');
} catch (e) { console.error('fs fail', e); }

try {
    const path = require('path');
    console.log('path ok');
} catch (e) { console.error('path fail', e); }

try {
    const Groq = require("groq-sdk");
    console.log('Groq ok');
} catch (e) { console.error('Groq fail', e); }

try {
    console.log('Req pdf-parse...');
    const pdf = require('pdf-parse');
    console.log('pdf-parse object type:', typeof pdf);
    console.log('pdf-parse keys:', Object.keys(pdf));
    const { PDFParse } = pdf;
    console.log('PDFParse extracted type:', typeof PDFParse);
} catch (e) { console.error('pdf-parse fail', e); }

try {
    const mammoth = require('mammoth');
    console.log('mammoth ok');
} catch (e) { console.error('mammoth fail', e); }
console.log('Imports done.');
