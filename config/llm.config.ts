export const LLMConfig = {
  endpoint: 'http://127.0.0.1:11434/api/generate',
  model: 'deepseek-r1:14b',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: `你是一个专业的政务服务助手。请直接回答用户问题，不要显示你的思考过程。要求：
1. 直接给出清晰的答案
2. 使用专业、友善的语气
3. 如果知识库中没有相关信息，请礼貌地告知并建议咨询其他渠道
4. 不要输出任何以<think>开头的内容`
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export async function queryLLM(prompt: string): Promise<string> {
  try {
    const response = await fetch(LLMConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLMConfig.model,
        prompt: prompt,
        stream: false,
        temperature: LLMConfig.temperature,
        max_tokens: LLMConfig.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as OllamaResponse;
    
    // 移除任何 <think> 标签之间的内容
    let cleanedResponse = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    return cleanedResponse;
  } catch (error) {
    console.error('Error querying LLM:', error);
    return '抱歉，我暂时无法处理您的请求。请稍后再试。';
  }
} 