// ============================================
// PAYMENT.JS - CLEAN VERSION WITH SOUNDS
// ============================================

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        BOT_TOKEN: '8322040159:AAH1R7SP29V3jWV4-sR6qjoYKkJgkmejA6A',
        ADMIN_CHAT_ID: '7728143658',
        MIN_DEPOSIT: 3000,
        MAX_DEPOSIT: 1000000,
        MIN_WITHDRAW: 5000,
        MAX_WITHDRAW: 500000,
        WITHDRAW_FEE: 0.05,
       LOSS_POOL_PERCENT: 0.2,
        SOUND_ENABLED: true
    };

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        selectedAmount: CONFIG.MIN_DEPOSIT,
        selectedMethod: 'kbzpay',
        selectedFile: null,
        senderPhone: '',
        transferId: '',
        bankAccounts: [],
        depositRequests: [],
        withdrawRequests: [],
        transactions: [
                    { id: 'TX-001', type: 'deposit', amount: 50000, method: 'KBZ Pay', status: 'completed', time: '07:15', date: 'Today' },
                    { id: 'TX-002', type: 'withdraw', amount: 25000, method: 'Wave', status: 'pending', time: '06:45', date: 'Today' },
                    { id: 'TX-003', type: 'deposit', amount: 100000, method: 'KBZ Pay', status: 'completed', time: 'Yesterday', date: 'Yesterday' },
                ]
            };

    let unsubscribeBankAccounts = null;

    // ============================================
    // SOUND FUNCTIONS
    // ============================================
    function playSound(soundId) {
        if (!CONFIG.SOUND_ENABLED) return;
        
        try {
            // Try SoundManager first
            if (window.SoundManager) {
                if (soundId === 'button') SoundManager.button();
                if (soundId === 'noti') SoundManager.noti();
                if (soundId === 'admin') SoundManager.admin();
                return;
            }
            
            // Fallback to audio elements
            const audioMap = {
                'button': 'allbuttonSound',
                'noti': 'notiSound',
                'admin': 'adminSound'
            };
            
            const audioId = audioMap[soundId];
            if (audioId) {
                const audio = document.getElementById(audioId);
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(() => {});
                }
            }
        } catch (error) {
            console.log('Sound error:', error);
        }
    }

    // ============================================
    // TELEGRAM FUNCTIONS
    // ============================================
   async function sendToTelegram(message, imageBase64 = null) {
        try {
            if (imageBase64) {
                // Convert base64 to blob
                const byteCharacters = atob(imageBase64.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });

                const formData = new FormData();
                formData.append('chat_id', CONFIG.ADMIN_CHAT_ID);
                formData.append('photo', blob, 'screenshot.jpg');
                formData.append('caption', message);
                formData.append('parse_mode', 'HTML');

                await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CONFIG.ADMIN_CHAT_ID,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
            }
        } catch (error) {
            console.error('Telegram error:', error);
        }
    }

    async function notifyNewDeposit(deposit) {
        const message = 
            `<b>💰 ငွေသွင်းတောင်းဆိုမှုအသစ်</b>\n\n` +
            `👤 အသုံးပြုသူ: ${deposit.username}\n` +
            `🆔 User ID: ${deposit.userId}\n` +
            `💵 ပမာဏ: ${deposit.amount.toLocaleString()} ကျပ်\n` +
            `🏦 ဘဏ်: ${deposit.method}\n` +
            `📱 ဖုန်း: ${deposit.senderPhone}\n` +
            `🔢 ငွေလွှဲ ID: ${deposit.transferId}\n` +
            `⏰ အချိန်: ${new Date().toLocaleString('my-MM')}`;

        await sendToTelegram(message, deposit.screenshot);
        playSound('admin');
        playSound('noti');
    }

    async function notifyNewWithdrawal(withdrawal) {
        const message = 
            `<b>💸 ငွေထုတ်တောင်းဆိုမှုအသစ်</b>\n\n` +
            `👤 အသုံးပြုသူ: ${withdrawal.username}\n` +
            `🆔 User ID: ${withdrawal.userId}\n` +
            `💵 ထုတ်ယူငွေ: ${withdrawal.amount.toLocaleString()} ကျပ်\n` +
            `💰 လက်ခံရရှိမည့်ငွေ: ${withdrawal.netAmount.toLocaleString()} ကျပ်\n` +
            `🏦 ဘဏ်: ${withdrawal.bank}\n` +
            `📱 အကောင့်: ${withdrawal.accountNumber}\n` +
            `👤 အကောင့်အမည်: ${withdrawal.accountName}\n` +
            `⏰ အချိန်: ${new Date().toLocaleString('my-MM')}`;

        await sendToTelegram(message);
        playSound('admin');
        playSound('noti');
    }


    // ============================================
    // BANK ACCOUNTS (SAFE VERSION)
    // ============================================
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

    function getBankAccountsObject() {
        try {
            if (!state.bankAccounts || state.bankAccounts.length === 0) {
                return getFallbackAccounts();
            }

            const accounts = {};
            
            state.bankAccounts.forEach((account, index) => {
                if (!account) return;

                // Safe key creation
                let key = 'bank';
                if (account.type && typeof account.type === 'string') {
                    key = account.type;
                } else if (account.bankName && typeof account.bankName === 'string') {
                    key = account.bankName;
                } else {
                    key = `bank_${index}`;
                }
                
                key = key.toLowerCase().replace(/\s+/g, '');

                accounts[key] = {
                    name: account.accountHolder || account.holder || 'N/A',
                    phone: account.accountNumber || account.number || 'N/A',
                    refId: account.refId || account.id || 'N/A',
                    type: account.bankName || account.name || 'Bank'
                };
            });

            return Object.keys(accounts).length > 0 ? accounts : getFallbackAccounts();
        } catch (error) {
            console.error('Error in getBankAccountsObject:', error);
            return getFallbackAccounts();
        }
    }

    function getBankIcon(name) {
        const n = (name || '').toLowerCase();
        if (n.includes('kbz')) return 'fa-mobile-alt';
        if (n.includes('wave')) return 'fa-wave-square';
        if (n.includes('cb')) return 'fa-university';
        return 'fa-university';
    }

    // ============================================
    // UI RENDERING
    // ============================================
    function renderPaymentMethods() {
        try {
            const methodGrid = document.querySelector('.method-grid');
            if (!methodGrid) return;

            const accounts = getBankAccountsObject();
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
                state.selectedMethod = firstMethod;
                updateBankInfo(firstMethod);
            }
        } catch (error) {
            console.error('Error in renderPaymentMethods:', error);
        }
    }

    function updateBankInfo(method) {
        try {
            const accounts = getBankAccountsObject();
            const account = accounts[method] || accounts['kbzpay'] || Object.values(accounts)[0];
            
            if (!account) return;

            const elements = {
                bankName: document.getElementById('bankName'),
                accountName: document.getElementById('accountName'),
                accountPhone: document.getElementById('accountPhone'),
                accountRef: document.getElementById('accountRef')
            };

            if (elements.bankName) elements.bankName.textContent = account.type || 'KBZ Pay';
            if (elements.accountName) elements.accountName.textContent = account.name || '';
            if (elements.accountPhone) elements.accountPhone.textContent = account.phone || '';
            if (elements.accountRef) elements.accountRef.textContent = account.refId || 'N/A';
        } catch (error) {
            console.error('Error in updateBankInfo:', error);
        }
    }

    function setupBankAccountsListener() {
        if (!firebase.firestore) {
            console.warn('Firestore not available, using fallback');
            state.bankAccounts = [];
            renderPaymentMethods();
            return;
        }

        const db = firebase.firestore();
        const accountsRef = db.collection('bankAccounts').where('status', '==', 'active');

        if (unsubscribeBankAccounts) {
            unsubscribeBankAccounts();
        }

        unsubscribeBankAccounts = accountsRef.onSnapshot((snapshot) => {
            if (snapshot.empty) {
                state.bankAccounts = [];
            } else {
                state.bankAccounts = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (!data.type && data.bankName) {
                        data.type = data.bankName.toLowerCase().replace(/\s+/g, '');
                    }
                    state.bankAccounts.push({ id: doc.id, ...data });
                });
            }
            
            renderPaymentMethods();
            updateBankInfo(state.selectedMethod);

        }, (error) => {
            console.error('Listener error:', error);
            state.bankAccounts = [];
            renderPaymentMethods();
        });
    }

    // ============================================
    // DEPOSIT FUNCTIONS
    // ============================================
    window.selectAmount = function(element, amount) {
        playSound('button');
        document.querySelectorAll('.amount-chip').forEach(chip => chip.classList.remove('active'));
        element.classList.add('active');
        state.selectedAmount = amount;
        document.getElementById('customAmount').value = '';
    };

    window.useCustomAmount = function() {
        playSound('button');
        const input = document.getElementById('customAmount');
        const amount = parseInt(input.value);

        if (!amount || amount < CONFIG.MIN_DEPOSIT) {
            showNotification(`အနည်းဆုံး ${CONFIG.MIN_DEPOSIT.toLocaleString()} ကျပ်ထည့်ပါ။`, 'error');
            return;
        }
        if (amount > CONFIG.MAX_DEPOSIT) {
            showNotification(`အများဆုံး ${CONFIG.MAX_DEPOSIT.toLocaleString()} ကျပ်သာ ငွေသွင်းနိုင်ပါသည်။`, 'error');
            return;
        }

        document.querySelectorAll('.amount-chip').forEach(chip => chip.classList.remove('active'));
        state.selectedAmount = amount;
        showNotification(amount.toLocaleString() + ' ကျပ် ကိုရွေးချယ်ပြီးပါပြီ။', 'success');
    };

    window.selectPaymentMethod = function(element, method) {
        playSound('button');
        document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
        state.selectedMethod = method;
        updateBankInfo(method);
    };

    window.triggerFileUpload = function() {
        playSound('button');
        document.getElementById('fileInput').click();
    };

    window.handleFileSelect = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification('ဖိုင်အရွယ်အစား 5MB ထက်မကြီးရပါ။', 'error');
            return;
        }
        if (!file.type.startsWith('image/')) {
            showNotification('ပုံဖိုင်သာ တင်နိုင်ပါသည်။', 'error');
            return;
        }

        state.selectedFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('previewContainer').style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        };
        reader.readAsDataURL(file);
    };

    window.removeImage = function() {
        playSound('button');
        state.selectedFile = null;
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('fileInput').value = '';
    };

     
   // ============================================
// DEPOSIT WITH 20% LOSS POOL (FIXED)
// ============================================
window.submitDeposit = async function() {
    playSound('button');

    const user = firebase.auth().currentUser;
    if (!user) {
        showNotification('ကျေးဇူးပြု၍ Login ဝင်ပါ။', 'error');
        return;
    }

    const phone = document.getElementById('senderPhone').value.trim();
    const txId = document.getElementById('transferId').value.trim();

    // Validation
    if (!window.paymentState.selectedAmount) {
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
    if (!window.paymentState.selectedFile) {
        showNotification('Screenshot တင်ပေးပါ။', 'error');
        return;
    }

    // ===== 🔥 SHOW LOADING =====
    showLoading();

    try {
        const screenshotBase64 = await fileToBase64(window.paymentState.selectedFile);
        const db = firebase.firestore();
        const accounts = getBankAccountsObject();
        const username = user.displayName || user.email?.split('@')[0] || 'User';

        // ===== 🔥 20% DISPLAY BALANCE CALCULATION =====
        const depositAmount = window.paymentState.selectedAmount;
        const displayBalanceContribution = Math.floor(depositAmount * 0.2); // 20%
        const userCredit = depositAmount - displayBalanceContribution; // 80%
        const maxWin = Math.floor(depositAmount * 0.5);

        console.log('💰 depositAmount:', depositAmount);
        console.log('💰 displayBalanceContribution:', displayBalanceContribution);
        console.log('💰 userCredit:', userCredit);

        const deposit = {
            userId: user.uid,
            username: username,
            amount: depositAmount,
            actualCredit: userCredit,
            displayBalanceContribution: displayBalanceContribution,
            maxWin: maxWin,
            method: window.paymentState.selectedMethod,
            bankInfo: accounts[window.paymentState.selectedMethod] || {},
            senderPhone: phone,
            transferId: txId,
            screenshot: screenshotBase64,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save deposit
        await db.collection('deposits').add(deposit);

        // ===== UPDATE USER BALANCE =====
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({
            pendingDeposit: firebase.firestore.FieldValue.increment(userCredit),
            pendingDepositAmount: depositAmount,
            pendingDepositTime: new Date().toISOString()
        });

        // ===== 🔥 DISPLAY BALANCE UPDATE =====
        if (window.gameState) {
            window.gameState.displayBalance = (window.gameState.displayBalance || 0) + displayBalanceContribution;
            console.log('✅ gameState.displayBalance:', window.gameState.displayBalance);
        }

        const displayBalanceEl = document.getElementById('displayBalance');
        if (displayBalanceEl) {
            displayBalanceEl.innerText = (window.gameState.displayBalance || 0).toLocaleString();
            console.log('✅ UI updated to:', displayBalanceEl.innerText);
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            currentUser.displayBalance = window.gameState.displayBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('✅ localStorage saved:', currentUser.displayBalance);
        }

        await userRef.update({
            displayBalance: window.gameState.displayBalance
        });

        console.log('💰 Display Balance updated to:', window.gameState.displayBalance);

        // ===== UPDATE LOSS POOL =====
        const lossPoolRef = db.collection('admin').doc('lossPool');
        const lossPoolDoc = await lossPoolRef.get();

        if (lossPoolDoc.exists) {
            await lossPoolRef.update({
                totalAmount: firebase.firestore.FieldValue.increment(displayBalanceContribution),
                [`contributions.${user.uid}`]: firebase.firestore.FieldValue.increment(displayBalanceContribution),
                updatedAt: new Date().toISOString()
            });
        } else {
            await lossPoolRef.set({
                totalAmount: displayBalanceContribution,
                contributions: { [user.uid]: displayBalanceContribution },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // Notify
        await notifyNewDeposit(deposit);

        // ===== 🔥 SHOW SUCCESS =====
        await showSuccessWithCheckmark(
            'ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။',
            'Admin မှ စစ်ဆေးပြီးပါက ငွေဖြည့်သွင်းပေးပါမည်။',
            [
                '💰 ငွေပမာဏ: ' + formatNumber(depositAmount) + ' ကျပ်',
                '🎯 Display Balance (20%): ' + formatNumber(displayBalanceContribution) + ' ကျပ်',
                '🎮 ဂိမ်းကစားငွေ (80%): ' + formatNumber(userCredit) + ' ကျပ်',
                '🔢 ငွေလွှဲ ID: ' + txId,
                '📌 အခြေအနေ: စောင့်ဆိုင်းဆဲ'
            ]
        );

        resetDepositForm();
        setTimeout(() => {
            hideLoading();
            closeModal('depositModal');
        }, 2000);

    } catch (error) {
        console.error('Deposit error:', error);
        hideLoading();
        showNotification('မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။', 'error');
    }
};


 // ===== LOADING FUNCTIONS =====
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    const spinner = document.getElementById('loadingSpinner');
    const success = document.getElementById('loadingSuccess');
    
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 50);
    }
    if (spinner) spinner.style.display = 'flex';
    if (success) success.style.display = 'none';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

async function showSuccessWithCheckmark(title, message, details) {
    const overlay = document.getElementById('loadingOverlay');
    const spinner = document.getElementById('loadingSpinner');
    const success = document.getElementById('loadingSuccess');
    const successMessage = document.getElementById('loadingSuccessMessage');
    
    if (spinner) spinner.style.display = 'none';
    
    // Update success message
    if (successMessage) {
        successMessage.innerHTML = message + '<br><br>' + details.map(d => `✅ ${d}`).join('<br>');
    }
    
    if (success) {
        success.style.display = 'flex';
        // Re-trigger animation
        const checkmark = success.querySelector('.fa-check')?.parentElement;
        if (checkmark) {
            checkmark.style.animation = 'none';
            setTimeout(() => {
                checkmark.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }, 10);
        }
    }
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideLoading();
        closeModal('depositModal');
    }, 3000);
}

    // ============================================
    // WITHDRAW FUNCTIONS
    // ============================================
    window.submitWithdraw = async function() {
        playSound('button');

        const user = firebase.auth().currentUser;
        if (!user) {
            showNotification('ကျေးဇူးပြု၍ Login ဝင်ပါ။', 'error');
            return;
        }

        const amount = parseInt(document.getElementById('withdrawAmount').value);
        const bank = document.getElementById('withdrawBank').value;
        const accNum = document.getElementById('withdrawAccount').value.trim();
        const accName = document.getElementById('withdrawName').value.trim();

        if (!amount || amount < CONFIG.MIN_WITHDRAW || amount > CONFIG.MAX_WITHDRAW) {
            showNotification(`ငွေပမာဏ မှန်ကန်စွာထည့်ပါ။ (${CONFIG.MIN_WITHDRAW.toLocaleString()}-${CONFIG.MAX_WITHDRAW.toLocaleString()})`, 'error');
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

            const fee = Math.floor(amount * CONFIG.WITHDRAW_FEE);
            const net = amount - fee;

            const withdraw = {
                userId: user.uid,
                username: user.displayName || user.email?.split('@')[0] || 'User',
                amount,
                fee,
                netAmount: net,
                bank,
                accountNumber: accNum,
                accountName: accName,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await db.collection('withdrawals').add(withdraw);
            await userRef.update({ balance: balance - amount });
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

    function calculateWithdrawFee() {
        const input = document.getElementById('withdrawAmount');
        const feeEl = document.getElementById('feeAmount');
        const netEl = document.getElementById('netAmount');
        
        if (!input || !feeEl || !netEl) return;

        let amount = parseInt(input.value);
        if (isNaN(amount) || amount < CONFIG.MIN_WITHDRAW) {
            feeEl.textContent = '0 ကျပ်';
            netEl.textContent = '0 ကျပ်';
            return;
        }
        if (amount > CONFIG.MAX_WITHDRAW) {
            amount = CONFIG.MAX_WITHDRAW;
            input.value = CONFIG.MAX_WITHDRAW;
        }
        
        const fee = Math.floor(amount * CONFIG.WITHDRAW_FEE);
        feeEl.textContent = formatNumber(fee) + ' ကျပ်';
        netEl.textContent = formatNumber(amount - fee) + ' ကျပ်';
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function resetDepositForm() {
        state.selectedAmount = CONFIG.MIN_DEPOSIT;
        state.selectedMethod = 'kbzpay';
        state.selectedFile = null;

        document.querySelectorAll('.amount-chip').forEach((c, i) => {
            i === 0 ? c.classList.add('active') : c.classList.remove('active');
        });
        
        document.querySelectorAll('.method-btn').forEach((b, i) => {
            i === 0 ? b.classList.add('active') : b.classList.remove('active');
        });

        document.getElementById('customAmount').value = '';
        document.getElementById('senderPhone').value = '';
        document.getElementById('transferId').value = '';
        document.getElementById('fileInput').value = '';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        
        updateBankInfo('kbzpay');
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
        if (!m) return;

        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = msg;
        
        const d = document.getElementById('modalDetails');
        d.innerHTML = details.map(detail => `<div style="color:white; padding:8px 0;">${detail}</div>`).join('');
        
        m.style.display = 'flex';
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    
      // ============================================
// HISTORY FUNCTIONS (FIXED - FROM FIREBASE)
// ============================================

async function loadTransactionsFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return [];

    const db = firebase.firestore();
    const transactions = [];

    try {
        // Get deposits
        const depositsSnap = await db.collection('deposits')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        depositsSnap.forEach(doc => {
            const data = doc.data();
            transactions.push({
                id: doc.id,
                type: 'deposit',
                amount: data.amount || data.depositAmount || 0,
                actualCredit: data.actualCredit,
                method: data.method || data.bankInfo?.type || 'Unknown',
                status: data.status || 'pending',
                createdAt: data.createdAt,
                date: formatDate(data.createdAt)
            });
        });

        // Get withdrawals
        const withdrawSnap = await db.collection('withdrawals')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        withdrawSnap.forEach(doc => {
            const data = doc.data();
            transactions.push({
                id: doc.id,
                type: 'withdraw',
                amount: data.amount || 0,
                netAmount: data.netAmount,
                method: data.bank || 'Unknown',
                status: data.status || 'pending',
                createdAt: data.createdAt,
                date: formatDate(data.createdAt)
            });
        });

        // Sort by date (newest first)
        transactions.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });

        return transactions;
    } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
    }
}

function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        date = new Date(timestamp);
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) return 'Today';
    if (date >= yesterday) return 'Yesterday';
    return date.toLocaleDateString();
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        date = new Date(timestamp);
    }
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatNumber(num) { 
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
}

async function renderTransactions(filter = 'all') {
    const container = document.getElementById('txList');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<div class="text-center text-slate-400 py-4"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</div>';
    
    // Load from Firebase
    const allTransactions = await loadTransactionsFromFirebase();
    
    let filtered = allTransactions;
    if (filter !== 'all') {
        filtered = allTransactions.filter(t => t.type === filter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="text-center text-slate-400 py-8">
                <i class="fas fa-history text-3xl mb-2 opacity-50"></i>
                <p>No transactions yet</p>
                <p class="text-xs mt-1">Make a deposit or withdrawal to see history</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(tx => {
        const isDeposit = tx.type === 'deposit';
        const statusClass = tx.status === 'completed' ? 'status-completed' : 
                           (tx.status === 'approved' ? 'status-completed' : 'status-pending');
        const statusIcon = (tx.status === 'completed' || tx.status === 'approved') ? 'check-circle' : 'clock';
        const statusText = (tx.status === 'completed' || tx.status === 'approved') ? 'Done' : 'Pending';
        
        return `
            <div class="glass-panel rounded-xl p-3 border border-slate-700/50 flex items-center gap-3 animate-fade-in">
                <div class="w-10 h-10 rounded-xl ${isDeposit ? 'bg-emerald-500/20' : 'bg-rose-500/20'} flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-${isDeposit ? 'arrow-down' : 'arrow-up'} ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="font-bold text-white text-sm">${tx.method || 'Unknown'}</h4>
                        <span class="status-badge ${statusClass} text-[10px] px-2 py-0.5 rounded-full">
                            <i class="fas fa-${statusIcon} text-[8px]"></i> ${statusText}
                        </span>
                    </div>
                    <p class="text-[10px] text-slate-500">${tx.date} • ${formatTime(tx.createdAt)}</p>
                </div>
                <div class="text-right flex-shrink-0">
                    <p class="font-bold text-sm ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}">
                        ${isDeposit ? '+' : '-'} ${formatNumber(tx.amount)} Ks
                    </p>
                    <p class="text-[10px] text-slate-500 font-mono">${tx.id?.slice(-8) || 'N/A'}</p>
                </div>
            </div>
        `;
    }).join('');
}

window.filterTx = function(type) {
    renderTransactions(type);
    
    // Update active tab styling
    const btns = document.querySelectorAll('#form-history .flex.gap-2 button');
    btns.forEach(btn => {
        const btnText = btn.textContent.toLowerCase();
        const isActive = (type === 'all' && btnText === 'all') ||
                        (type === 'deposit' && btnText === 'deposits') ||
                        (type === 'withdraw' && btnText === 'withdrawals');
        
        if (isActive) {
            btn.classList.remove('bg-slate-800', 'text-slate-400', 'border-slate-700');
            btn.classList.add('bg-violet-500/20', 'text-violet-400', 'border-violet-500/30');
        } else {
            btn.classList.add('bg-slate-800', 'text-slate-400', 'border-slate-700');
            btn.classList.remove('bg-violet-500/20', 'text-violet-400', 'border-violet-500/30');
        }
    });
};

    // ============================================
    // MODAL CONTROLS
    // ============================================

window.playButtonSound = function() {
    console.log('✅ playButtonSound is working');
    try {
        if (window.SoundManager) {
            window.SoundManager.button();
        } else {
            const audio = document.getElementById('allbuttonSound');
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        }
    } catch (error) {
        console.log('Sound error:', error);
    }
};
console.log('✅ playButtonSound defined');
 

    window.openDepositModal = function() {
        playSound('button');
        const modal = document.getElementById('depositModal');
        if (modal) {
            modal.style.display = 'flex';
            resetDepositForm();
        }
    };
    

    window.openWithdrawModal = function() {
        playSound('button');
        const modal = document.getElementById('withdrawModal');
        if (modal) {
            modal.style.display = 'flex';
            calculateWithdrawFee();
        }
    };

    window.copyToClipboard = function(elementId) {
        playSound('button');
        const element = document.getElementById(elementId);
        if (!element) return;

        const text = element.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('📋 ကူးယူပြီးပါပြီ။', 'success');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('📋 ကူးယူပြီးပါပြီ။', 'success');
        });
    };
    

   
  
   window.openWalletModal = function() {
    playSound('button');

    // 🔥 ဒါကို ထည့်ပါ - body class ပေါင်းမယ်
    document.body.classList.add('wallet-open');

    const m = document.getElementById('walletModal');
    m.classList.remove('hidden');
    m.classList.add('flex');
    switchModalTab('deposit');
    resetDepositForm();
    renderTransactions();

    // Orientation lock လုပ်မယ်
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(() => {});
    }
};
window.switchModalTab = function(tab) {
                ['deposit', 'withdraw', 'history'].forEach(t => {
                    const form = document.getElementById(`form-${t}`);
                    const tabBtn = document.getElementById(`tab-${t}`);

                    if (t === tab) {
                        form.classList.remove('hidden');
                        form.classList.add('animate-fade-in');
                        tabBtn.classList.remove('text-slate-400');
                        tabBtn.classList.add('bg-violet-500/20', 'text-white');
                    } else {
                        form.classList.add('hidden');
                        tabBtn.classList.add('text-slate-400');
                        tabBtn.classList.remove('bg-violet-500/20', 'text-white');
                    }
                });
                if (tab === 'history') renderTransactions();
            };
  window.closeModal = function(id) {
    playSound('button');
    
    // 🔥 ဒီအပိုင်းကို ထည့်
    document.body.classList.remove('wallet-open');
    
    const m = document.getElementById(id);
    if (!m) {
        console.warn('⚠️ Modal not found:', id);
        return;
    }
    
    m.classList.add('hidden');
    m.classList.remove('flex');
    
    // Orientation ပြန် unlock
    if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
    }
    
    setTimeout(() => {
        if (typeof checkOrientation === 'function') {
            checkOrientation();
        }
    }, 100);
};
// Close on backdrop click
window.onclick = function(e) {
    if (e.target.id === 'walletModal') closeModal('walletModal');
    if (e.target.id === 'successModal') closeModal('successModal');
};
 

    // ============================================
    // INITIALIZATION
    // ============================================
   function init() {
        console.log('💰 Payment system initializing...');
          renderTransactions();
       
        // Setup listeners
        document.getElementById('withdrawAmount')?.addEventListener('input', calculateWithdrawFee);

        // Auth state listener
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                setupBankAccountsListener();
            } else {
                if (unsubscribeBankAccounts) {
                    unsubscribeBankAccounts();
                    unsubscribeBankAccounts = null;
                }
                state.bankAccounts = [];
                renderPaymentMethods();
            }
        });

        // Emergency render
        setTimeout(() => {
            renderPaymentMethods();
        }, 1000);
    }

    // Start
    document.addEventListener('DOMContentLoaded', init);

    // Export to window
 window.paymentState = state;
 window.formatNumber = formatNumber;
 window.showNotification = showNotification;
 window.calculateWithdrawFee = calculateWithdrawFee;
 window.openWalletModal = openWalletModal;
window.closeModal = closeModal;
window.switchModalTab = switchModalTab;
window.openDepositModal = openDepositModal;
window.openWithdrawModal = openWithdrawModal;
window.submitDeposit = submitDeposit;
window.submitWithdraw = submitWithdraw;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showSuccessWithCheckmark = showSuccessWithCheckmark;
window.selectAmount = selectAmount;
window.useCustomAmount = useCustomAmount;
window.selectPaymentMethod = selectPaymentMethod;
window.triggerFileUpload = triggerFileUpload;
window.handleFileSelect = handleFileSelect;
window.removeImage = removeImage;
window.copyToClipboard = copyToClipboard;
window.filterTx = filterTx;
})();

