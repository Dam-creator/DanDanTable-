with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav_done.html", "r", encoding="utf-8") as f:
    h = f.read()

# Show the actual sidebar nav items (from first nav-item button through last one before sidebar-footer)
b1 = h.find('<button class="nav-item active" data-view="dashboard"')
b2 = h.find('<div class="sidebar-footer"')
if b1 > 0 and b2 > 0:
    nav_section = h[b1:b2]
    # Print each line
    for i, line in enumerate(nav_section.split('\n')[:30]):
        print(f"{i}: {repr(line)}")
else:
    print(f"b1={b1}, b2={b2}")