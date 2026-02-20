document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatMessages = document.getElementById('chat-messages');

    // Modal UI elements
    const settingsBtn = document.querySelectorAll('.sidebar-action-item')[2]; // 3rd item is settings
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const apiKeyInput = document.getElementById('api-key-input');

    // Load API Key on start
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('show');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('show');
    });

    saveSettingsBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            settingsModal.classList.remove('show');
            alert('API Key 保存成功！现在你可以开始真实的对话了。');
        } else {
            alert('API Key 不能为空');
        }
    });

    // Toggle Sidebar
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Handle Input Changes
    chatInput.addEventListener('input', () => {
        if (chatInput.value.trim().length > 0) {
            sendBtn.removeAttribute('disabled');
        } else {
            sendBtn.setAttribute('disabled', 'true');
        }
    });

    // Handle Enter Key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !sendBtn.hasAttribute('disabled')) {
            sendMessage();
        }
    });

    // Handle Send Button
    sendBtn.addEventListener('click', () => {
        if (!sendBtn.hasAttribute('disabled')) {
            sendMessage();
        }
    });

    // Function to fill input from suggestions
    window.fillInput = function (text) {
        chatInput.value = text;
        sendBtn.removeAttribute('disabled');
        chatInput.focus();
    };

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Hide welcome screen and show chat
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
            chatMessages.style.display = 'flex';
        }

        // Add user message
        addUserMessage(text);

        // Clear input
        chatInput.value = '';
        sendBtn.setAttribute('disabled', 'true');

        // Show a loading text or state
        addAiMessage('正在结合行动教育理念思考...');
        scrollToBottom();

        // Call Real AI 
        const aiResponse = await generateCoachResponse(text);

        // Update the last AI message
        const lastMessage = chatMessages.lastElementChild.querySelector('.message-bubble');
        lastMessage.innerHTML = aiResponse;
        scrollToBottom();
    }

    function addUserMessage(text) {
        const row = document.createElement('div');
        row.className = 'message-row user-message';

        row.innerHTML = `
            <div class="message-bubble">${escapeHtml(text)}</div>
        `;

        chatMessages.appendChild(row);
        scrollToBottom();
    }

    function addAiMessage(text) {
        const row = document.createElement('div');
        row.className = 'message-row ai-message';

        // Typing effect logic could go here, for now we inject direct HTML
        row.innerHTML = `
            <div class="ai-icon">
                <span class="material-symbols-outlined" style="font-size: 20px;">model_training</span>
            </div>
            <div class="message-bubble">${text}</div>
        `;

        chatMessages.appendChild(row);
    }

    function scrollToBottom() {
        const mainContent = document.querySelector('.chat-container');
        mainContent.scrollTop = mainContent.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Call Real Gemini API based on Action Education System Prompt
    async function generateCoachResponse(input) {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            settingsModal.classList.add('show');
            return "<p><strong>系统提示：请先在设置中心配置你的 Gemini API Key 以解锁完整的大模型对话功能。</strong></p>";
        }

        const systemPrompt = `你现在是“行动教育专属企业教练”。你的核心思想基于李践老师的《赢利模式》、《将才》、《校长EMBA》等实效管理理论。你的沟通风格直接、犀利、有洞察力，并且始终以“利润、结果、第一名”为导向。
核心价值观：
1. 实效第一：所有建议必须能落地，能带来利润和增长。
2. 第一名战略：鼓励做减法，聚焦核心业务，做到行业第一。
3. 将才理念：强调选对人比培养人更重要，重视人才提拔。

回答要求：
- 直接点出发问者的思维误区或者业务痛点。
- 运用行动教育框架剖析，给出具体可落地的 Action Plan。
- Markdown 排版要清晰，分点回答。`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [{
                        parts: [{ text: input }]
                    }]
                })
            });

            const data = await response.json();
            if (data.error) {
                return `<p><strong>API 错误：</strong> ${data.error.message}</p>`;
            }

            let reply = data.candidates[0].content.parts[0].text;

            // Convert simple markdown to html layout
            reply = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            reply = reply.replace(/\*(.*?)\*/g, '<em>$1</em>');
            reply = reply.replace(/\n\n/g, '<br><br>');
            reply = reply.replace(/\n/g, '<br>');

            return reply;

        } catch (err) {
            return `<p><strong>网络错误：</strong>无法连接到大语言模型。请检查网络。(${err.message})</p>`;
        }
    }
});
