with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Find bottom nav HTML (after views, before modals)
# Look for data-view in bottom nav context
bn_data = h.find('data-view="dashboard"')
# Find all occurrences
import re
positions = [m.start() for m in re.finditer(r'data-view="(?:dashboard|gpa|plan|finance|countdown|schedule|routine)"', h)]
print("data-view positions:")
for p in positions:
    ctx = h[p:p+40]
    print(f"  {p}: {repr(ctx)}")

# Find the bottom-nav section in the HTML (not CSS)
# Should be after the views and before modals
html_bn = h.find('bottom-nav-item active')
print(f"\nbottom-nav-item active: {html_bn}")
if html_bn > 0:
    print(repr(h[html_bn:html_bn+200]))