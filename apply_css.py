import re

with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_step1.html", "r", encoding="utf-8") as f:
    html = f.read()

print(f"Input: {len(html)} chars")

# Comprehensive replacements list
replacements = [
    # Sidebar dark bg
    ("background: rgba(255,255,255,0.02);\n  border-right: 1px solid var(--card-border);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);",
     "background: #1E1E2E;\n  border-right: 1px solid rgba(255,255,255,0.06);"),
    
    # Scrollbar for light theme  
    ("::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }",
     "::-webkit-scrollbar-thumb { background: #D0CCC6; border-radius: 3px; }"),
    ("""[data-theme="light"] ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }""",
     """[data-theme="dark"] ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }"""),
    
    # Orb opacity  
    ("opacity: 0.4; animation: float 20s", "opacity: 0.08; animation: float 20s"),
    ("""[data-theme="light"] .orb { opacity: 0.15; }""", """[data-theme="dark"] .orb { opacity: 0.4; }"""),
    
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
    ("background: rgba(139,92,246,0.6);", "background: rgba(108,92,231,0.3);"),
    
    # Gradient animation
    ("background: linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(34,211,238,0.03) 50%, rgba(244,114,182,0.05) 100%);",
     "background: linear-gradient(135deg, rgba(108,92,231,0.03) 0%, rgba(0,184,148,0.02) 50%, rgba(253,121,168,0.03) 100%);"),
    
    # Nav active
    ("background: linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.12) 100%);\n  color: var(--text-1);\n  box-shadow: inset 0 0 0 1px rgba(139,92,246,0.25);",
     "background: rgba(108,92,231,0.2);\n  color: #FFFFFF;"),
    
    # Grid image
    ("linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);",
     "linear-gradient(rgba(108,92,231,0.04) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(108,92,231,0.04) 1px, transparent 1px);"),
    
    # Light grid -> dark grid
    ("""[data-theme="light"] .bg-grid {
  background-image:
    linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
}""", """[data-theme="dark"] .bg-grid {
  background-image:
    linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);
}"""),
    
    # Remove bottom nav dark
    ("""[data-theme="light"] .bottom-nav { background: rgba(255,255,255,0.85); }""",
     """[data-theme="dark"] .bottom-nav { background: rgba(13,13,26,0.85); }"""),
    
    # Color replacements
    ("#8b5cf6", "#6C5CE7"),
    ("#6366f1", "#5A4BD1"),
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
]

count = 0
for old, new in replacements:
    if old in html:
        html = html.replace(old, new)
        count += 1
    else:
        print(f"WARNING: not found: {old[:60]}...")

print(f"Applied {count}/{len(replacements)} replacements")

out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_css_done.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"CSS done: {len(html)} chars -> {out}")