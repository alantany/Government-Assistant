"use client"

import { useState } from 'react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import UploadForm from '@/components/upload-form'
import VectorContentViewer from '@/components/vector-content-viewer'

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-4">知识库管理</h2>
            <p className="text-blue-600">
              在这里您可以上传和管理政务知识库的内容
            </p>
          </div>

          <div className="grid gap-8">
            {/* 上传表单 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">上传知识文档</h2>
              </div>
              <div className="p-4">
                <UploadForm />
              </div>
            </div>

            {/* 向量化内容查看器 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">已上传内容</h2>
              </div>
              <div className="p-4">
                <VectorContentViewer />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">使用说明</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>支持上传 .txt 或 .md 格式的文本文件</li>
              <li>文件内容会被自动分段处理并添加到知识库</li>
              <li>建议将相关的政务信息整理成结构化的文本再上传</li>
              <li>上传的内容将立即可用于智能问答服务</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
} 