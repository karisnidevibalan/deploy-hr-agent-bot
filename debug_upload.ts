import { PolicyService } from './src/services/policyService';
import * as fs from 'fs';
import * as path from 'path';

// Mock file object usually provided by Multer
const mockFile = {
    fieldname: 'policyFile',
    originalname: 'test_policy.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: fs.readFileSync(path.join(__dirname, 'test_policy.pdf')), // We need a dummy PDF
    size: 1024
} as Express.Multer.File;

async function testUpload() {
    console.log('🧪 Testing Policy Upload Logic...');

    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY is missing in env!');
        return;
    }

    try {
        console.log('1. Testing PDF Extraction...');
        const text = await PolicyService.extractText(mockFile);
        console.log('✅ Extraction successful. Text length:', text.length);

        console.log('2. Testing AI Update (Leave Policy)...');
        const result = await PolicyService.updatePolicyFromJson('leave', text);

        if (result.success) {
            console.log('✅ Update successful:', result.message);
        } else {
            console.error('❌ Update failed:', result.message);
        }

    } catch (error) {
        console.error('❌ Test failed with exception:', error);
    }
}

// Create a dummy PDF if strictly needed, or just mock the extractText step if pdf-parse is heavy to set up?
// Actually, let's just create a text file mimicking a PDF for the first test to bypass pdf-parse if we can, 
// but PolicyService checks extension.
// Let's create a minimal valid PDF or just rename a text file and see if pdf-parse handles it (probably not).
// Better: Create a dummy PDF with simple content.
const pdfPath = path.join(__dirname, 'test_policy.pdf');
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
<< /Length 55 >>
stream
BT /F1 24 Tf 100 700 Td (This is a test leave policy for debugging.) Tj ET
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
311
%%EOF`;

fs.writeFileSync(pdfPath, Buffer.from(pdfContent));

testUpload();
