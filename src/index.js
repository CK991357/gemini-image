// 处理对 /api/gemini 的 POST 请求
// 代理到 Gemini API Worker 端点
async function handleGemini(request, env) {
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
}

// 处理对 /api/siliconflow 的 POST 请求
// 代理到 Siliconflow API
async function handleSiliconflow(request, env) {
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
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 路由处理
    if (method === 'POST' && path === '/api/gemini') {
      return handleGemini(request, env);
    } else if (method === 'POST' && path === '/api/siliconflow') {
      return handleSiliconflow(request, env);
    } else {
      // 处理静态资源
      return env.ASSETS.fetch(request);
    }
  }
};
