import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

/**
 * Netlify Function: 피드백 이메일 전송
 *
 * 환경 변수 설정 필요:
 * - FEEDBACK_EMAIL: 피드백을 받을 이메일 주소
 * - RESEND_API_KEY: Resend API 키 (https://resend.com)
 *
 * Resend 설정 방법:
 * 1. https://resend.com 가입
 * 2. API Key 생성
 * 3. Netlify 환경 변수에 RESEND_API_KEY 추가
 */

interface FeedbackData {
  content: string;
  userEmail?: string;
  userId: string;
  timestamp: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS 헤더
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // 요청 본문 파싱
    const data: FeedbackData = JSON.parse(event.body || '{}');
    const { content, userEmail, userId, timestamp } = data;

    if (!content || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // 환경 변수 확인
    const resendApiKey = process.env.RESEND_API_KEY;
    const feedbackEmail = process.env.FEEDBACK_EMAIL;

    if (!resendApiKey || !feedbackEmail) {
      console.error('Missing environment variables: RESEND_API_KEY or FEEDBACK_EMAIL');
      // 환경 변수가 없어도 200 반환 (피드백은 DB에 저장되었으므로)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Feedback saved (email notification disabled)'
        }),
      };
    }

    // Resend API로 이메일 전송
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Place Archive <noreply@placearchive.com>', // Resend에서 인증된 도메인 필요
        to: [feedbackEmail],
        subject: `[Place Archive] 새로운 피드백이 도착했습니다`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">💬 새로운 피드백</h2>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2d3748;">내용</h3>
              <p style="white-space: pre-wrap; color: #4a5568;">${content}</p>
            </div>

            <div style="background-color: #edf2f7; padding: 15px; border-radius: 8px;">
              <p style="margin: 5px 0; color: #718096;">
                <strong>사용자 ID:</strong> ${userId}
              </p>
              ${userEmail ? `
              <p style="margin: 5px 0; color: #718096;">
                <strong>답변 이메일:</strong> ${userEmail}
              </p>
              ` : ''}
              <p style="margin: 5px 0; color: #718096;">
                <strong>제출 시간:</strong> ${new Date(timestamp).toLocaleString('ko-KR')}
              </p>
            </div>

            <p style="color: #a0aec0; font-size: 12px; margin-top: 30px;">
              이 이메일은 Place Archive 피드백 시스템에서 자동으로 발송되었습니다.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      // 이메일 전송 실패해도 200 반환 (피드백은 DB에 저장되었으므로)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Feedback saved (email failed)'
        }),
      };
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Feedback saved and email sent',
        emailId: emailResult.id
      }),
    };

  } catch (error: any) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    };
  }
};

export { handler };
