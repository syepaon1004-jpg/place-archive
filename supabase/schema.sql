-- Place Archive 데이터베이스 스키마

-- 1. 사용자 테이블 (간단한 비밀번호 인증)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50), -- 아이콘 이모지 또는 아이콘 이름
  color VARCHAR(20), -- UI 색상
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기본 카테고리 삽입
INSERT INTO categories (name, icon, color) VALUES
  ('카페', '☕', '#8B4513'),
  ('레스토랑', '🍽️', '#FF6B6B'),
  ('빈티지샵', '👕', '#9B59B6'),
  ('베이커리', '🥐', '#F39C12'),
  ('바/술집', '🍺', '#E67E22'),
  ('문화/전시', '🎨', '#3498DB'),
  ('관광지', '🗺️', '#27AE60'),
  ('쇼핑', '🛍️', '#E91E63'),
  ('기타', '📍', '#95A5A6')
ON CONFLICT (name) DO NOTHING;

-- 3. 장소 테이블
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address VARCHAR(500),
  category_id UUID REFERENCES categories(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  kakao_place_id VARCHAR(100), -- 카카오맵 장소 ID
  naver_place_id VARCHAR(100), -- 네이버지도 장소 ID
  phone VARCHAR(50),
  description TEXT,
  image_url TEXT, -- 원본 이미지 URL (업로드한 이미지)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 사용자별 저장한 장소 테이블
CREATE TABLE IF NOT EXISTS user_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  custom_note TEXT, -- 사용자가 남긴 메모
  is_visited BOOLEAN DEFAULT FALSE, -- 방문 여부
  visited_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 별점
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, place_id)
);

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_id);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_places_user ON user_places(user_id);
CREATE INDEX IF NOT EXISTS idx_user_places_place ON user_places(place_id);

-- 6. RLS (Row Level Security) 비활성화 (간단한 구현을 위해)
-- 실제 프로덕션에서는 RLS를 활성화하고 적절한 정책을 설정해야 합니다
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE places DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_places DISABLE ROW LEVEL SECURITY;

-- 7. 업데이트 시간 자동 갱신 함수
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
