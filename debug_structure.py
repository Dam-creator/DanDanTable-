with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check around where profile modal was inserted
mcp = h.find('id="modal-create-profile"')
print(f"Profile modal at: {mcp}")
# Show 100 chars before and 100 after
print("Before:", repr(h[mcp-80:mcp]))
print("After end:", repr(h[mcp+920:mcp+1000]))

# Check if it's inside another element that might hide it
# Find the app div
app_start = h.find('id="app"')
app_end = h.find('</body>')
print(f"\nApp div: {app_start}, Body end: {app_end}")
print(f"Modal inside app/body: {mcp > app_start and mcp < app_end}")

# Check if modal is inside the main content area (should be OUTSIDE)
main_end = h.find('</main>')
if main_end < 0:
    main_end = h.find('class="main"')
    # Find matching close
    print(f"Main div at: {main_end}")

# Check actual structure around modal insertion point
print("\n=== Structure around insertion ===")
# Find what's right before the modal
before = h.rfind('</div>', mcp-500, mcp)
print(f"Previous </div>: {before}")
print(repr(h[before-30:before+10]))
print(repr(h[before+10:before+100]))