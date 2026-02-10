import * as path from 'path';
import Groq from "groq-sdk";
const { PDFParse } = require('pdf-parse');
import mammoth from 'mammoth';
import { SalesforceService } from './salesforceService';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export class PolicyService {
    private static salesforceService = new SalesforceService();

    static async extractText(file: Express.Multer.File): Promise<string> {
        const extension = path.extname(file.originalname).toLowerCase();

        if (extension === '.pdf') {
            const parser = new PDFParse({ data: file.buffer });
            const data = await parser.getText();
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
            let existingData: any = null;

            switch (policyType.toLowerCase()) {
                case 'leave':
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

            // Fetch existing policy from Salesforce (except for Holidays initially, logic preserved)
            // Actually, with Salesforce we can query without knowing the file name. 
            // But for Holidays, we need the YEAR to find the exact record.
            // Simplified: Fetch latest policy of this type to give context.
            if (policyType.toLowerCase() !== 'holiday') {
                try {
                    existingData = await this.salesforceService.getPolicy(policyType);
                    if (existingData) {
                        console.log(`🔹 Found existing ${policyType} policy in Salesforce to merge.`);
                    }
                } catch (e) {
                    console.warn(`⚠️ Failed to read existing ${policyType} policy, starting fresh.`);
                }
            }

            const prompt = `
        You are an expert HR data analyst. 
        Update the following policy data with information from the new document text.
        
        Target Schema:
        ${schema}

        Existing Data (JSON):
        ${existingData ? JSON.stringify(existingData) : "null (No existing data, generate fresh)"}

        New Document Text:
        ${text}

        Instructions:
        1. Merge the new information into the Existing Data following the Target Schema.
        2. If Existing Data is present, PRESERVE it unless the New Document explicitly contradicts or updates it.
        3. ADD new fields or records found in the New Document.
        4. For 'holidays', if the New Document contains a different year than existing files, just extract the new year's data.
        5. Return ONLY the merged/updated JSON object.
      `;

            const response = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                response_format: { type: "json_object" }
            });

            const updatedJson = JSON.parse(response.choices[0]?.message?.content || '{}');
            let year = undefined;

            // Handling Holidays Year-Specific Merging
            if (policyType.toLowerCase() === 'holiday' && updatedJson.year) {
                year = updatedJson.year;
                // Check if holiday policy for this year already exists in Salesforce
                const existingYearData = await this.salesforceService.getPolicy('Holiday', year);

                if (existingYearData && existingYearData.holidays && Array.isArray(existingYearData.holidays)) {
                    // Merge arrays
                    const newHolidays = updatedJson.holidays || [];
                    const mergedHolidays = [...existingYearData.holidays, ...newHolidays];
                    // Deduplicate
                    const unique = Array.from(new Map(mergedHolidays.map((h: any) => [`${h.date}-${h.name}`, h])).values());
                    updatedJson.holidays = unique;
                    console.log(`🔹 Merged with existing Holiday policy for year ${year}.`);
                }
            }

            // Save to Salesforce
            const saveResult = await this.salesforceService.savePolicy(policyType, updatedJson, year);

            if (!saveResult.success) {
                return { success: false, message: `Failed to save policy to Salesforce: ${saveResult.message}` };
            }

            return { success: true, message: `Successfully updated ${policyType} policy in Salesforce.` };

        } catch (error) {
            console.error('Error updating policy:', error);
            return { success: false, message: `Error updating policy: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
    }

    static async getPolicy(fileNameOrType: string): Promise<any> {
        // Map filename/type to Salesforce policy lookup
        let policyType = '';
        let year: number | undefined = undefined;

        const lowerName = fileNameOrType.toLowerCase();

        if (lowerName === 'leavepolicy.json' || lowerName === 'leave') policyType = 'Leave';
        else if (lowerName === 'wfhpolicy.json' || lowerName === 'wfh') policyType = 'WFH';
        else if (lowerName === 'reimbursement-policy.json' || lowerName === 'reimbursement') policyType = 'Reimbursement';
        else if (lowerName === 'holidays.json' || lowerName === 'holiday') {
            // Special case: "holidays.json" usually implies "all holidays" or "current year"
            return await this.getAllHolidays();
        }
        else if (lowerName.startsWith('holidays_')) {
            // e.g. holidays_2026.json
            const match = lowerName.match(/holidays_(\d+)/);
            if (match) {
                policyType = 'Holiday';
                year = parseInt(match[1]);
            }
        }

        if (policyType) {
            const data = await this.salesforceService.getPolicy(policyType, year);
            return data || {}; // Return empty object if not found to match previous behavior
        }

        return {};
    }

    static async getAllHolidays(): Promise<any> {
        try {
            const allpolicies = await this.salesforceService.getAllHolidayPolicies();

            let allHolidays: any[] = [];

            allpolicies.forEach(data => {
                if (data.holidays) {
                    allHolidays = allHolidays.concat(data.holidays);
                }
            });

            // Remove duplicates (unique by date and name)
            const uniqueHolidays = Array.from(new Map(allHolidays.map(h => [`${h.date}-${h.name}`, h])).values());

            return {
                holidays: uniqueHolidays.sort((a: any, b: any) => a.date.localeCompare(b.date))
            };
        } catch (error) {
            console.error('Error getting all holidays:', error);
            return { holidays: [] };
        }
    }
}
