with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Verify switchView
sv = h.find("function switchView")
sv_end = h.find("\n  }", sv) + 10
print("switchView full:")
print(h[sv:sv_end])
print()

# Verify profile modal exists
pm = h.find("modal-create-profile")
print(f"Profile modal at {pm}")
if pm > 0:
    print(h[pm:pm+80])
print()

# Quick final count
print(f"view-plan: {h.count('view-plan')}")
print(f"renderPlan: {h.count('function renderPlan')}")
print(f"modal-create-profile: {h.count('modal-create-profile')}")