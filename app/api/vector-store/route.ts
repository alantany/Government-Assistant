import { NextResponse } from 'next/server';
import { VectorStore } from '@/lib/vector-store-server';

// 创建单例向量存储实例
let vectorStore: VectorStore | null = null;

async function getVectorStore() {
  if (!vectorStore) {
    vectorStore = new VectorStore();
    await vectorStore.init();
  }
  return vectorStore;
}

// 添加文档
export async function POST(request: Request) {
  try {
    const { content, metadata } = await request.json();
    const store = await getVectorStore();
    await store.addDocument(content, metadata);
    
    return NextResponse.json({ 
      success: true,
      message: '文档已添加到向量存储'
    });
  } catch (error) {
    console.error('添加文档失败:', error);
    return NextResponse.json(
      { error: '添加文档失败' },
      { status: 500 }
    );
  }
}

// 搜索相似文档
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const topK = parseInt(searchParams.get('topK') || '3');

    if (!query) {
      return NextResponse.json(
        { error: '缺少查询参数' },
        { status: 400 }
      );
    }

    const store = await getVectorStore();
    const results = await store.findSimilar(query, topK);
    
    return NextResponse.json({ 
      success: true,
      results
    });
  } catch (error) {
    console.error('搜索文档失败:', error);
    return NextResponse.json(
      { error: '搜索文档失败' },
      { status: 500 }
    );
  }
} 