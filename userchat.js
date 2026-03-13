// ============================================
// USER CHAT SYSTEM (အဆင့်မြှင့်ပြီး)
// ============================================

const userChatState = {
    isOpen: false,
    unreadCount: 0,
    userId: null,
    username: 'User',
    unsubscribe: null
};

// Initialize chat
function initUserChat() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        userChatState.userId = currentUser.id;
        userChatState.username = currentUser.username || currentUser.fullName || 'User';
    }
}

// Toggle chat modal (ဒါက မင်းရဲ့ toggleChatModal နဲ့ ချိတ်မယ်)
function toggleChatModal() {
    const modal = document.getElementById('userChatModal');
    if (!modal) return;
    
    if (userChatState.isOpen) {
        modal.style.display = 'none';
        userChatState.isOpen = false;
        if (userChatState.unsubscribe) {
            userChatState.unsubscribe();
            userChatState.unsubscribe = null;
        }
    } else {
        modal.style.display = 'flex';
        userChatState.isOpen = true;
        
        // Load messages and setup listener
        loadUserMessages();
        setupUserChatListener();
        
        // Mark messages as read
        markUserMessagesAsRead();
    }
}

// Close chat
function closeUserChat() {
    const modal = document.getElementById('userChatModal');
    if (modal) modal.style.display = 'none';
    userChatState.isOpen = false;
    if (userChatState.unsubscribe) {
        userChatState.unsubscribe();
        userChatState.unsubscribe = null;
    }
}

// Load messages
async function loadUserMessages() {
    const messagesArea = document.getElementById('userChatMessages');
    if (!messagesArea) return;
    
    if (!userChatState.userId) {
        messagesArea.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။</div>';
        return;
    }
    
    messagesArea.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">စာများဖော်ပြရန်...</div>';
    
    try {
        const messagesSnap = await db.collection('chatMessages')
            .where('userId', '==', userChatState.userId)
            .orderBy('timestamp', 'asc')
            .limit(50)
            .get();
        
        if (messagesSnap.empty) {
            messagesArea.innerHTML = `
                <div style="text-align:center; padding:40px; color:#888;">
                    <i class="fas fa-comment-dots" style="font-size: 48px; margin-bottom: 15px; opacity:0.3;"></i>
                    <p>မင်္ဂလာပါ။ ဘယ်လိုကူညီပေးရမလဲ။</p>
                    <p style="font-size:12px; margin-top:10px;">စာရိုက်ပြီး ပို့လိုက်ပါ။</p>
                </div>
            `;
            return;
        }
        
        const messages = messagesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        renderUserMessages(messages);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
    } catch (error) {
        console.error('Load messages error:', error);
        messagesArea.innerHTML = '<div style="text-align:center; padding:40px; color:#ff5252;">အမှားရှိနေသည်။</div>';
    }
}

// Render messages
function renderUserMessages(messages) {
    const messagesArea = document.getElementById('userChatMessages');
    if (!messagesArea) return;
    
    let html = '';
    messages.forEach(msg => {
        const isUser = msg.sender === 'user';
        const time = msg.timestamp?.toDate ? formatTime(msg.timestamp.toDate()) : '';
        
        html += `
            <div class="user-chat-message ${isUser ? 'user' : 'admin'}">
                <div class="user-message-bubble">
                    ${escapeHtml(msg.text || '')}
                </div>
                <div class="user-message-time">${time}</div>
            </div>
        `;
    });
    
    messagesArea.innerHTML = html;
}

// Setup real-time listener
function setupUserChatListener() {
    if (!userChatState.userId) return;
    
    if (userChatState.unsubscribe) {
        userChatState.unsubscribe();
    }
    
    userChatState.unsubscribe = db.collection('chatMessages')
        .where('userId', '==', userChatState.userId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    if (userChatState.isOpen) {
                        loadUserMessages();
                        markUserMessagesAsRead();
                    } else {
                        const msg = change.doc.data();
                        if (msg.sender === 'admin') {
                            userChatState.unreadCount++;
                            updateChatBadge(userChatState.unreadCount);
                            playNotificationSound();
                        }
                    }
                }
            });
        }, error => {
            console.error('Listener error:', error);
        });
}

// Send message
async function sendUserMessage() {
    const input = document.getElementById('userChatInput');
    const text = input.value.trim();
    if (!text || !userChatState.userId) return;
    
    const message = {
        userId: userChatState.userId,
        sender: 'user',
        senderName: userChatState.username,
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
    };
    
    input.value = '';
    
    // Optimistic update
    const tempId = 'temp-' + Date.now();
    const tempMessage = { ...message, id: tempId, timestamp: new Date() };
    addUserMessageToUI(tempMessage);
    
    try {
        await db.collection('chatMessages').add(message);
        await db.collection('users').doc(userChatState.userId).update({
            lastMessage: text,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});
    } catch (error) {
        console.error('Send error:', error);
        document.getElementById(`user-msg-${tempId}`)?.remove();
        alert('စာပို့ရာတွင် အမှားရှိနေသည်။');
    }
}

// Add message to UI immediately
function addUserMessageToUI(message) {
    const messagesArea = document.getElementById('userChatMessages');
    if (!messagesArea) return;
    
    // Remove empty state
    if (messagesArea.children.length === 1 && messagesArea.children[0].style.textAlign === 'center') {
        messagesArea.innerHTML = '';
    }
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'user-chat-message user';
    msgDiv.id = `user-msg-${message.id}`;
    
    const time = message.timestamp?.toDate ? formatTime(message.timestamp.toDate()) : formatTime(new Date());
    
    msgDiv.innerHTML = `
        <div class="user-message-bubble">${escapeHtml(message.text)}</div>
        <div class="user-message-time">${time}</div>
    `;
    
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Mark messages as read
async function markUserMessagesAsRead() {
    if (!userChatState.userId) return;
    
    try {
        const unreadSnap = await db.collection('chatMessages')
            .where('userId', '==', userChatState.userId)
            .where('sender', '==', 'admin')
            .where('read', '==', false)
            .get();
        
        const batch = db.batch();
        unreadSnap.docs.forEach(doc => batch.update(doc.ref, { read: true }));
        await batch.commit();
        
        userChatState.unreadCount = 0;
        updateChatBadge(0);
    } catch (error) {
        console.error('Mark as read error:', error);
    }
}

// Update badge (မင်းရဲ့ ရှိပြီးသား chatBadge ကို update)
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

// Handle enter key
function handleUserChatKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendUserMessage();
    }
}

// Play notification sound
function playNotificationSound() {
    const sound = document.getElementById('notiSound');
    if (sound) sound.play().catch(() => {});
}

// Format time
function formatTime(date) {
    if (!date) return '';
    return date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0');
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initUserChat();
});

// Make functions global
window.toggleChatModal = toggleChatModal; // မင်းရဲ့ လက်ရှိ onclick နဲ့ ချိတ်မယ်
window.closeUserChat = closeUserChat;
window.sendUserMessage = sendUserMessage;
window.handleUserChatKeyPress = handleUserChatKeyPress;
