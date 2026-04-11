import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import GeneralResult from './components/GeneralResult';
import YoutubeResult from './components/YoutubeResult';
import logoImg from './sources/image.png';
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
    /* 최상단: App.css의 container 대신 Tailwind 클래스로 정렬 제어 */
    <div className={`min-h-screen w-full flex flex-col items-center ${isSearched ? 'bg-[white]' : 'bg-[white]'}`}>
      
      <div className={`fixed z-50 cursor-pointer flex items-center transition-all duration-500 ${
        isSearched ? 'top-2 left-4'           // 검색 후: 왼쪽 상단 고정
                  : 'top-2 left-4'          // 검색 전: 홈 화면 왼쪽 상단 (원하는 위치로 조절 가능)
        }`} 
  onClick={() => window.location.reload()}
>
  <img src={logoImg} alt="Logo" className="h-16 mr-2" /> 
</div>
    
      {/* 검색 바 영역: 상단에 고정되거나 홈 중앙에 위치 */}
      <header className={`w-full flex flex-col items-center transition-all duration-500 ${isSearched ? 'py-6 border-b bg-white' : 'pt-[30vh]'}`}>
        <div className="flex flex-col items-center w-full max-w-2xl px-6">
          <div className="mb-8 cursor-pointer" onClick={() => window.location.reload()}>
            <span className={isSearched ? 'logo-text-small' : 'logo-text-large'}>
              균형잡힌 시각,
              AI 분석으로 객관적인 시각을 더하세요.
            </span>
          </div>

          <div className="w-full bg-white rounded-3xl shadow-lg border border-slate-200 p-2 overflow-hidden">
            {(activeTab === '이미지' || selectedImage) && (
              <div className="p-4 border-b border-dashed border-slate-200">
                {!selectedImage ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50" onClick={() => fileInputRef.current.click()}>
                    <span className="text-slate-400">+ 클릭하여 이미지 업로드</span>
                  </div>
                ) : (
                  <div className="relative w-24 h-24">
                    <img src={selectedImage} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    <button className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-5 h-5 text-xs" onClick={removeImage}>✕</button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows="0.3"
              placeholder={placeholders[activeTab]}
              className="w-full p-3 outline-none resize-none text-lg placeholder:text-[16px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <div className="flex justify-between items-center p-1">
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md" onClick={handleSearch}>
                🔍
              </button>
            </div>
          </div>
        </div>
      </header>

      
 {isSearched && (
        <main className="w-full flex justify-center py-10">
          <div className="w-full max-w-5xl px-6">
            {!apiData ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-500 font-medium">분석 데이터를 불러오는 중입니다...</p>
              </div>
            ) : (
              activeTab === 'Youtube' ? (
                <YoutubeResult data={apiData} />
              ) : (
                <GeneralResult result_Id={apiData} isYoutube={false} />
              )
            )}
          </div>
        </main>
          )}
    </div>
  );
}

export default App;
