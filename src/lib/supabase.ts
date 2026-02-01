import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 개발 중에는 에러 방지를 위한 더미 값 사용
const isConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here';

if (!isConfigured) {
  console.warn('⚠️ Supabase가 설정되지 않았습니다. 저장 기능이 작동하지 않습니다.');
}

// 더미 클라이언트 생성 (에러 방지)
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
