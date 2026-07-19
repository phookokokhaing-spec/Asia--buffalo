(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const LIMITS = {
    depositMin: 3000,
    depositMax: 1000000,
    withdrawMin: 5000,
    withdrawMax: 500000,
    withdrawFeeRate: .05,
    cashbackRate: .05,
    cashbackDays: 5
  };

  // Payment accounts come only from Firestore `bankAccounts`.
  // Never show fake/fallback account numbers to users.
  const FALLBACK_METHODS = [];

  const app = {
    user: null,
    userUnsubscribe: null,
    chatUnsubscribe: null,
    chatOpen: false,
    selectedDepositMethod: 'kbzpay',
    selectedWithdrawMethod: 'kbzpay',
    selectedDepositAmount: 0,
    paymentMethods: [],
    bankAccountsUnsubscribe: null,
    activeGame: null,
    balanceQueue: Promise.resolve(),
    winAnim: null,
    journey: {
      currentWorld: 1,
      worldsUnlocked: 1,
      totalSpins: 0,
      biggestWin: 0,
      worldProgress: { 1: 0, 2: 0, 3: 0, 4: 0 }
    }
  };

  function safeNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = Number.parseFloat(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatNumber(value) {
    return Math.floor(safeNumber(value)).toLocaleString('en-US');
  }

  function getUid(user = app.user) {
    return user?.uid || user?.id || window.auth?.currentUser?.uid || null;
  }

  function timestampMs(value) {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function formatDate(value) {
    const ms = timestampMs(value);
    if (!ms) return '-';
    return new Date(ms).toLocaleString();
  }

  function persistUser(user) {
    if (!user) return;
    app.user = user;
    window.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  function readStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (_) {
      return null;
    }
  }

  function toast(message, type = 'info') {
    const wrap = $('#m883ToastWrap');
    if (!wrap) {
      console.log(`[${type}] ${message}`);
      return;
    }
    const el = document.createElement('div');
    el.className = `m883-toast ${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    window.SoundManager?.[type === 'error' ? 'error' : type === 'success' ? 'check' : 'noti']?.();
    setTimeout(() => el.remove(), 3200);
  }

  function withTimeout(promise, ms, message) {
    let timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message || 'အချိန်ကြာလွန်းနေပါသည်။')), ms);
      })
    ]).finally(() => clearTimeout(timer));
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Screenshot ဖတ်မရပါ။'));
      reader.readAsDataURL(file);
    });
  }

  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Screenshot ပုံဖွင့်မရပါ။'));
      image.src = dataUrl;
    });
  }

  async function compressProofToDataUrl(file) {
    const original = await readFileAsDataUrl(file);
    if (!file.type?.startsWith('image/')) return original;

    const image = await loadImageFromDataUrl(original);
    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;
    const maxSide = 1280;
    const ratio = Math.min(1, maxSide / Math.max(width, height));
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Screenshot ပြင်ဆင်မရပါ။');

    let quality = .82;
    let result = original;
    for (let attempt = 0; attempt < 5; attempt++) {
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= 720000) break;
      quality = Math.max(.45, quality - .09);
      width = Math.max(1, Math.round(width * .86));
      height = Math.max(1, Math.round(height * .86));
    }

    if (result.length > 850000) {
      throw new Error('Screenshot ဖိုင်ကြီးလွန်းပါသည်။ ပုံကို crop လုပ်ပြီး ထပ်တင်ပါ။');
    }
    return result;
  }

  function ensureDepositSuccessModal() {
    let overlay = document.getElementById('depositSuccessModal');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'm883-overlay';
    overlay.id = 'depositSuccessModal';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <section class="m883-modal compact" role="dialog" aria-modal="true" aria-labelledby="depositSuccessTitle">
        <header class="m883-modal-header">
          <div class="m883-modal-title" id="depositSuccessTitle">✅ တောင်းဆိုမှုအောင်မြင်ပါသည်</div>
          <button class="m883-close" type="button" data-close="depositSuccessModal">✕</button>
        </header>
        <div class="m883-modal-body" style="text-align:center">
          <div style="font-size:64px;line-height:1;margin:6px 0 14px">✅</div>
          <h2 style="margin:0 0 10px;color:var(--m883-gold-soft)">ငွေသွင်းတောင်းဆိုမှု ပို့ပြီးပါပြီ</h2>
          <p class="m883-muted" style="line-height:1.7;margin:0 0 14px">Admin က ငွေလွှဲအထောက်အထားကို စစ်ဆေးအတည်ပြုပြီးမှ balance ဝင်ပါမည်။</p>
          <div class="m883-card" style="text-align:left">
            <div class="m883-list-item"><span>ပမာဏ</span><strong id="depositSuccessAmount">0 KS</strong></div>
            <div class="m883-list-item" style="margin-top:8px"><span>နည်းလမ်း</span><strong id="depositSuccessMethod">-</strong></div>
            <div class="m883-list-item" style="margin-top:8px"><span>Request ID</span><strong id="depositSuccessRequest" style="font-size:10px;word-break:break-all">-</strong></div>
          </div>
          <div class="m883-actions"><button class="m883-btn" type="button" data-close="depositSuccessModal">အိုကေ</button></div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  function showDepositSuccess({ amount, method, requestId }) {
    ensureDepositSuccessModal();
    const amountEl = document.getElementById('depositSuccessAmount');
    const methodEl = document.getElementById('depositSuccessMethod');
    const requestEl = document.getElementById('depositSuccessRequest');
    if (amountEl) amountEl.textContent = `${formatNumber(amount)} KS`;
    if (methodEl) methodEl.textContent = method || '-';
    if (requestEl) requestEl.textContent = requestId || '-';
    openOverlay('depositSuccessModal');
  }

  function playButtonSound() {
    window.SoundManager?.button?.();
  }

  function openOverlay(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return false;
    playButtonSound();
    $$('.m883-overlay.open').forEach(item => {
      if (item !== overlay) item.classList.remove('open');
    });
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    return true;
  }

  function closeOverlay(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return false;
    playButtonSound();
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (id === 'userChatModal') markUserMessagesAsRead();
    return true;
  }

  function closeAllOverlays() {
    $$('.m883-overlay.open').forEach(el => {
      el.classList.remove('open');
      el.setAttribute('aria-hidden', 'true');
    });
  }

  function setCanvasBalance(balance) {
    window.Mini883Canvas?.setBalance?.(safeNumber(balance));
    const elements = ['modalBalance', 'withdrawAvailable', 'profileBalance'];
    elements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = `${formatNumber(balance)} KS`;
    });
  }

  function updateCanvasUser(user) {
    if (!user) return;
    const name = user.username || user.userName || user.fullName || user.displayName || 'Player';
    window.Mini883Canvas?.setUser?.({
      name,
      balance: safeNumber(user.balance),
      vip: safeNumber(user.vipLevel ?? user.vip, 1),
      vipProgress: safeNumber(user.vipProgress, 0)
    });
    setCanvasBalance(user.balance);
  }

  function updateLobbyBalance(newBalance, options = {}) {
    const safeBalance = Math.max(0, safeNumber(newBalance));
    const user = { ...(app.user || readStoredUser() || {}), balance: safeBalance };
    const uid = getUid(user);
    if (uid) {
      user.uid = uid;
      user.id = uid;
    }
    persistUser(user);
    setCanvasBalance(safeBalance);

    if (options.save !== false && window.db && uid) {
      return window.db.collection('users').doc(uid).set({ balance: safeBalance }, { merge: true })
        .then(() => true)
        .catch(error => {
          console.error('Balance save failed:', error);
          toast('Balance သိမ်းမရပါ။', 'error');
          return false;
        });
    }
    return Promise.resolve(true);
  }

  function getCurrentBalance() {
    return Math.max(0, safeNumber(app.user?.balance ?? readStoredUser()?.balance ?? window.Mini883CanvasState?.balance));
  }

  async function mutateBalance(delta, reason = 'game') {
    const amount = safeNumber(delta);
    if (!amount) return getCurrentBalance();
    const uid = getUid();

    if (!window.db || !uid) {
      const next = Math.max(0, getCurrentBalance() + amount);
      await updateLobbyBalance(next, { save: false });
      return next;
    }

    const ref = window.db.collection('users').doc(uid);
    const next = await window.db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const current = safeNumber(snap.data()?.balance, getCurrentBalance());
      const value = Math.max(0, current + amount);
      tx.set(ref, {
        balance: value,
        lastBalanceReason: reason,
        balanceUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return value;
    });

    await updateLobbyBalance(next, { save: false });
    return next;
  }

  function subscribeUser(uid) {
    app.userUnsubscribe?.();
    if (!window.db || !uid) return;

    app.userUnsubscribe = window.db.collection('users').doc(uid).onSnapshot(snap => {
      const authUser = window.auth?.currentUser;
      const data = snap.exists ? snap.data() : {};
      const stored = readStoredUser() || {};
      const merged = {
        ...stored,
        ...data,
        uid,
        id: uid,
        email: data.email || authUser?.email || stored.email || ''
      };
      persistUser(merged);
      updateCanvasUser(merged);
      renderProfile();
      updateCashbackNavBadge();
    }, error => console.error('User listener error:', error));
  }

  function initAuth() {
    const stored = readStoredUser();
    if (stored) {
      const uid = getUid(stored);
      if (uid) {
        stored.uid = uid;
        stored.id = uid;
      }
      persistUser(stored);
      updateCanvasUser(stored);
    }

    if (!window.auth) {
      toast('Firebase Auth မတွေ့ပါ။ Script load order စစ်ပါ။', 'error');
      return;
    }

    window.auth.onAuthStateChanged(async firebaseUser => {
      if (!firebaseUser) {
        app.bankAccountsUnsubscribe?.();
        app.bankAccountsUnsubscribe = null;
        app.paymentMethods = [];
        renderPaymentMethods();
        updateDepositAccount();

        if (new URLSearchParams(location.search).has('demo')) {
          const demoUser = stored || { id: 'demo-user', uid: 'demo-user', username: 'Demo Player', balance: 10000, vip: 1 };
          persistUser(demoUser);
          updateCanvasUser(demoUser);
          console.info('Demo mode: authenticated-only payment accounts are intentionally unavailable.');
          return;
        }
        setTimeout(() => {
          if (!window.auth.currentUser) location.replace('./index.html');
        }, 500);
        return;
      }

      const uid = firebaseUser.uid;
      let data = {};
      try {
        const snap = await window.db.collection('users').doc(uid).get();
        data = snap.exists ? snap.data() : {};
        if (!snap.exists) {
          await window.db.collection('users').doc(uid).set({
            email: firebaseUser.email || '',
            balance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      } catch (error) {
        console.error('User bootstrap error:', error);
      }

      const user = {
        ...(stored || {}),
        ...data,
        uid,
        id: uid,
        email: firebaseUser.email || data.email || ''
      };
      persistUser(user);
      updateCanvasUser(user);
      subscribeUser(uid);
      loadPaymentMethods();
      loadJourney();
      setupUserChatListener();
      updateCashbackNavBadge();
    });
  }

  function renderProfile() {
    const user = app.user || {};
    const name = user.username || user.userName || user.fullName || user.displayName || 'Player';
    const fields = {
      profileName: name,
      profileEmail: user.email || '-',
      profileUid: getUid(user) || '-',
      profileBalance: `${formatNumber(user.balance)} KS`,
      profileVip: `VIP ${safeNumber(user.vipLevel ?? user.vip, 1)}`
    };
    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  function openProfileModal() {
    renderProfile();
    openOverlay('profileModal');
  }

  async function logout() {
    playButtonSound();
    try { await window.auth?.signOut?.(); } catch (_) {}
    localStorage.removeItem('currentUser');
    localStorage.removeItem('fcmToken');
    location.replace('./index.html');
  }

  // ------------------------------------------------------------------
  // Game iframe bridge
  // ------------------------------------------------------------------
  const GAME_MAP = {
    jackpot: { container: 'jackpotGameContainer', frame: 'jackpotframe', label: 'Jackpot Ways', game: 'jackpot' },
    jackpotWays: { container: 'jackpotGameContainer', frame: 'jackpotframe', label: 'Jackpot Ways', game: 'jackpot' },
    crocodile: { container: 'jackpotGameContainer', frame: 'jackpotframe', label: 'Crocodile', game: 'jackpot' },
    megaWays: { container: 'megaWaysContainer', frame: 'megaWaysIframe', label: 'Mega Ways', game: 'megaWays' },
    superWays: { container: 'superWaysContainer', frame: 'superWaysIframe', label: 'Super Ways', game: 'superWays' },
    phoenix: { container: 'phoenixGameContainer', frame: 'phoenixGameIframe', label: 'Phoenix', game: 'phoenixGame' },
    phoenixGame: { container: 'phoenixGameContainer', frame: 'phoenixGameIframe', label: 'Phoenix', game: 'phoenixGame' },
    card: { container: 'cardGameContainer', frame: 'cardGameIframe', label: 'Three Card Poker', game: 'cardGame' }
  };

  function getGameFrame(config) {
    return document.getElementById(config.frame) || (config.game === 'jackpot' ? document.getElementById('jackpotIframe') : null);
  }

  function sendBalanceToFrame(frame, gameName) {
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({
      type: 'SYNC_BALANCE',
      balance: getCurrentBalance(),
      game: gameName
    }, location.origin);
  }

  function forceRestoreSuperWaysSpin(frame) {
    try {
      const doc = frame?.contentDocument;
      const win = frame?.contentWindow;
      if (!doc || !win) return;

      const spinWrap = doc.getElementById('fb-spin');
      const spinImg = doc.getElementById('img-spin');
      const stopImg = doc.getElementById('img-stop');

      if (spinWrap) {
        spinWrap.hidden = false;
        spinWrap.style.setProperty('display', 'flex', 'important');
        spinWrap.style.setProperty('visibility', 'visible', 'important');
        spinWrap.style.setProperty('opacity', '1', 'important');
        spinWrap.style.setProperty('pointer-events', 'auto', 'important');
      }
      if (spinImg) {
        spinImg.hidden = false;
        spinImg.classList.remove('hidden');
        spinImg.style.setProperty('display', 'block', 'important');
        spinImg.style.setProperty('visibility', 'visible', 'important');
        spinImg.style.setProperty('opacity', '1', 'important');
      }
      if (stopImg) {
        stopImg.classList.add('hidden');
        stopImg.style.setProperty('display', 'none', 'important');
      }

      // Do not change the free-spin counters here. This only repairs the
      // normal SPIN/STOP artwork after the parent win animation completes.
      if (!win.state?.isFreeSpin && typeof win.setSpinButtonState === 'function') {
        try { win.setSpinButtonState(false); } catch (_) {}
      }
    } catch (error) {
      console.warn('Super Ways spin restore failed:', error.message);
    }
  }

  function patchSuperWaysFrame(frame) {
    try {
      const win = frame?.contentWindow;
      if (!win || win.__mini883WinPromisePatch) return;

      const original = win.triggerWinAnimation;
      if (typeof original !== 'function') {
        // game.js may not be ready at the first load callback
        setTimeout(() => patchSuperWaysFrame(frame), 250);
        return;
      }

      win.triggerWinAnimation = function patchedTriggerWinAnimation(winResult) {
        const animationPromise = (() => {
          try {
            return Promise.resolve(original.call(win, winResult));
          } catch (error) {
            console.error('Super Ways animation error:', error);
            return Promise.resolve();
          }
        })();

        // WinAnimation is currently 7 seconds. Never let a missed callback
        // keep spin() awaiting forever. The watchdog resolves at 8.5 seconds.
        const watchdog = new Promise(resolve => setTimeout(resolve, 8500));

        return Promise.race([animationPromise, watchdog]).finally(() => {
          forceRestoreSuperWaysSpin(frame);
          setTimeout(() => forceRestoreSuperWaysSpin(frame), 120);
        });
      };

      win.__mini883WinPromisePatch = true;
      forceRestoreSuperWaysSpin(frame);
      console.log('✅ Super Ways animation/spin recovery installed');
    } catch (error) {
      console.warn('Super Ways patch failed:', error.message);
    }
  }

  function openGame(action) {
    const config = GAME_MAP[action];
    if (!config) {
      toast('ဒီဂိမ်းကို မချိတ်ရသေးပါ။', 'info');
      return false;
    }

    closeAllOverlays();
    closeGame(false);
    const container = document.getElementById(config.container);
    const frame = getGameFrame(config);
    if (!container || !frame) {
      toast(`${config.label} iframe မတွေ့ပါ။`, 'error');
      return false;
    }

    app.activeGame = config;
    const title = $('.m883-game-title', container);
    if (title) title.textContent = config.label;
    container.classList.add('open');
    container.setAttribute('aria-hidden', 'false');
    $('#lobbyCanvas')?.classList.add('is-hidden');
    window.SoundManager?.stopBGM?.();

    const sync = () => setTimeout(() => {
      sendBalanceToFrame(frame, config.game);
      if (config.game === 'superWays') patchSuperWaysFrame(frame);
    }, 250);
    frame.addEventListener('load', sync, { once: true });
    try {
      const currentSrc = frame.getAttribute('src');
      if (currentSrc) frame.setAttribute('src', currentSrc);
    } catch (_) {}
    sync();
    return true;
  }

  function closeGame(showLobby = true) {
    try { app.winAnim?.stop?.(false); } catch (_) {}
    finishWinAnimation(null);
    $$('.m883-game-shell.open').forEach(container => {
      container.classList.remove('open');
      container.setAttribute('aria-hidden', 'true');
    });
    app.activeGame = null;
    if (showLobby) {
      $('#lobbyCanvas')?.classList.remove('is-hidden');
      const settings = readGameSettings();
      if (settings.sound !== false && settings.bgm !== false) window.SoundManager?.playBGM?.();
    }
  }

  function gameFrameForSource(source) {
    for (const config of Object.values(GAME_MAP)) {
      const frame = getGameFrame(config);
      if (frame?.contentWindow === source) return { frame, config };
    }
    return null;
  }

  function saveGameHistory(bet, win, winType) {
    let entries = [];
    try { entries = JSON.parse(localStorage.getItem('gameHistoryEntries') || '[]'); } catch (_) {}
    entries.unshift({ bet: safeNumber(bet), win: safeNumber(win), winType: winType || 'normal', date: new Date().toISOString() });
    entries = entries.slice(0, 100);
    localStorage.setItem('gameHistoryEntries', JSON.stringify(entries));

    let stats = {};
    try { stats = JSON.parse(localStorage.getItem('gameStats') || '{}'); } catch (_) {}
    stats.biggestWin = Math.max(safeNumber(stats.biggestWin), safeNumber(win));
    stats.jackpotCount = safeNumber(stats.jackpotCount);
    stats.megaWinCount = safeNumber(stats.megaWinCount);
    stats.superWinCount = safeNumber(stats.superWinCount);
    stats.bigWinCount = safeNumber(stats.bigWinCount);
    if (winType === 'jackpot') stats.jackpotCount++;
    else if (winType === 'mega') stats.megaWinCount++;
    else if (winType === 'super') stats.superWinCount++;
    else if (winType === 'big') stats.bigWinCount++;
    stats.lastPlayed = new Date().toLocaleString();
    localStorage.setItem('gameStats', JSON.stringify(stats));
  }

  function finishWinAnimation(sourceFrame = null) {
    const canvas = document.getElementById('winCanvas');
    if (canvas) {
      canvas.classList.remove('m883-win-active');
      canvas.style.setProperty('display', 'none', 'important');
      canvas.style.setProperty('visibility', 'hidden', 'important');
      canvas.style.setProperty('opacity', '0', 'important');
      canvas.style.setProperty('pointer-events', 'none', 'important');
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Do not send generic animation/spin completion messages here.
    // Some games use those same message names for their free-spin state machine,
    // which can hide or replace the normal spin button after a win animation.
    // Balance sync is the only cross-frame message that is safe for every game.
    if (sourceFrame?.contentWindow) {
      sendBalanceToFrame(sourceFrame, app.activeGame?.game || 'game');
      try { sourceFrame.focus(); } catch (_) {}
    }
  }

  function showWinAnimation(amount, data = {}) {
    const winType = ['big', 'mega', 'super'].includes(data.winType)
      ? data.winType
      : amount >= 5000000 ? 'super' : amount >= 1000000 ? 'mega' : 'big';

    const sourceFrame = data.sourceFrame || null;
    const canvas = document.getElementById('winCanvas');
    if (canvas) {
      document.body.appendChild(canvas);
      canvas.classList.add('m883-win-active');
      canvas.style.setProperty('display', 'block', 'important');
      canvas.style.setProperty('visibility', 'visible', 'important');
      canvas.style.setProperty('opacity', '1', 'important');
      canvas.style.setProperty('z-index', '2147483646', 'important');
      canvas.style.transform = 'translateZ(0)';
      app.winAnim?.resize?.();
    }

    // BabaJackpot is only for the explicit baba-flying event.
    if (data.animation === 'baba' || data.effect === 'baba') {
      window.BabaJackpot?.show?.([], amount, winType, {
        soundUrl: null,
        startBalance: Math.max(0, getCurrentBalance() - amount)
      });
      setTimeout(() => finishWinAnimation(sourceFrame), 7500);
      return;
    }

    if (!app.winAnim) initWinAnimation();

    requestAnimationFrame(() => {
      if (!app.winAnim) {
        console.warn('WinAnimation is not initialized');
        finishWinAnimation(sourceFrame);
        return;
      }
      app.winAnim.trigger(winType, amount, {
        duration: 7000,
        onStart: () => window.SoundManager?.[winType === 'super' ? 'jackpot' : 'victory']?.(),
        onComplete: () => finishWinAnimation(sourceFrame)
      });
    });
  }

  function initWinAnimation() {
    const canvas = document.getElementById('winCanvas');
    if (!window.WinAnimation || !canvas) return;
    try {
      if (!app.winAnim) {
        app.winAnim = new window.WinAnimation('winCanvas', { allowSkip: true, quality: 'auto' });
        app.winAnim.loadImages({
          winBig: 'images/win_big.png',
          winMega: 'images/win_mega.png',
          winSuper: 'images/win_super.png',
          starGreen: 'images/star_green.png',
          starRed: 'images/star_red.png',
          starBlue: 'images/star_blue.png',
          coins: 'images/coins.png',
          scoreBox: 'images/score_box.png'
        });
        window.winAnim = app.winAnim;
      }
      canvas.classList.remove('m883-win-active');
      canvas.style.setProperty('display', 'none', 'important');
      canvas.style.setProperty('visibility', 'hidden', 'important');
      canvas.style.setProperty('opacity', '0', 'important');
    } catch (error) {
      console.warn('WinAnimation unavailable:', error.message);
    }
  }

  window.addEventListener('message', event => {
    const sourceInfo = gameFrameForSource(event.source);
    if (!sourceInfo) return;
    if (event.origin !== location.origin && event.origin !== 'null') return;

    const data = event.data || {};
    if (!data.type) return;

    if (data.type === 'GO_LOBBY' || data.type === 'CLOSE_GAME') {
      closeGame(true);
      return;
    }

    if (data.type === 'REQUEST_BALANCE') {
      sendBalanceToFrame(sourceInfo.frame, data.game || sourceInfo.config.game);
      return;
    }

    if (data.type === 'BET_DEDUCT') {
      const bet = Math.max(0, safeNumber(data.amount));
      if (!bet) return;

      // The game must react immediately. Never block a spin on a network transaction.
      const nextBalance = Math.max(0, getCurrentBalance() - bet);
      updateLobbyBalance(nextBalance, { save: false });
      sendBalanceToFrame(sourceInfo.frame, sourceInfo.config.game);

      // Persist in the background, preserving event order without delaying the iframe.
      app.balanceQueue = app.balanceQueue
        .then(() => updateLobbyBalance(nextBalance, { save: true }))
        .catch(error => {
          console.error(error);
          toast('လောင်းကြေး balance သိမ်းမရပါ။', 'error');
        });
      return;
    }

    if (data.type === 'BABA_JACKPOT' || data.type === 'BABA_WIN') {
      const amount = Math.max(0, safeNumber(data.amount));
      if (!amount) return;
      showWinAnimation(amount, { ...data, animation: 'baba', sourceFrame: sourceInfo.frame });
      return;
    }

    if (data.type === 'WIN_AMOUNT') {
      const win = Math.max(0, safeNumber(data.amount));
      if (!win) return;

      // Reveal the win and update the game instantly; Firestore save runs behind the UI.
      const nextBalance = getCurrentBalance() + win;
      updateLobbyBalance(nextBalance, { save: false });
      sendBalanceToFrame(sourceInfo.frame, sourceInfo.config.game);
      showWinAnimation(win, { ...data, game: data.game || sourceInfo.config.game, sourceFrame: sourceInfo.frame });
      saveGameHistory(data.betAmount || 0, win, data.winType || 'normal');
      updateWorldProgress(win).catch(error => console.error('Journey update failed:', error));
      toast(`🎰 ${formatNumber(win)} KS ရရှိပါသည်!`, 'success');

      app.balanceQueue = app.balanceQueue
        .then(() => updateLobbyBalance(nextBalance, { save: true }))
        .catch(error => {
          console.error(error);
          toast('အနိုင် balance သိမ်းမရပါ။', 'error');
        });
      return;
    }

    if (data.type === 'SPIN_COMPLETE') {
      updateWorldProgress(safeNumber(data.winAmount));
    }
  });

  // ------------------------------------------------------------------
  // Payment UI
  // ------------------------------------------------------------------
  function firstNonEmpty(data, keys) {
    for (const key of keys) {
      const value = data?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return '';
  }

  function normalizeBankAccount(doc) {
    const data = typeof doc?.data === 'function' ? (doc.data() || {}) : (doc || {});
    const docId = doc?.id || data.id || '';

    const methodName = firstNonEmpty(data, [
      'bankName', 'walletName', 'providerName', 'paymentName', 'methodName',
      'paymentMethod', 'method', 'wallet', 'provider', 'bank', 'type', 'label', 'name'
    ]) || 'Payment';

    const accountName = firstNonEmpty(data, [
      'accountName', 'accountHolderName', 'accountHolder', 'holderName', 'holder',
      'ownerName', 'receiverName', 'receiver', 'recipientName', 'recipient',
      'fullName', 'userName'
    ]);

    const accountNumber = firstNonEmpty(data, [
      'accountNumber', 'accountNo', 'account_no', 'number', 'phoneNumber',
      'phoneNo', 'phone_no', 'phone', 'mobileNumber', 'mobile',
      'walletNumber', 'walletNo', 'wallet_no'
    ]);

    const rawId = docId || methodName;
    const id = String(rawId).trim().toLowerCase()
      .replace(/[^a-z0-9\u1000-\u109f]+/g, '-')
      .replace(/^-|-$/g, '') || `method-${Date.now()}`;

    return {
      id,
      docId,
      name: String(methodName).trim(),
      accountName: String(accountName).trim(),
      accountNumber: String(accountNumber).trim(),
      sortOrder: safeNumber(firstNonEmpty(data, ['sortOrder', 'order', 'priority', 'position']), 9999),
      raw: data
    };
  }

  function isAccountEnabled(data = {}) {
    const explicit = firstNonEmpty(data, ['status', 'isActive', 'active', 'enabled', 'isEnabled']);
    if (explicit === '') return true;
    if (typeof explicit === 'boolean') return explicit;
    if (typeof explicit === 'number') return explicit !== 0;
    const value = String(explicit).trim().toLowerCase();
    return !['inactive', 'disabled', 'disable', 'false', '0', 'deleted', 'blocked', 'off'].includes(value);
  }

  function hasUsablePaymentAccount(method) {
    return Boolean(method?.accountName && method?.accountNumber && isAccountEnabled(method.raw));
  }

  function setDepositSubmitState() {
    const button = $('#submitDepositBtn');
    const method = app.paymentMethods.find(item => item.id === app.selectedDepositMethod);
    if (!button) return;
    const ready = hasUsablePaymentAccount(method);
    button.disabled = !ready;
    button.textContent = ready ? 'ငွေသွင်းတောင်းဆိုမည်' : 'လက်ခံအကောင့် မရှိသေးပါ';
  }

  function renderPaymentMethods() {
    const render = (containerId, selected, onSelect) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.replaceChildren();

      if (!app.paymentMethods.length) {
        const empty = document.createElement('button');
        empty.type = 'button';
        empty.className = 'm883-method';
        empty.disabled = true;
        empty.textContent = 'Active account မရှိသေးပါ';
        container.appendChild(empty);
        return;
      }

      app.paymentMethods.forEach(method => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `m883-method${method.id === selected ? ' active' : ''}`;
        button.textContent = method.name;
        button.addEventListener('click', () => onSelect(method.id));
        container.appendChild(button);
      });
    };

    render('depositMethods', app.selectedDepositMethod, id => {
      app.selectedDepositMethod = id;
      renderPaymentMethods();
      updateDepositAccount();
    });
    render('withdrawMethods', app.selectedWithdrawMethod, id => {
      app.selectedWithdrawMethod = id;
      renderPaymentMethods();
    });
    setDepositSubmitState();
  }

  function updateDepositAccount() {
    const method = app.paymentMethods.find(item => item.id === app.selectedDepositMethod) || app.paymentMethods[0] || null;
    const name = $('#depositAccountName');
    const number = $('#depositAccountNumber');
    const copy = $('#copyDepositAccount');
    if (name) name.textContent = method?.accountName || 'Active account မရှိပါ';
    if (number) number.textContent = method?.accountNumber || '-';
    if (copy) {
      copy.disabled = !hasUsablePaymentAccount(method);
      copy.dataset.copyValue = method?.accountNumber || '';
    }
    setDepositSubmitState();
  }

  function applyBankAccountSnapshot(snapshot, sourceLabel) {
    const all = snapshot.docs.map(normalizeBankAccount);
    const methods = all
      .filter(hasUsablePaymentAccount)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

    app.paymentMethods = methods;

    if (!methods.some(item => item.id === app.selectedDepositMethod)) {
      app.selectedDepositMethod = methods[0]?.id || '';
    }
    if (!methods.some(item => item.id === app.selectedWithdrawMethod)) {
      app.selectedWithdrawMethod = methods[0]?.id || '';
    }

    renderPaymentMethods();
    updateDepositAccount();

    console.log(`✅ Bank account source ${sourceLabel}: ${methods.length}/${all.length} usable`);
    if (!methods.length && all.length) {
      console.warn('⚠️ Bank docs found but required fields were not recognized:', all.map(item => ({
        id: item.docId,
        keys: Object.keys(item.raw || {}),
        name: item.name,
        accountName: item.accountName,
        accountNumber: item.accountNumber
      })));
    }
    return methods.length;
  }

  async function loadPaymentMethods() {
    app.bankAccountsUnsubscribe?.();
    app.bankAccountsUnsubscribe = null;

    if (!window.db) {
      app.paymentMethods = [];
      renderPaymentMethods();
      updateDepositAccount();
      return;
    }

    const ref = window.db.collection('bankAccounts');
    const candidates = [
      { label: 'status=active', query: ref.where('status', '==', 'active') },
      { label: 'isActive=true', query: ref.where('isActive', '==', true) },
      { label: 'active=true', query: ref.where('active', '==', true) },
      { label: 'enabled=true', query: ref.where('enabled', '==', true) },
      { label: 'all-documents', query: ref }
    ];

    let chosen = null;
    const failures = [];

    for (const candidate of candidates) {
      try {
        const snapshot = await candidate.query.get();
        const usable = snapshot.docs.map(normalizeBankAccount).filter(hasUsablePaymentAccount);
        console.log(`🔎 bankAccounts ${candidate.label}: docs=${snapshot.size}, usable=${usable.length}`);
        if (usable.length) {
          chosen = candidate;
          break;
        }
      } catch (error) {
        failures.push(`${candidate.label}: ${error.code || error.message}`);
        console.warn(`bankAccounts ${candidate.label} failed:`, error);
      }
    }

    if (!chosen) {
      app.paymentMethods = [];
      renderPaymentMethods();
      updateDepositAccount();
      console.error('❌ No readable usable bank accounts.', failures);
      toast('Admin bank account data မတွေ့ပါ။ Account field/status စစ်ပါ။', 'error');
      return;
    }

    app.bankAccountsUnsubscribe = chosen.query.onSnapshot(snapshot => {
      applyBankAccountSnapshot(snapshot, chosen.label);
    }, error => {
      console.error(`❌ bankAccounts listener ${chosen.label} failed:`, error);
      app.paymentMethods = [];
      app.selectedDepositMethod = '';
      app.selectedWithdrawMethod = '';
      renderPaymentMethods();
      updateDepositAccount();
      toast('Admin payment accounts ဖတ်မရပါ။', 'error');
    });
  }

  async function copyDepositAccountNumber() {
    const method = app.paymentMethods.find(item => item.id === app.selectedDepositMethod);
    const value = method?.accountNumber || '';
    if (!value) {
      toast('Copy ယူရန် account number မရှိပါ။', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
    } catch (_) {
      const temp = document.createElement('textarea');
      temp.value = value;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    toast(`${method.name} နံပါတ် Copy ယူပြီးပါပြီ။`, 'success');
    window.SoundManager?.button?.();
  }

  function buildTelegramMessage(kind, payload) {
    const userName = payload.username || 'User';
    if (kind === 'deposit') {
      return [
        '💰 MINI883 DEPOSIT (PENDING)',
        `👤 User: ${userName}`,
        `🆔 UID: ${payload.uid}`,
        `💵 Amount: ${formatNumber(payload.amount)} KS`,
        `🏦 Method: ${payload.method || '-'}`,
        `📥 Receiver: ${payload.receiverAccountName || '-'}`,
        `📱 Receiver No: ${payload.receiverAccountNumber || '-'}`,
        `🙋 Sender: ${payload.senderName || '-'}`,
        `☎️ Sender Phone: ${payload.senderPhone || '-'}`,
        `📄 Request: ${payload.requestId || '-'}`,
        '⏳ Status: Admin approval required'
      ].join('\n');
    }
    return [
      '🏦 MINI883 WITHDRAW (PENDING)',
      `👤 User: ${userName}`,
      `🆔 UID: ${payload.uid}`,
      `💵 Amount: ${formatNumber(payload.amount)} KS`,
      `💸 Receive: ${formatNumber(payload.receiveAmount)} KS`,
      `🏦 Method: ${payload.method || '-'}`,
      `🙋 Account: ${payload.accountName || '-'}`,
      `📱 Number: ${payload.accountNumber || '-'}`,
      `📄 Request: ${payload.requestId || '-'}`
    ].join('\n');
  }

  async function notifyTelegramPayment(kind, payload) {
    try {
      if (typeof window.notifyTelegramPayment === 'function') {
        await window.notifyTelegramPayment(kind, payload);
        return true;
      }

      const cfg = window.MINI883_TELEGRAM_TEST || {};
      const message = buildTelegramMessage(kind, payload);

      if (cfg.endpoint) {
        const response = await fetch(cfg.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, message, payload })
        });
        if (!response.ok) throw new Error(`Telegram endpoint ${response.status}`);
        return true;
      }

      const localHost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
      if (cfg.enabled === true && localHost && cfg.botToken && cfg.chatId) {
        console.warn('⚠️ Telegram direct test mode: localhost only. Never deploy the token in frontend code.');
        const response = await fetch(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: cfg.chatId, text: message })
        });
        if (!response.ok) throw new Error(`Telegram API ${response.status}`);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Telegram notification failed:', error);
      return false;
    }
  }

  function selectDepositAmount(amount) {
    app.selectedDepositAmount = safeNumber(amount);
    $('#depositAmount').value = app.selectedDepositAmount || '';
    $$('.m883-amount', $('#depositAmounts')).forEach(button => {
      button.classList.toggle('active', safeNumber(button.dataset.amount) === app.selectedDepositAmount);
    });
  }

  function openDepositModal() {
    $('#modalBalance').textContent = `${formatNumber(getCurrentBalance())} KS`;
    renderPaymentMethods();
    updateDepositAccount();
    openOverlay('depositModal');
  }

  async function uploadDepositProof(file, uid) {
    if (!file) throw new Error('ငွေလွှဲ Screenshot ထည့်ပါ။');
    if (file.size > 5 * 1024 * 1024) throw new Error('Screenshot ကို 5MB အောက်သုံးပါ။');
    if (!window.storage) throw new Error('Firebase Storage မရပါ။');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `paymentProofs/${uid}/${Date.now()}-${safeName}`;
    const ref = window.storage.ref(path);
    const task = await withTimeout(
      ref.put(file, { contentType: file.type || 'image/jpeg' }),
      15000,
      'Screenshot upload အချိန်ကြာလွန်းနေပါသည်။'
    );
    const url = await withTimeout(task.ref.getDownloadURL(), 8000, 'Screenshot URL မရပါ။');
    return { url, dataUrl: null, path, mode: 'storage' };
  }

  async function prepareDepositProof(file, uid) {
    if (!file) throw new Error('ငွေလွှဲ Screenshot ထည့်ပါ။');
    if (file.size > 5 * 1024 * 1024) throw new Error('Screenshot ကို 5MB အောက်သုံးပါ။');
    try {
      return await uploadDepositProof(file, uid);
    } catch (storageError) {
      console.warn('Storage upload failed; using compressed Firestore proof for testing:', storageError);
      const dataUrl = await withTimeout(
        compressProofToDataUrl(file),
        12000,
        'Screenshot ပြင်ဆင်မှု အချိန်ကြာလွန်းနေပါသည်။'
      );
      return { url: dataUrl, dataUrl, path: null, mode: 'firestore-data-url' };
    }
  }

  async function submitDeposit(event) {
    event?.preventDefault?.();
    const uid = getUid();
    if (!uid || !window.db) {
      toast('အကောင့်ဝင်ထားရန်လိုပါသည်။', 'error');
      return false;
    }

    const amount = safeNumber($('#depositAmount')?.value || app.selectedDepositAmount);
    if (amount < LIMITS.depositMin || amount > LIMITS.depositMax) {
      toast(`ငွေသွင်းပမာဏ ${formatNumber(LIMITS.depositMin)} - ${formatNumber(LIMITS.depositMax)} KS ဖြစ်ရမည်။`, 'error');
      return false;
    }

    const button = $('#submitDepositBtn');
    button.disabled = true;
    button.textContent = 'တင်နေသည်...';
    try {
      const proofFile = $('#depositProof')?.files?.[0];
      const proof = await prepareDepositProof(proofFile, uid);
      const method = app.paymentMethods.find(item => item.id === app.selectedDepositMethod);
      if (!hasUsablePaymentAccount(method)) {
        throw new Error('Admin ရဲ့ active ငွေလက်ခံအကောင့် မရှိသေးပါ။');
      }
      const depositData = {
        userId: uid,
        uid,
        username: app.user?.username || app.user?.userName || app.user?.fullName || 'User',
        amount,
        method: method.name,
        bankAccountId: method.docId || method.id,
        receiverAccountName: method.accountName,
        receiverAccountNumber: method.accountNumber,
        senderName: $('#depositSenderName')?.value.trim() || '',
        senderPhone: $('#depositSenderPhone')?.value.trim() || '',
        screenshotUrl: proof.url,
        proofUrl: proof.url,
        screenshot: proof.url,
        screenshotDataUrl: proof.dataUrl,
        proofStoragePath: proof.path,
        proofMode: proof.mode,
        status: 'pending',
        balanceCredited: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const depositRef = await withTimeout(window.db.collection('deposits').add(depositData), 20000, 'Deposit request သိမ်းရန် အချိန်ကြာလွန်းနေပါသည်။');
      notifyTelegramPayment('deposit', { ...depositData, requestId: depositRef.id });
      closeOverlay('depositModal');
      $('#depositForm')?.reset();
      selectDepositAmount(0);
      showDepositSuccess({ amount, method: method.name, requestId: depositRef.id });
      toast('ငွေသွင်းတောင်းဆိုမှု အောင်မြင်စွာပို့ပြီးပါပြီ။', 'success');
      window.SoundManager?.paymentReceive?.();
      return true;
    } catch (error) {
      console.error(error);
      toast(error.message || 'ငွေသွင်းတောင်းဆိုမှု မအောင်မြင်ပါ။', 'error');
      return false;
    } finally {
      button.disabled = false;
      button.textContent = 'ငွေသွင်းတောင်းဆိုမည်';
    }
  }

  function calculateWithdrawFee() {
    const amount = Math.max(0, safeNumber($('#withdrawAmount')?.value));
    const fee = Math.floor(amount * LIMITS.withdrawFeeRate);
    const receive = Math.max(0, amount - fee);
    if ($('#withdrawFee')) $('#withdrawFee').textContent = `${formatNumber(fee)} KS`;
    if ($('#withdrawReceive')) $('#withdrawReceive').textContent = `${formatNumber(receive)} KS`;
    return { amount, fee, receive };
  }

  function openWithdrawModal() {
    $('#withdrawAvailable').textContent = `${formatNumber(getCurrentBalance())} KS`;
    renderPaymentMethods();
    calculateWithdrawFee();
    openOverlay('withdrawModal');
  }

  async function submitWithdraw(event) {
    event?.preventDefault?.();
    const uid = getUid();
    if (!uid || !window.db) {
      toast('အကောင့်ဝင်ထားရန်လိုပါသည်။', 'error');
      return false;
    }

    const { amount, fee, receive } = calculateWithdrawFee();
    if (amount < LIMITS.withdrawMin || amount > LIMITS.withdrawMax) {
      toast(`ငွေထုတ်ပမာဏ ${formatNumber(LIMITS.withdrawMin)} - ${formatNumber(LIMITS.withdrawMax)} KS ဖြစ်ရမည်။`, 'error');
      return false;
    }
    if (amount > getCurrentBalance()) {
      toast('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
      return false;
    }

    const accountName = $('#withdrawAccountName')?.value.trim();
    const accountNumber = $('#withdrawAccountNumber')?.value.trim();
    if (!accountName || !accountNumber) {
      toast('အကောင့်အမည်နှင့် နံပါတ်ထည့်ပါ။', 'error');
      return false;
    }

    const button = $('#submitWithdrawBtn');
    button.disabled = true;
    button.textContent = 'တင်နေသည်...';
    try {
      const userRef = window.db.collection('users').doc(uid);
      const withdrawalRef = window.db.collection('withdrawals').doc();
      const method = app.paymentMethods.find(item => item.id === app.selectedWithdrawMethod);

      const nextBalance = await window.db.runTransaction(async tx => {
        const snap = await tx.get(userRef);
        const current = safeNumber(snap.data()?.balance, getCurrentBalance());
        if (current < amount) throw new Error('လက်ကျန်ငွေ မလုံလောက်ပါ။');
        const next = current - amount;
        tx.set(userRef, {
          balance: next,
          pendingWithdraw: firebase.firestore.FieldValue.increment(amount),
          balanceUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        tx.set(withdrawalRef, {
          userId: uid,
          uid,
          username: app.user?.username || app.user?.userName || app.user?.fullName || 'User',
          amount,
          fee,
          receiveAmount: receive,
          method: method?.name || app.selectedWithdrawMethod,
          accountName,
          accountNumber,
          status: 'pending',
          fundsReserved: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return next;
      });

      notifyTelegramPayment('withdraw', {
        uid,
        username: app.user?.username || app.user?.userName || app.user?.fullName || 'User',
        amount,
        fee,
        receiveAmount: receive,
        method: method?.name || app.selectedWithdrawMethod,
        accountName,
        accountNumber,
        requestId: withdrawalRef.id
      });

      await updateLobbyBalance(nextBalance, { save: false });
      closeOverlay('withdrawModal');
      $('#withdrawForm')?.reset();
      calculateWithdrawFee();
      toast(`ငွေထုတ်တောင်းဆိုမှု ${formatNumber(amount)} KS ပို့ပြီးပါပြီ။`, 'success');
      window.SoundManager?.withdraw?.();
      return true;
    } catch (error) {
      console.error(error);
      toast(error.message || 'ငွေထုတ်တောင်းဆိုမှု မအောင်မြင်ပါ။', 'error');
      return false;
    } finally {
      button.disabled = false;
      button.textContent = 'ငွေထုတ်တောင်းဆိုမည်';
    }
  }

  function appendTransaction(container, item, kind) {
    const row = document.createElement('div');
    row.className = 'm883-list-item';
    const left = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${kind === 'deposit' ? 'ငွေသွင်း' : 'ငွေထုတ်'} · ${formatNumber(item.amount)} KS`;
    const meta = document.createElement('div');
    meta.className = 'm883-muted';
    meta.style.fontSize = '11px';
    meta.style.marginTop = '4px';
    meta.textContent = `${item.method || '-'} · ${formatDate(item.createdAt)}`;
    left.append(title, meta);
    const status = document.createElement('span');
    status.className = `status ${String(item.status || 'pending').toLowerCase()}`;
    status.textContent = item.status || 'pending';
    row.append(left, status);
    container.appendChild(row);
  }

  async function loadTransactionHistory() {
    const container = $('#paymentHistoryList');
    if (!container) return;
    container.innerHTML = '<div class="m883-empty">မှတ်တမ်းဖတ်နေသည်...</div>';
    const uid = getUid();
    if (!uid || !window.db) return;

    try {
      const [depositsSnap, withdrawalsSnap] = await Promise.all([
        window.db.collection('deposits').where('userId', '==', uid).limit(100).get(),
        window.db.collection('withdrawals').where('userId', '==', uid).limit(100).get()
      ]);
      const rows = [];
      depositsSnap.forEach(doc => rows.push({ ...doc.data(), id: doc.id, kind: 'deposit' }));
      withdrawalsSnap.forEach(doc => rows.push({ ...doc.data(), id: doc.id, kind: 'withdraw' }));
      rows.sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt));
      container.replaceChildren();
      if (!rows.length) {
        container.innerHTML = '<div class="m883-empty">ငွေသွင်း/ထုတ် မှတ်တမ်းမရှိသေးပါ။</div>';
        return;
      }
      rows.forEach(item => appendTransaction(container, item, item.kind));
    } catch (error) {
      console.error(error);
      container.innerHTML = '<div class="m883-empty m883-danger">မှတ်တမ်းဖတ်မရပါ။</div>';
    }
  }

  function renderGameHistory() {
    const container = $('#gameHistoryList');
    if (!container) return;
    let entries = [];
    try { entries = JSON.parse(localStorage.getItem('gameHistoryEntries') || '[]'); } catch (_) {}
    container.replaceChildren();
    if (!entries.length) {
      container.innerHTML = '<div class="m883-empty">Game history မရှိသေးပါ။</div>';
      return;
    }
    entries.forEach(item => {
      const row = document.createElement('div');
      row.className = 'm883-list-item';
      const left = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = `${String(item.winType || 'normal').toUpperCase()} · +${formatNumber(item.win)} KS`;
      const meta = document.createElement('div');
      meta.className = 'm883-muted';
      meta.style.fontSize = '11px';
      meta.textContent = `${new Date(item.date).toLocaleString()} · Bet ${formatNumber(item.bet)} KS`;
      left.append(title, meta);
      row.append(left);
      container.appendChild(row);
    });
  }

  async function loadGlobalTop() {
    const container = $('#globalTopList');
    if (!container || !window.db) return;
    container.innerHTML = '<div class="m883-empty">Leaderboard ဖတ်နေသည်...</div>';
    try {
      const snap = await window.db.collection('globalWins').orderBy('totalWin', 'desc').limit(10).get();
      container.replaceChildren();
      let rank = 0;
      snap.forEach(doc => {
        rank++;
        const data = doc.data();
        const row = document.createElement('div');
        row.className = 'm883-list-item';
        const name = document.createElement('strong');
        name.textContent = `${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank + '.'} ${data.playerName || 'Anonymous'}`;
        const amount = document.createElement('strong');
        amount.className = 'm883-good';
        amount.textContent = `${formatNumber(data.totalWin)} KS`;
        row.append(name, amount);
        container.appendChild(row);
      });
      if (!rank) container.innerHTML = '<div class="m883-empty">Leaderboard မရှိသေးပါ။</div>';
    } catch (error) {
      console.error(error);
      container.innerHTML = '<div class="m883-empty m883-danger">Leaderboard ဖတ်မရပါ။</div>';
    }
  }

  function openHistoryModal() {
    openOverlay('historyModal');
    loadTransactionHistory();
    renderGameHistory();
    loadGlobalTop();
  }

  // ------------------------------------------------------------------
  // Cashback
  // ------------------------------------------------------------------
  async function fetchCashbackData() {
    const uid = getUid();
    if (!uid || !window.db) return null;
    const snap = await window.db.collection('users').doc(uid).get();
    const data = snap.data() || {};
    return {
      userName: data.userName || data.username || data.displayName || 'User',
      totalDeposit: safeNumber(data.totalDeposit),
      currentDay: safeNumber(data.currentDay),
      cashbackAvailable: safeNumber(data.cashbackAvailable),
      cashbackReady: data.cashbackReady === true,
      lastDepositDate: data.lastDepositDate || '',
      depositHistory: Array.isArray(data.depositHistory) ? data.depositHistory : []
    };
  }

  async function renderCashback() {
    const data = await fetchCashbackData();
    if (!data) return;
    const amount = data.cashbackAvailable || Math.floor(data.totalDeposit * LIMITS.cashbackRate);
    $('#cashbackTotal').textContent = `${formatNumber(data.totalDeposit)} KS`;
    $('#cashbackAmount').textContent = `${formatNumber(amount)} KS`;
    $('#cashbackDay').textContent = `${Math.min(data.currentDay, LIMITS.cashbackDays)} / ${LIMITS.cashbackDays}`;
    $('#cashbackProgress').style.width = `${Math.min(100, data.currentDay / LIMITS.cashbackDays * 100)}%`;

    const days = $('#cashbackDays');
    days.replaceChildren();
    for (let i = 1; i <= LIMITS.cashbackDays; i++) {
      const day = document.createElement('div');
      day.className = `m883-day${i < data.currentDay || (data.cashbackReady && i <= LIMITS.cashbackDays) ? ' done' : i === Math.max(1, data.currentDay) ? ' active' : ''}`;
      day.innerHTML = `<strong>${i === LIMITS.cashbackDays ? '🎁' : i}</strong><small>Day ${i}</small>`;
      days.appendChild(day);
    }

    const button = $('#claimCashbackBtn');
    const canClaim = data.cashbackReady && amount > 0;
    button.disabled = !canClaim;
    button.textContent = canClaim ? `${formatNumber(amount)} KS CLAIM` : '5 DAYS COMPLETE လုပ်ပါ';

    const history = $('#cashbackHistoryList');
    history.replaceChildren();
    if (!data.depositHistory.length) {
      history.innerHTML = '<div class="m883-empty">Cashback deposit history မရှိသေးပါ။</div>';
    } else {
      data.depositHistory.slice().reverse().forEach(item => {
        const row = document.createElement('div');
        row.className = 'm883-list-item';
        const title = document.createElement('strong');
        title.textContent = `+${formatNumber(item.amount)} KS`;
        const date = document.createElement('span');
        date.className = 'm883-muted';
        date.textContent = formatDate(item.date);
        row.append(title, date);
        history.appendChild(row);
      });
    }
  }

  async function updateCashbackNavBadge() {
    try {
      const data = await fetchCashbackData();
      const ready = data?.cashbackReady && data?.cashbackAvailable > 0;
      window.Mini883Canvas?.setNotification?.('daily', ready ? 1 : 0);
      return ready;
    } catch (_) {
      return false;
    }
  }

  async function claimCashback() {
    const uid = getUid();
    if (!uid || !window.db) return false;
    try {
      const userRef = window.db.collection('users').doc(uid);
      const result = await window.db.runTransaction(async tx => {
        const snap = await tx.get(userRef);
        const data = snap.data() || {};
        const amount = safeNumber(data.cashbackAvailable);
        if (!data.cashbackReady || amount <= 0) throw new Error('Cashback မရသေးပါ။');
        const nextBalance = safeNumber(data.balance) + amount;
        tx.update(userRef, {
          balance: nextBalance,
          cashbackAvailable: 0,
          cashbackReady: false,
          totalDeposit: 0,
          currentDay: 0,
          depositHistory: [],
          lastDepositDate: '',
          cashbackClaimedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { amount, nextBalance };
      });
      updateLobbyBalance(result.nextBalance, { save: false });
      toast(`🎉 Cashback ${formatNumber(result.amount)} KS ရရှိပါသည်။`, 'success');
      window.SoundManager?.coinRain?.();
      await renderCashback();
      await updateCashbackNavBadge();
      return true;
    } catch (error) {
      toast(error.message || 'Cashback claim မရပါ။', 'error');
      return false;
    }
  }

  async function recordDepositForCashback(userId, depositAmount, userName) {
    const amount = safeNumber(depositAmount);
    if (!userId || amount <= 0 || !window.db) return false;
    const ref = window.db.collection('users').doc(userId);
    await window.db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.data() || {};
      const now = new Date();
      const today = now.toDateString();
      let currentDay = safeNumber(data.currentDay);
      let totalDeposit = safeNumber(data.totalDeposit);
      let history = Array.isArray(data.depositHistory) ? data.depositHistory.slice(-49) : [];
      if (data.lastDepositDate !== today) {
        currentDay += 1;
        if (currentDay > LIMITS.cashbackDays) {
          currentDay = 1;
          totalDeposit = 0;
          history = [];
        }
      }
      totalDeposit += amount;
      history.push({ date: firebase.firestore.Timestamp.now(), amount, userName: userName || data.userName || 'User' });
      const ready = currentDay >= LIMITS.cashbackDays;
      tx.set(ref, {
        currentDay,
        totalDeposit,
        lastDepositDate: today,
        depositHistory: history,
        cashbackAvailable: ready ? Math.floor(totalDeposit * LIMITS.cashbackRate) : 0,
        cashbackReady: ready,
        userName: userName || data.userName || 'User'
      }, { merge: true });
    });
    return true;
  }

  async function openCashbackModal() {
    openOverlay('cashbackModal');
    try { await renderCashback(); } catch (error) { console.error(error); }
  }

  // ------------------------------------------------------------------
  // Journey
  // ------------------------------------------------------------------
  function normalizeJourney(data = {}) {
    return {
      currentWorld: Math.max(1, safeNumber(data.currentWorld, 1)),
      worldsUnlocked: Math.max(1, Math.min(4, safeNumber(data.worldsUnlocked, 1))),
      totalSpins: Math.max(0, safeNumber(data.totalSpins)),
      biggestWin: Math.max(0, safeNumber(data.biggestWin)),
      worldProgress: { 1: 0, 2: 0, 3: 0, 4: 0, ...(data.worldProgress || {}) }
    };
  }

  async function loadJourney() {
    const uid = getUid();
    if (!uid || !window.db) return app.journey;
    try {
      const snap = await window.db.collection('users').doc(uid).collection('journey').doc('progress').get();
      app.journey = normalizeJourney(snap.exists ? snap.data() : {});
    } catch (error) {
      console.error('Journey load error:', error);
    }
    renderJourney();
    return app.journey;
  }

  function renderJourney() {
    $('#journeyUnlocked').textContent = `${app.journey.worldsUnlocked} / 4`;
    $('#journeySpins').textContent = formatNumber(app.journey.totalSpins);
    $('#journeyBiggestWin').textContent = `${formatNumber(app.journey.biggestWin)} KS`;
    const container = $('#journeyWorlds');
    if (!container) return;
    container.replaceChildren();
    const required = { 1: 20, 2: 15, 3: 25, 4: 30 };
    const names = { 1: 'Crocodile Land', 2: 'Mega Ways', 3: 'Phoenix Realm', 4: 'Super Ways' };
    for (let i = 1; i <= 4; i++) {
      const locked = i > app.journey.worldsUnlocked;
      const progress = safeNumber(app.journey.worldProgress[i]);
      const card = document.createElement('div');
      card.className = `m883-world${locked ? ' locked' : ''}`;
      const h = document.createElement('h3');
      h.textContent = `${locked ? '🔒' : '🌍'} World ${i}`;
      const name = document.createElement('div');
      name.textContent = names[i];
      const meta = document.createElement('div');
      meta.className = 'm883-muted';
      meta.style.margin = '8px 0';
      meta.textContent = `${progress} / ${required[i]} Spins`;
      const progressBar = document.createElement('div');
      progressBar.className = 'm883-progress';
      progressBar.innerHTML = `<span style="width:${Math.min(100, progress / required[i] * 100)}%"></span>`;
      const button = document.createElement('button');
      button.className = 'm883-btn teal';
      button.style.marginTop = '12px';
      button.disabled = locked;
      button.textContent = locked ? 'LOCKED' : 'ENTER';
      button.addEventListener('click', () => enterWorld(i));
      card.append(h, name, meta, progressBar, button);
      container.appendChild(card);
    }
  }

  async function enterWorld(worldId) {
    const world = safeNumber(worldId, 1);
    if (world > app.journey.worldsUnlocked) {
      toast('Previous world ကိုအရင်ပြီးအောင်ကစားပါ။', 'error');
      return false;
    }
    app.journey.currentWorld = world;
    const uid = getUid();
    if (uid && window.db) {
      await window.db.collection('users').doc(uid).collection('journey').doc('progress').set(app.journey, { merge: true });
    }
    closeOverlay('journeyModal');
    const map = { 1: 'crocodile', 2: 'megaWays', 3: 'phoenix', 4: 'superWays' };
    return openGame(map[world]);
  }

  async function updateWorldProgress(winAmount = 0) {
    const uid = getUid();
    if (!uid || !window.db) return;
    const world = Math.max(1, Math.min(4, safeNumber(app.journey.currentWorld, 1)));
    app.journey.totalSpins++;
    app.journey.biggestWin = Math.max(app.journey.biggestWin, safeNumber(winAmount));
    app.journey.worldProgress[world] = safeNumber(app.journey.worldProgress[world]) + 1;
    const required = { 1: 20, 2: 15, 3: 25, 4: 30 };
    if (app.journey.worldProgress[world] >= required[world] && world < 4 && app.journey.worldsUnlocked === world) {
      app.journey.worldsUnlocked++;
      toast(`World ${world} Complete! World ${world + 1} ဖွင့်ပြီးပါပြီ။`, 'success');
    }
    try {
      await window.db.collection('users').doc(uid).collection('journey').doc('progress').set(app.journey, { merge: true });
    } catch (error) {
      console.error('Journey save error:', error);
    }
    renderJourney();
  }

  async function openJourneyModal() {
    openOverlay('journeyModal');
    await loadJourney();
  }

  // ------------------------------------------------------------------
  // User chat
  // ------------------------------------------------------------------
  function messageDate(message) {
    return timestampMs(message.timestamp);
  }

  function renderUserMessages(messages) {
    const area = $('#userChatMessages');
    if (!area) return;
    area.replaceChildren();
    if (!messages.length) {
      area.innerHTML = '<div class="m883-empty">မင်္ဂလာပါ။ ဘယ်လိုကူညီပေးရမလဲ။</div>';
      return;
    }
    messages.forEach(message => {
      const wrap = document.createElement('div');
      wrap.className = `user-chat-message ${message.sender === 'user' ? 'user' : 'admin'}`;
      const bubble = document.createElement('div');
      bubble.className = 'user-message-bubble';
      bubble.textContent = message.text || '';
      const time = document.createElement('div');
      time.className = 'user-message-time';
      time.textContent = formatDate(message.timestamp);
      wrap.append(bubble, time);
      area.appendChild(wrap);
    });
    area.scrollTop = area.scrollHeight;
  }

  function setupUserChatListener() {
    app.chatUnsubscribe?.();
    const uid = getUid();
    if (!uid || !window.db) return;
    app.chatUnsubscribe = window.db.collection('chatMessages').where('userId', '==', uid).limit(100).onSnapshot(snapshot => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => messageDate(a) - messageDate(b));
      const unread = messages.filter(item => item.sender === 'admin' && item.read === false).length;
      window.Mini883Canvas?.setNotification?.('chat', unread);
      const badge = $('#chatBadge');
      if (badge) {
        badge.textContent = unread > 99 ? '99+' : String(unread);
        badge.style.display = unread ? 'flex' : 'none';
      }
      if (app.chatOpen) {
        renderUserMessages(messages);
        markUserMessagesAsRead();
      }
    }, error => console.error('Chat listener error:', error));
  }

  async function markUserMessagesAsRead() {
    const uid = getUid();
    if (!uid || !window.db) return;
    try {
      const snap = await window.db.collection('chatMessages')
        .where('userId', '==', uid)
        .where('sender', '==', 'admin')
        .where('read', '==', false)
        .get();
      if (snap.empty) return;
      const batch = window.db.batch();
      snap.forEach(doc => batch.update(doc.ref, { read: true }));
      await batch.commit();
    } catch (error) {
      console.warn('Mark chat read failed:', error.message);
    }
  }

  function toggleChatModal() {
    const modal = $('#userChatModal');
    if (!modal) return;
    app.chatOpen = !modal.classList.contains('open');
    if (app.chatOpen) {
      openOverlay('userChatModal');
      markUserMessagesAsRead();
    } else {
      closeOverlay('userChatModal');
    }
  }

  function closeUserChat() {
    app.chatOpen = false;
    closeOverlay('userChatModal');
  }

  async function sendUserMessage() {
    const input = $('#userChatInput');
    const text = input?.value.trim();
    const uid = getUid();
    if (!text || !uid || !window.db) return false;
    input.value = '';
    try {
      await window.db.collection('chatMessages').add({
        userId: uid,
        sender: 'user',
        senderName: app.user?.username || app.user?.userName || app.user?.fullName || 'User',
        text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
      });
      await window.db.collection('users').doc(uid).set({
        lastMessage: text,
        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error(error);
      toast('စာပို့မရပါ။', 'error');
      input.value = text;
      return false;
    }
  }

  function handleUserChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendUserMessage();
    }
  }

  // ------------------------------------------------------------------
  // Settings
  // ------------------------------------------------------------------
  function readGameSettings() {
    const defaults = { sound: true, bgm: true, vibration: true, volume: 70, language: 'my', theme: 'neon', notifications: true };
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('gameSettings') || '{}') }; }
    catch (_) { return defaults; }
  }

  function saveGameSettings(settings) {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    applyGameSettings(settings);
  }

  function applyGameSettings(settings = readGameSettings()) {
    document.body.classList.remove('theme-neon', 'theme-purple', 'theme-green', 'theme-red');
    document.body.classList.add(`theme-${settings.theme || 'neon'}`);
    window.SoundManager?.toggle?.(settings.sound !== false);
    window.SoundManager?.setMasterVolume?.(safeNumber(settings.volume, 70) / 100);
    if (settings.bgm === false || settings.sound === false) window.SoundManager?.stopBGM?.();
    $('#soundToggle') && ($('#soundToggle').checked = settings.sound !== false);
    $('#bgmToggle') && ($('#bgmToggle').checked = settings.bgm !== false);
    $('#vibrationToggle') && ($('#vibrationToggle').checked = settings.vibration !== false);
    $('#notificationToggle') && ($('#notificationToggle').checked = settings.notifications !== false);
    $('#volumeSlider') && ($('#volumeSlider').value = safeNumber(settings.volume, 70));
    $('#languageSelect') && ($('#languageSelect').value = settings.language || 'my');
    $('#themeSelect') && ($('#themeSelect').value = settings.theme || 'neon');
  }

  function bindSettings() {
    const controls = ['soundToggle', 'bgmToggle', 'vibrationToggle', 'notificationToggle', 'volumeSlider', 'languageSelect', 'themeSelect'];
    controls.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(id === 'volumeSlider' ? 'input' : 'change', () => {
        const settings = readGameSettings();
        settings.sound = $('#soundToggle').checked;
        settings.bgm = $('#bgmToggle').checked;
        settings.vibration = $('#vibrationToggle').checked;
        settings.notifications = $('#notificationToggle').checked;
        settings.volume = safeNumber($('#volumeSlider').value, 70);
        settings.language = $('#languageSelect').value;
        settings.theme = $('#themeSelect').value;
        saveGameSettings(settings);
        if (id === 'soundToggle' && settings.sound) window.SoundManager?.button?.();
        if (id === 'bgmToggle') settings.bgm ? window.SoundManager?.playBGM?.() : window.SoundManager?.stopBGM?.();
        if (id === 'vibrationToggle' && settings.vibration) navigator.vibrate?.(40);
      });
    });
  }

  function openSettingsModal() {
    applyGameSettings();
    openOverlay('settingsModal');
  }

  // ------------------------------------------------------------------
  // UI binding and compatibility exports
  // ------------------------------------------------------------------
  function bindTabs() {
    $$('.m883-tabs').forEach(tabBar => {
      tabBar.addEventListener('click', event => {
        const button = event.target.closest('[data-panel]');
        if (!button) return;
        const modal = button.closest('.m883-modal');
        $$('.m883-tab', tabBar).forEach(item => item.classList.toggle('active', item === button));
        $$('.m883-tab-panel', modal).forEach(panel => panel.classList.toggle('active', panel.id === button.dataset.panel));
      });
    });
  }

  function bindStaticUI() {
    document.addEventListener('click', event => {
      const close = event.target.closest('[data-close]');
      if (close) closeOverlay(close.dataset.close);
      if (event.target.classList.contains('m883-overlay')) closeOverlay(event.target.id);
      const gameClose = event.target.closest('[data-close-game]');
      if (gameClose) closeGame(true);
    });

    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (app.activeGame) closeGame(true);
      else closeAllOverlays();
    });

    $('#depositForm')?.addEventListener('submit', submitDeposit);
    $('#withdrawForm')?.addEventListener('submit', submitWithdraw);
    $('#withdrawAmount')?.addEventListener('input', calculateWithdrawFee);
    $('#copyDepositAccount')?.addEventListener('click', copyDepositAccountNumber);
    $('#claimCashbackBtn')?.addEventListener('click', claimCashback);
    $('#userChatSend')?.addEventListener('click', sendUserMessage);
    $('#userChatInput')?.addEventListener('keydown', handleUserChatKeyPress);
    $('#logoutBtn')?.addEventListener('click', logout);
    $('#enableNotificationsBtn')?.addEventListener('click', async () => {
      const token = await window.requestFCMToken?.();
      toast(token ? 'Notifications ဖွင့်ပြီးပါပြီ။' : 'Notification permission မရပါ။', token ? 'success' : 'error');
    });

    $$('.m883-amount', $('#depositAmounts')).forEach(button => {
      button.addEventListener('click', () => selectDepositAmount(button.dataset.amount));
    });

    bindTabs();
    bindSettings();
  }

  window.Mini883Bridge = {
    openGame,
    closeGame,
    openDeposit: openDepositModal,
    openWithdraw: openWithdrawModal,
    openHistory: openHistoryModal,
    openChat: toggleChatModal,
    openCashback: openCashbackModal,
    openJourney: openJourneyModal,
    openSettings: openSettingsModal,
    openProfile: openProfileModal,
    official: () => toast('Official link ကို settings မှ သတ်မှတ်နိုင်ပါတယ်။'),
    toggleBgm: () => {
      const settings = readGameSettings();
      settings.bgm = !settings.bgm;
      saveGameSettings(settings);
      settings.bgm ? window.SoundManager?.playBGM?.() : window.SoundManager?.stopBGM?.();
      return settings.bgm;
    }
  };

  Object.assign(window, {
    safeNumber,
    formatNumber,
    updateLobbyBalance,
    getCurrentBalance,
    showLobbyNotification: toast,
    showNotification: toast,
    playButtonSound,
    openModal: openOverlay,
    closeModal: closeOverlay,
    toggleModal: id => document.getElementById(id)?.classList.contains('open') ? closeOverlay(id) : openOverlay(id),
    openSettingsModal,
    closeSettingsModal: () => closeOverlay('settingsModal'),
    openHistoryModal,
    closeHistoryModal: () => closeOverlay('historyModal'),
    openDepositModal,
    openDepositPopup1: openDepositModal,
    closeDepositPopup1: () => closeOverlay('depositModal'),
    openWithdrawModal,
    openWithdrawPopup1: openWithdrawModal,
    closeWithdrawPopup1: () => closeOverlay('withdrawModal'),
    submitDeposit,
    submitWithdraw,
    submitWithdrawFinal: submitWithdraw,
    calculateWithdrawFee,
    renderPaymentMethods,
    loadPaymentMethods,
    copyDepositAccountNumber,
    notifyTelegramPayment,
    loadTransactionHistory,
    renderTransactions: loadTransactionHistory,
    openCashbackModal,
    closeCashbackModal: () => closeOverlay('cashbackModal'),
    claimCashback,
    updateCashbackNavBadge,
    recordDepositForCashback,
    openJourneyModal,
    loadJourney,
    enterWorld,
    updateWorldProgress,
    toggleChatModal,
    closeUserChat,
    sendUserMessage,
    handleUserChatKeyPress,
    showGameContainer: () => openGame('crocodile'),
    hideGameContainer: () => closeGame(true),
    openJackpotWaysGame: () => openGame('jackpotWays'),
    closeJackpotWaysGame: () => closeGame(true),
    openMegaWaysGame: () => openGame('megaWays'),
    closeMegaWaysGame: () => closeGame(true),
    openSuperWaysGame: () => openGame('superWays'),
    openSuperWaysGame1: () => openGame('superWays'),
    openSuperWaysGame2: () => openGame('megaWays'),
    openSuperWaysGame3: () => openGame('phoenix'),
    closeSuperWaysGame: () => closeGame(true),
    openPhoenixGame: () => openGame('phoenix'),
    closePhoenixGame: () => closeGame(true),
    openCardGame: () => openGame('card'),
    closeCardGame: () => closeGame(true),
    initWinAnimation,
    applyLanguage: () => {}
  });

  document.addEventListener('DOMContentLoaded', () => {
    bindStaticUI();
    applyGameSettings();
    initWinAnimation();
    initAuth();
    renderProfile();
  }, { once: true });
})();
