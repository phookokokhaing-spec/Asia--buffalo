

// ============================================
// MENU.JS - FIXED VERSION (CSS class-based modal)
// ============================================

// ===== 1. MODAL FUNCTIONS (FIXED) =====
// Use CSS class 'open' instead of display: none/flex for smooth transitions

window.openModal = function(id) {
    playButtonSound();
    var m = document.getElementById(id);
    if (m) {
        m.classList.add('open');
        document.body.style.overflow = 'hidden'; // prevent background scroll
    }
};

window.closeModal = function(id) {
    playButtonSound();
    var m = document.getElementById(id);
    if (m) {
        m.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.toggleModal = function(id) {
    playButtonSound();
    var m = document.getElementById(id);
    if (m) {
        if (m.classList.contains('open')) {
            m.classList.remove('open');
            document.body.style.overflow = '';
        } else {
            m.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }
};

// Specific modal functions
window.openSettingsModal = function() { window.openModal('settingsModal'); };
window.closeSettingsModal = function() { window.closeModal('settingsModal'); };
window.openHistoryModal = function() { window.openModal('historyModal'); };
window.closeHistoryModal = function() { window.closeModal('historyModal'); };
window.openMainMenu = function() { window.openModal('mainMenuModal'); };
window.closeMainMenu = function() { window.closeModal('mainMenuModal'); };
window.toggleMainMenu = function() { window.toggleModal('mainMenuModal'); };

// ===== CLOSE ON BACKDROP CLICK =====
window.onclick = function(event) {
    if (event.target.classList.contains('modal-glass')) {
        event.target.classList.remove('open');
        document.body.style.overflow = '';
    }
};

// ===== CLOSE ON ESCAPE KEY =====
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-glass.open').forEach(function(modal) {
            modal.classList.remove('open');
        });
        document.body.style.overflow = '';
    }
});


// ===== 2. SOUND FUNCTIONS =====
function playButtonSound() {
    var s = document.getElementById('allbuttonSound');
    if (s) { s.currentTime = 0; s.play().catch(function(){}); }
}
window.playButtonSound = playButtonSound;

function playTestSound() {
    var audio = document.getElementById('allbuttonSound');
    if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.5;
        audio.play().catch(function(e) {});
    }
}
window.playTestSound = playTestSound;

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


// ===== 3. GLOBAL TOP MANAGER (Firebase) =====
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

        var html = '';
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


// ===== 4. GAME SETTINGS =====
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


// ===== 5. GAME HISTORY =====
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


// ===== 6. HISTORY TABS =====
function initHistoryTabs() {
    var tabMy = document.getElementById('tabMyHistory');
    var tabGlobal = document.getElementById('tabGlobalTop');
    var panelMy = document.getElementById('myHistoryPanel');
    var panelGlobal = document.getElementById('globalTopPanel');

    if (!tabMy || !tabGlobal) return;

    tabMy.onclick = function() {
        tabMy.classList.add('active');
        tabGlobal.classList.remove('active');
        if (panelMy) panelMy.style.display = 'block';
        if (panelGlobal) panelGlobal.style.display = 'none';
    };

    tabGlobal.onclick = function() {
        tabGlobal.classList.add('active');
        tabMy.classList.remove('active');
        if (panelGlobal) panelGlobal.style.display = 'block';
        if (panelMy) panelMy.style.display = 'none';
        if (typeof GlobalTopManager !== 'undefined') GlobalTopManager.loadGlobalTop();
    };
}


// ===== 7. SETTINGS CONTROLS =====
function setupSoundToggle() {
    var soundToggle = document.getElementById('soundToggle');
    if (!soundToggle) return;

    soundToggle.onchange = function(e) {
        GameSettings.sound = e.target.checked;
        GameSettings.save();
        if (window.SoundManager) {
            if (!e.target.checked) {
                SoundManager.stopAll();
                SoundManager.isMuted = true;
            } else {
                SoundManager.isMuted = false;
            }
        }
        if (e.target.checked) playTestSound();
    };
}

function setupVibrationToggle() {
    var vibeToggle = document.getElementById('vibrationToggle');
    if (!vibeToggle) return;

    vibeToggle.onchange = function(e) {
        GameSettings.vibration = e.target.checked;
        GameSettings.save();
        if (e.target.checked && navigator.vibrate) navigator.vibrate(50);
    };
}

function setupVolumeControl() {
    var volumeSlider = document.getElementById('volumeSlider');
    if (!volumeSlider) return;

    volumeSlider.oninput = function(e) {
        GameSettings.volume = parseInt(e.target.value);
        GameSettings.save();
        if (window.SoundManager) SoundManager.setVolume(GameSettings.volume / 100);
    };
}

function setupLanguageSelector() {
    var langSelect = document.getElementById('languageSelect');
    if (!langSelect) return;

    langSelect.onchange = function(e) {
        GameSettings.language = e.target.value;
        GameSettings.save();
        applyLanguage();
        playTestSound();
    };
}

function setupThemeSelector() {
    var themeSelect = document.getElementById('themeSelect');
    if (!themeSelect) return;

    themeSelect.onchange = function(e) {
        GameSettings.theme = e.target.value;
        GameSettings.save();
        if (window.ThemeManager) ThemeManager.apply(e.target.value);
        playTestSound();
    };
}

function setupNotificationToggle() {
    var notifToggle = document.getElementById('notificationToggle');
    if (!notifToggle) return;

    notifToggle.onchange = function(e) {
        var isEnabled = e.target.checked;
        var settings = localStorage.getItem('gameSettings');
        var parsed = settings ? JSON.parse(settings) : {};
        parsed.notifications = isEnabled;
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
        console.log('🔔 Notifications:', isEnabled);
    };
}


// ===== 8. VIBRATION MANAGER =====
var VibrationManager = {
    enabled: true,

    init: function() {
        var settings = localStorage.getItem('gameSettings');
        if (settings) {
            try {
                var parsed = JSON.parse(settings);
                this.enabled = parsed.vibration !== false;
            } catch(e) {}
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
    },

    click: function() {
        if (!this.enabled) return;
        if (navigator.vibrate) navigator.vibrate(30);
    },

    win: function(intensity) {
        if (!this.enabled) return;
        if (navigator.vibrate) {
            if (intensity === 'big') navigator.vibrate([100, 50, 100]);
            else if (intensity === 'mega') navigator.vibrate([200, 100, 200, 100, 200]);
            else navigator.vibrate(50);
        }
    },

    jackpot: function() {
        if (!this.enabled) return;
        if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
    },

    long: function(duration) {
        if (!this.enabled) return;
        if (navigator.vibrate) navigator.vibrate(duration || 200);
    },

    pattern: function(pattern) {
        if (!this.enabled) return;
        if (navigator.vibrate && pattern) navigator.vibrate(pattern);
    },

    stop: function() {
        if (navigator.vibrate) navigator.vibrate(0);
    }
};
window.VibrationManager = VibrationManager;


// ===== 9. THEME MANAGER =====
var ThemeManager = {
    currentTheme: 'neon',
    themes: ['neon', 'purple', 'green', 'red'],

    colors: {
        neon: { primary: '#00d4ff', secondary: '#0099cc', accent: '#00ffff', glow: 'rgba(0, 212, 255, 0.3)', btnGrad1: '#00d4ff', btnGrad2: '#0099cc', btnShadow: '#006699' },
        purple: { primary: '#b300ff', secondary: '#8a00cc', accent: '#e0b3ff', glow: 'rgba(179, 0, 255, 0.3)', btnGrad1: '#b300ff', btnGrad2: '#8a00cc', btnShadow: '#5a0080' },
        green: { primary: '#00ff00', secondary: '#00cc00', accent: '#90ff90', glow: 'rgba(0, 255, 0, 0.3)', btnGrad1: '#00ff00', btnGrad2: '#00cc00', btnShadow: '#008800' },
        red: { primary: '#ff4444', secondary: '#cc0000', accent: '#ff8888', glow: 'rgba(255, 51, 51, 0.3)', btnGrad1: '#ff4444', btnGrad2: '#cc0000', btnShadow: '#880000' }
    },

    init: function() {
        var savedTheme = localStorage.getItem('selectedTheme');
        if (!savedTheme) {
            var settings = localStorage.getItem('gameSettings');
            if (settings) {
                try { savedTheme = JSON.parse(settings).theme; } catch(e) {}
            }
        }
        if (savedTheme && this.themes.includes(savedTheme)) this.currentTheme = savedTheme;
        this.apply(this.currentTheme);
    },

    apply: function(themeName) {
        this.currentTheme = themeName;
        document.body.classList.remove('theme-neon', 'theme-purple', 'theme-green', 'theme-red');
        document.body.classList.add('theme-' + themeName);
        console.log('🎨 Theme applied:', themeName);
    },

    getColor: function(colorName) {
        return this.colors[this.currentTheme][colorName];
    }
};
window.ThemeManager = ThemeManager;


// ===== 10. LANGUAGES =====
var currentLanguage = 'my';

var Languages = {
    my: {
        menu_title: "📋 မီနူး", deposit: "💰 ငွေသွင်း", withdraw: "🏦 ငွေထုတ်", settings: "⚙️ ဆက်တင်များ", history: "📜 မှတ်တမ်း", logout: "🚪 ထွက်မည်",
        settings_title: "⚙️ ဆက်တင်များ", sound_effects: "🔊 အသံအကျိုးသက်ရောက်မှု", vibration: "📳 တုန်ခါမှု", volume: "🔉 အသံအတိုးအကျယ်", language: "🌐 ဘာသာစကား", theme: "🎨 အပြင်အဆင်", notifications: "🔔 အသိပေးချက်များ", close: "ပိတ်မည်",
        history_title: "📜 မှတ်တမ်း", my_history: "👤 ကျွန်ုပ်၏မှတ်တမ်း", global_top: "🌍 ကမ္ဘာ့ထိပ်တန်း ၁၀", biggest_win: "အကြီးမားဆုံးအနိုင်", jackpot: "ဂျက်ပေါ့", mega_win: "မီဂါအနိုင်", super_win: "စူပါအနိုင်", big_win: "ဘစ်အနိုင်", last_played: "နောက်ဆုံးကစားချိန်", time: "အချိန်", bet: "လောင်းကြေး", win: "အနိုင်", result: "ရလဒ်",
        balance: "လက်ကျန်ငွေ", vip: "ဗွီအိုင်ပီ", win_text: "အနိုင်", spin: "လှည့်မည်", jackpot_text: "ဂျက်ပေါ့", win_streak: "အနိုင်အဆက်တန်း", hot_meter: "အပူချိန်", session_stats: "ကစားမှုစာရင်း", spins: "အလှည့်အရေအတွက်", wins: "အနိုင်အရေအတွက်", win_rate: "အနိုင်နှုန်း", bet_amount: "လောင်းကြေး", ways: "နည်းလမ်း", scatter: "စကက်တာ", menu: "မီနူး", chat: "စကားပြော", admin: "အက်ဒမင်"
    },
    en: {
        menu_title: "📋 MENU", deposit: "💰 Deposit", withdraw: "🏦 Withdraw", settings: "⚙️ Settings", history: "📜 History", logout: "🚪 Logout",
        settings_title: "⚙️ Settings", sound_effects: "🔊 Sound Effects", vibration: "📳 Vibration", volume: "🔉 Volume", language: "🌐 Language", theme: "🎨 Theme", notifications: "🔔 Notifications", close: "Close",
        history_title: "📜 History", my_history: "👤 My History", global_top: "🌍 Global Top 10", biggest_win: "Biggest Win", jackpot: "Jackpot", mega_win: "Mega Win", super_win: "Super Win", big_win: "Big Win", last_played: "Last Played", time: "Time", bet: "Bet", win: "Win", result: "Result",
        balance: "Balance", vip: "VIP", win_text: "WIN", spin: "SPIN", jackpot_text: "JACKPOT", win_streak: "Win Streak", hot_meter: "Hot Meter", session_stats: "Session Stats", spins: "Spins", wins: "Wins", win_rate: "Win Rate", bet_amount: "Bet", ways: "WAYS", scatter: "SCATTER", menu: "MENU", chat: "Chat", admin: "Admin"
    },
    th: {
        menu_title: "📋 เมนู", deposit: "💰 ฝากเงิน", withdraw: "🏦 ถอนเงิน", settings: "⚙️ การตั้งค่า", history: "📜 ประวัติ", logout: "🚪 ออกจากระบบ",
        settings_title: "⚙️ การตั้งค่า", sound_effects: "🔊 เสียงเอฟเฟกต์", vibration: "📳 การสั่น", volume: "🔉 ระดับเสียง", language: "🌐 ภาษา", theme: "🎨 ธีม", notifications: "🔔 การแจ้งเตือน", close: "ปิด",
        history_title: "📜 ประวัติ", my_history: "👤 ประวัติของฉัน", global_top: "🌍 ท็อป 10 โลก", biggest_win: "ชนะสูงสุด", jackpot: "แจ็คพอต", mega_win: "เมก้าวิน", super_win: "ซุปเปอร์วิน", big_win: "บิ๊กวิน", last_played: "เล่นล่าสุด", time: "เวลา", bet: "เดิมพัน", win: "ชนะ", result: "ผลลัพธ์",
        balance: "ยอดคงเหลือ", vip: "วีไอพี", win_text: "ชนะ", spin: "หมุน", jackpot_text: "แจ็คพอต", win_streak: "สตรีคชนะ", hot_meter: "มาตรวัดความร้อน", session_stats: "สถิติการเล่น", spins: "การหมุน", wins: "การชนะ", win_rate: "อัตราชนะ", bet_amount: "เดิมพัน", ways: "วิธี", scatter: "สแคตเตอร์", menu: "เมนู", chat: "แชท", admin: "ผู้ดูแล"
    }
};

function applyLanguage() {
    var lang = Languages[currentLanguage];
    if (!lang) return;

    // Settings modal
    var settingsTitle = document.querySelector('#settingsModal .modal-title');
    if (settingsTitle) settingsTitle.innerHTML = '◆ ' + lang.settings_title;

    var settingLabels = document.querySelectorAll('#settingsModal .setting-label');
    if (settingLabels.length >= 6) {
        settingLabels[0].innerHTML = lang.sound_effects;
        settingLabels[1].innerHTML = lang.vibration;
        settingLabels[2].innerHTML = lang.volume;
        settingLabels[3].innerHTML = lang.language;
        settingLabels[4].innerHTML = lang.theme;
        settingLabels[5].innerHTML = lang.notifications;
    }

    var closeBtn = document.querySelector('#settingsModal .neon-btn');
    if (closeBtn) closeBtn.innerHTML = lang.close;

    // History modal
    var historyTitle = document.querySelector('#historyModal .modal-title');
    if (historyTitle) historyTitle.innerHTML = '◆ ' + lang.history_title;

    var tabMy = document.getElementById('tabMyHistory');
    var tabGlobal = document.getElementById('tabGlobalTop');
    if (tabMy) tabMy.innerHTML = lang.my_history;
    if (tabGlobal) tabGlobal.innerHTML = lang.global_top;

    var statLabels = document.querySelectorAll('#myHistoryPanel .stat-label');
    if (statLabels.length >= 6) {
        statLabels[0].innerHTML = lang.biggest_win;
        statLabels[1].innerHTML = lang.jackpot;
        statLabels[2].innerHTML = lang.mega_win;
        statLabels[3].innerHTML = lang.super_win;
        statLabels[4].innerHTML = lang.big_win;
        statLabels[5].innerHTML = lang.last_played;
    }

    var tableHeaders = document.querySelectorAll('#historyTable thead th');
    if (tableHeaders.length >= 4) {
        tableHeaders[0].innerHTML = lang.time;
        tableHeaders[1].innerHTML = lang.bet;
        tableHeaders[2].innerHTML = lang.win;
        tableHeaders[3].innerHTML = lang.result;
    }

    console.log('✅ Language applied:', currentLanguage);
}
window.applyLanguage = applyLanguage;


// ===== 11. INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Menu.js loaded');

    initHistoryTabs();

    if (typeof GlobalTopManager !== 'undefined') GlobalTopManager.init();
    if (typeof GameSettings !== 'undefined') GameSettings.load();
    if (typeof GameHistory !== 'undefined') GameHistory.updateUI();
    if (typeof ThemeManager !== 'undefined') ThemeManager.init();
    if (typeof VibrationManager !== 'undefined') VibrationManager.init();

    setupSoundToggle();
    setupVibrationToggle();
    setupVolumeControl();
    setupLanguageSelector();
    setupThemeSelector();
    setupNotificationToggle();

    // Apply saved language
    var settings = localStorage.getItem('gameSettings');
    if (settings) {
        try {
            var parsed = JSON.parse(settings);
            if (parsed.language) {
                currentLanguage = parsed.language;
                applyLanguage();
            }
        } catch(e) {}
    }

    // Logout button
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            playButtonSound();
            if (confirm('ထွက်မှာသေချာပါသလား?')) {
                localStorage.clear();
                window.location.reload();
            }
        };
    }
});

console.log('✅ Menu.js ready!');
