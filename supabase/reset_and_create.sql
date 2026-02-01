-- Place Archive 데이터베이스 초기화 및 생성
-- 기존 데이터를 모두 삭제하고 새로 만듭니다

-- 1. 기존 테이블 삭제 (CASCADE로 트리거도 자동 삭제됨)
DROP TABLE IF EXISTS user_places CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 기존 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. 사용자 테이블 생성
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 카테고리 테이블 생성
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 기본 카테고리 데이터 삽입
INSERT INTO categories (name, icon, color) VALUES
  ('카페', '☕', '#8B4513'),
  ('레스토랑', '🍽️', '#FF6B6B'),
  ('빈티지샵', '👕', '#9B59B6'),
  ('베이커리', '🥐', '#F39C12'),
  ('바/술집', '🍺', '#E67E22'),
  ('문화/전시', '🎨', '#3498DB'),
  ('관광지', '🗺️', '#27AE60'),
  ('쇼핑', '🛍️', '#E91E63'),
  ('기타', '📍', '#95A5A6');

-- 6. 장소 테이블 생성
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address VARCHAR(500),
  category_id UUID REFERENCES categories(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  kakao_place_id VARCHAR(100),
  naver_place_id VARCHAR(100),
  phone VARCHAR(50),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 사용자별 저장한 장소 테이블 생성
CREATE TABLE user_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  custom_note TEXT,
  is_visited BOOLEAN DEFAULT FALSE,
  visited_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, place_id)
);

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_places_category ON places(category_id);
CREATE INDEX idx_places_location ON places(latitude, longitude);
CREATE INDEX idx_user_places_user ON user_places(user_id);
CREATE INDEX idx_user_places_place ON user_places(place_id);

-- 9. RLS 비활성화 (간단한 구현을 위해)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE places DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_places DISABLE ROW LEVEL SECURITY;

-- 10. 업데이트 시간 자동 갱신 함수 및 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_places_updated_at 
  BEFORE UPDATE ON places 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 완료!
SELECT 'Database setup completed successfully!' as message;
