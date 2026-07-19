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
        balanceSound: { src: 'sounds/balance.mp3', volume: 0.6, loop: false },
        
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
        
           //New add
        spinBtnSound: { src: 'sounds/spin_btn.mp3', volume: 0.4, loop: false },
         bsmSound: { src: 'sounds/bsm.mp3', volume: 0.8, loop: false },
        checkSound: { src: 'sounds/check.mp3', volume: 0.5, loop: false },
        // Additional (for compatibility)
        revealSound: { src: 'sounds/reveal.mp3', volume: 0.4, loop: false },
        fanfareSound: { src: 'sounds/fanfare.mp3', volume: 0.5, loop: false },
        chimeSound: { src: 'sounds/chime.mp3', volume: 0.3, loop: false },
        errorSound: { src: 'sounds/error.mp3', volume: 0.3, loop: false },
        
        // ===== SHAN KOE MEE SOUNDS =====
        shanPoker: { src: 'sounds/poker.mp3', volume: 0.5, loop: false },
        shanChip: { src: 'sounds/chip.mp3', volume: 0.5, loop: false },
        shanSec: { src: 'sounds/sec.mp3', volume: 0.5, loop: false },
        shanTwox: { src: 'sounds/twox.mp3', volume: 0.6, loop: false },
        shanTain: { src: 'sounds/tain.mp3', volume: 0.6, loop: false },
        shanGood: { src: 'sounds/good.mp3', volume: 0.5, loop: false },
        shanChange: { src: 'sounds/change.mp3', volume: 0.5, loop: false },
        shanEnd: { src: 'sounds/end.mp3', volume: 0.6, loop: false },
        shanLose: { src: 'sounds/lose.mp3', volume: 0.5, loop: false },
        shanSew: { src: 'sounds/sew.mp3', volume: 0.5, loop: false },
        shanTwoSew: { src: 'sounds/twosew.mp3', volume: 0.5, loop: false },
        shanNoneed: { src: 'sounds/noneed.mp3', volume: 0.6, loop: false },
        shanWin: { src: 'sounds/win.mp3', volume: 0.5, loop: false },
        shanAutonine: { src: 'sounds/autonine.mp3', volume: 0.5, loop: false },
        shanAutoeight: { src: 'sounds/autoeight.mp3', volume: 0.5, loop: false }
      };

    
    // ===== Audio cache =====
    const audioCache = {};
    
    // ===== Initialize all sounds =====
    function init() {
        if (initialized) return;
        
        console.log('🎵 Initializing Sound Manager...');
        
        // Load all sounds from config
        Object.keys(soundConfig).forEach(function(key) {
            var config = soundConfig[key];
            var audio = document.getElementById(key);
            
            if (audio) {
                // Clear existing sources
                while (audio.firstChild) {
                    audio.removeChild(audio.firstChild);
                }
                
                // Add source
                var source = document.createElement('source');
                source.src = config.src;
                source.type = 'audio/mpeg';
                audio.appendChild(source);
                
                audio.volume = config.volume;
                audio.loop = config.loop || false;
                
                // Cache the audio element
                audioCache[key] = audio;
            } else {
                console.warn('⚠️ Audio element "' + key + '" not found in HTML');
            }
        });
        
        initialized = true;
        console.log('✅ Sound Manager ready with', Object.keys(audioCache).length, 'sounds');
    }
    
    // ===== Play sound =====
    function play(soundId) {
        if (!soundEnabled) return Promise.resolve();
        
        if (!initialized) init();
        
        var audio = audioCache[soundId] || document.getElementById(soundId);
        if (!audio) {
            console.warn('⚠️ Sound "' + soundId + '" not found');
            return Promise.reject('Sound not found');
        }
        
        // Remove muted
        audio.muted = false;
        
        // Reset and play
        audio.currentTime = 0;
        
        return audio.play().catch(function(e) {
            console.log('🔇 Sound play failed: ' + soundId, e.message);
            return Promise.reject(e);
        });
    }
    
    // ===== Stop sound =====
    function stop(soundId) {
        var audio = audioCache[soundId] || document.getElementById(soundId);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    
    // ===== Play BGM =====
    function playBGM() {
        if (!soundEnabled) return;
        
        play('bgm').then(function() {
            bgmPlaying = true;
            console.log('🎵 BGM started');
        }).catch(function() {
            console.log('🔇 BGM autoplay blocked');
        });
    }
    
    // ===== Play Box BGM =====
    function playBoxBGM() {
        if (!soundEnabled) return;
        
        play('boxbgSound').then(function() {
            console.log('🎵 Box BGM started');
        }).catch(function() {
            console.log('🔇 Box BGM autoplay blocked');
        });
    }
    
    // ===== Stop BGM =====
    function stopBGM() {
        var bgm = audioCache['bgm'] || document.getElementById('bgm');
        if (bgm) {
            bgm.pause();
            bgm.currentTime = 0;
        }
        var boxbg = audioCache['boxbgSound'] || document.getElementById('boxbgSound');
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
            Object.values(audioCache).forEach(function(audio) {
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
        
        console.log('🔊 Sound ' + (soundEnabled ? 'ON' : 'OFF'));
        return soundEnabled;
    }
    
    // ===== Update sound toggle button =====
    function updateSoundButton() {
        var btn = document.getElementById('soundToggleBtn');
        if (btn) {
            btn.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        }
    }
    
    // ===== Set volume =====
    function setVolume(soundId, volume) {
        var audio = audioCache[soundId] || document.getElementById(soundId);
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
        }
    }
    
    // ===== Master volume =====
    function setMasterVolume(volume) {
        Object.values(audioCache).forEach(function(audio) {
            if (audio) {
                var originalVol = soundConfig[audio.id]?.volume || 0.5;
                audio.volume = originalVol * volume;
            }
        });
    }
    
    // ===== Stop all =====
    function stopAll() {
        Object.values(audioCache).forEach(function(audio) {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        bgmPlaying = false;
    }
    
    // ===== Preload all =====
    function preloadAll() {
        Object.values(audioCache).forEach(function(audio) {
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
    
    // ===== Play with retry =====
    function playWithRetry(soundId, maxAttempts) {
        maxAttempts = maxAttempts || 3;
        var attempts = 0;
        var attempt = function() {
            return play(soundId).catch(function(e) {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log('🔄 Retry ' + soundId + ' (' + attempts + '/' + maxAttempts + ')');
                    return new Promise(function(resolve) {
                        setTimeout(resolve, 100);
                    }).then(attempt);
                }
                return Promise.reject(e);
            });
        };
        return attempt();
    }
    
    // ===== Shortcut methods =====
    var shortcuts = {
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
        boom: function() { return play('boomSound'); },
        
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
        
         
        // Scatter
        check: function() { return play('checkSound'); },
        // Win
        bsm: function() { return play('bsmSound'); },
         // Spin
        spin: function() { return play('spinBtnSound'); },
        
        // Notifications
        balance: function() { return play('balanceSound'); },
        noti: function() { return play('notiSound'); },
        notification: function() { return play('notificationSound'); },
        
        // ===== SHAN KOE MEE SHORTCUTS =====
        shanNoneed: function() { return play('shanNoneed'); },
        shanWin: function() { return play('shanWin'); },
        shanAutoeight: function() { return play('shanAutoeight'); },
        shanAutonine: function() { return play('shanAutonine'); },
        shanDeal: function() { return play('shanPoker'); },
        shanChip: function() { return play('shanChip'); },
        shanCapture: function() { return play('shanSec'); },
        shanTwox: function() { return play('shanTwox'); },
        shanWanTin: function() { return play('shanTain'); },
        shanGood: function() { return play('shanGood'); },
        shanChange: function() { return play('shanChange'); },
        shanEnd: function() { return play('shanEnd'); },
        shanLose: function() { return play('shanLose'); },
        shanDraw: function() { return play('shanSew'); },
        shanDrawAgain: function() { return play('shanTwoSew'); }
    };
    
    // ===== Public API =====
    var api = {
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
    
    // Shortcut အားလုံးကို api ထဲ ပေါင်းထည့်
    Object.keys(shortcuts).forEach(function(key) {
        api[key] = shortcuts[key];
    });
    
    return api;
})();

// ===== Make it global =====
window.SoundManager = SoundManager;

// ===== Auto-initialize =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        SoundManager.init();
        console.log('🎵 Sound Manager auto-initialized');
    }, 100);
});
