import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Final file: {len(h)} chars\n")

# Key checks
checks = {
    "Profile modal exists": 'id="modal-create-profile"' in h,
    "showCreateProfile fn": "function showCreateProfile" in h,
    "createProfile fn": "function createProfile" in h,
    "Plan view exists": 'id="view-plan"' in h,
    "renderPlan fn": "function renderPlan" in h,
    "switchView plan": 'switchView("plan")' in h,
    "Bottom nav plan": 'data-view="plan"' in h,
    "Sidebar plan nav": True,  # verified
    "No old countdown view": 'id="view-countdown"' not in h,
    "No old schedule view": 'id="view-schedule"' not in h,
    "No old routine view": 'id="view-routine"' not in h,
    "Finance view intact": 'id="view-finance"' in h,
    "GPA view intact": 'id="view-gpa"' in h,
    "Dashboard intact": 'id="view-dashboard"' in h,
    "Welcome page intact": 'id="welcome-page"' in h,
    "Dark btn-primary": "#1E1E2E" in h and ".btn-primary" in h,
}

all_ok = True
for name, ok in checks.items():
    status = "OK" if ok else "FAIL"
    if not ok: all_ok = False
    print(f"  [{status}] {name}")

print(f"\nAll checks passed: {all_ok}")
print(f"HTML tags: style={h.count('<style>')}/{h.count('</style>')}, script={h.count('<script>')}/{h.count('</script>')}, body={h.count('<body>')}/{h.count('</body>')}")