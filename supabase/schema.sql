-- itsMe 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요.

-- 1. profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username        text UNIQUE NOT NULL,
  display_name    text NOT NULL DEFAULT '',
  bio             text NOT NULL DEFAULT '',
  avatar_url      text,
  phone           text,
  email           text,
  -- 계좌 / 송금 정보 (/{username}/pay 페이지에서만 노출)
  bank_name       text,
  account_number  text,
  account_holder  text,
  kakao_pay_url   text,
  toss_url        text,
  -- 명함 표시 설정
  show_bio        boolean NOT NULL DEFAULT true,
  show_email      boolean NOT NULL DEFAULT true,
  show_phone      boolean NOT NULL DEFAULT true,
  show_vcard      boolean NOT NULL DEFAULT true,
  show_pay        boolean NOT NULL DEFAULT true,
  -- 명함 테마
  theme           text NOT NULL DEFAULT 'default',
  text_color      text NOT NULL DEFAULT 'black',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. links 테이블
CREATE TABLE IF NOT EXISTS links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  url         text NOT NULL,
  icon        text,
  order_index int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. 신규 유저 가입 시 빈 프로필 자동 생성 (선택)
-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO profiles (user_id, username, display_name)
--   VALUES (NEW.id, NEW.email, NEW.email);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Row Level Security 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- profiles RLS
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE USING (auth.uid() = user_id);

-- links RLS
DROP POLICY IF EXISTS "links_select_all" ON links;
DROP POLICY IF EXISTS "links_insert_own" ON links;
DROP POLICY IF EXISTS "links_update_own" ON links;
DROP POLICY IF EXISTS "links_delete_own" ON links;

CREATE POLICY "links_select_all"
  ON links FOR SELECT USING (true);

CREATE POLICY "links_insert_own"
  ON links FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "links_update_own"
  ON links FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "links_delete_own"
  ON links FOR DELETE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- 6. Storage bucket 생성 (Supabase Dashboard > Storage에서도 가능)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_select_all" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

CREATE POLICY "avatars_select_all"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. 링크 커스텀 아이콘 Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('link-icons', 'link-icons', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "link_icons_select_all" ON storage.objects;
DROP POLICY IF EXISTS "link_icons_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "link_icons_update_own" ON storage.objects;
DROP POLICY IF EXISTS "link_icons_delete_own" ON storage.objects;

CREATE POLICY "link_icons_select_all"
  ON storage.objects FOR SELECT USING (bucket_id = 'link-icons');

CREATE POLICY "link_icons_insert_own"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'link-icons' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "link_icons_update_own"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'link-icons' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "link_icons_delete_own"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'link-icons' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 9. 방문자 로그 테이블
CREATE TABLE IF NOT EXISTS page_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path        text NOT NULL,
  referrer    text,
  user_agent  text,
  visited_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "page_views_insert_all" ON page_views;
DROP POLICY IF EXISTS "page_views_select_all" ON page_views;

-- 비로그인 방문자도 삽입 가능
CREATE POLICY "page_views_insert_all"
  ON page_views FOR INSERT WITH CHECK (true);

-- 조회는 로그인 유저만
CREATE POLICY "page_views_select_auth"
  ON page_views FOR SELECT USING (auth.role() = 'authenticated');

-- 8. 기존 테이블에 신규 컬럼 추가 (이미 존재하면 무시)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_bio       boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_email     boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_phone     boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_vcard     boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_pay       boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme          text NOT NULL DEFAULT 'default';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS text_color     text NOT NULL DEFAULT 'black';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS button_color   text;
