import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'llama3-70b-8192';

export async function callGroqForDate(userMessage: string): Promise<string | undefined> {
  const response = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Extract the leave date or date range (in natural language) from the user's message. Respond ONLY with the date phrase or range, nothing else."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 20,
      temperature: 0
    })
  });

  if (!response.ok) throw new Error('Groq API error');
  const data = await response.json() as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim();
}