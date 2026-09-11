# Go back to v2 and redo step 5 correctly
with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v2.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"v2: {len(h)} chars")

# Find view boundaries
cd_start = h.find("<!-- ===== 倒计时视图 ===== -->")
fin_start = h.find("<!-- ===== 记账视图 ===== -->")
sc_start = h.find("<!-- ===== 视图：作息总表 ===== -->")
rt_start = h.find("<!-- ===== 视图：今日作息 ===== -->")
modals_start = h.find("<!-- ===== 弹窗：编辑作息事件 ===== -->")

print(f"Countdown: {cd_start}")
print(f"Finance: {fin_start}")
print(f"Schedule: {sc_start}")
print(f"Routine: {rt_start}")
print(f"Modals: {modals_start}")

# Plan view HTML
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

# Build: before countdown + plan + finance view + everything after routine (modals)
new_h = h[:cd_start] + plan_view + "\n" + h[fin_start:sc_start] + h[rt_start:modals_start] + h[modals_start:]

# Wait, that's not right either. Let me think...
# We want: ...dashboard, gpa, PLAN, finance, MODALS...
# So: keep up to countdown, add plan, add finance, add modals

new_h = h[:cd_start] + plan_view + "\n" + h[fin_start:sc_start] + h[modals_start:]
print(f"Rebuilt: {len(new_h)} chars")

# Verify
for term in ["view-plan", "view-countdown", "view-schedule", "view-routine", "view-dashboard", "view-gpa", "view-finance"]:
    c = new_h.count(term)
    print(f"  {term}: {c}")

out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v3.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(new_h)
print("Saved v3")