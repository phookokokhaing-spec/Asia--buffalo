from pathlib import Path
from bs4 import BeautifulSoup, Tag
import sys

SOURCE = Path(sys.argv[1] if len(sys.argv) > 1 else 'lobby.html')
OUTPUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'lobby_ordered.html')

if not SOURCE.exists():
    raise SystemExit(f'File not found: {SOURCE}')

html = SOURCE.read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html5lib')
body = soup.body
if body is None:
    raise SystemExit('No <body> found')

# Keep all executable/content blocks intact. We only move top-level body children.
def top_level_by_id(element_id: str):
    node = soup.find(id=element_id)
    if not node:
        return None
    while node.parent is not body and node.parent is not None:
        node = node.parent
    return node if node.parent is body else None


def top_level_by_class(class_name: str):
    node = soup.find(class_=class_name)
    if not node:
        return None
    while node.parent is not body and node.parent is not None:
        node = node.parent
    return node if node.parent is body else None

# Remove duplicate references from the relocation list only.
seen = set()
ordered_nodes = []

def add(node):
    if isinstance(node, Tag) and id(node) not in seen:
        seen.add(id(node))
        ordered_nodes.append(node)

# 1) Global audio assets
for audio in list(body.find_all('audio', recursive=False)):
    add(audio)

# 2) App startup flow
for element_id in ('loadingScreen', 'loginScreen', 'orientationWarning'):
    add(top_level_by_id(element_id))

# 3) Main lobby
add(top_level_by_id('lobbyScreen'))

# 4) Main settings
add(top_level_by_id('settingsModal'))

# 5) Deposit system
# Floating trigger is identified by its onclick.
for child in list(body.children):
    if isinstance(child, Tag) and child.name == 'button' and child.get('onclick') == 'openDepositPopup1()':
        add(child)
for element_id in ('depositPopup1', 'depositPopup2', 'depositPopup3'):
    add(top_level_by_id(element_id))

# 6) Withdraw system
for element_id in ('withdrawPopup1', 'withdrawPopup2', 'withdrawPopup3'):
    add(top_level_by_id(element_id))

# 7) History and chat
for element_id in ('historyPopup', 'userChatModal'):
    add(top_level_by_id(element_id))

# 8) Shared feedback overlays
for element_id in ('loadingOverlay', 'successModal', 'notification'):
    add(top_level_by_id(element_id))

# 9) Jackpot and win effects
for element_id in ('megaJackpot', 'win-animation-container'):
    add(top_level_by_id(element_id))

# 10) Game iframe containers
for element_id in ('jackpotGameContainer', 'megaWaysContainer', 'superWaysContainer', 'cardGameContainer'):
    add(top_level_by_id(element_id))

# 11) Anything not recognized stays before scripts, so no feature is lost.
for child in list(body.children):
    if isinstance(child, Tag) and child.name != 'script':
        add(child)

# 12) Scripts always last, preserving their original load order.
scripts = [child for child in list(body.children) if isinstance(child, Tag) and child.name == 'script']

# Clear body and rebuild with numbered landmark comments.
body.clear()

def comment(text):
    body.append(soup.new_string(f'\n\n<!-- {text} -->\n'))

section_names = {
    'loadingScreen': '02. LOADING SCREEN',
    'loginScreen': '03. LOGIN / SIGNUP SCREEN',
    'orientationWarning': '04. ORIENTATION WARNING',
    'lobbyScreen': '05. MAIN LOBBY SCREEN',
    'settingsModal': '06. SETTINGS MODAL',
    'depositPopup1': '07. DEPOSIT SYSTEM',
    'withdrawPopup1': '08. WITHDRAW SYSTEM',
    'historyPopup': '09. TRANSACTION HISTORY',
    'userChatModal': '10. USER CHAT',
    'loadingOverlay': '11. SHARED FEEDBACK UI',
    'megaJackpot': '12. JACKPOT / WIN EFFECTS',
    'jackpotGameContainer': '13. GAME IFRAME CONTAINERS',
}

comment('01. GLOBAL AUDIO ASSETS')
last_section = None
for node in ordered_nodes:
    node_id = node.get('id')
    marker = section_names.get(node_id)
    if marker and marker != last_section:
        comment(marker)
        last_section = marker
    body.append(node.extract())
    body.append('\n')

comment('14. APPLICATION SCRIPTS')
for script in scripts:
    body.append(script.extract())
    body.append('\n')

# Clean obvious accidental empty script tags created from a stray </script>.
for script in list(body.find_all('script', recursive=False)):
    if not script.get('src') and not script.get_text(strip=True):
        script.decompose()

# Keep the document readable.
result = soup.decode(formatter='minimal')
OUTPUT.write_text(result, encoding='utf-8')
print(f'Created: {OUTPUT}')
