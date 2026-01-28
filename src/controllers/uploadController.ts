import { Request, Response } from 'express';
import { PolicyService } from '../services/policyService';

export const uploadPolicyController = async (req: Request, res: Response) => {
    try {
        const userEmail = req.headers['x-user-email'] as string;
        const authorizedEmail = 'jashwanth.m@winfomi.com';

        if (userEmail !== authorizedEmail) {
            return res.status(403).json({
                success: false,
                reply: "⚠️ You are not authorized to upload or update policy documents. Only Jashwanth M is authorized for this action."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                reply: "❌ No file uploaded. Please select a document to upload."
            });
        }

        const { policyType } = req.body;
        if (!policyType) {
            return res.status(400).json({
                success: false,
                reply: "❌ Policy type not specified. Please specify which policy you are updating."
            });
        }

        console.log(`📄 Processing ${policyType} policy upload from ${userEmail}`);

        const extractedText = await PolicyService.extractText(req.file);
        const result = await PolicyService.updatePolicyFromJson(policyType, extractedText);

        if (result.success) {
            res.json({
                success: true,
                reply: `✅ ${result.message}\n\nthe bot will now use the updated content for further queries.`,
                intent: 'policy_updated'
            });
        } else {
            res.status(500).json({
                success: false,
                reply: `❌ Failed to update policy: ${result.message}`
            });
        }

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            reply: "❌ An error occurred while processing the document upload."
        });
    }
};
