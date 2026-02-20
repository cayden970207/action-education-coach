document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatMessages = document.getElementById('chat-messages');

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

    // Call Vercel Serverless Function
    async function generateCoachResponse(input) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ input })
            });

            // Handle non-JSON responses (e.g. Vercel 504 timeout pages)
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                return `<p><strong>服务器错误 (${response.status})：</strong>服务器暂时无法响应，请稍后重试。</p>`;
            }

            const data = await response.json();

            if (!response.ok || data.error) {
                return `<p><strong>出错了：</strong> ${data.error || 'Server Error'}</p>`;
            }

            let reply = data.response;

            // Convert simple markdown to html layout
            if (reply) {
                reply = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                reply = reply.replace(/\*(.*?)\*/g, '<em>$1</em>');
                reply = reply.replace(/\n\n/g, '<br><br>');
                reply = reply.replace(/\n/g, '<br>');
            } else {
                reply = "<p>无返回内容，请重试。</p>";
            }

            return reply;

        } catch (err) {
            return `<p><strong>网络错误：</strong>无法连接到服务器。请检查网络。(${err.message})</p>`;
        }
    }
});
