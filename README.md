# 📍 Place Archive

인스타그램에서 발견한 장소들을 AI로 자동 추출하여 저장하고 관리하는 웹 애플리케이션

## ✨ 주요 기능

- 🤖 **AI 자동 추출**: 이미지에서 장소 이름, 카테고리, 위치 자동 인식
- 💾 **개인 리스트**: 8자리 비밀번호로 나만의 장소 컬렉션 관리
- 🗺️ **지도 연동**: 카카오맵/네이버지도로 바로 연결
- 📱 **모바일 최적화**: 모바일 우선 반응형 디자인
- 🏷️ **카테고리/위치 필터**: 저장한 장소를 쉽게 찾기

## 🚀 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini Vision API
- **Styling**: CSS (Mobile-First Design)
- **Deployment**: Netlify

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## ⚙️ 환경 변수 설정

`.env` 파일에 다음 환경 변수를 설정하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

자세한 설정 방법은 [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참고하세요.

## 📖 사용 방법

1. 8자리 숫자로 로그인/회원가입
2. 인스타그램 장소 추천 게시물 캡쳐
3. 이미지 업로드
4. AI가 자동으로 장소 정보 추출
5. 카테고리/위치 확인 및 수정
6. 저장하기
7. 사이드바(☰)에서 저장한 장소 확인

## 🗄️ 데이터베이스 스키마

Supabase SQL Editor에서 `supabase/reset_and_create.sql` 파일을 실행하세요.

## 📝 라이선스

MIT License

## 🙏 감사

- OpenAI GPT-4o-mini Vision
- Supabase
- React + Vite

---

Made with ❤️ for easier place discovery
