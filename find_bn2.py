with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Find bottom-nav in HTML (after sidebar, in the main content area)
# Look for nav tag containing bottom-nav
bn_tag = h.find('<nav')
while bn_tag > 0:
    end = h.find('>', bn_tag)
    tag = h[bn_tag:end+1]
    if 'bottom-nav' in tag or 'bottom' in tag.lower():
        print(f"Found nav at {bn_tag}: {tag}")
    bn_tag = h.find('<nav', bn_tag+1)

# Also search for the bottom nav HTML pattern
patterns = ['bottom-nav', 'class="bottom', 'bottom-nav-item']
for pat in patterns:
    idx = h.find(pat)
    count = 0
    while idx > 0:
        count += 1
        if count <= 3:
            ctx = h[max(0,idx-10):idx+60]
            print(f"{pat} at {idx}: {repr(ctx)}")
        idx = h.find(pat, idx+1)

print("Done checking")