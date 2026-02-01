import { useState, useEffect } from 'react';
import { getUserPlaces, deleteUserPlace } from '../services/placeService';
import { openKakaoMap, openNaverMap } from '../services/mapService';
import './SavedPlacesSidebar.css';

interface SavedPlacesSidebarProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SavedPlacesSidebar = ({ userId, isOpen, onClose }: SavedPlacesSidebarProps) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedLocation, setSelectedLocation] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<'latest' | 'name'>('latest');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadPlaces();
    }
  }, [isOpen, userId]);

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

  const handleDelete = async (userPlaceId: string) => {
    if (!confirm('이 장소를 삭제하시겠습니까?')) return;

    try {
      await deleteUserPlace(userId, userPlaceId);
      setPlaces(places.filter(p => p.id !== userPlaceId));
      alert('✅ 삭제되었습니다.');
    } catch (error) {
      alert('❌ 삭제 실패');
    }
  };

  // 카테고리 목록
  const categories = ['전체', ...new Set(places.map(p => p.place?.category?.name).filter(Boolean))];
  
  // 위치 목록
  const locations = ['전체', ...new Set(places.map(p => p.location).filter(Boolean))];

  // 필터링 및 정렬
  const filteredPlaces = places
    .filter(p => selectedCategory === '전체' || p.place?.category?.name === selectedCategory)
    .filter(p => selectedLocation === '전체' || p.location === selectedLocation)
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (a.place?.name || '').localeCompare(b.place?.name || '');
      }
    });

  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="saved-places-sidebar">
        <div className="sidebar-header">
          <h2>💾 내 장소 리스트</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sidebar-controls">
          <div className="category-filter">
            <label>카테고리:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="location-filter">
            <label>위치:</label>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="sort-filter">
            <label>정렬:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'latest' | 'name')}>
              <option value="latest">최신순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </div>

        <div className="places-count">
          총 {filteredPlaces.length}개
        </div>

        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="places-list-sidebar">
            {filteredPlaces.length === 0 ? (
              <div className="empty-state">
                <p>저장된 장소가 없습니다.</p>
                <p>이미지를 업로드하고 장소를 저장해보세요!</p>
              </div>
            ) : (
              filteredPlaces.map((userPlace) => (
                <div key={userPlace.id} className="saved-place-item">
                  <div className="place-info">
                    <h3>{userPlace.place?.name}</h3>
                    <div className="tags">
                      {userPlace.place?.category && (
                        <span 
                          className="category-tag"
                          style={{ backgroundColor: userPlace.place.category.color }}
                        >
                          {userPlace.place.category.icon} {userPlace.place.category.name}
                        </span>
                      )}
                      {userPlace.location && (
                        <span className="location-tag">
                          📍 {userPlace.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="place-actions-sidebar">
                    <button
                      className="map-btn kakao"
                      onClick={() => openKakaoMap(userPlace.place?.name)}
                      title="카카오맵"
                    >
                      🗺️
                    </button>
                    <button
                      className="map-btn naver"
                      onClick={() => openNaverMap(userPlace.place?.name)}
                      title="네이버지도"
                    >
                      📍
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(userPlace.id)}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};
