import { Router } from 'itty-router';

// 创建一个新的路由实例
const router = Router();

/**
 * 处理对 /api/gemini 的 POST 请求
 * 代理到 Gemini API Worker 端点
 */
router.post('/api/gemini', async (request, env) => {
  try {
    const authKey = env.AUTH_KEY;
    if (!authKey) {
      return new Response(JSON.stringify({ error: "AUTH_KEY secret not configured" }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.text();
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${authKey}`);

    const response = await fetch(`https://geminiapim.10110531.xyz/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: body
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * 处理对 /api/siliconflow 的 POST 请求
 * 代理到 Siliconflow API
 */
router.post('/api/siliconflow', async (request, env) => {
  try {
    const apiKey = env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "SILICONFLOW_API_KEY secret not configured" }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = await request.json();
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * 捕获所有其他请求 (GET, etc.)
 * 这部分用于处理静态资源（HTML, CSS, JS 文件等）
 * `env.ASSETS.fetch` 是由 wrangler.toml 中的 [assets] 配置自动提供的
 */
router.all('*', (request, env) => {
  return env.ASSETS.fetch(request);
});

export default {
  fetch: (request, env, ctx) => router.handle(request, env, ctx)
};