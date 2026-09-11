with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# 1. Check bottom nav
bn = h.find('class="bottom-nav"')
print(f"bottom-nav class: {bn}")
bn2 = h.find('bottom-nav')
print(f"bottom-nav any: {bn2}")
if bn2 > 0:
    print(repr(h[bn2:bn2+100]))

# 2. Find remaining old view references
for old in ["view-countdown", "view-schedule", "view-routine"]:
    idx = h.find(old)
    if idx > 0:
        ctx = h[max(0,idx-40):idx+len(old)+40]
        print(f"\n{old} at {idx}:")
        print(repr(ctx))