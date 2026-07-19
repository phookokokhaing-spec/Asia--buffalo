#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# The script is intended to be copied/extracted into the Mini883 project root.
PROJECT = Path.cwd()
GAME_JS = PROJECT / 'games' / 'phoenix-game' / 'game.js'
LOBBY_CSS = PROJECT / 'css' / 'lobby-integrated.css'


def fail(message: str) -> None:
    raise SystemExit(f'ERROR: {message}')


if not GAME_JS.exists():
    fail(f'Cannot find {GAME_JS}. Run this script from the Mini883 project root.')

backup = GAME_JS.with_suffix('.js.before-phoenix-hotfix-v1.bak')
if not backup.exists():
    shutil.copy2(GAME_JS, backup)

text = GAME_JS.read_text(encoding='utf-8')
original = text

# 1) Restore the spin image independently. The old function only worked when
# BOTH #img-spin and #img-stop existed, which is fragile in the Phoenix markup.
spin_state_pattern = re.compile(
    r"function\s+setSpinButtonState\s*\(isSpinning\)\s*\{.*?\n\}\s*\n\s*function\s+disableControls",
    re.S,
)
spin_state_replacement = r'''function setSpinButtonState(isSpinning) {
    const spinWrap = document.getElementById('fb-spin');
    const imgSpin = document.getElementById('img-spin');
    const imgStop = document.getElementById('img-stop');

    if (imgSpin) {
        imgSpin.classList.toggle('hidden', Boolean(isSpinning));
        imgSpin.style.display = isSpinning ? 'none' : 'block';
        imgSpin.style.visibility = isSpinning ? 'hidden' : 'visible';
        imgSpin.style.opacity = isSpinning ? '0' : '1';
    }

    if (imgStop) {
        imgStop.classList.toggle('hidden', !isSpinning);
        imgStop.style.display = isSpinning ? 'block' : 'none';
        imgStop.style.visibility = isSpinning ? 'visible' : 'hidden';
        imgStop.style.opacity = isSpinning ? '1' : '0';
    }

    // Never let the clickable spin wrapper disappear.
    if (spinWrap) {
        spinWrap.style.display = 'flex';
        spinWrap.style.visibility = 'visible';
        spinWrap.style.opacity = '1';
        spinWrap.style.pointerEvents = 'auto';
    }
}

function disableControls'''
text, count = spin_state_pattern.subn(spin_state_replacement, text, count=1)
if count != 1:
    fail('Could not locate setSpinButtonState() safely. No changes were written.')

# 2) Make the parent animation promise resolve even if sound code or callback fails.
trigger_pattern = re.compile(
    r"function\s+triggerWinAnimation\s*\(winResult\)\s*\{.*?\n\}\s*(?=//\s*=+\s*\n//\s*11\.\s*GAME STATS)",
    re.S,
)
trigger_replacement = r'''function triggerWinAnimation(winResult) {
    return new Promise(function (resolve) {
        const totalWin = safeNumber(winResult?.totalWin);
        const winLines = Array.isArray(winResult?.winLines)
            ? winResult.winLines
            : [];

        const winInfo = getWinType(totalWin);
        const winType = winInfo.type;
        const duration = winInfo.duration || 7000;

        let finished = false;
        let fallbackTimer = null;

        function finishAnimation() {
            if (finished) return;
            finished = true;

            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
                fallbackTimer = null;
            }

            console.log('✅ Phoenix WinAnimation complete');
            resolve();
        }

        fallbackTimer = setTimeout(
            finishAnimation,
            Math.max(2500, duration + 1500)
        );

        const parentWinAnim =
            window.parent &&
            window.parent !== window &&
            window.parent.winAnim &&
            typeof window.parent.winAnim.trigger === 'function'
                ? window.parent.winAnim
                : null;

        console.log('🎬 Phoenix WinAnimation called:', winType, totalWin);

        try {
            if (winType && parentWinAnim) {
                parentWinAnim.trigger(winType, totalWin, {
                    duration: duration,
                    onComplete: finishAnimation
                });
            } else {
                console.warn('⚠️ Parent WinAnimation unavailable');
                finishAnimation();
            }
        } catch (error) {
            console.error('❌ Phoenix WinAnimation trigger error:', error);
            finishAnimation();
        }

        // Sound failure must never reject/stall the animation Promise.
        try {
            playWinSound(winType, winLines);
        } catch (soundError) {
            console.warn('⚠️ Phoenix win sound failed:', soundError);
        }
    });
}

'''
text, count = trigger_pattern.subn(trigger_replacement, text, count=1)
if count != 1:
    fail('Could not locate triggerWinAnimation() safely. No changes were written.')

# 3) Ensure a normal manual win restores the button even if the animation rejects.
normal_await_pattern = re.compile(
    r"await\s+triggerWinAnimation\(winResult\);\s*\n\s*updateUI\(\);",
    re.S,
)
normal_await_replacement = r'''try {
                await triggerWinAnimation(winResult);
            } catch (animationError) {
                console.error('❌ Phoenix animation wait failed:', animationError);
            } finally {
                // Do not interfere with scatter/free-spin or auto-spin state.
                if (!state.isFreeSpin && !state.autoSpin && scatterResult.count < 2) {
                    state.isSpinning = false;
                    setSpinButtonState(false);
                    disableControls(false);
                }
            }
            updateUI();'''
text, count = normal_await_pattern.subn(normal_await_replacement, text, count=1)
if count != 1:
    fail('Could not locate the normal await triggerWinAnimation(winResult) block safely.')

GAME_JS.write_text(text, encoding='utf-8')

# 4) Append Phoenix viewport-fullscreen rules while keeping a floating Lobby button.
if LOBBY_CSS.exists():
    css = LOBBY_CSS.read_text(encoding='utf-8')
    marker = '/* PHOENIX HOTFIX V1: REAL FULLSCREEN */'
    if marker not in css:
        css += r'''

/* PHOENIX HOTFIX V1: REAL FULLSCREEN */
#phoenixGameContainer.open {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  overflow: hidden !important;
  background: #000 !important;
  z-index: 15000 !important;
}

#phoenixGameContainer .m883-game-frame {
  position: absolute !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  min-width: 100vw !important;
  min-height: 100dvh !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  display: block !important;
}

#phoenixGameContainer .m883-game-toolbar {
  display: block !important;
  position: fixed !important;
  top: max(10px, env(safe-area-inset-top)) !important;
  right: max(10px, env(safe-area-inset-right)) !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  background: transparent !important;
  border: 0 !important;
  z-index: 16050 !important;
  pointer-events: none !important;
}

#phoenixGameContainer .m883-game-title {
  display: none !important;
}

#phoenixGameContainer .m883-game-toolbar .m883-close {
  display: block !important;
  pointer-events: auto !important;
  padding: 10px 16px !important;
  border: 1px solid #ffcf55 !important;
  border-radius: 14px !important;
  background: rgba(120, 10, 10, 0.92) !important;
  color: #fff4c2 !important;
  font-weight: 800 !important;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.65) !important;
}
'''
        LOBBY_CSS.write_text(css, encoding='utf-8')
else:
    print(f'WARNING: {LOBBY_CSS} not found; game.js was patched, fullscreen CSS was skipped.')

print('✅ Phoenix hotfix v1 applied successfully.')
print(f'✅ Backup: {backup}')
print('Next: restart/refresh the local server page with cache disabled.')
