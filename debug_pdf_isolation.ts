import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');
const pdf = pdfParse.default || pdfParse;

async function testPdf() {
    console.log('Testing PDF Parse...');
    console.log('PDF Export Type:', typeof pdfParse);
    console.log('PDF Export Keys:', JSON.stringify(Object.keys(pdfParse)));
    console.log('Is pdf a function?', typeof pdf === 'function');

    // Create dummy PDF
    const pdfPath = path.join(__dirname, 'test_policy.pdf');
    // Using a minimal valid PDF binary string or just a text file renamed to .pdf to test robust parsing, 
    // but pdf-parse is strict. 
    // Let's assume we fallback to text if pdf-parse fails in real app? 
    // No, real app assumes valid PDF. 

    // Minimal Valid PDF structure
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
    fs.writeFileSync(pdfPath, Buffer.from(pdfContent));
    try {
        const buffer = Buffer.from(pdfContent); // Use the created content directly
        const data = await pdf(buffer);
        console.log('PDF Text:', data.text);
    } catch (e) {
        console.error('PDF Parse Error:', e);
        if (e instanceof Error) {
            fs.writeFileSync('error.log', e.stack || e.message);
        } else {
            fs.writeFileSync('error.log', JSON.stringify(e));
        }
    }
}
testPdf();
