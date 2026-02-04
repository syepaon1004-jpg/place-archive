import { useState, useEffect } from 'react';
import { openKakaoMap, openNaverMap, getAllMapUrls } from '../services/mapService';
import { searchPlaces } from '../services/kakaoMapService';
import './ManualPlaceEntry.css';

interface ManualPlaceEntryProps {
  onAdd: (placeName: string, category: string, location: string) => void;
  aiExtractedResults?: Array<{
    placeName: string;
    searchOptions: Array<{
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    }>;
    suggestedCategory: string;
  }>;
}

interface SearchResult {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  suggestedCategory?: string;
}

// 장소별 검색 결과 그룹
interface PlaceGroup {
  placeName: string;
  searchOptions: SearchResult[];
  suggestedCategory: string;
}

export const ManualPlaceEntry = ({ onAdd, aiExtractedResults }: ManualPlaceEntryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchResult[]>([]); // 수동 검색 결과
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // 선택된 결과
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<PlaceGroup[]>([]); // AI 추출 장소별 그룹

  // AI 추출 결과를 장소별로 그룹화하여 표시
  useEffect(() => {
    if (aiExtractedResults && aiExtractedResults.length > 0) {
      console.log(`🤖 AI 추출 결과 ${aiExtractedResults.length}개 장소 처리`);

      const groups: PlaceGroup[] = [];
      const autoSelected: SearchResult[] = [];

      for (const extracted of aiExtractedResults) {
        const options = extracted.searchOptions.map(option => ({
          ...option,
          suggestedCategory: extracted.suggestedCategory,
        }));

        if (options.length === 1) {
          // 검색 결과가 1개면 자동 선택
          console.log(`✓ ${extracted.placeName}: 검색 결과 1개, 자동 선택`);
          autoSelected.push(options[0]);
        } else if (options.length > 1) {
          // 검색 결과가 여러 개면 사용자가 선택하도록
          console.log(`📋 ${extracted.placeName}: 검색 결과 ${options.length}개, 선택 필요`);
          groups.push({
            placeName: extracted.placeName,
            searchOptions: options,
            suggestedCategory: extracted.suggestedCategory,
          });
        }
      }

      // 자동 선택된 결과 추가
      if (autoSelected.length > 0) {
        setSearchResults(prev => [...prev, ...autoSelected]);
      }

      // 선택이 필요한 그룹 설정
      setPendingSelections(groups);
      setIsExpanded(true); // 자동으로 확장
    }
  }, [aiExtractedResults]);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('⚠️ 검색할 장소 이름을 입력해주세요!');
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPlaces(searchQuery);

      if (results.length > 0) {
        setSearchOptions(results);
        setSearchQuery(''); // 검색창 초기화
      } else {
        alert('❌ 장소를 찾을 수 없습니다. 다른 검색어를 시도해보세요.');
      }
    } catch (error) {
      console.error('검색 에러:', error);
      alert('❌ 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectOption = (option: SearchResult) => {
    // 중복 검색 방지
    const isDuplicate = searchResults.some(
      (r) => r.name === option.name && r.address === option.address
    );

    if (isDuplicate) {
      alert('⚠️ 이미 추가된 장소입니다.');
    } else {
      // 선택한 결과를 카드로 추가
      setSearchResults((prev) => [...prev, option]);
      // 선택 후 옵션 목록 숨기기
      setSearchOptions([]);
    }
  };

  // 장소별 그룹에서 옵션 선택
  const handleSelectFromGroup = (groupIndex: number, option: SearchResult) => {
    // 중복 검색 방지
    const isDuplicate = searchResults.some(
      (r) => r.name === option.name && r.address === option.address
    );

    if (isDuplicate) {
      alert('⚠️ 이미 추가된 장소입니다.');
    } else {
      // 선택한 결과를 카드로 추가
      setSearchResults((prev) => [...prev, option]);
      // 해당 그룹 제거
      setPendingSelections((prev) => prev.filter((_, i) => i !== groupIndex));
    }
  };

  // 장소별 그룹 건너뛰기
  const handleSkipGroup = (groupIndex: number) => {
    setPendingSelections((prev) => prev.filter((_, i) => i !== groupIndex));
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchOptions([]);
    setSearchResults([]);
    setPendingSelections([]);
  };

  const handleRemoveResult = (index: number) => {
    setSearchResults((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearOptions = () => {
    setSearchOptions([]);
  };

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
          onClick={() => {
            setIsExpanded(false);
            handleReset();
          }}
        >
          ✕
        </button>
      </div>

      <div className="manual-entry-search">
        <input
          type="text"
          placeholder="장소 이름을 입력하세요(예:투썸 신촌역점)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button
          className="btn-search"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? '🔍 검색 중...' : '🔍 검색'}
        </button>
      </div>

      {/* AI 추출 장소별 그룹 - 각 장소별로 선택 */}
      {pendingSelections.length > 0 && (
        <div className="pending-selections">
          <div className="pending-header">
            <span>🤖 AI가 추출한 장소 {pendingSelections.length}개 - 각 장소별로 선택하세요</span>
          </div>
          {pendingSelections.map((group, groupIndex) => (
            <div key={groupIndex} className="place-group">
              <div className="group-header">
                <span className="group-title">📍 "{group.placeName}" 검색 결과 ({group.searchOptions.length}개)</span>
                <button
                  className="btn-skip-group"
                  onClick={() => handleSkipGroup(groupIndex)}
                >
                  건너뛰기
                </button>
              </div>
              <div className="options-list">
                {group.searchOptions.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-item">
                    <div className="option-info">
                      <h5>{option.name}</h5>
                      <p>📍 {option.address}</p>
                    </div>
                    <button
                      className="btn-select-option"
                      onClick={() => handleSelectFromGroup(groupIndex, option)}
                    >
                      선택
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수동 검색 결과 */}
      {searchOptions.length > 0 && (
        <div className="search-options">
          <div className="options-header">
            <span>검색된 장소 {searchOptions.length}개 - 원하는 장소를 선택하세요</span>
            <button className="btn-clear-options" onClick={handleClearOptions}>
              목록 닫기
            </button>
          </div>
          <div className="options-list">
            {searchOptions.map((option, index) => (
              <div key={index} className="option-item">
                <div className="option-info">
                  <h5>{option.name}</h5>
                  <p>📍 {option.address}</p>
                </div>
                <button
                  className="btn-select-option"
                  onClick={() => handleSelectOption(option)}
                >
                  선택
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <span>검색 결과 {searchResults.length}개</span>
            <button className="btn-reset" onClick={handleReset}>
              모두 지우기
            </button>
          </div>
          {searchResults.map((result, index) => (
            <SearchResultCard
              key={index}
              result={result}
              categories={categories}
              onSave={onAdd}
              onRemove={() => handleRemoveResult(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SearchResultCardProps {
  result: SearchResult;
  categories: Array<{ name: string; icon: string }>;
  onSave: (placeName: string, category: string, location: string) => void;
  onRemove: () => void;
}

const SearchResultCard = ({ result, categories, onSave, onRemove }: SearchResultCardProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [showUrls, setShowUrls] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!selectedCategory) {
      alert('⚠️ 카테고리를 선택해주세요!');
      return;
    }

    onSave(result.name, selectedCategory, location || result.address);
    setIsSaved(true);
  };

  const handleCopyUrl = (url: string, mapName: string) => {
    navigator.clipboard.writeText(url);
    alert(`${mapName} URL이 복사되었습니다!`);
  };

  const mapUrls = getAllMapUrls(result.name);

  return (
    <div className={`search-result-card ${isSaved ? 'saved' : ''}`}>
      <div className="result-header">
        <div>
          <h4>{result.name}</h4>
          <p className="result-address">📍 {result.address}</p>
        </div>
        <div className="result-header-actions">
          {isSaved && (
            <span className="saved-badge">
              ✓ 저장됨
            </span>
          )}
          {!isSaved && (
            <button
              className="btn-remove-result"
              onClick={onRemove}
              title="이 검색 결과 제거"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="category-section">
        <p className="category-label">카테고리 선택:</p>
        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
              disabled={isSaved}
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
          disabled={isSaved}
        />
      </div>

      <div className="map-section">
        <p className="map-label">지도에서 찾기:</p>
        <div className="action-buttons">
          <button
            className="btn-kakao"
            onClick={() => openKakaoMap(result.name)}
          >
            🗺️ 카카오맵
          </button>
          <button
            className="btn-naver"
            onClick={() => openNaverMap(result.name)}
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
        className={`btn-save ${isSaved ? 'saved' : ''}`}
        onClick={handleSave}
        disabled={isSaved}
      >
        {isSaved ? '✓ 저장 완료' : '💾 저장하기'}
      </button>
    </div>
  );
};
