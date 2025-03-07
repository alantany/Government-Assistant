"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from 'react-hot-toast'

interface ResponseCardProps {
  response: string
}

export default function ResponseCard({ response: textContent }: ResponseCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)

  useEffect(() => {
    // 从 localStorage 读取自动朗读设置
    const savedSetting = localStorage.getItem('autoSpeak')
    if (savedSetting !== null) {
      setAutoSpeak(savedSetting === 'true')
    }
  }, [])

  useEffect(() => {
    // 如果启用了自动朗读，自动开始播放
    if (autoSpeak && textContent) {
      handleSpeak();
    }
  }, [autoSpeak, textContent]);

  const handleSpeak = async () => {
    if (isSpeaking) {
      try {
        await fetch('/api/tts/stop', { method: 'POST' });
        setIsSpeaking(false);
      } catch (error) {
        console.error('停止播放失败:', error);
        toast.error('停止播放失败，请刷新页面重试');
      }
      return;
    }

    try {
      setIsSpeaking(true);
      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textContent })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || '语音合成失败');
      }

      const data = await response.json();
      if (data.success) {
        // 等待音频播放完成
        await new Promise(resolve => setTimeout(resolve, data.duration));
      }
    } catch (error) {
      console.error('语音合成错误:', error);
      toast.error(error instanceof Error ? error.message : '语音合成失败，请重试');
    } finally {
      setIsSpeaking(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-blue-800">智能助手回答</h3>
        <button
          onClick={handleSpeak}
          className={`p-2 rounded-full ${
            isSpeaking ? "bg-blue-200" : "bg-blue-100"
          } hover:bg-blue-200 transition-colors flex items-center gap-2`}
          aria-label={isSpeaking ? "停止朗读" : "朗读回答"}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-5 h-5 text-blue-700" />
              <span className="text-sm text-blue-700">停止朗读</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-blue-700" />
              <span className="text-sm text-blue-700">朗读回答</span>
            </>
          )}
        </button>
      </div>

      <div className="prose prose-blue">
        <p className="text-blue-900 whitespace-pre-line">{textContent}</p>
      </div>

      {isSpeaking && (
        <div className="mt-4 flex items-center">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-blue-700">正在朗读...</span>
        </div>
      )}
    </div>
  )
}

