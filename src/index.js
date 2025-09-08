/**
 * 原生 Cloudflare Worker 路由实现
 * 移除了 itty-router 依赖以进行问题诊断
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // API 路由: 处理 /api/gemini
    if (method === 'POST' && path === '/api/gemini') {
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
        console.error('Error in /api/gemini:', error);
        return new Response(JSON.stringify({
          error: 'An internal error occurred while contacting the Gemini API.',
          details: error.message,
          stack: error.stack,
        }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // API 路由: 处理 /api/siliconflow
    if (method === 'POST' && path === '/api/siliconflow') {
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
        console.error('Error in /api/siliconflow:', error);
        return new Response(JSON.stringify({
          error: 'An internal error occurred while contacting the Siliconflow API.',
          details: error.message,
          stack: error.stack,
        }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 静态资源路由 (处理所有其他请求)
    try {
      if (!env.ASSETS) {
        return new Response(
          'Fatal Error: Static asset binding (env.ASSETS) is missing. This indicates a problem with the deployment configuration.',
          { status: 500 }
        );
      }
      return await env.ASSETS.fetch(request);
      
    } catch (error) {
      console.error('Error fetching static asset:', error);
      // 如果静态资源找不到，env.ASSETS.fetch 也会抛出异常
      if (error.message.includes('No such static asset')) {
          return new Response('Not found', { status: 404 });
      }
      return new Response(`Error fetching static asset: ${error.message}`, { status: 500 });
    }
  }
};