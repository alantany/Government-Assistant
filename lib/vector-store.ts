/**
 * 文档接口定义
 */
interface Document {
  id: string;
  content: string;
  metadata?: {
    type: 'question' | 'answer';
    keywords?: string[];
  };
}

/**
 * 向量存储客户端
 * 所有实际的存储和计算都在服务器端API中完成
 */
export class VectorStore {
  private baseUrl: string;

  constructor() {
    // 在客户端使用当前域名，在服务器端使用环境变量
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001');
  }

  /**
   * 添加文档到向量存储
   */
  async addDocument(content: string, metadata?: Document['metadata']): Promise<void> {
    try {
      console.log('正在添加文档到向量存储，使用API:', `${this.baseUrl}/api/vectors`);
      
      const response = await fetch(`${this.baseUrl}/api/vectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, metadata })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('添加文档失败，状态码:', response.status, '错误:', errorData);
        throw new Error(errorData.error || '添加文档失败');
      }
    } catch (error) {
      console.error('添加文档失败:', error);
      throw error;
    }
  }

  /**
   * 查找相似文档
   */
  async findSimilar(query: string, topK: number = 3): Promise<string[]> {
    try {
      console.log('正在搜索相似文档，使用API:', `${this.baseUrl}/api/vectors`);
      
      const response = await fetch(
        `${this.baseUrl}/api/vectors?query=${encodeURIComponent(query)}&topK=${topK}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('搜索失败，状态码:', response.status, '错误:', errorData);
        throw new Error(errorData.error || '搜索失败');
      }

      const data = await response.json();
      console.log('搜索结果:', data);
      
      if (!data.results) {
        console.error('搜索结果格式错误:', data);
        throw new Error('搜索结果格式错误');
      }

      return data.results;
    } catch (error) {
      console.error('搜索相似文档失败:', error);
      throw error;
    }
  }
} 