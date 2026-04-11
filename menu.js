const GlobalTopManager = {
    currentPlayerId: null,
    currentPlayerName: 'Player', // Default
    
    // 🔥 Auth Listener သီးသန့်ထားမယ်
    listenToAuth() {
        if (!window.auth) {
            console.warn('Auth not available');
            return;
        }
        
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                // Name ကို အဆင့်မြင့်စွာ ကိုင်တွယ်မယ်
                let name = user.displayName;
                if (!name && user.email) {
                    name = user.email.split('@')[0];
                }
                if (name) {
                    // Capitalize first letter
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                    this.currentPlayerName = name;
                    localStorage.setItem('playerName', name); // Backup
                } else {
                    this.currentPlayerName = 'Player';
                }
                console.log('👤 GlobalTopManager: Player =', this.currentPlayerName);
            } else {
                this.currentPlayerName = 'Guest';
                console.log('👤 GlobalTopManager: Guest Mode');
            }
        });
    },
    
    init() {
        this.listenToAuth(); // ✅ အရင်ဆုံး Auth ကို နားထောင်မယ်
        
        // Firestore စောင့်တဲ့အပိုင်း
        if (window.db) {
            this.db = window.db;
            this.loadGlobalTop();
            this.setupRealtimeListener();
        } else {
            console.log('Firestore not ready yet, waiting...');
            setTimeout(() => this.init(), 500);
        }
    },
    
    setupRealtimeListener() {
        if (!this.db) return;
        
        this.db.collection('globalWins')
            .orderBy('totalWin', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                const winsArray = [];
                snapshot.forEach((doc) => {
                    winsArray.push({ id: doc.id, ...doc.data() });
                });
                this.displayGlobalTop(winsArray);
                
                const updateEl = document.getElementById('lastUpdateTime');
                if (updateEl) updateEl.innerText = `Last update: ${new Date().toLocaleTimeString()}`;
            }, (error) => {
                console.log('Error loading global top:', error);
                this.loadFromLocalStorage();
            });
    },
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('globalTopWins');
        let wins = saved ? JSON.parse(saved) : [];
        wins.sort((a, b) => b.totalWin - a.totalWin);
        this.displayGlobalTop(wins.slice(0, 10));
    },
    
    // 🔥🔥🔥 winType ပါ ထည့်မယ် 🔥🔥🔥
    submitWin(totalWin, winType = 'big', playerName = null) {
    // 1. နာမည် အရင်ရှာမယ်
    let name = playerName;
    
    if (!name) {
        // Option A: Auth ကို တိုက်ရိုက်စစ်မယ် (Fallback)
        const user = window.auth?.currentUser;
        if (user) {
            name = user.displayName || user.email?.split('@')[0] || 'Player';
            name = name.charAt(0).toUpperCase() + name.slice(1);
        } else {
            // Option B: GlobalTopManager ထဲက သိမ်းထားတာကို သုံးမယ်
            name = this.currentPlayerName || localStorage.getItem('playerName') || 'Player';
        }
    }
    
    // DEBUG: သေချာအောင် Console မှာ ထုတ်ကြည့်
    console.log(`🚀 Submitting: Name=${name}, Amount=${totalWin}, Type=${winType}`);

    // 2. Firestore Data ဆောက်မယ်
    const winData = {
        playerName: name,          // ✅ Mayhtetlu ဆိုပြီး ဝင်သွားရမယ်
        totalWin: totalWin,
        winType: winType,          // ✅ BIG / MEGA / JACKPOT
        date: firebase.firestore.FieldValue.serverTimestamp(),
        timestamp: Date.now()
    };
    
    // 3. Firestore ထဲထည့်မယ်
    if (this.db) {
        this.db.collection('globalWins').add(winData)
            .then(() => console.log('✅ Firestore Upload Success:', name))
            .catch(err => console.log('❌ Firestore Error:', err));
    } else {
        // Offline Fallback
        let wins = JSON.parse(localStorage.getItem('globalTopWins') || '[]');
        wins.push({ ...winData, date: new Date().toISOString() });
        wins.sort((a, b) => b.totalWin - a.totalWin);
        wins = wins.slice(0, 20);
        localStorage.setItem('globalTopWins', JSON.stringify(wins));
        this.loadFromLocalStorage();
    }
},
    
    displayGlobalTop(wins) {
        const tbody = document.getElementById('globalTopBody');
        if (!tbody) return;
        
        if (!wins || wins.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No global wins yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = wins.map((win, idx) => {
            let rankClass = '';
            if (idx === 0) rankClass = 'global-rank-1';
            else if (idx === 1) rankClass = 'global-rank-2';
            else if (idx === 2) rankClass = 'global-rank-3';
            
            let dateStr = '-';
            if (win.date) {
                if (win.date.toDate) {
                    dateStr = win.date.toDate().toLocaleDateString();
                } else if (typeof win.date === 'string') {
                    dateStr = new Date(win.date).toLocaleDateString();
                }
            }
            
            // 🔥 Win Type အလိုက် Badge ပြမယ်
            let winTypeBadge = '';
            const winType = win.winType || 'big';
            
            if (winType === 'mega') {
                winTypeBadge = '<span style="background: linear-gradient(45deg, #ffd700, #ff8c00); color: black; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-left: 5px;">MEGA</span>';
            } else if (winType === 'super') {
                winTypeBadge = '<span style="background: linear-gradient(45deg, #c0c0c0, #e0e0e0); color: black; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-left: 5px;">SUPER</span>';
            } else {
                winTypeBadge = '<span style="background: #4ecdc4; color: black; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-left: 5px;">BIG</span>';
            }
            
            return `
                <tr class="${rankClass}">
                    <td style="font-weight:bold;">${idx + 1}</td>
                    <td>${this.escapeHtml(win.playerName || 'Anonymous')} ${winTypeBadge}</td>
                    <td style="color:#0ff;">${(win.totalWin || 0).toLocaleString()}</td>
                    <td style="font-size:11px;">${dateStr}</td>
                </tr>
            `;
        }).join('');
    },
    
    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    },
    
    loadGlobalTop() {
        if (this.db) {
            this.db.collection('globalWins')
                .orderBy('totalWin', 'desc')
                .limit(10)
                .get()
                .then((snapshot) => {
                    const winsArray = [];
                    snapshot.forEach((doc) => {
                        winsArray.push({ id: doc.id, ...doc.data() });
                    });
                    this.displayGlobalTop(winsArray);
                })
                .catch(err => console.log('Error:', err));
        } else {
            this.loadFromLocalStorage();
        }
    }
};;
// ============================================
// SETTINGS & HISTORY MANAGER
// ============================================

const GameSettings = {
    sound: true,
    vibration: true,
    volume: 70,
    language: 'my',
    theme: 'neon',
    notifications: true,
    
    load() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            Object.assign(this, JSON.parse(saved));
        }
        this.apply();
    },
    
    save() {
        localStorage.setItem('gameSettings', JSON.stringify({
            sound: this.sound,
            vibration: this.vibration,
            volume: this.volume,
            language: this.language,
            theme: this.theme,
            notifications: this.notifications
        }));
    },
    
    apply() {
        if (window.SoundManager) {
            SoundManager.setVolume(this.volume / 100);
        }
        document.body.classList.remove('theme-neon', 'theme-purple', 'theme-green', 'theme-red');
        document.body.classList.add('theme-' + this.theme);
        
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) soundToggle.checked = this.sound;
        const vibeToggle = document.getElementById('vibrationToggle');
        if (vibeToggle) vibeToggle.checked = this.vibration;
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) volumeSlider.value = this.volume;
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) langSelect.value = this.language;
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = this.theme;
        const notifToggle = document.getElementById('notificationToggle');
        if (notifToggle) notifToggle.checked = this.notifications;
    }
};

// History Manager
const GameHistory = {
    maxEntries: 50,
    
    getStats() {
        const stats = localStorage.getItem('gameStats');
        return stats ? JSON.parse(stats) : {
            biggestWin: 0,
            jackpotCount: 0,
            megaWinCount: 0,
            superWinCount: 0,
            bigWinCount: 0,
            lastPlayed: null
        };
    },
    
    saveStats(stats) {
        localStorage.setItem('gameStats', JSON.stringify(stats));
    },
    
    getHistory() {
        const history = localStorage.getItem('gameHistory');
        return history ? JSON.parse(history) : [];
    },
    
    saveHistory(history) {
        if (history.length > this.maxEntries) {
            history = history.slice(0, this.maxEntries);
        }
        localStorage.setItem('gameHistory', JSON.stringify(history));
    },
    
    // 🔥🔥🔥 အရေးကြီးဆုံး - win → totalWin ပြောင်းပါ 🔥🔥🔥
    addEntry(bet, totalWin, winType) {  // ✅ win → totalWin
        const stats = this.getStats();
        const history = this.getHistory();
        
        // ✅ win → totalWin
        if (totalWin > stats.biggestWin) stats.biggestWin = totalWin;
        
        if (winType === 'jackpot') stats.jackpotCount++;
        if (winType === 'mega') stats.megaWinCount++;      // ✅ 'megawin' မဟုတ်ဘဲ 'mega'
        if (winType === 'super') stats.superWinCount++;    // ✅ 'superwin' မဟုတ်ဘဲ 'super'
        if (winType === 'big') stats.bigWinCount++;        // ✅ 'bigwin' မဟုတ်ဘဲ 'big'
        
        stats.lastPlayed = new Date().toLocaleString();
        
        this.saveStats(stats);
        
        // ✅ History Entry မှာလည်း win → totalWin
        history.unshift({
            time: new Date().toLocaleTimeString(),
            bet: bet,
            totalWin: totalWin,  // ✅ Field Name ပြောင်း
            winType: winType || 'normal'
        });
        this.saveHistory(history);
        
        this.updateUI();
        
        if (GameSettings.notifications && totalWin > bet * 10) {
            this.showNotification(`🎉 You won ${totalWin}!`);
        }
        
        // 🔥 GlobalTopManager.submitWin ကို ဒီမှာ ခေါ်စရာမလိုတော့ဘူး
        // calculateWinnings() ကနေပဲ တိုက်ရိုက်ခေါ်တော့မယ်
    },
    
    showNotification(msg) {
        if (Notification.permission === 'granted') {
            new Notification('Slot Game', { body: msg });
        }
    },
    
    // 🔥🔥🔥 UI Update မှာလည်း win → totalWin ပြောင်းပါ 🔥🔥🔥
    updateUI() {
        const stats = this.getStats();
        const history = this.getHistory();
        
        const biggestWinEl = document.getElementById('biggestWin');
        if (biggestWinEl) biggestWinEl.innerText = stats.biggestWin.toLocaleString();
        
        const jackpotEl = document.getElementById('jackpotCount');
        if (jackpotEl) jackpotEl.innerText = stats.jackpotCount;
        
        const megaWinEl = document.getElementById('megaWinCount');
        if (megaWinEl) megaWinEl.innerText = stats.megaWinCount;
        
        const superWinEl = document.getElementById('superWinCount');
        if (superWinEl) superWinEl.innerText = stats.superWinCount;
        
        const bigWinEl = document.getElementById('bigWinCount');
        if (bigWinEl) bigWinEl.innerText = stats.bigWinCount;
        
        const lastPlayedEl = document.getElementById('lastPlayed');
        if (lastPlayedEl) lastPlayedEl.innerText = stats.lastPlayed || '-';
        
        const historyBody = document.getElementById('historyBody');
        if (historyBody) {
            if (history.length === 0) {
                historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No history yet</td></tr>';
            } else {
                historyBody.innerHTML = history.map(h => {
                    // ✅ h.win → h.totalWin
                    const winAmount = h.totalWin || 0;
                    return `
                        <tr>
                            <td>${h.time}</td>
                            <td>${h.bet.toLocaleString()}</td>
                            <td style="color:${winAmount > 0 ? '#0ff' : '#ff6666'}">${winAmount.toLocaleString()}</td>
                            <td>${h.winType}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    },
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
};


function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}


  function openHistoryModal() {
    document.getElementById('historyModal').style.display = 'flex';
    closeMainMenu(); // Main Menu ကို အလိုအလျောက်ပိတ်မယ်
    // GameHistory ကို refresh လုပ်ဖို့ မမေ့ပါနဲ့
    if (typeof GameHistory !== 'undefined') GameHistory.updateUI();
}

function closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
}
  
// Modal controls
    const settingsModal = document.getElementById('settingsModal');
    const historyModal = document.getElementById('historyModal');
    const openSettings = document.getElementById('openSettingsBtn');
    const openHistory = document.getElementById('openHistoryBtn');
    const closeSettings = document.getElementById('closeSettingsBtn');
    const closeHistory = document.getElementById('closeHistoryBtn');
    
  
    
    // Settings listeners
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.onchange = (e) => {
            GameSettings.sound = e.target.checked;
            GameSettings.save();
        };
    }
    
    const vibeToggle = document.getElementById('vibrationToggle');
    if (vibeToggle) {
        vibeToggle.onchange = (e) => {
            GameSettings.vibration = e.target.checked;
            GameSettings.save();
            if (GameSettings.vibration && navigator.vibrate) {
                navigator.vibrate(50);
            }
        };
    }
    
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.oninput = (e) => {
            GameSettings.volume = parseInt(e.target.value);
            GameSettings.save();
            if (window.SoundManager) {
                SoundManager.setVolume(GameSettings.volume / 100);
            }
        };
    }
    
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.onchange = (e) => {
            GameSettings.language = e.target.value;
            GameSettings.save();
            console.log('Language changed to:', GameSettings.language);
        };
    }
    
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.onchange = (e) => {
            GameSettings.theme = e.target.value;
            GameSettings.save();
            GameSettings.apply();
        };
    }
    
    const notifToggle = document.getElementById('notificationToggle');
    if (notifToggle) {
        notifToggle.onchange = (e) => {
            GameSettings.notifications = e.target.checked;
            GameSettings.save();
            if (GameSettings.notifications) {
                GameHistory.requestNotificationPermission();
            }
        };
    }
    function initHistoryTabs() {
    const tabMy = document.getElementById('tabMyHistory');
    const tabGlobal = document.getElementById('tabGlobalTop');
    const panelMy = document.getElementById('myHistoryPanel');
    const panelGlobal = document.getElementById('globalTopPanel');
    
    if (!tabMy || !tabGlobal) return;
    
    tabMy.onclick = () => {
        tabMy.style.color = '#0ff';
        tabGlobal.style.color = '#aac8ff';
        panelMy.style.display = 'block';
        panelGlobal.style.display = 'none';
    };
    
    tabGlobal.onclick = () => {
        tabGlobal.style.color = '#0ff';
        tabMy.style.color = '#aac8ff';
        panelGlobal.style.display = 'block';
        panelMy.style.display = 'none';
        if (typeof GlobalTopManager !== 'undefined') GlobalTopManager.loadGlobalTop();
    };
}

// DOM Load ဖြစ်တာနဲ့ Tabs တွေကို အလုပ်လုပ်ခိုင်းမယ်
document.addEventListener('DOMContentLoaded', () => {
    initHistoryTabs();
    
    // Logout Button အတွက် Event (အရင်ကရှိပြီးသားဆိုရင် ထပ်ထည့်စရာမလိုပါ)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (window.auth) {
                window.auth.signOut().then(() => {
                    localStorage.clear();
                    alert('Logged out!');
                    window.location.reload();
                });
            } else {
                localStorage.clear();
                alert('Logged out! Refresh to start over.');
                window.location.reload();
            }
        };
    }
});

window.toggleMainMenu = function() {
        playButtonSound();
        const modal = document.getElementById('mainMenuModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    };

    window.closeMainMenu = function() {
        playButtonSound();
        const modal = document.getElementById('mainMenuModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

