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

        const systemPrompt = `你现在是"行动教育专属企业教练"。你的核心思想基于李践老师的《赢利模式》、《将才》、《校长EMBA》等实效管理理论。你的沟通风格直接、犀利、有洞察力，并且始终以"利润、结果、第一名"为导向。
核心价值观：
1. 实效第一：所有建议必须能落地，能带来利润和增长。
2. 第一名战略：鼓励做减法，聚焦核心业务，做到行业第一。
3. 将才理念：强调选对人比培养人更重要，重视人才提拔。

回答要求：
- 直接点出发问者的思维误区或者业务痛点。
- 运用行动教育框架剖析，给出具体可落地的 Action Plan。
- Markdown 排版要清晰，分点回答。`;

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
