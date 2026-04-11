import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ThumbsUp, Minus, ThumbsDown } from "lucide-react";

// 인터페이스 구문 삭제
export function SentimentChart({ data }) {
  // 데이터가 없을 경우를 대비한 안전 장치
  if (!data) return null;

  const total = data.positive + data.neutral + data.negative;
  
  const pieData = [
    { name: "긍정", value: data.positive, color: "#22c55e" },
    { name: "중립", value: data.neutral, color: "#94a3b8" },
    { name: "부정", value: data.negative, color: "#ef4444" },
  ];

  const barData = [
    { name: "긍정", count: data.positive, percentage: total > 0 ? ((data.positive / total) * 100).toFixed(1) : 0 },
    { name: "중립", count: data.neutral, percentage: total > 0 ? ((data.neutral / total) * 100).toFixed(1) : 0 },
    { name: "부정", count: data.negative, percentage: total > 0 ? ((data.negative / total) * 100).toFixed(1) : 0 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6"></h2>
      
      {/* 요약 카드 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-800 font-medium">긍정</span>
            <ThumbsUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{data.positive}</div>
          <div className="text-sm text-green-700 mt-1">
            {total > 0 ? ((data.positive / total) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-800 font-medium">중립</span>
            <Minus className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-600">{data.neutral}</div>
          <div className="text-sm text-gray-700 mt-1">
            {total > 0 ? ((data.neutral / total) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-800 font-medium">부정</span>
            <ThumbsDown className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{data.negative}</div>
          <div className="text-sm text-red-700 mt-1">
            {total > 0 ? ((data.negative / total) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">비율 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">댓글 수</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}