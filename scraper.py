import requests
from bs4 import BeautifulSoup
import json
import os
import time
import re
from urllib.parse import urljoin, quote

URLS = [
    "https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?ncsn=1&nsn=&tag_sn=&g2p=1",
    "https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?ncsn=1&g2p=2",
    "https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?ncsn=1&g2p=3",
]

OUTPUT_DIR = os.path.join("public", "data")

def fetch_page(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        resp.encoding = 'utf-8'
        return resp.text
    except Exception as e:
        print(f"連線失敗: {e}")
        return None

def fetch_details(url):
    print(f"  --> 深入解析：{url}")
    html = fetch_page(url)
    if not html: return "無法取得內容", []
    
    soup = BeautifulSoup(html, "html.parser")
    content_text = ""
    attachments = []

    # 1. 內文抓取與排版優化
    content_area = soup.find("div", class_="news_page_content")
    if content_area:
        # 移除發佈資訊區塊
        info_div = content_area.find("div", class_="news_page_info")
        if info_div: info_div.decompose()

        # --- 精準換行處理 ---
        # 遍歷所有標籤，只在特定標籤前後加換行
        for tag in content_area.find_all(['p', 'div', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'br']):
            if tag.name == 'br':
                tag.replace_with('\n')
            else:
                # 在塊狀標籤內容後方插入換行標記
                tag.append('\n')

        # 取得純文字（此時不使用 separator，避免 span 再次導致換行）
        raw_text = content_area.get_text()
        
        # 清理邏輯：
        # - 移除每一行前後的空白
        # - 將三個以上的換行縮減為兩個（保持段落感但不過空）
        lines = [line.strip() for line in raw_text.split('\n')]
        clean_text = '\n'.join([l for l in lines if l]) # 移除完全空白的行
        content_text = clean_text

    # 2. 附件抓取
    file_list = soup.find("ul", class_="tuf-icon")
    if file_list:
        for li in file_list.find_all("li"):
            a_tag = li.find("a")
            desc_div = li.find("div", class_="file_description")
            if a_tag and desc_div:
                raw_name = desc_div.get_text(strip=True)
                clean_name = re.sub(r"^\d+\)\s*", "", raw_name)
                href = a_tag.get("href", "")
                onclick = a_tag.get("onclick", "")
                
                if "javascript:void(0)" in href and onclick:
                    match = re.search(r"downloadFile\((\d+),", onclick)
                    if match:
                        file_sn = match.group(1)
                        final_link = f"https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?op=tufdl&fn={quote(clean_name)}&files_sn={file_sn}"
                else:
                    final_link = urljoin(url, href)

                attachments.append({"name": clean_name, "link": final_link})

    return content_text, attachments

def parse_announcements(html, source_url):
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", class_="table-striped")
    if not table: return []
    tbody = table.find("tbody")
    announcements = []
    for tr in tbody.find_all("tr"):
        td = tr.find("td")
        if not td: continue
        date = td.get_text(strip=True)[:10]
        a_tags = [a for a in td.find_all("a") if "badge" not in a.get("class", [])]
        if not a_tags: continue
        title = a_tags[0].text.strip()
        link = urljoin(source_url, a_tags[0].get("href", ""))
        content, links = fetch_details(link)
        time.sleep(0.5)
        announcements.append({
            "date": date,
            "title": title,
            "url": link,
            "content": content,
            "links": links
        })
    return announcements

def main():
    for index, url in enumerate(URLS):
        page_num = index + 1
        print(f"\n[第 {page_num} 頁] 開始處理...")
        html = fetch_page(url)
        if html:
            data = parse_announcements(html, url)
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            with open(os.path.join(OUTPUT_DIR, f"announcements-p{page_num}.json"), "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()