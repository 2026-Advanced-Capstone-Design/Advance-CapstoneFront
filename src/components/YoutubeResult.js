import React from 'react';

function YoutubeResult({ data }) {
  if (!data) return <div>유튜브 데이터를 불러오는 중...</div>;

  return (
    <div className="youtube-grid">
      {data.videos.map(video => (
        <div key={video.id} className="video-card">
          <iframe src={`https://www.youtube.com/embed/${video.id}`} title="video"></iframe>
          <h4>{video.title}</h4>
        </div>
      ))}
    </div>
  );
}

export default YoutubeResult;