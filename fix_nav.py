import re

with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav_done.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Input: {len(h)} chars")

# Replace sidebar nav items using regex for robustness
# Countdown nav item (including badge)
old_cd = r'''    <button class="nav-item" data-view="countdown" onclick="switchView\('plan'\)">
      <svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8\.03-6\.61l1\.42-1\.42c-\.43-\.51-\.9-\.99-1\.41-1\.41l-1\.42 1\.42C16\.07 4\.74 14\.12 4 12 4c-4\.97 0-9 4\.03-9 9s4\.02 9 9 9 9-4\.03 9-9c0-2\.12-\.74-4\.07-1\.97-5\.61zM12 20c-3\.87 0-7-3\.13-7-7s3\.13-7 7-7 7 3\.13 7 7-3\.13 7-7 7z"/></svg>
      [^<]*
      <span class="nav-badge" id="countdown-badge" style="display:none;">0</span>
    </button>'''

# Simpler approach: find exact positions
# Nav buttons area
nav_start = h.find('<button class="nav-item active" data-view="dashboard"')
sidebar_footer = h.find('<div class="sidebar-footer"')

# Find all nav-item buttons between these positions
nav_area = h[nav_start:sidebar_footer]

# Find positions of the buttons we want to remove/replace
# Countdown button
cd_pos = nav_area.find('data-view="countdown"')
# Schedule button  
sc_pos = nav_area.find('data-view="schedule"')
# Routine button
rt_pos = nav_area.find('data-view="routine"')

print(f"Countdown at nav_area offset: {cd_pos}")
print(f"Schedule at nav_area offset: {sc_pos}")
print(f"Routine at nav_area offset: {rt_pos}")

# Find the start of each button block (go back to <button)
def find_button_start(text, pos):
    # Go back to find <button
    start = text.rfind('<button', 0, pos)
    return start

cd_start = find_button_start(nav_area, cd_pos)
sc_start = find_button_start(nav_area, sc_pos)
rt_start = find_button_start(nav_area, rt_pos)

print(f"Button starts: cd={cd_start}, sc={sc_start}, rt={rt_start}")

# Find ends (next </button>)
def find_button_end(text, pos):
    end = text.find('</button>', pos)
    return end + len('</button>') + 1  # +1 for newline

cd_end = find_button_end(nav_area, cd_start)
sc_end = find_button_end(nav_area, sc_start)
rt_end = find_button_end(nav_area, rt_start)

print(f"Button ends: cd={cd_end}, sc={sc_end}, rt={rt_end}")

# Build new nav area: keep everything before cd_start, add plan button, remove cd/sc/rt
new_plan_button = '''    <button class="nav-item" data-view="plan" onclick="switchView('plan')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
      规划中心
    </button>
'''

# The order in the file is: dashboard, gpa, countdown, finance, schedule, routine
# We want: dashboard, plan, gpa, finance
# So: keep dashboard, remove gpa+countdown+schedule+routine, add plan after dashboard, then add gpa back, then finance

# Find where each button block is
gpa_pos = nav_area.find('data-view="gpa"')
fin_pos = nav_area.find('data-view="finance"')
gpa_start = find_button_start(nav_area, gpa_pos)
fin_start = find_button_start(nav_area, fin_pos)
gpa_end = find_button_end(nav_area, gpa_start)
fin_end = find_button_end(nav_area, fin_start)

# Keep: everything before gpa_start (dashboard), then plan button, then gpa button, then finance button
before_dashboard_end = nav_area.find('</button>', nav_start - nav_start)  # Actually this is relative to nav_area
# Let me just compute absolute positions
abs_cd_start = nav_start + cd_start
abs_gpa_start = nav_start + gpa_start  
abs_fin_start = nav_start + fin_start
abs_sc_start = nav_start + sc_start
abs_rt_start = nav_start + rt_start
abs_sc_end = nav_start + sc_end
abs_rt_end = nav_start + rt_end

# Dashboard button end
dash_end_marker = h.find('</button>', nav_start)
dash_end = dash_end_marker + len('</button>') + 1

# Finance button end
fin_end_abs = nav_start + fin_end

# The section between finance end and schedule start is the "设置" section header
# The section between routine end and sidebar-footer is fine

# Build new HTML
part1 = h[:dash_end]  # Everything up to dashboard button end
part2 = new_plan_button  # Plan button
part3 = h[abs_gpa_start:abs_fin_start]  # GPA button
part4 = h[abs_fin_start:fin_end_abs]  # Finance button
part5 = h[abs_rt_end:sidebar_footer]  # From after routine to sidebar footer
part6 = h[sidebar_footer:]  # Everything after sidebar footer

new_h = part1 + part2 + part3 + part4 + part5 + part6
print(f"New HTML: {len(new_h)} chars")

# Save
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav2.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(new_h)
print(f"Saved to index_nav2.html")