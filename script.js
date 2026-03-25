


// ===== LOADING SCREEN LOGIC =====
  document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const startWrapper = document.getElementById('startWrapper');
    const loadingContainer = document.getElementById('loadingContainer');
    const loadingTip = document.getElementById('loadingTip');
    const loginScreen = document.getElementById('loginScreen');
    const gameContainer = document.getElementById('gameContainer');

    // Check if user already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // User already logged in - skip login screen
        document.getElementById('loadingScreen').style.display = 'none';
        gameContainer.style.display = 'flex';
        updateUserUI(currentUser);
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playBGM();
        }
        return;
    }

    // START button click
    startBtn.addEventListener('click', function() {
        // 1. Full screen
        toggleFullScreen();
        
        // 2. Hide start button, show loading
        startWrapper.style.opacity = '0';
        setTimeout(() => {
            startWrapper.style.display = 'none';
            loadingContainer.style.display = 'block';
            loadingTip.innerHTML = '<i class="fas fa-wifi"></i> Checking internet speed...';
            
            // 3. Play loading sound
            if (typeof SoundManager !== 'undefined') {
                SoundManager.loading(); // loading.mp3
            }
            
            // 4. Start loading process
            startInternetCheck();
        }, 500);
    });
});

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
}

function startInternetCheck() {
    const step1 = document.getElementById('step1Container');
    const step2 = document.getElementById('step2Container');
    const internetProgress = document.getElementById('internetProgress');
    const gameProgress = document.getElementById('gameProgress');
    const speedInfo = document.getElementById('speedInfo');
    const loadingTip = document.getElementById('loadingTip');

    let internetPercent = 0;
    let gamePercent = 0;

    // Tips array
    const tips = [
        "Checking your internet speed...",
        "အင်တာနက်အမြန်နှုန်း စစ်ဆေးနေပါသည်။",
        "Loading game assets...",
        "ဂိမ်းဖိုင်များကို ဆွဲတင်နေပါသည်။"
    ];

    // ===== STEP 1: Internet Speed Check =====
    function checkInternetSpeed() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const image = new Image();
            image.src = 'images/splash_bg.png?t=' + startTime;

            image.onload = function() {
                const endTime = Date.now();
                const duration = endTime - startTime;
                const speed = Math.floor(1000 / duration);
                resolve({ duration, speed });
            };

            image.onerror = function() {
                resolve({ duration: 500, speed: 2 });
            };
        });
    }

    checkInternetSpeed().then(({ duration, speed }) => {
        speedInfo.innerHTML = `<i class="fas fa-tachometer-alt"></i> Speed: ~${speed} Mbps`;

        const incrementTime = Math.max(150, Math.min(400, 400 - speed * 20));
        const stepAmount = Math.max(0.5, Math.min(3, speed / 10));

        const internetInterval = setInterval(() => {
            internetPercent += stepAmount;
            
            if (internetPercent >= 100) {
                internetPercent = 100;
                clearInterval(internetInterval);
                internetProgress.style.width = '100%';

                setTimeout(() => {
                    step1.style.opacity = '0';
                    setTimeout(() => {
                        step1.style.display = 'none';
                        step2.style.display = 'block';
                        loadingTip.innerHTML = '<i class="fas fa-gamepad"></i> Loading game assets...';
                        startGameLoading();
                    }, 500);
                }, 800);
            }
            
            internetProgress.style.width = internetPercent + '%';
        }, incrementTime);
    });

    // ===== STEP 2: Game Loading =====
    function startGameLoading() {
        const gameInterval = setInterval(() => {
            gamePercent += Math.random() * 1.5 + 0.5;
            
            if (gamePercent >= 100) {
                gamePercent = 100;
                clearInterval(gameInterval);
                gameProgress.style.width = '100%';

                setTimeout(() => {
                    document.getElementById('loadingScreen').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('loadingScreen').style.display = 'none';
                        
                        // Show login screen instead of game
                        document.getElementById('loginScreen').style.display = 'flex';
                        
                        // Stop loading sound
                        if (typeof SoundManager !== 'undefined') {
                            SoundManager.stop('loadingSound');
                        }
                        
                    }, 500);
                }, 800);
            }
            
            gameProgress.style.width = gamePercent + '%';
        }, 200);
    }

    // Update tips every 3 seconds
    let tipIndex = 0;
    setInterval(() => {
        if (loadingContainer.style.display !== 'none') {
            tipIndex = (tipIndex + 1) % tips.length;
            loadingTip.innerHTML = `<i class="fas fa-lightbulb"></i> ${tips[tipIndex]}`;
        }
    }, 3000);
}


 // ============================================
// SETTINGS MENU (FIXED)
// ============================================

// ============================================
// SETTINGS (SIMPLE & STABLE)
// ============================================
let settingsPanel = null;

function openSettings() {
    playButtonSound();
    
    // Main menu ရှိရင်ပိတ် (ဒါပေမယ့် panel ကို မထိ)
    if (typeof closeMainMenu === 'function') {
        closeMainMenu();
    }
    
    // Panel ရှိပြီးသားဆိုရင် ဖျက်
    if (settingsPanel) {
        settingsPanel.remove();
        settingsPanel = null;
        return;
    }
    
    // Panel ဖန်တီး
    settingsPanel = document.createElement('div');
    settingsPanel.id = 'settings-panel';
    settingsPanel.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #0a0a2a;
            border: 3px solid gold;
            border-radius: 25px;
            padding: 30px;
            z-index: 999999;
            min-width: 280px;
            text-align: center;
            box-shadow: 0 0 50px rgba(255,215,0,0.5);
        ">
            <h2 style="color: gold; margin: 0 0 20px 0;">⚙️ SETTINGS</h2>
            <div style="margin: 15px 0;">
                <label style="color: white; font-size: 18px; display: flex; justify-content: space-between;">
                    <span>🔊 Sound</span>
                    <input type="checkbox" id="sound-setting" ${SoundManager?.isEnabled?.() !== false ? 'checked' : ''} style="width: 20px; height: 20px;">
                </label>
            </div>
            <div style="margin: 15px 0;">
                <label style="color: white; font-size: 18px; display: flex; justify-content: space-between;">
                    <span>🎵 Music</span>
                    <input type="checkbox" id="music-setting" checked style="width: 20px; height: 20px;">
                </label>
            </div>
            <button id="close-setting" style="
                background: gold;
                border: none;
                padding: 10px 30px;
                border-radius: 30px;
                color: #1a1a2e;
                font-weight: bold;
                font-size: 16px;
                margin-top: 20px;
                cursor: pointer;
            ">CLOSE</button>
        </div>
    `;
    
    document.body.appendChild(settingsPanel);
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-setting');
    if (soundToggle && SoundManager) {
        soundToggle.onclick = (e) => {
            e.stopPropagation();
            if (soundToggle.checked) {
                if (SoundManager.toggle) SoundManager.toggle(true);
            } else {
                if (SoundManager.toggle) SoundManager.toggle(false);
            }
        };
    }
    
    // Close button
    const closeBtn = document.getElementById('close-setting');
    if (closeBtn) {
        closeBtn.onclick = () => {
            settingsPanel.remove();
            settingsPanel = null;
            playButtonSound();
        };
    }
}

// ============================================
// HISTORY (SIMPLE & STABLE)
// ============================================
let historyPanel = null;

function openHistory() {
    playButtonSound();
    
    if (typeof closeMainMenu === 'function') {
        closeMainMenu();
    }
    
    if (historyPanel) {
        historyPanel.remove();
        historyPanel = null;
        return;
    }
    
    const wins = window.gameState?.winHistory || [];
    
    let winsHtml = '';
    if (wins.length === 0) {
        winsHtml = '<div style="color: #888; padding: 20px;">✨ No wins yet ✨</div>';
    } else {
        winsHtml = '<table style="width: 100%; color: white; border-collapse: collapse;">';
        winsHtml += '<tr style="border-bottom: 1px solid gold;"><th>Amount</th><th>Type</th><th>Time</th></tr>';
        wins.slice(0, 15).forEach(w => {
            let type = w.type || 'WIN';
            if (w.percentage >= 1500) type = 'MEGA';
            else if (w.percentage >= 1000) type = 'SUPER';
            else if (w.percentage >= 500) type = 'BIG';
            winsHtml += `<tr><td style="padding: 5px; color: gold;">${(w.amount || 0).toLocaleString()} KS</td><td>${type}</td><td style="font-size: 11px;">${w.time || w.timestamp || '—'}</td></tr>`;
        });
        winsHtml += '</table>';
    }
    
    historyPanel = document.createElement('div');
    historyPanel.id = 'history-panel';
    historyPanel.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #0a0a2a;
            border: 3px solid gold;
            border-radius: 25px;
            padding: 20px;
            z-index: 999999;
            min-width: 350px;
            max-width: 450px;
            max-height: 80vh;
            overflow-y: auto;
            text-align: center;
            box-shadow: 0 0 50px rgba(255,215,0,0.5);
        ">
            <h2 style="color: gold; margin: 0 0 15px 0;">📜 HISTORY</h2>
            ${winsHtml}
            <button id="close-history" style="
                background: gold;
                border: none;
                padding: 8px 25px;
                border-radius: 30px;
                color: #1a1a2e;
                font-weight: bold;
                margin-top: 15px;
                cursor: pointer;
            ">CLOSE</button>
        </div>
    `;
    
    document.body.appendChild(historyPanel);
    
    const closeBtn = document.getElementById('close-history');
    if (closeBtn) {
        closeBtn.onclick = () => {
            historyPanel.remove();
            historyPanel = null;
            playButtonSound();
        };
    }
}

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
