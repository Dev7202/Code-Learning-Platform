// import { GoogleGenAI } from '@google/genai';

// const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// export async function generateWithGemini(prompt, model = 'gemini-2.0-flash-001') {
//     try {
//         const response = await genAI.models.generateContent({ model, contents: prompt });
//         return response.text;
//     } catch (error) {
//         console.error('Gemini API Error:', error);
//         throw new Error('Failed to generate content with Gemini');
//     }
// }

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateWithGroq(prompt) {
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant. When asked to return JSON, return ONLY valid JSON with no markdown, no backticks, no extra text.',
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 8000,
        });

        let text = response.choices[0].message.content;
        text = text.trim()
            .replace(/^```[a-z]*\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        return text;
    } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error('Failed to generate content');
    }
}