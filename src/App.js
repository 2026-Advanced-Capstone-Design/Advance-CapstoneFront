import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import GeneralResult from './components/GeneralResult';
import YoutubeResult from './components/YoutubeResult';
import logoImg from './sources/newslensLogo.png';
import axios from 'axios';

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
        const res = await axios.get(`${BASE_URL}/api/v1/articles/${articleId}/status`);
        const status = res.data.data.status;
        if (status === 'COMPLETED') {
          clearInterval(interval);
          resolve();
        } else if (status === 'FAILED') {
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
  // 텍스트가 없거나 이미지도 없는 경우 방지
  if (!inputText.trim() && !selectedImage) {
    alert("내용을 입력해주세요!");
    return;
  }

  setApiData(null); // 이전 결과 초기화

  try {
    if (activeTab === 'Youtube') {
      // Youtube는 ngrok 서버로
      setIsSearched(true);
      const response = await axios.post('https://matterless-unevocative-maddie.ngrok-free.dev/api/youtube/comments/texts', {
        youtubeUrl : inputText
      });
      setApiData(response.data);

    } else {
      // 텍스트/이미지/URL은 EC2 백엔드로
      let res;
      if (activeTab === '텍스트') {
        res = await axios.post(`${BASE_URL}/api/v1/articles/analyze/text`, { text: inputText });
      } else if (activeTab === 'URL') {
        res = await axios.post(`${BASE_URL}/api/v1/articles/analyze/url`, { url: inputText });
      } else if (activeTab === '이미지' && selectedImage) {
        const formData = new FormData();
        formData.append('image', fileInputRef.current.files[0]);
        res = await axios.post(`${BASE_URL}/api/v1/articles/analyze/image`, formData);
      }

      const articleId = res.data.data.articleId;
      setIsSearched(true);
      await pollStatus(articleId);
      setApiData(articleId); // articleId를 GeneralResult로 전달
    }

  } catch (error) {
    console.error("데이터 요청 중 에러 발생:", error);
    setApiData({ error: "데이터를 불러오는데 실패했습니다." });
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
          {activeTab === 'Youtube' ? (
            <YoutubeResult data={apiData} />
          ) : (
            <GeneralResult result_Id={apiData} type={activeTab} />
          )
          }
        </main>
      )}
    </div>
  );
}

export default App;
