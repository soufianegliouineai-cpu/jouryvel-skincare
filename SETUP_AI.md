# JOURYVEL — Setup OpenRouter API Key

The app uses OpenRouter for best AI models. To enable:

## 1. Get the API key

You already have OpenRouter registered in Minis. The key is stored in the system.

**If you have the key:**
- Open Vercel: https://vercel.com/dashboard
- Go to: jouryvel-skincare → Settings → Environment Variables
- Add:
  - **Name**: `OPENROUTER_API_KEY`
  - **Value**: `sk-or-v1-xxxxx...` (your key)
  - **Environment**: Production
- Save and Redeploy

**Don't have the key handy?**
- Go to: https://openrouter.ai/keys
- Create a free key
- Add it to Vercel as above

## 2. The Smart Cascade

The `/api/ai` endpoint tries 9 free models in order:
1. openai/gpt-oss-120b:free (best quality)
2. meta-llama/llama-3.3-70b-instruct:free
3. google/gemma-2-9b-it:free
4. mistralai/mistral-7b-instruct:free
5. qwen/qwen-2.5-72b-instruct:free
6. cognitivecomputations/dolphin-24b:free
7. google/gemini-2.0-flash-thinking-exp:free
8. meta-llama/llama-3.2-3b-instruct:free
9. Your requested model

If ALL fail, falls back to LLM7.io anonymous.

## 3. No key needed?

The app works WITHOUT OpenRouter key — it falls back to LLM7.io (gpt-oss, mistral, codestral).

To use only the fallback, just don't add the env var. The app will automatically skip OpenRouter and use LLM7.
