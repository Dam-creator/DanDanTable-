with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Final file: {len(h)} chars")

# Quick validation checks
checks = [
    ("view-plan", "Plan view exists"),
    ("renderPlan", "renderPlan function"),
    ("switchView('plan')", "Plan view switch"),
    ("filter-all", "Countdown filters"),
    ("plan-stats", "Plan stats container"),
    ("plan-timeline", "Plan timeline"),
    ("plan-countdowns", "Plan countdowns"),
    ("plan-schedule-list", "Plan schedule list"),
    ("规划中心", "Chinese: Plan Center"),
    ("GPA计算", "Chinese: GPA"),
    ("记账本", "Chinese: Finance"),
    ("bottom-nav-item", "Bottom nav"),
    ("class=\"bottom-nav\"", "Bottom nav container"),
    ("data-view=\"plan\"", "Plan nav item"),
]

for term, desc in checks:
    count = h.count(term)
    status = "OK" if count > 0 else "MISSING!"
    print(f"  [{status}] {desc}: {count} occurrences")

# Check no broken old references
old_checks = ["view-countdown", "view-schedule", "view-routine"]
for term in old_checks:
    count = h.count(term)
    if count > 0:
        print(f"  [WARNING] Old ref still present: {term} ({count}x)")

print("\nValidation complete!")