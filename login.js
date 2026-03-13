
// ===== FIREBASE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login system initializing...');

    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded!');
        showFatalError('Firebase SDK not loaded. Please refresh the page.');
        return;
    }

    // Check if Firebase is initialized
    if (firebase.apps.length === 0) {
        console.error('❌ Firebase not initialized!');
        showFatalError('Firebase not initialized. Please check firebase-config.js');
        return;
    }

    // Initialize Firestore
    try {
        window.db = firebase.firestore();
        console.log('✅ Firebase Firestore initialized');
    } catch (e) {
        console.error('❌ Failed to initialize Firestore:', e);
        showFatalError('Failed to initialize Firestore: ' + e.message);
        return;
    }

    // Check connection
    checkFirebaseConnection();

    // Check auth state
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ User logged in:', user.uid);

            // Get user data from Firestore
            const userDoc = await window.db.collection('users').doc(user.uid).get();

            if (userDoc.exists) {
                const userData = userDoc.data();

                window.currentUser = {
                    id: user.uid,
                    username: userData.username,
                    balance: userData.balance || 10000,
                    level: userData.level || 1,
                    vip: userData.vip || 0,
                    role: userData.role || 'user',
                    createdAt: userData.createdAt,
                    lastLogin: new Date().toISOString()
                };

                // Update last login
                await window.db.collection('users').doc(user.uid).update({
                    lastLogin: new Date().toISOString()
                }).catch(e => console.log('Last login update failed:', e));

                localStorage.setItem('currentUser', JSON.stringify(window.currentUser));

                // Hide login, show game
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('gameContainer').style.display = 'flex';

                // Update UI
                if (typeof updateUserUI === 'function') {
                    updateUserUI(window.currentUser);
                }

                
                // Update gameState if exists
                if (typeof window.gameState !== 'undefined') {
                    window.gameState.balance = window.currentUser.balance;
                    window.gameState.userLevel = window.currentUser.level;
                    window.gameState.vipLevel = window.currentUser.vip;
                }

                document.dispatchEvent(new Event('userLoggedIn'));
            }
        } else {
            console.log('❌ User logged out');
            window.currentUser = null;                                                         localStorage.removeItem('currentUser');
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('gameContainer').style.display = 'none';
        }
    });

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
});

// ===== CHECK FIREBASE CONNECTION =====
function checkFirebaseConnection() {
    if (!window.db) return;

    window.db.collection('test').limit(1).get()
        .then(() => console.log('✅ Firebase connection OK'))
        .catch((error) => {
            console.warn('⚠️ Firebase connection issue:', error);
            const msgEl = document.getElementById('loginMessage');
            if (msgEl) showMessage(msgEl, 'Firebase connection issue. Some features may be limited.', 'warning');
        });
}

// ===== SHOW FATAL ERROR =====
function showFatalError(message) {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
        loginScreen.innerHTML = `
            <div class="login-box" style="text-align: center;">
                <h2 class="form-title"><i class="fas fa-exclamation-triangle" style="color: #ff5252;"></i> Error</h2>
                <div class="message error" style="color: #ff5252;">${message}</div>
                <button onclick="location.reload()" style="margin-top: 20px;">Refresh Page</button>
            </div>
        `;
    }
}

// ===== TOGGLE PASSWORD =====
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// ===== TOGGLE FORMS =====
function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    clearMessages();
}

function showLoginForm() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    clearMessages();
}

function clearMessages() {
    const loginMsg = document.getElementById('loginMessage');
    const signupMsg = document.getElementById('signupMessage');
    if (loginMsg) loginMsg.innerHTML = '';
    if (signupMsg) signupMsg.innerHTML = '';
}

// ===== SHOW MESSAGE =====
function showMessage(element, text, type) {
    if (!element) return;
    element.innerHTML = text;
    element.className = 'message ' + type;
    setTimeout(() => {
        if (element) {
            element.innerHTML = '';
            element.className = 'message';
        }
    }, 3000);
}

// ===== HANDLE LOGIN =====
async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');

    if (!username || !password) {
        showMessage(messageEl, 'အသုံးပြုသူအမည်နှင့် စကားဝှက် ထည့်ပါ။', 'error');
        return;
    }

    showMessage(messageEl, 'ဝင်နေပါသည်...', 'info');

    try {
        // Use username as email for Firebase Auth
        const email = username + '@local.game';
        await firebase.auth().signInWithEmailAndPassword(email, password);

        showMessage(messageEl, 'အောင်မြင်ပါသည်။', 'success');

        // Clear form
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';

    } catch (error) {
        console.error('Login error:', error);

        if (error.code === 'auth/user-not-found') {
            showMessage(messageEl, 'အသုံးပြုသူ မရှိပါ။', 'error');
        } else if (error.code === 'auth/wrong-password') {
            showMessage(messageEl, 'စကားဝှက် မှားနေပါသည်။', 'error');
        } else {
            showMessage(messageEl, 'ဝင်မရပါ။ ထပ်ကြိုးစားပါ။', 'error');
        }
    }
}

// ===== HANDLE SIGNUP =====
async function handleSignup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const messageEl = document.getElementById('signupMessage');

    if (!username || !password) {
        showMessage(messageEl, 'အသုံးပြုသူအမည်နှင့် စကားဝှက် ထည့်ပါ။', 'error');
        return;
    }

    if (username.length < 3) {
        showMessage(messageEl, 'အသုံးပြုသူအမည် အနည်းဆုံး ၃လုံးရှိရမယ်။', 'error');
        return;
    }

    if (password.length < 4) {
        showMessage(messageEl, 'စကားဝှက် အနည်းဆုံး ၄လုံးရှိရမယ်။', 'error');
        return;
    }

    showMessage(messageEl, 'အကောင့်ဖွင့်နေပါသည်...', 'info');

    try {
        // Check if username already exists in Firestore
        const usernameQuery = await window.db.collection('users')
            .where('username', '==', username)
            .get();

        if (!usernameQuery.empty) {
            showMessage(messageEl, 'ဒီအမည်ကို သုံးပြီးသားရှိပါသည်။', 'error');
            return;
        }

        // Create user with Firebase Auth (using username as email)
        const email = username + '@local.game';
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await window.db.collection('users').doc(user.uid).set({
            username: username,
            email: email,
            balance: 10000,
            level: 1,
            vip: 0,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });

        showMessage(messageEl, 'အကောင့်ဖွင့်ပြီးပါပြီ။', 'success');

        // Clear form
        document.getElementById('signupUsername').value = '';
        document.getElementById('signupPassword').value = '';

    } catch (error) {
        console.error('Signup error:', error);

        if (error.code === 'auth/email-already-in-use') {
            showMessage(messageEl, 'ဒီအမည်ကို သုံးပြီးသားရှိပါသည်။', 'error');
        } else {
            showMessage(messageEl, 'အကောင့်ဖွင့်မရပါ။ ထပ်ကြိုးစားပါ။', 'error');
        }
    }
}

// ===== LOGOUT =====
function logoutUser() {
    firebase.auth().signOut();
}

// ===== UPDATE USER UI =====
function updateUserUI(user) {
    console.log('Updating UI for user:', user.username);

    const usernameEl = document.getElementById('usernameMini');
    if (usernameEl) usernameEl.textContent = user.username;

    const balanceEl = document.getElementById('balanceAmount');
    if (balanceEl) balanceEl.textContent = formatNumber(user.balance);

    const levelEl = document.getElementById('userLevel');
    if (levelEl) levelEl.textContent = user.level;

    const vipEl = document.getElementById('vipLevel');
    if (vipEl) vipEl.textContent = user.vip;
}

// ===== FORMAT NUMBER =====
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ===== CHECK ORIENTATION =====
function checkOrientation() {
    const warning = document.getElementById('orientationWarning');
    if (!warning) return;
    warning.style.display = window.innerHeight > window.innerWidth ? 'flex' : 'none';
}

// ===== EXPORT FUNCTIONS =====
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.showSignupForm = showSignupForm;
window.showLoginForm = showLoginForm;
window.togglePassword = togglePassword;
window.logoutUser = logoutUser;
window.updateUserUI = updateUserUI;
