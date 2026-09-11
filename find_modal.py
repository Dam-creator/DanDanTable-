with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8") as f:
    orig = f.read()

# Find modal-create-profile in original
mcp = orig.find('id="modal-create-profile"')
print(f"Original modal-create-profile at: {mcp}")
if mcp > 0:
    # Find the full modal (from <div class="modal-overlay" to its closing </div>)
    start = orig.rfind('<div class="modal-overlay"', 0, mcp)
    # Find matching close
    depth = 0
    end = start
    for i in range(start, len(orig)):
        if orig[i:i+6] == '<div c' or orig[i:i+5] == '<div ' or orig[i:i+5] == '<div>':
            depth += 1
        elif orig[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                end = i + 6
                break
    print(f"Modal from {start} to {end}, length {end-start}")
    print(orig[start:end])
else:
    # Try with different id
    for term in ["create-profile", "new-profile", "createProfile"]:
        idx = orig.find(term)
        if idx > 0:
            print(f"{term} at {idx}")
            print(orig[max(0,idx-100):idx+200])