-- ============================================
-- CMJH 崇明國中資訊平台 — 完整 Supabase 設定
-- 在 Supabase Dashboard > SQL Editor 執行此腳本即可
-- 支援重複執行（已做冪等處理）
-- ============================================

-- ============================================
-- 第一部：訪問計數器（site_visits + visit_daily）
-- ============================================

-- 1. 建立訪問計數表
CREATE TABLE IF NOT EXISTS site_visits (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  count INTEGER NOT NULL DEFAULT 0,
  today_count INTEGER NOT NULL DEFAULT 0,
  today_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 插入初始資料列
INSERT INTO site_visits (id, count) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. 建立每日訪問統計表（1 天只存 1 列，節省空間）
CREATE TABLE IF NOT EXISTS visit_daily (
  date DATE PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE visit_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read visit_daily" ON visit_daily;
CREATE POLICY "Anyone can read visit_daily" ON visit_daily
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert visit_daily" ON visit_daily;
CREATE POLICY "Anyone can insert visit_daily" ON visit_daily
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update visit_daily" ON visit_daily;
CREATE POLICY "Anyone can update visit_daily" ON visit_daily
  FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON visit_daily TO anon;

-- 4. 建立遞增函數（跨日自動重置今日計數 + 寫入每日統計）
DROP FUNCTION IF EXISTS increment_visit_count() CASCADE;

CREATE FUNCTION increment_visit_count()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- 跨日時重置今日計數
  IF (SELECT today_date FROM site_visits WHERE id = 1) < CURRENT_DATE THEN
    UPDATE site_visits SET today_count = 0, today_date = CURRENT_DATE WHERE id = 1;
  END IF;

  -- 遞增計數器
  UPDATE site_visits
  SET count = count + 1, today_count = today_count + 1, updated_at = NOW()
  WHERE id = 1
  RETURNING json_build_object('total', count, 'today', today_count) INTO v_result;

  -- 寫入每日統計（當天已有就 +1，沒有就新增）
  INSERT INTO visit_daily (date, count) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET count = visit_daily.count + 1;

  RETURN v_result;
END;
$$;

-- 5. 唯讀函數——純讀取總數與今日（不遞增）
CREATE OR REPLACE FUNCTION get_visit_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT json_build_object('total', count, 'today', today_count)
  FROM site_visits
  WHERE id = 1;
$$;

-- 6. 取得分時段訪問統計（從每日統計表計算）
CREATE OR REPLACE FUNCTION get_visit_stats_by_period()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT json_build_object(
    'today',
    COALESCE((SELECT count FROM visit_daily WHERE date = CURRENT_DATE), 0)::int,
    'this_week',
    COALESCE((SELECT SUM(count)::int FROM visit_daily WHERE date >= date_trunc('week', CURRENT_DATE)::date), 0),
    'this_month',
    COALESCE((SELECT SUM(count)::int FROM visit_daily WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)::date), 0),
    'this_year',
    COALESCE((SELECT SUM(count)::int FROM visit_daily WHERE date_trunc('year', date) = date_trunc('year', CURRENT_DATE)::date), 0),
    'total',
    COALESCE((SELECT count FROM site_visits WHERE id = 1), 0)::int
  );
$$;

-- 7. 取得每日訪問趨勢（供圖表使用，回傳最近 N 天）
CREATE OR REPLACE FUNCTION get_daily_visits(days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT COALESCE(
    (SELECT json_agg(
      json_build_object(
        'date', d.date::text,
        'count', d.count
      )
      ORDER BY d.date ASC
    )::text::json
    FROM visit_daily d
    WHERE d.date >= (CURRENT_DATE - (days - 1)::integer)
      AND d.date <= CURRENT_DATE),
    '[]'::json
  );
$$;

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read visit count" ON site_visits;
CREATE POLICY "Anyone can read visit count" ON site_visits
  FOR SELECT USING (true);

GRANT EXECUTE ON FUNCTION increment_visit_count() TO anon;
GRANT EXECUTE ON FUNCTION get_visit_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_visit_stats_by_period() TO anon;
GRANT EXECUTE ON FUNCTION get_daily_visits(INTEGER) TO anon;


-- ============================================
-- 第二部：站台設定與管理後台
-- ============================================

-- 8. 站台設定表（單行，id 固定為 1）
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash TEXT NOT NULL DEFAULT '',
  maintenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  app_version JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_config (id, password_hash, maintenance, app_version)
VALUES (
  1,
  '',
  jsonb_build_object(
    'isMaintenance', false,
    'showTimer', true,
    'maintenanceEndTime', '2026-02-22T12:00:00+08:00',
    'title', '過年期間暫停服務',
    'message', '2/14-2/22 期間網頁不開放，請留意'
  ),
  jsonb_build_object(
    'latestVersion', 'v1.5.4',
    'releaseHighlights', jsonb_build_array('修復編碼', '時鐘功能更新', '隨機轉盤優化', '添加MIT授權')
  )
)
ON CONFLICT (id) DO NOTHING;

-- 9. 預設倒數計時表
CREATE TABLE IF NOT EXISTS site_countdowns (
  id TEXT PRIMARY KEY,
  target_date TIMESTAMPTZ NOT NULL,
  start_date TIMESTAMPTZ,
  label TEXT NOT NULL,
  progress_label TEXT NOT NULL DEFAULT '進度',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  grade TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_countdowns (id, target_date, start_date, label, progress_label, sort_order, grade) VALUES
  ('default-1', '2026-06-25T16:00:00Z', '2026-05-07T16:00:00Z', '📄第三次段考倒數 6/25 6/26', '上次至本次進度條', 0, NULL),
  ('default-2', '2027-05-15T16:00:00Z', '2026-05-18T16:00:00Z', '116 會考倒數🕒', '上次至本次進度條', 1, '9'),
  ('default-3', '2026-12-31T16:00:00Z', '2025-12-31T16:00:00Z', '2027年倒數', '2026年進度條', 2, NULL)
ON CONFLICT (id) DO NOTHING;

-- 10. 站台公告表
CREATE TABLE IF NOT EXISTS site_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  pinned BOOLEAN NOT NULL DEFAULT false,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_announcements (id, title, date, type, pinned, content, sort_order) VALUES
  ('sticky-top', '歡迎使用 CMJH 資訊平台 🎉', CURRENT_DATE, 'alert', true, '感謝使用崇明國中資訊平台！您可以透過設定頁面自訂首頁佈局，或在管理後台調整網站設定。', 0)
ON CONFLICT (id) DO NOTHING;

-- 11. Row Level Security
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site_config" ON site_config;
DROP POLICY IF EXISTS "Anyone can read site_countdowns" ON site_countdowns;
DROP POLICY IF EXISTS "Anyone can read site_announcements" ON site_announcements;

CREATE POLICY "Anyone can read site_config" ON site_config
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read site_countdowns" ON site_countdowns
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read site_announcements" ON site_announcements
  FOR SELECT USING (true);

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON site_visits TO anon;
GRANT SELECT ON site_config TO anon;
GRANT SELECT ON site_countdowns TO anon;
GRANT SELECT ON site_announcements TO anon;

-- ============================================
-- 第三部：管理密碼驗證（SHA-256 直接比對）
-- ============================================
-- 密碼雜湊流程（全在瀏覽器端完成）：
--   使用者輸入密碼 → SHA-256 → 傳送 64 字元十六進位字串
--   資料庫只負責儲存與比對此字串
-- 密碼變更流程：
--   新密碼 → SHA-256 → 傳送 64 字元十六進位字串 → 資料庫直接儲存
-- ============================================

-- 12. 管理密碼驗證函數
CREATE OR REPLACE FUNCTION verify_admin_password(input_password_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
DECLARE
  v_stored_hash TEXT;
BEGIN
  v_stored_hash := (SELECT password_hash FROM site_config WHERE id = 1);

  -- 無密碼或空白密碼：回傳 false
  IF v_stored_hash IS NULL OR v_stored_hash = '' THEN
    RETURN false;
  END IF;

  -- 直接比對 SHA-256 雜湊（前端傳來的已是 SHA-256 十六進位字串）
  IF v_stored_hash = input_password_hash THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- 13. 更新 site_config 的管理函數
CREATE OR REPLACE FUNCTION update_site_config(
  input_password_hash TEXT,
  new_maintenance JSONB,
  new_app_version JSONB,
  new_password_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_stored_hash TEXT;
BEGIN
  v_stored_hash := (SELECT password_hash FROM site_config WHERE id = 1);

  -- 尚未設定密碼：允許直接設定（首次使用）
  IF v_stored_hash IS NULL OR v_stored_hash = '' THEN
    UPDATE site_config
    SET
      maintenance = COALESCE(new_maintenance, maintenance),
      app_version = COALESCE(new_app_version, app_version),
      password_hash = CASE
        WHEN new_password_hash IS NOT NULL AND new_password_hash != ''
        THEN new_password_hash
        ELSE password_hash
      END,
      updated_at = NOW()
    WHERE id = 1;
    RETURN true;
  END IF;

  -- 驗證密碼
  IF v_stored_hash != input_password_hash THEN
    RETURN false;
  END IF;

  -- 執行更新
  UPDATE site_config
  SET
    maintenance = COALESCE(new_maintenance, maintenance),
    app_version = COALESCE(new_app_version, app_version),
    password_hash = CASE
      WHEN new_password_hash IS NOT NULL AND new_password_hash != ''
      THEN new_password_hash
      ELSE password_hash
    END,
    updated_at = NOW()
  WHERE id = 1;

  RETURN true;
END;
$$;

-- 14. 更新 countdowns 的管理函數
CREATE OR REPLACE FUNCTION update_site_countdowns(
  input_password_hash TEXT,
  countdowns JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_countdown RECORD;
  v_stored_hash TEXT;
BEGIN
  v_stored_hash := (SELECT password_hash FROM site_config WHERE id = 1);

  -- 密碼驗證（尚未設定密碼時允許操作）
  IF v_stored_hash IS NOT NULL AND v_stored_hash != '' THEN
    IF v_stored_hash != input_password_hash THEN
      RETURN false;
    END IF;
  END IF;

  DELETE FROM site_countdowns WHERE true;

  FOR v_countdown IN SELECT * FROM jsonb_to_recordset(countdowns) AS x(
    id TEXT, target_date TEXT, start_date TEXT,
    label TEXT, progress_label TEXT, sort_order INT, active BOOLEAN, grade TEXT
  )
  LOOP
    INSERT INTO site_countdowns (id, target_date, start_date, label, progress_label, sort_order, active, grade)
    VALUES (
      v_countdown.id,
      v_countdown.target_date::timestamptz,
      CASE WHEN v_countdown.start_date IS NOT NULL AND v_countdown.start_date != '' THEN v_countdown.start_date::timestamptz ELSE NULL END,
      v_countdown.label,
      COALESCE(v_countdown.progress_label, '進度'),
      COALESCE(v_countdown.sort_order, 0),
      COALESCE(v_countdown.active, true),
      NULLIF(v_countdown.grade, '')
    );
  END LOOP;

  RETURN true;
END;
$$;

-- 15. 更新 announcements 的管理函數
CREATE OR REPLACE FUNCTION update_site_announcements(
  input_password_hash TEXT,
  announcements JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_ann RECORD;
  v_stored_hash TEXT;
BEGIN
  v_stored_hash := (SELECT password_hash FROM site_config WHERE id = 1);

  -- 密碼驗證（尚未設定密碼時允許操作）
  IF v_stored_hash IS NOT NULL AND v_stored_hash != '' THEN
    IF v_stored_hash != input_password_hash THEN
      RETURN false;
    END IF;
  END IF;

  DELETE FROM site_announcements WHERE true;

  FOR v_ann IN SELECT * FROM jsonb_to_recordset(announcements) AS x(
    id TEXT, title TEXT, date TEXT, type TEXT,
    pinned BOOLEAN, content TEXT, image_url TEXT,
    sort_order INT, active BOOLEAN
  )
  LOOP
    INSERT INTO site_announcements (id, title, date, type, pinned, content, image_url, sort_order, active)
    VALUES (
      COALESCE(v_ann.id, 'ann-' || gen_random_uuid()::text),
      v_ann.title,
      v_ann.date::date,
      COALESCE(v_ann.type, 'info'),
      COALESCE(v_ann.pinned, false),
      COALESCE(v_ann.content, ''),
      NULLIF(v_ann.image_url, ''),
      COALESCE(v_ann.sort_order, 0),
      COALESCE(v_ann.active, true)
    );
  END LOOP;

  RETURN true;
END;
$$;

-- 16. 授予函數執行權限
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_site_config(TEXT, JSONB, JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_site_countdowns(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION update_site_announcements(TEXT, JSONB) TO anon;

-- ============================================
-- 第四部：公告圖片儲存空間 (Supabase Storage)
-- ============================================

-- 17. 建立公告圖片的儲存桶（上限 5MB，僅允許圖片格式）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-images',
  'announcement-images',
  true,
  5242880,
  '{"image/png","image/jpeg","image/gif","image/webp"}'
)
ON CONFLICT (id) DO NOTHING;

-- 18. 允許任何人讀取公告圖片
DROP POLICY IF EXISTS "Public read access for announcement-images" ON storage.objects;
CREATE POLICY "Public read access for announcement-images"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'announcement-images');

-- 19. 允許任何人上傳公告圖片（用於管理後台）
DROP POLICY IF EXISTS "Anon upload access for announcement-images" ON storage.objects;
CREATE POLICY "Anon upload access for announcement-images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'announcement-images');
