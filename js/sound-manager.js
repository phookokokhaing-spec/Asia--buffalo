(() => {
  'use strict';

  const CONFIG = {
    bgm: ['sounds/bg_background.mp3', .30, true],
    loadingSound: ['sounds/loading.mp3', .40, false],
    allbuttonSound: ['sounds/allbutton.mp3', .30, false],
    clickSound: ['sounds/click.mp3', .30, false],
    popbuttonSound: ['sounds/popbutton.mp3', .35, false],
    spinSound: ['sounds/spin.mp3', .40, false],
    spinBtnSound: ['sounds/spin_btn.mp3', .40, false],
    winlineSound: ['sounds/winline.mp3', .50, false],
    nowinSound: ['sounds/nowin.mp3', .70, false],
    balanceSound: ['sounds/balance.mp3', .60, false],
    buffaloSound: ['sounds/buffalo.mp3', .50, false],
    lionSound: ['sounds/lion.mp3', .50, false],
    boomSound: ['sounds/boom.mp3', .50, false],
    coinSound: ['sounds/coin.mp3', .40, false],
    coinrainSound: ['sounds/coinrain.mp3', .50, false],
    jackpotspinSound: ['sounds/jackpotspin.mp3', .50, false],
    jackpotSound: ['sounds/jackpot.mp3', .70, false],
    congratulationsSound: ['sounds/congratulations.mp3', .60, false],
    congratsSound: ['sounds/congrats.mp3', .60, false],
    victorySound: ['sounds/victory.mp3', .70, false],
    babaSound: ['sounds/baba.mp3', .60, false],
    notiSound: ['sounds/noti.mp3', .40, false],
    notificationSound: ['sounds/notification.mp3', .40, false],
    wheelSound: ['sounds/wheel.mp3', .70, false],
    adminSound: ['sounds/admin.mp3', .50, false],
    paymentreseiveSound: ['sounds/paymentreseive.mp3', .70, false],
    withdrawSound: ['sounds/withdraw.mp3', .50, false],
    thankyouboxSound: ['sounds/thankyoubox.mp3', .40, false],
    coinboxSound: ['sounds/coinbox.mp3', .50, false],
    boxbgSound: ['sounds/boxbg.mp3', .30, true],
    bsmSound: ['sounds/bsm.mp3', .80, false],
    checkSound: ['sounds/check.mp3', .50, false],
    revealSound: ['sounds/reveal.mp3', .40, false],
    fanfareSound: ['sounds/fanfare.mp3', .50, false],
    chimeSound: ['sounds/chime.mp3', .30, false],
    errorSound: ['sounds/error.mp3', .30, false],
    shanPoker: ['sounds/poker.mp3', .50, false],
    shanChip: ['sounds/chip.mp3', .50, false],
    shanSec: ['sounds/sec.mp3', .50, false],
    shanTwox: ['sounds/twox.mp3', .60, false],
    shanTain: ['sounds/tain.mp3', .60, false],
    shanGood: ['sounds/good.mp3', .50, false],
    shanChange: ['sounds/change.mp3', .50, false],
    shanEnd: ['sounds/end.mp3', .60, false],
    shanLose: ['sounds/lose.mp3', .50, false],
    shanSew: ['sounds/sew.mp3', .50, false],
    shanTwoSew: ['sounds/twosew.mp3', .50, false],
    shanNoneed: ['sounds/noneed.mp3', .60, false],
    shanWin: ['sounds/win.mp3', .50, false],
    shanAutonine: ['sounds/autonine.mp3', .50, false],
    shanAutoeight: ['sounds/autoeight.mp3', .50, false]
  };

  const cache = new Map();
  let enabled = true;
  let masterVolume = .7;
  let initialized = false;
  let bgmWanted = false;

  function readSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
      enabled = settings.sound !== false;
      masterVolume = Math.max(0, Math.min(1, Number(settings.volume ?? 70) / 100));
    } catch (_) {}
  }

  function createAudio(id) {
    if (cache.has(id)) return cache.get(id);
    const config = CONFIG[id];
    if (!config) return null;

    const [src, baseVolume, loop] = config;
    const audio = new Audio();
    audio.id = id;
    audio.preload = 'auto';
    audio.src = src;
    audio.loop = loop;
    audio.volume = baseVolume * masterVolume;
    audio.addEventListener('error', () => {
      console.warn(`Sound unavailable: ${src}`);
    }, { once: true });
    cache.set(id, audio);
    return audio;
  }

  function init() {
    if (initialized) return;
    readSettings();
    Object.keys(CONFIG).forEach(createAudio);
    initialized = true;
  }

  async function play(id, options = {}) {
    if (!initialized) init();
    if (!enabled && !options.force) return false;
    const audio = createAudio(id);
    if (!audio) return false;

    try {
      if (!audio.loop || options.restart !== false) audio.currentTime = 0;
      audio.muted = false;
      await audio.play();
      return true;
    } catch (_) {
      return false;
    }
  }

  function stop(id) {
    const audio = cache.get(id);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  function stopAll() {
    cache.forEach(audio => {
      audio.pause();
      if (!audio.loop) audio.currentTime = 0;
    });
  }

  async function playBGM() {
    bgmWanted = true;
    return play('bgm', { restart: false });
  }

  function stopBGM() {
    bgmWanted = false;
    stop('bgm');
    stop('boxbgSound');
  }

  function toggle(forceValue) {
    enabled = typeof forceValue === 'boolean' ? forceValue : !enabled;
    if (!enabled) stopAll();
    else if (bgmWanted) playBGM();
    persist();
    return enabled;
  }

  function persist() {
    let settings = {};
    try { settings = JSON.parse(localStorage.getItem('gameSettings') || '{}'); } catch (_) {}
    settings.sound = enabled;
    settings.volume = Math.round(masterVolume * 100);
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }

  function setMasterVolume(value) {
    masterVolume = Math.max(0, Math.min(1, Number(value) || 0));
    cache.forEach((audio, id) => {
      audio.volume = CONFIG[id][1] * masterVolume;
    });
    persist();
  }

  function setVolume(idOrValue, maybeValue) {
    if (maybeValue === undefined) {
      setMasterVolume(idOrValue);
      return;
    }
    const audio = createAudio(idOrValue);
    if (audio) audio.volume = Math.max(0, Math.min(1, Number(maybeValue) || 0));
  }

  const API = {
    init,
    play,
    stop,
    stopAll,
    playBGM,
    stopBGM,
    playBoxBGM: () => play('boxbgSound', { restart: false }),
    toggle,
    setVolume,
    setMasterVolume,
    preloadAll: init,
    isEnabled: () => enabled,
    get isMuted() { return !enabled; },
    set isMuted(value) { toggle(!value); },
    button: () => play('allbuttonSound'),
    allbuttonSound: () => play('allbuttonSound'),
    click: () => play('clickSound'),
    pop: () => play('popbuttonSound'),
    loading: () => play('loadingSound'),
    spin: () => play('spinSound'),
    spinButton: () => play('spinBtnSound'),
    win: () => play('winlineSound'),
    nowin: () => play('nowinSound'),
    victory: () => play('victorySound'),
    buffalo: () => play('buffaloSound'),
    lion: () => play('lionSound'),
    boom: () => play('boomSound'),
    coin: () => play('coinSound'),
    coinRain: () => play('coinrainSound'),
    jackpotSpin: () => play('jackpotspinSound'),
    jackpot: () => play('jackpotSound'),
    baba: () => play('babaSound'),
    wheel: () => play('wheelSound'),
    congratulations: () => play('congratulationsSound'),
    congrats: () => play('congratsSound'),
    balance: () => play('balanceSound'),
    noti: () => play('notiSound'),
    notification: () => play('notificationSound'),
    admin: () => play('adminSound'),
    paymentReceive: () => play('paymentreseiveSound'),
    withdraw: () => play('withdrawSound'),
    check: () => play('checkSound'),
    bsm: () => play('bsmSound'),
    shanNoneed: () => play('shanNoneed'),
    shanWin: () => play('shanWin'),
    shanAutoeight: () => play('shanAutoeight'),
    shanAutonine: () => play('shanAutonine'),
    shanDeal: () => play('shanPoker'),
    shanChip: () => play('shanChip'),
    shanCapture: () => play('shanSec'),
    shanTwox: () => play('shanTwox'),
    shanWanTin: () => play('shanTain'),
    shanGood: () => play('shanGood'),
    shanChange: () => play('shanChange'),
    shanEnd: () => play('shanEnd'),
    shanLose: () => play('shanLose'),
    shanDraw: () => play('shanSew'),
    shanDrawAgain: () => play('shanTwoSew')
  };

  window.SoundManager = API;
  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
