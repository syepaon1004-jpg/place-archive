import { useState, useRef } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
}

export const ImageUpload = ({ onImagesSelected }: ImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 미리보기 생성
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    onImagesSelected(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    onImagesSelected(imageFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">📸</div>
          <h3>인스타그램 장소 캡쳐 이미지 업로드</h3>
          <p>이미지를 드래그하거나 클릭하여 선택하세요</p>
          <p className="hint">여러 장의 이미지를 한 번에 업로드할 수 있습니다</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {previews.length > 0 && (
        <div className="preview-section">
          <div className="preview-header">
            <h4>업로드된 이미지 ({previews.length}개)</h4>
            <button onClick={clearAll} className="clear-btn">전체 삭제</button>
          </div>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  className="remove-btn"
                  onClick={() => removePreview(index)}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
