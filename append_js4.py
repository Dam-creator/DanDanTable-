import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index_new.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# JavaScript代码 - 第四部分：作息、仪表盘、数据管理、初始化
js_part4 = '''
// ===== Plan / Schedule =====
function renderPlan() {
  const data = getProfileData(state.currentProfileId);
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  
  // 统计
  const todayEvents = data.scheduleEvents.filter(e => {
    if (e.repeat === 'daily') return true;
    if (e.repeat === 'weekday') return dayOfWeek < 5;
    if (e.repeat === 'weekend') return dayOfWeek >= 5;
    if (e.repeat === 'custom') return e.days?.includes(dayOfWeek);
    return e.day === dayOfWeek;
  });
  
  const doneToday = todayEvents.filter(e => e.done).length;
  const weekEvents = data.scheduleEvents.length;
  const completionRate = todayEvents.length > 0 ? Math.round((doneToday / todayEvents.length) * 100) : 0;
  
  $("plan-today-count").textContent = todayEvents.length;
  $("plan-done-count").textContent = doneToday;
  $("plan-completion-rate").textContent = completionRate + "%";
  
  // 日期标签
  $("plan-today-date-label").textContent = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  
  // 星期标签
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  $("plan-day-tabs").innerHTML = dayNames.map((d, i) => `
    <button class="btn ${i === state.selectedScheduleDay ? 'btn-primary' : 'btn-ghost'}" style="padding:6px 12px;font-size:12px;" onclick="switchScheduleDay(${i})">${d}</button>
  `).join("");
  
  // 作息列表
  const dayEvents = data.scheduleEvents.filter(e => {
    if (e.repeat === 'daily') return true;
    if (e.repeat === 'weekday') return state.selectedScheduleDay < 5;
    if (e.repeat === 'weekend') return state.selectedScheduleDay >= 5;
    if (e.repeat === 'custom') return e.days?.includes(state.selectedScheduleDay);
    return e.day === state.selectedScheduleDay;
  }).sort((a, b) => a.start.localeCompare(b.start));
  
  const listContainer = $("plan-schedule-list");
  if (dayEvents.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg></div>
        <div class="empty-state-title">暂无安排</div>
        <div class="empty-state-desc">点击右上角添加作息安排</div>
      </div>`;
  } else {
    listContainer.innerHTML = dayEvents.map(e => {
      const cat = SCHEDULE_CATEGORIES.find(c => c.id === e.category) || SCHEDULE_CATEGORIES[5];
      return `
        <div class="list-item" style="${e.done ? 'opacity:0.6;' : ''}">
          <div style="width:60px;text-align:center;margin-right:12px;">
            <div style="font-size:14px;font-weight:700;color:${cat.color};">${e.start}</div>
            <div style="font-size:11px;color:var(--text-3);">${e.end}</div>
          </div>
          <div class="list-item-avatar" style="background:${cat.color}20;color:${cat.color};">
            <span class="tag" style="background:${cat.color}20;color:${cat.color};">${cat.name}</span>
          </div>
          <div class="list-item-content">
            <div class="list-item-title" style="${e.done ? 'text-decoration:line-through;' : ''}">${e.title}</div>
            <div class="list-item-subtitle">${e.repeat === 'daily' ? '每天' : e.repeat === 'weekday' ? '工作日' : e.repeat === 'weekend' ? '周末' : e.repeat === 'custom' ? '自定义' : '单次'}</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" onclick="toggleScheduleDone('${e.id}')">${e.done ? '恢复' : '完成'}</button>
            <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" onclick="editScheduleEvent('${e.id}')">编辑</button>
            <button class="btn btn-danger" style="padding:4px 8px;font-size:11px;" onclick="deleteScheduleEvent('${e.id}')">删除</button>
          </div>
        </div>`;
    }).join("");
  }
  
  // 今日时间线
  const timelineContainer = $("plan-today-timeline");
  if (todayEvents.length === 0) {
    timelineContainer.innerHTML = '<div style="text-align:center;color:var(--text-3);padding:20px;font-size:13px;">今日暂无安排</div>';
  } else {
    timelineContainer.innerHTML = todayEvents.sort((a, b) => a.start.localeCompare(b.start)).map(e => {
      const cat = SCHEDULE_CATEGORIES.find(c => c.id === e.category) || SCHEDULE_CATEGORIES[5];
      return `
        <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);${e.done ? 'opacity:0.5;' : ''}">
          <div style="width:50px;text-align:right;font-size:12px;font-weight:600;color:${cat.color};">${e.start}</div>
          <div style="width:3px;background:${cat.color};border-radius:2px;"></div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;">${e.title}</div>
            <div style="font-size:11px;color:var(--text-3);">${e.end} 结束</div>
          </div>
        </div>`;
    }).join("");
  }
  
  // 习惯打卡
  renderHabits(data);
  
  // 健康记录
  renderHealth(data);
  
  // 周统计图表
  renderPlanChart(data);
}

function renderHabits(data) {
  const container = $("plan-habits-list");
  const today = new Date().toDateString();
  container.innerHTML = data.habits.map(h => {
    const completed = h.completed[today] || 0;
    const progress = Math.min(100, (completed / h.target) * 100);
    return `
      <div style="padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;">${h.icon} ${h.name}</span>
          <span style="font-size:12px;color:var(--text-3);">${completed}/${h.target} ${h.unit}</span>
        </div>
        <div class="progress-bar" style="margin-bottom:8px;">
          <div class="progress-fill" style="width:${progress}%;background:linear-gradient(90deg,var(--green),var(--teal));"></div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-primary" style="padding:4px 10px;font-size:11px;flex:1;" onclick="toggleHabit('${h.id}', 1)">+1 ${h.unit}</button>
          <button class="btn btn-ghost" style="padding:4px 10px;font-size:11px;" onclick="toggleHabit('${h.id}', -1)">-1</button>
        </div>
      </div>`;
  }).join("");
}

function toggleHabit(habitId, delta) {
  const data = getProfileData(state.currentProfileId);
  const habit = data.habits.find(h => h.id === habitId);
  if (!habit) return;
  const today = new Date().toDateString();
  habit.completed[today] = Math.max(0, (habit.completed[today] || 0) + delta);
  saveProfileData(state.currentProfileId, data);
  renderPlan();
}

function renderHealth(data) {
  const container = $("plan-health-list");
  const recent = data.health.slice(-5).reverse();
  if (recent.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-3);padding:16px;font-size:13px;">暂无健康记录</div>';
    return;
  }
  container.innerHTML = recent.map(h => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">
      <span style="color:var(--text-3);">${new Date(h.date).toLocaleDateString('zh-CN')}</span>
      <span>体重:${h.weight}kg 睡眠:${h.sleep}h 水:${h.water}ml</span>
    </div>
  `).join("");
}

function showHealthRecord() {
  $("health-weight").value = "";
  $("health-sleep").value = "";
  $("health-water").value = "";
  $("health-exercise").value = "";
  $("health-mood").value = "good";
  showModal("modal-health-record");
}

function saveHealthRecord() {
  const data = getProfileData(state.currentProfileId);
  data.health.push({
    id: uuid(),
    date: new Date().toISOString().split('T')[0],
    weight: parseFloat($("health-weight").value) || 0,
    sleep: parseFloat($("health-sleep").value) || 0,
    water: parseInt($("health-water").value) || 0,
    exercise: parseInt($("health-exercise").value) || 0,
    mood: $("health-mood").value
  });
  saveProfileData(state.currentProfileId, data);
  closeModal("modal-health-record");
  renderPlan();
  toast("健康记录已保存", "success");
}

function renderPlanChart(data) {
  const chartEl = $("plan-weekly-chart");
  if (chartEl && typeof echarts !== 'undefined') {
    if (state.charts.planWeekly) state.charts.planWeekly.dispose();
    const chart = echarts.init(chartEl);
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const counts = dayNames.map((_, i) => {
      return data.scheduleEvents.filter(e => {
        if (e.repeat === 'daily') return true;
        if (e.repeat === 'weekday') return i < 5;
        if (e.repeat === 'weekend') return i >= 5;
        if (e.repeat === 'custom') return e.days?.includes(i);
        return e.day === i;
      }).length;
    });
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: dayNames, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      series: [{ type: 'bar', data: counts, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#6C5CE7' }, { offset: 1, color: '#A29BFE' }]), borderRadius: [6, 6, 0, 0] }, barWidth: '50%' }]
    });
    state.charts.planWeekly = chart;
  }
}

function switchScheduleDay(day) {
  state.selectedScheduleDay = day;
  renderPlan();
}

function showAddScheduleEvent() {
  state.editingScheduleId = null;
  $("schedule-modal-title").textContent = "添加安排";
  $("schedule-title").value = "";
  $("schedule-start").value = "08:00";
  $("schedule-end").value = "09:00";
  $("schedule-repeat").value = "daily";
  $("schedule-days-group").style.display = "none";
  state.selectedScheduleCategory = "study";
  renderScheduleCategories();
  renderScheduleDays();
  showModal("modal-schedule-event");
}

function editScheduleEvent(id) {
  const data = getProfileData(state.currentProfileId);
  const e = data.scheduleEvents.find(x => x.id === id);
  if (!e) return;
  state.editingScheduleId = id;
  $("schedule-modal-title").textContent = "编辑安排";
  $("schedule-title").value = e.title;
  $("schedule-start").value = e.start;
  $("schedule-end").value = e.end;
  $("schedule-repeat").value = e.repeat;
  $("schedule-days-group").style.display = e.repeat === 'custom' ? 'block' : 'none';
  state.selectedScheduleCategory = e.category;
  renderScheduleCategories();
  renderScheduleDays(e.days || []);
  showModal("modal-schedule-event");
}

function renderScheduleCategories() {
  const container = $("schedule-category-list");
  container.innerHTML = SCHEDULE_CATEGORIES.map(c => `
    <button class="btn ${state.selectedScheduleCategory === c.id ? 'btn-primary' : 'btn-ghost'}" style="padding:6px 12px;font-size:12px;" onclick="selectScheduleCategory('${c.id}')">${c.name}</button>
  `).join("");
}

function selectScheduleCategory(cat) {
  state.selectedScheduleCategory = cat;
  renderScheduleCategories();
}

function renderScheduleDays(selected = []) {
  const container = $("schedule-days-list");
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
  container.innerHTML = dayNames.map((d, i) => `
    <button class="btn ${selected.includes(i) ? 'btn-primary' : 'btn-ghost'}" style="padding:6px 10px;font-size:12px;flex:1;" onclick="this.classList.toggle('btn-primary');this.classList.toggle('btn-ghost');">周${d}</button>
  `).join("");
}

function saveScheduleEvent() {
  const title = $("schedule-title").value.trim();
  const start = $("schedule-start").value;
  const end = $("schedule-end").value;
  const repeat = $("schedule-repeat").value;
  if (!title) { toast("请输入标题", "error"); return; }
  if (!start || !end) { toast("请选择时间", "error"); return; }
  
  let days = [];
  if (repeat === 'custom') {
    const btns = $("schedule-days-list").querySelectorAll("button");
    btns.forEach((btn, i) => { if (btn.classList.contains('btn-primary')) days.push(i); });
  }
  
  const data = getProfileData(state.currentProfileId);
  if (state.editingScheduleId) {
    const idx = data.scheduleEvents.findIndex(e => e.id === state.editingScheduleId);
    if (idx >= 0) data.scheduleEvents[idx] = { ...data.scheduleEvents[idx], title, start, end, repeat, days, category: state.selectedScheduleCategory };
  } else {
    data.scheduleEvents.push({ id: uuid(), title, start, end, repeat, days, category: state.selectedScheduleCategory, day: state.selectedScheduleDay, done: false, createdAt: Date.now() });
  }
  saveProfileData(state.currentProfileId, data);
  closeModal("modal-schedule-event");
  renderPlan();
  toast(state.editingScheduleId ? "安排已更新" : "安排已添加", "success");
}

function toggleScheduleDone(id) {
  const data = getProfileData(state.currentProfileId);
  const e = data.scheduleEvents.find(x => x.id === id);
  if (e) {
    e.done = !e.done;
    saveProfileData(state.currentProfileId, data);
    renderPlan();
  }
}

function deleteScheduleEvent(id) {
  if (!confirm("确定要删除这个安排吗？")) return;
  const data = getProfileData(state.currentProfileId);
  data.scheduleEvents = data.scheduleEvents.filter(e => e.id !== id);
  saveProfileData(state.currentProfileId, data);
  renderPlan();
  toast("安排已删除", "success");
}

// ===== Dashboard =====
function renderDashboard() {
  const data = getProfileData(state.currentProfileId);
  const now = Date.now();
  
  // GPA
  const gpa = calculateGPA(data.courses, data.gpaAlgorithm);
  $("dashboard-gpa").textContent = gpa;
  $("dashboard-gpa-desc").textContent = data.courses.length > 0 ? `共${data.courses.length}门课程` : "暂无课程数据";
  
  // 倒计时
  const active = data.countdowns.filter(c => !c.done && new Date(c.date).getTime() >= now);
  const urgent = active.filter(c => (new Date(c.date).getTime() - now) < 7 * 24 * 60 * 60 * 1000);
  if (urgent.length > 0) {
    const nearest = urgent.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    const days = Math.ceil((new Date(nearest.date).getTime() - now) / (1000 * 60 * 60 * 24));
    $("dashboard-countdown").textContent = days + "天";
    $("dashboard-countdown-desc").textContent = nearest.name;
  } else if (active.length > 0) {
    $("dashboard-countdown").textContent = active.length + "个";
    $("dashboard-countdown-desc").textContent = "进行中的倒计时";
  } else {
    $("dashboard-countdown").textContent = "--";
    $("dashboard-countdown-desc").textContent = "暂无倒计时";
  }
  
  // 财务
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthTx = data.transactions.filter(t => new Date(t.date) >= monthStart);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  $("dashboard-finance").textContent = "¥" + (income - expense).toFixed(0);
  $("dashboard-finance-desc").textContent = `收入¥${income.toFixed(0)} / 支出¥${expense.toFixed(0)}`;
  
  // 统计
  $("stat-courses").textContent = data.courses.length;
  $("stat-exams").textContent = active.length;
  $("stat-transactions").textContent = data.transactions.length;
  $("stat-schedules").textContent = data.scheduleEvents.length;
  
  // 近期倒计时列表
  const listContainer = $("dashboard-countdown-list");
  if (active.length === 0) {
    listContainer.innerHTML = '<div style="text-align:center;color:var(--text-3);padding:20px;font-size:13px;">暂无即将到来的考试</div>';
  } else {
    listContainer.innerHTML = active.slice(0, 5).map(c => {
      const days = Math.ceil((new Date(c.date).getTime() - now) / (1000 * 60 * 60 * 24));
      const isUrgent = days <= 3;
      return `
        <div class="list-item">
          <div class="list-item-avatar" style="background:${isUrgent ? 'linear-gradient(135deg,#FD79A8,#db2777)' : 'linear-gradient(135deg,#FDCB6E,#d97706)'};">${isUrgent ? '!' : '📅'}</div>
          <div class="list-item-content">
            <div class="list-item-title">${c.name}</div>
            <div class="list-item-subtitle">${new Date(c.date).toLocaleDateString('zh-CN')}</div>
          </div>
          <div class="list-item-value" style="color:${isUrgent ? '#c44a4a' : 'var(--text-1)'};">${days}天</div>
        </div>`;
    }).join("");
  }
  
  // 今日安排
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayEvents = data.scheduleEvents.filter(e => {
    if (e.repeat === 'daily') return true;
    if (e.repeat === 'weekday') return dayOfWeek < 5;
    if (e.repeat === 'weekend') return dayOfWeek >= 5;
    if (e.repeat === 'custom') return e.days?.includes(dayOfWeek);
    return e.day === dayOfWeek;
  }).sort((a, b) => a.start.localeCompare(b.start));
  
  const todayContainer = $("dashboard-today-list");
  $("dashboard-today-date").textContent = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  if (todayEvents.length === 0) {
    todayContainer.innerHTML = '<div style="text-align:center;color:var(--text-3);padding:16px;font-size:13px;">今日暂无安排</div>';
  } else {
    todayContainer.innerHTML = todayEvents.slice(0, 4).map(e => {
      const cat = SCHEDULE_CATEGORIES.find(c => c.id === e.category) || SCHEDULE_CATEGORIES[5];
      return `
        <div class="list-item" style="${e.done ? 'opacity:0.6;' : ''}">
          <div style="width:45px;text-align:center;margin-right:10px;">
            <div style="font-size:12px;font-weight:700;color:${cat.color};">${e.start}</div>
          </div>
          <div class="list-item-content">
            <div class="list-item-title" style="font-size:13px;${e.done ? 'text-decoration:line-through;' : ''}">${e.title}</div>
          </div>
          <button class="btn btn-ghost" style="padding:4px 8px;font-size:10px;" onclick="toggleScheduleDone('${e.id}');renderDashboard();">${e.done ? '恢复' : '完成'}</button>
        </div>`;
    }).join("");
  }
  
  // 图表
  renderDashboardCharts(data);
}

function renderDashboardCharts(data) {
  // GPA趋势
  const gpaEl = $("dashboard-gpa-chart");
  if (gpaEl && typeof echarts !== 'undefined') {
    if (state.charts.dashGpa) state.charts.dashGpa.dispose();
    const chart = echarts.init(gpaEl);
    const semData = data.semesters.map(s => {
      const courses = data.courses.filter(c => c.semesterId === s.id);
      return { name: s.name.substring(0, 8), gpa: parseFloat(calculateGPA(courses, data.gpaAlgorithm)) || 0 };
    });
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 15, top: 15, bottom: 30 },
      xAxis: { type: 'category', data: semData.map(d => d.name), axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', max: 4.3, axisLabel: { fontSize: 10 } },
      series: [{ type: 'line', data: semData.map(d => d.gpa), smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2, color: '#6C5CE7' }, itemStyle: { color: '#6C5CE7' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(108,92,231,0.2)' }, { offset: 1, color: 'rgba(108,92,231,0)' }]) } }]
    });
    state.charts.dashGpa = chart;
  }
  
  // 财务饼图
  const finEl = $("dashboard-finance-chart");
  if (finEl && typeof echarts !== 'undefined') {
    if (state.charts.dashFin) state.charts.dashFin.dispose();
    const chart = echarts.init(finEl);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthTx = data.transactions.filter(t => new Date(t.date) >= monthStart && t.type === 'expense');
    const catData = EXPENSE_CATEGORIES.map(c => ({
      name: c.name,
      value: monthTx.filter(t => t.category === c.id).reduce((s, t) => s + t.amount, 0),
      itemStyle: { color: c.color }
    })).filter(d => d.value > 0);
    
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c}' },
      series: [{ type: 'pie', radius: ['45%', '75%'], data: catData, label: { fontSize: 10, formatter: '{b}' } }]
    });
    state.charts.dashFin = chart;
  }
}

// ===== Data Management =====
function showDataManager() {
  showModal("modal-data-manager");
}

function exportData() {
  const data = {
    profiles: state.profiles,
    currentProfileId: state.currentProfileId,
    exportDate: new Date().toISOString()
  };
  state.profiles.forEach(p => {
    data["data_" + p.id] = getProfileData(p.id);
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "DanDanTable备份_" + new Date().toISOString().split('T')[0] + ".json";
  link.click();
  toast("数据导出成功", "success");
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.profiles) {
        state.profiles = data.profiles;
        storageSet("profiles", state.profiles);
        data.profiles.forEach(p => {
          if (data["data_" + p.id]) {
            saveProfileData(p.id, data["data_" + p.id]);
          }
        });
        toast("数据导入成功", "success");
        closeModal("modal-data-manager");
        if (state.currentProfileId) {
          enterProfile(state.currentProfileId);
        } else {
          renderWelcomeProfiles();
          $("welcome-screen").style.display = "flex";
          $("app").style.display = "none";
        }
      } else {
        toast("无效的备份文件", "error");
      }
    } catch(err) {
      toast("导入失败：文件格式错误", "error");
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (!confirm("确定要清除所有数据吗？此操作不可恢复！")) return;
  if (!confirm("再次确认：所有档案和数据都将被删除！")) return;
  localStorage.clear();
  state.profiles = [];
  state.currentProfileId = null;
  closeModal("modal-data-manager");
  renderWelcomeProfiles();
  $("welcome-screen").style.display = "flex";
  $("app").style.display = "none";
  toast("所有数据已清除", "success");
}

// ===== Initialize =====
function init() {
  loadProfiles();
  
  if (state.currentProfileId && state.profiles.find(p => p.id === state.currentProfileId)) {
    enterProfile(state.currentProfileId);
  } else {
    renderWelcomeProfiles();
  }
  
  // 每分钟更新倒计时
  setInterval(() => {
    if (state.currentProfileId && state.currentView === 'countdown') {
      renderCountdown();
    }
  }, 60000);
  
  // 窗口大小变化时重绘图表
  window.addEventListener('resize', () => {
    Object.values(state.charts).forEach(chart => {
      if (chart && chart.resize) chart.resize();
    });
  });
}

// ===== Expose Functions to Global =====
window.$ = $;
window.uuid = uuid;
window.toast = toast;
window.showModal = showModal;
window.closeModal = closeModal;
window.toggleSidebar = toggleSidebar;
window.switchView = switchView;
window.loadProfiles = loadProfiles;
window.renderWelcomeProfiles = renderWelcomeProfiles;
window.renderAvatarColors = renderAvatarColors;
window.selectAvatarColor = selectAvatarColor;
window.showCreateProfile = showCreateProfile;
window.createProfile = createProfile;
window.enterProfile = enterProfile;
window.logout = logout;
window.showProfileManager = showProfileManager;
window.deleteProfile = deleteProfile;
window.calculateGPA = calculateGPA;
window.renderGPA = renderGPA;
window.setGPAAlgorithm = setGPAAlgorithm;
window.selectSemester = selectSemester;
window.addSemester = addSemester;
window.showAddCourse = showAddCourse;
window.editCourse = editCourse;
window.saveCourse = saveCourse;
window.deleteCourse = deleteCourse;
window.showCustomGPASettings = showCustomGPASettings;
window.addCustomGPARange = addCustomGPARange;
window.removeCustomGPARange = removeCustomGPARange;
window.closeCustomGPAModal = closeCustomGPAModal;
window.saveCustomGPASettings = saveCustomGPASettings;
window.renderCountdown = renderCountdown;
window.toggleCountdownFilter = toggleCountdownFilter;
window.showAddCountdown = showAddCountdown;
window.editCountdown = editCountdown;
window.saveCountdown = saveCountdown;
window.toggleCountdownDone = toggleCountdownDone;
window.deleteCountdown = deleteCountdown;
window.renderFinance = renderFinance;
window.setTxType = setTxType;
window.showAddTransaction = showAddTransaction;
window.saveTransaction = saveTransaction;
window.deleteTransaction = deleteTransaction;
window.filterTransactions = filterTransactions;
window.exportFinanceCSV = exportFinanceCSV;
window.showBudgetSetting = showBudgetSetting;
window.saveBudget = saveBudget;
window.renderPlan = renderPlan;
window.switchScheduleDay = switchScheduleDay;
window.showAddScheduleEvent = showAddScheduleEvent;
window.editScheduleEvent = editScheduleEvent;
window.selectScheduleCategory = selectScheduleCategory;
window.saveScheduleEvent = saveScheduleEvent;
window.toggleScheduleDone = toggleScheduleDone;
window.deleteScheduleEvent = deleteScheduleEvent;
window.toggleHabit = toggleHabit;
window.showHealthRecord = showHealthRecord;
window.saveHealthRecord = saveHealthRecord;
window.renderDashboard = renderDashboard;
window.showDataManager = showDataManager;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.init = init;

// Start
init();
</script>
</body>
</html>
'''

content += js_part4
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'已追加JS第四部分，最终大小: {len(content)} 字节')
