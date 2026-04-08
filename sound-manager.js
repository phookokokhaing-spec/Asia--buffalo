// ========== SOUND MANAGER - COMPLETE VERSION ==========

const SoundManager = (function() {
    // ===== Private variables =====
    let soundEnabled = true;
    let bgmPlaying = false;
    let initialized = false;
    
    // ===== Sound Config (ALL SOUNDS INCLUDED) =====
    const soundConfig = {
        // BGM
        bgm: { src: 'sounds/bg_background.mp3', volume: 0.3, loop: true },
        
        // Game sounds
        loadingSound: { src: 'sounds/loading.mp3', volume: 0.4, loop: false },
        allbuttonSound: { src: 'sounds/allbutton.mp3', volume: 0.3, loop: false },
        clickSound: { src: 'sounds/click.mp3', volume: 0.3, loop: false },
        popbuttonSound: { src: 'sounds/popbutton.mp3', volume: 0.35, loop: false },
        
        // Spin & Win
        spinSound: { src: 'sounds/spin.mp3', volume: 0.4, loop: false },
        winlineSound: { src: 'sounds/winline.mp3', volume: 0.5, loop: false },
        nowinSound: { src: 'sounds/nowin.mp3', volume: 0.7, loop: false },
        
        // Animal sounds
        buffaloSound: { src: 'sounds/buffalo.mp3', volume: 0.5, loop: false },
        lionSound: { src: 'sounds/lion.mp3', volume: 0.5, loop: false },
        boomSound: { src: 'sounds/boom.mp3', volume: 0.5, loop: false },
        // Coin & Money
        coinSound: { src: 'sounds/coin.mp3', volume: 0.4, loop: false },
        coinrainSound: { src: 'sounds/coinrain.mp3', volume: 0.5, loop: false },
        sixcoinSound: { src: 'sounds/coin.mp3', volume: 0.6, loop: false },
        
        // Jackpot
        jackpotspinSound: { src: 'sounds/jackpotspin.mp3', volume: 0.5, loop: false },
        jackpotSound: { src: 'sounds/jackpot.mp3', volume: 0.7, loop: false },
        
        // Congratulations & Victory
        congratulationsSound: { src: 'sounds/congratulations.mp3', volume: 0.6, loop: false },
        congratsSound: { src: 'sounds/congrats.mp3', volume: 0.6, loop: false },
        victorySound: { src: 'sounds/victory.mp3', volume: 0.7, loop: false },
       babaSound: { src: 'sounds/baba.mp3', volume: 0.6, loop: false },
        
        // Notifications
        notiSound: { src: 'sounds/noti.mp3', volume: 0.4, loop: false },
        notificationSound: { src: 'sounds/notification.mp3', volume: 0.4, loop: false },
       wheelSound: { src: 'sounds/wheel.mp3', volume: 0.7, loop: false },
        
        // Admin & Payment
        adminSound: { src: 'sounds/admin.mp3', volume: 0.5, loop: false },
        paymentreseiveSound: { src: 'sounds/paymentreseive.mp3', volume: 0.7, loop: false },
        withdrawSound: { src: 'sounds/withdraw.mp3', volume: 0.5, loop: false },
        
        // Box & Surprise
        thankyouboxSound: { src: 'sounds/thankyoubox.mp3', volume: 0.4, loop: false },
        coinboxSound: { src: 'sounds/coinbox.mp3', volume: 0.5, loop: false },
        boxbgSound: { src: 'sounds/boxbg.mp3', volume: 0.3, loop: true },
        
        // Additional (for compatibility)
        revealSound: { src: 'sounds/reveal.mp3', volume: 0.4, loop: false },
        fanfareSound: { src: 'sounds/fanfare.mp3', volume: 0.5, loop: false },
        chimeSound: { src: 'sounds/chime.mp3', volume: 0.3, loop: false },
        errorSound: { src: 'sounds/error.mp3', volume: 0.3, loop: false }
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
        console.log('✅ Sound Manager ready with', Object.keys(audioCache).length, 'sounds');
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
        
        // Remove muted
        audio.muted = false;
        
        // Reset and play
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
    
    // ===== Play BGM (special handling) =====
    function playBGM() {
        if (!soundEnabled) return;
        
        play('bgm').then(() => {
            bgmPlaying = true;
            console.log('🎵 BGM started');
        }).catch(() => {
            console.log('🔇 BGM autoplay blocked');
        });
    }
    
    // ===== Play Box BGM (different background) =====
    function playBoxBGM() {
        if (!soundEnabled) return;
        
        play('boxbgSound').then(() => {
            console.log('🎵 Box BGM started');
        }).catch(() => {
            console.log('🔇 Box BGM autoplay blocked');
        });
    }
    
    // ===== Stop BGM =====
    function stopBGM() {
        const bgm = audioCache['bgm'] || document.getElementById('bgm');
        if (bgm) {
            bgm.pause();
            bgm.currentTime = 0;
        }
        const boxbg = audioCache['boxbgSound'] || document.getElementById('boxbgSound');
        if (boxbg) {
            boxbg.pause();
            boxbg.currentTime = 0;
        }
        bgmPlaying = false;
    }
    
    // ===== Toggle sound on/off =====
    function toggle() {
        soundEnabled = !soundEnabled;
        
        if (!soundEnabled) {
            // Pause all sounds
            Object.values(audioCache).forEach(audio => {
                if (audio && !audio.paused) {
                    audio.pause();
                }
            });
            bgmPlaying = false;
        } else {
            // Resume BGM if it was playing
            if (bgmPlaying) {
                playBGM();
            }
        }
        
        // Update UI button
        updateSoundButton();
        
        console.log(`🔊 Sound ${soundEnabled ? 'ON' : 'OFF'}`);
        return soundEnabled;
    }
    
    // ===== Update sound toggle button =====
    function updateSoundButton() {
        const btn = document.getElementById('soundToggleBtn');
        if (btn) {
            btn.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        }
    }
    
    // ===== Set volume for specific sound =====
    function setVolume(soundId, volume) {
        const audio = audioCache[soundId] || document.getElementById(soundId);
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
        }
    }
    
    // ===== Master volume control =====
    function setMasterVolume(volume) {
        Object.values(audioCache).forEach(audio => {
            if (audio) {
                const originalVol = soundConfig[audio.id]?.volume || 0.5;
                audio.volume = originalVol * volume;
            }
        });
    }
    
    // ===== Stop all sounds =====
    function stopAll() {
        Object.values(audioCache).forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        bgmPlaying = false;
    }
    
    // ===== Preload all sounds =====
    function preloadAll() {
        Object.values(audioCache).forEach(audio => {
            if (audio) {
                audio.load();
            }
        });
        console.log('📦 All sounds preloaded');
    }
    
    // ===== Check if sound is enabled =====
    function isEnabled() {
        return soundEnabled;
    }
    
    // ===== Play with retry =====
    function playWithRetry(soundId, maxAttempts = 3) {
        let attempts = 0;
        const attempt = () => {
            return play(soundId).catch(e => {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`🔄 Retry ${soundId} (${attempts}/${maxAttempts})`);
                    return new Promise(resolve => setTimeout(resolve, 100)).then(attempt);
                }
                return Promise.reject(e);
            });
        };
        return attempt();
    }
    
    // ===== Shortcut methods for specific sounds =====
        // ===== Shortcut methods for specific sounds =====
    const shortcuts = {
        // Basic
        button: function() { return play('allbuttonSound'); },
        click: function() { return play('clickSound'); },
        pop: function() { return play('popbuttonSound'); },

        // Spin & Win
        spin: function() { return play('spinSound'); },
        win: function() { return play('winlineSound'); },
        nowin: function() { return play('nowinSound'); },
        victory: function() { return play('victorySound'); },

        // Animals
        buffalo: function() { return play('buffaloSound'); },
        lion: function() { return play('lionSound'); },
        boom: function() { return play('boomSound'); }, // 🔥 ဒီနေရာကို သေချာစစ်ပါ

        // Coin
        coin: function() { return play('coinSound'); },
        coinRain: function() { return play('coinrainSound'); },
        sixCoin: function() { return play('sixcoinSound'); },

        // Jackpot
        jackpotSpin: function() { return play('jackpotspinSound'); },
        jackpot: function() { return play('jackpotSound'); },
        baba: function() { return play('babaSound'); },
        wheel: function() { return play('wheelSound'); },

        // Congrats
        congratulations: function() { return play('congratulationsSound'); },
        congrats: function() { return play('congratsSound'); },

        // Notifications
        noti: function() { return play('notiSound'); },
        notification: function() { return play('notificationSound'); }
    };

    // ===== Public API =====
    const api = {
        init: init,
        play: play,
        stop: stop,
        playWithRetry: playWithRetry,
        playBGM: playBGM,
        playBoxBGM: playBoxBGM,
        stopBGM: stopBGM,
        toggle: toggle,
        setVolume: setVolume,
        setMasterVolume: setMasterVolume,
        stopAll: stopAll,
        preloadAll: preloadAll,
        isEnabled: isEnabled,
        updateSoundButton: updateSoundButton
    };

    // Shortcut အားလုံးကို api ထဲ အသေအချာ ပေါင်းထည့်မယ်
    Object.keys(shortcuts).forEach(function(key) {
        api[key] = shortcuts[key];
    });

    return api;
})(); // SoundManager အပိတ်

// SoundManager အပြင်ဘက်ကနေ boom ကို အတင်းထည့်ပေးမယ်
if (window.SoundManager) {
    window.SoundManager.boom = function() {
        return this.play('boomSound');
    };
    console.log("🚀 Boom function manually injected into SoundManager!");
}

// ===== Make it global =====
window.SoundManager = SoundManager;

// ===== Auto-initialize on page load =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sound manager after a short delay
    setTimeout(() => {
        SoundManager.init();
        console.log('🎵 Sound Manager auto-initialized');
    }, 100);
});
