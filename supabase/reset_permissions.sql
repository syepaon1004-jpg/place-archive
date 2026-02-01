-- Supabase API 접근 권한 완전 수정

-- 1. 먼저 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable all for anon" ON users;
DROP POLICY IF EXISTS "Public read access" ON users;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON places;
DROP POLICY IF EXISTS "Enable insert for all users" ON places;

DROP POLICY IF EXISTS "Enable read access for all users" ON user_places;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_places;

-- 2. RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE places DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_places DISABLE ROW LEVEL SECURITY;

-- 3. 테이블 소유자 변경 (postgres로)
ALTER TABLE users OWNER TO postgres;
ALTER TABLE categories OWNER TO postgres;
ALTER TABLE places OWNER TO postgres;
ALTER TABLE user_places OWNER TO postgres;

-- 4. 모든 권한 취소 후 재부여
REVOKE ALL ON users FROM anon, authenticated;
REVOKE ALL ON categories FROM anon, authenticated;
REVOKE ALL ON places FROM anon, authenticated;
REVOKE ALL ON user_places FROM anon, authenticated;

-- 5. 명시적으로 모든 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON places TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_places TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_places TO authenticated;

-- 6. 시퀀스 권한
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. 스키마 권한
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 8. 확인
SELECT 'Permissions reset successfully!' as message;

-- 9. 권한 확인
SELECT 
  grantee, 
  table_name, 
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;
