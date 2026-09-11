with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# 1. Check switchView
sv = h.find("function switchView")
if sv > 0:
    snippet = h[sv:sv+500]
    print("=== switchView ===")
    print(snippet[:400])
    print()

# 2. Check for profile modal
pm = h.find("modal-create-profile")
print(f"modal-create-profile: {pm}")

# Check what's between routine end and modals
# Look for "创建用户档案" or similar
for term in ["创建用户档案", "modal-profile", "modal-create"]:
    idx = h.find(term)
    print(f"{term}: {idx}")