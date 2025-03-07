import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { Embeddings } from '@langchain/core/embeddings';
import { Document } from '@langchain/core/documents';

// 使用 langchain 的 HNSWLib 替代 faiss
// HNSWLib 是一个纯 JavaScript 实现的向量存储库，不需要原生模块

interface StoredDocument {
  id: string;
  content: string;
  metadata?: {
    type: 'question' | 'answer';
    keywords?: string[];
  };
}

class CustomEmbeddings extends Embeddings {
  private modelEndpoint = 'http://127.0.0.1:11434/api/embeddings';
  private model = 'quentinz/bge-large-zh-v1.5:latest';

  constructor(config = {}) {
    super(config);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.embedQuery(text)));
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const response = await fetch(this.modelEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: text
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('获取文本向量失败:', error);
      throw error;
    }
  }
}

export class VectorStore {
  private store: HNSWLib | null = null;
  private documents: StoredDocument[] = [];
  private readonly dataDir: string;
  private readonly storePath: string;
  private readonly docPath: string;

  constructor() {
    // 使用项目根目录下的data文件夹
    this.dataDir = join(process.cwd(), 'data');
    this.storePath = join(this.dataDir, 'hnswlib');
    this.docPath = join(this.dataDir, 'documents.json');
  }

  async init() {
    try {
      // 确保数据目录存在
      await mkdir(this.dataDir, { recursive: true });

      // 尝试加载现有存储
      try {
        const loadedStore = await HNSWLib.load(
          this.storePath,
          new CustomEmbeddings()
        );
        this.store = loadedStore;

        const docsData = await readFile(this.docPath, 'utf-8');
        this.documents = JSON.parse(docsData);
      } catch (e) {
        // 如果不存在，创建新的
        this.store = await HNSWLib.fromTexts(
          [],
          [],
          new CustomEmbeddings()
        );
        this.documents = [];
      }
    } catch (error) {
      console.error('初始化向量存储失败:', error);
      throw error;
    }
  }

  async addDocument(content: string, metadata?: StoredDocument['metadata']): Promise<void> {
    if (!this.store) {
      throw new Error('向量存储未初始化');
    }

    try {
      const doc: StoredDocument = {
        id: crypto.randomUUID(),
        content,
        metadata
      };

      // 添加到 HNSWLib
      await this.store.addDocuments([
        new Document({
          pageContent: content,
          metadata: { 
            id: doc.id,
            ...metadata
          }
        })
      ]);

      // 添加到文档列表
      this.documents.push(doc);

      // 保存
      await this.save();
    } catch (error) {
      console.error('添加文档失败:', error);
      throw error;
    }
  }

  private async save() {
    if (!this.store) return;

    try {
      await this.store.save(this.storePath);
      await writeFile(
        this.docPath,
        JSON.stringify(this.documents, null, 2)
      );
    } catch (error) {
      console.error('保存向量存储失败:', error);
      throw error;
    }
  }

  async findSimilar(query: string, topK: number = 3): Promise<string[]> {
    if (!this.store) {
      throw new Error('向量存储未初始化');
    }

    try {
      const results = await this.store.similaritySearch(query, topK);
      return results.map(doc => doc.pageContent);
    } catch (error) {
      console.error('搜索相似文档失败:', error);
      throw error;
    }
  }
} 