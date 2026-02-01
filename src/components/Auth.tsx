import { useState } from 'react';
import './Auth.css';

interface AuthProps {
  onAuth: (password: string) => Promise<void>;
}

export const Auth = ({ onAuth }: AuthProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 8자리 검증
    if (password.length !== 8) {
      setError('비밀번호는 정확히 8자리여야 합니다.');
      return;
    }

    // 숫자만 허용
    if (!/^\d{8}$/.test(password)) {
      setError('비밀번호는 숫자 8자리만 가능합니다.');
      return;
    }

    try {
      setIsLoading(true);
      await onAuth(password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>📍 Place Archive</h2>
          <p>나만의 장소 아카이브</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>비밀번호 (숫자 8자리)</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{8}"
              maxLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="12345678"
              autoFocus
              className="password-input"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? '확인 중...' : '시작하기'}
          </button>
        </form>

        <div className="auth-info">
          <p>💡 8자리 숫자가 당신의 고유 번호입니다</p>
          <p>✨ 처음 입력하는 번호는 자동으로 새 리스트를 만들어요</p>
          <p>🔒 같은 번호로 언제든 다시 접속할 수 있습니다</p>
          <p>⚠️ 비밀번호를 잊어버리면 복구할 수 없으니 꼭 기억하세요!</p>
        </div>
      </div>
    </div>
  );
};
