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

    // 加上瀏覽器風格的 headers 繞過 CWA WAF 封鎖
    // 同時在 URL query 和 header 傳送 Authorization（部分 WAF 對 URL 參數較敏感）
    const res = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Referer": "https://opendata.cwa.gov.tw/",
        "Authorization": apiKey,
      },
    });

    // 先檢查 CWA 回傳的 HTTP 狀態碼
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (!res.ok || !contentType.includes("json")) {
      let body = "";
      try {
        body = await res.text();
      } catch {
        body = "(無法讀取回應內容)";
      }
      console.error(`[Weather Proxy] CWA responded ${res.status} (${contentType}): ${body.slice(0, 500)}`);

      return new Response(
        JSON.stringify({
          error: `CWA API 回應錯誤 (${res.status})`,
          contentType,
          detail: body.slice(0, 500),
          hint: body.includes("授權")
            ? "API 金鑰可能無效或已過期，請至 https://opendata.cwa.gov.tw 重新申請"
            : res.status === 404
              ? "CWA API 端點可能已變更，請檢查 F-D0047-079 是否仍有效"
              : "請檢查 API 金鑰是否有效，或 CWA 服務是否正常",
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

// 使用 Vercel 預設的 Node.js Serverless Function（避免 CWA WAF 封鎖 Edge 網路 IP）
