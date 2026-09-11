with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Check showModal function
sm = h.find("function showModal")
print(f"showModal at: {sm}")
if sm > 0:
    print(h[sm:sm+300])
print()

# Check $ function
dollar = h.find("function $(")
print(f"$ function at: {dollar}")
if dollar > 0:
    print(h[dollar:dollar+200])
print()

# Check closeModal
cm = h.find("function closeModal")
print(f"closeModal at: {cm}")
if cm > 0:
    print(h[cm:cm+200])
print()

# Check the actual modal HTML was inserted correctly
mcp = h.find('id="modal-create-profile"')
print(f"modal-create-profile at: {mcp}")
if mcp > 0:
    # Show context around it
    print(h[mcp-30:mcp+200])
    # Check if it's properly within body
    body_start = h.find("<body>")
    body_end = h.find("</body>")
    print(f"Body: {body_start} to {body_end}, modal at {mcp} - inside body: {body_start < mcp < body_end}")

# Check if the script section is complete  
script_start = h.find("<script>")
script_end = h.find("</script>")
print(f"\nScript: {script_start} to {script_end}")