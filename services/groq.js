import axios from 'axios';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const sendMessage = async (systemPrompt, messages) => {
  const response = await axios.post(
    GROQ_API_URL,
    {
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
};