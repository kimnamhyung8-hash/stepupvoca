/**
 * VocaQuest AI Security Proxy (Cloudflare Worker)
 * 
 * [목적]
 * 클라이언트(앱/웹) 코드에 Gemini API 키를 노출하지 않고,
 * Cloudflare Worker 환경변수(Secret)에 저장된 키를 이용해 안전하게 Gemini API를 호출합니다.
 * 
 * [설정 방법]
 * 1. Cloudflare 대시보드 (https://dash.cloudflare.com) 접속 > Workers & Pages
 * 2. 'Create application' > 'Create Worker' 클릭 후 생성
 * 3. 이 파일(worker.js)의 전체 코드를 복사하여 붙여넣고 [Deploy] 클릭
 * 4. Settings > Variables and Secrets > [Add] 클릭:
 *    - Variable name: GEMINI_API_KEY
 *    - Value: 신규 발급받은 Gemini API 키 입력
 *    - Type: Secret 선택 후 저장
 * 5. 생성된 Worker 주소(예: https://vocaquest-ai-proxy.xxxx.workers.dev)를
 *    VocaQuest 앱의 AI_PROXY_ENDPOINT로 지정
 */

export default {
  async fetch(request, env, ctx) {
    // 1. CORS Preflight 처리
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Server API Key not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const body = await request.json();
      let { prompt, systemInstruction, model = "gemini-3.5-flash-lite", temperature = 0.7, maxOutputTokens = 1024 } = body;

      // 구형 모델 요청 시 최신 모델로 자동 리디렉션
      if (!model || model.includes("1.5") || model.includes("2.0") || model.includes("2.5") || model.includes("preview")) {
        model = "gemini-3.5-flash-lite";
      }

      if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const geminiPayload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          responseMimeType: "application/json",
        },
      };

      if (systemInstruction) {
        geminiPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      const data = await geminiRes.text();

      return new Response(data, {
        status: geminiRes.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
