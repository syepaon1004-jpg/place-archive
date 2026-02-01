# 🔑 API 설정 가이드

이 프로젝트를 실행하기 위해 필요한 API 키들을 발급받는 방법입니다.

## 1. OpenAI API Key 발급 (필수 ⭐)

이미지에서 장소 이름을 추출하는 핵심 기능에 사용됩니다.

### 발급 방법:

1. https://platform.openai.com/ 접속
2. 우측 상단 **Sign up** 또는 **Login**
3. 좌측 메뉴에서 **API Keys** 클릭
4. **Create new secret key** 클릭
5. 키 이름 입력 (예: `place-archive`)
6. **Create secret key** 클릭
7. 생성된 키를 **반드시 복사하여 저장** (한 번만 보여집니다!)

### 비용:
- GPT-4o-mini: 매우 저렴 (이미지당 약 $0.001~$0.003)
- 처음 가입 시 무료 크레딧 제공 ($5)

### .env 파일에 추가:
```env
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxx
```

---

## 2. 카카오맵 API Key 발급 (선택)

장소 검색 및 카카오맵 연동에 사용됩니다.

### 발급 방법:

1. https://developers.kakao.com/ 접속
2. 우측 상단 **로그인**
3. 카카오 계정으로 로그인
4. 상단 메뉴 **내 애플리케이션** 클릭
5. **애플리케이션 추가하기** 클릭
6. 앱 이름: `Place Archive` 입력, 회사명은 선택사항
7. 저장 후 생성된 앱 클릭
8. 좌측 메뉴 **앱 키** 클릭
9. **JavaScript 키** 복사

### 플랫폼 설정:
1. 좌측 메뉴 **플랫폼** 클릭
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인: `http://localhost:5175` 입력
4. 저장

### .env 파일에 추가:
```env
VITE_KAKAO_MAP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. 네이버 지도 API Key 발급 (선택)

네이버 지도 연동에 사용됩니다.

### 발급 방법:

1. https://developers.naver.com/ 접속
2. 우측 상단 **로그인**
3. 네이버 계정으로 로그인
4. 상단 메뉴 **Application** → **애플리케이션 등록** 클릭
5. 애플리케이션 정보 입력:
   - 애플리케이션 이름: `Place Archive`
   - 사용 API: **검색** 선택 (Local 검색)
   - 비로그인 오픈 API 서비스 환경:
     - **WEB 설정** 추가
     - 웹 서비스 URL: `http://localhost:5175`
6. 등록하기 클릭
7. **Client ID**와 **Client Secret** 복사

### .env 파일에 추가:
```env
VITE_NAVER_MAP_CLIENT_ID=xxxxxxxxxxxxxxxx
VITE_NAVER_MAP_CLIENT_SECRET=xxxxxxxxxxxx
```

### ⚠️ 주의사항:
네이버 API는 CORS 이슈가 있을 수 있습니다. 프로덕션 환경에서는 백엔드 프록시가 필요할 수 있습니다.

---

## 4. Supabase 설정 (필수 ⭐)

사용자 인증 및 데이터 저장에 사용됩니다.

### 설정 방법:

1. https://supabase.com/ 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인
4. **New Project** 클릭
5. 프로젝트 정보 입력:
   - Name: `place-archive`
   - Database Password: 안전한 비밀번호 생성 (저장 필수!)
   - Region: **Northeast Asia (Seoul)** 선택
6. **Create new project** 클릭 (약 2분 소요)
7. 프로젝트 생성 완료 후:
   - 좌측 메뉴 **Project Settings** (톱니바퀴) 클릭
   - **API** 메뉴 클릭
   - **Project URL** 복사
   - **anon public** 키 복사

### 데이터베이스 스키마 생성:
1. 좌측 메뉴 **SQL Editor** 클릭
2. **New Query** 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사하여 붙여넣기
4. **Run** 클릭

### .env 파일에 추가:
```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 완성된 .env 파일 예시

```env
# Supabase (필수)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# OpenAI (필수)
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxx

# 카카오맵 (선택)
VITE_KAKAO_MAP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 네이버 지도 (선택)
VITE_NAVER_MAP_CLIENT_ID=xxxxxxxxxxxxxxxx
VITE_NAVER_MAP_CLIENT_SECRET=xxxxxxxxxxxx
```

---

## ✅ 설정 확인

모든 API 키를 `.env` 파일에 입력한 후:

1. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 http://localhost:5175 접속

3. 이미지 업로드 테스트

---

## 💰 비용 예상

- **OpenAI GPT-4o-mini**: 이미지 1장당 약 $0.001~$0.003 (매우 저렴)
- **Supabase**: 무료 티어로 충분 (월 500MB DB, 1GB Storage)
- **카카오맵**: 무료 (일 300,000건까지)
- **네이버 지도**: 무료 (일 25,000건까지)

개인 사용으로는 **거의 무료**로 사용 가능합니다!

---

## 🔒 보안 주의사항

- `.env` 파일은 절대 GitHub에 업로드하지 마세요
- API 키는 외부에 노출되지 않도록 주의하세요
- OpenAI API는 브라우저에서 직접 호출하므로, 프로덕션에서는 백엔드 구현을 권장합니다
