"use client"

import { Volume2 } from "lucide-react"
import { useState } from "react"

interface ResponseCardProps {
  response: string
}

export default function ResponseCard({ response }: ResponseCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSpeak = () => {
    if (isSpeaking) {
      // 停止朗读
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      // 开始朗读
      const utterance = new SpeechSynthesisUtterance(response)
      utterance.lang = 'zh-CN'
      
      // 设置朗读结束时的回调
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-blue-800">智能助手回答</h3>
        <button
          onClick={handleSpeak}
          className={`p-2 rounded-full ${isSpeaking ? "bg-blue-200" : "bg-blue-100"} hover:bg-blue-200 transition-colors`}
          aria-label={isSpeaking ? "停止朗读" : "朗读回答"}
        >
          <Volume2 className="w-5 h-5 text-blue-700" />
        </button>
      </div>

      <div className="prose prose-blue">
        <p className="text-blue-900 whitespace-pre-line">{response}</p>
      </div>

      {isSpeaking && (
        <div className="mt-4 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm text-blue-700">正在朗读...</span>
        </div>
      )}
    </div>
  )
}

