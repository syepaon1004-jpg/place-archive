-- app_users 테이블에 권한 부여

-- 1. RLS 비활성화
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- 2. 테이블 소유자 확인 및 변경
ALTER TABLE app_users OWNER TO postgres;

-- 3. anon 역할에 모든 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON app_users TO anon;

-- 4. authenticated 역할에도 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON app_users TO authenticated;

-- 5. 확인
SELECT 'Permissions granted to app_users successfully!' as message;

-- 6. 권한 확인
SELECT 
  grantee, 
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'app_users'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;
