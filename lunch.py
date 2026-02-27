import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime, timedelta

def get_this_week_dates():
    """獲取本週一到週五的日期字串"""
    today = datetime.now()
    monday = today - timedelta(days=today.weekday())
    week_dates = []
    for i in range(5):
        date = monday + timedelta(days=i)
        week_dates.append(date.strftime('%Y-%m-%d'))
    return week_dates

def crawl_lunch(date):
    """爬取崇明國小特定日期的午餐資訊"""
    url = f"https://www.cmes.tn.edu.tw/modules/tad_lunch3/index.php?period={date}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.encoding = 'utf-8'
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        dishes = []
        # 定位菜色方塊
        dish_elements = soup.find_all('div', style=lambda x: x and 'width:150px' in x and 'display: inline-block' in x)
        
        for element in dish_elements:
            divs = element.find_all('div', style=lambda x: x and 'text-align:center' in x)
            if len(divs) >= 2:
                category = divs[0].get_text(strip=True)
                name = divs[1].get_text(strip=True)
                img_tag = element.find('img')
                img_url = img_tag['src'] if img_tag else ""
                
                dishes.append({
                    "category": category,
                    "name": name,
                    "image": img_url
                })
        return dishes
    except Exception as e:
        print(f"Error crawling {date}: {e}")
        return None

def main():
    dates = get_this_week_dates()
    result = {
        "last_updated": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "week_data": {}
    }
    
    for d in dates:
        print(f"正在抓取 {d}...")
        day_lunch = crawl_lunch(d)
        result["week_data"][d] = day_lunch if day_lunch else "無資料"

    # 設定輸出路徑
    output_path = 'public/data/lunch.json'
    
    # 自動建立資料夾
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 寫入 JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    print(f"完成！檔案已儲存至 {output_path}")

if __name__ == "__main__":
    main()