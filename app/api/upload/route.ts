import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

interface QAEntry {
  keywords: string[];
  question: string;
  answer: string;
}

function parseMarkdown(content: string): QAEntry[] {
  const entries: QAEntry[] = [];
  // 按主要部分分割（## 开头的部分）
  const sections = content.split('\n## ').slice(1);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const title = lines[0].trim();
    let currentKeywords: string[] = [];
    let currentQuestion = '';
    let currentAnswer = '';
    let collectingAnswer = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 处理关键词行
      if (line.startsWith('### 关键词:')) {
        currentKeywords = line.replace('### 关键词:', '').split(',').map(k => k.trim());
      }
      // 处理问题行
      else if (line.match(/^####\s+问题\s+\d+:\s+/)) {
        // 如果之前有收集的问答对，先保存
        if (currentQuestion && currentAnswer) {
          entries.push({
            keywords: currentKeywords,
            question: currentQuestion,
            answer: currentAnswer.trim()
          });
          currentAnswer = ''; // 重置答案
        }
        currentQuestion = line.replace(/^####\s+问题\s+\d+:\s+/, '').trim();
        collectingAnswer = false;
      }
      // 处理回答行
      else if (line.startsWith('**回答:**')) {
        collectingAnswer = true;
        continue; // 跳过"回答:"这一行
      }
      // 收集回答内容
      else if (collectingAnswer) {
        // 如果遇到新的问题或关键词，停止收集
        if (line.startsWith('####') || line.startsWith('###')) {
          collectingAnswer = false;
          if (currentQuestion && currentAnswer) {
            entries.push({
              keywords: currentKeywords,
              question: currentQuestion,
              answer: currentAnswer.trim()
            });
            currentAnswer = '';
          }
        } else if (line) {
          currentAnswer += (currentAnswer ? '\n' : '') + line;
        }
      }
    }

    // 保存最后一个问答对
    if (currentQuestion && currentAnswer) {
      entries.push({
        keywords: currentKeywords,
        question: currentQuestion,
        answer: currentAnswer.trim()
      });
    }
  }

  console.log('解析结果:', entries.map(entry => ({
    keywords: entry.keywords,
    question: entry.question.substring(0, 50),
    answerLength: entry.answer.length
  })));

  return entries;
}

async function addToVectorStore(content: string, metadata: any) {
  try {
    console.log('正在添加内容到向量存储:', content.substring(0, 50) + '...');
    
    const response = await fetch('http://localhost:3000/api/vectors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, metadata })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('添加到向量存储失败:', {
        status: response.status,
        error: errorData
      });
      throw new Error(`Failed to add document to vector store: ${response.status}`);
    }

    console.log('成功添加内容到向量存储');
    return true;
  } catch (error) {
    console.error('添加到向量存储时出错:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到上传的文件' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const text = await file.text();
    console.log('文件内容长度:', text.length);
    
    // 解析markdown文档
    const qaEntries = parseMarkdown(text);
    console.log('解析出的问答对数量:', qaEntries.length);
    
    if (qaEntries.length === 0) {
      console.log('原始文件内容:', text);
      return NextResponse.json({ 
        success: false, 
        error: '未能从文件中解析出任何问答对，请检查文件格式是否正确' 
      });
    }
    
    // 将问答对添加到向量存储
    let addedCount = 0;
    for (const entry of qaEntries) {
      console.log('处理问答对:', {
        keywords: entry.keywords,
        question: entry.question.substring(0, 50) + '...',
        answerLength: entry.answer.length
      });
      
      // 存储问题和答案
      await addToVectorStore(entry.question, {
        type: 'question',
        keywords: entry.keywords
      });
      addedCount++;
      
      await addToVectorStore(entry.answer, {
        type: 'answer',
        keywords: entry.keywords
      });
      addedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: '文件已成功处理并添加到知识库',
      entriesCount: qaEntries.length,
      addedCount: addedCount
    });
    
  } catch (error) {
    console.error('处理上传文件时出错:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理文件时出错' },
      { status: 500 }
    );
  }
} 