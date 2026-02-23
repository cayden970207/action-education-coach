document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatScreen = document.getElementById('chat-screen');
    const messages = document.getElementById('messages');
    const newChatBtn = document.getElementById('new-chat-btn');
    const suggestions = document.getElementById('suggestions');

    // Configure marked
    marked.setOptions({
        breaks: true,
        gfm: true,
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
        sendBtn.disabled = chatInput.value.trim().length === 0;
    });

    // Enter to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !sendBtn.disabled) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', () => {
        if (!sendBtn.disabled) sendMessage();
    });

    // Suggestion pills
    suggestions.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (!pill) return;
        chatInput.value = pill.dataset.text;
        chatInput.dispatchEvent(new Event('input'));
        sendMessage();
    });

    // New chat
    newChatBtn.addEventListener('click', () => {
        messages.innerHTML = '';
        chatScreen.style.display = 'none';
        welcomeScreen.style.display = 'flex';
        newChatBtn.style.display = 'none';
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.disabled = true;
        chatInput.focus();
    });

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Switch to chat view
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
            chatScreen.style.display = 'flex';
            newChatBtn.style.display = 'flex';
        }

        appendMessage('user', text);

        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.disabled = true;

        // Show typing indicator
        const aiRow = appendMessage('ai', null, true);
        scrollToBottom();

        const response = await callAPI(text);

        // Replace typing indicator with response
        const bubble = aiRow.querySelector('.msg-bubble');
        bubble.innerHTML = marked.parse(response);
        scrollToBottom();
    }

    function appendMessage(role, text, isLoading = false) {
        const row = document.createElement('div');
        row.className = `msg msg-${role}`;

        if (role === 'ai') {
            row.innerHTML = `
                <div class="msg-avatar">
                    <span class="material-symbols-outlined">auto_awesome</span>
                </div>
                <div class="msg-bubble">${isLoading
                    ? '<div class="typing-indicator"><span></span><span></span><span></span></div>'
                    : marked.parse(text)
                }</div>
            `;
        } else {
            row.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
        }

        messages.appendChild(row);
        scrollToBottom();
        return row;
    }

    function scrollToBottom() {
        const container = chatScreen;
        container.scrollTop = container.scrollHeight;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async function callAPI(input) {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input }),
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                return `**服务器错误 (${res.status})**：服务器暂时无法响应，请稍后重试。`;
            }

            const data = await res.json();

            if (!res.ok || data.error) {
                return `**出错了：** ${data.error || 'Server Error'}`;
            }

            return data.response || '无返回内容，请重试。';
        } catch (err) {
            return `**网络错误：** 无法连接到服务器。(${err.message})`;
        }
    }
});
