with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Final: {len(h)} chars\n")

# Quick validation
print("=== Structure ===")
for term in ["view-plan", "view-dashboard", "view-gpa", "view-finance", "view-countdown", "view-schedule", "view-routine"]:
    c = h.count(term)
    flag = "✓" if (term in ["view-plan","view-dashboard","view-gpa","view-finance"] and c > 0) or (term in ["view-countdown","view-schedule","view-routine"] and c == 0) else "✗"
    print(f"  {flag} {term}: {c}")

print("\n=== Functions ===")
for term in ["renderPlan", "renderDashboard", "renderGPA", "renderFinance", "renderCountdown"]:
    c = h.count(term)
    flag = "✓" if (term in ["renderPlan","renderDashboard","renderGPA","renderFinance"] and c > 0) or (term == "renderCountdown" and c > 0) else "✗"
    print(f"  {flag} {term}: {c}")

print("\n=== Navigation ===")
for term in ["bottom-nav-item", "规划中心"]:
    c = h.count(term)
    print(f"  {'✓' if c > 0 else '✗'} {term}: {c}")

print("\n=== Key HTML tags ===")
print(f"  <style>: {h.count('<style>')}")
print(f"  </style>: {h.count('</style>')}")
print(f"  <script>: {h.count('<script>')}")
print(f"  </script>: {h.count('</script>')}")
print(f"  <body>: {h.count('<body>')}")
print(f"  </body>: {h.count('</body>')}")

# Check for rendering issues
print("\n=== Potential issues ===")
# Check for escaped quotes issues
for issue in ["\\\\'", "&apos;"]:
    c = h.count(issue)
    if c > 0:
        print(f"  FIX: {issue}: {c} occurrences")

print("\nDone!")