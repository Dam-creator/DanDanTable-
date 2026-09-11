import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read original file
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8-sig") as f:
    h = f.read()

print(f"Original: {len(h)} chars")

# Extract the profile modal from original, then find where it sits in the structure
# Find the profile modal
pm_start = h.find('id="modal-create-profile"')
# Find start of this modal overlay
mo_start = h.rfind('<div class="modal-overlay"', 0, pm_start)
# Find end
depth = 0
mo_end = mo_start
for i in range(mo_start, len(h)):
    if h[i:i+6] == '<div c' or h[i:i+5] == '<div ':
        depth += 1
    elif h[i:i+6] == '</div>':
        depth -= 1
        if depth == 0:
            mo_end = i + 6
            break

profile_modal = h[mo_start:mo_end]
print(f"Profile modal: {len(profile_modal)} chars")

# Save it for use
with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\profile_modal.html", "w", encoding="utf-8") as f:
    f.write(profile_modal)

# Now show what comes before and after this modal in original
print("\nBefore profile modal (last 100 chars):")
print(repr(h[mo_start-100:mo_start]))
print("\nAfter profile modal (first 100 chars):")
print(repr(h[mo_end:mo_end+100]))