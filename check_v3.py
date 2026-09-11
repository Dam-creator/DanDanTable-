with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v3.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check for duplicates
for term in ["view-plan", "view-countdown", "view-schedule", "view-routine", "view-dashboard"]:
    print(f"{term}: {h.count(term)}")

print(f"\nFile size: {len(h)} chars")

# Find plan view positions
pos = h.find("规划中心视图")
count = 0
while pos > 0:
    print(f"  规划中心 at {pos}")
    pos = h.find("规划中心视图", pos+1)
    count += 1
    if count > 5: break