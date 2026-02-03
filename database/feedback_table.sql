-- 피드백 테이블 생성
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_email VARCHAR(255), -- 사용자가 선택적으로 입력할 수 있는 이메일
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 피드백만 조회 가능
CREATE POLICY "Users can view their own feedback"
  ON feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 피드백을 생성할 수 있음
CREATE POLICY "Users can create their own feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 업데이트 시 updated_at 자동 갱신
CREATE TRIGGER trigger_update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- 코멘트 추가
COMMENT ON TABLE feedback IS '사용자 피드백 및 불만사항 저장 테이블';
COMMENT ON COLUMN feedback.status IS 'new: 새 피드백, read: 읽음, resolved: 해결됨';
