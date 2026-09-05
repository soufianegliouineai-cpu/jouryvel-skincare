// Vercel Serverless Function to proxy OpenRouter API
// Uses the secret stored in the deployment environment

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model = 'openai/gpt-oss-120b:free' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // OpenRouter free models cascade (always-up-to-date as of 2026)
  const models = [
    'openai/gpt-oss-120b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-2-9b-it:free',
    'mistralai/mistral-7b-instruct:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
    'google/gemini-2.0-flash-thinking-exp:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    model
  ];

  // Dedupe
  const uniqueModels = [...new Set(models)];

  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'OpenRouter API key not configured. Add OPENROUTER_API_KEY in Vercel environment variables.' 
    });
  }

  for (const m of uniqueModels) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 25000);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://jouryvel-skincare.vercel.app',
          'X-Title': 'JOURYVEL Skincare'
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        }),
        signal: ctrl.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.log(`Model ${m} failed: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.error) {
        console.log(`Model ${m} error:`, data.error);
        continue;
      }

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return res.status(200).json({
          success: true,
          model: m,
          content: data.choices[0].message.content,
          provider: 'openrouter'
        });
      }
    } catch (e) {
      console.log(`Model ${m} exception:`, e.message);
      continue;
    }
  }

  return res.status(503).json({
    success: false,
    error: 'All OpenRouter models unavailable. Please try again later.'
  });
}
