with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_css_done.html", "r", encoding="utf-8") as f:
    html = f.read()

print(f"Input: {len(html)} chars")

# ===== SIDEBAR NAVIGATION =====
# Replace old sidebar nav items with new merged navigation
old_nav = '''    <button class="nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
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
    </button>'''

new_nav = '''    <button class="nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
      <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
      首页
    </button>
    <button class="nav-item" data-view="plan" onclick="switchView('plan')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
      规划中心
      <span class="nav-badge" id="plan-badge" style="display:none;">0</span>
    </button>
    <button class="nav-item" data-view="gpa" onclick="switchView('gpa')">
      <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
      GPA计算
    </button>
    <button class="nav-item" data-view="finance" onclick="switchView('finance')">
      <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
      记账本
    </button>'''

if old_nav in html:
    html = html.replace(old_nav, new_nav)
    print("Sidebar nav updated")
else:
    print("WARNING: Sidebar nav not found for exact match")

# ===== BOTTOM NAV ===== 
old_bottom = '''    <button class="bottom-nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
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
    </button>'''

new_bottom = '''    <button class="bottom-nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
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
    </button>'''

if old_bottom in html:
    html = html.replace(old_bottom, new_bottom)
    print("Bottom nav updated")
else:
    print("WARNING: Bottom nav not found for exact match")

# ===== Replace countdown+schedule+routine views with plan view =====
cd_start = html.find("<!-- ===== 倒计时视图 ===== -->")
routine_end = html.find("<!-- ===== 弹窗：编辑作息事件 ===== -->")

if cd_start > 0 and routine_end > 0:
    plan_view = '''      <!-- ===== 规划中心视图 ===== -->
      <div class="view" id="view-plan">
        <div class="topbar">
          <div>
            <h1 class="page-title">规划中心</h1>
            <p class="page-subtitle" id="plan-date">作息安排 · 考试倒计时 · 每日规划</p>
          </div>
          <div class="topbar-actions">
            <button class="btn btn-ghost btn-sm" onclick="showAddCountdown()">+ 添加倒计时</button>
            <button class="btn btn-primary" onclick="showAddScheduleEvent()">+ 添加安排</button>
          </div>
        </div>
        <div class="stats-grid" id="plan-stats"></div>
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header">
              <div class="card-title"><span class="dot"></span>今日作息</div>
              <button class="btn btn-ghost btn-sm" onclick="switchScheduleDayTabs()">切换日期</button>
            </div>
            <div class="countdown-tabs" id="plan-day-tabs" style="margin-bottom:14px;"></div>
            <div class="routine-timeline" id="plan-timeline"></div>
          </div>
          <div class="card">
            <div class="card-header">
              <div class="card-title"><span class="dot" style="background:var(--danger);"></span>考试倒计时</div>
              <div style="display:flex;gap:4px;">
                <button class="btn btn-ghost btn-sm" onclick="toggleCountdownFilter('all')" id="filter-all">全部</button>
                <button class="btn btn-ghost btn-sm" onclick="toggleCountdownFilter('active')" id="filter-active">进行中</button>
                <button class="btn btn-ghost btn-sm" onclick="toggleCountdownFilter('done')" id="filter-done">已完成</button>
              </div>
            </div>
            <div class="countdown-grid" id="plan-countdowns" style="max-height:420px;overflow-y:auto;"></div>
          </div>
        </div>
        <div class="card dashboard-card-full" style="margin-top:18px;">
          <div class="card-header">
            <div class="card-title"><span class="dot" style="background:var(--accent);"></span>本周作息总览</div>
            <button class="btn btn-ghost btn-sm" onclick="showAddScheduleEvent()">+ 添加安排</button>
          </div>
          <div class="countdown-grid" id="plan-schedule-list"></div>
        </div>
      </div>
'''
    html = html[:cd_start] + plan_view + html[routine_end:]
    print("Plan view inserted")
else:
    print(f"WARNING: cd_start={cd_start}, routine_end={routine_end}")

# ===== Update dashboard quick actions =====
old_qa_start = '<div class="dashboard-grid">'
# Find the quick actions section in the dashboard
qa_start = html.find('''<button class="quick-action" onclick="switchView('gpa')''')
if qa_start > 0:
    # Find the end of quick actions
    qa_end = html.find('''            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <div class="card-title"><span class="dot" style="background:var(--danger);"></span>最近倒计时</div>
              <button class="btn btn-ghost btn-sm" onclick="switchView('countdown')">查看全部</button>''')
    
    if qa_end > 0:
        new_qa = '''<div class="dashboard-grid">
            <div class="card">
              <div class="card-header"><div class="card-title"><span class="dot"></span>快速操作</div></div>
              <div class="quick-actions">
                <button class="quick-action" onclick="switchView('plan');setTimeout(()=>showAddScheduleEvent(),300)">
                  <div class="quick-action-icon" style="background:linear-gradient(135deg,#6C5CE7,#5A4BD1);"><svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg></div>
                  <div class="quick-action-text">添加安排</div>
                </button>
                <button class="quick-action" onclick="switchView('plan');setTimeout(()=>showAddCountdown(),300)">
                  <div class="quick-action-icon" style="background:linear-gradient(135deg,#E17055,#D63031);"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></div>
                  <div class="quick-action-text">添加倒计时</div>
                </button>
                <button class="quick-action" onclick="switchView('gpa');setTimeout(()=>document.getElementById('add-course-btn')?.click(),300)">
                  <div class="quick-action-icon" style="background:linear-gradient(135deg,#00B894,#00A381);"><svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg></div>
                  <div class="quick-action-text">添加课程</div>
                </button>
                <button class="quick-action" onclick="switchView('finance');setTimeout(()=>document.getElementById('add-transaction-btn')?.click(),300)">
                  <div class="quick-action-icon" style="background:linear-gradient(135deg,#FDCB6E,#F0A500);"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>
                  <div class="quick-action-text">记一笔账</div>
                </button>
              </div>'''
        html = html[:qa_start] + new_qa + html[qa_end + len(""">查看全部</button>"):]
        print("Quick actions updated")
    else:
        print("WARNING: qa_end not found")
else:
    print("WARNING: qa_start not found")

# Replace remaining view references
html = html.replace("switchView('countdown')", "switchView('plan')")
html = html.replace("switchView('schedule')", "switchView('plan')")
html = html.replace("switchView('routine')", "switchView('plan')")
print("View references updated")

out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_html_done.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"HTML done: {len(html)} chars -> {out}")