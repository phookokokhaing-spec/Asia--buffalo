

// ===== LOADING SCREEN LOGIC =====
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const startWrapper = document.getElementById('startWrapper');
    const loadingContainer = document.getElementById('loadingContainer');
    const loadingTip = document.getElementById('loadingTip');
    const loginScreen = document.getElementById('loginScreen');
    const gameContainer = document.getElementById('gameContainer');
    const loadingScreen = document.getElementById('loadingScreen');

    // Check if user already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // User already logged in - skip login screen
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'flex';
        updateUserUI(currentUser);
        if (typeof SoundManager !== 'undefined' && SoundManager.playBGM) {
            SoundManager.playBGM();
        }
        return;
    }

    // START button click
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            // 1. Full screen (with error handling)
            try {
                toggleFullScreen();
            } catch(e) {
                console.warn('Fullscreen error:', e);
            }

            // 2. Hide start button, show loading
            startWrapper.style.opacity = '0';
            setTimeout(() => {
                startWrapper.style.display = 'none';
                if (loadingContainer) loadingContainer.style.display = 'block';
                if (loadingTip) {
                    loadingTip.innerHTML = '<i class="fas fa-wifi"></i> Checking internet speed...';
                }

                // 3. Play loading sound (with safety check)
                if (typeof SoundManager !== 'undefined' && SoundManager.loading) {
                    SoundManager.loading(); // loading.mp3
                }

                // 4. Start loading process
                startInternetCheck();
            }, 500);
        });
    }
});

function toggleFullScreen() {
    try {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Fullscreen not allowed:', err.message);
            });
        }
    } catch (err) {
        console.warn('Fullscreen not supported');
    }
}

function startInternetCheck() {
    const step1 = document.getElementById('step1Container');
    const step2 = document.getElementById('step2Container');
    const internetProgress = document.getElementById('internetProgress');
    const gameProgress = document.getElementById('gameProgress');
    const speedInfo = document.getElementById('speedInfo');
    const loadingTip = document.getElementById('loadingTip');
    const loadingContainer = document.getElementById('loadingContainer');
    const loadingScreen = document.getElementById('loadingScreen');
    const loginScreen = document.getElementById('loginScreen');

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
        if (speedInfo) {
            speedInfo.innerHTML = `<i class="fas fa-tachometer-alt"></i> Speed: ~${speed} Mbps`;
        }

        const incrementTime = Math.max(150, Math.min(400, 400 - speed * 20));
        const stepAmount = Math.max(0.5, Math.min(3, speed / 10));

        const internetInterval = setInterval(() => {
            internetPercent += stepAmount;

            if (internetPercent >= 100) {
                internetPercent = 100;
                clearInterval(internetInterval);
                if (internetProgress) internetProgress.style.width = '100%';

                setTimeout(() => {
                    if (step1) {
                        step1.style.opacity = '0';
                        setTimeout(() => {
                            if (step1) step1.style.display = 'none';
                            if (step2) step2.style.display = 'block';
                            if (loadingTip) {
                                loadingTip.innerHTML = '<i class="fas fa-gamepad"></i> Loading game assets...';
                            }
                            startGameLoading();
                        }, 500);
                    }
                }, 800);
            }

            if (internetProgress) internetProgress.style.width = internetPercent + '%';
        }, incrementTime);
    });

    // ===== STEP 2: Game Loading =====
    function startGameLoading() {
        const gameInterval = setInterval(() => {
            gamePercent += Math.random() * 1.5 + 0.5;

            if (gamePercent >= 100) {
                gamePercent = 100;
                clearInterval(gameInterval);
                if (gameProgress) gameProgress.style.width = '100%';

                setTimeout(() => {
                    if (loadingScreen) loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        if (loadingScreen) loadingScreen.style.display = 'none';

                        // Show login screen instead of game
                        if (loginScreen) loginScreen.style.display = 'flex';

                        // Stop loading sound
                        if (typeof SoundManager !== 'undefined' && SoundManager.stop) {
                            SoundManager.stop('loadingSound');
                        }

                    }, 500);
                }, 800);
            }

            if (gameProgress) gameProgress.style.width = gamePercent + '%';
        }, 200);
    }

    // Update tips every 3 seconds
    let tipIndex = 0;
    setInterval(() => {
        if (loadingContainer && loadingContainer.style.display !== 'none' && loadingTip) {
            tipIndex = (tipIndex + 1) % tips.length;
            loadingTip.innerHTML = `<i class="fas fa-lightbulb"></i> ${tips[tipIndex]}`;
        }
    }, 3000);
}

    
