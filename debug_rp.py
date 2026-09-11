with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Extract JS
script_start = h.find("<script>") + len("<script>")
script_end = h.rfind("</script>")
js = h[script_start:script_end]

# Check the area around where renderPlan was inserted (JS offset 37877)
rp = js.find("function renderPlan")
print("=== renderPlan insertion area ===")
# Show what's before renderPlan
before = js[max(0,rp-200):rp]
print("BEFORE renderPlan:")
print(before[-200:])
print()
print("renderPlan first 300 chars:")
print(js[rp:rp+300])
print()

# Also check the area after renderPlan functions end
# Find the renderAll function
ra = js.find("function renderAll()")
print(f"renderAll at: {ra}")
if ra > 0:
    print("AFTER renderPlan functions, before renderAll:")
    between = js[rp:ra]
    # Find last function before renderAll
    # Print last 500 chars
    print(between[-500:])