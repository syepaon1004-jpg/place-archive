import { useState } from 'react';
import { submitFeedback } from '../services/feedbackService';
import './FeedbackModal.css';

interface FeedbackModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ userId, isOpen, onClose }: FeedbackModalProps) => {
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('⚠️ 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(userId, content, email || undefined);
      alert('✅ 소중한 의견 감사합니다! 빠른 시일 내에 검토하겠습니다.');
      setContent('');
      setEmail('');
      onClose();
    } catch (error: any) {
      alert(`❌ 전송 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent('');
      setEmail('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay" onClick={handleClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>💬 피드백 보내기</h2>
          <button
            className="feedback-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-description">
            <p>불편사항, 개선 제안, 버그 리포트 등 무엇이든 알려주세요!</p>
            <p>여러분의 의견은 서비스 개선에 큰 도움이 됩니다. 🙏</p>
          </div>

          <div className="form-group">
            <label htmlFor="feedback-content">내용 *</label>
            <textarea
              id="feedback-content"
              className="feedback-textarea"
              placeholder="예: 검색 속도가 너무 느려요&#10;예: 지도 기능이 있으면 좋겠어요&#10;예: 카테고리를 더 추가해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="feedback-email">이메일 (선택)</label>
            <input
              id="feedback-email"
              type="email"
              className="feedback-input"
              placeholder="답변받을 이메일 주소 (선택사항)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <small className="form-hint">
              답변이 필요한 경우 이메일을 입력해주세요
            </small>
          </div>

          <div className="feedback-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '전송 중...' : '✉️ 전송하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
