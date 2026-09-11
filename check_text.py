with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav_done.html", "r", encoding="utf-8") as f:
    h = f.read()

# Get the actual nav button text
# Find after the first svg closing tag in nav
b1 = h.find('data-view="dashboard"')
block = h[b1:b1+300]
print("=== Current file nav buttons ===")
print(block[:300])

# Check original
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8") as f:
    orig = f.read()
ob1 = orig.find('data-view="dashboard"')
oblock = orig[ob1:ob1+300]
print("\n=== Original file nav buttons ===")
print(oblock[:300])