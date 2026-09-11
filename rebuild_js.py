with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_v3.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Input: {len(h)} chars")

# ===== JS: Update switchView =====
old_switch = '''  if (view === "dashboard") renderDashboard();
  else if (view === "gpa") renderGPA();
  else if (view === "countdown") renderCountdown();
  else if (view === "finance") renderFinance();
  else if (view === "schedule") renderSchedule();
  else if (view === "routine") renderRoutine();'''

new_switch = '''  if (view === "dashboard") renderDashboard();
  else if (view === "gpa") renderGPA();
  else if (view === "plan") renderPlan();
  else if (view === "finance") renderFinance();'''

if old_switch in h:
    h = h.replace(old_switch, new_switch)
    print("switchView updated")
else:
    # Try with different whitespace
    idx = h.find("renderRoutine()")
    print(f"renderRoutine at {idx}")
    if idx > 0:
        print(repr(h[idx-200:idx+50]))

# ===== JS: Add renderPlan before renderAll =====
render_all = h.find("function renderAll()")
if render_all > 0:
    plan_js = '''
// ========== 规划中心 (merged Schedule + Countdown) ==========
let planSelectedDay = null;

function renderPlan() {
  const data = getCurrentData();
  const now = new Date();
  const dateStr = now.getFullYear() + "年" + (now.getMonth()+1) + "月" + now.getDate() + "日 " + SCHEDULE_WEEK_DAYS[schedTodayIndex()];
  $("plan-date").textContent = dateStr + " · 作息安排 · 考试倒计时";
  if (planSelectedDay === null) planSelectedDay = schedTodayIndex();
  renderPlanStats(data);
  renderPlanDayTabs(data);
  renderPlanTimeline(data);
  renderPlanCountdowns(data);
  renderPlanScheduleList(data);
}

function renderPlanStats(data) {
  const today = schedTodayIndex();
  const todayEvents = (data.scheduleEvents || []).filter(e => e.day === today);
  const doneCount = todayEvents.filter(e => e.done).length;
  const activeCountdowns = data.countdowns.filter(c => !c.done);
  const urgentCount = activeCountdowns.filter(c => { const info = getCountdownInfo(c); return info.days <= 7 && info.days >= 0; }).length;
  $("plan-stats").innerHTML =
    '<div class="stat-card primary"><div class="stat-label">今日安排</div><div class="stat-value">' + todayEvents.length + '<small>项</small></div></div>' +
    '<div class="stat-card success"><div class="stat-label">已完成</div><div class="stat-value">' + doneCount + '<small>/' + todayEvents.length + '</small></div></div>' +
    '<div class="stat-card danger"><div class="stat-label">待办倒计时</div><div class="stat-value">' + activeCountdowns.length + '<small>项</small></div></div>' +
    '<div class="stat-card warning"><div class="stat-label">即将到期</div><div class="stat-value">' + urgentCount + '<small>项</small></div></div>';
}

function switchScheduleDayTabs() { planSelectedDay = (planSelectedDay + 1) % 7; renderPlan(); }

function renderPlanDayTabs(data) {
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - schedTodayIndex() + i);
    const dateLabel = (d.getMonth()+1) + '/' + d.getDate();
    const isToday = i === schedTodayIndex();
    const isSelected = i === planSelectedDay;
    html += '<button class="schedule-filter' + (isSelected ? ' active' : '') + '" onclick="selectPlanDay(' + i + ')" style="' + (isToday ? 'border-color:var(--primary);font-weight:700;' : '') + '">' + SCHEDULE_WEEK_DAYS[i].charAt(1) + '<br>' + dateLabel + '</button>';
  }
  $("plan-day-tabs").innerHTML = html;
}

function selectPlanDay(day) { planSelectedDay = day; renderPlan(); }

function renderPlanTimeline(data) {
  const events = (data.scheduleEvents || []).filter(e => e.day === planSelectedDay).sort((a, b) => a.start - b.start);
  const cats = data.scheduleCategories || [];
  if (events.length === 0) { $("plan-timeline").innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-desc">这天还没有安排，点击右上角添加</div></div>'; return; }
  let html = '';
  events.forEach(e => {
    const cat = cats.find(c => c.id === e.category) || { color: "#9B9B9B", name: "其他" };
    const startH = Math.floor(e.start / 60), startM = e.start % 60;
    const endH = Math.floor(e.end / 60), endM = e.end % 60;
    html += '<div class="routine-item ' + (e.done ? 'done' : '') + '" style="border-left:3px solid ' + cat.color + ';">' +
      '<div class="routine-time">' + String(startH).padStart(2,'0')+':'+String(startM).padStart(2,'0') + '<span>' + String(endH).padStart(2,'0')+':'+String(endM).padStart(2,'0') + '</span></div>' +
      '<div class="routine-title">' + escapeHtml(e.title) + '</div>' +
      '<div class="routine-meta"><span style="color:' + cat.color + ';">' + cat.name + '</span>' + (e.location ? '<span>📍 ' + escapeHtml(e.location) + '</span>' : '') + '</div>' +
      '<button class="routine-done-btn" onclick="toggleScheduleDone(\'' + e.id + '\')" title="' + (e.done ? '恢复' : '完成') + '">' + (e.done ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '') + '</button></div>';
  });
  $("plan-timeline").innerHTML = html;
}

function renderPlanCountdowns(data) {
  let cds = data.countdowns.slice();
  if (state.countdownFilter === "active") cds = cds.filter(c => !c.done);
  else if (state.countdownFilter === "done") cds = cds.filter(c => c.done);
  ["all","active","done"].forEach(f => { const btn = document.getElementById("filter-"+f); if (btn) { btn.style.background = state.countdownFilter === f ? "var(--primary)" : ""; btn.style.color = state.countdownFilter === f ? "white" : ""; } });
  if (cds.length === 0) { $("plan-countdowns").innerHTML = '<div class="empty-state"><div class="empty-desc">暂无倒计时</div></div>'; return; }
  cds.sort((a,b) => { if (a.done !== b.done) return a.done ? 1 : -1; return new Date(a.date) - new Date(b.date); });
  $("plan-countdowns").innerHTML = cds.slice(0, 8).map(c => {
    const info = getCountdownInfo(c);
    const cat = COUNTDOWN_CATEGORIES[c.category] || COUNTDOWN_CATEGORIES.other;
    if (c.done) return '<div class="countdown-card priority-low" style="opacity:0.5;"><div class="countdown-header"><div class="countdown-title" style="text-decoration:line-through;">' + escapeHtml(c.name) + '</div></div><div class="countdown-days" style="font-size:22px;">已完成</div></div>';
    if (info.isPast) return '<div class="countdown-card priority-low" style="opacity:0.6;"><div class="countdown-header"><div class="countdown-title">' + escapeHtml(c.name) + '</div></div><div class="countdown-days" style="font-size:22px;">已过期</div><div class="countdown-days-label">' + Math.abs(info.days) + ' 天前</div></div>';
    const isUrgent = info.days <= 7 && info.days >= 0;
    const progress = c.totalDays > 0 ? Math.min(100, Math.max(0, ((c.totalDays - info.days) / c.totalDays) * 100)) : 0;
    return '<div class="countdown-card priority-' + c.priority + (isUrgent ? ' urgent' : '') + '">' +
      '<div class="countdown-header"><div class="countdown-title">' + escapeHtml(c.name) + '</div><span class="tag">' + cat.name + '</span></div>' +
      '<div class="countdown-days ' + (isUrgent ? 'urgent' : '') + '">' + info.days + '</div><div class="countdown-days-label">天</div>' +
      '<div class="countdown-progress"><div class="countdown-progress-bar" style="width:' + progress + '%;background:' + (isUrgent ? 'var(--danger)' : 'var(--primary)') + ';"></div></div>' +
      '<div class="countdown-actions"><button class="done-btn" onclick="toggleCountdownDone(\'' + c.id + '\')">完成</button><button class="del-btn" onclick="deleteCountdown(\'' + c.id + '\')">删除</button></div></div>';
  }).join("");
}

function renderPlanScheduleList(data) {
  const events = (data.scheduleEvents || []).sort((a, b) => { if (a.day !== b.day) return a.day - b.day; return a.start - b.start; });
  const cats = data.scheduleCategories || [];
  if (events.length === 0) { $("plan-schedule-list").innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-desc">还没有任何安排</div></div>'; return; }
  $("plan-schedule-list").innerHTML = events.map(e => {
    const cat = cats.find(c => c.id === e.category) || { color: "#9B9B9B", name: "其他" };
    const startH = Math.floor(e.start / 60), startM = e.start % 60;
    const endH = Math.floor(e.end / 60), endM = e.end % 60;
    const timeStr = String(startH).padStart(2,'0')+':'+String(startM).padStart(2,'0')+' - '+String(endH).padStart(2,'0')+':'+String(endM).padStart(2,'0');
    return '<div class="countdown-card ' + (e.done ? 'done' : '') + '" style="border-top:3px solid ' + cat.color + ';">' +
      '<div class="countdown-header"><div class="countdown-title">' + escapeHtml(e.title) + '</div><span class="tag" style="background:' + cat.color + '20;color:' + cat.color + ';">' + cat.name + '</span></div>' +
      '<div class="countdown-time">🕐 ' + timeStr + ' | ' + SCHEDULE_WEEK_DAYS[e.day] + '</div>' +
      (e.location ? '<div class="countdown-time">📍 ' + escapeHtml(e.location) + '</div>' : '') +
      '<div class="countdown-actions"><button onclick="toggleScheduleDone(\'' + e.id + '\')">' + (e.done ? '恢复' : '完成') + '</button><button onclick="editScheduleEvent(\'' + e.id + '\')">编辑</button><button class="del-btn" onclick="deleteScheduleEvent(\'' + e.id + '\')">删除</button></div></div>';
  }).join("");
}
'''
    h = h[:render_all] + plan_js + h[render_all:]
    print("renderPlan inserted")

# ===== JS: Update renderAll =====
old_ra = '''  renderDashboard();
  renderGPA();
  renderCountdown();
  renderFinance();
  renderSchedule();
  renderRoutine();'''
new_ra = '''  renderDashboard();
  renderGPA();
  renderPlan();
  renderFinance();'''
h = h.replace(old_ra, new_ra)
print("renderAll updated")

# ===== JS: Update view class handling =====
old_vc = '''main.classList.remove("view-gpa", "view-countdown", "view-finance", "view-schedule", "view-routine");'''
new_vc = '''main.classList.remove("view-gpa", "view-plan", "view-finance");'''
h = h.replace(old_vc, new_vc)

old_va = '''if (view !== "dashboard") main.classList.add("view-" + view);'''
new_va = '''if (view !== "dashboard" && view !== "plan") main.classList.add("view-" + view);'''
h = h.replace(old_va, new_va)

# ===== JS: Update timer =====
old_tm = '''if (state.currentProfileId && state.currentView === "countdown") renderCountdown();'''
new_tm = '''if (state.currentProfileId && state.currentView === "plan") renderPlan();'''
h = h.replace(old_tm, new_tm)
print("Timer updated")

# ===== JS: Add window exports =====
export_line = 'window.selectScheduleCategory = selectScheduleCategory;'
new_exports = '''window.selectScheduleCategory = selectScheduleCategory;
window.renderPlan = renderPlan;
window.selectPlanDay = selectPlanDay;
window.switchScheduleDayTabs = switchScheduleDayTabs;'''
h = h.replace(export_line, new_exports)
print("Exports added")

# ===== CSS: Clean up old view- references =====
h = h.replace('.view-countdown { --view-accent: #f97316; --view-glow: rgba(249,115,22,0.3); }\n', '')
h = h.replace('.view-schedule { --view-accent: #06b6d4; --view-glow: rgba(6,182,212,0.3); }\n', '')
h = h.replace('.view-routine { --view-accent: #ec4899; --view-glow: rgba(236,72,153,0.3); }\n', '')

# ===== CSS: Update button styles for dark/premium look =====
# 1. btn-primary: dark bg
old_btn_primary = '''.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%);
  color: white;
  box-shadow: 0 4px 16px var(--primary-glow);
}'''
new_btn_primary = '''.btn-primary {
  background: #1E1E2E;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}'''
h = h.replace(old_btn_primary, new_btn_primary)

# 2. btn-primary hover
old_btn_hover = '''.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--primary-glow); }'''
new_btn_hover = '''.btn-primary:hover { background: #2D2D3F; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.25); }'''
h = h.replace(old_btn_hover, new_btn_hover)

# 3. btn-primary active
old_btn_active = '''.btn-primary:active { transform: translateY(0); }'''
new_btn_active = '''.btn-primary:active { transform: translateY(0); background: #151520; }'''
h = h.replace(old_btn_active, new_btn_active)

print("Button styles updated to dark/premium")

# Save final
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(h)
print(f"FINAL: {len(h)} chars -> index.html")