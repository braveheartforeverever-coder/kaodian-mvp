// LLM Client for lyrics generation
// 支持 OpenAI 兼容接口（DeepSeek / OpenAI / 通义等）

export async function generateLyrics(knowledgePoint: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error('LLM_API_KEY is not set');

  const prompt = `把以下考试知识点改编成歌词。

规则：
1. 只写知识点本身，不要写"记住""背诵""考试"等与学习相关的废话
2. 每句歌词必须对应一个具体知识点或关键词
3. 用押韵和节奏感让人自然记住，不要说教
4. 结构：[Verse] [Chorus] [Bridge]
5. 副歌唱的是核心概念本身，不是"要记住核心概念"
6. 总时长控制在60-90秒（150-250字）
7. 像一首真正的歌，不像一篇课文被强行塞进旋律

好的例子：
[Chorus]
矛盾普遍性 特殊性
普遍寓于特殊里
特殊包含普遍性

坏的例子：
[Chorus]
矛盾规律要牢记
考试答题不忘记
辩证法的光照前方

知识点：
${knowledgePoint}

直接输出歌词。`;

  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`LLM API error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return data.choices[0].message.content;
}
