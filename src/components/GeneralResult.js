import React from 'react';
import './GeneralResult.css';

function GeneralResult({ data }) {
  const initialFact = Math.floor(Math.random() * 101);
  const initialNeutral = Math.floor(Math.random() * 101);
  const initialBias = Math.floor(Math.random() * 101);

  const mockData = {
    title: "백엔드에서 받아온 제목 표시되는 부분",
    summary: "백엔드에서 받아온 요약이 표시되는 부분",
    score: {
      reliability: Math.round((initialFact + initialNeutral + initialBias)/3),
      factBased: initialFact,
      neutrality: initialNeutral,
      bias: initialBias
    },
    content: "본문이 표시되는 부분."
  };

  // 백엔드 응답을 화면 표시 구조로 변환
  const displayData = data ? {
    title: data.summary?.title || '-',
    summary: data.summary?.content || '-',
    score: {
      reliability: data.totalScore || 0,
      factBased: Math.round((data.indicators?.factRatio || 0) * 100),
      neutrality: Math.round((data.indicators?.emotionNeutrality || 0) * 100),
      bias: Math.round((data.indicators?.biasScore || 0) * 100),
    },
    content: data.summary?.content || '-',
  } : mockData;

  // 점수에 따른 색
  const getColor = (score) => {
    if (score >= 65) return '#1a73e8';
    if (score >= 35) return '#f9ab00';
    return '#ea4335';
  };

  return (
    <div className="result-container">
      {/* 제목 및 요약 */}
      <header className="result-header">
        <h1 className="result-title">{displayData.title}</h1>
        <p className="result-summary">{displayData.summary}</p>
      </header>

      {/* 지수 표시 섹션 */}
      <section className="score-section">
        {/* 좌측 신뢰도 원형 그래프 */}
        <div className="reliability-box">
          <span className="score-label">신뢰도</span>
          <div className="circle-graph" style={{
            background: `conic-gradient(${getColor(displayData.score.reliability)} ${displayData.score.reliability * 3.6}deg, #e0e0e0 0deg)`,
          }}>
            <div className="circle-inner">
              <span className="score-text">{displayData.score.reliability}%</span>
            </div>
          </div>
        </div>

        {/* 우측 기타 지수 표시 */}
        <div className="other-scores-box">
          <ScoreBar label="사실 기반도" score={displayData.score.factBased} color={getColor(displayData.score.factBased)} />
          <ScoreBar label="감정적 중립도" score={displayData.score.neutrality} color={getColor(displayData.score.neutrality)} />
          <ScoreBar label="편향도" score={displayData.score.bias} color={getColor(displayData.score.bias)} />
        </div>
      </section>

      <hr className="divider" />

      {/* 본문 섹션 */}
      <article className="content-body">
        {displayData.content}
      </article>
    </div>
  );
}

// 가로 점수 바 컴포넌트
function ScoreBar({ label, score, color }) {
  return (
    <div className="score-bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
      </div>
      <span className="bar-score-num">{score}%</span>
    </div>
  );
}

export default GeneralResult;