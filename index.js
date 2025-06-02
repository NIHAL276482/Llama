// index.js
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1-0528-qwen3-8b:free';

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
