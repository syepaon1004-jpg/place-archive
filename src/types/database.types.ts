// Supabase 데이터베이스 타입
export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface Place {
  id: string;
  name: string;
  address?: string;
  category_id?: string;
  latitude?: number;
  longitude?: number;
  kakao_place_id?: string;
  naver_place_id?: string;
  phone?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPlace {
  id: string;
  user_id: string;
  place_id: string;
  location?: string;
  custom_note?: string;
  is_visited: boolean;
  visited_at?: string;
  rating?: number;
  created_at: string;
}

// AI로부터 추출된 장소 정보
export interface ExtractedPlace {
  name: string;
  suggestedCategory: string;
  suggestedLocation?: string;
  confidence: number;
  rawText?: string;
}
