const GlobalTopManager = {
    currentPlayerId: null,
    currentPlayerName: 'Player',
    db: null,  // ⭐ db property ထည့်ထားမယ်
    
    init: function() {
        this.listenToAuth();
        
        // ⭐ db ကို window ကနေ ယူမယ်
        if (window.db) {
            this.db = window.db;
            this.loadGlobalTop();
            this.setupRealtimeListener();
        } else {
            console.warn('⏳ Firestore not ready, waiting...');
            // 500ms စောင့်ပြီး ပြန်ခေါ်မယ်
            setTimeout(() => this.init(), 500);
        }
    },
    
    listenToAuth: function() {
        if (!window.auth) return;
        var self = this;
        window.auth.onAuthStateChanged(function(user) {
            if (user) {
                var name = user.displayName || (user.email ? user.email.split('@')[0] : 'Player');
                self.currentPlayerName = name.charAt(0).toUpperCase() + name.slice(1);
            }
        });
    },
    
    setupRealtimeListener: function() {
        // ⭐ db ရှိမှသာ လုပ်မယ်
        if (!this.db) {
            console.warn('⚠️ setupRealtimeListener: db not available');
            return;
        }
        
        var self = this;
        this.db.collection('globalWins')
            .orderBy('totalWin', 'desc')
            .limit(10)
            .onSnapshot(function(snapshot) {
                var wins = [];
                snapshot.forEach(function(doc) {
                    wins.push({ id: doc.id, data: doc.data() });
                });
                self.displayGlobalTop(wins);
            }, function(err) {
                console.error('❌ Realtime listener error:', err);
            });
    },
    
    submitWin: function(totalWin, winType, playerName) {
        // ⭐ db ရှိမှသာ လုပ်မယ်
        if (!this.db) {
            console.warn('⚠️ submitWin: db not available, win not saved');
            return;
        }
        
        var name = playerName || this.currentPlayerName || 'Player';
        name = name.charAt(0).toUpperCase() + name.slice(1);
        
        var winData = {
            playerName: name,
            totalWin: totalWin,
            winType: winType,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        this.db.collection('globalWins').add(winData)
            .then(function() {
                console.log('✅ Win submitted to global top:', name, totalWin);
            })
            .catch(function(err) {
                console.error('❌ Error submitting win:', err);
            });
    },
    
    displayGlobalTop: function(wins) {
    var tbody = document.getElementById('globalTopBody');
    if (!tbody) return;
    
    if (!wins || wins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No global wins yet</td></tr>';
        return;
    }
    
    var html = '';
    var self = this;
    
    wins.forEach(function(item, index) {
        var win = item.data || item;
        var name = self.escapeHtml(win.playerName || 'Anonymous');
        var amount = (win.totalWin || 0).toLocaleString();
        
        // ⭐⭐⭐ Timestamp ကို စစ်ပြီး Date ပြောင်းမယ် ⭐⭐⭐
        var dateStr = '-';
        if (win.timestamp) {
            try {
                // Firestore Timestamp Object လား
                if (win.timestamp.toDate && typeof win.timestamp.toDate === 'function') {
                    dateStr = win.timestamp.toDate().toLocaleDateString('my-MM');
                }
                // JavaScript Date Object လား
                else if (win.timestamp instanceof Date) {
                    dateStr = win.timestamp.toLocaleDateString('my-MM');
                }
                // Unix Timestamp (seconds) လား
                else if (typeof win.timestamp === 'number') {
                    dateStr = new Date(win.timestamp * 1000).toLocaleDateString('my-MM');
                }
                // ISO String လား
                else if (typeof win.timestamp === 'string') {
                    dateStr = new Date(win.timestamp).toLocaleDateString('my-MM');
                }
                // _seconds ပါတဲ့ Object လား (Firestore old format)
                else if (win.timestamp._seconds) {
                    dateStr = new Date(win.timestamp._seconds * 1000).toLocaleDateString('my-MM');
                }
            } catch (e) {
                console.warn('Error parsing date:', e);
                dateStr = '-';
            }
        }
        
        // Rank Medal
        var rankDisplay = index + 1;
        if (index === 0) rankDisplay = '🥇';
        else if (index === 1) rankDisplay = '🥈';
        else if (index === 2) rankDisplay = '🥉';
        
        // Win Type Badge
        var winTypeBadge = '';
        var winType = win.winType || 'big';
        if (winType === 'jackpot') {
            winTypeBadge = '<span style="background:#ffd700; color:#000; padding:2px 6px; border-radius:10px; font-size:10px; margin-left:5px;">🎰 JACKPOT</span>';
        } else if (winType === 'mega') {
            winTypeBadge = '<span style="background:#ff6b6b; color:#fff; padding:2px 6px; border-radius:10px; font-size:10px; margin-left:5px;">✨ MEGA</span>';
        } else if (winType === 'super') {
            winTypeBadge = '<span style="background:#4ecdc4; color:#000; padding:2px 6px; border-radius:10px; font-size:10px; margin-left:5px;">🌟 SUPER</span>';
        }
        
        html += '<tr>';
        html += '<td style="font-size:18px;">' + rankDisplay + '</td>';
        html += '<td style="font-weight:bold;">' + name + winTypeBadge + '</td>';
        html += '<td style="color:#ffd700; font-weight:bold;">' + amount + '</td>';
        html += '<td style="font-size:12px;">' + dateStr + '</td>';
        html += '</tr>';
    });
    
    tbody.innerHTML = html;
    
    // Last update time
    var updateEl = document.getElementById('lastUpdateTime');
    if (updateEl) {
        updateEl.innerText = 'Last update: ' + new Date().toLocaleTimeString('my-MM');
    }
},
    
    escapeHtml: function(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    },
    
    loadGlobalTop: function() {
        // ⭐ db ရှိမှသာ လုပ်မယ်
        if (!this.db) {
            console.warn('⚠️ loadGlobalTop: db not available');
            return;
        }
        
        var self = this;
        this.db.collection('globalWins')
            .orderBy('totalWin', 'desc')
            .limit(10)
            .get()
            .then(function(snapshot) {
                var wins = [];
                snapshot.forEach(function(doc) {
                    wins.push({ id: doc.id, data: doc.data() });
                });
                self.displayGlobalTop(wins);
            })
            .catch(function(err) {
                console.error('❌ Error loading global top:', err);
            });
    }
};
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
    const modal = document.getElementById('historyModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    closeMainMenu();
  } 
     function closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
} 
    // ⭐ Stats Cards Update
    if (typeof GameHistory !== 'undefined') {
        GameHistory.updateUI();
    }
    
    // ⭐ Global Top 10 Load
    if (typeof GlobalTopManager !== 'undefined') {
        GlobalTopManager.loadGlobalTop();
    }
    
    // Default Tab: My History
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
   
   document.addEventListener('DOMContentLoaded', () => {
    initHistoryTabs();
  
// GlobalTopManager စတင်
if (typeof GlobalTopManager !== 'undefined') {
    GlobalTopManager.init();
} 
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
// Global Function
function toggleMainMenu() {
    playButtonSound();
    const modal = document.getElementById('mainMenuModal');
    if (modal) {
        // Toggle လုပ်မယ် (ဖွင့်/ပိတ်)
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'flex';
        }
    }
}

// Close Function
function closeMainMenu() {
    playButtonSound();
    const modal = document.getElementById('mainMenuModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// window မှာလည်း ထည့်ထား
window.toggleMainMenu = toggleMainMenu;
window.closeMainMenu = closeMainMenu;
