with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Look at the welcome/profile section HTML
# Find welcome related content
for term in ["welcome", "档案", "profile", "new-profile"]:
    idx = h.find(term)
    count = 0
    while idx > 0 and count < 5:
        ctx = h[max(0,idx-20):idx+80]
        print(f"{term} at {idx}: {repr(ctx)}")
        idx = h.find(term, idx+1)
        count += 1
    print()