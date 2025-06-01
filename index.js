export default {
  async fetch(request, env, ctx) {
    // Ultra-fast CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept root path
    const url = new URL(request.url);
    if (url.pathname !== "/") {
      return new Response(
        JSON.stringify({ response: "Invalid endpoint. Use /?chat={your question}" }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const chatQuery = url.searchParams.get('chat');
    if (!chatQuery) {
      return new Response(
        JSON.stringify({ response: "Missing chat parameter" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    try {
      // No timeout, real-time relay to OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick:free',
          messages: [{ role: 'user', content: chatQuery }],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        return new Response(
          JSON.stringify({ response: "Error: Invalid JSON response from OpenRouter" }),
          {
            status: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      if (!response.ok) {
        return new Response(
          JSON.stringify({ response: `Error: ${data?.error?.message || 'API request failed'}` }),
          {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      const aiResponse = data.choices?.[0]?.message?.content || 'No response generated';

      return new Response(
        JSON.stringify({ response: aiResponse }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ response: `Server error: ${error.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  }
};
