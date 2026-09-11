with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# 1. Find button styles for purple buttons
btn_primary = h.find('.btn-primary {')
if btn_primary > 0:
    print("=== btn-primary style ===")
    print(h[btn_primary:btn_primary+300])
    print()

# 2. Find profile creation flow
# Look for "创建档案" or create profile
cp = h.find("创建档案")
print(f"创建档案 at position: {cp}")
if cp > 0:
    print(h[cp-100:cp+200])

# Also check showProfileModal or similar
for term in ["showProfileModal", "createProfile", "showWelcome", "addProfile", "profile", "welcome-overlay", "welcome-modal"]:
    idx = h.find(term)
    if idx > 0:
        print(f"\n{term} at {idx}: {h[idx:idx+100]}")