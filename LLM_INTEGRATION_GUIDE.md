# 🤖 LLM Integration Guide - HR Agent Bot

## Overview

The HR Agent Bot is now powered by an advanced Large Language Model (LLM) integration using **Groq's Llama 3.3 70B** model, providing intelligent, context-aware responses to user queries while maintaining structured workflows for HR operations.

## 🎯 Key Features

### 1. **Intelligent Intent Detection**
- **AI-Powered Analysis**: Uses LLM to understand user intent even from casual or ambiguous messages
- **Multi-Turn Conversations**: Maintains conversation history for contextual understanding
- **Fallback Logic**: Combines rule-based and AI-based intent detection for reliability

### 2. **Smart Response Generation**
- **Contextual Awareness**: Remembers previous conversation and user profile
- **Policy Integration**: Access to complete leave, WFH, and holiday policies
- **Natural Language**: Responds in a friendly, conversational manner
- **Proactive Suggestions**: Offers relevant actions based on user context

### 3. **Enhanced User Experience**
- **Greeting Intelligence**: Personalized greetings based on user profile
- **Error Recovery**: Graceful handling of API failures with helpful fallbacks
- **Multi-Format Understanding**: Recognizes various date formats, leave types, and informal language
- **Continuous Learning**: Adapts responses based on conversation flow

## 🏗️ Architecture

### AI Service Layer (`src/services/aiService.ts`)

```typescript
class AiService {
  // Main LLM interaction method
  async processMessage(message: string, context?: any): Promise<string>
  
  // Intent analysis with confidence scoring
  async analyzeUserIntent(message: string, context?: any): Promise<IntentResult>
  
  // Rule-based fallback intent detection
  detectIntent(message: string): string
}
```

### Integration Points

1. **Email Verification Flow**: Enhanced greeting after successful login
2. **Intent Detection**: Smart routing to appropriate handlers
3. **General Queries**: AI-powered responses for HR policy questions
4. **Fallback Handler**: Catches all unhandled queries with intelligent responses
5. **Greeting Handler**: Personalized welcomes and help offers

## 🔧 Configuration

### Environment Variables

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### LLM Parameters

```typescript
{
  model: "llama-3.3-70b-versatile",
  temperature: 0.6,        // Lower = more consistent
  max_tokens: 800,         // Response length limit
  top_p: 0.95,            // Nucleus sampling
  frequency_penalty: 0.3,  // Reduce repetition
  presence_penalty: 0.1    // Encourage diversity
}
```

## 📊 Supported Intents

| Intent | Description | Example |
|--------|-------------|---------|
| `greeting` | Simple greetings | "hi", "hello", "good morning" |
| `apply_leave` | Leave application | "I need leave tomorrow" |
| `apply_wfh` | WFH request | "wfh on Friday for doctor appointment" |
| `leave_balance` | Check remaining leaves | "how many leaves do I have?" |
| `holiday_list` | View holidays | "show me holiday calendar" |
| `leave_policy` | Policy questions | "what's the leave policy?" |
| `wfh_policy` | WFH policy queries | "tell me about wfh rules" |
| `reimbursement_info` | Reimbursement queries | "how to claim expenses?" |
| `view_requests` | List existing requests | "show my leave requests" |
| `general_query` | Any other HR query | AI-powered response |

## 🎨 System Prompt Design

The AI is trained with comprehensive context including:

### Knowledge Base
- ✅ Complete leave policy (Annual, Sick, Casual, Maternity, Paternity)
- ✅ 2026 Holiday calendar with all company holidays
- ✅ WFH policy with eligibility and restrictions
- ✅ Current date context (January 19, 2026)

### Personality Traits
- 🤝 Warm and friendly like an HR colleague
- 💼 Professional and knowledgeable
- 🎯 Proactive with helpful suggestions
- 🧠 Context-aware and remembers conversation
- ✨ Clear and concise communication

### Response Guidelines
- Keep responses 2-4 sentences for simple queries
- Use bullet points for structured information
- Validate dates and provide specific policy details
- Ask clarifying questions when information is incomplete
- Suggest related actions proactively

## 🔄 Conversation Flow

```
User: "hii"
  ↓
AI detects: greeting intent
  ↓
Generates: Personalized welcome + capability overview
  ↓
User: "I need leave tomorrow"
  ↓
AI understands: apply_leave intent + extracts date
  ↓
System: Validates date, checks balance, shows confirmation
  ↓
User: "yes"
  ↓
System: Creates Salesforce record + notifies manager
```

## 💡 Smart Features

### 1. Context-Aware Responses
```typescript
// Passes rich context to LLM
{
  history: last5Messages,
  employeeName: "John Doe",
  employeeEmail: "john@winfomi.com",
  sessionId: "unique-session-id"
}
```

### 2. Intelligent Fallbacks
- ✅ Rate limit handling with retry suggestions
- ✅ Timeout recovery with simpler command options
- ✅ API failure graceful degradation
- ✅ Rule-based fallback when AI unavailable

### 3. Response Enhancement
```typescript
// Auto-adds helpful suggestions for short/generic responses
if (response.length < 50) {
  response += "\n\n💡 Quick Actions:\n• Apply for leave\n• Check holiday list\n• View leave balance";
}
```

### 4. Multi-Format Date Understanding
The AI recognizes various date formats:
- Natural: "tomorrow", "next Friday", "day after tomorrow"
- Numeric: "25.12.2026", "12/25/2026", "2026-12-25"
- Textual: "25th December", "Dec 25", "Christmas Day"

## 🧪 Testing the Integration

### Test Scenarios

1. **Simple Greeting**
   ```
   User: "hi"
   Expected: Warm greeting + capability overview
   ```

2. **Policy Question**
   ```
   User: "how many sick leaves do I get?"
   Expected: AI explains sick leave policy (12 days)
   ```

3. **Ambiguous Request**
   ```
   User: "I'm not feeling well"
   Expected: AI suggests applying for sick leave
   ```

4. **Multi-Turn Conversation**
   ```
   User: "I need time off"
   Bot: "When would you like to take leave?"
   User: "next week Monday"
   Expected: AI remembers context and processes request
   ```

## 📈 Performance Optimization

### Response Speed
- Average LLM response time: 1-3 seconds
- Cached policy data for faster access
- Parallel processing where possible
- Timeout handling: 30 seconds max

### Token Efficiency
- System prompt: ~1500 tokens
- Context history: 5 messages max
- Response limit: 800 tokens
- Monthly estimate: ~1M tokens for 1000 users

## 🔒 Security & Privacy

- ✅ API keys stored in environment variables
- ✅ No sensitive user data sent to LLM beyond name/email
- ✅ Conversation history limited to session only
- ✅ No storage of LLM responses
- ✅ Sanitized inputs to prevent prompt injection

## 🚀 Future Enhancements

1. **Advanced Analytics**
   - Intent confidence scoring
   - Response quality metrics
   - User satisfaction tracking

2. **Personalization**
   - Learn from user preferences
   - Customize response style per user
   - Remember frequent requests

3. **Proactive Assistance**
   - Remind about expiring leaves
   - Suggest optimal leave dates
   - Holiday planning suggestions

4. **Multi-Language Support**
   - Detect user language preference
   - Respond in preferred language
   - Policy translation

## 📚 API Reference

### AiService Methods

#### `processMessage(message, context)`
Main LLM interaction for generating intelligent responses.

**Parameters:**
- `message` (string): User's input message
- `context` (object): Optional conversation context
  - `history`: Array of previous messages
  - `employeeName`: Current user's name
  - `employeeEmail`: Current user's email

**Returns:** Promise<string> - AI-generated response

**Example:**
```typescript
const response = await aiService.processMessage(
  "How many annual leaves do I have?",
  {
    history: conversationHistory,
    employeeName: "John Doe",
    employeeEmail: "john@winfomi.com"
  }
);
```

#### `analyzeUserIntent(message, context)`
Deep intent analysis with confidence scoring.

**Returns:**
```typescript
{
  intent: string,           // Primary detected intent
  confidence: number,       // 0.0 to 1.0
  suggestedActions: string[] // Recommended next steps
}
```

#### `detectIntent(message)`
Fast rule-based intent detection (fallback).

**Returns:** string - Detected intent type

## 🛠️ Troubleshooting

### Common Issues

1. **LLM Not Responding**
   - Check GROQ_API_KEY in .env
   - Verify API quota not exceeded
   - Check network connectivity

2. **Generic Responses**
   - Ensure conversation history is passed
   - Verify system prompt includes policies
   - Check temperature parameter (0.6 optimal)

3. **Slow Response Times**
   - Reduce max_tokens if needed
   - Minimize context history length
   - Consider caching common queries

## 📞 Support

For issues or questions about the LLM integration:
- Check logs in terminal for error details
- Review system prompt in `aiService.ts`
- Test with simplified queries first
- Contact development team if persistent issues

---

**Last Updated:** January 19, 2026
**Model Version:** Llama 3.3 70B Versatile
**Integration Status:** ✅ Fully Operational
