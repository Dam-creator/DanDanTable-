with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Extract JS  
script_start = h.find("<script>") + len("<script>")
script_end = h.rfind("</script>")
js = h[script_start:script_end]

# Find the actual init() function
init_pos = js.find("\nfunction init()")
if init_pos < 0:
    init_pos = js.find("function init()")
print(f"init() at JS offset: {init_pos}")

if init_pos > 0:
    # Show from init to the end
    print(js[init_pos:init_pos+1000])
    print("...")
    print(js[-500:])