import { supabase } from '../lib/supabase';
import type { ExtractedPlace, Place, UserPlace } from '../types/database.types';

/**
 * 장소 저장
 */
export async function savePlace(
  userId: string,
  extractedPlace: ExtractedPlace,
  categoryName: string,
  location?: string
): Promise<void> {
  try {
    // 1. 카테고리 ID 가져오기
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (!category) {
      throw new Error('카테고리를 찾을 수 없습니다.');
    }

    // 2. 장소가 이미 존재하는지 확인
    let placeId: string;
    const { data: existingPlace } = await supabase
      .from('places')
      .select('id')
      .eq('name', extractedPlace.name)
      .maybeSingle();

    if (existingPlace) {
      placeId = existingPlace.id;
    } else {
      // 3. 새 장소 생성
      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert([
          {
            name: extractedPlace.name,
            category_id: category.id,
          },
        ])
        .select()
        .single();

      if (placeError) throw placeError;
      placeId = newPlace.id;
    }

    // 4. 사용자 장소에 추가 (이미 저장되어 있으면 무시)
    // location 컬럼 없이 저장
    const { error: userPlaceError } = await supabase
      .from('user_places')
      .upsert([
        {
          user_id: userId,
          place_id: placeId,
        }
      ], {
        onConflict: 'user_id,place_id',
        ignoreDuplicates: true,
      });

    if (userPlaceError) throw userPlaceError;

    // location이 있고, DB에 location 컬럼이 있으면 별도로 업데이트 시도
    if (location) {
      try {
        await supabase
          .from('user_places')
          .update({ location })
          .eq('user_id', userId)
          .eq('place_id', placeId);
      } catch (locError) {
        // location 컬럼이 없으면 무시
        console.log('Location update skipped - column not available');
      }
    }
  } catch (error) {
    console.error('장소 저장 에러:', error);
    throw error;
  }
}

/**
 * 사용자가 저장한 장소 목록 가져오기
 */
export async function getUserPlaces(userId: string): Promise<any[]> {
  try {
    // location 컬럼이 있는지 확인하고 선택적으로 조회
    const { data, error } = await supabase
      .from('user_places')
      .select(`
        id,
        custom_note,
        is_visited,
        visited_at,
        rating,
        created_at,
        place:places (
          id,
          name,
          address,
          category:categories (
            id,
            name,
            icon,
            color
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // location을 별도로 조회 시도 (있으면 추가, 없으면 무시)
    if (data && data.length > 0) {
      try {
        const { data: locData } = await supabase
          .from('user_places')
          .select('id, location')
          .eq('user_id', userId);
        
        if (locData) {
          // location 데이터를 병합
          data.forEach(item => {
            const loc = locData.find(l => l.id === item.id);
            if (loc) {
              item.location = loc.location;
            }
          });
        }
      } catch (locError) {
        // location 컬럼이 없으면 무시
        console.log('Location column not available yet');
      }
    }
    
    return data || [];
  } catch (error) {
    console.error('장소 목록 조회 에러:', error);
    throw error;
  }
}

/**
 * 저장한 장소 삭제
 */
export async function deleteUserPlace(userId: string, userPlaceId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_places')
      .delete()
      .eq('id', userPlaceId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('장소 삭제 에러:', error);
    throw error;
  }
}
