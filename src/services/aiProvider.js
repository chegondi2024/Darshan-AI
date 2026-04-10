import Groq from "groq-sdk";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const hasValidKey = API_KEY && API_KEY.length > 10;

const groq = hasValidKey ? new Groq({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Since this is a client-side Vite project
}) : null;

/**
 * Unified AI Provider to handle sacred temple intelligence using Groq
 */
export const callGroqAi = async ({ systemPrompt, userContext, userPrompt, model = "llama-3.3-70b-versatile" }) => {
    if (!groq) {
        throw new Error("Groq AI Provider not initialized. Missing API Key.");
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `${userContext}\n\nUSER QUERY: ${userPrompt}`
                }
            ],
            model: model,
            temperature: 0.5,
            max_tokens: 2048,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message?.content;
        return JSON.parse(responseContent);
    } catch (error) {
        console.error("Groq AI Service Error:", error);
        throw error;
    }
};

export const isGroqEnabled = () => hasValidKey;
