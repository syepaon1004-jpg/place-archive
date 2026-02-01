/**
 * 지도 서비스 - 검색 URL 생성
 * API 없이 검색 URL로 바로 연결
 */

/**
 * 카카오맵 검색 URL 생성
 */
export function getKakaoMapSearchUrl(placeName: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(placeName)}`;
}

/**
 * 네이버 지도 검색 URL 생성
 */
export function getNaverMapSearchUrl(placeName: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`;
}

/**
 * 구글 맵 검색 URL 생성
 */
export function getGoogleMapSearchUrl(placeName: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
}

/**
 * 카카오맵 검색 페이지 열기
 */
export function openKakaoMap(placeName: string) {
  const url = getKakaoMapSearchUrl(placeName);
  window.open(url, '_blank');
}

/**
 * 네이버 지도 검색 페이지 열기
 */
export function openNaverMap(placeName: string) {
  const url = getNaverMapSearchUrl(placeName);
  window.open(url, '_blank');
}

/**
 * 구글 맵 검색 페이지 열기
 */
export function openGoogleMap(placeName: string) {
  const url = getGoogleMapSearchUrl(placeName);
  window.open(url, '_blank');
}

/**
 * 모든 지도 검색 URL 가져오기
 */
export function getAllMapUrls(placeName: string) {
  return {
    kakao: getKakaoMapSearchUrl(placeName),
    naver: getNaverMapSearchUrl(placeName),
    google: getGoogleMapSearchUrl(placeName),
  };
}
