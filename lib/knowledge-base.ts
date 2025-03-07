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
      return "抱歉，目前知识库中没有找到相关的信息。建议您通过以下方式获取帮助：\n1. 访问政务大厅现场咨询\n2. 拨打政务服务热线\n3. 在工作时间与人工客服联系";
    }

    // 如果找到结果，返回最相关的答案
    console.log('找到相关结果，数量:', results.length);
    return `根据知识库内容为您解答：\n\n${results.join('\n\n')}`;
  } catch (error) {
    console.error('搜索知识库出错:', error);
    // 重新抛出错误，让上层处理
    throw error;
  }
} 