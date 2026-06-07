// ============================================
// crashback.js - NAV INTEGRATION VERSION
// ============================================

const CASHBACK_RATE = 0.05;
const CASHBACK_DAYS = 5;

// ============================================
// GLOBAL USER DATA
// ============================================
var userData = {
    userName: 'User',
    totalDeposit: 0,
    currentDay: 0,
    cashbackAvailable: 0,
    cashbackReady: false,
    lastDepositDate: '',
    depositHistory: []
};

// ============================================
// SAFE FIREBASE CHECK
// ============================================
function isFirebaseReady() {
    return typeof firebase !== 'undefined' &&
           firebase.auth &&
           firebase.firestore;
}

// ============================================
// FETCH USER DATA FROM FIREBASE
// ============================================
async function fetchUserData() {
    if (!isFirebaseReady()) {
        console.warn('Firebase not ready');
        return false;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn('No user logged in');
        return false;
    }

    try {
        const db = firebase.firestore();
        const userSnap = await db.collection('users').doc(user.uid).get();

        if (userSnap.exists) {
            const data = userSnap.data();
            userData = {
                userName: data.userName || data.displayName || 'User',
                totalDeposit: data.totalDeposit || 0,
                currentDay: data.currentDay || 0,
                cashbackAvailable: data.cashbackAvailable || 0,
                cashbackReady: data.cashbackReady || false,
                lastDepositDate: data.lastDepositDate || '',
                depositHistory: data.depositHistory || []
            };
            console.log('✅ User data fetched:', userData);
            return true;
        } else {
            console.warn('User document not found');
            return false;
        }
    } catch (error) {
        console.error('Fetch user data error:', error);
        return false;
    }
}

// ============================================
// NAV BADGE UPDATE (NEW - replaces floating button)
// ============================================

async function updateCashbackNavBadge() {
    // 🗑️ REMOVE old floating button if exists
    const oldFloating = document.querySelector('.cashback-btn, .floating-cashback, #cashbackContainer');
    if (oldFloating && !oldFloating.closest('.bottom-nav')) {
        oldFloating.remove();
        console.log('🗑️ Removed old floating cashback button');
    }

    // ✅ UPDATE nav badge
    const navBadge = document.getElementById('cashbackNavBadge');
    const navItem = document.querySelector('.nav-cashback');

    if (!navBadge || !navItem) {
        console.warn('Cashback nav elements not found');
        return;
    }

    // Fetch latest data
    await fetchUserData();

    const hasActivity = userData.totalDeposit > 0 || userData.currentDay > 0;
    
    // Show/hide nav item based on activity
    navItem.style.display = hasActivity ? 'flex' : 'none';

    // Show pulse badge if ready to claim
    const canClaim = userData.cashbackReady && userData.cashbackAvailable > 0;
    
    if (canClaim) {
        navBadge.style.display = 'flex';
        navBadge.textContent = '!';
        navItem.classList.add('cashback-ready');
    } else {
        navBadge.style.display = 'none';
        navItem.classList.remove('cashback-ready');
    }

    // Update nav icon based on progress
    const navIcon = navItem.querySelector('.nav-icon i');
    if (navIcon) {
        if (canClaim) {
            navIcon.className = 'fas fa-gift';
        } else if (userData.currentDay > 0) {
            navIcon.className = 'fas fa-clock';
        } else {
            navIcon.className = 'fas fa-gift';
        }
    }

    console.log('Nav badge updated - canClaim:', canClaim, 'currentDay:', userData.currentDay);
}

// ============================================
// MODAL FUNCTIONS
// ============================================

async function openCashbackModal() {
    const modal = document.getElementById('cashbackModal');
    if (!modal) {
        console.error('Cashback modal not found');
        return;
    }

    // 🎰 FETCH LATEST DATA BEFORE SHOWING
    await fetchUserData();
    updateModalContent();

    // Show modal
    modal.style.display = 'flex';
    modal.classList.add('active', 'show');

    // Hide other modals if open
    document.querySelectorAll('.modal').forEach(m => {
        if (m.id !== 'cashbackModal') {
            m.style.display = 'none';
            m.classList.remove('active', 'show');
        }
    });
}

function closeCashbackModal() {
    const modal = document.getElementById('cashbackModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active', 'show');
    }
}

// Close on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.id === 'cashbackModal') {
        closeCashbackModal();
    }
});

// ============================================
// MODAL CONTENT UPDATE
// ============================================

function updateModalContent() {
    console.log('Updating modal with data:', userData);

    const currentDay = userData.currentDay || 0;
    const totalDeposit = userData.totalDeposit || 0;
    const cashbackAmount = calculateCashback();
    const isReady = userData.cashbackReady === true;

    // Safe element updates
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('cashbackAmount', cashbackAmount.toLocaleString() + ' KS');
    setText('totalDepositDisplay', totalDeposit.toLocaleString() + ' KS');
    setText('cashbackCalcDisplay', cashbackAmount.toLocaleString() + ' KS');
    setText('currentDayDisplay', currentDay);

    // Update message
    const messageEl = document.getElementById('cashbackMessage');
    if (messageEl) {
        if (isReady) {
            messageEl.innerHTML = '🎉 <span style="color: #ffd700; font-weight: 800;">Ready to claim your cashback!</span>';
        } else if (currentDay === 0) {
            messageEl.textContent = 'Start depositing to earn 5% cashback!';
        } else {
            messageEl.textContent = `Day ${currentDay} of 5 - Keep depositing daily!`;
        }
    }

    updateDayTracker(currentDay, isReady);
    updateClaimButton(isReady, cashbackAmount);
    updateHistory();
}

function calculateCashback() {
    return Math.floor(userData.totalDeposit * CASHBACK_RATE);
}

// ============================================
// DAY TRACKER
// ============================================

function updateDayTracker(currentDay, isReady) {
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        progressLine.style.width = ((currentDay / CASHBACK_DAYS) * 100) + '%';
    }

    for (let i = 1; i <= CASHBACK_DAYS; i++) {
        const dot = document.getElementById(`day${i}`);
        if (!dot) continue;

        dot.className = 'day-dot';

        if (i < currentDay) {
            dot.classList.add('completed');
            dot.innerHTML = '<i class="fas fa-check"></i><span class="day-label">Day ' + i + '</span>';
        } else if (i === currentDay && currentDay < CASHBACK_DAYS) {
            dot.classList.add('active');
            dot.innerHTML = `<span>${i}</span><span class="day-label">Day ${i}</span>`;
        } else if (i === CASHBACK_DAYS && isReady) {
            dot.classList.add('active');
            dot.innerHTML = '<i class="fas fa-gift"></i><span class="day-label">CLAIM!</span>';
        } else {
            dot.classList.add('pending');
            dot.innerHTML = i === CASHBACK_DAYS ?
                '<i class="fas fa-crown"></i><span class="day-label">Day 5</span>' :
                `<span>${i}</span><span class="day-label">Day ${i}</span>`;
        }
    }
}

// ============================================
// CLAIM BUTTON
// ============================================

function updateClaimButton(isReady, amount) {
    const btn = document.getElementById('claimBtn');
    if (!btn) return;

    if (!isReady || amount <= 0) {
        btn.disabled = true;
        btn.className = 'primary-btn';
        btn.innerHTML = '<i class="fas fa-lock"></i> COMPLETE 5 DAYS';
    } else {
        btn.disabled = false;
        btn.className = 'primary-btn claim-active';
        btn.innerHTML = `<i class="fas fa-gift"></i> CLAIM ${amount.toLocaleString()} KS`;
    }
}

// ============================================
// CLAIM CASHBACK
// ============================================

async function claimCashback() {
    if (!userData.cashbackReady || userData.cashbackAvailable <= 0) {
        showNotification('Cashback not ready yet!', 'error');
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        showNotification('Please login first!', 'error');
        return;
    }

    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(user.uid);

        // Add cashback to balance
        const userSnap = await userRef.get();
        const currentBalance = userSnap.data()?.balance || 0;
        const newBalance = currentBalance + userData.cashbackAvailable;

        await userRef.update({
            balance: newBalance,
            cashbackAvailable: 0,
            cashbackReady: false,
            totalDeposit: 0,
            currentDay: 0,
            depositHistory: [],
            lastDepositDate: ''
        });

        // Reset local data
        userData.cashbackAvailable = 0;
        userData.cashbackReady = false;
        userData.totalDeposit = 0;
        userData.currentDay = 0;
        userData.depositHistory = [];

        // Effects
        spawnCoinBurst();
        triggerConfetti();
        showNotification(`🎉 Claimed ${userData.cashbackAvailable.toLocaleString()} KS!`, 'success');

        // Update UI
        updateModalContent();
        updateCashbackNavBadge();

        // Update lobby balance if function exists
        if (typeof updateLobbyBalance === 'function') {
            updateLobbyBalance(newBalance);
        }

    } catch (error) {
        console.error('Claim error:', error);
        showNotification('Error claiming cashback!', 'error');
    }
}

// ============================================
// HISTORY
// ============================================

function updateHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;

    console.log('Updating history with:', userData.depositHistory);

    if (!userData.depositHistory || userData.depositHistory.length === 0) {
        list.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-inbox"></i>
                No deposits yet. Start depositing!
            </div>`;
        return;
    }

    const initials = userData.userName ? userData.userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

    list.innerHTML = userData.depositHistory.map(item => {
        let date;
        if (item.date && typeof item.date.toDate === 'function') {
            date = item.date.toDate();
        } else if (item.date) {
            date = new Date(item.date);
        } else {
            date = new Date();
        }

        return `
            <div class="history-item">
                <div class="history-user">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <div class="user-name">${userData.userName || 'User'}</div>
                        <div class="user-date">
                            <i class="far fa-calendar-alt" style="margin-right: 5px;"></i>
                            ${formatDateString(date)}
                        </div>
                    </div>
                </div>
                <div class="history-amount">
                    <div class="deposit-amount">${(item.amount || 0).toLocaleString()} KS</div>
                    <span class="history-status">
                        <i class="fas fa-check" style="margin-right: 3px;"></i>Deposited
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function formatDateString(date) {
    try {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Invalid Date';
    }
}

// ============================================
// RECORD DEPOSIT (Call from approvePayment)
// ============================================

async function recordDepositForCashback(userId, depositAmount, userName) {
    console.log('🎰 Recording deposit for cashback:', { userId, depositAmount, userName });

    if (!userId || depositAmount <= 0) {
        console.warn('Invalid deposit data');
        return;
    }

    if (!isFirebaseReady()) {
        console.warn('Firebase not ready, skipping cashback tracking');
        return;
    }

    const db = firebase.firestore();
    const userRef = db.collection('users').doc(userId);

    try {
        await db.runTransaction(async (transaction) => {
            const userSnap = await transaction.get(userRef);
            const data = userSnap.data() || {};

            const now = new Date();
            const today = now.toDateString();
            const lastDepositDate = data.lastDepositDate || '';

            let currentDay = data.currentDay || 0;
            let totalDeposit = data.totalDeposit || 0;
            let depositHistory = data.depositHistory || [];

            // New day check
            if (lastDepositDate !== today) {
                currentDay += 1;

                if (currentDay > CASHBACK_DAYS) {
                    currentDay = 1;
                    totalDeposit = 0;
                    depositHistory = [];
                }
            }

            totalDeposit += depositAmount;
            depositHistory.push({
                date: firebase.firestore.FieldValue.serverTimestamp(),
                amount: depositAmount,
                userName: userName || data.userName || 'User'
            });

            let cashbackAvailable = 0;
            let cashbackReady = false;

            if (currentDay >= CASHBACK_DAYS) {
                cashbackAvailable = Math.floor(totalDeposit * CASHBACK_RATE);
                cashbackReady = true;
            }

            console.log('🎰 Updating cashback data:', {
                currentDay,
                totalDeposit,
                cashbackAvailable,
                cashbackReady
            });

            transaction.update(userRef, {
                currentDay: currentDay,
                totalDeposit: totalDeposit,
                lastDepositDate: today,
                depositHistory: depositHistory,
                cashbackAvailable: cashbackAvailable,
                cashbackReady: cashbackReady,
                userName: userName || data.userName || 'User'
            });
        });

        console.log('✅ Cashback tracking updated');

        // Update nav badge
        await updateCashbackNavBadge();

    } catch (error) {
        console.error('❌ recordDeposit error:', error);
    }
}

// ============================================
// EFFECTS
// ============================================

function spawnCoinBurst() {
    const btn = document.getElementById('claimBtn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top;

    const burst = document.createElement('div');
    burst.className = 'coin-burst';
    burst.style.left = centerX + 'px';
    burst.style.top = centerY + 'px';
    burst.style.position = 'fixed';
    burst.style.zIndex = '99999';
    document.body.appendChild(burst);

    const coins = ['💰', '💵', '🪙', '✨', '💎', '🎰', '💸'];

    for (let i = 0; i < 25; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.textContent = coins[Math.floor(Math.random() * coins.length)];
        coin.style.left = (Math.random() - 0.5) * 350 + 'px';
        coin.style.animationDelay = (Math.random() * 0.4) + 's';
        coin.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
        coin.style.fontSize = (1.2 + Math.random() * 1) + 'rem';
        burst.appendChild(coin);
    }

    setTimeout(() => burst.remove(), 2500);
}

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#FFD700', '#DC143C', '#00C853', '#FFF', '#FF6B6B', '#B8860B', '#FF8C00'];

    for (let i = 0; i < 200; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 4,
            speedY: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 6,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            p.speedY += 0.15;

            if (p.y < canvas.height + 50) {
                active = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;

                if (Math.random() > 0.5) {
                    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        });

        if (active) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    animate();
}

function showNotification(message, type) {
    const notif = document.getElementById('notification');
    if (!notif) {
        console.log(`[${type}] ${message}`);
        return;
    }

    notif.className = `notification ${type}`;
    notif.innerHTML = type === 'success'
        ? `<i class="fas fa-check-circle"></i> ${message}`
        : `<i class="fas fa-exclamation-circle"></i> ${message}`;

    notif.classList.add('show');

    setTimeout(() => notif.classList.remove('show'), 3000);
}

// ============================================
// INIT
// ============================================

function initCashback() {
    console.log('🎰 Initializing cashback system (Nav version)...');

    // 🗑️ Remove old floating button immediately
    const oldFloating = document.querySelector('.cashback-btn, .floating-cashback, #cashbackContainer');
    if (oldFloating && !oldFloating.closest('.bottom-nav')) {
        oldFloating.remove();
        console.log('🗑️ Removed old floating cashback button');
    }

    // Setup auth listener
    if (isFirebaseReady()) {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                console.log('✅ User logged in, fetching data...');
                await fetchUserData();
                await updateCashbackNavBadge();
            } else {
                console.log('❌ No user logged in');
                // Hide nav item
                const navItem = document.querySelector('.nav-cashback');
                if (navItem) navItem.style.display = 'none';
            }
        });
    } else {
        console.warn('⏳ Firebase not loaded yet, retrying...');
        setTimeout(initCashback, 1000);
    }
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCashback);
} else {
    initCashback();
}

// ============================================
// EXPORT (for other files)
// ============================================
window.recordDepositForCashback = recordDepositForCashback;
window.openCashbackModal = openCashbackModal;
window.closeCashbackModal = closeCashbackModal;
window.claimCashback = claimCashback;
window.updateCashbackNavBadge = updateCashbackNavBadge;
// Add to your <script> tag or JS file
document.addEventListener('DOMContentLoaded', () => {
    
    // Define missing function
    window.switchLobbyTab = function(element, tabName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        if (element) element.classList.add('active');
        console.log('Tab:', tabName);
    };

    // Other missing functions
    window.openCashbackModal = window.openCashbackModal || function() {
        console.log('Cashback modal - implement me');
    };

    window.openDepositModal = window.openDepositModal || function() {
        console.log('Deposit modal - implement me');
    };

    window.openWithdrawModal = window.openWithdrawModal || function() {
        console.log('Withdraw modal - implement me');
    };

});

