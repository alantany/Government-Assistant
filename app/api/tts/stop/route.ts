import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // 查找并终止所有 Python TTS 进程
    await execAsync('pkill -f "python3.*tts.py"');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // 忽略错误，因为可能没有正在运行的进程
    return NextResponse.json({ success: true });
  }
} 