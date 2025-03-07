// 这里将存储政务知识库内容
// 实际应用中，这些数据可以从外部文件或API加载

import { queryLLM, LLMConfig } from '@/config/llm.config';
import { VectorStore } from './vector-store';

interface KnowledgeItem {
  keywords: string[];
  question: string;
  answer: string;
}

let knowledgeBase: KnowledgeItem[] = [];

const vectorStore = new VectorStore();
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001');

// 加载知识库内容
async function loadKnowledgeBase(): Promise<KnowledgeItem[]> {
  try {
    const response = await fetch(`${baseUrl}/api/knowledge`);
    const data = await response.json();
    return data.qaList;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
}

// 初始化知识库
export async function initKnowledgeBase() {
  // 这里可以添加初始化逻辑
}

// 搜索知识库
export async function searchKnowledge(query: string): Promise<string> {
  try {
    console.log('开始搜索知识库，查询:', query);
    const results = await vectorStore.findSimilar(query, 3);
    console.log('搜索结果:', results);
    
    if (!results || results.length === 0) {
      console.log('未找到相关结果');
      return "抱歉，您询问的问题目前不在我们的知识库中。建议您：\n1. 请前往政务大厅相关窗口现场咨询\n2. 拨打政务服务热线12345\n3. 在工作时间与人工客服联系";
    }

    // 直接返回结果，不添加前缀
    return results.join('\n\n');
  } catch (error) {
    console.error('搜索知识库出错:', error);
    throw error;
  }
} 