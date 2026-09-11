import sys
sys.stdout.reconfigure(encoding="utf-8")

print("Starting build...")

# Read original
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8") as f:
    original = f.read()

style_start = original.find("<style>") + len("<style>")
style_end = original.find("</style>")
script_start = original.find("<script>")

# Read new CSS
with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\new_css.txt", "r", encoding="utf-8") as f:
    new_css = f.read()

# Build: keep everything before <style>, replace CSS, keep HTML body + JS
before = original[:style_start]
middle = original[style_end:script_start]
after = original[script_start:]

new_html = before + new_css + middle + after

output_path = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_new.html"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(new_html)

print(f"Done! Written {len(new_html)} chars to index_new.html")
