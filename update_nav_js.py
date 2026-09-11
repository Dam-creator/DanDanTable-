with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_plan_inserted.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Input: {len(h)} chars")

# ===== SIDEBAR NAV =====
old_nav = """    <button class="nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
      <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
      首页
    </button>
    <button class="nav-item" data-view="gpa" onclick="switchView('gpa')">
      <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
      GPA计算
    </button>
    <button class="nav-item" data-view="countdown" onclick="switchView('countdown')">
      <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
      考试倒计时
      <span class="nav-badge" id="countdown-badge" style="display:none;">0</span>
    </button>
    <button class="nav-item" data-view="finance" onclick="switchView('finance')">
      <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
      记账本
    </button>
    <button class="nav-item" data-view="schedule" onclick="switchView('schedule')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
      作息总表
    </button>
    <button class="nav-item" data-view="routine" onclick="switchView('routine')">
      <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
      今日作息
    </button>"""

new_nav = """    <button class="nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
      <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
      首页
    </button>
    <button class="nav-item" data-view="plan" onclick="switchView('plan')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
      规划中心
    </button>
    <button class="nav-item" data-view="gpa" onclick="switchView('gpa')">
      <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
      GPA计算
    </button>
    <button class="nav-item" data-view="finance" onclick="switchView('finance')">
      <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
      记账本
    </button>"""

if old_nav in h:
    h = h.replace(old_nav, new_nav)
    print("Sidebar nav updated")
else:
    print("WARNING: Sidebar nav NOT FOUND")
    # Try to debug
    idx = h.find("考试倒计时")
    print(f"Found 考试倒计时 at position {idx}")

# ===== BOTTOM NAV =====
old_bot = """    <button class="bottom-nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
      <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      首页
    </button>
    <button class="bottom-nav-item" data-view="gpa" onclick="switchView('gpa')">
      <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
      GPA
    </button>
    <button class="bottom-nav-item" data-view="countdown" onclick="switchView('countdown')">
      <svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
      倒计时
    </button>
    <button class="bottom-nav-item" data-view="finance" onclick="switchView('finance')">
      <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
      记账
    </button>
    <button class="bottom-nav-item" data-view="schedule" onclick="switchView('schedule')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
      作息
    </button>"""

new_bot = """    <button class="bottom-nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
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
    </button>"""

if old_bot in h:
    h = h.replace(old_bot, new_bot)
    print("Bottom nav updated")
else:
    print("WARNING: Bottom nav NOT FOUND")

# ===== JS: Update switchView =====
old_switch = """  if (view === "dashboard") renderDashboard();
  else if (view === "gpa") renderGPA();
  else if (view === "countdown") renderCountdown();
  else if (view === "finance") renderFinance();
  else if (view === "schedule") renderSchedule();
  else if (view === "routine") renderRoutine();"""

new_switch = """  if (view === "dashboard") renderDashboard();
  else if (view === "gpa") renderGPA();
  else if (view === "plan") renderPlan();
  else if (view === "finance") renderFinance();"""

if old_switch in h:
    h = h.replace(old_switch, new_switch)
    print("switchView updated")
else:
    print("WARNING: switchView NOT FOUND")
    # Show context
    idx = h.find("renderCountdown")
    ctx = h[idx-30:idx+60] if idx > 0 else "N/A"
    print(f"renderCountdown context: {repr(ctx)}")

# Update view classes
old_vc = """main.classList.remove("view-gpa", "view-countdown", "view-finance", "view-schedule", "view-routine");"""
new_vc = """main.classList.remove("view-gpa", "view-plan", "view-finance");"""
if old_vc in h:
    h = h.replace(old_vc, new_vc)

# Update view class add
old_va = """if (view !== "dashboard") main.classList.add("view-" + view);"""
new_va = """if (view !== "dashboard" && view !== "plan") main.classList.add("view-" + view);"""
if old_va in h:
    h = h.replace(old_va, new_va)

# Update renderAll
old_ra = """  renderDashboard();
  renderGPA();
  renderCountdown();
  renderFinance();
  renderSchedule();
  renderRoutine();"""
new_ra = """  renderDashboard();
  renderGPA();
  renderPlan();
  renderFinance();"""
if old_ra in h:
    h = h.replace(old_ra, new_ra)
    print("renderAll updated")

# Update timer
old_timer = """if (state.currentProfileId && state.currentView === "countdown") renderCountdown();"""
new_timer = """if (state.currentProfileId && state.currentView === "plan") renderPlan();"""
if old_timer in h:
    h = h.replace(old_timer, new_timer)

# Replace remaining view references in JS
for old_ref in ["switchView('countdown')", "switchView('schedule')", "switchView('routine')"]:
    new_ref = "switchView('plan')"
    h = h.replace(old_ref, new_ref)
print("View references replaced")

# Save
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav_done.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(h)
print(f"Nav done: {len(h)} chars -> index_nav_done.html")