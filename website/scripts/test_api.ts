import { OpenAI } from 'openai';

const openai = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: 'AIzaSyCRI1N3b-5tJoTeTOY9KHHjb0RewcrBpiI',
});

async function testApi() {
    console.log("Testing Gemini API...");
    try {
        const completion = await openai.chat.completions.create({
            model: 'gemini-1.5-flash',
            messages: [
                { role: 'user', content: "Hello, are you working?" }
            ],
        });
        console.log("Success! Response:", completion.choices[0].message.content);
    } catch (error: any) {
        console.error("API Error:", error);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

testApi();
