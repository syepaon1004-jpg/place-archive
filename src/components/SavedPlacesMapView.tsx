import { useState, useEffect, useRef } from 'react';
import { getUserPlaces, deleteUserPlace } from '../services/placeService';
import { loadKakaoMapScript } from '../services/kakaoMapService';
import { getKakaoMapSearchUrl, getNaverMapSearchUrl } from '../services/mapService';
import './SavedPlacesMapView.css';

interface SavedPlacesMapViewProps {
  userId: string;
  onClose: () => void;
}

export const SavedPlacesMapView = ({ userId, onClose }: SavedPlacesMapViewProps) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infowindowRef = useRef<any>(null);

  useEffect(() => {
    loadPlaces();
  }, [userId]);

  useEffect(() => {
    if (places.length > 0) {
      filterPlaces();
    }
  }, [selectedCategory, places]);

  useEffect(() => {
    if (filteredPlaces.length > 0 && mapRef.current) {
      initializeMap();
    }
  }, [filteredPlaces]);

  const loadPlaces = async () => {
    setIsLoading(true);
    try {
      const data = await getUserPlaces(userId);
      setPlaces(data);
    } catch (error) {
      console.error('장소 불러오기 실패:', error);
      alert('장소 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlaces = () => {
    if (selectedCategory === '전체') {
      setFilteredPlaces(places);
    } else {
      setFilteredPlaces(
        places.filter((p) => p.place?.category?.name === selectedCategory)
      );
    }
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      await loadKakaoMapScript();

      // 좌표가 있는 장소들만 필터링
      const placesWithCoords = filteredPlaces.filter(
        (p) => p.place?.latitude && p.place?.longitude
      );

      if (placesWithCoords.length === 0) {
        alert('지도에 표시할 수 있는 장소가 없습니다.\n(좌표 정보가 있는 장소만 표시됩니다)');
        return;
      }

      // 지도 중심 계산 (첫 번째 장소 또는 평균 좌표)
      const centerLat =
        placesWithCoords.reduce((sum, p) => sum + p.place.latitude, 0) /
        placesWithCoords.length;
      const centerLng =
        placesWithCoords.reduce((sum, p) => sum + p.place.longitude, 0) /
        placesWithCoords.length;

      const mapOption = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 8, // 확대 레벨 (숫자가 클수록 넓은 지역 표시)
      };

      // 기존 지도가 있으면 제거
      if (mapInstanceRef.current) {
        mapRef.current.innerHTML = '';
      }

      const map = new window.kakao.maps.Map(mapRef.current, mapOption);
      mapInstanceRef.current = map;

      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 인포윈도우 생성
      if (!infowindowRef.current) {
        infowindowRef.current = new window.kakao.maps.InfoWindow({
          removable: true,
        });
      }

      // 각 장소에 마커 추가
      placesWithCoords.forEach((userPlace) => {
        const place = userPlace.place;
        const position = new window.kakao.maps.LatLng(
          place.latitude,
          place.longitude
        );

        // 카테고리별 마커 색상 (카카오맵은 기본 마커만 지원하므로 이미지로 커스터마이징 가능)
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map,
        });

        markersRef.current.push(marker);

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          const content = `
            <div style="padding: 15px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #1a202c;">
                ${place.name}
              </h3>
              ${
                place.category
                  ? `<div style="margin-bottom: 8px;">
                      <span style="background: ${place.category.color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${place.category.icon} ${place.category.name}
                      </span>
                    </div>`
                  : ''
              }
              ${
                place.address
                  ? `<p style="margin: 4px 0; font-size: 13px; color: #4a5568;">📍 ${place.address}</p>`
                  : ''
              }
              <div style="margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
                <button
                  onclick="window.openKakaoMap('${place.name}')"
                  style="padding: 6px 12px; background: #fee500; color: #3c1e1e; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;"
                >
                  카카오맵
                </button>
                <button
                  onclick="window.openNaverMap('${place.name}')"
                  style="padding: 6px 12px; background: #03c75a; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;"
                >
                  네이버
                </button>
                <button
                  onclick="window.deletePlace('${userPlace.id}')"
                  style="padding: 6px 12px; background: #e53e3e; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;"
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          `;

          infowindowRef.current.setContent(content);
          infowindowRef.current.open(map, marker);
        });
      });

      // 모든 마커가 보이도록 지도 범위 조정
      if (placesWithCoords.length > 1) {
        const bounds = new window.kakao.maps.LatLngBounds();
        placesWithCoords.forEach((p) => {
          bounds.extend(
            new window.kakao.maps.LatLng(p.place.latitude, p.place.longitude)
          );
        });
        map.setBounds(bounds);
      }
    } catch (error) {
      console.error('지도 초기화 에러:', error);
      alert('지도를 불러올 수 없습니다.');
    }
  };

  const handleDelete = async (userPlaceId: string) => {
    if (!confirm('이 장소를 삭제하시겠습니까?')) return;

    try {
      await deleteUserPlace(userId, userPlaceId);
      setPlaces(places.filter((p) => p.id !== userPlaceId));
      if (infowindowRef.current) {
        infowindowRef.current.close();
      }
      alert('✅ 삭제되었습니다.');
    } catch (error) {
      alert('❌ 삭제 실패');
    }
  };

  // 전역 함수 등록 (인포윈도우 버튼용)
  useEffect(() => {
    (window as any).openKakaoMap = (placeName: string) => {
      window.location.href = getKakaoMapSearchUrl(placeName);
    };
    (window as any).openNaverMap = (placeName: string) => {
      window.location.href = getNaverMapSearchUrl(placeName);
    };
    (window as any).deletePlace = (userPlaceId: string) => {
      handleDelete(userPlaceId);
    };
  }, [places]);

  // 카테고리 목록
  const categories = [
    '전체',
    ...new Set(places.map((p) => p.place?.category?.name).filter(Boolean)),
  ];

  // 좌표가 있는 장소 개수
  const placesWithCoordsCount = filteredPlaces.filter(
    (p) => p.place?.latitude && p.place?.longitude
  ).length;

  return (
    <div className="map-view-container">
      <div className="map-view-header">
        <h2>🗺️ 내 장소 지도</h2>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="map-view-controls">
        <div className="category-filter-map">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-filter-btn ${
                selectedCategory === cat ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="places-info">
          총 {filteredPlaces.length}개 (지도 표시: {placesWithCoordsCount}개)
        </div>
      </div>

      {isLoading ? (
        <div className="map-loading">로딩 중...</div>
      ) : (
        <div ref={mapRef} className="kakao-map" />
      )}
    </div>
  );
};
