const SoundManager = (function() {
    // ===== Private variables =====
    let soundEnabled = true;
    let bgmPlaying = false;
    let initialized = false;

    // ===== Sound Config (Matching your HTML IDs) =====
    const soundConfig = {
        // BGM
        bgm: { src: 'sounds/bg_background.mp3', volume: 0.3, loop: true },

        // UI Sounds
        loadingSound: { src: 'sounds/loading.mp3', volume: 0.3, loop: false },
        allbuttonSound: { src: 'sounds/allbutton.mp3', volume: 0.3, loop: false },
        clickSound: { src: 'sounds/click.mp3', volume: 0.3, loop: false },
        popbuttonSound: { src: 'sounds/popbutton.mp3', volume: 0.4, loop: false },
        backSound: { src: 'sounds/back.mp3', volume: 0.3, loop: false },

        // Game Sounds
        spinSound: { src: 'sounds/spin.mp3', volume: 0.4, loop: false },
        winlineSound: { src: 'sounds/winline.mp3', volume: 0.5, loop: false },
        nowinSound: { src: 'sounds/nowin.mp3', volume: 0.4, loop: false },

        // Animal Sounds
        buffaloSound: { src: 'sounds/buffalo.mp3', volume: 0.5, loop: false },
        lionSound: { src: 'sounds/lion.mp3', volume: 0.4, loop: false },

        // Coin & Jackpot
        coinSound: { src: 'sounds/coin.mp3', volume: 0.4, loop: false },
        coinrainSound: { src: 'sounds/coinrain.mp3', volume: 0.5, loop: false },
        sixcoinSound: { src: 'sounds/sixcoin.mp3', volume: 0.6, loop: false },
        jackpotSpinSound: { src: 'sounds/jackpotspin.mp3', volume: 0.7, loop: false },
        
        // ===== JACKPOT ANIMATION SOUNDS (ထပ်ထည့်ထားတယ်) =====
        jackpot_ding: { src: 'sounds/jackpot_ding.mp3', volume: 0.6, loop: false },
        jackpot_fanfare: { src: 'sounds/jackpot_fanfare.mp3', volume: 0.8, loop: false },
        coin_drop: { src: 'sounds/coin_drop.mp3', volume: 0.5, loop: false },
        firework: { src: 'sounds/firework.mp3', volume: 0.7, loop: false },
        sparkle: { src: 'sounds/sparkle.mp3', volume: 0.4, loop: false },
        drum_hit: { src: 'sounds/drum_hit.mp3', volume: 0.6, loop: false },
        tick: { src: 'sounds/tick.mp3', volume: 0.3, loop: false },
        
        // Old jackpot (keep for compatibility)
        jackpotSound: { src: 'sounds/jackpot.mp3', volume: 0.8, loop: false },
        
        // Victory & Congratulations
        victorySound: { src: 'sounds/victory.mp3', volume: 0.7, loop: false },
        congratulationsSound: { src: 'sounds/congratulations.mp3', volume: 0.6, loop: false },
        congratsSound: { src: 'sounds/congrats.mp3', volume: 0.6, loop: false },

        // Notification
        notiSound: { src: 'sounds/noti.mp3', volume: 0.4, loop: false },
        notificationSound: { src: 'sounds/notification.mp3', volume: 0.4, loop: false },

        // Admin & Payment
        adminSound: { src: 'sounds/admin.mp3', volume: 0.5, loop: false },
        paymentreseiveSound: { src: 'sounds/paymentreseive.mp3', volume: 0.6, loop: false },
        withdrawSound: { src: 'sounds/withdraw.mp3', volume: 0.5, loop: false }
    };

    // ===== Audio cache =====
    const audioCache = {};

    // ===== Initialize all sounds =====
    function init() {
        if (initialized) return;

        console.log('🎵 Initializing Sound Manager...');

        // Load all sounds from config
        Object.keys(soundConfig).forEach(key => {
            const config = soundConfig[key];
            const audio = document.getElementById(key);

            if (audio) {
                // Clear existing sources
                while (audio.firstChild) {
                    audio.removeChild(audio.firstChild);
                }

                // Add source
                const source = document.createElement('source');
                source.src = config.src;
                source.type = 'audio/mpeg';
                audio.appendChild(source);

                audio.volume = config.volume;
                audio.loop = config.loop || false;

                // Cache the audio element
                audioCache[key] = audio;
            } else {
                console.warn(`⚠️ Audio element "${key}" not found in HTML`);
            }
        });

        initialized = true;
        console.log('✅ Sound Manager ready');
    }

    // ===== Play sound =====
    function play(soundId) {
        if (!soundEnabled) return Promise.resolve();

        if (!initialized) init();

        const audio = audioCache[soundId] || document.getElementById(soundId);
        if (!audio) {
            console.warn(`⚠️ Sound "${soundId}" not found`);
            return Promise.reject('Sound not found');
        }

        audio.muted = false;
        audio.currentTime = 0;

        return audio.play().catch(e => {
            console.log(`🔇 Sound play failed: ${soundId}`, e.message);
            return Promise.reject(e);
        });
    }

    // ===== Stop sound =====
    function stop(soundId) {
        const audio = audioCache[soundId] || document.getElementById(soundId);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // ===== Play BGM =====
    function playBGM() {
        if (!soundEnabled) return;

        play('bgm').then(() => {
            bgmPlaying = true;
            console.log('🎵 BGM started');
        }).catch(() => {
            console.log('🔇 BGM autoplay blocked');
        });
    }

    // ===== Stop BGM =====
    function stopBGM() {
        const bgm = audioCache['bgm'] || document.getElementById('bgm');
        if (bgm) {
            bgm.pause();
            bgm.currentTime = 0;
            bgmPlaying = false;
        }
    }

    // ===== Toggle sound =====
    function toggle() {
        soundEnabled = !soundEnabled;

        if (!soundEnabled) {
            Object.values(audioCache).forEach(audio => {
                if (audio && !audio.paused) {
                    audio.pause();
                }
            });
            bgmPlaying = false;
        } else {
            if (bgmPlaying) {
                playBGM();
            }
        }

        updateSoundButton();
        console.log(`🔊 Sound ${soundEnabled ? 'ON' : 'OFF'}`);
        return soundEnabled;
    }

    // ===== Update sound button =====
    function updateSoundButton() {
        const btn = document.getElementById('soundToggleBtn');
        if (btn) {
            btn.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        }
    }

    // ===== Set volume =====
    function setVolume(soundId, volume) {
        const audio = audioCache[soundId] || document.getElementById(soundId);
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    // ===== Master volume =====
    function setMasterVolume(volume) {
        Object.values(audioCache).forEach(audio => {
            if (audio) {
                const originalVol = soundConfig[audio.id]?.volume || 0.5;
                audio.volume = originalVol * volume;
            }
        });
    }

    // ===== Stop all =====
    function stopAll() {
        Object.values(audioCache).forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        bgmPlaying = false;
    }

    // ===== Preload all =====
    function preloadAll() {
        Object.values(audioCache).forEach(audio => {
            if (audio) {
                audio.load();
            }
        });
        console.log('📦 All sounds preloaded');
    }

    // ===== Check if enabled =====
    function isEnabled() {
        return soundEnabled;
    }

    // ===== Public API =====
    return {
        // Core
        play,
        stop,

        // BGM
        playBGM,
        stopBGM,

        // Master control
        toggle,
        setVolume,
        setMasterVolume,
        stopAll,
        preloadAll,
        isEnabled,

        // UI Sounds
        button: () => play('allbuttonSound'),
        click: () => play('clickSound'),
        pop: () => play('popbuttonSound'),
        back: () => play('backSound'),

        // Game Sounds
        spin: () => play('spinSound'),
        win: () => play('winlineSound'),
        nowin: () => play('nowinSound'),

        // Animal Sounds
        buffalo: () => play('buffaloSound'),
        lion: () => play('lionSound'),

        // Coin & Jackpot
        coin: () => play('coinSound'),
        coinRain: () => play('coinrainSound'),
        sixCoin: () => play('sixcoinSound'),
        jackpotSpin: () => play('jackpotSpinSound'),
        jackpot: () => play('jackpotSound'),
        
        // ===== JACKPOT ANIMATION SOUNDS =====
        jackpot_ding: () => play('jackpot_ding'),
        jackpot_fanfare: () => play('jackpot_fanfare'),
        coin_drop: () => play('coin_drop'),
        firework: () => play('firework'),
        sparkle: () => play('sparkle'),
        drum_hit: () => play('drum_hit'),
        tick: () => play('tick'),

        // Victory
        victory: () => play('victorySound'),
        congratulations: () => play('congratulationsSound'),
        congrats: () => play('congratsSound'),

        // Notification
        noti: () => play('notiSound'),
        notification: () => play('notificationSound'),

        // Admin & Payment
        admin: () => play('adminSound'),
        payment: () => play('paymentreseiveSound'),
        withdraw: () => play('withdrawSound'),

        // Loading
        loading: () => play('loadingSound')
    };
})();

// ===== Make global =====
window.SoundManager = SoundManager;
