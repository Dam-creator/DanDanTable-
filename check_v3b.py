with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v3.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check where old view references are
for old in ["view-countdown", "view-schedule", "view-routine"]:
    idx = h.find(old)
    count = 0
    while idx > 0:
        ctx = h[idx-10:idx+30]
        print(f"{old} at {idx}: {repr(ctx)}")
        idx = h.find(old, idx+1)
        count += 1
        if count > 3: break
    print()

# Check bottom nav
bn = h.find('data-view="plan"')
print(f"plan bottom nav items: {h.count('data-view=\"plan\"')}")

# Verify structure
print(f"\nFile size: {len(h)} chars")
print(f"HTML sections: {h.count('<!-- =====')}")