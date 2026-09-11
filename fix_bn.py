with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html", "r", encoding="utf-8") as f:
    h = f.read()

# Find where modals section starts (after all views, before bottom nav)
modal_start = h.find('<!-- ===== 弹窗：编辑作息事件 ===== -->')
print(f"Modal section starts at: {modal_start}")

# Bottom nav HTML to insert
bottom_nav = '''
  <!-- ===== 底部导航（移动端） ===== -->
  <nav class="bottom-nav" style="display:none;">
    <button class="bottom-nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
      <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      首页
    </button>
    <button class="bottom-nav-item" data-view="plan" onclick="switchView('plan')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
      规划
    </button>
    <button class="bottom-nav-item" data-view="gpa" onclick="switchView('gpa')">
      <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
      GPA
    </button>
    <button class="bottom-nav-item" data-view="finance" onclick="switchView('finance')">
      <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
      记账
    </button>
  </nav>
'''

if modal_start > 0:
    # Insert bottom nav before the modal section
    # But first find where the plan view ends
    plan_end = h.find('</div>\n      </div>\n    </div>', modal_start - 2000)
    # Actually, let me find the closing of the main div
    main_end = h.rfind('</div>', modal_start - 100, modal_start)
    print(f"Insertion point: {main_end}")
    
    if main_end > 0:
        new_h = h[:main_end] + bottom_nav + h[main_end:]
        print(f"Bottom nav inserted, {len(new_h)} chars")
    else:
        new_h = h
        print("Could not find insertion point")
else:
    new_h = h
    print("Modal section not found")

# Also clean up remaining countdown data-view in sidebar
# Find and remove the leftover countdown nav item
cd_data = new_h.find('data-view="countdown"')
if cd_data > 0:
    # Find button start
    btn_start = new_h.rfind('<button', 0, cd_data)
    btn_end = new_h.find('</button>', cd_data) + len('</button>')
    # Check if there's a newline after
    if new_h[btn_end:btn_end+1] == '\n':
        btn_end += 1
    print(f"Removing countdown button at {btn_start}-{btn_end}")
    new_h = new_h[:btn_start] + new_h[btn_end:]
    print("Countdown nav item removed")

# Also clean up CSS view- references (harmless but clean)
new_h = new_h.replace('.view-countdown { --view-accent: #f97316; --view-glow: rgba(249,115,22,0.3); }', '')
new_h = new_h.replace('.view-schedule { --view-accent: #06b6d4; --view-glow: rgba(6,182,212,0.3); }', '')
new_h = new_h.replace('.view-routine { --view-accent: #ec4899; --view-glow: rgba(236,72,153,0.3); }', '')

out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(new_h)
print(f"Fixed: {len(new_h)} chars")