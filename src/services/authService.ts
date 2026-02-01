import { supabase } from '../lib/supabase';

// Supabase 설정 확인
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== 'your_supabase_url_here';
};

/**
 * 비밀번호를 해싱 (간단한 SHA-256)
 */
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 사용자 인증 (로그인 또는 회원가입)
 */
export async function authenticate(password: string): Promise<{ userId: string, isNewUser: boolean }> {
  if (!isSupabaseConfigured()) {
    throw new Error('⚠️ Supabase가 설정되지 않았습니다.\n\n1. Supabase.com에서 프로젝트 생성\n2. .env 파일에 URL과 Key 입력\n3. SQL 스키마 실행\n\n자세한 내용은 README.md를 참고하세요.');
  }

  const hashedPassword = await hashPassword(password);
  
  // 먼저 기존 사용자인지 확인
  const { data: existing, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('password_hash', hashedPassword)
    .maybeSingle();

  if (existing) {
    // 기존 사용자: 로그인
    return { userId: existing.id, isNewUser: false };
  }

  // 신규 사용자: 회원가입
  const { data, error } = await supabase
    .from('users')
    .insert([{ password_hash: hashedPassword }])
    .select()
    .single();

  if (error) throw new Error('회원가입에 실패했습니다: ' + error.message);
  return { userId: data.id, isNewUser: true };
}

/**
 * 로컬 스토리지에 사용자 ID 저장
 */
export function saveUserSession(userId: string) {
  localStorage.setItem('place_archive_user_id', userId);
}

/**
 * 로컬 스토리지에서 사용자 ID 가져오기
 */
export function getUserSession(): string | null {
  return localStorage.getItem('place_archive_user_id');
}

/**
 * 로그아웃
 */
export function logout() {
  localStorage.removeItem('place_archive_user_id');
}
