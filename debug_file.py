with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "rb") as f:
    raw = f.read(200)

print(f"First 200 bytes: {raw[:200]}")
print(f"Starts with BOM: {raw[:3] == b'\\xef\\xbb\\xbf'}")
print(f"Starts with <!DOCTYPE: {raw[:15].startswith(b'<!DOCTYPE')}")

# Also check file size
import os
size = os.path.getsize(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html")
print(f"File size: {size}")