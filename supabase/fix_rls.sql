-- RLS (Row Level Security) 완전 비활성화 및 권한 부여

-- 1. 모든 테이블의 RLS 비활성화
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS places DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_places DISABLE ROW LEVEL SECURITY;

-- 2. anon 역할에 모든 권한 부여 (개발 환경용)
GRANT ALL ON users TO anon;
GRANT ALL ON categories TO anon;
GRANT ALL ON places TO anon;
GRANT ALL ON user_places TO anon;

-- 3. authenticated 역할에도 권한 부여
GRANT ALL ON users TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON places TO authenticated;
GRANT ALL ON user_places TO authenticated;

-- 4. 시퀀스 권한 부여 (필요한 경우)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. 확인 쿼리
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'categories', 'places', 'user_places');

-- 완료 메시지
SELECT 'RLS disabled and permissions granted successfully!' as message;
