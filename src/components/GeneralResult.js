import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BeatLoader } from "react-spinners";
import './GeneralResult.css';

function GeneralResult({result_Id}) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 백엔드 연동 전 임의 데이터
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

  useEffect(() => {
    // 데이터 요청 함수
    const fetchData = async () => {
      try {
        setLoading(true);
        // 서버의 API 엔드포인트 주소 입력
        const response = await axios.get(`http://54.180.222.248:8080/api/v1/articles/${result_Id}/result`);

        // 서버 응답 데이터 저장 (mockData 형식과 일치해야 함)
        setData(response.data);
      } catch (e) {
        setError(e);
        console.error("데이터를 불러오는데 실패했습니다:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [result_Id]);

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div className="spinner"><BeatLoader /></div>
        <p>데이터를 분석하고 있습니다. 잠시만 기다려 주세요...</p>
      </div>
    );
  }
  if (error) {
    return <div>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</div>;
  }

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
        <pre style={{ backgroundColor: '#f4f4f4', padding: '10px'}}>
          {JSON.stringify(result_Id, null, 2)}
        </pre>
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

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontSize: '1.2rem'
};


export default GeneralResult;
