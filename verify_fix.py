with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Verify fixes
print("=== Fix verification ===")
print(f"modal-create-profile: {'OK' if 'modal-create-profile' in h else 'MISSING'}")
print(f"showCreateProfile: {'OK' if 'function showCreateProfile' in h else 'MISSING'}")
print(f"createProfile: {'OK' if 'function createProfile' in h else 'MISSING'}")
print(f"new-profile-username: {'OK' if 'new-profile-username' in h else 'MISSING'}")
print(f"btn-primary new style: {'OK' if '#5B4CC4' in h else 'MISSING'}")

# Check the welcome page button still works
wp_btn = h.find('showCreateProfile()')
print(f"Welcome button onclick: {'OK' if wp_btn > 0 else 'MISSING'}")