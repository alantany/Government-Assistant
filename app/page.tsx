"use client"

import { Mic, MicOff, Volume2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import VoiceWaveAnimation from "@/components/voice-wave-animation"
import ResponseCard from "@/components/response-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { initKnowledgeBase, searchKnowledge } from "@/lib/knowledge-base"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [showResponse, setShowResponse] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 初始化语音识别
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - SpeechRecognition 不在标准 TypeScript 类型中
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.lang = 'zh-CN'
        recognitionInstance.interimResults = false
        recognitionInstance.maxAlternatives = 1

        recognitionInstance.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript
          setQuery(speechResult)
          handleSendMessage(speechResult)
        }

        recognitionInstance.onerror = (event: any) => {
          console.error('语音识别错误:', event.error)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      } else {
        console.error('您的浏览器不支持语音识别功能')
      }
    }
  }, [])

  // 初始化知识库
  useEffect(() => {
    initKnowledgeBase();
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop()
      setIsListening(false)
    } else {
      try {
        // 清除之前的问题和回答
        setQuery("")
        setResponse("")
        setShowResponse(false)
        
        recognition?.start()
        setIsListening(true)
      } catch (error) {
        console.error('启动语音识别失败:', error)
      }
    }
  }

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true)
      const answer = await searchKnowledge(message)
      
      // 移除"根据知识库内容为您解答："前缀
      const cleanAnswer = answer.replace('根据知识库内容为您解答：\n\n', '')
      
      // 只取第一段回答（到第一个双换行符为止）
      const firstAnswer = cleanAnswer.split('\n\n')[0]
      
      setResponse(firstAnswer)
      setShowResponse(true)
    } catch (error) {
      console.error('处理消息时出错:', error)
      setResponse(`抱歉，系统出现错误：${error instanceof Error ? error.message : '未知错误'}\n\n如果问题持续，请联系管理员。`)
      setShowResponse(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-4">智能政务语音助手</h2>
            <p className="text-blue-600 max-w-2xl mx-auto">
              请点击下方麦克风按钮，用普通话清晰地说出您的问题，例如"如何办理居民身份证"
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <button
                onClick={toggleListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                aria-label={isListening ? "停止录音" : "开始录音"}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
              {isListening && (
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64">
                  <VoiceWaveAnimation />
                </div>
              )}
            </div>

            {query && (
              <div className="mt-16 w-full max-w-2xl mx-auto bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <p className="text-center text-blue-800 font-medium">
                  您的问题: {query}
                </p>
              </div>
            )}

            {isLoading && (
              <div className="w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-3 text-blue-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p>正在思考您的问题，请稍候...</p>
                </div>
                <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
                </div>
              </div>
            )}

            {showResponse && <ResponseCard response={response} />}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

