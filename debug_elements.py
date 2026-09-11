with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check critical elements
for el_id in ["welcome-profiles", "welcome-page", "app", "bg-particles", "modal-create-profile", "new-profile-username", "new-profile-name"]:
    count = h.count(f'id="{el_id}"')
    print(f'id="{el_id}": {count}')

# Check the welcome page button
wp_btn = h.find("showCreateProfile")
print(f"\nshowCreateProfile calls: {h.count('showCreateProfile')}")

# Check if welcome page is actually visible (not display:none)
wp_style = h.find('id="welcome-page"')
if wp_style > 0:
    # Check if it has style="display:none"
    ctx = h[wp_style:wp_style+100]
    print(f"\nWelcome page: {repr(ctx[:100])}")

# Check the modal structure more carefully
mcp = h.find('id="modal-create-profile"')
if mcp > 0:
    # Check the full modal HTML
    modal_html = h[mcp-30:mcp+920]
    print(f"\n=== Profile modal ===")
    print(modal_html)