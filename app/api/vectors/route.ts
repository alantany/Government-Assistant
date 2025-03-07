import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

interface Document {
  id: string;
  content: string;
  embedding: number[];
  metadata?: {
    type: 'question' | 'answer';
    keywords?: string[];
  };
}

// 存储路径
const dataPath = join(process.cwd(), 'data', 'vectors.json');

// 读取向量数据
async function loadDocuments(): Promise<Document[]> {
  try {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    const data = await readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    // 如果文件不存在，返回空数组
    return [];
  }
}

// 保存向量数据
async function saveDocuments(documents: Document[]) {
  await writeFile(dataPath, JSON.stringify(documents, null, 2));
}

// 获取文本向量
async function getEmbedding(text: string): Promise<number[]> {
  try {
    console.log('正在获取文本向量:', text.substring(0, 50) + '...');
    
    const response = await fetch('http://127.0.0.1:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'quentinz/bge-large-zh-v1.5:latest',
        prompt: text
      })
    });

    if (!response.ok) {
      console.error('Ollama服务响应错误:', response.status, response.statusText);
      throw new Error(`Ollama服务响应错误: ${response.status}`);
    }

    const data = await response.json();
    if (!data.embedding || !Array.isArray(data.embedding)) {
      console.error('Ollama返回的数据格式不正确:', data);
      throw new Error('向量格式错误');
    }

    console.log('成功获取向量，维度:', data.embedding.length);
    return data.embedding;
  } catch (error) {
    console.error('获取文本向量失败:', error);
    throw new Error(`获取文本向量失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 计算余弦相似度
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

// 添加文档
export async function POST(request: Request) {
  try {
    const { content, metadata } = await request.json();
    const documents = await loadDocuments();
    
    const embedding = await getEmbedding(content);
    documents.push({
      id: crypto.randomUUID(),
      content,
      embedding,
      metadata
    });

    await saveDocuments(documents);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('添加文档失败:', error);
    return NextResponse.json({ error: '添加文档失败' }, { status: 500 });
  }
}

// 搜索相似文档
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const topK = parseInt(searchParams.get('topK') || '3');

    console.log('收到搜索请求:', query);

    if (!query) {
      return NextResponse.json({ error: '缺少查询参数' }, { status: 400 });
    }

    const documents = await loadDocuments();
    console.log('加载文档数量:', documents.length);
    
    if (documents.length === 0) {
      console.log('知识库为空');
      return NextResponse.json({ 
        results: [],
        debug: { message: '知识库为空' }
      });
    }

    const queryEmbedding = await getEmbedding(query);
    console.log('已获取查询向量');
    
    // 计算余弦相似度并排序
    const scored = documents.map(doc => ({
      content: doc.content,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
      type: doc.metadata?.type
    }));

    // 按相似度排序
    scored.sort((a, b) => b.score - a.score);
    
    console.log('相似度计算完成，分数:', scored.map(s => ({
      score: s.score,
      type: s.type,
      preview: s.content.substring(0, 50)
    })));
    
    // 提高相似度阈值，确保只返回高度相关的结果
    const threshold = 0.6; // 提高相似度阈值
    const filteredResults = scored.filter(item => item.score >= threshold);
    
    console.log('过滤后的结果数量:', filteredResults.length);
    
    // 如果没有找到相似度足够高的结果
    if (filteredResults.length === 0) {
      console.log('未找到相似度足够高的结果，最高分数:', scored[0]?.score);
      return NextResponse.json({ 
        results: ['抱歉，您询问的问题目前不在我们的知识库中。建议您：\n1. 请前往政务大厅相关窗口现场咨询\n2. 拨打政务服务热线12345\n3. 在工作时间与人工客服联系'],
        debug: { 
          message: '未找到相似度足够高的结果',
          query: query,
          topScores: scored.slice(0, 3).map(item => ({
            score: item.score,
            content: item.content.substring(0, 50) + '...',
            type: item.type
          }))
        }
      });
    }

    // 获取前topK个结果，优先返回答案类型的文档
    const answers = filteredResults.filter(item => item.type === 'answer');
    const questions = filteredResults.filter(item => item.type === 'question');
    const others = filteredResults.filter(item => !item.type);
    
    console.log('按类型分类结果:', {
      answers: answers.length,
      questions: questions.length,
      others: others.length
    });

    const sortedResults = [...answers, ...questions, ...others].slice(0, topK);
    const results = sortedResults.map(item => item.content);

    console.log('返回结果数量:', results.length, '最高相似度:', sortedResults[0].score);

    return NextResponse.json({
      results,
      debug: {
        totalDocuments: documents.length,
        matchedDocuments: filteredResults.length,
        query,
        topScores: sortedResults.map(item => ({
          score: item.score,
          type: item.type,
          content: item.content.substring(0, 50) + '...'
        }))
      }
    });
  } catch (error) {
    console.error('搜索文档失败:', error);
    return NextResponse.json({ 
      error: '搜索失败',
      details: error instanceof Error ? error.message : '未知错误',
      query
    }, { status: 500 });
  }
}

// 删除文档
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少文档ID' }, { status: 400 });
    }

    const documents = await loadDocuments();
    const newDocuments = documents.filter(doc => doc.id !== id);
    
    await saveDocuments(newDocuments);
    
    return NextResponse.json({ 
      success: true,
      message: '文档已删除'
    });
  } catch (error) {
    console.error('删除文档失败:', error);
    return NextResponse.json({ error: '删除文档失败' }, { status: 500 });
  }
} 