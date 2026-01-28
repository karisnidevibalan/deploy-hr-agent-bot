import Groq from "groq-sdk";
import * as fs from 'fs';
import * as path from 'path';
import entityExtractor from '../utils/entityExtractor';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

import { PolicyService } from './policyService';

export type IntentResult = {
  intent: string;
  entities?: {
    type?: "leave" | "wfh" | "both";
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    period?: "this_month" | "this_year" | "custom";
    month?: string | number;
    year?: number;
    week?: number;
    reason?: string;
  };
  confidence?: number;
};

export class AiService {
  private buildSystemPrompt(conversationContext?: string): string {
    const contextInfo = conversationContext ? `\n\nConversation Context:\n${conversationContext}` : '';

    const leavePolicy = PolicyService.getPolicy('leavePolicy.json');
    const holidays = PolicyService.getAllHolidays();
    const wfhPolicy = PolicyService.getPolicy('wfhPolicy.json');
    const reimbursementPolicy = PolicyService.getPolicy('reimbursement-policy.json');

    return `You are Winfomi HR Assistant, an intelligent AI-powered HR chatbot for Winfomi Technologies.

**Your Core Mission:**
Provide exceptional, personalized HR support by understanding employee needs, answering questions accurately, and proactively guiding them through HR processes.

**Available Company Policies & Data**:
- Leave Policy: ${JSON.stringify(leavePolicy, null, 2)}
- Holiday Calendar: ${JSON.stringify(holidays, null, 2)}
- WFH Policy: ${JSON.stringify(wfhPolicy, null, 2)}
- Reimbursement Policy: ${JSON.stringify(reimbursementPolicy, null, 2)}

**Key Capabilities:**
1. **Intelligent Query Understanding**: Understand user intent even from casual or ambiguous messages
2. **Policy Expertise**: Answer questions about leaves (Annual, Sick, Casual), WFH policies, holidays, and reimbursements
3. **Proactive Assistance**: Guide users step-by-step through leave/WFH applications
4. **Context Awareness**: Remember previous conversation and provide personalized responses
5. **Smart Recommendations**: Suggest optimal dates avoiding holidays/weekends, alternative solutions

**Response Guidelines:**
- Be warm, friendly, and professional - like a helpful HR colleague
- Keep responses concise (2-4 sentences for simple queries, more for complex topics)
- Use emojis sparingly but effectively (✅ ❌ 📅 🏖️ 💼)
- Structure information with bullet points for clarity
- Always validate dates and provide specific policy details when relevant
- If information is incomplete, ask clarifying questions naturally
- Proactively mention related information that might be helpful

**Smart Actions You Can Suggest:**
- "Check your leave balance" - View remaining leaves by type
- "View holiday calendar" - See all company holidays
- "Apply for leave" - Start leave request with date validation
- "Request WFH" - Submit work-from-home request
- "View my requests" - See all pending/approved requests
- "Check leave policy" - Get detailed leave policy information

**Special Intelligence:**
- Detect when users want to apply for leave even if they don't say "apply"
- Understand date formats: "tomorrow", "next Friday", "25th Dec", "12.03.${new Date().getFullYear()}"
- Recognize leave types from context: "sick leave", "vacation", "medical"
- Handle multi-turn conversations naturally
- Provide alternatives when requests aren't feasible (e.g., holiday conflicts)

**Current Date Context:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${contextInfo}

**Important:** Always be helpful and never say you cannot assist. If you don't have specific information, guide users to the right resource or HR contact.`;
  }

  async processMessage(message: string, context?: any): Promise<string> {
    try {
      console.log('🤖 AI processing message:', message.substring(0, 50) + '...');

      // Build rich conversation context from history
      let conversationContext = '';
      if (context?.history && context.history.length > 0) {
        conversationContext = context.history
          .slice(-5) // Last 5 messages for better context
          .map((h: any) => `User: ${h.message}\nDetected Intent: ${h.intent}`)
          .join('\n---\n');
      }

      // Add user profile context if available
      if (context?.employeeName) {
        conversationContext += `\n\nEmployee Name: ${context.employeeName}`;
      }
      if (context?.employeeEmail) {
        conversationContext += `\nEmployee Email: ${context.employeeEmail}`;
      }

      const systemPrompt = this.buildSystemPrompt(conversationContext);

      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6, // Slightly lower for more consistent responses
        max_tokens: 800,
        top_p: 0.95,
        frequency_penalty: 0.3, // Reduce repetition
        presence_penalty: 0.1
      });

      const aiResponse = response.choices[0]?.message?.content;

      if (!aiResponse) {
        console.log('⚠️ AI returned empty response');
        return "I apologize, I couldn't generate a proper response. Could you rephrase your question?";
      }

      console.log('✅ AI response generated successfully');

      // Clean up any markdown formatting issues
      return aiResponse.trim();

    } catch (error) {
      console.error('🚨 AI Service Error:', error);

      // Provide intelligent fallback responses
      if (error instanceof Error) {
        if (error.message.includes('rate_limit')) {
          return "I'm currently experiencing high traffic. Please wait a moment and try again. In the meantime, you can:\n• Type 'leave policy' for policy details\n• Type 'holiday list' to see company holidays";
        } else if (error.message.includes('timeout')) {
          return "The request took too long to process. Please try asking in a simpler way or use specific commands like 'apply for leave' or 'check leave balance'.";
        } else if (error.message.includes('api_key') || error.message.includes('authentication')) {
          return "I'm having trouble connecting to my AI service. Please contact IT support or try basic commands like 'holiday list' or 'leave policy'.";
        }
      }

      return "I encountered an unexpected error. Please try:\n• Rephrasing your question\n• Using specific commands like 'apply for leave' or 'holiday list'\n• Contacting HR if you need immediate assistance";
    }
  }

  detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    // 1. Explicit Request Listing (Prioritized)
    if (lowerMessage.includes('show my requests') || lowerMessage.includes('view my requests') ||
      lowerMessage.includes('list my requests') || lowerMessage.includes('my applications') ||
      (lowerMessage.includes('view') && lowerMessage.includes('request')) ||
      (lowerMessage.includes('show') && lowerMessage.includes('request'))) {
      return 'view_requests';
    }

    // 2. Enhanced greeting detection
    const greetingPatterns = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hii', 'hiii', 'helo', 'greetings'];
    const isShortGreeting = greetingPatterns.some(pattern => {
      const words = lowerMessage.trim().split(/\s+/);
      return words.length <= 3 && lowerMessage.includes(pattern);
    });
    if (isShortGreeting) return 'greeting';

    // 3. Enhanced WFH detection
    const wfhKeywords = ['wfh', 'work from home', 'working from home', 'remote work', 'wfh request'];
    if (wfhKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const policyPatterns = ['policy', 'policies', 'what is', 'explain', 'rules', 'procedure', 'how to', 'how can', 'details', 'guidelines'];
      if (policyPatterns.some(pattern => lowerMessage.includes(pattern))) return 'wfh_policy';
      return 'apply_wfh';
    }

    // 4. Enhanced leave detection
    const hasLeaveKeyword = lowerMessage.includes('leave') || lowerMessage.includes('holiday');
    if (hasLeaveKeyword) {
      if (['balance', 'remaining', 'left', 'available', 'check leave', 'status', 'how many', 'count'].some(k => lowerMessage.includes(k))) return 'leave_balance';
      if (['policy', 'what is', 'explain', 'rules'].some(k => lowerMessage.includes(k))) return 'leave_policy';

      const applicationIndicators = ['apply', 'want', 'need', 'take', 'request', 'submit', 'tomorrow', 'next week'];
      const hasDatePattern = /\d{1,2}(th|st|nd|rd)/i.test(lowerMessage) || /\d{1,2}[.\-/]\d{1,2}/.test(lowerMessage);
      if (applicationIndicators.some(indicator => lowerMessage.includes(indicator)) || hasDatePattern) return 'apply_leave';
    }

    if (lowerMessage.includes('holiday') && (lowerMessage.includes('list') || lowerMessage.includes('calendar') || lowerMessage.includes('show'))) return 'holiday_list';
    if (lowerMessage.includes('reimbursement') || lowerMessage.includes('reimburse') || lowerMessage.includes('claim')) return 'reimbursement_info';

    return 'general_query';
  }

  async analyzeUserIntent(message: string, context?: any): Promise<{ intent: string; confidence: number; entities?: any; suggestedActions?: string[] }> {
    // 1. Rule-Based Intent Detection
    const detectedIntent = this.detectIntent(message);

    // 2. Aggressive Fast-Track (Bypass AI for simple requests OR requests with clear entities)
    if (['view_requests', 'holiday_list', 'greeting'].includes(detectedIntent)) {
      return { intent: detectedIntent, confidence: 1.0, entities: {}, suggestedActions: [] };
    }

    // 3. Rule-based extraction (Check if we can fulfill without AI)
    let ruleEntities: any = {};
    if (detectedIntent === 'apply_leave') {
      const details = entityExtractor.extractLeaveDetails(message);
      if (details.startDate) {
        ruleEntities = {
          startDate: details.startDate,
          endDate: details.endDate,
          leaveType: details.leaveType,
          reason: details.reason
        };
        // If we have a date, fast-track to avoid 429
        console.log(`🚀 Fast-tracking ${detectedIntent} (date found via rules)`);
        return { intent: detectedIntent, confidence: 0.9, entities: ruleEntities, suggestedActions: [] };
      }
    } else if (detectedIntent === 'apply_wfh') {
      const details = entityExtractor.extractWfhDetails(message);
      if (details.date) {
        ruleEntities = { date: details.date, reason: details.reason };
        console.log(`🚀 Fast-tracking ${detectedIntent} (date found via rules)`);
        return { intent: detectedIntent, confidence: 0.9, entities: ruleEntities, suggestedActions: [] };
      }
    }

    // 4. AI Analysis (only if not fast-tracked)
    try {
      const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const prompt = `You are an HR assistant. 
Current Date: ${currentDate}

Your job is to:
1. Carefully understand the user's query, even if it is phrased in an unusual or indirect way.
2. Map the user's request to the closest system intent keyword.
3. Extract relevant entities like dates (standardize to YYYY-MM-DD), leave types, and reasons.
4. IMPORTANT: If a year is not specified, use the year from the Current Date (${currentDate}). Do NOT use past years like 2024 or 2025 unless explicitly mentioned.
5. Output the normalized intent and extracted data.

User Query: "${message}"

System Intents:
- apply_leave: User wants to request time off
- apply_wfh: User wants to work from home
- leave_balance: Check remaining leaves
- holiday_list: View company holidays
- leave_policy: Questions about leave policies
- wfh_policy: Questions about WFH policies
- reimbursement_info: Questions about reimbursements
- view_requests: See existing leave/WFH requests
- general_query: General HR question
- greeting: Simple greeting or small talk

Respond in JSON ONLY:
{
    "intent": "<primary_intent>",
    "confidence": <0.0-1.0>,
    "entities": {"date": "YYYY-MM-DD", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "leaveType": "ANNUAL|SICK|CASUAL", "reason": "..."},
    "suggestedActions": ["action1", "action2"]
}`;

      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
      return {
        intent: analysis.intent || detectedIntent,
        confidence: analysis.confidence || 0.5,
        entities: analysis.entities || {},
        suggestedActions: analysis.suggestedActions || []
      };
    } catch (error: any) {
      console.error('Intent analysis error:', error?.message || error);

      // 5. Intelligent Fallback (Rule detection + regex extraction)
      console.log(`📉 Falling back to rule-based intent: ${detectedIntent}`);

      let finalEntities = {};
      if (detectedIntent === 'apply_leave') finalEntities = entityExtractor.extractLeaveDetails(message);
      else if (detectedIntent === 'apply_wfh') finalEntities = entityExtractor.extractWfhDetails(message);

      return {
        intent: detectedIntent,
        confidence: 0.6,
        entities: finalEntities,
        suggestedActions: []
      };
    }
  }

  parseQuery(query: string): any {
    return { intent: this.detectIntent(query), originalQuery: query };
  }

  generateResponse(parsedQuery: any): string {
    return "Response generated based on parsed query";
  }
}