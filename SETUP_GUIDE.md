# 🚀 Place Archive 설정 가이드

빠른 시작을 위한 단계별 가이드입니다.

## ✅ 1단계: Supabase 프로젝트 생성 (5분)

### 1. Supabase 가입 및 프로젝트 생성

1. https://supabase.com 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인
4. **New Project** 클릭
5. 프로젝트 정보 입력:
   ```
   Name: place-archive
   Database Password: 안전한 비밀번호 생성 (저장!)
   Region: Northeast Asia (Seoul)
   ```
6. **Create new project** 클릭 (약 2분 대기)

### 2. API Keys 가져오기

1. 프로젝트 생성 완료 후
2. 좌측 메뉴 **⚙️ Project Settings** 클릭
3. **API** 메뉴 클릭
4. 다음 두 값을 복사:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key (긴 문자열)

### 3. .env 파일 설정

프로젝트의 `.env` 파일을 열고 복사한 값을 붙여넣기:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

---

## ✅ 2단계: 데이터베이스 스키마 생성 (2분)

### 1. SQL Editor 열기

1. Supabase 대시보드 좌측 메뉴
2. **🔧 SQL Editor** 클릭
3. **New Query** 클릭

### 2. SQL 실행

1. `supabase/schema.sql` 파일 전체 내용 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭 (또는 Ctrl+Enter)

### 3. 확인

1. 좌측 메뉴 **📊 Table Editor** 클릭
2. 다음 테이블이 생성되었는지 확인:
   - ✅ users
   - ✅ categories (9개 카테고리 데이터 포함)
   - ✅ places
   - ✅ user_places

---

## ✅ 3단계: 개발 서버 재시작

`.env` 파일을 수정했으므로 서버를 재시작해야 합니다:

```bash
# 터미널에서 Ctrl+C로 서버 종료 후
npm run dev
```

---

## 🧪 테스트

1. 브라우저에서 http://localhost:5176/ 접속
2. **강력 새로고침**: Ctrl+Shift+R
3. 로그인 화면에서 8자리 숫자 입력 (예: `12345678`)
4. "시작하기" 클릭
5. 성공! 🎉

---

## 💡 SQL 전체 코드

`supabase/schema.sql` 파일 내용:

```sql
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
  icon VARCHAR(50),
  color VARCHAR(20),
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
  kakao_place_id VARCHAR(100),
  naver_place_id VARCHAR(100),
  phone VARCHAR(50),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 사용자별 저장한 장소 테이블
CREATE TABLE IF NOT EXISTS user_places (
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

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_id);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_places_user ON user_places(user_id);
CREATE INDEX IF NOT EXISTS idx_user_places_place ON user_places(place_id);

-- 6. RLS (Row Level Security) 비활성화 (간단한 구현을 위해)
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
```

---

## ❓ 문제 해결

### "Invalid supabaseUrl" 에러
- `.env` 파일에 올바른 URL과 Key를 입력했는지 확인
- 개발 서버를 재시작했는지 확인

### 테이블이 생성되지 않음
- SQL Editor에서 에러 메시지 확인
- 테이블을 먼저 삭제하고 다시 실행:
  ```sql
  DROP TABLE IF EXISTS user_places;
  DROP TABLE IF EXISTS places;
  DROP TABLE IF EXISTS categories;
  DROP TABLE IF EXISTS users;
  ```

### 로그인 안 됨
- Supabase Table Editor에서 `users` 테이블 확인
- 콘솔에 에러 메시지가 있는지 확인 (F12)

---

## 🎉 완료!

모든 설정이 완료되었습니다! 이제 인스타그램 장소를 저장할 수 있습니다! 🚀
