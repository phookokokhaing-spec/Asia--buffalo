// ============================================
// CHAT FUNCTIONS - FIREBASE REAL-TIME VERSION
// ============================================

let chatState = {
    isOpen: false,
    unreadCount: 0,
    messages: [],
    lastMessageTime: null,
    unsubscribe: null
};

// Toggle chat modal
function toggleChatModal() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
            chatState.isOpen = false;
            if (chatState.unsubscribe) {
                chatState.unsubscribe();
                chatState.unsubscribe = null;
            }
        } else {
            modal.style.display = 'flex';
            chatState.isOpen = true;
            markMessagesAsRead();
            setupChatListener();
        }
    }
}

// Close chat modal
function closeChat() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.style.display = 'none';
        chatState.isOpen = false;
        if (chatState.unsubscribe) {
            chatState.unsubscribe();
            chatState.unsubscribe = null;
        }
    }
}

// Setup Firebase real-time chat listener
function setupChatListener() {
    if (!firebase.firestore) {
        console.warn('Firebase not available, using mock chat');
        loadMockMessages();
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const db = firebase.firestore();
    
    // Unsubscribe from previous listener if any
    if (chatState.unsubscribe) {
        chatState.unsubscribe();
    }
    
    // Create chat room ID (user + admin)
    const chatRoomId = `user_${currentUser.id}`;
    
   chatState.unsubscribe = db.collection('chats')
    .doc(chatRoomId)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .limit(50)
    .onSnapshot((snapshot) => {
        console.log('🔥 Firebase snapshot received, size:', snapshot.size);
        console.log('🔥 Docs:', snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        
        snapshot.docChanges().forEach((change) => {
            console.log('📝 Change type:', change.type, change.doc.id, change.doc.data());
            
            if (change.type === 'added') {
                const message = change.doc.data();
                message.id = change.doc.id;
                addMessageToUI(message);
                    
                    // Update unread count if chat is closed
                    if (!chatState.isOpen && message.sender !== 'user') {
                        chatState.unreadCount++;
                        updateChatBadge(chatState.unreadCount);
                    }
                    
                    // Play notification sound for new messages
                    if (!chatState.isOpen && message.sender !== 'user') {
                        playNotificationSound();
                    }
                }
            });
            
            // Scroll to bottom
            scrollToBottom();
        }, (error) => {
            console.error('Chat listener error:', error);
            loadMockMessages();
        });
}

// Load mock messages (fallback)
function loadMockMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const mockMessages = [
        { sender: 'admin', text: 'မင်္ဂလာပါ ဘယ်လိုကူညီပေးရမလဲ', time: getFormattedTime() },
        { sender: 'user', text: 'ငွေသွင်းနည်းလေး ပြောပြပါဦး', time: getFormattedTime() },
        { sender: 'admin', text: 'ဒီမှာပါခင်ဗျာ။ Menu > Deposit ကိုနှိပ်ပြီး ငွေသွင်းလို့ရပါတယ်', time: getFormattedTime() }
    ];
    
    messagesContainer.innerHTML = '';
    mockMessages.forEach(msg => addMessageToUI(msg));
    scrollToBottom();
}

function addMessageToUI(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) {
        console.error('❌ Chat messages container not found!');
        return;
    }

    // Create a unique key from message content (to prevent duplicates)
    const messageKey = `${message.sender}_${message.text}_${message.timestamp?.seconds || Date.now()}`;
    
    // Check if message already exists by looking at the last message
    const lastMessage = messagesContainer.lastElementChild;
    if (lastMessage && lastMessage.dataset.key === messageKey) {
        console.log('⚠️ Duplicate message detected, skipping:', message.text);
        return;
    }

    const isAdmin = message.sender === 'admin';
    const time = message.time || formatTime(message.timestamp?.toDate?.() || new Date());

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isAdmin ? 'admin' : 'user'}`;
    messageDiv.dataset.key = messageKey; // Store key for duplicate detection
    
    messageDiv.innerHTML = `
        <div class="message-sender">${isAdmin ? 'Admin' : (message.username || 'You')}</div>
        <div class="message-text">${escapeHtml(message.text)}</div>
        <div class="message-time">${time}</div>
        ${message.status === 'pending' ? '<div class="message-status"><i class="fas fa-clock"></i></div>' : ''}
    `;

    messagesContainer.appendChild(messageDiv);
    console.log('✅ Message added to UI:', message.text);
    scrollToBottom();
}
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const message = {
        sender: 'user',
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: currentUser.id,
        username: currentUser.username,
        read: false
    };

    input.value = '';

    try {
        const db = firebase.firestore();
        const chatRoomId = `user_${currentUser.id}`;

        // 1. မူလ user chat subcollection ထဲထည့်
        await db.collection('chats').doc(chatRoomId).collection('messages').add(message);

        // 2. admin chat အတွက် chatMessages collection ထဲပါ ထည့်
        await db.collection('chatMessages').add(message);

        // 3. Update last message
        await db.collection('chats').doc(chatRoomId).set({
            lastMessage: text,
            lastMessageTime: new Date(),
            lastSender: 'user',
            userId: currentUser.id,
            username: currentUser.username
        }, { merge: true });

    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Simulate admin reply (for mock mode)
function simulateAdminReply() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const replies = [
        'ကျေးဇူးတင်ပါတယ်။ မကြာခင်ပြန်လည်ဖြေကြားပေးပါမယ်။',
        'ဟုတ်ကဲ့ ဘယ်လိုကူညီပေးရမလဲ',
        'ဒီကိစ္စကို စစ်ဆေးပေးနေပါတယ်။',
        'ကျေးဇူးပြုပြီး ခဏစောင့်ပေးပါ။'
    ];
    
    const message = {
        sender: 'admin',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: formatTime(new Date())
    };
    
    addMessageToUI(message);
    playNotificationSound();
    
    // Update unread badge if chat closed
    if (!chatState.isOpen) {
        updateChatBadge(1);
    }
}

// Play notification sound
function playNotificationSound() {
    const sound = document.getElementById('notiSound');
    if (sound) {
        sound.play().catch(() => {});
    }
}

// Scroll chat to bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
}

// Update chat badge
function updateChatBadge(count) {
    const badge = document.getElementById('chatBadge');
    if (!badge) return;
    
    if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count;
    } else {
        badge.style.display = 'none';
    }
}

// Mark messages as read
function markMessagesAsRead() {
    chatState.unreadCount = 0;
    updateChatBadge(0);
}

// Handle chat enter key
function handleChatEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

// Get formatted time
function formatTime(date) {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getFormattedTime() {
    return formatTime(new Date());
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat
function initChat() {
    // Check for unread messages periodically (only if Firebase not available)
    if (!firebase.firestore) {
        setInterval(() => {
            if (!chatState.isOpen && Math.random() > 0.7) {
                updateChatBadge(chatState.unreadCount + 1);
            }
        }, 15000);
    }
    
    // Load chat history if modal is open on page load
    if (document.getElementById('chatModal')?.style.display === 'flex') {
        setupChatListener();
    }
}

// ===== ADD THESE STYLES TO YOUR CSS =====
const chatStyles = `
    .chat-message {
        margin-bottom: 15px;
        padding: 10px 15px;
        border-radius: 10px;
        max-width: 80%;
        position: relative;
        animation: fadeIn 0.3s;
    }
    
    .chat-message.user {
        background: linear-gradient(145deg, #2196f3, #1976d2);
        align-self: flex-end;
        margin-left: auto;
        color: white;
    }
    
    .chat-message.admin {
        background: linear-gradient(145deg, #424242, #212121);
        align-self: flex-start;
        color: white;
    }
    
    .message-sender {
        font-size: 12px;
        opacity: 0.7;
        margin-bottom: 5px;
    }
    
    .message-text {
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
    }
    
    .message-time {
        font-size: 10px;
        opacity: 0.5;
        text-align: right;
        margin-top: 5px;
    }
    
    .message-status {
        position: absolute;
        bottom: 2px;
        right: 5px;
        font-size: 10px;
        opacity: 0.5;
    }
    
    .chat-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ff5252;
        color: white;
        font-size: 10px;
        font-weight: bold;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = chatStyles;
document.head.appendChild(styleSheet);

// Call init on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatModal')) {
        initChat();
    }
});

// Make functions globally available
window.toggleChatModal = toggleChatModal;
window.closeChat = closeChat;
window.sendChatMessage = sendChatMessage;
window.handleChatEnter = handleChatEnter;

console.log('✅ Real-time Chat System loaded');
