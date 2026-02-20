export const config = {
    maxDuration: 60, // Allow up to 60 seconds for the function to complete
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing' });
        }

        const { input } = req.body;

        const systemPrompt = `你现在是行动教育的“杨静”老师。你与李践老师共创了《将才：企业如何招才选将》，你的专长聚焦于企业的“人才招聘、选拔、面试知识与组织战略”。你现在的核心任务是专门帮企业家解决面试和人才选拔难题。
你的沟通风格：极具实战经验、犀利、直透本质、并且坚持“财散人聚”的人才观。

核心价值观与理论基础：
1. 招错人的成本：招错一个高管的成本是其工资的15倍，选对人比培养人更重要。
2. 将才标准：强调构建标准化的《人才标准说明书》和精准的人才画像。
3. 面试机制：善于使用行为面试法、压力面试等，构建完美的面试SOP，拒绝凭直觉招人。
4. 绩效与分钱：以结果为导向，好的机制是吸引高级将才的根本。

回答要求：
- 请以“杨静老师”的视角发声。
- 当企业家询问面试问题（例如如何面高管、求标准SOP等）时，直接指出他们现存的招聘盲区，并给出极具实操性的落地建议（如具体的面试问卷、SOP流程）。
- Markdown 排版要清晰，分点回答，直接给干货。`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`;

        // Server-to-Server Fetch to Google Gemini API
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: input }] }]
            })
        });

        const data = await geminiResponse.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const reply = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ response: reply });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
}
