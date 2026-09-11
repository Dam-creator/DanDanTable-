with open(r"C:\Users\ASUS\Desktop\网站设计\repo-work\index_nav2.html", "r", encoding="utf-8") as f:
    h = f.read()

print(f"Input: {len(h)} chars")

# Fix bottom nav - replace countdown + schedule items with plan
# Find bottom nav section
bn_start = h.find('class="bottom-nav"')
bn_end = h.find('</nav>', bn_start) if bn_start > 0 else -1

if bn_start > 0:
    print(f"Bottom nav: {bn_start} to {bn_end}")

# New bottom nav
new_bottom_nav = '''    <button class="bottom-nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
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

# Find the first bottom-nav-item
first_bn = h.find('<button class="bottom-nav-item', bn_start)
last_bn_end = h.find('</nav>', first_bn)

if first_bn > 0:
    # Build new: before first button + new buttons + after last button
    before = h[:first_bn]
    after = h[last_bn_end:]
    new_h = before + new_bottom_nav + after
    print("Bottom nav replaced")
else:
    new_h = h

# Now add the renderPlan JS function
# Find where to insert: before renderAll function
ra_pos = new_h.find('function renderAll()')
if ra_pos > 0:
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
  const urgentCount = activeCountdowns.filter(c => {
    const info = getCountdownInfo(c);
    return info.days <= 7 && info.days >= 0;
  }).length;

  $("plan-stats").innerHTML =
    '<div class="stat-card primary"><div class="stat-label">今日安排</div><div class="stat-value">' + todayEvents.length + '<small>项</small></div></div>' +
    '<div class="stat-card success"><div class="stat-label">已完成</div><div class="stat-value">' + doneCount + '<small>/' + todayEvents.length + '</small></div></div>' +
    '<div class="stat-card danger"><div class="stat-label">待办倒计时</div><div class="stat-value">' + activeCountdowns.length + '<small>项</small></div></div>' +
    '<div class="stat-card warning"><div class="stat-label">即将到期</div><div class="stat-value">' + urgentCount + '<small>项</small></div></div>';
}

function switchScheduleDayTabs() {
  planSelectedDay = (planSelectedDay + 1) % 7;
  renderPlan();
}

function renderPlanDayTabs(data) {
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - schedTodayIndex() + i);
    const dateLabel = (d.getMonth()+1) + '/' + d.getDate();
    const isToday = i === schedTodayIndex();
    const isSelected = i === planSelectedDay;
    html += '<button class="schedule-filter' + (isSelected ? ' active' : '') + '" onclick="selectPlanDay(' + i + ')" style="' + (isToday ? 'border-color:var(--primary);font-weight:700;' : '') + '">' +
      SCHEDULE_WEEK_DAYS[i].charAt(1) + '<br>' + dateLabel + '</button>';
  }
  $("plan-day-tabs").innerHTML = html;
}

function selectPlanDay(day) {
  planSelectedDay = day;
  renderPlan();
}

function renderPlanTimeline(data) {
  const events = (data.scheduleEvents || []).filter(e => e.day === planSelectedDay).sort((a, b) => a.start - b.start);
  const cats = data.scheduleCategories || [];

  if (events.length === 0) {
    $("plan-timeline").innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-desc">这天还没有安排，点击右上角添加</div></div>';
    return;
  }

  let html = '';
  events.forEach(e => {
    const cat = cats.find(c => c.id === e.category) || { color: "#9B9B9B", name: "其他" };
    const startH = Math.floor(e.start / 60), startM = e.start % 60;
    const endH = Math.floor(e.end / 60), endM = e.end % 60;
    const timeStr = String(startH).padStart(2,'0')+':'+String(startM).padStart(2,'0');
    const endTimeStr = String(endH).padStart(2,'0')+':'+String(endM).padStart(2,'0');

    html += '<div class="routine-item ' + (e.done ? 'done' : '') + '" style="border-left:3px solid ' + cat.color + ';">' +
      '<div class="routine-time">' + timeStr + '<span>' + endTimeStr + '</span></div>' +
      '<div class="routine-title">' + escapeHtml(e.title) + '</div>' +
      '<div class="routine-meta">' +
      '<span style="color:' + cat.color + ';">' + cat.name + '</span>' +
      (e.location ? '<span>📍 ' + escapeHtml(e.location) + '</span>' : '') +
      '</div>' +
      '<button class="routine-done-btn" onclick="toggleScheduleDone(\'' + e.id + '\')" title="' + (e.done ? '恢复' : '完成') + '">' +
      (e.done ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '') +
      '</button></div>';
  });
  $("plan-timeline").innerHTML = html;
}

function renderPlanCountdowns(data) {
  let cds = data.countdowns.slice();
  if (state.countdownFilter === "active") cds = cds.filter(c => !c.done);
  else if (state.countdownFilter === "done") cds = cds.filter(c => c.done);

  ["all","active","done"].forEach(f => {
    const btn = document.getElementById("filter-"+f);
    if (btn) { btn.style.background = state.countdownFilter === f ? "var(--primary)" : ""; btn.style.color = state.countdownFilter === f ? "white" : ""; }
  });

  if (cds.length === 0) {
    $("plan-countdowns").innerHTML = '<div class="empty-state" style="padding:20px;grid-column:1/-1;"><div class="empty-desc">暂无倒计时</div></div>';
    return;
  }
  cds.sort((a,b) => { if (a.done !== b.done) return a.done ? 1 : -1; return new Date(a.date) - new Date(b.date); });
  const display = cds.slice(0, 8);
  $("plan-countdowns").innerHTML = display.map(c => {
    const info = getCountdownInfo(c);
    const cat = COUNTDOWN_CATEGORIES[c.category] || COUNTDOWN_CATEGORIES.other;
    if (c.done) return '<div class="countdown-card priority-low" style="opacity:0.5;"><div class="countdown-header"><div class="countdown-title" style="text-decoration:line-through;">' + escapeHtml(c.name) + '</div></div><div class="countdown-days" style="font-size:22px;">已完成</div></div>';
    if (info.isPast) return '<div class="countdown-card priority-low" style="opacity:0.6;"><div class="countdown-header"><div class="countdown-title">' + escapeHtml(c.name) + '</div></div><div class="countdown-days" style="font-size:22px;">已过期</div><div class="countdown-days-label">' + Math.abs(info.days) + ' 天前</div></div>';
    const isUrgent = info.days <= 7 && info.days >= 0;
    const progress = c.totalDays > 0 ? Math.min(100, Math.max(0, ((c.totalDays - info.days) / c.totalDays) * 100)) : 0;
    return '<div class="countdown-card priority-' + c.priority + (isUrgent ? ' urgent' : '') + '">' +
      '<div class="countdown-header"><div class="countdown-title">' + escapeHtml(c.name) + '</div><span class="tag">' + cat.name + '</span></div>' +
      '<div class="countdown-days ' + (isUrgent ? 'urgent' : '') + '">' + info.days + '</div>' +
      '<div class="countdown-days-label">天</div>' +
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
    new_h = new_h[:ra_pos] + plan_js + "\n" + new_h[ra_pos:]
    print("renderPlan JS inserted")
else:
    print("WARNING: renderAll not found")

# Add window exports
new_h = new_h.replace('window.selectScheduleCategory = selectScheduleCategory;',
    'window.selectScheduleCategory = selectScheduleCategory;\nwindow.renderPlan = renderPlan;\nwindow.selectPlanDay = selectPlanDay;\nwindow.switchScheduleDayTabs = switchScheduleDayTabs;')

# Copy to final destination
out = r"C:\Users\ASUS\Desktop\网站设计\repo-work\index.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(new_h)
print(f"Final: {len(new_h)} chars -> index.html")