declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

// 스크립트 로딩 상태 추적
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Kakao Maps API 스크립트 로드
 */
export function loadKakaoMapScript(): Promise<void> {
  // 이미 로드된 경우
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve();
  }

  // 이미 로딩 중인 경우 기존 Promise 반환
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  if (!KAKAO_API_KEY || KAKAO_API_KEY === 'your_kakao_api_key_here') {
    console.error('⚠️ Kakao Maps API 키가 설정되지 않았습니다.');
    console.error('현재 API 키:', KAKAO_API_KEY);
    return Promise.reject(new Error('Kakao Maps API 키가 필요합니다. .env 파일에 VITE_KAKAO_MAP_API_KEY를 설정해주세요.'));
  }

  // 이미 스크립트 태그가 있는지 확인
  const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
  if (existingScript) {
    console.log('✅ Kakao Maps 스크립트가 이미 DOM에 존재합니다.');
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // 10초 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Kakao Maps 초기화 타임아웃'));
      }, 10000);
    });
  }

  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      console.log('✅ Kakao Maps 스크립트 로드 완료');
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log('✅ Kakao Maps 초기화 완료');
          isLoading = false;
          resolve();
        });
      } else {
        isLoading = false;
        reject(new Error('Kakao Maps 객체를 찾을 수 없습니다.'));
      }
    };

    script.onerror = (error) => {
      isLoading = false;
      console.error('❌ Kakao Maps 스크립트 로드 실패');
      console.error('API 키:', KAKAO_API_KEY);
      console.error('스크립트 URL:', script.src);
      console.error('에러:', error);
      reject(new Error('Kakao Maps 스크립트 로드 실패. API 키를 확인하거나 Kakao Developers 콘솔에서 플랫폼(Web)을 등록했는지 확인해주세요.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * 장소 검색 및 좌표 가져오기
 */
export async function searchPlace(placeName: string): Promise<{
  name: string;
  address: string;
  latitude: number;
  longitude: number;
} | null> {
  try {
    await loadKakaoMapScript();

    return new Promise((resolve) => {
      const ps = new window.kakao.maps.services.Places();

      ps.keywordSearch(placeName, (data: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
          // 첫 번째 검색 결과 사용 (가장 관련성 높은 결과)
          const place = data[0];
          resolve({
            name: place.place_name,
            address: place.address_name || place.road_address_name,
            latitude: parseFloat(place.y),
            longitude: parseFloat(place.x),
          });
        } else {
          console.warn('장소를 찾을 수 없습니다:', placeName);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('장소 검색 에러:', error);
    return null;
  }
}

/**
 * 지도 표시 (컨테이너에 지도를 렌더링)
 */
export async function displayMap(
  container: HTMLElement,
  latitude: number,
  longitude: number,
  placeName?: string
): Promise<void> {
  try {
    await loadKakaoMapScript();

    const position = new window.kakao.maps.LatLng(latitude, longitude);

    const options = {
      center: position,
      level: 3, // 확대 레벨
    };

    const map = new window.kakao.maps.Map(container, options);

    // 마커 추가
    const marker = new window.kakao.maps.Marker({
      position: position,
      map: map,
    });

    // 인포윈도우 추가 (장소 이름 표시)
    if (placeName) {
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;font-weight:600;">${placeName}</div>`,
      });
      infowindow.open(map, marker);
    }
  } catch (error) {
    console.error('지도 표시 에러:', error);
  }
}
