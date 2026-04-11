import React from 'react';
import { Sparkles, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

// 인터페이스 및 타입 지정 삭제
export function SentimentSummary({ data }) {
  // 데이터가 없을 경우를 대비한 안전 장치
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900"></h2>
      </div>

      <div className="space-y-6">
        {/* 긍정 요약 */}
        <div className="border-l-4 border-green-500 bg-green-50 rounded-r-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-green-900">긍정적 의견</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{data.positive}</p>
        </div>

        {/* 중립 요약 */}
        <div className="border-l-4 border-gray-400 bg-gray-50 rounded-r-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Minus className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">중립적 의견</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{data.neutral}</p>
        </div>

        {/* 부정 요약 */}
        <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">부정적 의견</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{data.negative}</p>
        </div>
      </div>

      <div className="mt-6 bg-purple-50 rounded-xl p-4 border border-purple-200">
        <p className="text-sm text-purple-800">
          <span className="font-semibold">💡 분석 방법:</span> AI가 댓글의 핵심 내용을 감정별로 분류하고, 
          각 감정 카테고리의 주요 의견과 트렌드를 요약했습니다.
        </p>
      </div>
    </div>
  );
}