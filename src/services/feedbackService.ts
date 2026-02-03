import { supabase } from '../lib/supabase';

export interface Feedback {
  id: string;
  user_id: string;
  content: string;
  user_email?: string;
  status: 'new' | 'read' | 'resolved';
  created_at: string;
}

/**
 * 피드백 제출
 */
export async function submitFeedback(
  userId: string,
  content: string,
  userEmail?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('feedback')
      .insert([
        {
          user_id: userId,
          content: content.trim(),
          user_email: userEmail?.trim() || null,
          status: 'new',
        },
      ]);

    if (error) throw error;

    // 이메일 알림 전송 (Netlify Function 호출)
    try {
      await fetch('/.netlify/functions/send-feedback-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          userEmail,
          userId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (emailError) {
      console.warn('이메일 전송 실패 (피드백은 저장됨):', emailError);
      // 이메일 전송 실패해도 피드백은 저장되었으므로 에러로 처리하지 않음
    }
  } catch (error) {
    console.error('피드백 제출 에러:', error);
    throw error;
  }
}

/**
 * 사용자의 피드백 목록 조회
 */
export async function getUserFeedback(userId: string): Promise<Feedback[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('피드백 조회 에러:', error);
    throw error;
  }
}
