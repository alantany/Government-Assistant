"use client"

import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.name.match(/\.(txt|md)$/)) {
      setMessage('只支持 .txt 或 .md 格式的文件')
      return
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setMessage('文件大小不能超过 5MB')
      return
    }

    setIsUploading(true)
    setMessage('')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result = await response.json()
      if (result.success) {
        setMessage(`文件上传成功！已处理 ${result.entriesCount} 个问答对，共添加 ${result.addedCount} 条向量化内容到知识库。`)
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (error) {
      console.error('上传错误:', error)
      setMessage('上传失败，请重试。')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      // 清除文件输入
      event.target.value = ''
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isUploading ? 'border-blue-500 bg-blue-50' : 'border-blue-300 hover:border-blue-500'
      }`}>
        <label className="block cursor-pointer">
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-blue-500" />
            )}
            <span className="text-sm text-gray-600">
              {isUploading ? '正在处理文件...' : '点击上传文本文件 (.txt, .md)'}
            </span>
            <span className="text-xs text-gray-500">
              最大文件大小: 5MB
            </span>
          </div>
        </label>
      </div>
      
      {uploadProgress !== null && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {message && (
        <p className={`mt-4 text-center ${
          message.includes('成功') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  )
} 