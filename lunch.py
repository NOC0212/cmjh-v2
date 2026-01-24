import requests
import time
import json
import os
from datetime import datetime, timedelta

# 路徑設定
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FOLDER = os.path.join(BASE_DIR, "public", "data")
JSON_FILE = os.path.join(DATA_FOLDER, "lunch.json")

BASE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://fatraceschool.k12ea.gov.tw/frontend/search.html",
    "X-Requested-With": "XMLHttpRequest"
}

def get_batch_id(school_id: str, date: str) -> str:
    url = "https://fatraceschool.k12ea.gov.tw/offered/meal"
    params = {"KitchenId": "all", "MenuType": 1, "period": date, "SchoolId": school_id}
    try:
        res = requests.get(url, params=params, headers=BASE_HEADERS, timeout=10)
        data = res.json()
        if data.get("result") == 1 and data.get("data"):
            return data["data"][0]["BatchDataId"]
    except:
        pass
    return None

def get_dish_names(batch_id: str) -> list:
    url = "https://fatraceschool.k12ea.gov.tw/dish"
    params = {"BatchDataId": batch_id}
    try:
        res = requests.get(url, params=params, headers=BASE_HEADERS, timeout=10)
        data = res.json()
        dish_names = []
        seen = set()
        for item in data.get("data", []):
            name = item.get("DishName")
            if name and name not in seen:
                dish_names.append(name)
                seen.add(name)
        return dish_names
    except:
        return []

def save_to_json(new_menu_items):
    """
    建立目錄並儲存 JSON
    """
    # 建立目錄
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)
        print(f"📁 已建立目錄: {DATA_FOLDER}")

    db = {}
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, "r", encoding="utf-8") as f:
                db = json.load(f)
        except:
            db = {}

    # 移除舊的更新時間標記，更新新資料
    db.pop("LastUpdate", None)
    db.update(new_menu_items)

    # 加入最新的更新時間
    db["LastUpdate"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=4)
    
    print(f"\n✅ 檔案已成功儲存！")
    print(f"📍 檔案路徑: {JSON_FILE}")
    print(f"🕒 更新時間: {db['LastUpdate']}")

def main():
    # 學校 ID
    school_id = "64736611"
    today = datetime.now()
    
    # --- 自動判斷日期範圍 ---
    current_weekday = today.weekday()

    if current_weekday >= 5:
        # 週末執行：目標是「下週一」開始的五天
        days_to_monday = 7 - current_weekday
        monday_date = today + timedelta(days=days_to_monday)
        print(f"📅 偵測為週末，準備預抓「下週」菜單...")
    else:
        # 平日執行：目標是「本週一」開始的五天
        monday_date = today - timedelta(days=current_weekday)
        print(f"📅 偵測為工作日，準備檢查「本週」菜單...")

    new_data = {}
    print(f"🚀 開始抓取從 {monday_date.strftime('%Y-%m-%d')} 起的 5 天資料...")

    for i in range(5):
        target_dt = monday_date + timedelta(days=i)
        current_date = target_dt.strftime("%Y-%m-%d")
        
        print(f"🔎 檢查 {current_date}...", end=" ", flush=True)

        batch_id = get_batch_id(school_id, current_date)
        if not batch_id:
            print("無資料")
            continue

        dishes = get_dish_names(batch_id)
        if dishes:
            new_data[current_date] = {"Menu": dishes}
            print("成功")
        else:
            print("失敗")
        
        time.sleep(1)

    if new_data:
        save_to_json(new_data)
    else:
        print("\n💡 這次沒抓到任何新資料，可能是學校網站尚未更新。")

if __name__ == "__main__":
    main()