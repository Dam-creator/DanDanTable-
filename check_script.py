with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Find all script tags
import re
for m in re.finditer(r'<script[^>]*>|</script>', h):
    start = max(0, m.start()-10)
    end = min(len(h), m.end()+10)
    print(f"  {m.start()}: {repr(h[start:end])}")