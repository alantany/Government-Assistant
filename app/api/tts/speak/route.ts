import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { writeFile } from 'fs/promises';

// 创建一个临时目录来存储 Python 脚本
const TEMP_DIR = join(process.cwd(), 'temp');
const SCRIPT_PATH = join(TEMP_DIR, 'tts.py');

// Python TTS 脚本内容
const PYTHON_SCRIPT = `
import sys
import pyttsx3

def speak(text):
    engine = pyttsx3.init()
    # 设置中文语音
    voices = engine.getProperty('voices')
    for voice in voices:
        if 'chinese' in voice.languages[0].lower():
            engine.setProperty('voice', voice.id)
            break
    
    # 设置语速（默认是200）
    engine.setProperty('rate', 150)
    # 设置音量（0-1）
    engine.setProperty('volume', 1.0)
    
    try:
        engine.say(text)
        engine.runAndWait()
        return True
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        text = sys.argv[1]
        speak(text)
`;

// 确保脚本文件存在
async function ensureScript() {
  try {
    await writeFile(SCRIPT_PATH, PYTHON_SCRIPT);
  } catch (error) {
    console.error('创建 Python 脚本失败:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: '缺少文本内容' }, { status: 400 });
    }

    // 确保脚本存在
    await ensureScript();

    return new Promise((resolve) => {
      const process = spawn('python3', [SCRIPT_PATH, text]);
      
      let error = '';
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('TTS 执行失败:', error);
          resolve(NextResponse.json({ 
            error: 'TTS 执行失败',
            details: error
          }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ 
            success: true,
            duration: text.length * 200 // 估算持续时间（毫秒）
          }));
        }
      });
    });
  } catch (error) {
    console.error('处理请求失败:', error);
    return NextResponse.json({ 
      error: '处理请求失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 