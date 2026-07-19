// ===== START / LOADING SCREEN =====
document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('startBtn');
    const startWrapper = document.getElementById('startWrapper');
    const loadingBar = document.getElementById('loadingBar');

    if (!startBtn) return;

    startBtn.addEventListener('click', async function () {
        // Fullscreen
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen({
                    navigationUI: 'hide'
                });
            }
        } catch (error) {
            console.warn('Fullscreen unavailable:', error);
        }

        // Start button ဖျောက်ပြီး progress bar ပြမယ်
        if (startWrapper) {
            startWrapper.style.display = 'none';
        }

        if (loadingBar) {
            loadingBar.style.display = 'flex';
        }

        // Loading sound
        if (
            typeof SoundManager !== 'undefined' &&
            typeof SoundManager.loading === 'function'
        ) {
            SoundManager.loading();
        }

        startFastLoading();
    });
});


// ===== FAST LOADING =====
function startFastLoading() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const loadingScreen = document.getElementById('loadingScreen');
    const loginScreen = document.getElementById('loginScreen');

    let percent = 0;

    const interval = setInterval(function () {
        percent += Math.random() * 6 + 4;
        percent = Math.min(percent, 100);

        if (progressFill) {
            progressFill.style.width = percent + '%';
        }

        if (progressText) {
            progressText.textContent = Math.floor(percent) + '%';
        }

        if (percent < 100) return;

        clearInterval(interval);

        setTimeout(function () {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';

                setTimeout(function () {
                    loadingScreen.style.display = 'none';

                    if (loginScreen) {
                        loginScreen.style.display = 'flex';
                    }
                }, 600);
            }

            if (
                typeof SoundManager !== 'undefined' &&
                typeof SoundManager.stop === 'function'
            ) {
                SoundManager.stop('loadingSound');
            }
        }, 400);

    }, 100);
}
