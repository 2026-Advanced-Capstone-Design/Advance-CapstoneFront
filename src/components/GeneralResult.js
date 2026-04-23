import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BeatLoader } from "react-spinners";
import './GeneralResult.css';

const BASE_URL = 'http://54.180.222.248:8080';

function GeneralResult({result_Id, inputText}) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 피드백 관련 상태
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'up', 'down', null
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  // 섹션 스크롤 네비게이터 관련
  const [activeSection, setActiveSection] = useState('score');
  
  const scoreRef = useRef(null);
  const contentRef = useRef(null);
  const sourceRef = useRef(null);
  const feedbackRef = useRef(null);

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
    content: "최근 인공지능 기술은 급격하게 발전하고 있습니다. 하지만 개인정보 유출 문제는 여전히 해결되지 않은 숙제입니다. 데이터의 투명성을 확보하는 것이 무엇보다 중요합니다.",
    highlights: [
      { text: "급격하게 발전", type: "pos" },   // 초록색 (긍정/사실 등)
      { text: "개인정보 유출 문제", type: "neg" }, // 빨간색 (부정/오류 등)
      { text: "투명성을 확보", type: "pos" }
    ],
    sources: [
      { url : "https://www.lipsum.com/", title : "Lorem Ipsum" },
      { title : "인공지능 관련 출처 자료의 제목"}
    ]
  };

  // 백엔드 응답을 화면 표시 구조로 변환
  const displayData = data ? {
    title: data.title || '-',
    summary: data.summary || '-',
    score: {
      reliability: data.totalScore || 0,
      factBased: Math.round((data.indicators.factRatio || 0) * 100),
      neutrality: Math.round((data.indicators.emotionNeutrality || 0) * 100),
      sourceBalance: Math.round((data.indicators.sourceBalance || 0) * 100),
      bias: Math.round((data.indicators.biasScore || 0) * 100)
    },
    content: inputText || '-',
    highlights: [

    ],
    sources: [

    ]
  } : mockData;

  
  // useEffect(() => {
  //   let timer;

  //   // 데이터 요청 함수
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.get(`${BASE_URL}/api/v1/articles/${result_Id}/result`);

  //       if (response.status === 200) {
  //         setData(response.data);
  //         setLoading(false);
  //       }
  //     } catch (e) {
  //       if (e.response && e.response.status === 404) {
  //         console.log("분석 진행 중 (3초 간격)");
  //         timer = setTimeout(fetchData, 3000);
  //       } else {
  //         setError(e);
  //         console.error("데이터를 불러오는데 실패했습니다:", e);
  //         setLoading(false);
  //       } 
  //     }
  //   };
  //   fetchData();

  //   return () => {
  //     if (timer) clearTimeout(timer);
  //   }
  // }, [result_Id]);

  // if (loading) {
  //   return (
  //     <div style={loadingContainerStyle}>
  //       <div className="spinner"><BeatLoader /></div>
  //       <p>데이터를 분석하고 있습니다. 잠시만 기다려 주세요...</p>
  //     </div>
  //   );
  // }
  // if (error) {
  //   return <div>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</div>;
  // }
  

  // 점수에 따른 색
  const getColor = (score) => {
    if (score >= 65) return '#1a73e8';
    if (score >= 35) return '#f9ab00';
    return '#ea4335';
  };

  // 본문 텍스트를 하이라이트 태그로 변환하는 함수
  const renderHighlightedContent = () => {
    let content = displayData.content;
    if (!displayData.highlights || displayData.highlights.length === 0) return content;

    // 하이라이트 텍스트들을 정규식 패턴으로 만듦
    const patterns = displayData.highlights.map(h => h.text).join('|');
    const regex = new RegExp(`(${patterns})`, 'g');

    // 텍스트를 쪼갠 후 매칭되는 부분만 <span>으로 감쌈
    return content.split(regex).map((part, index) => {
      const highlight = displayData.highlights.find(h => h.text === part);
      
      if (highlight) {
        return (
          <span 
            key={index} 
            className={`highlight ${highlight.type === 'pos' ? 'pos' : 'neg'}`}
            title={highlight.type === 'pos' ? '신뢰할 수 있는 부분' : '주의가 필요한 부분'}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // 따봉 클릭
  const handleThumbUp = () => {
    setFeedbackStatus('up');
    setShowCommentBox(false);
  };

  // 썸다운 클릭
  const handleThumbDown = () => {
    setFeedbackStatus('down');
    setShowCommentBox(true);
  };

  // 피드백 창 취소
  const handleCancel = () => {
    setShowCommentBox(false);
    if (!comment.trim()) {
      setFeedbackStatus(null);
    }
  };

  // 피드백 전송
  const handleSendFeedback = async () => {
    try {
      // await axios.post('/api/feedback', { status: 'down', comment });
      alert("피드백이 전송되었습니다.");
      setShowCommentBox(false);
    } catch (error) {
      console.error("피드백 전송 실패", error);
    }
  };
  
  // 클릭 시 해당 섹션으로 부드럽게 이동하는 함수
  const scrollToSection = (ref, sectionName) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionName);
  };

  // 스크롤 감지 로직 (Intersection Observer)
  // useEffect(() => {
  //   const options = { root: null, rootMargin: '-10% 0px -80% 0px', threshold: 0 };
    
  //   const observer = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         setActiveSection(entry.target.id);
  //       }
  //     });
  //   }, options);

  //   const sections = [scoreRef, contentRef, sourceRef, feedbackRef];
  //   sections.forEach(ref => { if(ref.current) observer.observe(ref.current); });

  //   return () => observer.disconnect();
  // }, []);

  return (
    <div className="result-page-wrapper">
      {/* 좌측 스크롤 네비게이션 바 */}
      <nav className="fixed-side-nav">
        <div className="nav-vertical-line"></div>
        <button 
          className={`nav-item ${activeSection === 'score' ? 'active' : ''}`}
          onClick={() => scrollToSection(scoreRef, 'score')}
          title="신뢰지수"
        >
          <span className="nav-icon">📊</span>
        </button>
        <button 
          className={`nav-item ${activeSection === 'content' ? 'active' : ''}`}
          onClick={() => scrollToSection(contentRef, 'content')}
          title="본문"
        >
          <span className="nav-icon">📝</span>
        </button>
        <button 
          className={`nav-item ${activeSection === 'source' ? 'active' : ''}`}
          onClick={() => scrollToSection(sourceRef, 'source')}
          title="출처"
        >
          <span className="nav-icon">🔗</span>
        </button>
        <button 
          className={`nav-item ${activeSection === 'feedback' ? 'active' : ''}`}
          onClick={() => scrollToSection(feedbackRef, 'feedback')}
          title="피드백"
        >
          <span className="nav-icon">💬</span>
        </button>
      </nav>

      <div className="result-container">
        {/* 제목 및 요약 */}
        <header className="result-header" ref={scoreRef}>
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
        <article className="content-body" ref={contentRef}>
          {renderHighlightedContent()}
          <pre style={{ backgroundColor: '#f4f4f4', padding: '10px'}}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </article>

        <hr className="divider" />
        
        {/* 출처 섹션 */}
        <div className="source-section" ref={sourceRef}>
          <div className="source-header">
            <span className="source-label">원문 출처 ({displayData.sources?.length || 0})</span>
          </div>
          <ul className="source-list">
            {displayData.sources && displayData.sources.length > 0 ? (
              displayData.sources.map((source, index) => (
                <li key={index} className="source-item">
                  {source.url ? (
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="source-link active"
                    >
                      <span className="source-index">{index + 1}.</span> {source.title || "원문 링크"} 🔗
                    </a>
                  ) : (
                    <span className="source-link disabled">
                      <span className="source-index">{index + 1}.</span> {source.title || "출처 정보 없음"}
                    </span>
                  )}
                </li>
              ))
            ) : (
              <li className="source-item disabled">확인된 출처 정보가 없습니다.</li>
            )}
          </ul>
        </div>

        <hr className="divider" />

        {/* 피드백 섹션 */}
        <section className="feedback-section" ref={feedbackRef}>
          <p className="feedback-title">이 분석 결과가 도움이 되었나요?</p>
          <div className="feedback-buttons">
            <button 
              className={`feedback-btn ${feedbackStatus === 'up' ? 'active' : ''}`}
              onClick={handleThumbUp}
            >
              👍
            </button>
            <button 
              className={`feedback-btn ${feedbackStatus === 'down' ? 'active' : ''}`}
              onClick={handleThumbDown}
            >
              👎
            </button>
          </div>

          {/* 피드백 작성 창 (조건부 렌더링) */}
          {showCommentBox && (
            <div className="comment-box-container">
              <textarea 
                placeholder="어떤 점이 아쉬웠는지 알려주세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="comment-actions">
                <button className="cancel-btn" onClick={handleCancel}>취소</button>
                <button className="send-btn" onClick={handleSendFeedback}>보내기</button>
              </div>
            </div>
          )}
        </section>
      </div>
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
