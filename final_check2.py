import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Final: {len(h)} chars")

print("\n=== Structure ===")
for term in ["view-plan", "view-dashboard", "view-gpa", "view-finance"]:
    c = h.count(term)
    print(f"  OK {term}: {c}")

for term in ["view-countdown", "view-schedule", "view-routine"]:
    c = h.count(term)
    print(f"  {'OK' if c == 0 else 'ISSUE'} {term}: {c}")

print("\n=== Functions ===")
for term in ["renderPlan", "renderDashboard", "renderGPA", "renderFinance"]:
    print(f"  {term}: {h.count(term)}")

print("\n=== Navigation ===")
for term in ["bottom-nav-item", "data-view=\"plan\""]:
    print(f"  {term}: {h.count(term)}")

print("\n=== HTML tags ===")
print(f"  style: {h.count('<style>')}/{h.count('</style>')}")
print(f"  script: {h.count('<script>')}/{h.count('</script>')}")
print(f"  body: {h.count('<body>')}/{h.count('</body>')}")

print("\nDone!")