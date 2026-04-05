import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import GeneralResult from './components/GeneralResult';
import YoutubeResult from './components/YoutubeResult';
import logoImg from './sources/isitrealLogo.png';

const BASE_URL = 'http://54.180.222.248:8080';

function App() {
  const [isSearched, setIsSearched] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('텍스트');
  const [selectedImage, setSelectedImage] = useState(null); // 업로드된 이미지 상태
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [apiData, setApiData] = useState(null); // 백엔드에서 받은 데이터
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 타입별 플레이스홀더
  const placeholders = {
    '텍스트': '텍스트를 입력하세요..',
    '이미지': '이미지를 드래그하여 업로드하세요..',
    'URL': 'URL을 입력하세요..',
    'Youtube': '유튜브 영상 링크를 입력하세요..'
  };

  useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    const scrollHeight = textareaRef.current.scrollHeight;
    
    if (isSearched && !isFocused) {
      textareaRef.current.style.height = '24px';
    } else {
      const maxHeight = isSearched ? 120 : 360; 
      textareaRef.current.style.height = scrollHeight > maxHeight ? `${maxHeight}px` : `${scrollHeight}px`;
    }
  }
}, [inputText, isSearched, isFocused]);

  const pollStatus = async (articleId) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/v1/articles/${articleId}/status`);
          const json = await res.json();
          if (json.data.status === 'COMPLETED') {
            clearInterval(interval);
            resolve();
          } else if (json.data.status === 'FAILED') {
            clearInterval(interval);
            reject(new Error('분석에 실패했습니다.'));
          }
        } catch (e) {
          clearInterval(interval);
          reject(e);
        }
      }, 2000);
    });
  };

  const handleSearch = async () => {
    if (!inputText.trim() && !selectedImage) return;

    setIsLoading(true);
    setError(null);
    setApiData(null);

    try {
      let articleId;

      if (activeTab === '텍스트') {
        const res = await fetch(`${BASE_URL}/api/v1/articles/analyze/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText }),
        });
        const json = await res.json();
        articleId = json.data.articleId;

      } else if (activeTab === 'URL') {
        const res = await fetch(`${BASE_URL}/api/v1/articles/analyze/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputText }),
        });
        const json = await res.json();
        articleId = json.data.articleId;

      } else if (activeTab === '이미지' && selectedImage) {
        const fileInput = fileInputRef.current;
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        const res = await fetch(`${BASE_URL}/api/v1/articles/analyze/image`, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        articleId = json.data.articleId;
      }

      setIsSearched(true);
      await pollStatus(articleId);

      const resultRes = await fetch(`${BASE_URL}/api/v1/articles/${articleId}/result`);
      const resultJson = await resultRes.json();
      setApiData(resultJson.data);

    } catch (e) {
      setError(e.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 업로드
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const tabs = ['텍스트', '이미지', 'URL', 'Youtube'];

  return (
    <div className={`container ${isSearched ? 'searched' : 'home'}`}>
      <header className="search-wrapper">
        <div className="logo-container" onClick={() => window.location.reload()} style={{cursor:'pointer'}}>
          <img src={logoImg} alt="Is It Real Logo" className="logo-img" />
        </div>
        
        <div className="input-container">
          {/* 이미지 업로드 미리보기 구역 (이미지 탭이거나 이미지가 선택됐을 때) */}
          {(activeTab === '이미지' || selectedImage) && (
            <div className="image-upload-section">
              {!selectedImage ? (
                <div className="upload-placeholder" onClick={() => fileInputRef.current.click()}>
                  <span>+ 클릭하여 이미지 업로드</span>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={selectedImage} alt="preview" />
                  <button className="remove-img" onClick={removeImage}>✕</button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows="1"
            placeholder={placeholders[activeTab]}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ overflowY: (isSearched && !isFocused) ? 'hidden' : 'auto' }}
          />
          
          <div className="input-footer">
            <div className="tab-group">
              {tabs.map(tab => (
                <button 
                  key={tab} 
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="search-submit-btn" onClick={handleSearch}>
              <span className="magnifier">🔍</span>
            </button>
          </div>
        </div>
      </header>

      {isSearched && (
        <main className="results-section">
          {isLoading && <p style={{textAlign:'center', marginTop:'2rem'}}>분석 중입니다...</p>}
          {error && <p style={{textAlign:'center', color:'red', marginTop:'2rem'}}>{error}</p>}
          {!isLoading && !error && (
            activeTab === 'Youtube' ? (
              <YoutubeResult data={apiData} />
            ) : (
              <GeneralResult data={apiData} type={activeTab} />
            )
          )}
        </main>
      )}
    </div>
  );
}

export default App;