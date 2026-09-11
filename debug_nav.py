with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav_done.html", "r", encoding="utf-8") as f:
    h = f.read()

# Find sidebar HTML
idx = h.find('class="sidebar"')
print(f"Sidebar class at: {idx}")

# Show the HTML nav items area
if idx > 0:
    section = h[idx:idx+600]
    # Find data-view in this section
    dv = section.find('data-view')
    print(f"First data-view at offset: {dv}")
    if dv > 0:
        print(section[dv:dv+200])

# Find exact position of the first nav button
b1 = h.find('<button class="nav-item')
print(f"First nav-item button at: {b1}")
if b1 > 0:
    print(repr(h[b1:b1+120]))