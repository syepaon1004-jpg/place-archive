-- Supabase 권한 및 RLS 상태 확인

-- 1. 현재 RLS 상태 확인
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'categories', 'places', 'user_places');

-- 2. 테이블 권한 확인
SELECT 
  grantee, 
  table_schema, 
  table_name, 
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('users', 'categories', 'places', 'user_places')
  AND grantee IN ('anon', 'authenticated', 'postgres')
ORDER BY table_name, grantee;

-- 3. 현재 역할 확인
SELECT current_user, current_role;

-- 4. anon 역할이 존재하는지 확인
SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated');
