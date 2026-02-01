import { useState } from 'react';
import type { ExtractedPlace } from '../types/database.types';
import { openKakaoMap, openNaverMap, getAllMapUrls } from '../services/mapService';
import './PlaceCard.css';

interface PlaceCardProps {
  place: ExtractedPlace;
  onSave?: (place: ExtractedPlace, category: string, location: string) => void;
}

export const PlaceCard = ({ place, onSave }: PlaceCardProps) => {
  const [selectedCategory, setSelectedCategory] = useState(place.suggestedCategory);
  const [showUrls, setShowUrls] = useState(false);
  const [location, setLocation] = useState(place.suggestedLocation || '');

  const categories = [
    { name: '카페', icon: '☕' },
    { name: '레스토랑', icon: '🍽️' },
    { name: '빈티지샵', icon: '👕' },
    { name: '베이커리', icon: '🥐' },
    { name: '바/술집', icon: '🍺' },
    { name: '문화/전시', icon: '🎨' },
    { name: '관광지', icon: '🗺️' },
    { name: '쇼핑', icon: '🛍️' },
    { name: '기타', icon: '📍' },
  ];

  const handleSave = () => {
    if (onSave) {
      onSave(place, selectedCategory, location);
    }
  };

  const handleCopyUrl = (url: string, mapName: string) => {
    navigator.clipboard.writeText(url);
    alert(`${mapName} URL이 복사되었습니다!`);
  };

  const mapUrls = getAllMapUrls(place.name);

  const confidenceColor = 
    place.confidence >= 0.9 ? '#10b981' :
    place.confidence >= 0.7 ? '#f59e0b' :
    '#ef4444';

  return (
    <div className="place-card">
      <div className="place-header">
        <h3>{place.name}</h3>
        <span 
          className="confidence-badge" 
          style={{ backgroundColor: confidenceColor }}
          title="AI 확신도"
        >
          {Math.round(place.confidence * 100)}%
        </span>
      </div>

      <div className="category-section">
        <p className="category-label">카테고리 선택:</p>
        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="location-section">
        <p className="location-label">위치 (선택):</p>
        <input
          type="text"
          className="location-input"
          placeholder="예: 성수동, 홍대, 강남역"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="map-section">
        <p className="map-label">지도에서 찾기:</p>
        <div className="action-buttons">
          <button 
            className="btn-kakao"
            onClick={() => openKakaoMap(place.name)}
          >
            🗺️ 카카오맵
          </button>
          <button 
            className="btn-naver"
            onClick={() => openNaverMap(place.name)}
          >
            📍 네이버지도
          </button>
          <button 
            className="btn-url"
            onClick={() => setShowUrls(!showUrls)}
          >
            🔗 {showUrls ? 'URL 숨기기' : 'URL 보기'}
          </button>
        </div>

        {showUrls && (
          <div className="url-section">
            <div className="url-item">
              <span className="url-label">카카오맵:</span>
              <input 
                type="text" 
                value={mapUrls.kakao} 
                readOnly 
                onClick={(e) => e.currentTarget.select()}
              />
              <button onClick={() => handleCopyUrl(mapUrls.kakao, '카카오맵')}>복사</button>
            </div>
            <div className="url-item">
              <span className="url-label">네이버지도:</span>
              <input 
                type="text" 
                value={mapUrls.naver} 
                readOnly 
                onClick={(e) => e.currentTarget.select()}
              />
              <button onClick={() => handleCopyUrl(mapUrls.naver, '네이버지도')}>복사</button>
            </div>
          </div>
        )}
      </div>

      <button 
        className="btn-save"
        onClick={handleSave}
      >
        💾 저장하기
      </button>
    </div>
  );
};
