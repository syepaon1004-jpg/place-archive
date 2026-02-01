-- users 테이블 이름을 app_users로 변경

-- 1. 테이블 이름 변경
ALTER TABLE IF EXISTS public.users RENAME TO app_users;

-- 2. 인덱스가 있다면 이름도 변경될 것임

-- 3. 확인
SELECT 'Table renamed successfully!' as message;

-- 4. 테이블 목록 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'app_users');
