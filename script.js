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

