// index.js
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-pro-exp-03-25';

export default {
  async fetch(request, env, ctx) {
    try {
      // Parse the URL and extract the 'chat' query parameter
      const url = new URL(request.url);
      const question = url.searchParams.get('chat');

      if (!question) {
        return new Response(
          JSON.stringify({ response: 'Missing chat query parameter' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Forward request to OpenRouter
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://your-worker.workers.dev', // Default workers.dev
          'X-Title': 'Cloudflare Worker Chat',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: question }],
          stream: false, // Non-streaming for simplicity
        }),
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ response: `OpenRouter API error: ${response.status} ${response.statusText}` }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Extract only the message content
      const data = await response.json();
      const messageContent = data.choices?.[0]?.message?.content || 'No response content available';

      // Return only the message content in a response object
      return new Response(
        JSON.stringify({ response: messageContent }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Adjust for production
          },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ response: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
