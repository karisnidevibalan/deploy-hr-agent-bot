import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

async function testGroq() {
    console.log('Testing Groq API...');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say hello in JSON format {"greeting": "hello"}' }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });
        console.log('Groq Response:', chatCompletion.choices[0]?.message?.content);
    } catch (e) {
        console.error('Groq Error:', e);
    }
}

testGroq();
