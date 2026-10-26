// JavaScript File for Ujjwal Sharma's Portfolio Website

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Initialize Theme from localStorage if present
    if (localStorage.getItem('theme') === 'light') {
        htmlElement.classList.remove('dark');
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Simulated Backend (LocalStorage Form Submissions)
    const contactForm = document.getElementById('contactForm');
    const formAlert = document.getElementById('formAlert');
    const dbRecordCount = document.getElementById('dbRecordCount');
    const viewStoredMessagesBtn = document.getElementById('viewStoredMessagesBtn');
    const messagesModal = document.getElementById('messagesModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalBtnSecondary = document.getElementById('closeModalBtnSecondary');
    const clearDbBtn = document.getElementById('clearDbBtn');
    const messagesListContainer = document.getElementById('messagesListContainer');

    function updateDbCount() {
        try {
            const messages = JSON.parse(localStorage.getItem('ujjwal_portfolio_contacts') || '[]');
            dbRecordCount.textContent = `${messages.length} Message${messages.length === 1 ? '' : 's'} Stored`;
        } catch (e) {
            dbRecordCount.textContent = '0 Messages Stored';
        }
    }
    updateDbCount();

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('senderName').value.trim();
        const email = document.getElementById('senderEmail').value.trim();
        const subject = document.getElementById('senderSubject').value.trim();
        const message = document.getElementById('senderMessage').value.trim();

        if (!name || !email || !subject || !message) return;

        const newRecord = {
            id: Date.now(),
            name,
            email,
            subject,
            message,
            timestamp: new Date().toLocaleString()
        };

        try {
            const existing = JSON.parse(localStorage.getItem('ujjwal_portfolio_contacts') || '[]');
            existing.unshift(newRecord);
            localStorage.setItem('ujjwal_portfolio_contacts', JSON.stringify(existing));
            
            updateDbCount();

            formAlert.className = "p-4 rounded-2xl text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
            formAlert.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i> Success! Message recorded in simulated database. Ujjwal will get back to you soon.`;
            formAlert.classList.remove('hidden');

            contactForm.reset();
            setTimeout(() => { formAlert.classList.add('hidden'); }, 5000);
        } catch (err) {
            formAlert.className = "p-4 rounded-2xl text-sm font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20";
            formAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-2"></i> Error saving message to local simulated storage.`;
            formAlert.classList.remove('hidden');
        }
    });

    viewStoredMessagesBtn.addEventListener('click', () => {
        try {
            const messages = JSON.parse(localStorage.getItem('ujjwal_portfolio_contacts') || '[]');
            if (messages.length === 0) {
                messagesListContainer.innerHTML = `<p class="text-sm text-slate-500 text-center py-6">No messages stored in the simulated database yet. Send a message using the contact form!</p>`;
            } else {
                messagesListContainer.innerHTML = messages.map(m => `
                    <div class="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <div class="flex justify-between items-center text-xs text-slate-500">
                            <span class="font-bold text-indigo-500">${escapeHtml(m.name)} (${escapeHtml(m.email)})</span>
                            <span>${escapeHtml(m.timestamp)}</span>
                        </div>
                        <h4 class="font-bold text-sm">Subject: ${escapeHtml(m.subject)}</h4>
                        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(m.message)}</p>
                    </div>
                `).join('');
            }
            messagesModal.classList.remove('hidden');
        } catch (e) {
            messagesListContainer.innerHTML = `<p class="text-sm text-rose-500 text-center py-6">Error loading records.</p>`;
            messagesModal.classList.remove('hidden');
        }
    });

    closeModalBtn.addEventListener('click', () => messagesModal.classList.add('hidden'));
    closeModalBtnSecondary.addEventListener('click', () => messagesModal.classList.add('hidden'));

    clearDbBtn.addEventListener('click', () => {
        localStorage.removeItem('ujjwal_portfolio_contacts');
        updateDbCount();
        messagesListContainer.innerHTML = `<p class="text-sm text-slate-500 text-center py-6">Simulated database cleared successfully.</p>`;
    });

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // AI Assistant Widget & Gemini API Integration
    const aiToggleBtn = document.getElementById('aiToggleBtn');
    const aiChatWindow = document.getElementById('aiChatWindow');
    const aiCloseBtn = document.getElementById('aiCloseBtn');
    const aiInput = document.getElementById('aiInput');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiMessages = document.getElementById('aiMessages');
    const aiSuggestions = document.querySelectorAll('.ai-suggestion');

    aiToggleBtn.addEventListener('click', () => {
        aiChatWindow.classList.toggle('hidden');
    });

    aiCloseBtn.addEventListener('click', () => {
        aiChatWindow.classList.add('hidden');
    });

    aiSuggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            aiInput.value = btn.textContent;
            handleUserMessage();
        });
    });

    aiSendBtn.addEventListener('click', handleUserMessage);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    async function handleUserMessage() {
        const query = aiInput.value.trim();
        if (!query) return;

        appendMessage(query, 'user');
        aiInput.value = '';
        aiMessages.scrollTop = aiMessages.scrollHeight;

        const typingId = appendTypingIndicator();
        aiMessages.scrollTop = aiMessages.scrollHeight;

        try {
            const reply = await callGeminiWithRetry(query);
            removeTypingIndicator(typingId);
            appendMessage(reply, 'ai');
        } catch (err) {
            removeTypingIndicator(typingId);
            const fallbackReply = getSmartAssistantFallback(query);
            appendMessage(fallbackReply, 'ai');
        }
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function appendMessage(text, sender) {
        const isUser = sender === 'user';
        const div = document.createElement('div');
        div.className = `flex gap-3 ${isUser ? 'justify-end' : ''}`;
        
        if (isUser) {
            div.innerHTML = `
                <div class="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-[80%] text-sm leading-relaxed">${escapeHtml(text)}</div>
                <div class="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">You</div>
            `;
        } else {
            div.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">AI</div>
                <div class="bg-slate-200 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-[80%] text-slate-700 dark:text-slate-200 leading-relaxed">${formatAiResponse(text)}</div>
            `;
        }
        aiMessages.appendChild(div);
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = `flex gap-3`;
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">AI</div>
            <div class="bg-slate-200 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none text-slate-500 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
        `;
        aiMessages.appendChild(div);
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function formatAiResponse(text) {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    async function callGeminiWithRetry(userQuery, retries = 3, delay = 1000) {
        const systemPrompt = `You are an expert AI assistant representing Ujjwal Sharma on his personal portfolio website.
Here is Ujjwal's verified profile data:
- Name: Ujjwal Sharma
- Education: Currently pursuing B.Tech in CSE (AIML) at KIET Deemed to be University. Completed 10th and 12th from Gayatri Public School, Agra with 88% in both.
- Hometown: Agra, Uttar Pradesh.
- Hobbies: Playing cricket, listening to songs/music.
- Career Goal: To be a skilled engineer, gain deep knowledge, make the most of opportunities, and explore cutting-edge technology with keen interest in AIML and software development.
- Contact Email: ujjwal.sharma.aiml@kiet.edu

Answer questions accurately, professionally, and warmly in first-person or representative tone based strictly on this information. Keep responses concise and engaging.`;

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                const candidate = result.candidates?.[0];
                if (candidate && candidate.content?.parts?.[0]?.text) {
                    return candidate.content.parts[0].text;
                }
            } catch (e) {
                if (i === retries - 1) throw e;
                await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
            }
        }
        throw new Error("Failed to fetch from Gemini API");
    }

    function getSmartAssistantFallback(query) {
        const q = query.toLowerCase();
        if (q.includes('education') || q.includes('college') || q.includes('kiet') || q.includes('study')) {
            return "Ujjwal is currently pursuing his B.Tech in CSE (AIML) at KIET Deemed to be University. Prior to that, he completed his 10th and 12th from Gayatri Public School, Agra, securing an impressive 88% in both!";
        } else if (q.includes('hobb') || q.includes('cricket') || q.includes('song') || q.includes('music')) {
            return "Ujjwal's favorite hobbies are playing cricket and listening to music to stay energized and focused.";
        } else if (q.includes('goal') || q.includes('future') || q.includes('career') || q.includes('aim')) {
            return "Ujjwal's career goal is to become a highly skilled engineer, gain deep technical knowledge, seize every opportunity to learn, and explore cutting-edge technologies like Artificial Intelligence and Machine Learning.";
        } else if (q.includes('agra') || q.includes('hometown')) {
            return "Ujjwal belongs to Agra, Uttar Pradesh, where he spent his formative schooling years.";
        } else if (q.includes('skill') || q.includes('tech') || q.includes('aiml') || q.includes('python')) {
            return "Ujjwal specializes in Python, C++, Java, Machine Learning algorithms, Data Structures & Algorithms, and Web Development.";
        } else {
            return `That's a great question about Ujjwal! He is a dedicated B.Tech CSE (AIML) student at KIET from Agra, passionate about AI, cricket, and continuous learning. Feel free to use the contact form to reach out to him directly at ujjwal.sharma.aiml@kiet.edu!`;
        }
    }
});