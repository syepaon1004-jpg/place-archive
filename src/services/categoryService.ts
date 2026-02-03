import { supabase } from '../lib/supabase';

/**
 * 기본 카테고리 데이터
 */
const DEFAULT_CATEGORIES = [
  { name: '카페', icon: '☕', color: '#8B4513' },
  { name: '레스토랑', icon: '🍽️', color: '#FF6B6B' },
  { name: '빈티지샵', icon: '👕', color: '#9B59B6' },
  { name: '베이커리', icon: '🥐', color: '#F39C12' },
  { name: '바/술집', icon: '🍺', color: '#E67E22' },
  { name: '문화/전시', icon: '🎨', color: '#3498DB' },
  { name: '관광지', icon: '🗺️', color: '#27AE60' },
  { name: '쇼핑', icon: '🛍️', color: '#E91E63' },
  { name: '기타', icon: '📍', color: '#95A5A6' },
];

/**
 * 카테고리 목록 가져오기
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('카테고리 조회 에러:', error);
    throw error;
  }

  return data || [];
}

/**
 * 카테고리 확인
 * 앱 시작 시 호출하여 기본 카테고리가 있는지 확인 (생성은 하지 않음)
 */
export async function ensureCategories(): Promise<void> {
  try {
    // 카테고리 확인
    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('name');

    if (fetchError) {
      console.warn('⚠️ 카테고리 확인 실패:', fetchError.message);
      console.warn('💡 Supabase SQL Editor에서 카테고리를 생성해주세요.');
      return;
    }

    const existingNames = existingCategories?.map((c) => c.name) || [];
    const missingCategories = DEFAULT_CATEGORIES.filter(
      (cat) => !existingNames.includes(cat.name)
    );

    if (missingCategories.length > 0) {
      console.warn('⚠️ 누락된 카테고리:', missingCategories.map(c => c.name).join(', '));
      console.warn('💡 Supabase SQL Editor에서 다음 SQL을 실행해주세요:');
      console.warn(`
INSERT INTO categories (name, icon, color) VALUES
${missingCategories.map(c => `  ('${c.name}', '${c.icon}', '${c.color}')`).join(',\n')}
ON CONFLICT (name) DO NOTHING;
      `);
    } else {
      console.log('✅ 모든 카테고리가 존재합니다.');
    }
  } catch (error) {
    console.warn('⚠️ 카테고리 확인 중 오류:', error);
  }
}
