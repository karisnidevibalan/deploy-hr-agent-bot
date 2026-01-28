import * as fs from 'fs';
import * as path from 'path';
import Groq from "groq-sdk";
const pdf = require('pdf-parse');
import mammoth from 'mammoth';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export class PolicyService {
    private static dataDir = (() => {
        const paths = [
            path.join(process.cwd(), 'src', 'data'),
            path.join(process.cwd(), 'dist', 'src', 'data'),
            path.join(process.cwd(), 'data')
        ];
        const existingPath = paths.find(p => fs.existsSync(p));
        const finalPath = existingPath || path.join(process.cwd(), 'data');

        // Ensure the directory exists
        if (!fs.existsSync(finalPath)) {
            fs.mkdirSync(finalPath, { recursive: true });
        }
        return finalPath;
    })();

    static async extractText(file: Express.Multer.File): Promise<string> {
        const extension = path.extname(file.originalname).toLowerCase();

        if (extension === '.pdf') {
            const data = await pdf(file.buffer);
            return data.text;
        } else if (extension === '.docx' || extension === '.doc') {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            return result.value;
        } else {
            // Assume text-based format
            return file.buffer.toString('utf8');
        }
    }

    static async updatePolicyFromJson(policyType: string, text: string): Promise<{ success: boolean; message: string }> {
        try {
            let schema = '';
            let fileName = '';

            switch (policyType.toLowerCase()) {
                case 'leave':
                    fileName = 'leavePolicy.json';
                    schema = `
            {
              "companyName": "string",
              "effectiveDate": "string",
              "leaveTypes": {
                "annual": { "name": "string", "entitlement": number, "accrualRate": "string", "carryForward": "string", "encashment": "string" },
                "sick": { "name": "string", "entitlement": number, "documentation": "string", "carryForward": "string" },
                "casual": { "name": "string", "entitlement": number, "minimumNotice": "string", "restrictions": "string" },
                "maternity": { "name": "string", "entitlement": number, "eligibility": "string", "benefits": "string" },
                "paternity": { "name": "string", "entitlement": number, "eligibility": "string", "timeframe": "string" }
              },
              "applicationProcess": { "advance": "string", "emergency": "string", "approval": "string", "documentation": "string" },
              "policies": { "probation": "string", "sandwich": "string", "halfDay": "string", "compensation": "string" }
            }
          `;
                    break;
                case 'holiday':
                    fileName = 'holidays.json';
                    schema = `
            {
              "year": number,
              "holidays": [
                { "date": "YYYY-MM-DD", "name": "string", "day": "string", "type": "string" }
              ]
            }
          `;
                    break;
                case 'wfh':
                    fileName = 'wfhPolicy.json';
                    schema = `
            {
              "policyName": "string",
              "eligibility": "string",
              "limitations": "string",
              "approvalProcess": "string",
              "requirements": ["string"]
            }
          `;
                    break;
                case 'reimbursement':
                    fileName = 'reimbursement-policy.json';
                    schema = `
            {
              "policyName": "string",
              "categories": [
                { "name": "string", "limit": "string", "requirements": "string" }
              ],
              "submissionTimeline": "string",
              "approvalWorkflow": "string"
            }
          `;
                    break;
                default:
                    return { success: false, message: 'Invalid policy type' };
            }

            const prompt = `
        You are an expert HR data analyst. 
        Transform the following policy text into a structured JSON format matching this schema:
        ${schema}

        IMPORTANT:
        1. Keep descriptions concise but accurate.
        2. Ensure all fields in the schema are present.
        3. If some information is missing, use sensible defaults or "Not specified".
        4. Return ONLY the JSON object, no other text.

        Policy Text:
        ${text}
      `;

            const response = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                response_format: { type: "json_object" }
            });

            const updatedJson = JSON.parse(response.choices[0]?.message?.content || '{}');

            // Use year-specific filename for holidays if applicable
            if (policyType.toLowerCase() === 'holiday' && updatedJson.year) {
                fileName = `holidays_${updatedJson.year}.json`;
            }

            const filePath = path.join(this.dataDir, fileName);
            fs.writeFileSync(filePath, JSON.stringify(updatedJson, null, 2));

            return { success: true, message: `Successfully updated ${policyType} policy.` };

        } catch (error) {
            console.error('Error updating policy:', error);
            return { success: false, message: `Error updating policy: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
    }

    static getPolicy(fileName: string): any {
        const filePath = path.join(this.dataDir, fileName);
        try {
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
        } catch (error) {
            console.error(`Error loading policy ${fileName}:`, error);
        }
        // Fallback for holidays if specific file not found
        if (fileName === 'holidays.json') {
            return this.getAllHolidays();
        }
        return {};
    }

    static getAllHolidays(): any {
        try {
            const files = fs.readdirSync(this.dataDir);
            const holidayFiles = files.filter(f => f.startsWith('holidays') && f.endsWith('.json'));

            let allHolidays: any[] = [];
            let latestYear = 0;

            holidayFiles.forEach(file => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(this.dataDir, file), 'utf8'));
                    if (data.holidays) {
                        allHolidays = allHolidays.concat(data.holidays);
                    }
                    if (data.year > latestYear) {
                        latestYear = data.year;
                    }
                } catch (e) {
                    console.error(`Error reading holiday file ${file}:`, e);
                }
            });

            // Remove duplicates (unique by date and name)
            const uniqueHolidays = Array.from(new Map(allHolidays.map(h => [`${h.date}-${h.name}`, h])).values());

            return {
                year: latestYear || new Date().getFullYear(),
                holidays: uniqueHolidays.sort((a, b) => a.date.localeCompare(b.date))
            };
        } catch (error) {
            console.error('Error getting all holidays:', error);
            return { holidays: [] };
        }
    }
}
