// ================================================================
// POPUP FLOW - ONLY UI CONTROLS (No Payment Logic)
// ================================================================

console.log('🔥 Popup Flow loaded...');
// ================================================================
// DEPOSIT POPUP FLOW (2 Steps)
// ================================================================
window.openDepositPopup1 = function() {
    var popup = document.getElementById('depositPopup1');
    if (!popup) return;
    popup.style.display = 'flex';
    popup.classList.remove('hidden');
    
    // Update balance
    var balance = window.getCurrentBalance ? window.getCurrentBalance() : 0;
    var balanceEl = document.getElementById('popupBalance');
    if (balanceEl) balanceEl.textContent = balance.toLocaleString() + ' KS';
    
    // ★★★ Render payment methods (သေချာအလုပ်လုပ်အောင်) ★★★
    setTimeout(function() {
        if (typeof window.renderPaymentMethods === 'function') {
            window.renderPaymentMethods();
        } else if (typeof renderPaymentMethods === 'function') {
            renderPaymentMethods();
        }
    }, 100);
};
window.closeDepositPopup1 = function() {
    var popup = document.getElementById('depositPopup1');
    if (!popup) return;
    popup.style.display = 'none';
    popup.classList.add('hidden');
};


window.goToDepositPopup2 = function() {
    var amountDisplay =
        document.getElementById('selectedAmountDisplay');

    if (!amountDisplay) return;

    var amountText = amountDisplay.textContent
        .replace(' KS', '')
        .replace(/,/g, '');

    var amount = parseInt(amountText, 10) || 0;

    if (amount <= 0) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                'ငွေပမာဏ ရွေးပါ။',
                'error'
            );
        }
        return;
    }

    // Amount နှစ်နေရာလုံး Sync
    window._selectedAmount = amount;

    if (!window.paymentState) {
        window.paymentState = {};
    }

    window.paymentState.selectedAmount = amount;

    // Popup 2 Amount ပြ
    var amountEl = document.getElementById('popup2Amount');

    if (amountEl) {
        amountEl.textContent =
            amount.toLocaleString() + ' KS';
    }

    // Popup 2 ကို အရင်ဖွင့်
    var popup2 = document.getElementById('depositPopup2');

    if (!popup2) {
        console.error('depositPopup2 ID မတွေ့ပါ');
        return;
    }

    popup2.style.display = 'flex';
    popup2.classList.remove('hidden');

    // Popup 2 ဖွင့်ပြီးမှ Popup 1 ပိတ်
    var popup1 = document.getElementById('depositPopup1');

    if (popup1) {
        popup1.style.display = 'none';
        popup1.classList.add('hidden');
    }
};

window.closeDepositPopup3 = function() {
    console.log('🔴 closeDepositPopup3 called');
    var popup = document.getElementById('depositPopup3');
    if (!popup) {
        console.warn('⚠️ depositPopup3 not found');
        return;
    }
    popup.style.display = 'none';
    popup.classList.add('hidden');
    
    // Popup 1 ကိုပြန်ဖွင့်မယ်
    setTimeout(function() {
        if (typeof window.openDepositPopup1 === 'function') {
            window.openDepositPopup1();
        }
    }, 300);
};
// ================================================================
// GO BACK TO POPUP 1 (FIX)
// ================================================================

window.goBackToDepositPopup1 = function() {
    console.log('⬅️ goBackToDepositPopup1 called');
    
    // Close Popup 2
    var popup2 = document.getElementById('depositPopup2');
    if (popup2) {
        popup2.style.display = 'none';
        popup2.classList.add('hidden');
    }
    
    // Open Popup 1
    var popup1 = document.getElementById('depositPopup1');
    if (popup1) {
        popup1.style.display = 'flex';
        popup1.classList.remove('hidden');
    }
    
    // Render payment methods again
    setTimeout(function() {
        if (typeof window.renderPaymentMethods === 'function') {
            window.renderPaymentMethods();
        } else if (typeof renderPaymentMethods === 'function') {
            renderPaymentMethods();
        }
    }, 100);
};

// ================================================================
// WITHDRAW POPUP CONTROLS
// ================================================================

window.openWithdrawPopup1 = function() {
    var popup = document.getElementById('withdrawPopup1');
    if (!popup) return;
    popup.style.display = 'flex';
    popup.classList.remove('hidden');
    var balanceEl = document.getElementById('withdrawPopupBalance');
    if (balanceEl && typeof window.getCurrentBalance === 'function') {
        balanceEl.textContent = window.getCurrentBalance().toLocaleString() + ' KS';
    }
};

window.closeWithdrawPopup1 = function() {
    var popup = document.getElementById('withdrawPopup1');
    if (!popup) return;
    popup.style.display = 'none';
    popup.classList.add('hidden');
};

window.openWithdrawPopup2 = function() {
    var popup = document.getElementById('withdrawPopup2');
    if (!popup) return;
    popup.style.display = 'flex';
    popup.classList.remove('hidden');
    var amountEl = document.getElementById('withdrawSummaryAmount');
    var feeEl = document.getElementById('withdrawSummaryFee');
    var netEl = document.getElementById('withdrawSummaryNet');
    if (amountEl) amountEl.textContent = (window._withdrawAmount || 0).toLocaleString() + ' KS';
    if (feeEl) feeEl.textContent = (window._withdrawFee || 0).toLocaleString() + ' KS';
    if (netEl) netEl.textContent = (window._withdrawNet || 0).toLocaleString() + ' KS';
};

window.closeWithdrawPopup2 = function() {
    var popup = document.getElementById('withdrawPopup2');
    if (!popup) return;
    popup.style.display = 'none';
    popup.classList.add('hidden');
};

window.openWithdrawPopup3 = function() {
    var popup = document.getElementById('withdrawPopup3');
    if (!popup) return;
    popup.style.display = 'flex';
    popup.classList.remove('hidden');
};

window.closeWithdrawPopup3 = function() {
    var popup = document.getElementById('withdrawPopup3');
    if (!popup) return;
    popup.style.display = 'none';
    popup.classList.add('hidden');
};

window.goToWithdrawPopup2 = function() {
    var input = document.getElementById('withdrawAmount1');
    var amount = parseInt(input ? input.value : 0);
    if (!amount || amount < 5000) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('အနည်းဆုံး ၅,၀၀၀ ကျပ်ထည့်ပါ။', 'error');
        }
        return;
    }
    if (amount > 500000) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('အများဆုံး ၅၀၀,၀၀၀ ကျပ်သာ ငွေထုတ်နိုင်ပါသည်။', 'error');
        }
        return;
    }
    var fee = Math.floor(amount * 0.05);
    var net = amount - fee;
    window._withdrawAmount = amount;
    window._withdrawFee = fee;
    window._withdrawNet = net;
    window.closeWithdrawPopup1();
    window.openWithdrawPopup2();
};

window.goBackToWithdrawPopup1 = function() {
    window.closeWithdrawPopup2();
    window.openWithdrawPopup1();
};

// ================================================================
// AMOUNT SELECTION FUNCTIONS (FIX)
// ================================================================

window.selectAmount = function(element, amount) {
    console.log('💰 selectAmount called:', amount);
    
    // Play sound
    if (typeof window.playSound === 'function') {
        window.playSound('button');
    }
    
    // Update UI
    document.querySelectorAll('.amount-chip').forEach(function(chip) {
        chip.classList.remove('active');
    });
    element.classList.add('active');
    
    // Store selected amount
    window._selectedAmount = amount;
    if (!window.paymentState) {
    window.paymentState = {};
}

window.paymentState.selectedAmount = amount;
    // Update display
    var display = document.getElementById('selectedAmountDisplay');
    if (display) {
        display.textContent = amount.toLocaleString() + ' KS';
    }
    
    // Clear custom amount input
    var customInput = document.getElementById('customAmount');
    if (customInput) {
        customInput.value = '';
    }
};

window.useCustomAmount = function() {
    console.log('💰 useCustomAmount called');
    
    // Play sound
    if (typeof window.playSound === 'function') {
        window.playSound('button');
    }
    
    var input = document.getElementById('customAmount');
    if (!input) return;
    
    var amount = parseInt(input.value);
    if (!amount || amount < 3000) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('အနည်းဆုံး ၃,၀၀၀ ကျပ်ထည့်ပါ။', 'error');
        }
        return;
    }
    if (amount > 1000000) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('အများဆုံး ၁,၀၀၀,၀၀၀ ကျပ်သာ ငွေသွင်းနိုင်ပါသည်။', 'error');
        }
        return;
    }
    
    // Remove active from chips
    document.querySelectorAll('.amount-chip').forEach(function(chip) {
        chip.classList.remove('active');
    });
    
    // Store selected amount
    window._selectedAmount = amount;
   if (!window.paymentState) {
    window.paymentState = {};
}

window.paymentState.selectedAmount = amount;
 
    // Update display
    var display = document.getElementById('selectedAmountDisplay');
    if (display) {
        display.textContent = amount.toLocaleString() + ' KS';
    }
    
    input.value = '';
    
    if (typeof window.showNotification === 'function') {
        window.showNotification(amount.toLocaleString() + ' ကျပ် ကိုရွေးချယ်ပြီးပါပြီ။', 'success');
    }
};
// ================================================================
// HISTORY POPUP CONTROLS
// ================================================================

window.openHistoryPopup = function() {
    var popup = document.getElementById('historyPopup');
    if (!popup) return;
    popup.style.display = 'flex';
    popup.classList.remove('hidden');
    if (typeof window.renderTransactions === 'function') {
        window.renderTransactions('all');
    }
};

window.closeHistoryPopup = function() {
    var popup = document.getElementById('historyPopup');
    if (!popup) return;
    popup.style.display = 'none';
    popup.classList.add('hidden');
};

console.log('✅ Popup Flow loaded successfully!');


