import { useEffect, useState, useCallback } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Home, Search, Megaphone, Star, Settings, Shield,
  Wrench, BookOpen, Clock, Cloud, Target, Users, Shuffle,
  Timer, QrCode, Pencil, ClipboardCheck, Trophy, Utensils,
  CalendarDays, Trash2, BellRing, Lightbulb, List, X,
  LayoutGrid, Palette, Zap, HardDrive, Lock, Eye, Database, Rss,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageStep {
  title: string;
  desc: string;
}

interface FeatureDetail {
  icon: ElementType;
  label: string;
  summary: string;
  usage: UsageStep[];
  tips: string[];
}

interface DocSection {
  id: string;
  icon: ElementType;
  title: string;
  subtitle: string;
  overview: string;
  features: FeatureDetail[];
}

const sections: DocSection[] = [
  {
    id: "home",
    icon: Home,
    title: "首頁",
    subtitle: "校園資訊入口",
    overview:
      "首頁是您進入平台的第一個畫面，整合了所有常用功能與即時資訊。所有區塊都可以在「設定 → 版面排序」中調整顯示順序或隱藏，打造屬於您的個人化頁面。",
    features: [
      {
        icon: Clock,
        label: "倒數計時器",
        summary: "顯示重要事件（段考、會考、畢業典禮等）的倒數天數，支援自行新增自訂事件。",
        usage: [
          { title: "檢視倒數", desc: "在首頁可直接看到所有事件的剩餘天數，進度條顯示時間流逝比例。" },
          { title: "新增事件", desc: "點擊計時器右上角的「+」按鈕，輸入事件名稱與日期即可新增自訂倒數。" },
          { title: "管理事件", desc: "點擊「編輯」按鈕可拖曳排序、隱藏或刪除事件。長按拖曳把手可調整順序。" },
          { title: "檢視詳情", desc: "點擊任一事件可展開詳細資訊，包含設定倒數、進度條等。" },
        ],
        tips: ["學校行事曆匯入的事件無法編輯或刪除", "自訂事件會儲存在瀏覽器中，清除資料後需重新設定"],
      },
      {
        icon: Cloud,
        label: "天氣",
        summary: "顯示目前位置的天氣狀況，包含溫度、降雨機率及即時天氣圖示。",
        usage: [
          { title: "檢視天氣", desc: "天氣資訊會自動顯示在首頁，包含當前溫度、體感溫度、降雨機率。" },
          { title: "詳細資訊", desc: "點擊天氣卡片可查看更多詳細資訊。" },
        ],
        tips: ["天氣資料來源為中央氣象署開放 API", "需允許瀏覽器存取位置資訊以獲取在地天氣"],
      },
      {
        icon: Home,
        label: "常用網站",
        summary: "快速連結到學校常用網站，包含 cloud 學習歷程、評量系統、圖書館等。",
        usage: [
          { title: "開啟網站", desc: "點擊任一網站圖示即可在新分頁開啟該網站。" },
          { title: "自訂網站", desc: "點擊右上角「編輯」可新增、刪除或分類管理常用網站。" },
          { title: "分類瀏覽", desc: "網站會依分類（如學習、行政、資源）分組顯示，方便快速查找。" },
        ],
        tips: ["可自行新增常用網站連結", "支援自訂分類與圖示"],
      },
      {
        icon: Wrench,
        label: "小工具",
        summary: "課堂輔助工具集合，包含隨機抽籤、分組、時鐘、計時器等 8 種工具。",
        usage: [
          { title: "檢視工具", desc: "在首頁會顯示所有工具的快速入口圖示。" },
          { title: "開啟工具", desc: "點擊任一工具圖示即可進入該工具頁面進行操作。" },
          { title: "切換工具", desc: "進入工具頁面後，可透過頂部導覽列快速切換不同工具。" },
        ],
        tips: ["所有工具均支援深色模式", "工具頁面有獨立的返回按鈕可回到首頁"],
      },
      {
        icon: Trophy,
        label: "榮譽榜",
        summary: "顯示校內各項比賽與活動的榮譽榜單，支援收藏與分頁瀏覽。",
        usage: [
          { title: "瀏覽榮譽榜", desc: "在首頁可直接看到最新榮譽榜列表，支援左右翻頁瀏覽。" },
          { title: "收藏項目", desc: "點擊項目旁的星號圖示即可收藏，方便日後查閱。" },
          { title: "查看更多", desc: "點擊項目可前往學校原始頁面查看詳細資訊。" },
        ],
        tips: ["榮譽榜資料由學校網站自動同步更新", "收藏的內容可在「收藏」頁面集中管理"],
      },
      {
        icon: Megaphone,
        label: "公告",
        summary: "即時顯示學校最新公告，支援分類篩選與收藏功能。",
        usage: [
          { title: "檢視公告", desc: "首頁會顯示最近的公告列表，包含日期、標題與分類。" },
          { title: "展開全文", desc: "點擊公告可展開全文內容，無需跳轉至學校網站。" },
          { title: "檢視附件", desc: "公告若有附件，會顯示附件連結，點擊即可下載或開啟。" },
        ],
        tips: ["最新站內公告會在第一時間彈出通知重要訊息", "可在「公告」頁面查看更多歷史公告"],
      },
      {
        icon: CalendarDays,
        label: "行事曆",
        summary: "瀏覽學校行事曆，支援自訂事件與日期標記。",
        usage: [
          { title: "瀏覽行事曆", desc: "在首頁可查看當月行事曆，標記日期代表有事件。" },
          { title: "切換月份", desc: "使用左右箭頭切換月份，快速瀏覽不同時間。" },
          { title: "新增事件", desc: "點擊日期可新增自訂事件，輸入事件名稱與描述。" },
          { title: "檢視事件", desc: "點擊有標記的日期可查看當日所有事件列表。" },
        ],
        tips: ["學校行事曆事件由系統自動同步", "自訂事件僅儲存在本機瀏覽器中"],
      },
      {
        icon: Utensils,
        label: "午餐",
        summary: "每日午餐菜單查詢，含圖片與分類標示。",
        usage: [
          { title: "檢視菜單", desc: "在首頁可看到當日午餐的所有菜品，按分類（主食、主菜、副菜等）排列。" },
          { title: "檢視圖片", desc: "點擊菜品可查看實物照片（如有提供）。" },
        ],
        tips: ["午餐菜單每日更新", "資料來源為學校營養午餐系統"],
      },
    ],
  },
  {
    id: "announcements",
    icon: Megaphone,
    title: "公告",
    subtitle: "校園公告總覽",
    overview:
      "公告頁面整合「學校公告」與「站內公告」兩種來源，讓您瀏覽所有公告內容，支援分類瀏覽、全文展開、附件檢視與收藏功能。",
    features: [
      {
        icon: Megaphone,
        label: "學校公告",
        summary: "依發佈單位（教務處、學務處、總務處、輔導室等）篩選學校公告，支援全文展開與附件檢視。",
        usage: [
          { title: "切換分類", desc: "點擊頂部分類按鈕可切換顯示特定單位的公告。" },
          { title: "展開內容", desc: "點擊公告標題即可展開該公告的詳細內容，無需跳轉至學校網站；再次點擊標題或點擊其他公告會收起目前展開的內容。" },
          { title: "檢視附件", desc: "公告若有附件，會顯示附件連結，點擊即可下載或開啟。" },
        ],
        tips: ["分類按鈕會顯示各分類的公告數量", "展開的公告會顯示完整內文與附件連結"],
      },
      {
        icon: BellRing,
        label: "站內公告",
        summary: "平台管理者發布的站內訊息，重要快訊會在啟動時自動彈出提醒。",
        usage: [
          { title: "切換分頁", desc: "點擊頂部「站內公告」分頁即可查看管理者發布的平台訊息。" },
          { title: "置頂快訊", desc: "置頂公告會顯示在列表最上方；啟動時若近期有最新快訊，會自動彈出視窗通知。" },
          { title: "關閉彈窗", desc: "若不想在啟動時顯示快訊，可至「設定 → 偏好設定」關閉「啟動顯示公告」。" },
        ],
        tips: ["站內公告由管理後台發布與維護"],
      },
      {
        icon: Star,
        label: "收藏功能",
        summary: "將重要公告加入收藏，方便日後查閱。",
        usage: [
          { title: "收藏公告", desc: "點擊公告旁的星號圖示可將該公告加入收藏。" },
          { title: "取消收藏", desc: "再次點擊已收藏的星號圖示即可取消收藏。" },
          { title: "管理收藏", desc: "所有收藏的公告可在「收藏」頁面集中檢視與管理。" },
        ],
        tips: ["收藏狀態會在所有頁面同步顯示"],
      },
    ],
  },
  {
    id: "favorites",
    icon: Star,
    title: "收藏",
    subtitle: "我的收藏",
    overview:
      "收藏頁面集中管理您所有已收藏的公告、日程提醒與榮譽榜項目，支援分類檢視與快速取消收藏。",
    features: [
      {
        icon: Star,
        label: "分類檢視",
        summary: "依類型（公告 / 日程提醒 / 榮譽榜）分組瀏覽收藏內容，快速找到特定項目。",
        usage: [
          { title: "檢視分組", desc: "收藏項目會依「公告」、「日程提醒」與「榮譽榜」分組顯示，包含標題、日期與分類標籤。" },
          { title: "開啟內容", desc: "點擊公告收藏可直接展開全文；其他類型的收藏可前往原始頁面查看詳細資訊。" },
        ],
        tips: ["收藏的資料會儲存在瀏覽器中，清除瀏覽器資料後需重新收藏"],
      },
      {
        icon: Trash2,
        label: "取消收藏",
        summary: "一鍵取消收藏，輕鬆管理收藏清單。",
        usage: [
          { title: "取消收藏", desc: "點擊項目旁的已收藏圖示即可從收藏中移除。" },
        ],
        tips: ["取消收藏後無法復原，需重新從原頁面收藏"],
      },
    ],
  },
  {
    id: "search",
    icon: Search,
    title: "搜尋",
    subtitle: "全域搜尋",
    overview:
      "搜尋功能幫助您在大量公告與榮譽榜資料中快速找到需要的資訊，支援關鍵字模糊比對與分類篩選。",
    features: [
      {
        icon: Search,
        label: "全域搜尋",
        summary: "同時在公告與榮譽榜中搜尋關鍵字，快速定位目標資訊。",
        usage: [
          { title: "輸入關鍵字", desc: "在搜尋框中輸入關鍵字，系統會自動進行模糊比對搜尋。" },
          { title: "檢視結果", desc: "搜尋結果會分別顯示公告與榮譽榜的相符項目，並標示搜尋關鍵字。" },
          { title: "開啟連結", desc: "點擊任一搜尋結果可前往該項目的原始頁面。" },
        ],
        tips: ["使用關鍵字搜尋比輸入完整句子更準確", "搜尋結果依日期排序，最新資料顯示在最上方"],
      },
      {
        icon: Megaphone,
        label: "分類篩選",
        summary: "依發佈單位（教務處、學務處、輔導室等）過濾搜尋結果。",
        usage: [
          { title: "選擇分類", desc: "在搜尋結果上方可選擇特定分類來過濾結果。" },
          { title: "重置篩選", desc: "點擊「全部」可清除分類篩選，顯示所有結果。" },
        ],
        tips: ["分類篩選與關鍵字搜尋可同時使用", "選擇分類後僅顯示該分類的搜尋結果"],
      },
    ],
  },
  {
    id: "tools",
    icon: Wrench,
    title: "小工具",
    subtitle: "課堂輔助工具",
    overview:
      "8 種課堂輔助工具，專為教師與學生設計的實用功能。所有工具頁面頂部都有導覽列可快速切換。",
    features: [
      {
        icon: Target,
        label: "隨機抽籤",
        summary: "輸入名單後轉動輪盤隨機抽選，支援歷史記錄回溯。",
        usage: [
          { title: "輸入名單", desc: "在文字框中輸入抽籤名單（一行一個），或使用預設範例。" },
          { title: "開始抽選", desc: "點擊「轉動輪盤」按鈕開始隨機抽選，輪盤會以動畫方式停止在結果上。" },
          { title: "檢視歷史", desc: "點擊「歷史記錄」可查看所有抽選結果，方便回溯。" },
          { title: "重設", desc: "點擊「重設」可清空目前結果，重新開始抽選。" },
        ],
        tips: ["適合課堂點名、抽獎活動等場合", "歷史記錄在頁面重新整理後會清除"],
      },
      {
        icon: Users,
        label: "分組工具",
        summary: "依組數或每組人數快速隨機分組，支援自訂組別名稱。",
        usage: [
          { title: "輸入名單", desc: "在文字框中輸入所有人員名單（一行一個）。預設有 30 人名單。" },
          { title: "選擇分組方式", desc: "選擇「分 X 組」或「每組 X 人」兩種分組模式。" },
          { title: "開始分組", desc: "設定組數或每組人數後，點擊「開始分組」按鈕。" },
          { title: "檢視結果", desc: "分組結果會以卡片方式顯示各組成員，組別名稱可自訂。" },
        ],
        tips: ["適合課堂分組活動、社團分組", "每次點擊都會重新隨機分配"],
      },
      {
        icon: Shuffle,
        label: "順序工具",
        summary: "將名單隨機排列順序，適合抽順序、排座位等場合。",
        usage: [
          { title: "輸入名單", desc: "在文字框中輸入需要排列順序的名單。" },
          { title: "開始排列", desc: "點擊「隨機排列」按鈕，系統會將所有項目隨機排序。" },
          { title: "複製結果", desc: "點擊「複製」按鈕可將排序結果複製到剪貼簿。" },
        ],
        tips: ["適合抽報告順序、排座位表", "結果可一鍵複製使用"],
      },
      {
        icon: Clock,
        label: "時鐘",
        summary: "多時區時鐘顯示，支援全螢幕模式。",
        usage: [
          { title: "選擇時區", desc: "從下拉選單選擇要顯示的時區（台北、東京、紐約等）。" },
          { title: "切換格式", desc: "點擊切換 12/24 小時制。" },
          { title: "全螢幕", desc: "點擊全螢幕按鈕可將時鐘放大顯示，適合投影或展示。" },
        ],
        tips: ["適合國際交流或遠距教學時使用", "全螢幕模式會隱藏所有導覽元素"],
      },
      {
        icon: Timer,
        label: "計時器",
        summary: "倒數計時與碼表模式，適合課堂計時與考試計時。",
        usage: [
          { title: "選擇模式", desc: "切換「倒數計時」或「碼表」模式。" },
          { title: "設定時間", desc: "在倒數模式下，設定需要的分鐘數與秒數。" },
          { title: "開始 / 暫停", desc: "點擊播放按鈕開始計時，點擊暫停按鈕可暫停。" },
          { title: "重設", desc: "點擊重設按鈕可將計時器歸零。" },
        ],
        tips: ["倒數結束時會有提示", "碼表模式支援計圈功能"],
      },
      {
        icon: QrCode,
        label: "QR Code",
        summary: "輸入文字或網址快速生成 QR Code，支援顏色自訂與下載。",
        usage: [
          { title: "輸入內容", desc: "在輸入框中輸入文字或網址。" },
          { title: "自訂顏色", desc: "點擊顏色選擇器可變更 QR Code 的前景顏色。" },
          { title: "下載 QR Code", desc: "點擊「下載」按鈕可將 QR Code 儲存為 PNG 圖片。" },
          { title: "複製", desc: "點擊「複製」可將 QR Code 複製到剪貼簿。" },
        ],
        tips: ["適合快速分享網址或資訊", "生成可在離線狀態下使用"],
      },
      {
        icon: Pencil,
        label: "電子白板",
        summary: "即時繪圖與標記工具，支援多種畫筆與匯出功能。",
        usage: [
          { title: "繪圖", desc: "在畫布上拖曳滑鼠或手指進行繪圖。" },
          { title: "切換工具", desc: "使用工具列切換畫筆、螢光筆、橡皮擦等工具。" },
          { title: "調整顏色", desc: "點擊色塊可選擇畫筆顏色，支援多種預設顏色。" },
          { title: "調整粗細", desc: "使用滑桿調整畫筆粗細。" },
          { title: "復原操作", desc: "點擊「復原」按鈕可回到上一步繪圖狀態。" },
          { title: "匯出", desc: "點擊「下載」可將畫布內容匯出為 PNG 圖片。" },
        ],
        tips: ["適合課堂即時解說、標記重點", "支援觸控螢幕與觸控筆"],
      },
      {
        icon: ClipboardCheck,
        label: "課堂點名",
        summary: "輸入班級名單後逐一點名，自動計算出席率並彙整統計。",
        usage: [
          { title: "輸入名單", desc: "在文字框中輸入班級名單（一行一個學生姓名）。" },
          { title: "開始點名", desc: "點名開始後，逐一標記每位學生的出席狀態（出席、缺席、請假）。" },
          { title: "檢視統計", desc: "點名完成後自動計算出席率、缺席人數等統計數據。" },
          { title: "重設", desc: "點擊重設可清除本次點名資料，重新開始。" },
        ],
        tips: ["適合教師課堂點名使用", "統計數據可作為出缺席記錄參考"],
      },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    title: "設定",
    subtitle: "個人化設定",
    overview:
      "設定頁面讓您依照個人喜好調整平台的外觀與功能，打造最適合您的使用體驗。所有設定會自動儲存在瀏覽器中。",
    features: [
      {
        icon: LayoutGrid,
        label: "版面排序",
        summary: "調整首頁各區塊的顯示順序與開關，自由排列資訊入口。",
        usage: [
          { title: "啟用 / 停用元件", desc: "在設定中可開啟或關閉要在首頁顯示的區塊開關。" },
          { title: "調整順序", desc: "拖曳元件旁的把手可調整各區塊在首頁的顯示順序。" },
          { title: "儲存排序", desc: "調整完成後點擊「儲存排序」套用變更；也可點擊「全部顯示」快速還原所有區塊。" },
        ],
        tips: ["關閉的元件不會在首頁顯示，但設定不受影響", "排序會即時反映在首頁上"],
      },
      {
        icon: Palette,
        label: "外觀",
        summary: "支援淺色 / 深色模式切換，也可跟隨系統自動調整。",
        usage: [
          { title: "選擇模式", desc: "在設定中可選擇「淺色」、「深色」或「跟隨系統」。" },
          { title: "即時套用", desc: "修改後會立即套用，讓您立即看到效果；所有元件與頁面都完整支援深色模式。" },
        ],
        tips: ["深色模式在夜間使用可減輕眼睛疲勞", "選擇「跟隨系統」時會依作業系統設定自動切換深淺色模式"],
      },
      {
        icon: Zap,
        label: "偏好設定",
        summary: "調整啟動行為與常用介面細節。",
        usage: [
          { title: "啟動顯示公告", desc: "開啟後登入首頁會自動展開 7 天內最新站內快訊。" },
          { title: "顯示網站圖示", desc: "開啟後常用網站卡片會顯示各網站的 favicon 圖示。" },
          { title: "啟用預設倒數", desc: "關閉後只顯示自訂的倒數計時，不載入學校預設倒數。" },
        ],
        tips: ["所有偏好設定變更後立即生效，並自動儲存在瀏覽器中"],
      },
      {
        icon: HardDrive,
        label: "系統資料",
        summary: "查看版本資訊，並支援資料匯出、匯入與重置。",
        usage: [
          { title: "檢視版本", desc: "在設定中可查看目前使用的版本號碼。" },
          { title: "匯出 / 匯入", desc: "可將個人資料（設定、收藏等）匯出為檔案備份，或從檔案還原。" },
          { title: "重置資料", desc: "可清除所有本機設定與資料，恢復初始狀態。" },
        ],
        tips: ["匯入會覆蓋現有資料，建議先匯出備份"],
      },
    ],
  },
  {
    id: "admin",
    icon: Shield,
    title: "管理後台",
    subtitle: "網站後台",
    overview:
      "管理頁面提供網站後台功能，需具備管理員權限才能存取。用於維護網站內容、監控系統狀態與發布站內公告。",
    features: [
      {
        icon: Lock,
        label: "管理員驗證",
        summary: "進入管理後台需輸入管理密碼；首次使用可直接設定密碼。",
        usage: [
          { title: "設定密碼", desc: "第一次進入管理後台時，可直接設定管理密碼。" },
          { title: "登入驗證", desc: "之後進入後台需輸入密碼驗證；密碼在傳輸與儲存時皆以雜湊加密處理。" },
          { title: "變更密碼", desc: "可在後台選單中修改管理密碼。" },
        ],
        tips: ["管理密碼僅管理者持有，請妥善保管"],
      },
      {
        icon: Clock,
        label: "預設倒數計時",
        summary: "管理學校預設的倒數計時器，新增、編輯或刪除首頁顯示的倒數事件。",
        usage: [
          { title: "檢視清單", desc: "進入後台「預設倒數計時」可查看目前所有預設倒數事件。" },
          { title: "新增 / 編輯", desc: "可新增倒數事件，或修改既有事件的名稱與日期。" },
        ],
        tips: ["預設倒數儲存於資料庫，修改後所有使用者同步顯示"],
      },
      {
        icon: Megaphone,
        label: "本站公告",
        summary: "管理站內公告內容，發布平台最新消息。",
        usage: [
          { title: "新增公告", desc: "進入後台「本站公告」可新增公告，包含標題、日期、類型、內容與圖片。" },
          { title: "編輯 / 刪除", desc: "可修改或移除既有公告，並可設定置頂優先顯示。" },
        ],
        tips: ["置頂公告會顯示在公告頁面最上方"],
      },
      {
        icon: Wrench,
        label: "維護模式",
        summary: "開啟後一般使用者無法瀏覽網站，適合系統維護期間使用。",
        usage: [
          { title: "開啟維護", desc: "在管理頁面中開啟維護模式，並可設定維護結束時間與顯示訊息。" },
          { title: "白名單", desc: "管理員可將特定使用者加入白名單，使其在維護期間仍可正常瀏覽。" },
        ],
        tips: ["維護模式開啟後，一般使用者會看到維護提示畫面", "白名單使用者的設定儲存在瀏覽器中"],
      },
      {
        icon: HardDrive,
        label: "版本管理",
        summary: "檢查當前版本與最新版本，確保使用最新功能。",
        usage: [
          { title: "檢視版本", desc: "在管理頁面可查看目前使用的版本號碼與最新可用版本。" },
          { title: "更新版本", desc: "若有新版本可更新，系統會提示並提供更新操作。" },
        ],
        tips: ["建議保持最新版本以獲得最佳體驗與安全性"],
      },
      {
        icon: Eye,
        label: "訪問統計",
        summary: "查看本日、本週、本月等訪問數據，掌握平台使用狀況。",
        usage: [
          { title: "檢視數據", desc: "進入後台「訪問統計」可查看各時間範圍的訪問人次統計。" },
        ],
        tips: ["訪問統計由 Supabase 資料庫記錄"],
      },
    ],
  },
  {
    id: "data-sources",
    icon: Database,
    title: "資料來源",
    subtitle: "資料同步說明",
    overview:
      "平台的各項資料由不同來源自動同步更新，以下說明各項資料的來源與更新方式。",
    features: [
      {
        icon: Rss,
        label: "學校公告與榮譽榜",
        summary: "由系統定時從學校網站自動擷取，保持資料即時。",
        usage: [
          { title: "自動同步", desc: "系統會定時擷取學校網站的最新公告與榮譽榜，同步至平台。" },
          { title: "失效清理", desc: "若同步後原項目已不存在於學校網站，相關收藏會自動清理。" },
        ],
        tips: ["資料更新時間以自動同步時間為準"],
      },
      {
        icon: Utensils,
        label: "午餐菜單",
        summary: "每日早上自動更新當日午餐菜單。",
        usage: [
          { title: "每日更新", desc: "午餐菜單由系統每日早上從學校營養午餐系統自動同步。" },
        ],
        tips: ["菜單內容以學校實際供餐為準"],
      },
      {
        icon: Cloud,
        label: "天氣",
        summary: "天氣資料來源為中央氣象署開放 API。",
        usage: [
          { title: "即時查詢", desc: "天氣資訊由瀏覽器直接向中央氣象署 API 查詢，包含溫度、降雨機率等。" },
        ],
        tips: ["需允許瀏覽器存取位置資訊以獲取在地天氣"],
      },
      {
        icon: CalendarDays,
        label: "學校行事曆",
        summary: "學校行事曆事件由系統自動同步顯示。",
        usage: [
          { title: "自動同步", desc: "學校行事曆事件由系統同步，無法自行編輯或刪除。" },
          { title: "自訂事件", desc: "您新增的行事曆事件僅儲存在本機瀏覽器中。" },
        ],
        tips: ["自訂事件清除瀏覽器資料後需重新設定"],
      },
      {
        icon: Database,
        label: "倒數、公告與統計",
        summary: "預設倒數、站內公告、維護設定與訪問統計儲存於 Supabase 資料庫。",
        usage: [
          { title: "雲端儲存", desc: "上述資料儲存於雲端資料庫，所有使用者看到的內容一致。" },
          { title: "管理維護", desc: "由具有管理員權限的使用者透過管理後台維護。" },
        ],
        tips: ["維護設定會依連線狀態自動選擇資料庫或本機備份來源"],
      },
      {
        icon: HardDrive,
        label: "個人資料",
        summary: "收藏、常用網站、自訂倒數與個人設定儲存在瀏覽器本機。",
        usage: [
          { title: "本機儲存", desc: "個人資料儲存在瀏覽器中，不會上傳到伺服器。" },
          { title: "備份還原", desc: "可在「設定 → 系統資料」中匯出資料備份，或匯入還原。" },
        ],
        tips: ["清除瀏覽器資料或更換裝置後，可透過匯入備份還原個人資料"],
      },
    ],
  },
];

const sectionIds = sections.map((s) => s.id);

/** 進場動畫延遲 */
const STAGGER_CLASSES = [
  "animate-stagger-1",
  "animate-stagger-2",
  "animate-stagger-3",
  "animate-stagger-4",
  "animate-stagger-5",
  "animate-stagger-6",
  "animate-stagger-7",
  "animate-stagger-8",
];

function useActiveSection() {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return activeId;
}

export default function DocsPage() {
  const navigate = useNavigate();
  const activeSection = useActiveSection();
  const [tocOpen, setTocOpen] = useState(false);

  // 點擊外部收起目錄
  useEffect(() => {
    if (!tocOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-floating-docs-toc]")) setTocOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [tocOpen]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sectionIds.includes(hash)) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const handleSectionClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", `#${id}`);
    }
    setTocOpen(false);
  }, []);

  return (
    <>
      <div className="space-y-10 pb-8 opacity-0 animate-fade-in">
      {/* 頁面標題 */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-soft border border-primary/10 shrink-0">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-gradient tracking-tight">
              使用說明
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
              崇明國中v2校園資訊平台 — 完整功能指南
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          歡迎使用崇明國中v2校園資訊平台！本文件將詳細介紹平台的各項功能與操作方法。
          您可以透過下方分類快速跳轉到感興趣的主題。
        </p>
      </header>

      {/* 各功能說明區塊 */}
      {sections.map((section, sectionIdx) => {
        const Icon = section.icon;
        return (
          <section
            key={section.id}
            id={section.id}
            className={cn("scroll-mt-24 lg:scroll-mt-16 space-y-5 opacity-0 animate-fade-in", STAGGER_CLASSES[Math.min(sectionIdx, STAGGER_CLASSES.length - 1)])}
          >
            {/* 區塊標題 */}
            <div className="space-y-2 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <span className="section-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                <span className="hidden sm:inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {section.subtitle}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {section.overview}
              </p>
            </div>

            {/* 功能細項 */}
            <div className="space-y-4">
              {section.features.map((feature) => {
                const FeatIcon = feature.icon;
                return (
                  <article
                    key={feature.label}
                    className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-4 mb-5">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-primary/10 text-primary">
                          <FeatIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-foreground">
                            {feature.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                            {feature.summary}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 sm:ml-[56px]">
                        {feature.usage.map((step, si) => (
                          <div
                            key={si}
                            className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/40"
                          >
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold shrink-0 mt-0.5 bg-primary/10 text-primary">
                              {si + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground mb-1 leading-relaxed">
                                {step.title}
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {feature.tips.length > 0 && (
                      <div className="border-t border-border/40 bg-success/5 px-5 sm:px-6 py-4">
                        <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5 text-success">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                          小提醒
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {feature.tips.map((tip, ti) => (
                            <span
                              key={ti}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground px-3 py-1.5 rounded-lg bg-success/10"
                            >
                              {tip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* 頁尾 */}
      <footer className="border-t border-border/40 pt-8 pb-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
          <BookOpen className="h-4 w-4" />
          <span>崇明國中v2校園資訊平台 — 使用說明</span>
        </div>
        <p className="text-sm text-muted-foreground/50">
          &copy; 2026 崇明國中v2 by cy.noc0531
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/70 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回首頁
        </button>
      </footer>
    </div>

      {/* 浮動目錄跳轉（右下角，可摺疊） */}
      <div data-floating-docs-toc className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {tocOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-56 grid grid-cols-1 gap-1 p-2 rounded-2xl glass-strong shadow-lg border border-border/40"
            >
              {sections.map((section, idx) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => handleSectionClick(section.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.title}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setTocOpen((v) => !v)}
          title={tocOpen ? "收起目錄" : "展開目錄"}
          aria-label={tocOpen ? "收起目錄" : "展開目錄"}
          aria-expanded={tocOpen}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-primary/25 text-white transition-all duration-300",
            tocOpen
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-brand-gradient hover:opacity-90",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={tocOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {tocOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
