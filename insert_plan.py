with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_css_done.html", "r", encoding="utf-8") as f:
    h = f.read()

# Find the countdown view section markers
cd_start = h.find("<!-- ===== 倒计时视图 ===== -->")
routine_end = h.find("<!-- ===== 弹窗：编辑作息事件 ===== -->")
print(f"cd_start={cd_start}, routine_end={routine_end}")

# Extract before and after
before = h[:cd_start]
after = h[routine_end:]

# New plan view HTML
plan_view = """      <!-- ===== 规划中心视图 ===== -->
      <div class="view" id="view-plan">
        <div class="topbar">
          <div>
            <h1 class="page-title">规划中心</h1>
            <p class="page-subtitle" id="plan-date">作息安排 考试倒计时 每日规划</p>
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
                <button class="btn btn-ghost btn-sm" onclick="toggleCountdownFilter(&apos;all&apos;)" id="filter-all">全部</button>
                <button class="btn btn-ghost btn-sm" onclick="toggleCountdownFilter(&apos;active&apos;)" id="filter-active">进行中</button>
                <button class="btn btn-ghost btn-sm" onclick="toggleCountdownFilter(&apos;done&apos;)" id="filter-done">已完成</button>
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
"""

new_html = before + plan_view + after
print(f"Plan view inserted, {len(new_html)} chars")

# Save intermediate
with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_plan_inserted.html", "w", encoding="utf-8") as f:
    f.write(new_html)
print("Saved index_plan_inserted.html")