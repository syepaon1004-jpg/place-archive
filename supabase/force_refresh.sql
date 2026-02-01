-- Supabase API 스키마 캐시 강제 새로고침

-- 1. PostgREST에 스키마 리로드 알림
NOTIFY pgrst, 'reload schema';

-- 2. PostgREST에 설정 리로드 알림
NOTIFY pgrst, 'reload config';

-- 3. 완료 메시지
SELECT 'Schema cache refreshed! Please wait 10 seconds and refresh browser.' as message;
