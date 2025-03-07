'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, AlertCircle } from 'lucide-react'

interface VectorDocument {
  id: string
  content: string
  keywords: string[]
}

interface GroupedDocuments {
  [key: string]: VectorDocument[]
}

export default function VectorContentViewer() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<GroupedDocuments>({})
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchVectorContent()
  }, [])

  const fetchVectorContent = async () => {
    try {
      const response = await fetch('/api/vectors/list')
      if (!response.ok) {
        throw new Error('获取数据失败')
      }
      const { data } = await response.json()
      setDocuments(data)
      // 默认选择第一个类型
      const types = Object.keys(data)
      if (types.length > 0) {
        setSelectedType(types[0])
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const response = await fetch(`/api/vectors?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      // 重新加载数据
      await fetchVectorContent()
      setShowConfirmDialog(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  const ConfirmDialog = ({ id, onConfirm, onCancel }: { id: string, onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-semibold">确认删除</h3>
        </div>
        <p className="text-gray-600 mb-6">
          确定要删除这条记录吗？此操作无法撤销。
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        错误：{error}
      </div>
    )
  }

  const documentTypes = Object.keys(documents)

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">向量化内容查看器</h2>
      
      {/* 类型选择器 */}
      <div className="mb-4">
        <div className="flex space-x-2">
          {documentTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg ${
                selectedType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {type} ({documents[type].length})
            </button>
          ))}
        </div>
      </div>

      {/* 文档列表 */}
      {selectedType && (
        <div className="space-y-4">
          {documents[selectedType].map((doc: VectorDocument) => (
            <div
              key={doc.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
            >
              <div className="text-gray-700 whitespace-pre-wrap mb-2">
                {doc.content}
              </div>
              {doc.keywords && doc.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {doc.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setDeletingId(doc.id)
                  setShowConfirmDialog(true)
                }}
                className="absolute top-2 right-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-full transition-all"
                disabled={!!deletingId}
              >
                {deletingId === doc.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 确认对话框 */}
      {showConfirmDialog && deletingId && (
        <ConfirmDialog
          id={deletingId}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => {
            setDeletingId(null)
            setShowConfirmDialog(false)
          }}
        />
      )}

      {/* 统计信息 */}
      <div className="mt-4 text-sm text-gray-500">
        总计：{Object.values(documents).reduce((sum, docs) => sum + docs.length, 0)} 条记录
      </div>
    </div>
  )
} 