import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

def fetch_cmjh_lunch():
    url = "https://www.cmjh.tn.edu.tw/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.encoding = 'utf-8'
        
        if response.status_code != 200:
            print(f"無法存取網頁，狀態碼：{response.status_code}")
            return

        soup = BeautifulSoup(response.text, 'html.parser')
        
        lunch_data = {
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "items": []
        }
        
        # 尋找所有菜色區塊
        # 根據你提供的 HTML，最穩定的抓取點是 class="thumbnail fancybox_lunch"
        dishes = soup.find_all("a", class_="fancybox_lunch")

        for dish in dishes:
            # 1. 抓取圖片
            img_tag = dish.find("img")
            img_url = img_tag.get("src") if img_tag else ""
            
            # 2. 抓取名稱與分類
            # 優先從 data-caption 抓取，因為 HTML 標籤內的文字可能會有大量的換行符號
            caption = dish.get("data-caption", "")
            
            if "(" in caption:
                # 處理格式如 "十穀飯 (主食)"
                name_part, cat_part = caption.split("(")
                name = name_part.strip()
                category = cat_part.replace(")", "").strip()
            else:
                # 備援：從下方的 div 抓取
                parent = dish.find_parent("div", style=lambda x: x and "display: inline-block" in x)
                if parent:
                    text_divs = parent.find_all("div", recursive=False)
                    info = [d.get_text(strip=True) for d in text_divs if d.get_text(strip=True)]
                    category = info[0] if len(info) > 0 else "未知"
                    name = info[1] if len(info) > 1 else caption
                else:
                    category = "其他"
                    name = caption if caption else "未命名菜色"

            lunch_data["items"].append({
                "category": category,
                "name": name,
                "image": img_url
            })

        if not lunch_data["items"]:
            print("未能抓取到菜色（今日可能未提供），將僅更新時間戳記。")

        # 寫入 JSON
        output_path = "public/data/lunch.json"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(lunch_data, f, ensure_ascii=False, indent=4)
        
        print(f"更新成功！時間：{lunch_data['last_updated']}，共 {len(lunch_data['items'])} 道菜。")

    except Exception as e:
        print(f"執行時發生錯誤：{e}")

if __name__ == "__main__":
    fetch_cmjh_lunch()