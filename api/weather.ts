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
    console.error("[Weather Proxy] CWA_API_KEY not configured on server");
    return new Response(
      JSON.stringify({ error: "CWA_API_KEY not configured on server", detail: "請在 Vercel Dashboard > Settings > Environment Variables 設定 CWA_API_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  try {
    const targetUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-079?Authorization=${encodeURIComponent(apiKey)}&locationName=${encodeURIComponent(district)}`;

    console.log(`[Weather Proxy] Fetching: ${targetUrl.replace(apiKey, "***")}`);

    const res = await fetch(targetUrl);

    // 先檢查 CWA 回傳的 HTTP 狀態碼
    if (!res.ok) {
      let errorBody = "";
      try {
        errorBody = await res.text();
      } catch {
        errorBody = "(無法讀取回應內容)";
      }
      console.error(`[Weather Proxy] CWA API responded with status ${res.status}: ${errorBody.slice(0, 500)}`);

      return new Response(
        JSON.stringify({
          error: `CWA API 回應錯誤 (${res.status})`,
          detail: errorBody.slice(0, 500),
          hint: res.status === 403
            ? "API 金鑰可能無效或已過期，請至 https://opendata.cwa.gov.tw 重新申請"
            : "請檢查 API 金鑰是否有效",
        }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=300", // 5 分鐘快取
      },
    });
  } catch (error) {
    console.error("[Weather Proxy] Exception:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch weather data",
        detail: error instanceof Error ? error.message : String(error),
        hint: "請確認 CWA_API_KEY 是否有效，或 CWA 服務是否正常",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export const config = {
  runtime: "edge",
};
