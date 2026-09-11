with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v2.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"v2 input: {len(h)} chars")

# ===== STEP 4: Bottom nav update =====
# Replace countdown + schedule bottom nav items with plan
old_bn1 = h.find('data-view="countdown"')
old_bn_end = h.find('data-view="schedule"')
if old_bn_end > 0:
    # Find the schedule button end
    sched_btn_end = h.find('</button>', old_bn_end) + len('</button>') + 1
    
    # Find the countdown button start
    cd_btn_start = h.rfind('<button class="bottom-nav-item"', 0, old_bn1)
    
    # Replace with plan button
    plan_bn = '''    <button class="bottom-nav-item" data-view="plan" onclick="switchView('plan')">
      <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
      规划
    </button>
'''
    h = h[:cd_btn_start] + plan_bn + h[sched_btn_end:]
    print("Step 4 (bottom nav): updated")
else:
    print("WARNING: bottom nav schedule not found")

# ===== STEP 5: Plan view (replace countdown view, keep others) =====
cd_view_start = h.find("<!-- ===== 倒计时视图 ===== -->")
routine_view_end = h.find("<!-- ===== 视图：今日作息 ===== -->")

if cd_view_start > 0:
    # Find the end of routine view
    routine_section_end = h.find("<!-- ===== 弹窗：编辑作息事件 ===== -->")
    
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
    
    h = h[:cd_view_start] + plan_view + h[routine_section_end:]
    print("Step 5 (plan view): inserted")
else:
    print("WARNING: countdown view not found")

# ===== STEP 6: Update dashboard quick actions =====
# Update view references in dashboard
h = h.replace("switchView('countdown')", "switchView('plan')")
h = h.replace("switchView('schedule')", "switchView('plan')")
h = h.replace("switchView('routine')", "switchView('plan')")
print("Step 6 (view refs): updated")

# Save
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v3.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(h)
print(f"Saved v3: {len(h)} chars")