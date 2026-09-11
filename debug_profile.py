with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check showCreateProfile function
scp = h.find("function showCreateProfile")
print(f"showCreateProfile at: {scp}")
if scp > 0:
    print(h[scp:scp+300])
    print()

# Check for modal-create-profile HTML
mcp = h.find("modal-create-profile")
print(f"modal-create-profile at: {mcp}")
if mcp > 0:
    print(h[mcp-50:mcp+500])

# Check new-profile-username
npu = h.find("new-profile-username")
print(f"\nnew-profile-username occurrences:")
pos = npu
count = 0
while pos > 0 and count < 5:
    print(f"  {pos}: {h[pos-30:pos+50]}")
    pos = h.find("new-profile-username", pos+1)
    count += 1

# Check createProfile function
cpf = h.find("function createProfile")
print(f"\ncreateProfile at: {cpf}")
if cpf > 0:
    print(h[cpf:cpf+500])