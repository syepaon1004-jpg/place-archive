import { useEffect, useRef, useState } from 'react';
import { searchPlace, displayMap } from '../services/kakaoMapService';
import './MapDisplay.css';

interface MapDisplayProps {
  placeName: string;
  onClose?: () => void;
}

export const MapDisplay = ({ placeName, onClose }: MapDisplayProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeInfo, setPlaceInfo] = useState<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 장소 검색
        const result = await searchPlace(placeName);

        if (!result) {
          setError('장소를 찾을 수 없습니다. 다른 검색어를 시도해보세요.');
          setIsLoading(false);
          return;
        }

        setPlaceInfo(result);

        // 지도 표시
        if (mapContainer.current) {
          await displayMap(
            mapContainer.current,
            result.latitude,
            result.longitude,
            result.name
          );
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('지도 로드 에러:', err);
        setError(err.message || '지도를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    if (placeName) {
      loadMap();
    }
  }, [placeName]);

  return (
    <div className="map-display-overlay">
      <div className="map-display-modal">
        <div className="map-display-header">
          <h3>📍 {placeName}</h3>
          {onClose && (
            <button className="btn-close-map" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {isLoading && (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>지도를 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="map-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {placeInfo && (
          <div className="place-details">
            <p className="place-name">{placeInfo.name}</p>
            <p className="place-address">{placeInfo.address}</p>
          </div>
        )}

        <div
          ref={mapContainer}
          className="map-container"
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};
