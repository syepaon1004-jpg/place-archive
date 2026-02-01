-- 위치 필드 추가

-- 1. user_places 테이블에 location 컬럼 추가
ALTER TABLE user_places 
ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- 2. 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_places_location ON user_places(location);

-- 완료 메시지
SELECT 'Location field added successfully!' as message;
