import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { ImageUpload } from './components/ImageUpload';
import { SavedPlacesSidebar } from './components/SavedPlacesSidebar';
import { SavedPlacesMapView } from './components/SavedPlacesMapView';
import { ManualPlaceEntry } from './components/ManualPlaceEntry';
import { FeedbackModal } from './components/FeedbackModal';
import { extractPlacesFromImages } from './services/aiService';
import { searchPlaces } from './services/kakaoMapService';
import { authenticate, saveUserSession, getUserSession, logout } from './services/authService';
import { savePlace } from './services/placeService';
import { ensureCategories } from './services/categoryService';
import type { ExtractedPlace } from './types/database.types';
import './App.css';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapViewOpen, setIsMapViewOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [aiExtractedResults, setAiExtractedResults] = useState<Array<{
    placeName: string;
    searchOptions: Array<{
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    }>;
    suggestedCategory: string;
  }>>([]);

  // 세션 확인
  useEffect(() => {
    const sessionUserId = getUserSession();
    if (sessionUserId) {
      setUserId(sessionUserId);
    }
  }, []);

  // 카테고리 초기화 (앱 시작 시)
  useEffect(() => {
    ensureCategories();
  }, []);

  const handleAuth = async (password: string) => {
    try {
      const { userId: id, isNewUser } = await authenticate(password);
      saveUserSession(id);
      setUserId(id);
      
      if (isNewUser) {
        alert('🎉 새로운 리스트가 생성되었습니다!');
      } else {
        alert('👋 다시 오신 것을 환영합니다!');
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    setUserId(null);
    setAiExtractedResults([]);
  };

  const handleImagesSelected = async (files: File[]) => {
    console.log('선택된 이미지:', files);
    setIsProcessing(true);
    setError(null);
    setAiExtractedResults([]);
    setProgress({ current: 0, total: files.length });

    try {
      // AI OCR API 호출하여 장소명 추출
      const places = await extractPlacesFromImages(
        files,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      if (places.length === 0) {
        setError('이미지에서 장소를 찾을 수 없습니다. 다른 이미지를 시도해보세요.');
        return;
      }

      // 각 추출된 장소명으로 카카오맵 검색
      console.log(`📍 ${places.length}개 장소 검색 시작...`);
      const searchResults = [];

      for (let i = 0; i < places.length; i++) {
        const place = places[i];
        console.log(`🔍 검색 중 (${i + 1}/${places.length}): ${place.name}`);

        try {
          const options = await searchPlaces(place.name);

          if (options.length > 0) {
            searchResults.push({
              placeName: place.name,
              searchOptions: options,
              suggestedCategory: place.suggestedCategory || '기타',
            });
            console.log(`✓ ${place.name}: ${options.length}개 결과 발견`);
          } else {
            console.warn(`⚠️ ${place.name}: 검색 결과 없음`);
          }
        } catch (err) {
          console.error(`❌ ${place.name} 검색 실패:`, err);
        }
      }

      setAiExtractedResults(searchResults);
      console.log(`✅ 검색 완료: ${searchResults.length}개 장소`);

      if (searchResults.length === 0) {
        setError('검색 결과를 찾을 수 없습니다. 장소명을 확인하거나 직접 추가해주세요.');
      }
    } catch (err: any) {
      console.error('장소 추출 에러:', err);
      setError(err.message || '장소 추출 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAdd = async (placeName: string, category: string, location: string) => {
    if (!userId) return;

    try {
      const manualPlace: ExtractedPlace = {
        name: placeName,
        suggestedCategory: category,
        suggestedLocation: location,
        confidence: 1.0,
        rawText: '수동 입력'
      };
      await savePlace(userId, manualPlace, category, location);
      // 저장 성공 - 알림 제거
    } catch (err: any) {
      if (err.message === '이미 저장된 장소입니다.') {
        alert('⚠️ 이미 저장된 장소입니다.');
      } else {
        alert(`❌ 저장 실패: ${err.message}`);
      }
    }
  };

  // 로그인하지 않은 경우 Auth 화면 표시
  if (!userId) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
          ☰
        </button>
        <div className="header-content">
          <h1>📍 Place Archive</h1>
          <p>인스타그램 장소 추천을 한 번에 저장하세요</p>
        </div>
        <button className="feedback-btn" onClick={() => setIsFeedbackModalOpen(true)}>
          💬<span className="btn-text"> 피드백</span>
        </button>
        <button className="map-view-btn" onClick={() => setIsMapViewOpen(true)}>
          🗺️<span className="btn-text"> 지도로 보기</span>
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      <SavedPlacesSidebar
        userId={userId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isMapViewOpen && (
        <SavedPlacesMapView
          userId={userId}
          onClose={() => setIsMapViewOpen(false)}
        />
      )}

      <FeedbackModal
        userId={userId}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      <main className="app-main">
        <ImageUpload onImagesSelected={handleImagesSelected} />

        <ManualPlaceEntry
          onAdd={handleManualAdd}
          aiExtractedResults={aiExtractedResults}
        />

        {isProcessing && (
          <div className="processing">
            <div className="spinner"></div>
            <p>AI가 장소 정보를 분석하고 검색 중입니다...</p>
            {progress.total > 0 && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {progress.current} / {progress.total} 이미지 처리 완료
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 Place Archive - 당신의 장소 아카이브</p>
      </footer>
    </div>
  );
}

export default App;
