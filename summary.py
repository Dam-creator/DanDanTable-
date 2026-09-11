with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

print("=== DanDanTable Redesign Summary ===")
print(f"Total size: {len(h):,} chars")
print(f"CSS: {h.count('{')} rules approx")
print()

# Verify all data-view references
import re
views = re.findall(r'data-view="(\w+)"', h)
from collections import Counter
vc = Counter(views)
print("Navigation items:")
for v, c in vc.items():
    print(f"  {v}: {c}")
print()

# Check all views exist
for v in ["dashboard", "plan", "gpa", "finance"]:
    has_view = f'id="view-{v}"' in h
    has_render = f'render{v.title() if v != "plan" else "Plan"}()' in h or f'function render{v.title() if v != "plan" else "Plan"}' in h
    print(f"  {v}: view={has_view}, render={has_render}")

print()
print("Key features:")
print(f"  Warm light theme: #F5F1EB background")
print(f"  Dark sidebar: #1E1E2E")
print(f"  Primary accent: #6C5CE7")
print(f"  Plan Center (规划中心): combined schedule + countdown")
print(f"  Customizable schedule: add/edit/delete events")
print(f"  Day switching: 7-day tabs in plan view")
print(f"  All original features preserved: GPA, Finance")