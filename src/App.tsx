import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { ImageUpload } from './components/ImageUpload';
import { PlaceCard } from './components/PlaceCard';
import { SavedPlacesSidebar } from './components/SavedPlacesSidebar';
import { extractPlacesFromImages } from './services/aiService';
import { authenticate, saveUserSession, getUserSession, logout } from './services/authService';
import { savePlace } from './services/placeService';
import type { ExtractedPlace } from './types/database.types';
import './App.css';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedPlaces, setExtractedPlaces] = useState<ExtractedPlace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 세션 확인
  useEffect(() => {
    const sessionUserId = getUserSession();
    if (sessionUserId) {
      setUserId(sessionUserId);
    }
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
    setExtractedPlaces([]);
  };

  const handleImagesSelected = async (files: File[]) => {
    console.log('선택된 이미지:', files);
    setIsProcessing(true);
    setError(null);
    setExtractedPlaces([]);
    setProgress({ current: 0, total: files.length });

    try {
      // AI OCR API 호출하여 장소명 추출 (진행상황 실시간 업데이트)
      const places = await extractPlacesFromImages(
        files,
        (current, total, currentPlaces) => {
          setProgress({ current, total });
          setExtractedPlaces([...currentPlaces]); // 점진적으로 결과 표시
        }
      );
      
      setExtractedPlaces(places);
      
      if (places.length === 0) {
        setError('이미지에서 장소를 찾을 수 없습니다. 다른 이미지를 시도해보세요.');
      }
    } catch (err: any) {
      console.error('장소 추출 에러:', err);
      setError(err.message || '장소 추출 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePlace = async (place: ExtractedPlace, category: string, location: string) => {
    if (!userId) return;
    
    try {
      await savePlace(userId, place, category, location);
      const locationText = location ? ` (${location})` : '';
      alert(`✅ "${place.name}"을(를) ${category}${locationText}에 저장했습니다!`);
    } catch (err: any) {
      alert(`❌ 저장 실패: ${err.message}`);
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
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      <SavedPlacesSidebar 
        userId={userId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="app-main">
        <ImageUpload onImagesSelected={handleImagesSelected} />

        {isProcessing && (
          <div className="processing">
            <div className="spinner"></div>
            <p>AI가 장소 정보를 분석 중입니다...</p>
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

        {extractedPlaces.length > 0 && (
          <div className="results">
            <h2>🎉 추출된 장소들 ({extractedPlaces.length}개)</h2>
            <div className="places-list">
              {extractedPlaces.map((place, index) => (
                <PlaceCard 
                  key={index} 
                  place={place}
                  onSave={handleSavePlace}
                />
              ))}
            </div>
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
