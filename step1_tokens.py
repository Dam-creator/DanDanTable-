import re

# Read original
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8") as f:
    original = f.read()

# Find the design tokens block and replace it
old_tokens_start = original.find("/* ========== 设计令牌 ========== */")
old_data_theme_end = original.find("}\n\n/* ========== 基础重置", old_tokens_start)
if old_data_theme_end < 0:
    old_data_theme_end = original.find("}\n\n/* ========== 基础重置 ==========", old_tokens_start)
print(f"Tokens block: {old_tokens_start} to {old_data_theme_end}")

new_tokens = """/* ========== 设计令牌 - 温暖浅色 ========== */
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
  --primary-2: #5A4BD1;
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

new_html = original[:old_tokens_start] + new_tokens + original[old_data_theme_end:]
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_step1.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(new_html)
print(f"Step 1 done: {len(new_html)} chars")