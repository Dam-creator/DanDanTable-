import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Start fresh from original
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8-sig") as f:
    h = f.read()

print(f"Starting from original: {len(h)} chars")

# ===== STEP 1: CSS Design Tokens =====
old_tokens_start = h.find("/* ========== 设计令牌 ========== */")
old_tokens_end = h.find("}\n\n/* ========== 基础重置 ==========", old_tokens_start)
if old_tokens_end < 0:
    old_tokens_end = h.find("}\n\n/* ========== 基础重置", old_tokens_start)

new_tokens = """/* ========== 设计令牌 - 温暖浅色主题 ========== */
:root {
  --bg-0: #F5F1EB;
  --bg-1: #EDE9E2;
  --bg-2: #FFFFFF;
  --card: #FFFFFF;
  --card-hover: #FAF8F5;
  --card-border: #E8E4DD;
  --card-border-strong: #D8D4CC;
  --text-1: #2D2D2D;
  --text-2: #6B6B6B;
  --text-3: #9B9B9B;
  --primary: #6C5CE7;
  --primary-2: #5B4CC4;
  --primary-glow: rgba(108,92,231,0.2);
  --accent: #00B894;
  --accent-glow: rgba(0,184,148,0.2);
  --success: #00B894;
  --warning: #FDCB6E;
  --danger: #E17055;
  --pink: #FD79A8;
  --orange: #F0A500;
  --cyan: #00CEC9;
  --purple: #A29BFE;
  --blue: #74B9FF;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
  --sidebar-w: 220px;
  --nav-h: 64px;
  --transition: 0.2s cubic-bezier(0.25,0.1,0.25,1);
}
[data-theme="dark"] {
  --bg-0: #07070f;
  --bg-1: #0d0d1a;
  --bg-2: #141428;
  --card: rgba(255,255,255,0.04);
  --card-hover: rgba(255,255,255,0.07);
  --card-border: rgba(255,255,255,0.08);
  --card-border-strong: rgba(255,255,255,0.14);
  --text-1: #f0f0f8;
  --text-2: #a0a0b8;
  --text-3: #606078;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.4);
  --shadow-lg: 0 16px 64px rgba(0,0,0,0.5);
}
"""

h = h[:old_tokens_start] + new_tokens + h[old_tokens_end:]
print(f"Step 1 (tokens): {len(h)} chars")

# ===== STEP 2: CSS adaptations for warm light =====
css_replacements = [
    # Sidebar dark bg
    ("background: rgba(255,255,255,0.02);\n  border-right: 1px solid var(--card-border);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);",
     "background: #1E1E2E;\n  border-right: 1px solid rgba(255,255,255,0.06);"),
    # Scrollbar
    ("::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }",
     "::-webkit-scrollbar-thumb { background: #D0CCC6; border-radius: 3px; }"),
    # Orb opacity
    ("opacity: 0.4; animation: float 20s", "opacity: 0.06; animation: float 20s"),
    # Card remove backdrop  
    ("backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  padding: 22px;\n  transition: all var(--transition);\n}\n.card:hover",
     "padding: 22px;\n  transition: all var(--transition);\n  box-shadow: var(--shadow-sm);\n}\n.card:hover"),
    # Modal lighter
    ("background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);",
     "background: rgba(0,0,0,0.35); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);"),
    # Bottom nav white
    ("background: rgba(13,13,26,0.85);\n  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);\n  border-top: 1px solid var(--card-border);\n  padding: 8px 8px calc(8px + env(safe-area-inset-bottom));\n  grid-template-columns: repeat(4, 1fr);",
     "background: rgba(255,255,255,0.92);\n  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);\n  border-top: 1px solid var(--card-border);\n  padding: 6px 6px calc(6px + env(safe-area-inset-bottom));\n  grid-template-columns: repeat(4, 1fr);"),
    # Routine bg  
    ("background: linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%);",
     "background: var(--card);"),
    # Particles
    ("background: rgba(139,92,246,0.6);", "background: rgba(108,92,231,0.25);"),
    # Gradient animation
    ("background: linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(34,211,238,0.03) 50%, rgba(244,114,182,0.05) 100%);",
     "background: linear-gradient(135deg, rgba(108,92,231,0.03) 0%, rgba(0,184,148,0.02) 50%, rgba(253,121,168,0.03) 100%);"),
    # Nav active
    ("background: linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.12) 100%);\n  color: var(--text-1);\n  box-shadow: inset 0 0 0 1px rgba(139,92,246,0.25);",
     "background: rgba(108,92,231,0.2);\n  color: #FFFFFF;"),
    # Grid
    ("linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);",
     "linear-gradient(rgba(108,92,231,0.04) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(108,92,231,0.04) 1px, transparent 1px);"),
    # Color replacements
    ("#8b5cf6", "#6C5CE7"),
    ("#6366f1", "#5B4CC4"),
    ("#22d3ee", "#00B894"),
    ("#34d399", "#00B894"),
    ("#fbbf24", "#FDCB6E"),
    ("#f87171", "#E17055"),
    ("#f472b6", "#FD79A8"),
    ("#fb923c", "#F0A500"),
    ("#a78bfa", "#A29BFE"),
    ("#60a5fa", "#74B9FF"),
    ("rgba(139,92,246,", "rgba(108,92,231,"),
    ("rgba(34,211,238,", "rgba(0,184,148,"),
    ("rgba(244,114,182,", "rgba(253,121,168,"),
    # Old light theme -> dark theme
    ("""[data-theme="light"] .orb { opacity: 0.15; }""", """[data-theme="dark"] .orb { opacity: 0.4; }"""),
    ("""[data-theme="light"] ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }""", """[data-theme="dark"] ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }"""),
    ("""[data-theme="light"] .bg-grid {
  background-image:
    linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
}""", """[data-theme="dark"] .bg-grid {
  background-image:
    linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);
}"""),
    ("""[data-theme="light"] .bottom-nav { background: rgba(255,255,255,0.85); }""", """[data-theme="dark"] .bottom-nav { background: rgba(13,13,26,0.85); }"""),
]

count = 0
for old, new in css_replacements:
    if old in h:
        h = h.replace(old, new)
        count += 1
print(f"Step 2 (CSS adaptations): {count}/{len(css_replacements)} applied")

# ===== STEP 3: Sidebar navigation =====
old_nav = h.find('<button class="nav-item" data-view="countdown"')
old_nav_end = h.find('</button>', h.find('data-view="routine"')) + len('</button>') + 1

if old_nav > 0:
    # Find all nav buttons to remove: countdown, schedule, routine
    # Replace from countdown button to end of routine button + nav section
    # But keep finance button
    fin_end = h.find('</button>', h.find('data-view="finance"')) + len('</button>') + 1
    
    # Add plan button after finance
    plan_btn = '''    <button class="nav-item" data-view="plan" onclick="switchView('plan')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
      规划中心
    </button>
'''
    # Remove: countdown button, schedule button, routine button
    # Keep everything up to finance end, add plan, then skip to after routine
    routine_end_marker = h.find('data-view="routine"')
    routine_btn_end = h.find('</button>', routine_end_marker) + len('</button>') + 1
    
    # Find the nav-section after routine
    nav_section_pos = h.find('<div class="nav-section"', routine_btn_end)
    
    new_nav_area = h[:fin_end] + plan_btn + h[nav_section_pos:]
    before_nav = h[:old_nav]
    h = before_nav + new_nav_area[old_nav:]
    print("Step 3 (sidebar nav): plan added, countdown/schedule/routine removed")
else:
    print("WARNING: nav not found")

# Save
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v2.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(h)
print(f"Saved v2: {len(h)} chars")