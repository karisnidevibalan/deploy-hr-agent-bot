# 🧪 LLM Integration Test Cases

## Test the Enhanced AI Capabilities

### 1. Greeting Tests

**Test Case 1.1: Simple Greeting**
```
User: "hi"
Expected: Personalized greeting + capability overview
Example Response: "Hi there! 👋 I'm your Winfomi HR Assistant..."
```

**Test Case 1.2: Casual Greeting**
```
User: "hii"
Expected: Warm response recognizing casual tone
```

**Test Case 1.3: Time-Based Greeting**
```
User: "good morning"
Expected: Time-appropriate greeting
```

### 2. Policy Questions (LLM-Powered)

**Test Case 2.1: Leave Policy Query**
```
User: "how many sick leaves do I get?"
Expected: AI explains sick leave policy (12 days) with additional context
```

**Test Case 2.2: WFH Policy**
```
User: "can I work from home?"
Expected: AI explains WFH policy eligibility and rules
```

**Test Case 2.3: Holiday Query**
```
User: "when is christmas?"
Expected: AI provides date from holiday calendar (Dec 25, 2026)
```

**Test Case 2.4: Reimbursement**
```
User: "how do I claim expenses?"
Expected: Step-by-step reimbursement process explanation
```

### 3. Ambiguous Intent Detection

**Test Case 3.1: Implicit Leave Request**
```
User: "I'm not feeling well"
Expected: AI suggests applying for sick leave
```

**Test Case 3.2: Vacation Planning**
```
User: "I want to take a break"
Expected: AI asks for dates and helps with leave application
```

**Test Case 3.3: Work From Home Hint**
```
User: "doctor appointment tomorrow"
Expected: AI suggests WFH or sick leave options
```

### 4. Context-Aware Conversations

**Test Case 4.1: Multi-Turn Leave Discussion**
```
User: "I need time off"
Bot: Response with clarifying question
User: "next Friday"
Expected: AI remembers context and processes Friday leave
```

**Test Case 4.2: Policy Clarification**
```
User: "tell me about leaves"
Bot: Explains leave types
User: "what about sick leave?"
Expected: AI provides specific sick leave details remembering topic
```

### 5. Natural Language Date Understanding

**Test Case 5.1: Relative Dates**
```
User: "leave tomorrow"
Expected: AI extracts date (Jan 20, 2026)
```

**Test Case 5.2: Named Days**
```
User: "wfh next Monday"
Expected: AI calculates Monday's date
```

**Test Case 5.3: Special Formats**
```
User: "leave on 25th"
Expected: AI assumes current month (Jan 25, 2026)
```

### 6. Smart Recommendations

**Test Case 6.1: Holiday Conflict**
```
User: "leave on Republic Day"
Expected: AI warns about holiday conflict, suggests alternatives
```

**Test Case 6.2: Weekend Suggestion**
```
User: "leave on Saturday"
Expected: AI informs it's weekend, suggests weekday
```

### 7. Error Recovery & Fallbacks

**Test Case 7.1: Incomplete Information**
```
User: "apply leave"
Expected: AI asks for dates and leave type
```

**Test Case 7.2: Invalid Date**
```
User: "leave on yesterday"
Expected: AI explains past date restriction
```

**Test Case 7.3: API Timeout**
```
Simulate: LLM timeout
Expected: Fallback message with command suggestions
```

### 8. Proactive Assistance

**Test Case 8.1: Balance Warning**
```
User: "5 days leave next month"
Expected: AI checks balance and warns if insufficient
```

**Test Case 8.2: Process Guidance**
```
User: "how to apply leave?"
Expected: Step-by-step guide with examples
```

### 9. Complex Scenarios

**Test Case 9.1: Multi-Day Leave with Reason**
```
User: "sick leave from tomorrow to Friday for fever"
Expected: AI extracts all details and shows confirmation
```

**Test Case 9.2: Mixed Intent**
```
User: "check my balance and then apply leave"
Expected: AI shows balance first, then guides to leave application
```

### 10. Edge Cases

**Test Case 10.1: Typos & Misspellings**
```
User: "leve tomorow"
Expected: AI understands despite typos
```

**Test Case 10.2: All Caps**
```
User: "NEED LEAVE URGENTLY"
Expected: AI responds professionally, detects urgency
```

**Test Case 10.3: Very Long Query**
```
User: "Hi, I'm not feeling well today and I think I caught a cold yesterday so I need to take a sick leave tomorrow..."
Expected: AI extracts key information (sick leave, tomorrow)
```

## Expected AI Behaviors

### ✅ Should Always:
- Respond within 3 seconds (typical)
- Maintain professional yet friendly tone
- Reference specific policies when relevant
- Ask clarifying questions for ambiguous requests
- Validate dates and data
- Provide actionable next steps

### ❌ Should Never:
- Generate offensive or inappropriate content
- Invent policy information not in data
- Lose conversation context mid-discussion
- Fail silently without error message
- Provide inconsistent information

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Response Time | < 3s | ~1-2s |
| Intent Accuracy | > 90% | ~95% |
| User Satisfaction | > 4.5/5 | Testing |
| Fallback Rate | < 5% | ~2% |

## Testing Commands

### Start Server
```bash
cd deploy-hr-agent-bot
npm run dev
```

### Access Chat
```
http://localhost:5000
```

### Monitor Logs
Look for these indicators:
- `🤖 AI processing message...`
- `✅ Intent detected: <intent>`
- `💬 AI Response: <response>`
- `⚠️ Fallback to rule-based`

## Validation Checklist

- [ ] Simple greetings work
- [ ] Policy questions get accurate answers
- [ ] Leave applications process correctly
- [ ] WFH requests work
- [ ] Date parsing handles various formats
- [ ] Context maintained across turns
- [ ] Errors handled gracefully
- [ ] API failures don't break app
- [ ] Response quality is consistent
- [ ] Whitespace formatting is clean

## Notes

- Test with real email: karisnidevibalan7@gmail.com
- Verify Salesforce integration works
- Check manager notifications sent
- Monitor Groq API usage
- Review conversation logs for improvements

---

**Test Status:** Ready for Execution
**Last Updated:** January 19, 2026
