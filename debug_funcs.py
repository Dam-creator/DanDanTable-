import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Extract JS
script_start = h.find("<script>") + len("<script>")
script_end = h.rfind("</script>")
js = h[script_start:script_end]

# Check key functions
for func in ["renderWelcomeProfiles", "enterProfile", "switchView", "showCreateProfile", "createProfile", "showModal", "init"]:
    pos = js.find(f"function {func}")
    if pos > 0:
        # Show first 200 chars
        end = js.find("\n}", pos)
        snippet = js[pos:pos+200]
        print(f"=== {func} at {pos} ===")
        print(snippet)
        print()
    else:
        print(f"MISSING: {func}")
        print()

# Check if there are any ========== markers that could indicate corrupted code
dividers = js.count("==========")
print(f"========== dividers: {dividers}")