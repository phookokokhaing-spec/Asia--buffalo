               
// ===== PAYMENT.JS - FIREBASE VERSION (FIXED) =====
// ===== TELEGRAM BOT NOTIFICATION WITH SCREENSHOT =====
const BOT_TOKEN = '8322040159:AAH1R7SP29V3jWV4-sR6qjoYKkJgkmejA6A';
const ADMIN_CHAT_ID = '7728143658';

// Telegram ကိုပို့မယ် (ပုံပါ/မပါ)
async function sendToTelegram(message, imageBase64 = null) {
    try {
        if (imageBase64) {
            // Base64 ကို Blob အဖြစ်ပြောင်းမယ်
            const byteCharacters = atob(imageBase64.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });

            // FormData ဆောက်မယ်
            const formData = new FormData();
            formData.append('chat_id', ADMIN_CHAT_ID);
            formData.append('photo', blob, 'screenshot.jpg');
            formData.append('caption', message);
            formData.append('parse_mode', 'HTML');
            formData.append('disable_notification', 'false');

            // sendPhoto API ကိုခေါ်မယ်
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            console.log('Telegram photo send result:', result);
        } else {
            // ပုံမပါရင် sendMessage သုံးမယ်
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: ADMIN_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML',
                    disable_notification: false
                })
            });
            const result = await response.json();
            console.log('Telegram message send result:', result);
        }
    } catch (error) {
        console.error('Telegram error:', error);
    }
}

// ===== TELEGRAM ADMIN AUDIO NOTIFICATION =====
async function sendTelegramAdminSound() {
    try {
        // Admin sound ရဲ့ URL
        const audioUrl = window.location.origin + '/sounds/admin.mp3';
        
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                audio: audioUrl,
                caption: '💰 ငွေသွင်းတောင်းဆိုမှုအသစ်',
                parse_mode: 'HTML',
                disable_notification: false
            })
        });
        
        const result = await response.json();
        console.log('Telegram admin audio result:', result);
    } catch (error) {
        console.error('Telegram audio error:', error);
    }
}
// ငွေသွင်းတဲ့အခါ ခေါ်မယ့် Function (ပုံပါ)
async function notifyNewDeposit(deposit) {
    const message =
        ` <b>ငွေသွင်းတောင်းဆိုမှုအသစ်</b>\n\n` +
        ` အသုံးပြုသူ: ${deposit.username}\n` +
        ` User ID: ${deposit.userId}\n` +
        ` ပမာဏ: ${deposit.amount.toLocaleString()} ကျပ်\n` +
        ` ဘဏ်: ${deposit.method}\n` +
        ` ဖုန်း: ${deposit.senderPhone}\n` +
        ` ငွေလွှဲ ID: ${deposit.transferId}\n` +
        `⏰ အချိန်: ${new Date().toLocaleString('my-MM')}`;

    // screenshot ပါပို့မယ်
    await sendToTelegram(message, deposit.screenshot);
  await sendTelegramAdminSound();
 if (window.SoundManager) {
        SoundManager.admin();  // admin.mp3 ဖွင့်မယ်
        SoundManager.noti();   // noti.mp3 ဖွင့်မယ်
    }
}

// ငွေထုတ်တဲ့အခါ ခေါ်မယ့် Function (ပုံမပါ)
async function notifyNewWithdrawal(withdrawal) {
    const message =
        ` <b>ငွေထုတ်တောင်းဆိုမှုအသစ်</b>\n\n` +
        ` အသုံးပြုသူ: ${withdrawal.username}\n` +
        ` User ID: ${withdrawal.userId}\n` +
        ` ထုတ်ယူငွေ: ${withdrawal.amount.toLocaleString()} ကျပ်\n` +
        ` လက်ခံရရှိမည့်ငွေ: ${withdrawal.netAmount.toLocaleString()} ကျပ်\n` +
        ` ဘဏ်: ${withdrawal.bank}\n` +
        ` အကောင့်: ${withdrawal.accountNumber}\n` +
        ` အကောင့်အမည်: ${withdrawal.accountName}\n` +
        `⏰ အချိန်: ${new Date().toLocaleString('my-MM')}`;

    // ပုံမပါဘူး
    await sendToTelegram(message);
  await sendTelegramAdminSound();
 if (window.SoundManager) {
        SoundManager.admin();  // admin.mp3 ဖွင့်မယ်
        SoundManager.noti();   // noti.mp3 ဖွင့်မယ်
    }
}


let paymentState = {
    selectedAmount: 3000,
    selectedMethod: 'kbzpay',
    selectedFile: null,
    customAmount: '',
    senderPhone: '',
    transferId: '',
    depositRequests: [],
    withdrawRequests: [],
    bankAccounts: []
};

let unsubscribeBankAccounts = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log(' Payment system initializing...');

    initEventListeners();
    calculateWithdrawFee();

    // Listen to auth state
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log(' User logged in:', user.uid);
            setupBankAccountsListener();
            await loadUserRequests();
        } else {
            console.log(' User logged out, clearing data');
            if (unsubscribeBankAccounts) {
                unsubscribeBankAccounts();
                unsubscribeBankAccounts = null;
            }
            paymentState.bankAccounts = [];
            paymentState.depositRequests = [];
            paymentState.withdrawRequests = [];
            renderPaymentMethods();
        }
    });
});

function setupBankAccountsListener() {
    if (!firebase.firestore) {
        console.warn('Firestore not available, using fallback');
        useFallbackAccounts();
        return;
    }

    const db = firebase.firestore();
    const accountsRef = db.collection('bankAccounts').where('status', '==', 'active');

    if (unsubscribeBankAccounts) {
        unsubscribeBankAccounts();
    }

    unsubscribeBankAccounts = accountsRef.onSnapshot((snapshot) => {
        console.log(' Bank accounts updated, count:', snapshot.size);

        if (snapshot.empty) {
            useFallbackAccounts();
            return;
        }

        const accounts = [];
        snapshot.forEach((doc) => {
            accounts.push({ id: doc.id, ...doc.data() });
        });

        paymentState.bankAccounts = accounts;
        renderPaymentMethods();
        updateBankInfo(paymentState.selectedMethod);

    }, (error) => {
        console.error('Listener error:', error);
        useFallbackAccounts();
    });
}


function useFallbackAccounts() {
    console.log(' Using fallback bank accounts');
    paymentState.bankAccounts = [
        {
            id: 'kbz_default',
            bankName: 'KBZ Pay',
            accountHolder: 'ဒေါ်အေးအေး',
            accountNumber: '09-123456789',
            refId: 'KBZ12345',
            status: 'active',
            type: 'kbzpay'
        },
        {
            id: 'wave_default',
            bankName: 'Wave Pay',
            accountHolder: 'ဦးမောင်မောင်',
            accountNumber: '09-987654321',
            refId: 'WAVE67890',
            status: 'active',
            type: 'wavepay'
        },
        {
            id: 'cb_default',
            bankName: 'CB Pay',
            accountHolder: 'ကိုဇော်ဇော်',
            accountNumber: '09-555555555',
            refId: 'CB54321',
            status: 'active',
            type: 'cbpay'
        }
    ];
    renderPaymentMethods();
    updateBankInfo(paymentState.selectedMethod);
}

function getBankAccountsObject() {
    if (paymentState.bankAccounts.length === 0) {
        useFallbackAccounts();
    }
    const accounts = {};
    paymentState.bankAccounts.forEach(account => {
        const key = account.type || account.bankName.toLowerCase().replace(/\s+/g, '');
        accounts[key] = {
            name: account.accountHolder,
            phone: account.accountNumber,
            refId: account.refId || account.id,
            type: account.bankName
        };
    });
    return accounts;
}

function renderPaymentMethods() {
    const methodGrid = document.querySelector('.method-grid');
    if (!methodGrid) {
        console.error('❌ .method-grid not found');
        return;
    }
                                                                                                                                                              const accounts = getBankAccountsObject();
    let html = '';
    let firstMethod = '';

    Object.keys(accounts).forEach((key, index) => {
        const account = accounts[key];
        if (index === 0) firstMethod = key;
        html += `
            <div class="method-btn ${index === 0 ? 'active' : ''}" onclick="window.selectPaymentMethod(this, '${key}')">
                <i class="fas ${getBankIcon(account.type)}"></i>
                <span>${account.type || key}</span>
            </div>                                                                                                                                                `;
    });

    methodGrid.innerHTML = html || '<div style="color:white; padding:20px;">ဘဏ်အကောင့်များ မရှိသေးပါ။</div>';

    if (firstMethod) {
        paymentState.selectedMethod = firstMethod;
    }
}
                                                                                                                                                          function updateBankInfo(method) {
    const accounts = getBankAccountsObject();
    const account = accounts[method] || Object.values(accounts)[0];
    if (!account) return;

    const els = {
        bankName: document.getElementById('bankName'),
        accountName: document.getElementById('accountName'),
        accountPhone: document.getElementById('accountPhone'),
        accountRef: document.getElementById('accountRef')
    };

    if (els.bankName) els.bankName.textContent = account.type || 'KBZ Pay';
    if (els.accountName) els.accountName.textContent = account.name || '';
    if (els.accountPhone) els.accountPhone.textContent = account.phone || '';
    if (els.accountRef) els.accountRef.textContent = account.refId || 'N/A';
}

async function loadUserRequests() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        const db = firebase.firestore();

        const depositsSnap = await db.collection('deposits')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        paymentState.depositRequests = [];
        depositsSnap.forEach(doc => paymentState.depositRequests.push({ id: doc.id, ...doc.data() }));

        const withdrawsSnap = await db.collection('withdrawals')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        paymentState.withdrawRequests = [];
        withdrawsSnap.forEach(doc => paymentState.withdrawRequests.push({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// ===== AMOUNT FUNCTIONS =====
window.selectAmount = function(element, amount) {
    document.querySelectorAll('.amount-chip').forEach(chip => chip.classList.remove('active'));
    element.classList.add('active');
    paymentState.selectedAmount = amount;
    paymentState.customAmount = '';
    const customInput = document.getElementById('customAmount');
    if (customInput) customInput.value = '';
};

window.useCustomAmount = function() {
    const customInput = document.getElementById('customAmount');
    const amount = parseInt(customInput.value);
     console.log('Custom amount entered:', amount);
    if (!amount || amount < 3000) {
        showNotification('အနည်းဆုံး ၃,၀၀၀ ကျပ်ထည့်ပါ။', 'error');
        return;
    }
    if (amount > 1000000) {
        showNotification('တစ်ကြိမ်လျှင် အများဆုံး ၁၀၀၀၀၀၀ ကျပ်သာ ငွေသွင်းနိုင်ပါသည်။', 'error');
        return;
    }

    document.querySelectorAll('.amount-chip').forEach(chip => chip.classList.remove('active'));
    paymentState.selectedAmount = amount;
    paymentState.customAmount = amount;
    showNotification(amount.toLocaleString() + ' ကျပ် ကိုရွေးချယ်ပြီးပါပြီ။', 'success');
};

// ===== PAYMENT METHOD =====
window.selectPaymentMethod = function(element, method) {
    document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    paymentState.selectedMethod = method;
    updateBankInfo(method);
};


// ===== FILE HANDLING =====
window.triggerFileUpload = () => document.getElementById('fileInput').click();

window.handleFileSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showNotification('ဖိုင်အရွယ်အစား 5MB ထက်မကြီးရပါ။', 'error');
        return;
    }
    if (!file.type.startsWith('image/')) {                                                                                      showNotification('ပုံဖိုင်သာ တင်နိုင်ပါသည်။', 'error');
        return;                                                                                                             }

    paymentState.selectedFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
};

window.removeImage = function() {
    paymentState.selectedFile = null;
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInput').value = '';
};

// ===== DEPOSIT =====
window.submitDeposit = async function() {
    // Firebase Auth user ကိုတိုက်ရိုက်ယူပါ
    const user = firebase.auth().currentUser;
    if (!user) {
        showNotification('ကျေးဇူးပြု၍ Login ဝင်ပါ။', 'error');
        return;
    }

    // user.uid ရှိရဲ့လားစစ်ပါ (အမြဲရှိသင့်တယ်)
    console.log('Deposit user UID:', user.uid);

    const phone = document.getElementById('senderPhone').value.trim();
    const txId = document.getElementById('transferId').value.trim();

    // Validation
    if (!paymentState.selectedAmount) {
        showNotification('ငွေပမာဏ ရွေးချယ်ပါ။', 'error');
        return;
    }
    if (!phone || phone.length < 9) {
        showNotification('ဖုန်းနံပါတ် မှန်ကန်စွာထည့်ပါ။', 'error');
        return;
    }
    if (!txId || txId.length !== 5) {
        showNotification('ငွေလွှဲ ID သည် ၅လုံး ဖြစ်ရပါမည်။', 'error');
        return;
    }
    if (!paymentState.selectedFile) {
        showNotification('Screenshot တင်ပေးပါ။', 'error');
        return;
    }

    try {
        const screenshotBase64 = await fileToBase64(paymentState.selectedFile);
        const db = firebase.firestore();
        const accounts = getBankAccountsObject();

        
       
        const username = user.displayName || user.email?.split('@')[0] || 'User';

        const deposit = {
            userId: user.uid,  // Firebase Auth UID (သေချာတယ်)
            username: username,
            amount: paymentState.selectedAmount,
            method: paymentState.selectedMethod,
            bankInfo: accounts[paymentState.selectedMethod] || {},
            senderPhone: phone,
            transferId: txId,
            screenshot: screenshotBase64,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        console.log('Deposit data:', deposit);
        await db.collection('deposits').add(deposit);
       showNotification('ငွေသွင်းတောင်းဆိုမှု လက်ခံရရှိပါသည်။ Admin များစစ်ဆေးနေပါသည်။', 'info');
        // Telegram ကိုပို့မယ်
        await notifyNewDeposit(deposit);
       
        setTimeout(() => {
        showSuccessModal(
            'ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။',
            'စီစစ်ပြီးပါက ငွေဖြည့်သွင်းပေးပါမည်။',
            [
                'ငွေပမာဏ: ' + formatNumber(paymentState.selectedAmount) + ' ကျပ်',
                'ငွေလွှဲ ID: ' + txId,
                'အခြေအနေ: စောင့်ဆိုင်းဆဲ'
            ]
        );
    }, 2000);

    // Form နဲ့ Modal ကိုရှင်း
    resetDepositForm();
    setTimeout(() => closeModal('depositModal'), 2500);

} catch (error) {
    console.error('Deposit error:', error);
    showNotification('မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။', 'error');
}
};

// ===== WITHDRAW =====
window.submitWithdraw = async function() {
    const user = firebase.auth().currentUser;
    if (!user) {
        showNotification('ကျေးဇူးပြု၍ Login ဝင်ပါ။', 'error');
        return;
    }

    const amount = parseInt(document.getElementById('withdrawAmount').value);
    const bank = document.getElementById('withdrawBank').value;
    const accNum = document.getElementById('withdrawAccount').value.trim();
    const accName = document.getElementById('withdrawName').value.trim();

    if (!amount || amount < 5000 || amount > 500000) {
        showNotification('ငွေပမာဏ မှန်ကန်စွာထည့်ပါ။ (၅၀၀၀-၅၀၀၀၀၀)', 'error');
        return;
    }
    if (!accNum || !accName) {
        showNotification('အကောင့်အချက်အလက် အပြည့်အစုံထည့်ပါ။', 'error');
        return;
    }

    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(user.uid);
        const userSnap = await userRef.get();
        const balance = userSnap.exists ? userSnap.data().balance || 0 : 0;

        if (balance < amount) {
            showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
            return;
        }

        const fee = Math.floor(amount * 0.05);
        const net = amount - fee;

        const withdraw = {
            userId: user.uid,
            username: user.displayName || user.email?.split('@')[0] || 'User',
            amount,                                                                                                                 fee,
            netAmount: net,                                                                                                         bank,
            accountNumber: accNum,
            accountName: accName,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        await db.collection('withdrawals').add(withdraw);
        await userRef.update({ balance: balance - amount });
       // Telegram ကိုပို့မယ်
         await notifyNewWithdrawal(withdraw);

        if (window.gameState) window.gameState.balance = balance - amount;
        document.getElementById('balanceAmount').textContent = formatNumber(balance - amount);

        showSuccessModal(
            'ငွေထုတ်တောင်းဆိုမှု အောင်မြင်ပါသည်။',
            'စီစစ်ပြီးပါက ငွေလွှဲပေးပါမည်။',
            [
                'ထုတ်ယူငွေ: ' + formatNumber(amount) + ' ကျပ်',
                'ဝန်ဆောင်ခ: ' + formatNumber(fee) + ' ကျပ်',
                'လက်ခံရရှိမည့်ငွေ: ' + formatNumber(net) + ' ကျပ်'
            ]
        );

        document.getElementById('withdrawAmount').value = '';
        document.getElementById('withdrawAccount').value = '';
        document.getElementById('withdrawName').value = '';
        calculateWithdrawFee();
        setTimeout(() => closeModal('withdrawModal'), 2000);

    } catch (error) {
        console.error('Withdraw error:', error);
        showNotification('မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။', 'error');
    }
};

// ===== WITHDRAW FEE =====
function calculateWithdrawFee() {
    const input = document.getElementById('withdrawAmount');
    const feeEl = document.getElementById('feeAmount');
    const netEl = document.getElementById('netAmount');
    if (!input || !feeEl || !netEl) return;

    let amount = parseInt(input.value);
    if (isNaN(amount) || amount < 5000) {
        feeEl.textContent = '0 ကျပ်';
        netEl.textContent = '0 ကျပ်';
        return;
    }
    if (amount > 500000) {
        amount = 500000;
        input.value = 500000;
    }
    const fee = Math.floor(amount * 0.05);
    feeEl.textContent = formatNumber(fee) + ' ကျပ်';
    netEl.textContent = formatNumber(amount - fee) + ' ကျပ်';
}

// ===== UTILITY =====
function getBankIcon(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('kbz')) return 'fa-mobile-alt';
    if (n.includes('wave')) return 'fa-wave-square';
    if (n.includes('cb')) return 'fa-university';
    return 'fa-university';
}

function resetDepositForm() {

    paymentState.selectedMethod = 'kbzpay';
    paymentState.selectedFile = null;
    paymentState.customAmount = '';

    document.querySelectorAll('.amount-chip').forEach((c, i) => i === 0 ? c.classList.add('active') : c.classList.remove('active'));
    document.querySelectorAll('.method-btn').forEach((b, i) => i === 0 ? b.classList.add('active') : b.classList.remove('active'));

    document.getElementById('customAmount').value = '';
    document.getElementById('senderPhone').value = '';
    document.getElementById('transferId').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    updateBankInfo('kbzpay');
}

function initEventListeners() {
    document.getElementById('withdrawAmount')?.addEventListener('input', calculateWithdrawFee);
}

function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showNotification(msg, type = 'info') {
    const n = document.getElementById('notification');
    if (!n) return;
    n.querySelector('#notificationMessage').textContent = msg;
    n.style.background = type === 'success' ? '#00c853' : type === 'error' ? '#ff5252' : '#2196f3';
    n.style.display = 'flex';
    setTimeout(() => n.style.display = 'none', 3000);
}

function showSuccessModal(title, msg, details) {
    const m = document.getElementById('successModal');
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = msg;
    const d = document.getElementById('modalDetails');
    d.innerHTML = details.map(d => `<div style="color:white; padding:8px 0;">${d}</div>`).join('');
    m.style.display = 'flex';
}

function playClickSound() {
    const s = document.getElementById('allbuttonSound');
    if (s) s.play().catch(() => {});
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.readAsDataURL(file);
        r.onload = () => resolve(r.result);
        r.onerror = reject;
    });
}

// ========== MODAL CONTROLS ==========

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        playClickSound();
    }
}

function openDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) {
        modal.style.display = 'flex';
        resetDepositForm();
        playClickSound();
    }
}

function openWithdrawModal() {
    const modal = document.getElementById('withdrawModal');
    if (modal) {
        modal.style.display = 'flex';

        const displayBalance = document.getElementById('displayBalance');
        if (displayBalance && window.currentUser) {
            displayBalance.textContent = formatNumber(window.currentUser.balance) + ' ကျပ်';
        }

        calculateWithdrawFee();
        playClickSound();
    }
}

function toggleMainMenu() {
    const modal = document.getElementById('mainMenuModal');
    if (modal) {
        modal.style.display = 'flex';
        playClickSound();
    }
}

function closeMainMenu() {
    const modal = document.getElementById('mainMenuModal');
    if (modal) {
        modal.style.display = 'none';
        playClickSound();
    }
}

function openSettings() {
    closeMainMenu();
    showNotification('Settings menu - Coming soon!', 'info');
}

function openHistory() {
    closeMainMenu();
    showNotification('Game history - Coming soon!', 'info');
}


// ===== EVENT LISTENERS =====
function initEventListeners() {
    document.getElementById('withdrawAmount')?.addEventListener('input', calculateWithdrawFee);
}
// ========== EXPORT GLOBALS ==========
window.selectAmount = selectAmount;
window.useCustomAmount = useCustomAmount;
window.selectPaymentMethod = selectPaymentMethod;
window.triggerFileUpload = triggerFileUpload;
window.handleFileSelect = handleFileSelect;
window.removeImage = removeImage;
window.submitDeposit = submitDeposit;
window.submitWithdraw = submitWithdraw;
window.closeModal = closeModal;
window.toggleMainMenu = toggleMainMenu;
window.closeMainMenu = closeMainMenu;
window.openSettings = openSettings;
window.openHistory = openHistory;
window.openDepositModal = openDepositModal;
window.openWithdrawModal = openWithdrawModal;
window.formatNumber = formatNumber;
window.showNotification = showNotification;


// ===== EMERGENCY FIX FOR bankAccounts ERROR =====

// 1. Override getBankAccountsObject with safe version
window.getBankAccountsObject = function() {
    try {
        // If no bank accounts, return fallback
        if (!paymentState || !paymentState.bankAccounts || paymentState.bankAccounts.length === 0) {
            return getFallbackAccounts();
        }
        
        const accounts = {};
        
        paymentState.bankAccounts.forEach((account, index) => {
            if (!account) return;
            
            // Safely get type - if not exist, create from bankName or index
            let type = 'unknown';
            if (account.type && typeof account.type === 'string') {
                type = account.type;
            } else if (account.bankName && typeof account.bankName === 'string') {
                type = account.bankName;
            } else {
                type = 'bank_' + index;
            }
            
           const key = type.toLowerCase().replace(/\s+/g, '');

accounts[key] = {
    name: account.holder || 'N/A',              // accountHolder -> holder
    phone: account.number || 'N/A',              // accountNumber -> number
    refId: account.id || 'N/A',                  // refId မရှိ, id ကိုသုံး
    type: account.name || 'Bank'                  // bankName -> name
};
        });
        
        // If no accounts created, return fallback
        if (Object.keys(accounts).length === 0) {
            return getFallbackAccounts();
        }
        
        return accounts;
        
    } catch (error) {
        console.error('Error in getBankAccountsObject:', error);
        return getFallbackAccounts();
    }
};

// 2. Fallback accounts
function getFallbackAccounts() {
    return {
        'kbzpay': {
            name: 'ဒေါ်အေးအေး',
            phone: '09-123456789',
            refId: 'KBZ12345',
            type: 'KBZ Pay'
        },
        'wavepay': {
            name: 'ဦးမောင်မောင်',
            phone: '09-987654321',
            refId: 'WAVE67890',
            type: 'Wave Pay'
        },
        'cbpay': {
            name: 'ကိုဇော်ဇော်',
            phone: '09-555555555',
            refId: 'CB54321',
            type: 'CB Pay'
        }
    };
}

// 3. Override renderPaymentMethods
window.renderPaymentMethods = function() {
    try {
        const methodGrid = document.querySelector('.method-grid');
        if (!methodGrid) {
            console.warn('Method grid not found');
            return;
        }
        
        const accounts = window.getBankAccountsObject();
        let html = '';
        let firstMethod = '';
        
        Object.keys(accounts).forEach((key, index) => {
            if (index === 0) firstMethod = key;
            const account = accounts[key];
            
            html += `
                <div class="method-btn ${index === 0 ? 'active' : ''}" 
                     onclick="window.selectPaymentMethod(this, '${key}')">
                    <i class="fas ${getBankIcon(account.type)}"></i>
                    <span>${account.type || key}</span>
                </div>
            `;
        });
        
        methodGrid.innerHTML = html || '<div style="color:white; padding:20px;">ဘဏ်အကောင့်များ မရှိသေးပါ။</div>';
        
        if (firstMethod) {
            paymentState.selectedMethod = firstMethod;
            updateBankInfo(firstMethod);
        }
        
    } catch (error) {
        console.error('Error in renderPaymentMethods:', error);
    }
};

// 4. Override selectPaymentMethod to be safe
const originalSelectMethod = window.selectPaymentMethod;
window.selectPaymentMethod = function(element, method) {
    try {
        document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
        if (element) element.classList.add('active');
        
        paymentState.selectedMethod = method || 'kbzpay';
        updateBankInfo(method || 'kbzpay');
        
    } catch (error) {
        console.error('Error in selectPaymentMethod:', error);
    }
};

// 5. Override updateBankInfo
const originalUpdateBankInfo = window.updateBankInfo;
window.updateBankInfo = function(method) {
    try {
        const accounts = window.getBankAccountsObject();
        const account = accounts[method] || accounts['kbzpay'] || Object.values(accounts)[0];
        
        if (!account) return;
        
        const els = {
            bankName: document.getElementById('bankName'),
            accountName: document.getElementById('accountName'),
            accountPhone: document.getElementById('accountPhone'),
            accountRef: document.getElementById('accountRef')
        };
        
        if (els.bankName) els.bankName.textContent = account.type || 'KBZ Pay';
        if (els.accountName) els.accountName.textContent = account.name || '';
        if (els.accountPhone) els.accountPhone.textContent = account.phone || '';
        if (els.accountRef) els.accountRef.textContent = account.refId || 'N/A';
        
    } catch (error) {
        console.error('Error in updateBankInfo:', error);
    }
};

// 6. Override setupBankAccountsListener to handle missing fields
const originalSetup = window.setupBankAccountsListener;
window.setupBankAccountsListener = function() {
    if (!firebase.firestore) {
        useFallbackAccounts();
        return;
    }

    const db = firebase.firestore();
    const accountsRef = db.collection('bankAccounts').where('status', '==', 'active');

    if (unsubscribeBankAccounts) {
        unsubscribeBankAccounts();
    }

    unsubscribeBankAccounts = accountsRef.onSnapshot((snapshot) => {
        console.log('Bank accounts updated, count:', snapshot.size);

        if (snapshot.empty) {
            useFallbackAccounts();
            return;
        }

        const accounts = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Ensure type field exists
            if (!data.type && data.bankName) {
                data.type = data.bankName.toLowerCase().replace(/\s+/g, '');
            }
            accounts.push({ id: doc.id, ...data });
        });

        paymentState.bankAccounts = accounts;
        renderPaymentMethods();
        updateBankInfo(paymentState.selectedMethod);

    }, (error) => {
        console.error('Listener error:', error);
        useFallbackAccounts();
    });
};

// 7. Override useFallbackAccounts
window.useFallbackAccounts = function() {
    console.log('Using fallback bank accounts');
    
    paymentState.bankAccounts = [
        {
            id: 'kbz_default',
            bankName: 'KBZ Pay',
            accountHolder: 'ဒေါ်အေးအေး',
            accountNumber: '09-123456789',
            refId: 'KBZ12345',
            status: 'active',
            type: 'kbzpay'
        },
        {
            id: 'wave_default',
            bankName: 'Wave Pay',
            accountHolder: 'ဦးမောင်မောင်',
            accountNumber: '09-987654321',
            refId: 'WAVE67890',
            status: 'active',
            type: 'wavepay'
        },
        {
            id: 'cb_default',
            bankName: 'CB Pay',
            accountHolder: 'ကိုဇော်ဇော်',
            accountNumber: '09-555555555',
            refId: 'CB54321',
            status: 'active',
            type: 'cbpay'
        }
    ];
    
    renderPaymentMethods();
    updateBankInfo(paymentState.selectedMethod);
};

// 8. Run fix on load
setTimeout(() => {
    console.log('✅ Running payment.js emergency fix');
    if (typeof renderPaymentMethods === 'function') {
        renderPaymentMethods();
    }
}, 1000);

console.log('✅ Payment.js fixes applied');

// ===== COPY PHONE NUMBER FUNCTION =====
window.copyToClipboard = function(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // ဖုန်းနံပါတ်ကိုယူ
    const phoneNumber = element.textContent;
    
    // Copy ကူးမယ်
    navigator.clipboard.writeText(phoneNumber).then(() => {
        showNotification('📋 ဖုန်းနံပါတ် ကူးယူပြီးပါပြီ။', 'success');
    }).catch(() => {
        // Fallback နည်း
        const textarea = document.createElement('textarea');
        textarea.value = phoneNumber;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('📋 ဖုန်းနံပါတ် ကူးယူပြီးပါပြီ။', 'success');
    });
};
