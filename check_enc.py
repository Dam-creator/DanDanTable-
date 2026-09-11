with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav_done.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check if Chinese is garbled or just terminal display issue
b1 = h.find('<button class="nav-item active" data-view="dashboard"')
print(f"Position: {b1}")
# Get the block
block = h[b1:b1+150]
# Check bytes
print(f"Block bytes around Chinese: {block[90:140].encode('utf-8')}")

# Check if the original file has good Chinese
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8") as f:
    orig = f.read()
ob1 = orig.find('<button class="nav-item active" data-view="dashboard"')
oblock = orig[ob1:ob1+150]
print(f"Original block bytes: {oblock[90:140].encode('utf-8')}")