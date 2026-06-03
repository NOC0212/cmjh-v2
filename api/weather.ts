/**
 * Vercel Serverless Function — 代理中央氣象署天氣 API
 *
 * 此函數在伺服器端執行，CWA_API_KEY 不會暴露給前端。
 *
 * 用法: GET /api/weather?district=東區
 *
 * 部署:
 *   將 CWA_API_KEY 設為 Vercel 專案的 Environment Variable（不含 VITE_ 前綴）
 *
 * 本地開發:
 *   Vite 會自動代理 /api/weather 至 CWA API，金鑰同樣保留在伺服器端。
 */

export default async function handler(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const district = url.searchParams.get("district");

  if (!district) {
    return new Response(
      JSON.stringify({ error: "Missing district parameter" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const apiKey = process.env.CWA_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "CWA_API_KEY not configured on server" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  try {
    const targetUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-079?Authorization=${encodeURIComponent(apiKey)}&locationName=${encodeURIComponent(district)}`;

    const res = await fetch(targetUrl);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=300", // 5 分鐘快取
      },
    });
  } catch (error) {
    console.error("Weather proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch weather data" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export const config = {
  runtime: "edge",
};
