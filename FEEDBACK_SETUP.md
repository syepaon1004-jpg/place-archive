# 피드백 이메일 알림 설정 가이드

사용자가 피드백을 제출하면 자동으로 이메일로 알림을 받을 수 있습니다.

## 1. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 파일을 실행하세요:

```
database/feedback_table.sql
```

또는 Supabase Dashboard > SQL Editor에서 해당 SQL 명령문을 복사해서 실행합니다.

## 2. Resend 계정 생성 (무료)

1. [Resend](https://resend.com)에 가입합니다
2. 무료 tier: 월 3,000통의 이메일을 보낼 수 있습니다
3. API Keys 메뉴에서 새 API 키를 생성합니다

## 3. 도메인 인증 (선택사항)

**옵션 A: 자체 도메인 사용 (권장)**
- Resend에서 도메인을 추가하고 DNS 레코드를 설정합니다
- `from` 주소를 `noreply@yourdomain.com`으로 변경합니다

**옵션 B: Resend 테스트 도메인 사용**
- 개발/테스트 단계에서는 Resend의 테스트 도메인을 사용할 수 있습니다
- 제한: 본인의 이메일로만 발송 가능

## 4. Netlify 환경 변수 설정

Netlify Dashboard > Site settings > Environment variables에서 다음 변수를 추가합니다:

| 변수 이름 | 값 | 설명 |
|----------|-----|------|
| `RESEND_API_KEY` | `re_...` | Resend에서 생성한 API 키 |
| `FEEDBACK_EMAIL` | `your@email.com` | 피드백을 받을 이메일 주소 |

## 5. 재배포

환경 변수를 추가한 후 Netlify에서 자동으로 재배포됩니다.

## 테스트

1. 앱에서 피드백 버튼 클릭
2. 테스트 메시지 작성 및 전송
3. `FEEDBACK_EMAIL`로 설정한 이메일 주소에서 알림 확인

## 문제 해결

### 이메일이 오지 않는 경우

1. **환경 변수 확인**
   - Netlify Dashboard에서 `RESEND_API_KEY`와 `FEEDBACK_EMAIL`이 올바르게 설정되었는지 확인

2. **Resend 대시보드 확인**
   - Resend Dashboard > Logs에서 이메일 전송 상태 확인
   - 에러 메시지가 있는지 확인

3. **스팸 폴더 확인**
   - 이메일이 스팸 폴더로 분류되었을 수 있습니다

4. **Netlify Function 로그 확인**
   - Netlify Dashboard > Functions > send-feedback-email에서 로그 확인

### 도메인 인증 문제

자체 도메인을 사용하는 경우:
1. Resend Dashboard에서 도메인 상태가 "Verified"인지 확인
2. DNS 레코드가 올바르게 설정되었는지 확인
3. DNS 변경 사항이 전파되기까지 최대 24시간 소요될 수 있습니다

## 비용

- **Resend 무료 tier**: 월 3,000통 (대부분의 개인 프로젝트에 충분)
- **초과 시**: 1,000통당 $1 (매우 저렴)

## 대안

이메일 서비스 대신 다른 알림 방법을 사용할 수도 있습니다:

1. **Discord Webhook**
   - `netlify/functions/send-feedback-email.ts`에서 Discord webhook URL로 POST 요청

2. **Slack Webhook**
   - Slack incoming webhook을 사용하여 알림

3. **Supabase Database Webhooks**
   - Supabase의 Database Webhooks 기능 사용

환경 변수가 설정되지 않은 경우에도 피드백은 데이터베이스에 정상적으로 저장됩니다.
Supabase Dashboard에서 `feedback` 테이블을 직접 확인할 수 있습니다.
