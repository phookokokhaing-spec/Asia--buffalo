// ============================================
// PAYMENT.JS - WITH BONUS & CASHBACK SYSTEM
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
        SOUND_ENABLED: true,
        
        // 🔥 BONUS CONFIG
        CASHBACK_PERCENT: 0.05,      // 5% cashback
        CASHBACK_DAYS: 5,            // 5 days streak
        MIN_DEPOSIT_PER_DAY: 1000,   // Min per day
        DELAY_BONUS_PERCENT: 0.05,  // 5% of total deposits
        DELAY_BONUS_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours
    };

    // ============================================
    // BONUS DATA STORAGE
    // ============================================
    let bonusData = {
        deposits: {},           // { "2024-06-07": 5000 }
        lastDepositDate: null,
        cashbackClaimed: false,
        totalCashbackClaimed: 0,
        totalDeposits: 0,
        delayBonusAmount: 0,
        delayBonusClaimed: false,
        lastDelayClaim: null,
        // Journey
        currentWorld: 1,
        worldsProgress: { 1: 0, 2: 0, 3: 0, 4: 0 },
        worldsCompleted: [],
        totalSpins: 0,
        biggestWin: 0,
        totalBet: 0,
        totalWin: 0
    };

    // ============================================
    // BONUS FUNCTIONS
    // ============================================

    // Load bonus data
    function loadBonusData() {
        const saved = localStorage.getItem('asiaBuffaloBonusData');
        if (saved) bonusData = JSON.parse(saved);
    }

    function saveBonusData() {
        localStorage.setItem('asiaBuffaloBonusData', JSON.stringify(bonusData));
    }

    // Save to Firebase
    function saveBonusToFirebase() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser || !firebase.firestore) return;
        
        const user = JSON.parse(currentUser);
        if (!user || !user.uid) return;
        
        firebase.firestore().collection('users').doc(user.uid).update({
            bonusData: bonusData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(e => console.warn('Bonus save error:', e));
    }

    // Record deposit for bonus
    function recordBonusDeposit(amount) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!bonusData.deposits[today]) bonusData.deposits[today] = 0;
        bonusData.deposits[today] += amount;
        bonusData.lastDepositDate = today;
        bonusData.totalDeposits += amount;
        
        // Calculate delay bonus (5% of total deposits)
        bonusData.delayBonusAmount = Math.floor(bonusData.totalDeposits * CONFIG.DELAY_BONUS_PERCENT);
        
        saveBonusData();
        saveBonusToFirebase();
        
        // Update UI if on daily tab
        if (document.getElementById('daily-content')?.style.display !== 'none') {
            updateCashbackUI();
            updateDelayBonusUI();
        }
        
        console.log('💰 Bonus deposit recorded:', amount, 'Total:', bonusData.totalDeposits);
    }

    // Get 5-day total
    function get5DayTotal() {
        let total = 0;
        const today = new Date();
        for (let i = 0; i < 5; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (bonusData.deposits[key]) total += bonusData.deposits[key];
        }
        return total;
    }

    // Calculate cashback
    function calculateCashback() {
        return Math.floor(get5DayTotal() * CONFIG.CASHBACK_PERCENT);
    }

    // Get streak
    function getStreak() {
        let streak = 0;
        for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (bonusData.deposits[key] && bonusData.deposits[key] >= CONFIG.MIN_DEPOSIT_PER_DAY) {
                streak++;
            } else if (i > 0) break;
        }
        return streak;
    }

    // Claim cashback
    window.claimCashback = function() {
        const streak = getStreak();
        if (streak < 5) {
            showNotification('❌ 5 ရက်ပြည့်အောင် ငွေသွင်းပါ!', 'error');
            return;
        }
        if (bonusData.cashbackClaimed) {
            showNotification('❌ ယူခဲ့ပြီးပါပြီ!', 'error');
            return;
        }
        
        const amount = calculateCashback();
        addBonusToBalance(amount);
        
        bonusData.cashbackClaimed = true;
        bonusData.totalCashbackClaimed += amount;
        
        saveBonusData();
        saveBonusToFirebase();
        updateCashbackUI();
        
        showBonusCelebration('🎉 5% CASHBACK!', `+${amount.toLocaleString()} KS`, amount);
    };

    // Claim delay bonus
    window.claimDelayBonus = function() {
        if (bonusData.delayBonusAmount <= 0) {
            showNotification('❌ Bonus မရှိသေးပါ!', 'error');
            return;
        }
        
        const lastClaim = bonusData.lastDelayClaim ? new Date(bonusData.lastDelayClaim) : null;
        const now = new Date();
        if (lastClaim && (now - lastClaim) < CONFIG.DELAY_BONUS_INTERVAL) {
            const hoursLeft = Math.ceil((CONFIG.DELAY_BONUS_INTERVAL - (now - lastClaim)) / 3600000);
            showNotification(`⏳ ${hoursLeft} နာရီ ထပ်စောင့်ပါ!`, 'error');
            return;
        }
        
        const amount = bonusData.delayBonusAmount;
        addBonusToBalance(amount);
        
        bonusData.delayBonusClaimed = true;
        bonusData.lastDelayClaim = now.toISOString();
        bonusData.delayBonusAmount = 0; // Reset for next cycle
        
        saveBonusData();
        saveBonusToFirebase();
        updateDelayBonusUI();
        
        showBonusCelebration('🎁 DELAY BONUS!', `+${amount.toLocaleString()} KS`, amount);
    };

    // Add bonus to balance
    function addBonusToBalance(amount) {
        const current = getCurrentBalance();
        const newBalance = current + amount;
        
        // Update DOM
        const lobbyEl = document.getElementById('lobbyBalance');
        const gameEl = document.getElementById('balanceAmount');
        if (lobbyEl) lobbyEl.innerText = newBalance.toLocaleString();
        if (gameEl) gameEl.innerText = newBalance.toLocaleString();
        
        // Update gameState
        if (window.gameState) {
            window.gameState.balance = newBalance;
            window.gameState.displayBalance = newBalance;
        }
        
        // Save to localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            const user = JSON.parse(userData);
            user.balance = newBalance;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Firebase
            if (firebase.firestore && user.uid) {
                firebase.firestore().collection('users').doc(user.uid).update({
                    balance: newBalance,
                    displayBalance: newBalance
                }).catch(e => console.warn(e));
            }
        }
    }

    function getCurrentBalance() {
        if (window.gameState && typeof window.gameState.balance === 'number') {
            return window.gameState.balance;
        }
        const lobbyEl = document.getElementById('lobbyBalance');
        if (lobbyEl) {
            return parseInt(lobbyEl.innerText.replace(/,/g, '')) || 0;
        }
        return 0;
    }

    // Update Cashback UI
    function updateCashbackUI() {
        const total = get5DayTotal();
        const cashback = calculateCashback();
        const streak = getStreak();
        
        const elTotal = document.getElementById('totalDeposits');
        const elCashback = document.getElementById('cashbackReady');
        const elDay = document.getElementById('currentDay');
        const elStreak = document.getElementById('streakText');
        
        if (elTotal) elTotal.innerText = total.toLocaleString() + ' KS';
        if (elCashback) elCashback.innerText = cashback.toLocaleString() + ' KS';
        if (elDay) elDay.innerText = streak + ' / 5';
        if (elStreak) elStreak.innerText = streak + ' Day Streak';
        
        // Day cards
        const today = new Date();
        for (let i = 1; i <= 5; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - (5 - i));
            const key = d.toISOString().split('T')[0];
            const deposit = bonusData.deposits[key] || 0;
            const isComplete = deposit >= CONFIG.MIN_DEPOSIT_PER_DAY;
            
            const progress = document.getElementById('day' + i + 'Progress');
            const btn = document.getElementById('day' + i + 'Btn');
            const depositText = document.getElementById('day' + i + 'Deposit');
            const card = document.getElementById('day' + i + 'Card');
            
            if (depositText) depositText.innerText = deposit.toLocaleString() + ' KS';
            if (progress) progress.style.width = Math.min((deposit / CONFIG.MIN_DEPOSIT_PER_DAY) * 100, 100) + '%';
            
            if (card) {
                if (isComplete) {
                    card.classList.add('completed');
                    if (btn) {
                        btn.innerHTML = '<i class="fas fa-check"></i> Done';
                        btn.disabled = true;
                    }
                } else {
                    card.classList.remove('completed');
                    if (btn) {
                        if (i === 5) {
                            btn.innerText = 'Locked';
                            btn.disabled = true;
                        } else {
                            btn.innerText = 'Deposit Now';
                            btn.disabled = false;
                            btn.onclick = () => openDepositModal();
                        }
                    }
                }
            }
        }
        
        // Day 5 claim button
        const day5Btn = document.getElementById('day5Btn');
        const day5Cashback = document.getElementById('day5Cashback');
        if (day5Cashback) day5Cashback.innerText = cashback.toLocaleString() + ' KS';
        
        if (day5Btn) {
            if (streak >= 5 && !bonusData.cashbackClaimed) {
                day5Btn.disabled = false;
                day5Btn.innerHTML = '<i class="fas fa-crown"></i> CLAIM ' + cashback.toLocaleString() + ' KS';
                day5Btn.style.background = 'linear-gradient(135deg, #ff4757, #ff6348)';
                day5Btn.onclick = window.claimCashback;
            } else if (bonusData.cashbackClaimed) {
                day5Btn.disabled = true;
                day5Btn.innerHTML = '<i class="fas fa-check"></i> Claimed';
                day5Btn.style.background = 'linear-gradient(135deg, #00ff7f, #00cc66)';
            } else {
                day5Btn.disabled = true;
                day5Btn.innerHTML = '<i class="fas fa-lock"></i> Locked';
            }
        }
        
        updateDepositHistory();
    }

    // Update Delay Bonus UI
    function updateDelayBonusUI() {
        const elTotal = document.getElementById('delayTotalDeposits');
        const elBonus = document.getElementById('delayBonusAmount');
        const elClaimable = document.getElementById('delayClaimable');
        const btn = document.getElementById('delayClaimBtn');
        
        if (elTotal) elTotal.innerText = bonusData.totalDeposits.toLocaleString() + ' KS';
        if (elBonus) elBonus.innerText = bonusData.delayBonusAmount.toLocaleString() + ' KS';
        
        const lastClaim = bonusData.lastDelayClaim ? new Date(bonusData.lastDelayClaim) : null;
        const now = new Date();
        const canClaim = bonusData.delayBonusAmount > 0 && 
            (!lastClaim || (now - lastClaim) >= CONFIG.DELAY_BONUS_INTERVAL);
        
        if (elClaimable) elClaimable.innerText = canClaim ? bonusData.delayBonusAmount.toLocaleString() + ' KS' : '0 KS';
        
        if (btn) {
            btn.disabled = !canClaim;
            if (canClaim) {
                btn.innerHTML = '<i class="fas fa-gift"></i> Claim ' + bonusData.delayBonusAmount.toLocaleString() + ' KS';
                btn.style.background = 'linear-gradient(135deg, #00ff7f, #00cc66)';
                btn.onclick = window.claimDelayBonus;
            } else {
                btn.innerHTML = '<i class="fas fa-lock"></i> Not Available';
                btn.style.background = 'linear-gradient(135deg, #333, #222)';
            }
        }
    }

    function updateDepositHistory() {
        const list = document.getElementById('depositHistoryList');
        if (!list) return;
        
        const dates = Object.keys(bonusData.deposits).sort().reverse();
        if (dates.length === 0) {
            list.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">No deposits yet</div>';
            return;
        }
        
        list.innerHTML = dates.slice(0, 10).map(date => {
            const d = new Date(date);
            const formatted = d.toLocaleDateString('my-MM', { month: 'short', day: 'numeric' });
            return `
                <div class="deposit-history-item">
                    <span class="date">${formatted}</span>
                    <span class="amount">${bonusData.deposits[date].toLocaleString()} KS</span>
                </div>
            `;
        }).join('');
    }

    // Countdown timer
    let countdownInterval;
    function startCountdownTimer() {
        if (countdownInterval) clearInterval(countdownInterval);
        
        const timer = document.getElementById('nextReset');
        if (!timer) return;
        
        countdownInterval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const diff = tomorrow - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            
            timer.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }, 1000);
    }

    // Show celebration
    function showBonusCelebration(title, message, amount) {
        // Confetti
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.style.cssText = `
                position:fixed;
                width:8px;height:8px;
                background:${['#ffd700','#ff9500','#00ff7f','#00bfff','#ff4757'][Math.floor(Math.random()*5)]};
                left:${Math.random()*100}%;
                top:-10px;
                border-radius:50%;
                animation:confettiFall ${2+Math.random()*2}s ease-out forwards;
                z-index:10000;
                pointer-events:none;
            `;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 4000);
        }
        
        // Notification
        showNotification(`${title} ${message}`, 'success');
        
        // Celebration modal
        const cel = document.getElementById('celebrationNotification');
        if (cel) {
            document.getElementById('celebrationTitle').innerText = title;
            document.getElementById('celebrationMessage').innerText = message;
            document.getElementById('celebrationAmount').innerText = amount.toLocaleString() + ' KS';
            cel.style.display = 'block';
            setTimeout(() => cel.style.display = 'none', 5000);
        }
    }

    // Add confetti animation style
    const confettiStyle = document.createElement('style');
    confettiStyle.innerHTML = `
        @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(confettiStyle);

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
        withdrawRequests: []
    };

    let unsubscribeBankAccounts = null;

    // ============================================
    // SOUND FUNCTIONS
    // ============================================
    function playSound(soundId) {
        if (!CONFIG.SOUND_ENABLED) return;
        
        try {
            if (window.SoundManager) {
                if (soundId === 'button') SoundManager.button();
                if (soundId === 'noti') SoundManager.noti();
                if (soundId === 'admin') SoundManager.admin();
                return;
            }
            
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
    // DEPOSIT WITH BONUS SYSTEM
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

        if (!state.selectedAmount) {
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
        if (!state.selectedFile) {
            showNotification('Screenshot တင်ပေးပါ။', 'error');
            return;
        }

        try {
            const screenshotBase64 = await fileToBase64(state.selectedFile);
            const db = firebase.firestore();
            const accounts = getBankAccountsObject();
            const username = user.displayName || user.email?.split('@')[0] || 'User';

            // 20% Loss Pool Calculation
            const depositAmount = state.selectedAmount;
            const lossPoolContribution = Math.floor(depositAmount * CONFIG.LOSS_POOL_PERCENT);
            const userCredit = depositAmount - lossPoolContribution;
            const maxWin = Math.floor(depositAmount * 0.5);

            const deposit = {
                userId: user.uid,
                username: username,
                amount: depositAmount,
                actualCredit: userCredit,
                lossPoolContribution: lossPoolContribution,
                maxWin: maxWin,
                method: state.selectedMethod,
                bankInfo: accounts[state.selectedMethod] || {},
                senderPhone: phone,
                transferId: txId,
                screenshot: screenshotBase64,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Save deposit
            await db.collection('deposits').add(deposit);

            // Pending deposit (admin approve လုပ်မှ balance တိုး)
            const userRef = db.collection('users').doc(user.uid);
            await userRef.update({
                pendingDeposit: firebase.firestore.FieldValue.increment(userCredit),
                pendingDepositAmount: depositAmount,
                pendingDepositTime: new Date().toISOString()
            });

            // Update loss pool
            const lossPoolRef = db.collection('admin').doc('lossPool');
            const lossPoolDoc = await lossPoolRef.get();

            if (lossPoolDoc.exists) {
                await lossPoolRef.update({
                    totalAmount: firebase.firestore.FieldValue.increment(lossPoolContribution),
                    [`contributions.${user.uid}`]: firebase.firestore.FieldValue.increment(lossPoolContribution),
                    updatedAt: new Date().toISOString()
                });
            } else {
                await lossPoolRef.set({
                    totalAmount: lossPoolContribution,
                    contributions: { [user.uid]: lossPoolContribution },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            // 🔥 RECORD FOR BONUS SYSTEM
            recordBonusDeposit(depositAmount);

            // Update local state
            if (window.gameState) {
                window.gameState.displayBalance = (window.gameState.displayBalance || 0) + depositAmount;
            }

            // Notify
            await notifyNewDeposit(deposit);

            showSuccessModal(
                'ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။',
                'Admin မှ စစ်ဆေးပြီးပါက ငွေဖြည့်သွင်းပေးပါမည်။',
                [
                    'ငွေပမာဏ: ' + formatNumber(depositAmount) + ' ကျပ်',
                    'Gameunitရရှိ‌ေငွ: ' + formatNumber(userCredit) + ' ကျပ် (80%)',
                    'ငွေလွှဲ ID: ' + txId,
                    'အခြေအနေ: စောင့်ဆိုင်းဆဲ'
                ]
            );

            resetDepositForm();
            setTimeout(() => closeModal('depositModal'), 2000);

        } catch (error) {
            console.error('Deposit error:', error);
            showNotification('မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။', 'error');
        }
    };

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
        if (!n) {
            console.log(msg);
            return;
        }
        
        const msgEl = n.querySelector('#notificationMessage');
        const iconEl = n.querySelector('#notificationIcon');
        
        if (msgEl) msgEl.textContent = msg;
        if (iconEl) iconEl.className = type === 'success' ? 'fas fa-check-circle' : type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
        
        n.style.background = type === 'success' ? 'rgba(0,255,127,0.9)' : 
                            type === 'error' ? 'rgba(255,71,87,0.9)' : 'rgba(0,191,255,0.9)';
        n.style.display = 'flex';
        
        setTimeout(() => { n.style.display = 'none'; }, 3000);
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

    window.closeModal = function(modalId) {
        playSound('button');
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    };

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

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        console.log('💰 Payment system initializing...');
        
        // Load bonus data
        loadBonusData();

        // Setup listeners
        document.getElementById('withdrawAmount')?.addEventListener('input', calculateWithdrawFee);

        // Auth state listener
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                setupBankAccountsListener();
                
                // Load bonus from Firebase
                try {
                    const doc = await firebase.firestore().collection('users').doc(user.uid).get();
                    if (doc.exists && doc.data().bonusData) {
                        bonusData = doc.data().bonusData;
                        saveBonusData();
                    }
                } catch (e) {
                    console.warn('Bonus load error:', e);
                }
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
    
    // 🔥 BONUS EXPORTS
    window.recordBonusDeposit = recordBonusDeposit;
    window.bonusData = bonusData;

})();
