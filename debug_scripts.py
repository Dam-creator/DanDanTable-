with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Show the script area around position 71600-71700
print("=== Around script start area ===")
print(repr(h[70700:70900]))
print()

# Find ALL script tags
import re
scripts = [(m.start(), m.group()) for m in re.finditer(r'<script[^>]*>|</script>', h)]
print(f"Total script tags: {len(scripts)}")
for pos, tag in scripts:
    print(f"  {pos}: {tag}")
print()

# Show what's at the actual script start position
script_start = h.find("<script>")
print(f"First <script> without src: {script_start}")
if script_start > 0:
    print(repr(h[script_start:script_start+100]))

# Show the closing script area
script_close = h.rfind("</script>")
print(f"Last </script>: {script_close}")
if script_close > 0:
    print(repr(h[script_close-50:script_close+10]))