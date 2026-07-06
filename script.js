function startLobbyFeatures() {
            animateJackpots();
        }
    function animateJackpots() {
    // game card ပေါ်က badge တွေအတွက်
    const cardJackpots = [
        { id: 'jackpotMajor', base: 11026483, speed: 70, inc: () => Math.floor(Math.random() * 80) + 15 },
        { id: 'jackpotGrand', base: 15759157, speed: 100, inc: () => Math.floor(Math.random() * 120) + 25 },
        { id: 'jackpotMini', base: 1570008, speed: 90, inc: () => Math.floor(Math.random() * 50) + 10 },
        { id: 'jackpotMinor', base: 5229739, speed: 80, inc: () => Math.floor(Math.random() * 60) + 12 }
    ];
    
    cardJackpots.forEach(j => {
        let current = j.base;
        const el = document.getElementById(j.id);
        if(el) {
            setInterval(() => {
                current += j.inc();
                el.textContent = current.toLocaleString();
            }, j.speed * 10);
        }
    });

    // ရှိပြီးသား jackpot-tree (အောက်က အုပ်စု) ကိုလည်း update လုပ်ချင်ရင် ဆက်ထည့်ပါ
    const treeJackpots = [
        { id: 'jackpot1', base: 15759157, speed: 100 },
        { id: 'jackpot2', base: 5229739, speed: 80 },
        { id: 'jackpot3', base: 16587205, speed: 60 },
        { id: 'jackpot4', base: 11026483, speed: 70 }
    ];
    treeJackpots.forEach(j => {
        let current = j.base;
        const el = document.getElementById(j.id);
        if(el) {
            setInterval(() => {
                current += Math.floor(Math.random() * 100) + 10;
                el.textContent = current.toLocaleString();
            }, j.speed * 10);
        }
    });
}

// window load မှာ ခေါ်ပါ
window.addEventListener('DOMContentLoaded', () => {
    animateJackpots();
});
const winners = [
    'Player "MgMg" won 1,200,000 KS in African Buffalo! 🎰',
    'Player "ZawZaw" hit 800,000 KS in Grand Dragons! 💎',
    'Player "MgMyo" won 1,200,000 KS in African Buffalo! 🎰',
    'Player "WaiYanTun" hit 800,000 KS in Grand Dragons! 💎',
    'Player "Wai788" won 1,200,000 KS in African Buffalo! 🎰',
    'Player "MayHtetLu" hit 800,000 KS in Grand Dragons! 💎',
    'Player "NuNu" won 3,500,000 KS in Ultimate Fire Link! 🔥'
];

function updateTicker() {
    const ticker = document.getElementById('tickerText');
    let randomWinner = winners[Math.floor(Math.random() * winners.length)];
    ticker.innerText = "🎉 LATEST WINNERS: " + randomWinner + " | Good luck to everyone! 🍀";
}

// ၅ စက္ကန့်တိုင်း စာတန်းလေး ပြောင်းပေးမယ်
setInterval(updateTicker, 5000);

// Show Game Container (Slot Machine)
function showGameContainer() {
    const lobby = document.getElementById('lobbyScreen');
    const game = document.getElementById('gameContainer');
    

    if (lobby && game) {
        lobby.style.display = 'none';
        game.style.display = 'flex';
        
        // Optional: Initialize game if needed
        if (typeof initGame === 'function') {
            initGame();
        } else {
            console.log('Game container shown, but initGame not defined');
        }
    } else {
        console.error('Lobby or Game Container not found');
    }
}

// Hide Game Container (Back to Lobby)
function hideGameContainer() {
    const lobby = document.getElementById('lobbyScreen');
    const game = document.getElementById('gameContainer');
    
    if (lobby && game) {
        game.style.display = 'none';
        lobby.style.display = 'flex';
        
        // Optional: Stop game sounds or reset state if needed
        if (typeof stopGameAudio === 'function') {
            stopGameAudio();
        }
    } else {
        console.error('Lobby or Game Container not found');
    }
}

// ===== LOADING SCREEN LOGIC =====
document.addEventListener('copy', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}, false);

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ALL DOM ELEMENTS =====
    const startBtn = document.getElementById('startBtn');
    const startWrapper = document.getElementById('startWrapper');
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingScreen');
    const loginScreen = document.getElementById('loginScreen');
    const lobbyScreen = document.getElementById('lobbyScreen');
    
    // Fullscreen buttons
    const lobbyFullscreenBtn = document.getElementById('lobbyFullscreenBtn');
    const lobbyFullscreenIcon = document.getElementById('lobbyFullscreenIcon');
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    const fullscreenIcon = document.getElementById('fullscreenIcon');

    // ===== FULLSCREEN: LOBBY BUTTON =====
    if (lobbyFullscreenBtn) {
        lobbyFullscreenBtn.addEventListener('click', function() {
            try {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().then(() => {
                        if (lobbyFullscreenIcon) lobbyFullscreenIcon.className = 'fas fa-compress';
                    }).catch(() => {});
                } else {
                    document.exitFullscreen().then(() => {
                        if (lobbyFullscreenIcon) lobbyFullscreenIcon.className = 'fas fa-expand';
                    }).catch(() => {});
                }
            } catch(e) {
                console.warn('Fullscreen not supported');
            }
        });
    }

    // ===== FULLSCREEN: GAME BUTTON =====
    if (fullScreenBtn) {
        fullScreenBtn.addEventListener('click', function() {
            try {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().then(() => {
                        if (fullscreenIcon) fullscreenIcon.className = 'fas fa-compress';
                    }).catch(() => {});
                } else {
                    document.exitFullscreen().then(() => {
                        if (fullscreenIcon) fullscreenIcon.className = 'fas fa-expand';
                    }).catch(() => {});
                }
            } catch(e) {
                console.warn('Fullscreen not supported');
            }
        });
    }

    // ===== ESC / FULLSCREEN CHANGE LISTENER =====
    document.addEventListener('fullscreenchange', function() {
        if (lobbyFullscreenIcon) {
            lobbyFullscreenIcon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
        }
        if (fullscreenIcon) {
            fullscreenIcon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
        }
    });

    // ===== CHECK IF USER ALREADY LOGGED IN =====
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (lobbyScreen) lobbyScreen.style.display = 'flex';
        updateUserUI(currentUser);
        if (typeof SoundManager !== 'undefined' && SoundManager.playBGM) {
            SoundManager.playBGM();
        }
        return;
    }

    // ===== START BUTTON CLICK =====
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            // Full screen
            try {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                }
            } catch(e) {}

            // Hide start, show progress
            startWrapper.style.display = 'none';
            if (loadingBar) loadingBar.style.display = 'flex';

            // Play sound
            if (typeof SoundManager !== 'undefined' && SoundManager.loading) {
                SoundManager.loading();
            }

            // Start fast loading
            startFastLoading();
        });
    }
    
});


    // START button click
function startFastLoading() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const loadingScreen = document.getElementById('loadingScreen');
    const loginScreen = document.getElementById('loginScreen');

    let percent = 0;
    
    // Fast loading ~2 seconds
    const interval = setInterval(() => {
        percent += Math.random() * 6 + 4;
        
        if (percent >= 100) {
            percent = 100;
            clearInterval(interval);
        }
        
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = Math.floor(percent) + '%';
        
        // Complete
        if (percent >= 100) {
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        if (loginScreen) loginScreen.style.display = 'flex';
                        
                        if (typeof SoundManager !== 'undefined' && SoundManager.stop) {
                            SoundManager.stop('loadingSound');
                        }
                    }, 600);
                }
            }, 400);
        }
        
    }, 100);
}

