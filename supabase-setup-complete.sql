-- ============================================
-- CMJH 崇明國中資訊平台 — 完整 Supabase 設定
-- 在 Supabase Dashboard > SQL Editor 執行此腳本即可
-- 支援重複執行（已做冪等處理）
-- ============================================

-- ============================================
-- 第一部：訪問計數器（site_visits）
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

-- 3. 建立遞增函數（跨日自動重置今日計數）
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

  UPDATE site_visits
  SET count = count + 1, today_count = today_count + 1, updated_at = NOW()
  WHERE id = 1
  RETURNING json_build_object('total', count, 'today', today_count) INTO v_result;

  RETURN v_result;
END;
$$;

-- 4. 唯讀函數（純讀取不遞增）
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

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read visit count" ON site_visits;
CREATE POLICY "Anyone can read visit count" ON site_visits
  FOR SELECT USING (true);

GRANT EXECUTE ON FUNCTION increment_visit_count() TO anon;
GRANT EXECUTE ON FUNCTION get_visit_stats() TO anon;


-- ============================================
-- 第二部：站台設定與管理後台
-- ============================================

-- 5. 站台設定表（單行，id 固定為 1）
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

-- 6. 預設倒數計時表
CREATE TABLE IF NOT EXISTS site_countdowns (
  id TEXT PRIMARY KEY,
  target_date TIMESTAMPTZ NOT NULL,
  start_date TIMESTAMPTZ,
  label TEXT NOT NULL,
  progress_label TEXT NOT NULL DEFAULT '進度',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_countdowns (id, target_date, start_date, label, progress_label, sort_order) VALUES
  ('default-1', '2026-06-25T16:00:00Z', '2026-05-07T16:00:00Z', '📄第三次段考倒數 6/25 6/26', '上次至本次進度條', 0),
  ('default-2', '2027-05-15T16:00:00Z', '2026-05-18T16:00:00Z', '116 會考倒數🕒', '上次至本次進度條', 1),
  ('default-3', '2026-12-31T16:00:00Z', '2025-12-31T16:00:00Z', '2027年倒數', '2026年進度條', 2)
ON CONFLICT (id) DO NOTHING;

-- 7. 站台公告表
CREATE TABLE IF NOT EXISTS site_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  pinned BOOLEAN NOT NULL DEFAULT false,
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_announcements (id, title, date, type, pinned, content, sort_order) VALUES
  ('sticky-top', '歡迎使用 CMJH 資訊平台 🎉', CURRENT_DATE, 'alert', true, '感謝使用崇明國中資訊平台！您可以透過設定頁面自訂首頁佈局，或在管理後台調整網站設定。', 0)
ON CONFLICT (id) DO NOTHING;

-- 8. Row Level Security
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

-- 9. 管理密碼驗證函數
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

-- 10. 更新 site_config 的管理函數
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

-- 11. 更新 countdowns 的管理函數
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
    label TEXT, progress_label TEXT, sort_order INT, active BOOLEAN
  )
  LOOP
    INSERT INTO site_countdowns (id, target_date, start_date, label, progress_label, sort_order, active)
    VALUES (
      v_countdown.id,
      v_countdown.target_date::timestamptz,
      CASE WHEN v_countdown.start_date IS NOT NULL AND v_countdown.start_date != '' THEN v_countdown.start_date::timestamptz ELSE NULL END,
      v_countdown.label,
      COALESCE(v_countdown.progress_label, '進度'),
      COALESCE(v_countdown.sort_order, 0),
      COALESCE(v_countdown.active, true)
    );
  END LOOP;

  RETURN true;
END;
$$;

-- 12. 更新 announcements 的管理函數
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
    pinned BOOLEAN, content TEXT, sort_order INT, active BOOLEAN
  )
  LOOP
    INSERT INTO site_announcements (id, title, date, type, pinned, content, sort_order, active)
    VALUES (
      COALESCE(v_ann.id, 'ann-' || gen_random_uuid()::text),
      v_ann.title,
      v_ann.date::date,
      COALESCE(v_ann.type, 'info'),
      COALESCE(v_ann.pinned, false),
      COALESCE(v_ann.content, ''),
      COALESCE(v_ann.sort_order, 0),
      COALESCE(v_ann.active, true)
    );
  END LOOP;

  RETURN true;
END;
$$;

-- 13. 授予函數執行權限
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_site_config(TEXT, JSONB, JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_site_countdowns(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION update_site_announcements(TEXT, JSONB) TO anon;
