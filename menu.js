;
// ============================================
// MENU.JS - WORKING VERSION
// ============================================

// ===== 1. MENU FUNCTIONS =====
window.toggleMainMenu = function() {
    var modal = document.getElementById('mainMenuModal');
    if (modal) {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'flex';
        }
    }
};

// ===== SHORT VERSION =====

function playButtonSound() {
    var s = document.getElementById('allbuttonSound');
    if (s) { s.currentTime = 0; s.play().catch(()=>{}); }
}

window.playButtonSound = playButtonSound;

// One function for all modal open/close
window.openModal = function(id) {
    playButtonSound();
    var m = document.getElementById(id);
    if (m) m.style.display = 'flex';
};

window.closeModal = function(id) {
    playButtonSound();
    var m = document.getElementById(id);
    if (m) m.style.display = 'none';
};

// Specific functions
window.openSettingsModal = function() { window.openModal('settingsModal'); };
window.closeSettingsModal = function() { window.closeModal('settingsModal'); };
window.openHistoryModal = function() { window.openModal('historyModal'); };
window.closeHistoryModal = function() { window.closeModal('historyModal'); };
window.toggleMainMenu = function() {
    playButtonSound();
    var m = document.getElementById('mainMenuModal');
    if (m) m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
};
window.closeMainMenu = function() { window.closeModal('mainMenuModal'); };

// ===== 2. GLOBAL TOP MANAGER =====
// ===== GLOBAL TOP MANAGER (Firebase ကနေ တကယ်ယူမယ်) =====
var GlobalTopManager = {
    db: null,
    
    init: function() {
        console.log('🌍 GlobalTopManager initializing...');
        this.db = window.db || null;
        if (this.db) {
            this.loadGlobalTop();
            this.setupRealtimeListener();
        } else {
            console.warn('⚠️ Firestore not ready, will retry...');
            setTimeout(function() { GlobalTopManager.init(); }, 1000);
        }
    },
    
    setupRealtimeListener: function() {
        if (!this.db) return;
        var self = this;
        this.db.collection('globalWins')
            .orderBy('totalWin', 'desc')
            .limit(10)
            .onSnapshot(function(snapshot) {
                console.log('🔄 Leaderboard real-time update, count:', snapshot.size);
                var wins = [];
                snapshot.forEach(function(doc) {
                    wins.push({ id: doc.id, data: doc.data() });
                });
                self.displayGlobalTop(wins);
            }, function(err) {
                console.error('Listener error:', err);
            });
    },
    
    loadGlobalTop: function() {
        if (!this.db) {
            console.warn('⚠️ db not ready, using sample data');
            this.showSampleData();
            return;
        }
        
        var self = this;
        console.log('🔄 Loading leaderboard from Firebase...');
        
        this.db.collection('globalWins')
            .orderBy('totalWin', 'desc')
            .limit(10)
            .get()
            .then(function(snapshot) {
                console.log('📊 Loaded', snapshot.size, 'wins');
                if (snapshot.size === 0) {
                    self.showSampleData();
                    return;
                }
                var wins = [];
                snapshot.forEach(function(doc) {
                    wins.push({ id: doc.id, data: doc.data() });
                });
                self.displayGlobalTop(wins);
            })
            .catch(function(err) {
                console.error('Error loading:', err);
                self.showSampleData();
            });
    },
    
    showSampleData: function() {
        console.log('📊 Showing sample data (no real data yet)');
        var tbody = document.getElementById('globalTopBody');
        if (!tbody) return;
        
        var html = '';
        var sampleData = [
            { name: '🥇 LionKing', amount: 250000 },
            { name: '🥈 ElephantMaster', amount: 180000 },
            { name: '🥉 BuffaloHunter', amount: 120000 },
            { name: '4. ZebraRider', amount: 85000 },
            { name: '5. MonkeyKing', amount: 65000 },
            { name: '6. Peacock', amount: 45000 },
            { name: '7. DragonSlayer', amount: 35000 },
            { name: '8. EagleEye', amount: 25000 },
            { name: '9. WolfPack', amount: 15000 },
            { name: '10. SnakeMaster', amount: 8000 }
        ];
        
        for (var i = 0; i < sampleData.length; i++) {
            html += '<tr>';
            html += '<td style="text-align:center;">' + (i+1) + '</td>';
            html += '<td>' + sampleData[i].name + '</td>';
            html += '<td style="color:#ffd700; text-align:right;">' + sampleData[i].amount.toLocaleString() + '</td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    },
    
    displayGlobalTop: function(wins) {
        var tbody = document.getElementById('globalTopBody');
        if (!tbody) return;
        
        console.log('📊 Displaying', wins.length, 'wins');
        
        if (!wins || wins.length === 0) {
            this.showSampleData();
            return;
        }
        
        // Sort by totalWin descending
        var sorted = wins.sort(function(a, b) {
            var amtA = (a.data || a).totalWin || 0;
            var amtB = (b.data || b).totalWin || 0;
            return amtB - amtA;
        });
        
        var top10 = sorted.slice(0, 10);
        var html = '';
        
        for (var i = 0; i < top10.length; i++) {
            var win = top10[i].data || top10[i];
            var name = win.playerName || 'Anonymous';
            var amount = (win.totalWin || 0).toLocaleString();
            
            var rank = i + 1;
            var rankDisplay = rank;
            if (rank === 1) rankDisplay = '🥇';
            else if (rank === 2) rankDisplay = '🥈';
            else if (rank === 3) rankDisplay = '🥉';
            
            // Win type badge
            var winType = win.winType || '';
            var badge = '';
            if (winType === 'jackpot') badge = ' 🎰';
            else if (winType === 'mega') badge = ' ✨';
            else if (winType === 'super') badge = ' 🌟';
            
            html += '<tr>';
            html += '<td style="text-align:center; font-size:18px;">' + rankDisplay + '</td>';
            html += '<td style="font-weight:bold;">' + name + badge + '</td>';
            html += '<td style="color:#ffd700; text-align:right;">' + amount + '</td>';
            html += '</tr>';
        }
        
        tbody.innerHTML = html;
        
        var updateEl = document.getElementById('lastUpdateTime');
        if (updateEl) {
            updateEl.innerText = 'Last update: ' + new Date().toLocaleTimeString();
        }
    },
    
    submitWin: function(totalWin, winType, playerName) {
        if (!this.db) {
            console.log('💰 Win not submitted (no db):', totalWin, winType);
            return;
        }
        
        var name = playerName || 'Player';
        var winData = {
            playerName: name,
            totalWin: totalWin,
            winType: winType || 'normal',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        this.db.collection('globalWins').add(winData)
            .then(function() {
                console.log('✅ Win submitted:', name, totalWin);
            })
            .catch(function(err) {
                console.error('Error submitting win:', err);
            });
    }
};
// ===== 3. GAME SETTINGS =====
var GameSettings = {
    sound: true,
    vibration: true,
    volume: 70,
    language: 'my',
    theme: 'neon',
    
    load: function() {
        var saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                var data = JSON.parse(saved);
                for (var key in data) {
                    if (this.hasOwnProperty(key)) this[key] = data[key];
                }
            } catch(e) {}
        }
        this.apply();
    },
    
    save: function() {
        localStorage.setItem('gameSettings', JSON.stringify({
            sound: this.sound,
            vibration: this.vibration,
            volume: this.volume,
            language: this.language,
            theme: this.theme
        }));
    },
    
    apply: function() {
        if (window.SoundManager) {
            SoundManager.setVolume(this.volume / 100);
        }
        var soundToggle = document.getElementById('soundToggle');
        if (soundToggle) soundToggle.checked = this.sound;
        var vibeToggle = document.getElementById('vibrationToggle');
        if (vibeToggle) vibeToggle.checked = this.vibration;
        var volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) volumeSlider.value = this.volume;
        var langSelect = document.getElementById('languageSelect');
        if (langSelect) langSelect.value = this.language;
        var themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = this.theme;
    }
};

// ===== 4. GAME HISTORY =====
var GameHistory = {
    getStats: function() {
        var stats = localStorage.getItem('gameStats');
        return stats ? JSON.parse(stats) : {
            biggestWin: 0,
            jackpotCount: 0,
            megaWinCount: 0,
            superWinCount: 0,
            bigWinCount: 0,
            lastPlayed: null
        };
    },
    
    saveStats: function(stats) {
        localStorage.setItem('gameStats', JSON.stringify(stats));
    },
    
    addEntry: function(bet, totalWin, winType) {
        var stats = this.getStats();
        if (totalWin > stats.biggestWin) stats.biggestWin = totalWin;
        if (winType === 'jackpot') stats.jackpotCount++;
        else if (winType === 'mega') stats.megaWinCount++;
        else if (winType === 'super') stats.superWinCount++;
        else if (winType === 'big') stats.bigWinCount++;
        stats.lastPlayed = new Date().toLocaleString();
        this.saveStats(stats);
        this.updateUI();
    },
    
    updateUI: function() {
        var stats = this.getStats();
        var biggestWinEl = document.getElementById('biggestWin');
        if (biggestWinEl) biggestWinEl.innerText = stats.biggestWin.toLocaleString();
        var jackpotEl = document.getElementById('jackpotCount');
        if (jackpotEl) jackpotEl.innerText = stats.jackpotCount;
        var megaWinEl = document.getElementById('megaWinCount');
        if (megaWinEl) megaWinEl.innerText = stats.megaWinCount;
        var superWinEl = document.getElementById('superWinCount');
        if (superWinEl) superWinEl.innerText = stats.superWinCount;
        var bigWinEl = document.getElementById('bigWinCount');
        if (bigWinEl) bigWinEl.innerText = stats.bigWinCount;
        var lastPlayedEl = document.getElementById('lastPlayed');
        if (lastPlayedEl) lastPlayedEl.innerText = stats.lastPlayed || '-';
    }
};

// ===== 5. HISTORY TABS =====
function initHistoryTabs() {
    var tabMy = document.getElementById('tabMyHistory');
    var tabGlobal = document.getElementById('tabGlobalTop');
    var panelMy = document.getElementById('myHistoryPanel');
    var panelGlobal = document.getElementById('globalTopPanel');
    
    if (!tabMy || !tabGlobal) return;
    
    tabMy.onclick = function() {
        tabMy.style.color = '#0ff';
        tabGlobal.style.color = '#aac8ff';
        if (panelMy) panelMy.style.display = 'block';
        if (panelGlobal) panelGlobal.style.display = 'none';
    };
    
    tabGlobal.onclick = function() {
        tabGlobal.style.color = '#0ff';
        tabMy.style.color = '#aac8ff';
        if (panelGlobal) panelGlobal.style.display = 'block';
        if (panelMy) panelMy.style.display = 'none';
        if (typeof GlobalTopManager !== 'undefined') GlobalTopManager.loadGlobalTop();
    };
}

// ===== 6. INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Menu.js loaded');
    initHistoryTabs();
    if (typeof GlobalTopManager !== 'undefined') GlobalTopManager.init();
    if (typeof GameSettings !== 'undefined') GameSettings.load();
    if (typeof GameHistory !== 'undefined') GameHistory.updateUI();
    
    var soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.onchange = function(e) {
            GameSettings.sound = e.target.checked;
            GameSettings.save();
        };
    }
    
    var vibeToggle = document.getElementById('vibrationToggle');
    if (vibeToggle) {
        vibeToggle.onchange = function(e) {
            GameSettings.vibration = e.target.checked;
            GameSettings.save();
            if (GameSettings.vibration && navigator.vibrate) navigator.vibrate(50);
        };
    }
    
    var volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.oninput = function(e) {
            GameSettings.volume = parseInt(e.target.value);
            GameSettings.save();
            if (window.SoundManager) SoundManager.setVolume(GameSettings.volume / 100);
        };
    }
    
    var langSelect = document.getElementById('languageSelect');
    if (langSelect) {
       SoundManager.click();
        langSelect.onchange = function(e) {
            GameSettings.language = e.target.value;
            GameSettings.save();
        };
    }
    
    var themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
       SoundManager.click();
        themeSelect.onchange = function(e) {
            GameSettings.theme = e.target.value;
            GameSettings.save();
            GameSettings.apply();
        };
    }
    
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = function() {
        SoundManager.click();
            if (confirm('ထွက်မှာသေချာပါသလား?')) {
                localStorage.clear();
                window.location.reload();
            }
        };
    }
});

console.log('✅ Menu.js ready!');

// ============================================
// COMPLETE THEME SYSTEM (Game-wide)
// ============================================

var ThemeManager = {
    currentTheme: 'neon',
    themes: ['neon', 'purple', 'green', 'red'],
    
    // Theme colors for each element
    colors: {
        neon: {
            primary: '#00d4ff',
            secondary: '#0099cc',
            accent: '#00ffff',
            glow: 'rgba(0, 212, 255, 0.3)',
            btnGrad1: '#00d4ff',
            btnGrad2: '#0099cc',
            btnShadow: '#006699'
        },
        purple: {
            primary: '#b300ff',
            secondary: '#8a00cc',
            accent: '#e0b3ff',
            glow: 'rgba(179, 0, 255, 0.3)',
            btnGrad1: '#b300ff',
            btnGrad2: '#8a00cc',
            btnShadow: '#5a0080'
        },
        green: {
            primary: '#00ff00',
            secondary: '#00cc00',
            accent: '#90ff90',
            glow: 'rgba(0, 255, 0, 0.3)',
            btnGrad1: '#00ff00',
            btnGrad2: '#00cc00',
            btnShadow: '#008800'
        },
        red: {
            primary: '#ff4444',
            secondary: '#cc0000',
            accent: '#ff8888',
            glow: 'rgba(255, 51, 51, 0.3)',
            btnGrad1: '#ff4444',
            btnGrad2: '#cc0000',
            btnShadow: '#880000'
        }
    },
    
    init: function() {
        console.log('🎨 Initializing Theme Manager...');
        
        // Load saved theme
        var savedTheme = localStorage.getItem('selectedTheme');
        if (!savedTheme) {
            var settings = localStorage.getItem('gameSettings');
            if (settings) {
                try {
                    var parsed = JSON.parse(settings);
                    savedTheme = parsed.theme;
                } catch(e) {}
            }
        }
        
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
        
        // Apply theme
        this.apply(this.currentTheme);
        
        // Setup selector
        this.setupSelector();
        
        console.log('✅ Theme Manager ready, current:', this.currentTheme);
    },
    
    setupSelector: function() {
        var themeSelect = document.getElementById('themeSelect');
        if (!themeSelect) return;
        
        themeSelect.value = this.currentTheme;
        
        themeSelect.onchange = function(e) {
            var newTheme = e.target.value;
            ThemeManager.apply(newTheme);
            
            // Save to localStorage
            localStorage.setItem('selectedTheme', newTheme);
            
            var settings = localStorage.getItem('gameSettings');
            var parsed = settings ? JSON.parse(settings) : {};
            parsed.theme = newTheme;
            localStorage.setItem('gameSettings', JSON.stringify(parsed));
            
            // Play sound
            if (typeof playTestSound === 'function') playTestSound();
            
            console.log('🎨 Theme changed to:', newTheme);
        };
    },
    
    apply: function(themeName) {
        this.currentTheme = themeName;
        
        // 1. Update body class
        this.themes.forEach(function(theme) {
            document.body.classList.remove('theme-' + theme);
        });
        document.body.classList.add('theme-' + themeName);
        
        // 2. Update VIP Badge
        var vipBadge = document.getElementById('vipBadge');
        if (vipBadge) {
            vipBadge.style.background = 'linear-gradient(45deg, ' + 
                this.colors[themeName].btnGrad1 + ', ' + 
                this.colors[themeName].btnGrad2 + ')';
        }
        
        // 3. Update Spin Button
        var spinBtn = document.getElementById('spinBtn');
        if (spinBtn) {
            spinBtn.style.background = 'linear-gradient(45deg, ' + 
                this.colors[themeName].btnGrad1 + ', ' + 
                this.colors[themeName].btnGrad2 + ')';
            spinBtn.style.boxShadow = '0 5px 0 ' + this.colors[themeName].btnShadow;
        }
        
        // 4. Update Jackpot Box
        var jackpotBox = document.querySelector('.jackpot-pool-box');
        if (jackpotBox) {
            jackpotBox.style.border = '1px solid ' + this.colors[themeName].primary;
            jackpotBox.style.boxShadow = '0 0 15px ' + this.colors[themeName].glow;
        }
        
        // 5. Update Balance Box border
        var balanceBox = document.querySelector('.balance-box');
        if (balanceBox) {
            balanceBox.style.border = '2px solid ' + this.colors[themeName].primary;
        }
        
        // 6. Update Modal borders
        var modals = document.querySelectorAll('.modal-content');
        modals.forEach(function(modal) {
            modal.style.border = '2px solid ' + ThemeManager.colors[themeName].primary;
        });
        
        // 7. Update all buttons with .menu-item class
        var menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(function(item) {
            item.addEventListener('mouseenter', function() {
                this.style.borderColor = ThemeManager.colors[themeName].primary;
            });
            item.addEventListener('mouseleave', function() {
                this.style.borderColor = 'rgba(255,215,0,0.2)';
            });
        });
        
        // 8. Update grid cell borders on hover
        var gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach(function(cell) {
            cell.addEventListener('mouseenter', function() {
                this.style.borderColor = ThemeManager.colors[themeName].primary;
            });
            cell.addEventListener('mouseleave', function() {
                this.style.borderColor = '#ffd70022';
            });
        });
        
        console.log('🎨 Theme fully applied:', themeName);
    },
    
    // Get current theme color
    getColor: function(colorName) {
        return this.colors[this.currentTheme][colorName];
    }
};

// Initialize theme system
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
});

// Make global
window.ThemeManager = ThemeManager;


// ===== UPDATE DYNAMIC ELEMENTS WHEN THEME CHANGES =====
function updateDynamicElementsForTheme() {
    var theme = ThemeManager.currentTheme;
    var colors = ThemeManager.colors[theme];
    
    // Update win amount color
    var winAmount = document.getElementById('winAmount');
    if (winAmount) {
        winAmount.style.color = colors.primary;
        winAmount.style.textShadow = '0 0 10px ' + colors.glow;
    }
    
    // Update bet display
    var betDisplay = document.getElementById('betAmountDisplay');
    if (betDisplay) {
        betDisplay.style.color = colors.primary;
    }
    
    // Update jackpot amount
    var jackpotAmount = document.getElementById('jackpot-val');
    if (jackpotAmount) {
        jackpotAmount.style.color = colors.primary;
    }
    
    // Update all borders
    var elementsWithBorder = document.querySelectorAll('.grid-cell, .modal-content, .balance-box');
    elementsWithBorder.forEach(function(el) {
        el.style.borderColor = colors.primary;
    });
}

// Call after theme change
ThemeManager.apply = function(themeName) {
    // ... existing code ...
    updateDynamicElementsForTheme();
};
// ===== LANGUAGES.JS (သီးသန့်ဖိုင် သို့ menu.js ထဲထည့်) =====
var Languages = {
    // မြန်မာ
    my: {
        // Menu
        menu_title: "📋 မီနူး",
        deposit: "💰 ငွေသွင်း",
        withdraw: "🏦 ငွေထုတ်",
        settings: "⚙️ ဆက်တင်များ",
        history: "📜 မှတ်တမ်း",
        logout: "🚪 ထွက်မည်",
        
        // Settings
        settings_title: "⚙️ ဆက်တင်များ",
        sound_effects: "🔊 အသံအကျိုးသက်ရောက်မှု",
        vibration: "📳 တုန်ခါမှု",
        volume: "🔉 အသံအတိုးအကျယ်",
        language: "🌐 ဘာသာစကား",
        theme: "🎨 အပြင်အဆင်",
        notifications: "🔔 အသိပေးချက်များ",
        close: "ပိတ်မည်",
        
        // History
        history_title: "📜 မှတ်တမ်း",
        my_history: "👤 ကျွန်ုပ်၏မှတ်တမ်း",
        global_top: "🌍 ကမ္ဘာ့ထိပ်တန်း ၁၀",
        biggest_win: "အကြီးမားဆုံးအနိုင်",
        jackpot: "ဂျက်ပေါ့",
        mega_win: "မီဂါအနိုင်",
        super_win: "စူပါအနိုင်",
        big_win: "ဘစ်အနိုင်",
        last_played: "နောက်ဆုံးကစားချိန်",
        time: "အချိန်",
        bet: "လောင်းကြေး",
        win: "အနိုင်",
        result: "ရလဒ်",
        
        // ===== GAME UI =====
        balance: "လက်ကျန်ငွေ",
        vip: "ဗွီအိုင်ပီ",
        win_text: "အနိုင်",
        spin: "လှည့်မည်",
        jackpot_text: "ဂျက်ပေါ့",
        win_streak: "အနိုင်အဆက်တန်း",
        hot_meter: "အပူချိန်",
        session_stats: "ကစားမှုစာရင်း",
        spins: "အလှည့်အရေအတွက်",
        wins: "အနိုင်အရေအတွက်",
        win_rate: "အနိုင်နှုန်း",
        bet_amount: "လောင်းကြေး",
        ways: "နည်းလမ်း",
        scatter: "စကက်တာ",
        menu: "မီနူး",
        chat: "စကားပြော",
        admin: "အက်ဒမင်"
    },
    
    // English
    en: {
        menu_title: "📋 MENU",
        deposit: "💰 Deposit",
        withdraw: "🏦 Withdraw",
        settings: "⚙️ Settings",
        history: "📜 History",
        logout: "🚪 Logout",
        
        settings_title: "⚙️ Settings",
        sound_effects: "🔊 Sound Effects",
        vibration: "📳 Vibration",
        volume: "🔉 Volume",
        language: "🌐 Language",
        theme: "🎨 Theme",
        notifications: "🔔 Notifications",
        close: "Close",
        
        history_title: "📜 History",
        my_history: "👤 My History",
        global_top: "🌍 Global Top 10",
        biggest_win: "Biggest Win",
        jackpot: "Jackpot",
        mega_win: "Mega Win",
        super_win: "Super Win",
        big_win: "Big Win",
        last_played: "Last Played",
        time: "Time",
        bet: "Bet",
        win: "Win",
        result: "Result",
        
        // ===== GAME UI =====
        balance: "Balance",
        vip: "VIP",
        win_text: "WIN",
        spin: "SPIN",
        jackpot_text: "JACKPOT",
        win_streak: "Win Streak",
        hot_meter: "Hot Meter",
        session_stats: "Session Stats",
        spins: "Spins",
        wins: "Wins",
        win_rate: "Win Rate",
        bet_amount: "Bet",
        ways: "WAYS",
        scatter: "SCATTER",
        menu: "MENU",
        chat: "Chat",
        admin: "Admin"
    },
    
    // ထိုင်း
    th: {
        menu_title: "📋 เมนู",
        deposit: "💰 ฝากเงิน",
        withdraw: "🏦 ถอนเงิน",
        settings: "⚙️ การตั้งค่า",
        history: "📜 ประวัติ",
        logout: "🚪 ออกจากระบบ",
        
        settings_title: "⚙️ การตั้งค่า",
        sound_effects: "🔊 เสียงเอฟเฟกต์",
        vibration: "📳 การสั่น",
        volume: "🔉 ระดับเสียง",
        language: "🌐 ภาษา",
        theme: "🎨 ธีม",
        notifications: "🔔 การแจ้งเตือน",
        close: "ปิด",
        
        history_title: "📜 ประวัติ",
        my_history: "👤 ประวัติของฉัน",
        global_top: "🌍 ท็อป 10 โลก",
        biggest_win: "ชนะสูงสุด",
        jackpot: "แจ็คพอต",
        mega_win: "เมก้าวิน",
        super_win: "ซุปเปอร์วิน",
        big_win: "บิ๊กวิน",
        last_played: "เล่นล่าสุด",
        time: "เวลา",
        bet: "เดิมพัน",
        win: "ชนะ",
        result: "ผลลัพธ์",
        
        // ===== GAME UI =====
        balance: "ยอดคงเหลือ",
        vip: "วีไอพี",
        win_text: "ชนะ",
        spin: "หมุน",
        jackpot_text: "แจ็คพอต",
        win_streak: "สตรีคชนะ",
        hot_meter: "มาตรวัดความร้อน",
        session_stats: "สถิติการเล่น",
        spins: "การหมุน",
        wins: "การชนะ",
        win_rate: "อัตราชนะ",
        bet_amount: "เดิมพัน",
        ways: "วิธี",
        scatter: "สแคตเตอร์",
        menu: "เมนู",
        chat: "แชท",
        admin: "ผู้ดูแล"
    }
};

// Current language
var currentLanguage = 'my';
// Apply language to UI
function applyLanguage() {
    var lang = Languages[currentLanguage];
    if (!lang) return;
    
    // Menu
    var menuTitle = document.querySelector('#mainMenuModal .modal-header h3');
    if (menuTitle) menuTitle.innerHTML = lang.menu_title;
    
    var menuItems = document.querySelectorAll('#mainMenuModal .menu-item');
    if (menuItems.length >= 4) {
        var depositBtn = menuItems[0];
        var withdrawBtn = menuItems[1];
        var settingsBtn = menuItems[2];
        var historyBtn = menuItems[3];
        var logoutBtn = menuItems[4];
        
        if (depositBtn) depositBtn.innerHTML = '<i class="fas fa-wallet"></i><span>' + lang.deposit + '</span>';
        if (withdrawBtn) withdrawBtn.innerHTML = '<i class="fas fa-money-bill-wave"></i><span>' + lang.withdraw + '</span>';
        if (settingsBtn) settingsBtn.innerHTML = '<i class="fas fa-sliders-h"></i><span>' + lang.settings + '</span>';
        if (historyBtn) historyBtn.innerHTML = '<i class="fas fa-history"></i><span>' + lang.history + '</span>';
        if (logoutBtn) logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>' + lang.logout + '</span>';
    }
    
    // Settings Modal
    var settingsTitle = document.querySelector('#settingsModal .modal-content h2');
    if (settingsTitle) settingsTitle.innerHTML = lang.settings_title;
    
    var settingLabels = document.querySelectorAll('#settingsModal .setting-label');
    if (settingLabels.length >= 6) {
        if (settingLabels[0]) settingLabels[0].innerHTML = lang.sound_effects;
        if (settingLabels[1]) settingLabels[1].innerHTML = lang.vibration;
        if (settingLabels[2]) settingLabels[2].innerHTML = lang.volume;
        if (settingLabels[3]) settingLabels[3].innerHTML = lang.language;
        if (settingLabels[4]) settingLabels[4].innerHTML = lang.theme;
        if (settingLabels[5]) settingLabels[5].innerHTML = lang.notifications;
    }
    
    var closeBtn = document.querySelector('#settingsModal .neon-btn');
    if (closeBtn) closeBtn.innerHTML = lang.close;
    
    // History Modal
    // ===== 3. HISTORY MODAL =====
    var historyTitle = document.querySelector('#historyModal .modal-content h2');
    if (historyTitle) historyTitle.innerHTML = lang.history_title;
    
    var tabMy = document.getElementById('tabMyHistory');
    var tabGlobal = document.getElementById('tabGlobalTop');
    if (tabMy) tabMy.innerHTML = lang.my_history;
    if (tabGlobal) tabGlobal.innerHTML = lang.global_top;
    
    // Stats cards
    var statLabels = document.querySelectorAll('#myHistoryPanel .stat-label');
    if (statLabels.length >= 6) {
        if (statLabels[0]) statLabels[0].innerHTML = lang.biggest_win;
        if (statLabels[1]) statLabels[1].innerHTML = lang.jackpot;
        if (statLabels[2]) statLabels[2].innerHTML = lang.mega_win;
        if (statLabels[3]) statLabels[3].innerHTML = lang.super_win;
        if (statLabels[4]) statLabels[4].innerHTML = lang.big_win;
        if (statLabels[5]) statLabels[5].innerHTML = lang.last_played;
    }
    
    // History table headers
    var tableHeaders = document.querySelectorAll('#historyTable thead th');
    if (tableHeaders.length >= 4) {
        if (tableHeaders[0]) tableHeaders[0].innerHTML = lang.time;
        if (tableHeaders[1]) tableHeaders[1].innerHTML = lang.bet;
        if (tableHeaders[2]) tableHeaders[2].innerHTML = lang.win;
        if (tableHeaders[3]) tableHeaders[3].innerHTML = lang.result;
    }
    
    // ===== 4. GAME UI (အရေးကြီးဆုံး) =====
    
    // Balance label
    var balanceLabel = document.querySelector('.balance-box small');
    if (balanceLabel) balanceLabel.innerHTML = lang.balance;
    
    // VIP badge (tooltip)
    var vipBadge = document.getElementById('vipBadge');
    if (vipBadge) {
        var vipSpan = vipBadge.querySelector('span');
        if (vipSpan) vipSpan.innerHTML = lang.vip;
        else vipBadge.innerHTML = '<i class="fas fa-crown"></i> ' + lang.vip + ' <span id="vipLevel">3</span>';
    }
    
    // WIN label
    var winLabel = document.querySelector('.win-label');
    if (winLabel) winLabel.innerHTML = lang.win_text;
    
    // SPIN button
    var spinBtn = document.getElementById('spinBtn');
    if (spinBtn) spinBtn.innerHTML = '<i class="fas fa-play"></i> ' + lang.spin;
    
    // Ways text (right panel)
    var waysText = document.querySelector('.ways-text');
    if (waysText) waysText.innerHTML = lang.ways;
    
    // Scatter text (if exists)
    var scatterText = document.querySelector('.scatter-text');
    if (scatterText) scatterText.innerHTML = lang.scatter;
    
    // Menu button label
    var menuBtnLabel = document.querySelector('#mainMenuBtn .btn-label');
    if (menuBtnLabel) menuBtnLabel.innerHTML = lang.menu;
    
    // Chat trigger text
    var chatTriggerText = document.querySelector('.chat-trigger-text');
    if (chatTriggerText) chatTriggerText.innerHTML = lang.chat;
    
    // Admin text (if exists)
    var adminText = document.querySelector('.admin-text');
    if (adminText) adminText.innerHTML = lang.admin;
    
    // ===== 5. JACKPOT POOL LABEL =====
    var jackpotPoolLabel = document.querySelector('.jackpot-pool-box small');
    if (jackpotPoolLabel) jackpotPoolLabel.innerHTML = lang.jackpot_text;
    
    // ===== 6. WIN STREAK & HOT METER (Menu stats) =====
    var winStreakLabel = document.querySelector('.win-streak-label');
    if (winStreakLabel) winStreakLabel.innerHTML = lang.win_streak;
    
    var hotMeterLabel = document.querySelector('.hot-meter-label');
    if (hotMeterLabel) hotMeterLabel.innerHTML = lang.hot_meter;
    
    var sessionStatsLabel = document.querySelector('.session-stats-label');
    if (sessionStatsLabel) sessionStatsLabel.innerHTML = lang.session_stats;
    
    var spinsLabel = document.querySelector('.spins-label');
    if (spinsLabel) spinsLabel.innerHTML = lang.spins;
    
    var winsLabel = document.querySelector('.wins-label');
    if (winsLabel) winsLabel.innerHTML = lang.wins;
    
    var winRateLabel = document.querySelector('.win-rate-label');
    if (winRateLabel) winRateLabel.innerHTML = lang.win_rate;
    
    console.log('✅ Language applied to all UI');
}


// ===== LANGUAGE SELECTOR SETUP =====
function setupLanguageSelector() {
    var langSelect = document.getElementById('languageSelect');
    if (!langSelect) return;
    
    // Load saved language
    var savedLang = localStorage.getItem('selectedLanguage');
    if (!savedLang) {
        var settings = localStorage.getItem('gameSettings');
        if (settings) {
            try {
                var parsed = JSON.parse(settings);
                savedLang = parsed.language;
            } catch(e) {}
        }
    }
    
    if (savedLang && Languages[savedLang]) {
        currentLanguage = savedLang;
        langSelect.value = savedLang;
        applyLanguage();
    }
    
    langSelect.onchange = function(e) {
        currentLanguage = e.target.value;
        applyLanguage();
        
        // Save to localStorage
        localStorage.setItem('selectedLanguage', currentLanguage);
        
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.language = currentLanguage;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        
        // Play sound
        if (typeof playTestSound === 'function') playTestSound();
        
        console.log('🌐 Language changed to:', currentLanguage);
    };
}

// Initialize language system
document.addEventListener('DOMContentLoaded', function() {
    setupLanguageSelector();
});

// Make global
window.applyLanguage = applyLanguage;
window.currentLanguage = currentLanguage;

// ===== 2. Settings Modal Open with current values =====
window.openSettingsModal = function() {
    playButtonSound();
    
    // Load current settings
    var settings = localStorage.getItem('gameSettings');
    if (settings) {
        try {
            var parsed = JSON.parse(settings);
            document.getElementById('soundToggle').checked = parsed.sound !== false;
            document.getElementById('vibrationToggle').checked = parsed.vibration !== false;
            document.getElementById('volumeSlider').value = parsed.volume || 70;
            document.getElementById('languageSelect').value = parsed.language || 'my';
            document.getElementById('themeSelect').value = parsed.theme || 'neon';
            document.getElementById('notificationToggle').checked = parsed.notifications === true;
        } catch(e) {}
    }
    
    var modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'flex';
};

// ===== 3. Sound Toggle with Test Sound =====
function setupSoundToggle() {
    var soundToggle = document.getElementById('soundToggle');
    if (!soundToggle) return;
    
    soundToggle.onchange = function(e) {
        var isEnabled = e.target.checked;
        
        // Save to settings
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.sound = isEnabled;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        
        // Apply to SoundManager
        if (window.SoundManager) {
            if (!isEnabled) {
                SoundManager.stopAll();
                SoundManager.isMuted = true;
            } else {
                SoundManager.isMuted = false;
            }
        }
        
        // 🔊 Test sound (if enabled)
        if (isEnabled) {
            playTestSound();
        }
        
        console.log('🔊 Sound:', isEnabled ? 'ON' : 'OFF');
    };
}

function playTestSound() {
    var audio = document.getElementById('allbuttonSound');
    if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.5;
        audio.play().catch(function(e) {
            console.log('Test sound error:', e);
        });
    }
}
// ===== 4. Vibration Toggle with Test Vibration =====
function setupVibrationToggle() {
    var vibeToggle = document.getElementById('vibrationToggle');
    if (!vibeToggle) return;
    
    vibeToggle.onchange = function(e) {
        var isEnabled = e.target.checked;
        
        // Save to settings
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.vibration = isEnabled;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        
        // 📳 Test vibration (if enabled and supported)
        if (isEnabled && navigator.vibrate) {
            navigator.vibrate(100);
            setTimeout(function() {
                navigator.vibrate(50);
            }, 200);
        }
        
        console.log('📳 Vibration:', isEnabled ? 'ON' : 'OFF');
    };
}

// ===== 5. Volume Control with Real-time Test =====
function setupVolumeControl() {
    var volumeSlider = document.getElementById('volumeSlider');
    if (!volumeSlider) return;
    
    var volumeValue = document.getElementById('volumeValue');
    
    volumeSlider.oninput = function(e) {
        var volume = parseInt(e.target.value);
        
        // Update display
        if (volumeValue) volumeValue.innerText = volume + '%';
        
        // Save to settings
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.volume = volume;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        
        // Apply to SoundManager
        if (window.SoundManager) {
            SoundManager.setMasterVolume(volume / 100);
        }
        
        // Test sound at new volume
        playTestSound();
    };
}

// ===== 6. Language Selector with Real Change =====
function setupLanguageSelector() {
    var langSelect = document.getElementById('languageSelect');
    if (!langSelect) return;
    
    langSelect.onchange = function(e) {
        currentLang = e.target.value;
        
        // Save to settings
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.language = currentLang;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        
        // Apply language change
        applyLanguage();
        
        // Play sound
        playTestSound();
        
        console.log('🌐 Language changed to:', currentLang);
    };
}

// ===== 7. Theme Selector with Real Change =====
function setupThemeSelector() {
    var themeSelect = document.getElementById('themeSelect');
    if (!themeSelect) return;
    
    themeSelect.onchange = function(e) {
        var theme = e.target.value;
        
        // Save to settings
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.theme = theme;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        
        // Apply theme
        document.body.classList.remove('theme-neon', 'theme-purple', 'theme-green', 'theme-red');
        document.body.classList.add('theme-' + theme);
        
        // Play sound
        playTestSound();
        
        console.log('🎨 Theme changed to:', theme);
    };
}
// ===== 8. Notification Toggle =====
function setupNotificationToggle() {
    var notifToggle = document.getElementById('notificationToggle');
    if (!notifToggle) return;

    // Load saved state
    var settings = localStorage.getItem('gameSettings');
    if (settings) {
        try {
            var parsed = JSON.parse(settings);
            notifToggle.checked = parsed.notifications === true;
        } catch(e) {}
    }

    notifToggle.onchange = function(e) {
        var isEnabled = e.target.checked;
        
        // Save to settings
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.notifications = isEnabled;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        
        // Show simple message instead of real notification
        if (isEnabled) {
            alert('🔔 Notifications: ON (Demo mode)');
        } else {
            alert('🔕 Notifications: OFF');
        }
        
        console.log('🔔 Notifications setting saved:', isEnabled);
    };
}
// ===== 9. Initialize all settings =====
function initSettings() {
    setupSoundToggle();
    setupVibrationToggle();
    setupVolumeControl();
    setupLanguageSelector();
    setupThemeSelector();
    setupNotificationToggle();
    
    // Load and apply saved language
    var settings = localStorage.getItem('gameSettings');
    if (settings) {
        try {
            var parsed = JSON.parse(settings);
            if (parsed.language) {
                currentLang = parsed.language;
                applyLanguage();
            }
            if (parsed.theme) {
                document.body.classList.add('theme-' + parsed.theme);
            }
        } catch(e) {}
    }
    
    console.log('✅ Settings initialized');
}
// Run when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initSettings, 500);
});


// ============================================
// VIBRATION MANAGER - REAL VIBRATION
// ============================================

var VibrationManager = {
    enabled: true,
    
    init: function() {
        // Load from settings
        var settings = localStorage.getItem('gameSettings');
        if (settings) {
            try {
                var parsed = JSON.parse(settings);
                this.enabled = parsed.vibration !== false;
            } catch(e) {}
        }
        
        // Listen to settings change
        var vibeToggle = document.getElementById('vibrationToggle');
        if (vibeToggle) {
            vibeToggle.addEventListener('change', function(e) {
                VibrationManager.enabled = e.target.checked;
                // Save to settings
                var settings = localStorage.getItem('gameSettings');
                if (settings) {
                    var parsed = JSON.parse(settings);
                    parsed.vibration = e.target.checked;
                    localStorage.setItem('gameSettings', JSON.stringify(parsed));
                }
            });
        }
        
        console.log('📳 Vibration Manager ready, enabled:', this.enabled);
    },
    
    // Short vibration (button click)
    click: function() {
        if (!this.enabled) return;
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    },
    
    // Win vibration
    win: function(intensity) {
        if (!this.enabled) return;
        if (navigator.vibrate) {
            if (intensity === 'big') {
                navigator.vibrate([100, 50, 100]);
            } else if (intensity === 'mega') {
                navigator.vibrate([200, 100, 200, 100, 200]);
            } else {
                navigator.vibrate(50);
            }
        }
    },
    
    // Jackpot vibration
    jackpot: function() {
        if (!this.enabled) return;
        if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500, 200, 1000]);
        }
    },
    
    // Long vibration (for big events)
    long: function(duration) {
        if (!this.enabled) return;
        if (navigator.vibrate) {
            navigator.vibrate(duration || 200);
        }
    },
    
    // Pattern vibration
    pattern: function(pattern) {
        if (!this.enabled) return;
        if (navigator.vibrate && pattern) {
            navigator.vibrate(pattern);
        }
    },
    
    // Stop vibration
    stop: function() {
        if (navigator.vibrate) {
            navigator.vibrate(0);
        }
    }
};

// Make global
window.VibrationManager = VibrationManager;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    VibrationManager.init();
});

// ===== ADD THIS AT THE END OF YOUR FILE =====

// Fix 1: Safe play sound function
window.safePlaySound = function() {
    try {
        if (window.SoundManager && SoundManager.allbuttonSound) {
            SoundManager.allbuttonSound();
        } else {
            var s = document.getElementById('allbuttonSound');
            if (s) { s.currentTime = 0; s.play().catch(function(){}); }
        }
    } catch(e) {}
};

// Fix 2: Make sure language selector uses correct variable
var originalLangSetup = setupLanguageSelector;
window.setupLanguageSelector = function() {
    var langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.onchange = function(e) {
            currentLanguage = e.target.value;
            var settings = localStorage.getItem('gameSettings') ? JSON.parse(localStorage.getItem('gameSettings')) : {};
            settings.language = currentLanguage;
            localStorage.setItem('gameSettings', JSON.stringify(settings));
            applyLanguage();
            safePlaySound();
        };
    }
};

// Fix 3: Sync Vibration with GameSettings
var originalVibeInit = VibrationManager.init;
VibrationManager.init = function() {
    var settings = localStorage.getItem('gameSettings');
    if (settings) {
        var parsed = JSON.parse(settings);
        this.enabled = parsed.vibration !== false;
    }
    var vibeToggle = document.getElementById('vibrationToggle');
    if (vibeToggle) {
        vibeToggle.addEventListener('change', function(e) {
            VibrationManager.enabled = e.target.checked;
            var settings = localStorage.getItem('gameSettings');
            if (settings) {
                var parsed = JSON.parse(settings);
                parsed.vibration = e.target.checked;
                localStorage.setItem('gameSettings', JSON.stringify(parsed));
            }
            if (e.target.checked && navigator.vibrate) navigator.vibrate(50);
        });
    }
    console.log('📳 Vibration Manager ready, enabled:', this.enabled);
};

console.log('✅ All fixes applied!');
