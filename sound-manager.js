// ========== SOUND MANAGER - COMPLETE VERSION ==========

const SoundManager = (function() {
    // ===== Private variables =====
    let soundEnabled = true;
    let bgmPlaying = false;
    let initialized = false;
    
    // ===== Sound ====
    const soundConfig = {
        bgm: { src: 'sounds/bg_background.mp3', volume: 0.3, loop: true },
        loadingSound: { src: 'sounds/loading.mp3', volume: 0.4, loop: false },
        allbuttonSound: { src: 'sounds/allbutton.mp3', volume: 0.3 },
        spinSound: { src: 'sounds/spin.mp3', volume: 0.4 },
        winlineSound: { src: 'sounds/winline.mp3', volume: 0.5 },
        buffaloSound: { src: 'sounds/buffalo.mp3', volume: 0.5 },
        coinSound: { src: 'sounds/coin.mp3', volume: 0.4 },
        sixcoinSound: { src: 'sounds/coin.mp3', volume: 0.6 },
        nowinSound: { src: 'sounds/nowin.mp3', volume: 0.7 },
        congratulationsSound: { src: 'sounds/congratulations.mp3', volume: 0.6 },
        notiSound: { src: 'sounds/noti.mp3', volume: 0.4 },
        victorySound: { src: 'sounds/victory.mp3', volume: 0.7 },
        adminSound: { src: 'sounds/admin.mp3', volume: 0.5 },
        paymentreseiveSound: { src: 'sounds/paymentreseive.mp3', volume: 0.7 }
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
    
    // ===== Stop BGM =====
    function stopBGM() {
        const bgm = audioCache['bgm'] || document.getElementById('bgm');
        if (bgm) {
            bgm.pause();
            bgm.currentTime = 0;
            bgmPlaying = false;
        }
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
    
    // ===== Public API =====
    return {
        // Core functions
        play,
        stop,
        playWithRetry: function(soundId, maxAttempts = 3) {
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
        },
        
        // BGM control
        playBGM,
        stopBGM,
        
        // Master control
        toggle,
        setVolume,
        setMasterVolume,
        stopAll,
        preloadAll,
        isEnabled,
        
        // Shortcut methods for specific sounds
        button: () => play('allbuttonSound'),
        spin: () => play('spinSound'),
        win: () => play('winlineSound'),
        nowin: () => play('nowinSound'),
        victory: () => play('victorySound'),
        buffalo: () => play('buffaloSound'),
        coin: () => play('coinSound'),
        sixCoin: () => play('sixcoinSound'),
        noti: () => play('notiSound'),
        admin: () => play('adminSound'),
        paymentreseive: () => play('paymentreseiveSound'),
        congratulations: () => play('congratulationsSound'),
        loading: () => play('loadingSound')
    };
})();

// ===== Make it global =====
window.SoundManager = SoundManager;

