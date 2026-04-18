import requests
from bs4 import BeautifulSoup
import json
import os
import time
import re
from urllib.parse import urljoin, unquote

# === 設定區 ===
BASE_URL = "https://www.cmjh.tn.edu.tw/"
LIST_URL = "https://www.cmjh.tn.edu.tw/modules/school/index.php?op=all_news"
OUTPUT_DIR = os.path.join("public", "data")

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
}

def fetch_details(detail_url):
    """
    進入公告內頁，抓取內容文字與精確的附件下載連結
    """
    print(f"  --> 深入解析：{detail_url}")
    try:
        resp = requests.get(detail_url, headers=headers, timeout=15)
        resp.encoding = resp.apparent_encoding
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # 1. 抓取公告本文 (#print_content 是最準確的區塊)
        content_area = soup.select_one('#print_content')
        if content_area:
            temp_soup = BeautifulSoup(str(content_area), "html.parser")
            # 移除內文末尾的附件清單標籤，避免文字重複
            file_list_part = temp_soup.select_one('ul.tuf-icon')
            if file_list_part:
                file_list_part.decompose()
            content_text = temp_soup.get_text(separator="\n", strip=True)
        else:
            content_text = "無詳細內文"

        # 2. 抓取附件連結
        attachments = []
        file_items = soup.select('li.tuf-icon-item')
        
        for li in file_items:
            a_tag = li.find('a', onclick=True)
            if a_tag:
                onclick_text = a_tag.get('onclick', '')
                # Regex 說明：抓取 downloadFile(數字, '原始檔名')
                match = re.search(r"downloadFile\((\d+),\s*['\"](.+?)['\"]\)", onclick_text)
                
                if match:
                    file_sn = match.group(1)
                    # 關鍵：直接使用網頁提供的原始檔名字串 (raw_fn)，不進行任何 quote 編碼
                    raw_fn = match.group(2)
                    
                    # 按照學校網站 JS 邏輯拼接 URL
                    final_link = f"{BASE_URL}modules/school/index.php?op=tufdl&fn={raw_fn}&files_sn={file_sn}"
                    
                    # 顯示名稱則還原成中文，方便閱讀
                    display_name = unquote(raw_fn)
                    
                    attachments.append({
                        "name": display_name,
                        "link": final_link
                    })
            
        return content_text, attachments
    except Exception as e:
        print(f"      [失敗] 內頁解析出錯: {e}")
        return "內容讀取失敗", []

def main():
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 啟動崇明國中公告爬蟲...")
    
    try:
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)

        # 取得列表頁
        response = requests.get(LIST_URL, headers=headers, timeout=15)
        response.encoding = response.apparent_encoding
        soup = BeautifulSoup(response.text, 'html.parser')

        table = soup.select_one('#news_tableall')
        if not table:
            print("找不到公告表格，請檢查網路或網址。")
            return

        rows = table.select('tbody tr')
        results = []

        print(f"共偵測到 {len(rows)} 筆公告，開始爬取內頁...")

        for row in rows:
            try:
                # 列表頁基本資料
                date = row.select_one('time').text.strip() if row.select_one('time') else ""
                source = row.select_one('td[headers="header_info"]').text.strip()
                badge = row.select_one('a.my-badge')
                category = badge.text.strip() if badge else "一般"

                title_a = row.select_one('td[headers="header_title"] a[href*="content_id"]')
                if not title_a:
                    continue
                
                title = title_a.text.strip()
                detail_url = urljoin(BASE_URL, title_a.get('href'))

                # 爬取內頁詳細資訊
                content, attachments = fetch_details(detail_url)

                results.append({
                    "date": date,
                    "category": category,
                    "source": source,
                    "title": title,
                    "url": detail_url,
                    "content": content,
                    "attachments": attachments
                })

                # 間隔 0.8 秒，保護伺服器也避免被封鎖
                time.sleep(0.8)

            except Exception as row_err:
                print(f"  [跳過] 資料處理異常: {row_err}")
                continue

        # 儲存為 JSON
        output_file = os.path.join(OUTPUT_DIR, "announcements.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=4)

        print("-" * 30)
        print(f"爬取成功！總計 {len(results)} 筆。")
        print(f"存檔路徑: {output_file}")

    except Exception as e:
        print(f"程式執行中斷: {e}")

if __name__ == "__main__":
    main()