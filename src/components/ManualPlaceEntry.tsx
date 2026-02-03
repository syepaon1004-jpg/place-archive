import { useState } from 'react';
import { openKakaoMap, openNaverMap, getAllMapUrls } from '../services/mapService';
import './ManualPlaceEntry.css';

interface ManualPlaceEntryProps {
  onAdd: (placeName: string, category: string, location: string) => void;
}

export const ManualPlaceEntry = ({ onAdd }: ManualPlaceEntryProps) => {
  const [placeName, setPlaceName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUrls, setShowUrls] = useState(false);

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

  const handleSubmit = () => {
    if (!placeName.trim()) {
      alert('⚠️ 장소 이름을 입력해주세요!');
      return;
    }
    if (!selectedCategory) {
      alert('⚠️ 카테고리를 선택해주세요!');
      return;
    }

    onAdd(placeName, selectedCategory, location);

    // 폼 초기화
    setPlaceName('');
    setSelectedCategory('');
    setLocation('');
    setShowUrls(false);
    setIsExpanded(false);
  };

  const handleCopyUrl = (url: string, mapName: string) => {
    navigator.clipboard.writeText(url);
    alert(`${mapName} URL이 복사되었습니다!`);
  };

  const mapUrls = placeName ? getAllMapUrls(placeName) : { kakao: '', naver: '' };

  if (!isExpanded) {
    return (
      <div className="manual-entry-collapsed">
        <button
          className="btn-expand"
          onClick={() => setIsExpanded(true)}
        >
          ➕ 직접 장소 추가하기
        </button>
      </div>
    );
  }

  return (
    <div className="manual-entry-expanded">
      <div className="manual-entry-header">
        <h3>✍️ 직접 장소 추가</h3>
        <button
          className="btn-collapse"
          onClick={() => setIsExpanded(false)}
        >
          ✕
        </button>
      </div>

      <div className="manual-entry-form">
        <div className="form-group">
          <label>장소 이름 *</label>
          <input
            type="text"
            placeholder="예: 성수동 카페"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="input-place-name"
          />
        </div>

        <div className="form-group">
          <label>카테고리 *</label>
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

        <div className="form-group">
          <label>위치 (선택)</label>
          <input
            type="text"
            placeholder="예: 성수동, 홍대, 강남역"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-location"
          />
        </div>

        {placeName && (
          <div className="form-group">
            <label>지도에서 확인</label>
            <div className="map-buttons">
              <button
                type="button"
                className="btn-kakao"
                onClick={() => openKakaoMap(placeName)}
              >
                🗺️ 카카오맵
              </button>
              <button
                type="button"
                className="btn-naver"
                onClick={() => openNaverMap(placeName)}
              >
                📍 네이버지도
              </button>
              <button
                type="button"
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
                  <button type="button" onClick={() => handleCopyUrl(mapUrls.kakao, '카카오맵')}>
                    복사
                  </button>
                </div>
                <div className="url-item">
                  <span className="url-label">네이버지도:</span>
                  <input
                    type="text"
                    value={mapUrls.naver}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button type="button" onClick={() => handleCopyUrl(mapUrls.naver, '네이버지도')}>
                    복사
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="btn-submit"
          onClick={handleSubmit}
        >
          💾 저장하기
        </button>
      </div>
    </div>
  );
};
