with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Extract the JS between <script> and </script>
script_start = h.find("<script>") + len("<script>")
script_end = h.rfind("</script>")
js = h[script_start:script_end]

print(f"JS length: {len(js)} chars")

# Check for common syntax issues
# 1. Unclosed template literals (backticks)
bt_count = js.count("`")
print(f"Backticks: {bt_count} (should be even)")

# 2. Check for double-semicolons or other issues near the renderPlan insertion
rp = js.find("function renderPlan")
print(f"renderPlan at JS offset: {rp}")

# 3. Check the init function
init_pos = js.find("function init()")
print(f"init at: {init_pos}")
if init_pos > 0:
    # Show first 500 chars of init
    print(js[init_pos:init_pos+500])

# 4. Check if there's a duplicate </script> in JS (escaped)
dup_script = js.count("</script>")
print(f"</script> in JS: {dup_script} (should be 0)")

# 5. Look for the closing of the main IIFE
iife_start = js.find('(function() {')
iife_end = js.rfind('})();')
print(f"IIFE: start={iife_start}, end={iife_end}")