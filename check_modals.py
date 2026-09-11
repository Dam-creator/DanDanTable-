with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check if modal-create-profile HTML exists
mcp_html = h.find('id="modal-create-profile"')
print(f"modal-create-profile id: {mcp_html}")

# Check all modal overlays
import re
modals = re.findall(r'id="modal-[^"]*"', h)
print("\nAll modals found:")
for m in modals:
    print(f"  {m}")

# Check what modals are near position 84000-85000
print("\nHTML around 68000-71000 (likely modal area):")
# Find a modal section
for m in ["modal-create-profile", "modal-add-course", "modal-add-countdown", "modal-add-transaction"]:
    idx = h.find(f'id="{m}"')
    print(f"  {m}: position {idx}")