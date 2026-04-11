import React from 'react';
import { Bot, Shield, AlertTriangle, CheckCircle } from "lucide-react";

// interface 구문은 자바스크립트에 없으므로 삭제되었습니다.
export function BotDetection({ data }) {
  // 위험도에 따른 색상 설정 함수
  const getRiskColor = () => {
    switch (data.riskLevel) {
      case "low":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "text-green-600" };
      case "medium":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: "text-yellow-600" };
      case "high":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "text-red-600" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", icon: "text-gray-600" };
    }
  };

  // 위험도에 따른 아이콘 설정 함수
  const getRiskIcon = () => {
    switch (data.riskLevel) {
      case "low":
        return <CheckCircle className="w-6 h-6" />;
      case "medium":
        return <AlertTriangle className="w-6 h-6" />;
      case "high":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  // 위험도 텍스트 변환 함수
  const getRiskText = () => {
    switch (data.riskLevel) {
      case "low": return "낮음";
      case "medium": return "보통";
      case "high": return "높음";
      default: return "알 수 없음";
    }
  };

  const colors = getRiskColor();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        
        <h2 className="text-xl font-bold text-gray-900"></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">분석된 댓글</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{data.totalComments}</div>
        </div>

        <div className={`${colors.bg} rounded-xl p-4 border-2 ${colors.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <Bot className={`w-5 h-5 ${colors.icon}`} />
            <span className={`${colors.text} font-medium`}>의심 봇</span>
          </div>
          <div className={`text-3xl font-bold ${colors.text}`}>{data.suspiciousBots}</div>
        </div>

        <div className={`${colors.bg} rounded-xl p-4 border-2 ${colors.border}`}>
          <div className="flex items-center gap-2 mb-2">
            {getRiskIcon()}
            <span className={`${colors.text} font-medium`}>위험도</span>
          </div>
          <div className={`text-3xl font-bold ${colors.text}`}>{getRiskText()}</div>
          <div className={`text-sm ${colors.text} mt-1`}>{data.botPercentage.toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 mb-3">탐지 기준</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>동일하거나 유사한 패턴의 반복적인 댓글</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>짧은 시간 내 대량 댓글 작성</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>비정상적인 사용자 프로필 패턴</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>스팸성 키워드 및 링크 포함</span>
          </li>
        </ul>
      </div>
    </div>
  );
}