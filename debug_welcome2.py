with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Find welcome page HTML (between welcome-page div)
wp_start = h.find('class="welcome-page"')
if wp_start > 0:
    wp_end = h.find('</div>', wp_start)
    # Find end of welcome page
    for i in range(5):
        wp_end = h.find('</div>', wp_end+1)
    print("=== Welcome page HTML ===")
    print(h[wp_start:wp_end+100])
    print()

# Find "创建" (create) - the button text
for term in ["创建", "createProfile", "showCreateProfileModal", "welcome-btn", "onclick"]:
    idx = h.find(term)
    if idx > 0 and idx < 60000:  # In HTML section
        ctx = h[max(0,idx-50):idx+100]
        print(f"{term} at {idx}:")
        print(ctx)
        print()