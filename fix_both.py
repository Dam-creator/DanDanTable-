import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read original to extract the modal
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8") as f:
    orig = f.read()

# Extract modal-create-profile (from 67343 to 68271)
profile_modal = orig[67343:68271]
print(f"Extracted profile modal: {len(profile_modal)} chars")

# Read current file
with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# ===== FIX 1: Insert the profile modal before other modals =====
# Find where modals start
modal_start = h.find("<!-- ===== 弹窗：编辑作息事件 ===== -->")
if modal_start > 0:
    h = h[:modal_start] + profile_modal + "\n" + h[modal_start:]
    print(f"Profile modal inserted at {modal_start}")

# ===== FIX 2: Update btn-primary style for warm/cream UI =====
# Replace purple gradient with warm solid + subtle shadow
old_btn = """  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%);
  color: white;
  box-shadow: 0 4px 16px var(--primary-glow);"""
new_btn = """  background: #5B4CC4;
  color: white;
  box-shadow: 0 2px 8px rgba(91,76,196,0.25);"""
h = h.replace(old_btn, new_btn)

# Also fix the hover state
old_hover = """.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--primary-glow); }"""
new_hover = """.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(91,76,196,0.35); }"""
h = h.replace(old_hover, new_hover)

# ===== FIX 3: Update all purple gradient references for warmer look =====
# Fix the primary-2 color reference in gradients
old_grad = "linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)"
new_grad = "linear-gradient(135deg, #5B4CC4 0%, #6C5CE7 100%)"
h = h.replace(old_grad, new_grad)

# ===== FIX 4: Make danger button less harsh =====
old_danger = "background: rgba(248,113,113,0.12); color: var(--danger); border: 1px solid rgba(248,113,113,0.2);"
new_danger = "background: rgba(225,112,85,0.08); color: var(--danger); border: 1px solid rgba(225,112,85,0.15);"
h = h.replace(old_danger, new_danger)

# Save
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(h)
print(f"Saved: {len(h)} chars")
print("Fixes applied: profile modal restored, button styles updated")