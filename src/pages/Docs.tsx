import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Home, Search, Megaphone, Star, Settings, Shield,
  Wrench, BookOpen, Clock, Cloud, Target, Users, Shuffle,
  Timer, QrCode, Pencil, ClipboardCheck, Trophy, Utensils,
  CalendarDays, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavPill } from "@/components/NavPill";

interface UsageStep {
  title: string;
  desc: string;
}

interface FeatureDetail {
  icon: React.ElementType;
  label: string;
  summary: string;
  usage: UsageStep[];
  tips: string[];
}

type SectionColor = "indigo" | "cyan" | "amber" | "pink" | "violet" | "emerald" | "slate";

const colorSets: Record<SectionColor, {
  icon: string; iconBg: string; tag: string;
  tipBg: string; tipTag: string; tipText: string;
  stepBg: string; stepText: string;
  activeSidebar: string;
  sidebarDot: string;
}> = {
  indigo: {
    icon: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-500/10",
    tag: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    tipBg: "bg-indigo-50/50 dark:bg-indigo-500/[0.04]", tipTag: "bg-indigo-500/5 dark:bg-indigo-500/10",
    tipText: "text-indigo-600 dark:text-indigo-400",
    stepBg: "bg-indigo-500/10", stepText: "text-indigo-600 dark:text-indigo-400",
    activeSidebar: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    sidebarDot: "bg-indigo-600 dark:bg-indigo-400",
  },
  cyan: {
    icon: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-cyan-500/10",
    tag: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    tipBg: "bg-cyan-50/50 dark:bg-cyan-500/[0.04]", tipTag: "bg-cyan-500/5 dark:bg-cyan-500/10",
    tipText: "text-cyan-600 dark:text-cyan-400",
    stepBg: "bg-cyan-500/10", stepText: "text-cyan-600 dark:text-cyan-400",
    activeSidebar: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    sidebarDot: "bg-cyan-600 dark:bg-cyan-400",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10",
    tag: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    tipBg: "bg-amber-50/50 dark:bg-amber-500/[0.04]", tipTag: "bg-amber-500/5 dark:bg-amber-500/10",
    tipText: "text-amber-600 dark:text-amber-400",
    stepBg: "bg-amber-500/10", stepText: "text-amber-600 dark:text-amber-400",
    activeSidebar: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    sidebarDot: "bg-amber-600 dark:bg-amber-400",
  },
  pink: {
    icon: "text-pink-600 dark:text-pink-400", iconBg: "bg-pink-500/10",
    tag: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    tipBg: "bg-pink-50/50 dark:bg-pink-500/[0.04]", tipTag: "bg-pink-500/5 dark:bg-pink-500/10",
    tipText: "text-pink-600 dark:text-pink-400",
    stepBg: "bg-pink-500/10", stepText: "text-pink-600 dark:text-pink-400",
    activeSidebar: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    sidebarDot: "bg-pink-600 dark:bg-pink-400",
  },
  violet: {
    icon: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10",
    tag: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    tipBg: "bg-violet-50/50 dark:bg-violet-500/[0.04]", tipTag: "bg-violet-500/5 dark:bg-violet-500/10",
    tipText: "text-violet-600 dark:text-violet-400",
    stepBg: "bg-violet-500/10", stepText: "text-violet-600 dark:text-violet-400",
    activeSidebar: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    sidebarDot: "bg-violet-600 dark:bg-violet-400",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10",
    tag: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    tipBg: "bg-emerald-50/50 dark:bg-emerald-500/[0.04]", tipTag: "bg-emerald-500/5 dark:bg-emerald-500/10",
    tipText: "text-emerald-600 dark:text-emerald-400",
    stepBg: "bg-emerald-500/10", stepText: "text-emerald-600 dark:text-emerald-400",
    activeSidebar: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    sidebarDot: "bg-emerald-600 dark:bg-emerald-400",
  },
  slate: {
    icon: "text-slate-600 dark:text-slate-400", iconBg: "bg-slate-500/10",
    tag: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    tipBg: "bg-slate-50/50 dark:bg-slate-500/[0.04]", tipTag: "bg-slate-500/5 dark:bg-slate-500/10",
    tipText: "text-slate-600 dark:text-slate-400",
    stepBg: "bg-slate-500/10", stepText: "text-slate-600 dark:text-slate-400",
    activeSidebar: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    sidebarDot: "bg-slate-600 dark:bg-slate-400",
  },
};

interface DocSection {
  id: string;
  color: SectionColor;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  overview: string;
  features: FeatureDetail[];
}

const sections: DocSection[] = [
  {
    id: "home",
    color: "indigo",
    icon: Home,
    title: "首頁",
    subtitle: "校園資訊入口",
    overview:
      "首頁是您進入平台的第一個畫面，整合了所有常用功能與即時資訊。所有區塊都可以在「設定」中調整顯示順序或隱藏，打造屬於您的個人化頁面。",
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
        tips: ["最新公告模態框會在第一時間彈出通知重要訊息", "可在「公告」頁面查看更多歷史公告"],
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
    id: "search",
    color: "cyan",
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
    id: "announcements",
    color: "amber",
    icon: Megaphone,
    title: "公告",
    subtitle: "校園公告總覽",
    overview:
      "公告頁面讓您瀏覽學校發布的所有公告，支援分類瀏覽、全文展開、附件檢視與收藏功能。",
    features: [
      {
        icon: Megaphone,
        label: "分類瀏覽",
        summary: "依發佈單位（教務處、學務處、總務處、輔導室等）篩選公告。",
        usage: [
          { title: "切換分類", desc: "點擊頂部分類按鈕可切換顯示特定單位的公告。" },
          { title: "檢列表", desc: "公告以列表形式呈現，包含日期、標題與分類標籤。" },
        ],
        tips: ["分類按鈕會顯示各分類的公告數量"],
      },
      {
        icon: ExternalLink,
        label: "全文展開",
        summary: "在頁面內直接展開公告全文，無需跳轉至學校網站。",
        usage: [
          { title: "展開內容", desc: "點擊公告標題即可展開該公告的詳細內容。" },
          { title: "收起內容", desc: "再次點擊標題或點擊其他公告會收起目前展開的內容。" },
        ],
        tips: ["展開的公告會顯示完整內文與附件連結"],
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
    color: "pink",
    icon: Star,
    title: "收藏",
    subtitle: "我的收藏",
    overview:
      "收藏頁面集中管理您所有已收藏的公告與榮譽榜項目，支援分類檢視與快速取消收藏。",
    features: [
      {
        icon: Star,
        label: "分類檢視",
        summary: "依類型（公告 / 榮譽榜）分類瀏覽收藏內容，快速找到特定項目。",
        usage: [
          { title: "切換分頁", desc: "使用「公告」與「榮譽榜」分頁切換檢視不同類型的收藏。" },
          { title: "檢視項目", desc: "收藏項目以卡片列表顯示，包含標題、日期與原始連結。" },
        ],
        tips: ["收藏的資料會在所有裝置間同步（需登入同一個瀏覽器帳號）"],
      },
      {
        icon: Star,
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
    id: "tools",
    color: "violet",
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
    color: "emerald",
    icon: Settings,
    title: "設定",
    subtitle: "個人化設定",
    overview:
      "設定頁面讓您依照個人喜好調整平台的外觀與功能，打造最適合您的使用體驗。所有設定會自動儲存在瀏覽器中。",
    features: [
      {
        icon: Settings,
        label: "頁面背景",
        summary: "選擇不同風格的頁面背景，包含預設純色背景與自訂圖片背景。",
        usage: [
          { title: "選擇背景類型", desc: "在設定中可切換「預設背景」與「自訂圖片」兩種模式。" },
          { title: "上傳圖片", desc: "選擇自訂圖片後，可上傳自己的圖片作為頁面背景。" },
        ],
        tips: ["自訂背景圖片支援 JPG、PNG 等主流格式", "使用自訂背景時，元件會自動套用半透明效果以保持可讀性"],
      },
      {
        icon: Settings,
        label: "主題色彩",
        summary: "內建多種主題配色，一鍵切換全局色彩風格。",
        usage: [
          { title: "選擇主題", desc: "在設定中從 7 種主題配色中選擇喜歡的風格：藍色、綠色、桃紅、極簡、霓虹、橘色、漸層。" },
          { title: "即時預覽", desc: "選擇主題後會即時套用，讓您立即看到效果。" },
        ],
        tips: ["主題色彩影響所有頁面與元件", "不同主題也調整了深色模式的對應配色"],
      },
      {
        icon: Settings,
        label: "深色模式",
        summary: "支援深色 / 淺色模式切換，減輕眼睛疲勞。",
        usage: [
          { title: "切換模式", desc: "在設定中可手動切換深色或淺色模式。" },
          { title: "跟隨系統", desc: "開啟「跟隨系統」選項後，會自動根據作業系統設定切換深淺色模式。" },
        ],
        tips: ["深色模式在夜間使用可減輕眼睛疲勞", "所有元件與頁面都完整支援深色模式"],
      },
      {
        icon: Settings,
        label: "元件管理",
        summary: "調整首頁各區塊的顯示順序與開關，自由排列資訊入口。",
        usage: [
          { title: "啟用 / 停用元件", desc: "在設定中可勾選或取消勾選要在首頁顯示的區塊。" },
          { title: "調整順序", desc: "拖曳元件旁的把手可調整各區塊在首頁的顯示順序。" },
        ],
        tips: ["關閉的元件不會在首頁顯示，但設定不受影響", "調整會即時反映在首頁上"],
      },
    ],
  },
  {
    id: "admin",
    color: "slate",
    icon: Shield,
    title: "管理",
    subtitle: "網站後台",
    overview:
      "管理頁面提供網站後台功能，需具備管理員權限才能存取。用於維護網站內容與監控系統狀態。",
    features: [
      {
        icon: Shield,
        label: "維護模式",
        summary: "開啟後一般使用者無法瀏覽網站，適合系統維護期間使用。",
        usage: [
          { title: "開啟維護", desc: "在管理頁面中開啟維護模式，並可設定維護結束時間與顯示訊息。" },
          { title: "白名單", desc: "管理員可將特定使用者加入白名單，使其在維護期間仍可正常瀏覽。" },
        ],
        tips: ["維護模式開啟後，一般使用者會看到維護提示畫面", "白名單使用者的設定儲存在瀏覽器中"],
      },
      {
        icon: Shield,
        label: "系統狀態",
        summary: "查看各項資料來源的運作狀態與更新時間。",
        usage: [
          { title: "檢視狀態", desc: "在管理頁面可查看所有資料來源（公告、榮譽榜、午餐等）的最新更新時間。" },
          { title: "監控運作", desc: "若某項資料來源異常，會顯示警示資訊協助排查問題。" },
        ],
        tips: ["資料更新時間顯示為自動同步的時間"],
      },
      {
        icon: Shield,
        label: "版本管理",
        summary: "檢查當前版本與最新版本，確保使用最新功能。",
        usage: [
          { title: "檢視版本", desc: "在管理頁面可查看目前使用的版本號碼與最新可用版本。" },
          { title: "更新版本", desc: "若有新版本可更新，系統會提示並提供更新操作。" },
        ],
        tips: ["建議保持最新版本以獲得最佳體驗與安全性"],
      },
    ],
  },
];

const sectionIds = sections.map((s) => s.id);

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

export default function Docs() {
  const navigate = useNavigate();
  const activeSection = useActiveSection();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sectionIds.includes(hash)) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const handleSectionClick = useCallback((id: string) => {
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    try {
      const stored = localStorage.getItem("cmjh-app-settings");
      if (stored) {
        const settings = JSON.parse(stored);
        settings.themeMode = next ? "dark" : "light";
        localStorage.setItem("cmjh-app-settings", JSON.stringify(settings));
      }
    } catch { /* ignore */ }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setIsScrolled(el.scrollTop > 20);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col force-default-theme">
      <NavPill
        links={[
          { label: "首頁", href: "/home" },
          { label: "文檔", href: "/docs" },
        ]}
        isScrolled={isScrolled}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative pt-16">
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-card border-l border-border/50 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-card border-b border-border/30 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">目錄</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 space-y-0.5">
              {sections.map((section) => {
                const Icon = section.icon;
                const colors = colorSets[section.color];
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                      isActive
                        ? colors.activeSidebar
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{section.title}</span>
                    {isActive && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${colors.sidebarDot}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <aside className="hidden lg:block fixed left-0 top-[72px] w-56 xl:w-64 h-[calc(100vh-4.5rem)] overflow-y-auto border-r border-border/30 py-6 px-3 bg-background z-30">
          <div className="mb-4 px-3">
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">
              <span className="hidden xl:inline">目錄導覽</span>
              <span className="xl:hidden">目錄</span>
            </p>
          </div>
          <div className="space-y-0.5">
            {sections.map((section) => {
              const Icon = section.icon;
              const colors = colorSets[section.color];
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left group",
                    isActive
                      ? colors.activeSidebar
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  <span>{section.title}</span>
                  {isActive && (
                    <span className={`ml-auto w-1 h-4 rounded-full shrink-0 ${colors.sidebarDot}`} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-[calc(100vh-4.5rem)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="mb-16">
              <div className="flex items-center gap-5 mb-5">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 shrink-0">
                  <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-['Atkinson_Hyperlegible'] font-bold text-foreground tracking-tight">
                    使用說明
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    崇明國中校園資訊平台 — 完整功能指南
                  </p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                歡迎使用崇明國中校園資訊平台！本文件將詳細介紹平台的各項功能與操作方法。
                您可以透過左側目錄或頂部分類快速跳轉到感興趣的主題。
              </p>
            </div>

            {sections.map((section, sectionIdx) => {
              const Icon = section.icon;
              const colors = colorSets[section.color];
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={cn(
                    "scroll-mt-20",
                    sectionIdx > 0 && "mt-14"
                  )}
                >
                  <div className="mb-8 pb-6 border-b border-border/15">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 ${colors.iconBg}`}>
                        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="text-xl sm:text-2xl font-['Atkinson_Hyperlegible'] font-bold text-foreground tracking-tight">
                            {section.title}
                          </h3>
                          <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${colors.tag}`}>
                            {section.subtitle}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                      {section.overview}
                    </p>
                  </div>

                  <div className="space-y-5">
                    {section.features.map((feature, fi) => {
                      const FeatIcon = feature.icon;
                      return (
                        <div
                          key={fi}
                          className="rounded-xl border border-border/15 bg-card shadow-sm overflow-hidden hover:shadow-md hover:border-border/30 transition-all duration-200"
                        >
                          <div className="p-5 sm:p-6">
                            <div className="flex items-start gap-4 mb-5">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${colors.iconBg} ${colors.icon}`}>
                                <FeatIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base sm:text-lg font-bold text-foreground">
                                  {feature.label}
                                </h4>
                                <p className="text-sm sm:text-base text-muted-foreground mt-1.5 leading-relaxed">
                                  {feature.summary}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3 sm:ml-[54px]">
                              {feature.usage.map((step, si) => (
                                <div
                                  key={si}
                                  className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/40"
                                >
                                  <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold shrink-0 mt-0.5 ${colors.stepBg} ${colors.stepText}`}>
                                    {si + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm sm:text-base font-semibold text-foreground mb-1 leading-relaxed">
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
                            <div className={`border-t border-border/10 px-5 sm:px-6 py-4 ${colors.tipBg}`}>
                              <p className={`text-xs font-semibold mb-2.5 flex items-center gap-1.5 ${colors.tipText}`}>
                                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current shrink-0">
                                  <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm9-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7.5 7.5A.5.5 0 0 1 8 7h.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H8a.5.5 0 0 1-.5-.5v-4z" />
                                </svg>
                                小提醒
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {feature.tips.map((tip, ti) => (
                                  <span
                                    key={ti}
                                    className={`inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground px-3 py-1.5 rounded-lg ${colors.tipTag}`}
                                  >
                                    {tip}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <footer className="mt-20 border-t border-border/15 pt-10 pb-16 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60 mb-3">
                <BookOpen className="h-4 w-4" />
                <span className="font-['Atkinson_Hyperlegible']">崇明國中校園資訊平台 — 使用說明</span>
              </div>
              <p className="text-sm text-muted-foreground/40">
                &copy; 2026 崇明國中 by cy.noc0531
              </p>
              <button
                type="button"
                onClick={() => navigate("/app")}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                返回首頁
              </button>
            </footer>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
