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
    window.fillInput = function(text) {
        chatInput.value = text;
        sendBtn.removeAttribute('disabled');
        chatInput.focus();
    };

    function sendMessage() {
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

        // Simulate AI thinking and replying
        setTimeout(() => {
            const aiResponse = generateCoachResponse(text);
            addAiMessage(aiResponse);
            scrollToBottom();
        }, 800);
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

    // Mock AI Logic based on Action Education
    function generateCoachResponse(input) {
        const keywords = input;
        
        if (keywords.includes("利润") || keywords.includes("赢利")) {
            return `
                <p><strong>教练洞察：利润是企业的生命线，没有利润一切都是空谈！</strong></p>
                <br>
                <p>根据《赢利模式》，你可以从以下几个维度重构你的护城河：</p>
                <ul style="margin-left: 20px; line-height: 1.8;">
                    <li><strong>第一名战略</strong>：你们处于行业的什么位置？聚焦核心优势，抛弃不赚钱的业务。</li>
                    <li><strong>大客户战略</strong>：百分之二十的客户创造百分之八十的利润。你们锁定大客户了吗？</li>
                    <li><strong>产品差异化</strong>：不要陷入价格战，要创造独特的不可替代的客户价值。</li>
                </ul>
                <br>
                <p><b>行动建议：</b>请马上梳理你公司最赚钱的3个产品，砍掉一直在亏钱的尾部产品！</p>
            `;
        } else if (keywords.includes("招人") || keywords.includes("招聘") || keywords.includes("将才") || keywords.includes("人才")) {
            return `
                <p><strong>教练洞察：招错一个人，成本是工资的15倍！选对人比培养人更重要。</strong></p>
                <br>
                <p>李践老师在《将才》中明确指出，招才选将必须坚持“财散人聚”的核心理念。</p>
                <ul style="margin-left: 20px; line-height: 1.8;">
                    <li><strong>绘制人才画像</strong>：你们清楚到底要招什么能力、什么价值观的人吗？</li>
                    <li><strong>高标准严要求</strong>：宁缺毋滥，不要因为业务急就凑合招人。</li>
                    <li><strong>绩效与分配机制</strong>：有没有让优秀的人拿到不可思议的薪酬？如果你们只给平庸的工资，只能吸引平庸的员工。</li>
                </ul>
                <br>
                <p><b>行动建议：</b>停止无目的的面试，先花1个小时写清楚你要招聘的高管的《人才标准说明书》！</p>
            `;
        } else if (keywords.includes("第一名") || keywords.includes("战略")) {
            return `
                <p><strong>战略就是做减法，要么第一，要么唯一！</strong></p>
                <br>
                <p>在行动教育的体系里，没有中间地带。要想执行“第一名战略”：</p>
                <ol style="margin-left: 20px; line-height: 1.8;">
                    <li>缩小阵地，在你最擅长的某一个细分领域做到极致。</li>
                    <li>对标本行业的世界第一名，找到差距，全员All in去学习和超越。</li>
                    <li>一切目标以行业老大为准，不做第二！</li>
                </ol>
                <br>
                <p><b>行动建议：</b>告诉团队，你们今年的唯一核心战场是哪个细分市场？</p>
            `;
        } else {
            return `
                <p><strong>你好，我是你的行动教育实效教练。</strong></p>
                <br>
                <p>企业经营的核心就是“实效增长”。针对你当下的困惑，我建议你重新审视以下三点：</p>
                <ul style="margin-left: 20px; line-height: 1.8;">
                    <li><strong>战略是否聚焦？</strong>（有没有做到细分行业第一名）</li>
                    <li><strong>人才是否匹配？</strong>（选对了将才还是庸才）</li>
                    <li><strong>机制是否激活？</strong>（分钱机制是否能让核心骨干像老板一样操心）</li>
                </ul>
                <br>
                <p>如果你有更具体的问题，比如利润率低下、高管离职、业绩停滞等，请具体提问，我会用《赢利模式》和《将才》的底层逻辑来为你解答！</p>
            `;
        }
    }
});
