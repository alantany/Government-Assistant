import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // 读取向量存储文件
    const dataPath = join(process.cwd(), 'data', 'vectors.json');
    const data = await readFile(dataPath, 'utf-8');
    const documents = JSON.parse(data);

    // 按类型分组文档
    const groupedDocs = documents.reduce((acc: any, doc: any) => {
      const type = doc.metadata?.type || '其他';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({
        id: doc.id,
        content: doc.content,
        keywords: doc.metadata?.keywords || [],
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: groupedDocs
    });
  } catch (error) {
    console.error('获取向量化内容失败:', error);
    return NextResponse.json(
      { error: '获取向量化内容失败' },
      { status: 500 }
    );
  }
} 