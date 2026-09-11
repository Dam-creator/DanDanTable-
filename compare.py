# Compare original vs modified profile flow
with open(r"C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html", "r", encoding="utf-8-sig") as f:
    orig = f.read()
with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8-sig") as f:
    mod = f.read()

# Check welcome-page
owp = orig.find('id="welcome-page"')
mwp = mod.find('id="welcome-page"')
print(f"welcome-page: orig={owp}, mod={mwp}")

# Check if app div style differs
oapp = orig.find('id="app"')
mapp = mod.find('id="app"')
print(f"app: orig={oapp}, mod={mapp}")
if oapp > 0:
    print(f"  orig app: {repr(orig[oapp:oapp+60])}")
if mapp > 0:
    print(f"  mod app: {repr(mod[mapp:mapp+60])}")

# Check if welcome page is INSIDE or OUTSIDE app div
# In original, check structure
orig_body = orig.find("<body>")
orig_app = orig.find('id="app"')
orig_wp = orig.find('id="welcome-page"')
print(f"\nOriginal order: body={orig_body}, wp={orig_wp}, app={orig_app}")
print(f"  wp before app: {orig_wp < orig_app}")

mod_body = mod.find("<body>")
mod_app = mod.find('id="app"')
mod_wp = mod.find('id="welcome-page"')
print(f"Modified order: body={mod_body}, wp={mod_wp}, app={mod_app}")
print(f"  wp before app: {mod_wp < mod_app}")