

// ===== Performance Optimization =====
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
const perfConfig = {
  enableChartAnimation: !isMobile,
  chartRenderDelay: isMobile ? 100 : 0,
  maxListItems: isMobile ? 30 : 100
};

// 防抖函数
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流函数
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 安全的图表初始化（带错误处理和移动端优化）
function initChart(containerId, option, chartKey) {
  try {
    const el = document.getElementById(containerId);
    if (!el || typeof echarts === 'undefined') return null;
    
    // 销毁旧图表
    if (state.charts[chartKey]) {
      try { state.charts[chartKey].dispose(); } catch(e) {}
      state.charts[chartKey] = null;
    }
    
    const chart = echarts.init(el, null, { renderer: isMobile ? 'canvas' : 'canvas' });
    
    // 移动端关闭动画，提升性能
    if (isMobile) {
      option.animation = false;
      option.animationDuration = 0;
      option.animationDurationUpdate = 0;
    }
    
    chart.setOption(option);
    state.charts[chartKey] = chart;
    return chart;
  } catch(e) {
    console.warn('Chart init error:', e);
    return null;
  }
}

// 销毁指定视图的所有图表
function disposeViewCharts(view) {
  const chartMap = {
    dashboard: ['dashGpa', 'dashFin'],
    gpa: ['gpaTrend', 'gpaDist'],
    countdown: [],
    finance: ['financeTrend', 'financeCat'],
    plan: ['planWeekly']
  };
  const keys = chartMap[view] || [];
  keys.forEach(key => {
    if (state.charts[key]) {
      try { state.charts[key].dispose(); } catch(e) {}
      state.charts[key] = null;
    }
  });
}

// 批量DOM更新（使用DocumentFragment减少重排）
function batchUpdate(container, html) {
  try {
    const template = document.createElement('template');
    template.innerHTML = html;
    container.innerHTML = '';
    container.appendChild(template.content.cloneNode(true));
  } catch(e) {
    container.innerHTML = html;
  }
}

// 数据缓存（减少localStorage读写）
let dataCache = {};
let cacheDirty = {};

function getProfileDataCached(profileId) {
  if (!dataCache[profileId] || cacheDirty[profileId]) {
    dataCache[profileId] = getProfileData(profileId);
    cacheDirty[profileId] = false;
  }
  return dataCache[profileId];
}

function saveProfileDataCached(profileId, data) {
  dataCache[profileId] = data;
  cacheDirty[profileId] = true;
  // 节流写入localStorage
  throttleSave(profileId);
}

const throttleSave = throttle((profileId) => {
  if (cacheDirty[profileId] && dataCache[profileId]) {
    saveProfileData(profileId, dataCache[profileId]);
    cacheDirty[profileId] = false;
  }
}, 500);

console.log('Performance optimization loaded. Mobile:', isMobile);


// ===== Utilities =====
const $ = id => document.getElementById(id);
const uuid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const STORAGE_PREFIX = "campus_toolbox_";

// ===== Constants =====
const AVATAR_COLORS = [
  { from: "#6C5CE7", to: "#5B4CC4", char: "学" },
  { from: "#00B894", to: "#0891b2", char: "同" },
  { from: "#FD79A8", to: "#db2777", char: "少" },
  { from: "#00B894", to: "#059669", char: "青" },
  { from: "#FDCB6E", to: "#d97706", char: "阳" },
  { from: "#F0A500", to: "#ea580c", char: "光" },
  { from: "#E17055", to: "#dc2626", char: "热" },
  { from: "#A29BFE", to: "#7c3aed", char: "梦" }
];

const GPA_ALGORITHMS = {
  standard4: { name: "标准4.0制", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 80 ? 3.0 : s >= 70 ? 2.0 : s >= 60 ? 1.0 : 0 },
  improved4: { name: "改进4.0制", max: 4.0, calc: s => s >= 85 ? 4.0 : s >= 75 ? 3.0 : s >= 65 ? 2.0 : s >= 60 ? 1.0 : 0 },
  peking4: { name: "北大4.0制", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 82 ? 3.3 : s >= 78 ? 3.0 : s >= 75 ? 2.7 : s >= 72 ? 2.3 : s >= 68 ? 2.0 : s >= 64 ? 1.5 : s >= 60 ? 1.0 : 0 },
  tsinghua4: { name: "清华4.0制", max: 4.0, calc: s => s >= 95 ? 4.0 : s >= 90 ? 3.7 : s >= 85 ? 3.3 : s >= 80 ? 3.0 : s >= 75 ? 2.7 : s >= 70 ? 2.3 : s >= 65 ? 2.0 : s >= 60 ? 1.0 : 0 },
  zhejiang5: { name: "浙大5.0制", max: 5.0, calc: s => s >= 95 ? 5.0 : s >= 90 ? 4.8 : s >= 85 ? 4.5 : s >= 80 ? 4.0 : s >= 75 ? 3.5 : s >= 70 ? 3.0 : s >= 65 ? 2.5 : s >= 60 ? 2.0 : 0 },
  shanghai4: { name: "交大4.3制", max: 4.3, calc: s => s >= 95 ? 4.3 : s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 80 ? 3.3 : s >= 75 ? 3.0 : s >= 70 ? 2.7 : s >= 65 ? 2.3 : s >= 60 ? 2.0 : 0 },
  fudan4: { name: "复旦4.0制", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 80 ? 3.3 : s >= 75 ? 3.0 : s >= 70 ? 2.7 : s >= 65 ? 2.3 : s >= 60 ? 2.0 : 0 },
  nju4: { name: "南大4.5制", max: 4.5, calc: s => s >= 95 ? 4.5 : s >= 90 ? 4.2 : s >= 85 ? 3.9 : s >= 80 ? 3.6 : s >= 75 ? 3.3 : s >= 70 ? 3.0 : s >= 65 ? 2.7 : s >= 60 ? 2.4 : 0 },
  ustc4: { name: "中科大4.3制", max: 4.3, calc: s => s >= 95 ? 4.3 : s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 80 ? 3.3 : s >= 75 ? 3.0 : s >= 70 ? 2.7 : s >= 65 ? 2.3 : s >= 60 ? 2.0 : 0 },
  whu4: { name: "武大4.0制", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 82 ? 3.3 : s >= 78 ? 3.0 : s >= 75 ? 2.7 : s >= 72 ? 2.3 : s >= 68 ? 2.0 : s >= 64 ? 1.5 : s >= 60 ? 1.0 : 0 },
  custom: { name: "自定义", max: 4.0, calc: s => calcCustomGPA(s) }
};

const EXPENSE_CATEGORIES = [
  { id: "food", name: "餐饮", icon: "🍜", color: "#FD79A8" },
  { id: "transport", name: "交通", icon: "🚌", color: "#00B894" },
  { id: "shopping", name: "购物", icon: "🛍️", color: "#6C5CE7" },
  { id: "entertainment", name: "娱乐", icon: "🎮", color: "#FDCB6E" },
  { id: "study", name: "学习", icon: "📚", color: "#0984E3" },
  { id: "medical", name: "医疗", icon: "💊", color: "#E17055" },
  { id: "other", name: "其他", icon: "📦", color: "#636E72" }
];

const INCOME_CATEGORIES = [
  { id: "allowance", name: "生活费", icon: "💰", color: "#00B894" },
  { id: "parttime", name: "兼职", icon: "💼", color: "#6C5CE7" },
  { id: "scholarship", name: "奖学金", icon: "🏆", color: "#FDCB6E" },
  { id: "other", name: "其他", icon: "📦", color: "#636E72" }
];

const SCHEDULE_CATEGORIES = [
  { id: "study", name: "学习", color: "#6C5CE7" },
  { id: "exercise", name: "运动", color: "#00B894" },
  { id: "rest", name: "休息", color: "#FDCB6E" },
  { id: "social", name: "社交", color: "#FD79A8" },
  { id: "work", name: "工作", color: "#0984E3" },
  { id: "other", name: "其他", color: "#636E72" }
];

const DEFAULT_HABITS = [
  { id: "drink_water", name: "喝水", target: 8, unit: "杯", icon: "💧" },
  { id: "read", name: "阅读", target: 30, unit: "分钟", icon: "📖" },
  { id: "exercise", name: "运动", target: 30, unit: "分钟", icon: "🏃" },
  { id: "early_sleep", name: "早睡", target: 1, unit: "次", icon: "🌙" }
];

// ===== State =====
let state = {
  currentProfileId: null,
  profiles: [],
  currentView: "dashboard",
  selectedAvatarColor: 0,
  currentSemesterId: null,
  countdownFilter: "all",
  txType: "expense",
  selectedScheduleDay: 0,
  selectedScheduleCategory: null,
  editingCourseId: null,
  editingCountdownId: null,
  editingScheduleId: null,
  customGPARanges: [],
  charts: {}
};

// ===== Storage =====
function storageGet(key, def) {
  try { const v = localStorage.getItem(STORAGE_PREFIX + key); return v ? JSON.parse(v) : def; }
  catch(e) { return def; }
}
function storageSet(key, val) {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val)); } catch(e) {}
}

function getProfileData(profileId) {
  return storageGet("data_" + profileId, {
    courses: [],
    semesters: [],
    countdowns: [],
    transactions: [],
    budget: {},
    gpaAlgorithm: "standard4",
    scheduleEvents: [],
    habits: DEFAULT_HABITS.map(h => ({...h, completed: {}})),
    health: [],
    customGPASettings: null
  });
}

function saveProfileData(profileId, data) {
  storageSet("data_" + profileId, data);
}

// ===== Toast =====
function toast(msg, type = "info") {
  const container = $("toast-container");
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(30px)"; setTimeout(() => el.remove(), 300); }, 2500);
}

// ===== Modal =====
function showModal(id) { const el = $(id); if (el) el.classList.add("show"); }
function closeModal(id) { const el = $(id); if (el) el.classList.remove("show"); }

// 点击遮罩关闭弹窗
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("show");
  }
});

// ===== Sidebar Toggle (Mobile) =====
function toggleSidebar() {
  const sidebar = $("sidebar");
  const overlay = $("sidebar-overlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
}

// ===== View Switching =====
function switchView(view) {
  const viewEl = $("view-" + view);
  if (!viewEl) { console.warn("View not found:", view); return; }
  
  // 销毁上一个视图的图表，释放内存
  if (state.currentView && state.currentView !== view) {
    disposeViewCharts(state.currentView);
  }
  
  state.currentView = view;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  viewEl.classList.add("active");
  document.querySelectorAll(".nav-item[data-view]").forEach(n => {
    n.classList.toggle("active", n.dataset.view === view);
  });
  document.querySelectorAll(".bottom-nav-item").forEach(n => {
    n.classList.toggle("active", n.dataset.view === view);
  });
  
  // 更新标题
  const titles = {
    dashboard: ["仪表盘", "欢迎回来，今天也要加油哦"],
    gpa: ["GPA计算", "管理你的课程和成绩"],
    countdown: ["考试倒计时", "追踪重要考试和截止日期"],
    finance: ["记账本", "记录你的每一笔收支"],
    plan: ["规划中心", "规划你的作息和生活"]
  };
  if (titles[view]) {
    $("page-title").textContent = titles[view][0];
    $("page-subtitle").textContent = titles[view][1];
  }
  
  // 关闭移动端侧边栏
  if (window.innerWidth <= 768) {
    $("sidebar").classList.remove("open");
    $("sidebar-overlay").classList.remove("show");
  }
  
  // 渲染对应视图
  if (view === "dashboard") renderDashboard();
  else if (view === "gpa") renderGPA();
  else if (view === "countdown") renderCountdown();
  else if (view === "finance") renderFinance();
  else if (view === "plan") renderPlan();
  
  document.querySelector(".main").scrollTop = 0;
}

// ===== Profile Management =====
function loadProfiles() {
  state.profiles = storageGet("profiles", []);
  state.currentProfileId = storageGet("current_profile", null);
}

function renderWelcomeProfiles() {
  const container = $("welcome-profiles");
  if (state.profiles.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-3);font-size:13px;padding:16px;">还没有档案，创建一个开始使用吧</div>';
    return;
  }
  container.innerHTML = state.profiles.map(p => `
    <div class="welcome-profile-item" onclick="enterProfile('${p.id}')">
      <div class="welcome-profile-avatar" style="background:linear-gradient(135deg,${p.colorFrom},${p.colorTo})">${p.name.charAt(0)}</div>
      <div class="welcome-profile-info">
        <div class="welcome-profile-name">${p.name}</div>
        <div class="welcome-profile-username">@${p.username}</div>
      </div>
    </div>
  `).join("");
}

function renderAvatarColors() {
  const container = $("avatar-colors");
  if (!container) return;
  container.innerHTML = AVATAR_COLORS.map((c, i) =>
    `<div class="avatar-color ${i === state.selectedAvatarColor ? 'selected' : ''}" style="background:linear-gradient(135deg,${c.from},${c.to})" onclick="selectAvatarColor(${i})"></div>`
  ).join("");
}

function selectAvatarColor(i) {
  state.selectedAvatarColor = i;
  renderAvatarColors();
}

function showCreateProfile() {
  showModal("modal-create-profile");
  try {
    $("new-profile-username").value = "";
    $("new-profile-name").value = "";
    state.selectedAvatarColor = 0;
    renderAvatarColors();
  } catch(e) { console.error("showCreateProfile error:", e); }
}

function createProfile() {
  const username = $("new-profile-username").value.trim();
  const name = $("new-profile-name").value.trim();
  if (!username) { toast("请输入用户名", "error"); return; }
  if (!name) { toast("请输入昵称", "error"); return; }
  if (state.profiles.find(p => p.username === username)) {
    toast("该用户名已存在，请换一个", "error");
    return;
  }
  const color = AVATAR_COLORS[state.selectedAvatarColor];
  const profile = {
    id: uuid(),
    username: username,
    name: name,
    colorFrom: color.from,
    colorTo: color.to,
    createdAt: Date.now()
  };
  state.profiles.push(profile);
  storageSet("profiles", state.profiles);
  // 初始化默认学期
  const data = getProfileData(profile.id);
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const semName = month >= 8 ? (year + "-" + (year+1) + " 第一学期") : (year-1 + "-" + year + " 第二学期");
  data.semesters = [{ id: uuid(), name: semName }];
  saveProfileData(profile.id, data);
  enterProfile(profile.id);
  closeModal("modal-create-profile");
  toast("档案创建成功，欢迎 " + name, "success");
}

function enterProfile(profileId) {
  state.currentProfileId = profileId;
  storageSet("current_profile", profileId);
  const profile = state.profiles.find(p => p.id === profileId);
  if (!profile) return;
  // 更新侧边栏
  $("sidebar-name").textContent = profile.name;
  const avatar = $("sidebar-avatar");
  avatar.style.background = `linear-gradient(135deg,${profile.colorFrom},${profile.colorTo})`;
  avatar.textContent = profile.name.charAt(0);
  // 隐藏欢迎页，显示应用
  $("welcome-screen").style.display = "none";
  $("app").style.display = "flex";
  // 初始化数据
  const data = getProfileData(profileId);
  if (data.semesters.length > 0) {
    state.currentSemesterId = data.semesters[0].id;
  }
  // 渲染仪表盘
  switchView("dashboard");
}

function logout() {
  state.currentProfileId = null;
  storageSet("current_profile", null);
  $("welcome-screen").style.display = "flex";
  $("app").style.display = "none";
  renderWelcomeProfiles();
  toast("已退出登录", "info");
}

function showProfileManager() {
  showModal("modal-profile-manager");
  const container = $("profile-manager-list");
  if (state.profiles.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-3);padding:20px;">暂无档案</div>';
    return;
  }
  container.innerHTML = state.profiles.map(p => `
    <div style="display:flex;align-items:center;padding:12px;border-bottom:1px solid var(--border);">
      <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${p.colorFrom},${p.colorTo});display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;margin-right:12px;">${p.name.charAt(0)}</div>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:14px;">${p.name}</div>
        <div style="font-size:12px;color:var(--text-3);">@${p.username}</div>
      </div>
      <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px;" onclick="enterProfile('${p.id}');closeModal('modal-profile-manager')">切换</button>
      <button class="btn btn-danger" style="padding:6px 12px;font-size:12px;margin-left:8px;" onclick="deleteProfile('${p.id}')">删除</button>
    </div>
  `).join("");
}

function deleteProfile(profileId) {
  if (!confirm("确定要删除这个档案吗？所有数据将被清除！")) return;
  state.profiles = state.profiles.filter(p => p.id !== profileId);
  storageSet("profiles", state.profiles);
  localStorage.removeItem(STORAGE_PREFIX + "data_" + profileId);
  if (state.currentProfileId === profileId) {
    logout();
  }
  showProfileManager();
  toast("档案已删除", "success");
}

// ===== GPA Calculation =====
function calcCustomGPA(score) {
  const data = getProfileData(state.currentProfileId);
  const ranges = data.customGPASettings || [{min:90,max:100,gpa:4.0},{min:80,max:89,gpa:3.0},{min:70,max:79,gpa:2.0},{min:60,max:69,gpa:1.0},{min:0,max:59,gpa:0}];
  for (const r of ranges) {
    if (score >= r.min && score <= r.max) return r.gpa;
  }
  return 0;
}

function calculateGPA(courses, algorithm) {
  const algo = GPA_ALGORITHMS[algorithm] || GPA_ALGORITHMS.standard4;
  let totalCredits = 0;
  let totalPoints = 0;
  courses.forEach(c => {
    const gpa = algo.calc(c.score);
    totalCredits += c.credit;
    totalPoints += gpa * c.credit;
  });
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "--";
}

function renderGPA() {
  const data = getProfileData(state.currentProfileId);
  const semesterCourses = data.courses.filter(c => c.semesterId === state.currentSemesterId);
  const allCourses = data.courses;
  
  // 统计卡片
  $("gpa-total").textContent = calculateGPA(allCourses, data.gpaAlgorithm);
  $("gpa-credits").textContent = allCourses.reduce((sum, c) => sum + c.credit, 0).toFixed(1);
  $("gpa-courses-count").textContent = allCourses.length;
  
  // 学期选择
  const select = $("gpa-semester-select");
  select.innerHTML = data.semesters.map(s => 
    `<option value="${s.id}" ${s.id === state.currentSemesterId ? 'selected' : ''}>${s.name}</option>`
  ).join("");
  
  // 课程列表
  const list = $("gpa-courses-list");
  if (semesterCourses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg></div>
        <div class="empty-state-title">暂无课程</div>
        <div class="empty-state-desc">点击右上角添加课程开始记录</div>
      </div>`;
  } else {
    list.innerHTML = `
      <table class="data-table">
        <thead><tr><th>课程名称</th><th>学分</th><th>成绩</th><th>类型</th><th>GPA</th><th>操作</th></tr></thead>
        <tbody>
          ${semesterCourses.map(c => {
            const algo = GPA_ALGORITHMS[data.gpaAlgorithm] || GPA_ALGORITHMS.standard4;
            const gpa = algo.calc(c.score);
            const typeNames = {required:"必修",elective:"选修",general:"通识",practice:"实践"};
            return `<tr>
              <td style="font-weight:600;">${c.name}</td>
              <td>${c.credit}</td>
              <td>${c.score}</td>
              <td><span class="tag tag-blue">${typeNames[c.type] || c.type}</span></td>
              <td style="font-weight:700;color:var(--green-dark);">${gpa.toFixed(1)}</td>
              <td>
                <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" onclick="editCourse('${c.id}')">编辑</button>
                <button class="btn btn-danger" style="padding:4px 8px;font-size:11px;margin-left:4px;" onclick="deleteCourse('${c.id}')">删除</button>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`;
  }
  
  // 算法列表
  $("gpa-algorithm-list").innerHTML = Object.entries(GPA_ALGORITHMS).map(([key, algo]) => `
    <div style="display:flex;align-items:center;padding:10px 12px;border-radius:10px;cursor:pointer;transition:all 0.2s;${data.gpaAlgorithm === key ? 'background:var(--bg);border:1px solid var(--blue);' : 'border:1px solid transparent;'}" onclick="setGPAAlgorithm('${key}')">
      <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${data.gpaAlgorithm === key ? 'var(--blue)' : 'var(--border)'};display:flex;align-items:center;justify-content:center;margin-right:10px;">
        ${data.gpaAlgorithm === key ? '<div style="width:10px;height:10px;border-radius:50%;background:var(--blue);"></div>' : ''}
      </div>
      <span style="font-size:13px;font-weight:500;">${algo.name}</span>
    </div>
  `).join("");
  
  // 渲染图表
  renderGPACharts(data);
}

function renderGPACharts(data) {
  if (isMobile) {
    setTimeout(() => _renderGPACharts(data), perfConfig.chartRenderDelay);
    return;
  }
  _renderGPACharts(data);
}

function _renderGPACharts(data) {
  // 趋势图
  const trendEl = $("gpa-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    const chart = initChart("gpa-trend-chart", {}, "gpaTrend");
    if (!chart) return;
    const semData = data.semesters.map(s => {
      const courses = data.courses.filter(c => c.semesterId === s.id);
      return { name: s.name.substring(0, 10), gpa: parseFloat(calculateGPA(courses, data.gpaAlgorithm)) || 0 };
    });
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: semData.map(d => d.name), axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', max: 4.3, axisLabel: { fontSize: 11 } },
      series: [{
        type: 'line',
        data: semData.map(d => d.gpa),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#6C5CE7' },
        itemStyle: { color: '#6C5CE7' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(108,92,231,0.3)' }, { offset: 1, color: 'rgba(108,92,231,0)' }]) }
      }]
    });
    state.charts.gpaTrend = chart;
  }
  
  // 分布图
  const distEl = $("gpa-distribution-chart");
  if (distEl && typeof echarts !== 'undefined') {
    const chart = initChart("gpa-distribution-chart", {}, "gpaDist");
    if (!chart) return;
    const ranges = [{name:'90+',min:90},{name:'80-89',min:80},{name:'70-79',min:70},{name:'60-69',min:60},{name:'<60',min:0}];
    const counts = ranges.map(r => data.courses.filter(c => c.score >= r.min && (r.min === 0 ? c.score < 60 : c.score < r.min + 10 || (r.min === 90))).length);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ranges.map(r => r.name), axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      series: [{ type: 'bar', data: counts, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#00B894' }, { offset: 1, color: '#0891b2' }]), borderRadius: [6, 6, 0, 0] }, barWidth: '50%' }]
    });
    state.charts.gpaDist = chart;
  }
}

function setGPAAlgorithm(algo) {
  const data = getProfileData(state.currentProfileId);
  data.gpaAlgorithm = algo;
  saveProfileData(state.currentProfileId, data);
  renderGPA();
  toast("已切换到 " + GPA_ALGORITHMS[algo].name, "success");
}

function selectSemester(semId) {
  state.currentSemesterId = semId;
  renderGPA();
}

function addSemester() {
  const name = prompt("请输入学期名称：", "2024-2025 第二学期");
  if (!name) return;
  const data = getProfileData(state.currentProfileId);
  const sem = { id: uuid(), name: name };
  data.semesters.push(sem);
  saveProfileData(state.currentProfileId, data);
  state.currentSemesterId = sem.id;
  renderGPA();
  toast("学期已添加", "success");
}

function showAddCourse() {
  state.editingCourseId = null;
  $("course-modal-title").textContent = "添加课程";
  $("course-name").value = "";
  $("course-credit").value = "";
  $("course-score").value = "";
  $("course-type").value = "required";
  const data = getProfileData(state.currentProfileId);
  $("course-semester").innerHTML = data.semesters.map(s => 
    `<option value="${s.id}" ${s.id === state.currentSemesterId ? 'selected' : ''}>${s.name}</option>`
  ).join("");
  showModal("modal-add-course");
}

function editCourse(courseId) {
  const data = getProfileData(state.currentProfileId);
  const course = data.courses.find(c => c.id === courseId);
  if (!course) return;
  state.editingCourseId = courseId;
  $("course-modal-title").textContent = "编辑课程";
  $("course-name").value = course.name;
  $("course-credit").value = course.credit;
  $("course-score").value = course.score;
  $("course-type").value = course.type;
  $("course-semester").value = course.semesterId;
  showModal("modal-add-course");
}

function saveCourse() {
  const name = $("course-name").value.trim();
  const credit = parseFloat($("course-credit").value);
  const score = parseFloat($("course-score").value);
  const type = $("course-type").value;
  const semesterId = $("course-semester").value;
  if (!name) { toast("请输入课程名称", "error"); return; }
  if (!credit || credit <= 0) { toast("请输入有效学分", "error"); return; }
  if (isNaN(score) || score < 0 || score > 100) { toast("请输入有效成绩(0-100)", "error"); return; }
  
  const data = getProfileData(state.currentProfileId);
  if (state.editingCourseId) {
    const idx = data.courses.findIndex(c => c.id === state.editingCourseId);
    if (idx >= 0) data.courses[idx] = { ...data.courses[idx], name, credit, score, type, semesterId };
  } else {
    data.courses.push({ id: uuid(), name, credit, score, type, semesterId, createdAt: Date.now() });
  }
  saveProfileData(state.currentProfileId, data);
  closeModal("modal-add-course");
  renderGPA();
  toast(state.editingCourseId ? "课程已更新" : "课程已添加", "success");
}

function deleteCourse(courseId) {
  if (!confirm("确定要删除这门课程吗？")) return;
  const data = getProfileData(state.currentProfileId);
  data.courses = data.courses.filter(c => c.id !== courseId);
  saveProfileData(state.currentProfileId, data);
  renderGPA();
  toast("课程已删除", "success");
}

// ===== Custom GPA =====
function showCustomGPASettings() {
  const data = getProfileData(state.currentProfileId);
  state.customGPARanges = data.customGPASettings || [{min:90,max:100,gpa:4.0},{min:80,max:89,gpa:3.0},{min:70,max:79,gpa:2.0},{min:60,max:69,gpa:1.0},{min:0,max:59,gpa:0}];
  renderCustomGPARanges();
  showModal("modal-custom-gpa");
}

function renderCustomGPARanges() {
  const container = $("custom-gpa-ranges");
  container.innerHTML = state.customGPARanges.map((r, i) => `
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
      <input type="number" class="form-input" style="flex:1;" value="${r.min}" onchange="state.customGPARanges[${i}].min=parseFloat(this.value)" placeholder="最低分">
      <span style="color:var(--text-3);">-</span>
      <input type="number" class="form-input" style="flex:1;" value="${r.max}" onchange="state.customGPARanges[${i}].max=parseFloat(this.value)" placeholder="最高分">
      <span style="color:var(--text-3);">=</span>
      <input type="number" class="form-input" style="flex:1;" value="${r.gpa}" step="0.1" onchange="state.customGPARanges[${i}].gpa=parseFloat(this.value)" placeholder="GPA">
      <button class="btn btn-danger" style="padding:6px 10px;" onclick="removeCustomGPARange(${i})">×</button>
    </div>
  `).join("");
}

function addCustomGPARange() {
  state.customGPARanges.push({min:0,max:100,gpa:0});
  renderCustomGPARanges();
}

function removeCustomGPARange(i) {
  state.customGPARanges.splice(i, 1);
  renderCustomGPARanges();
}

function closeCustomGPAModal() {
  closeModal("modal-custom-gpa");
}

function saveCustomGPASettings() {
  const data = getProfileData(state.currentProfileId);
  data.customGPASettings = state.customGPARanges;
  data.gpaAlgorithm = "custom";
  saveProfileData(state.currentProfileId, data);
  closeModal("modal-custom-gpa");
  renderGPA();
  toast("自定义GPA算法已保存", "success");
}

// ===== Countdown =====
function renderCountdown() {
  const data = getProfileData(state.currentProfileId);
  const now = Date.now();
  
  const active = data.countdowns.filter(c => !c.done && new Date(c.date).getTime() >= now);
  const urgent = active.filter(c => (new Date(c.date).getTime() - now) < 7 * 24 * 60 * 60 * 1000);
  const done = data.countdowns.filter(c => c.done);
  
  $("countdown-active").textContent = active.length;
  $("countdown-urgent").textContent = urgent.length;
  $("countdown-done").textContent = done.length;
  
  // 更新导航徽章
  const badge = $("countdown-badge");
  if (urgent.length > 0) {
    badge.style.display = "inline-block";
    badge.textContent = urgent.length;
  } else {
    badge.style.display = "none";
  }
  
  let list = data.countdowns;
  if (state.countdownFilter === "active") list = active;
  else if (state.countdownFilter === "done") list = done;
  
  list.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const container = $("countdown-list");
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61z"/></svg></div>
        <div class="empty-state-title">暂无倒计时</div>
        <div class="empty-state-desc">点击右上角添加考试倒计时</div>
      </div>`;
    return;
  }
  
  const categoryNames = {exam:"考试",assignment:"作业",project:"项目",other:"其他"};
  const priorityColors = {high:"tag-pink",medium:"tag-yellow",low:"tag-blue"};
  
  container.innerHTML = list.map(c => {
    const target = new Date(c.date).getTime();
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isUrgent = days <= 3 && !c.done;
    
    return `
      <div class="list-item" style="${c.done ? 'opacity:0.6;' : ''}">
        <div class="list-item-avatar" style="background:${c.done ? '#ccc' : (isUrgent ? 'linear-gradient(135deg,#FD79A8,#db2777)' : 'linear-gradient(135deg,#FDCB6E,#d97706)')}">
          ${c.done ? '✓' : categoryNames[c.category]?.charAt(0) || '?'}
        </div>
        <div class="list-item-content">
          <div class="list-item-title" style="${c.done ? 'text-decoration:line-through;' : ''}">${c.name}</div>
          <div class="list-item-subtitle">
            ${new Date(c.date).toLocaleDateString('zh-CN')} ${c.time || ''}
            ${!c.done ? ` · 还剩 ${days >= 0 ? days + '天' + hours + '小时' : '已过期'}` : ''}
          </div>
        </div>
        <span class="tag ${priorityColors[c.priority] || 'tag-gray'}">${categoryNames[c.category] || c.category}</span>
        <div style="display:flex;gap:4px;margin-left:12px;">
          <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" onclick="toggleCountdownDone('${c.id}')">${c.done ? '恢复' : '完成'}</button>
          <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" onclick="editCountdown('${c.id}')">编辑</button>
          <button class="btn btn-danger" style="padding:4px 8px;font-size:11px;" onclick="deleteCountdown('${c.id}')">删除</button>
        </div>
      </div>`;
  }).join("");
}

function toggleCountdownFilter(filter) {
  state.countdownFilter = filter;
  renderCountdown();
}

function showAddCountdown() {
  state.editingCountdownId = null;
  $("countdown-modal-title").textContent = "添加倒计时";
  $("countdown-name").value = "";
  $("countdown-date").value = new Date().toISOString().split('T')[0];
  $("countdown-time").value = "09:00";
  $("countdown-category").value = "exam";
  $("countdown-priority").value = "medium";
  $("countdown-note").value = "";
  showModal("modal-add-countdown");
}

function editCountdown(id) {
  const data = getProfileData(state.currentProfileId);
  const c = data.countdowns.find(x => x.id === id);
  if (!c) return;
  state.editingCountdownId = id;
  $("countdown-modal-title").textContent = "编辑倒计时";
  $("countdown-name").value = c.name;
  $("countdown-date").value = c.date;
  $("countdown-time").value = c.time || "09:00";
  $("countdown-category").value = c.category;
  $("countdown-priority").value = c.priority;
  $("countdown-note").value = c.note || "";
  showModal("modal-add-countdown");
}

function saveCountdown() {
  const name = $("countdown-name").value.trim();
  const date = $("countdown-date").value;
  const time = $("countdown-time").value;
  const category = $("countdown-category").value;
  const priority = $("countdown-priority").value;
  const note = $("countdown-note").value.trim();
  if (!name) { toast("请输入名称", "error"); return; }
  if (!date) { toast("请选择日期", "error"); return; }
  
  const data = getProfileData(state.currentProfileId);
  if (state.editingCountdownId) {
    const idx = data.countdowns.findIndex(c => c.id === state.editingCountdownId);
    if (idx >= 0) data.countdowns[idx] = { ...data.countdowns[idx], name, date, time, category, priority, note };
  } else {
    data.countdowns.push({ id: uuid(), name, date, time, category, priority, note, done: false, createdAt: Date.now() });
  }
  saveProfileData(state.currentProfileId, data);
  closeModal("modal-add-countdown");
  renderCountdown();
  toast(state.editingCountdownId ? "倒计时已更新" : "倒计时已添加", "success");
}

function toggleCountdownDone(id) {
  const data = getProfileData(state.currentProfileId);
  const c = data.countdowns.find(x => x.id === id);
  if (c) {
    c.done = !c.done;
    saveProfileData(state.currentProfileId, data);
    renderCountdown();
  }
}

function deleteCountdown(id) {
  if (!confirm("确定要删除这个倒计时吗？")) return;
  const data = getProfileData(state.currentProfileId);
  data.countdowns = data.countdowns.filter(c => c.id !== id);
  saveProfileData(state.currentProfileId, data);
  renderCountdown();
  toast("倒计时已删除", "success");
}

// ===== Finance =====
function renderFinance() {
  const data = getProfileData(state.currentProfileId);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthTx = data.transactions.filter(t => new Date(t.date) >= monthStart);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  $("finance-income").textContent = "¥" + income.toFixed(2);
  $("finance-expense").textContent = "¥" + expense.toFixed(2);
  $("finance-balance").textContent = "¥" + (income - expense).toFixed(2);
  
  // 交易列表
  let list = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filter = $("finance-filter")?.value || "all";
  if (filter !== "all") list = list.filter(t => t.type === filter);
  
  const container = $("finance-transactions-list");
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>
        <div class="empty-state-title">暂无记录</div>
        <div class="empty-state-desc">点击右上角记一笔开始记录</div>
      </div>`;
  } else {
    container.innerHTML = list.slice(0, 50).map(t => {
      const cats = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const cat = cats.find(c => c.id === t.category) || {name:t.category, icon:"📦", color:"#999"};
      return `
        <div class="list-item">
          <div class="list-item-avatar" style="background:${cat.color}20;color:${cat.color};">${cat.icon}</div>
          <div class="list-item-content">
            <div class="list-item-title">${t.note || cat.name}</div>
            <div class="list-item-subtitle">${new Date(t.date).toLocaleDateString('zh-CN')} · ${cat.name}</div>
          </div>
          <div class="list-item-value ${t.type === 'income' ? 'positive' : 'negative'}">${t.type === 'income' ? '+' : '-'}¥${t.amount.toFixed(2)}</div>
          <button class="btn btn-danger" style="padding:4px 8px;font-size:11px;margin-left:8px;" onclick="deleteTransaction('${t.id}')">删除</button>
        </div>`;
    }).join("");
  }
  
  // 渲染图表
  renderFinanceCharts(data, monthTx);
}

function renderFinanceCharts(data, monthTx) {
  if (isMobile) {
    setTimeout(() => _renderFinanceCharts(data, monthTx), perfConfig.chartRenderDelay);
    return;
  }
  _renderFinanceCharts(data, monthTx);
}

function _renderFinanceCharts(data, monthTx) {
  // 趋势图
  const trendEl = $("finance-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    const chart = initChart("finance-trend-chart", {}, "financeTrend");
    if (!chart) return;
    const months = [];
    const incomeData = [];
    const expenseData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const tx = data.transactions.filter(t => {
        const td = new Date(t.date);
        return td >= monthStart && td <= monthEnd;
      });
      months.push((d.getMonth() + 1) + "月");
      incomeData.push(tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
      expenseData.push(tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    }
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['收入', '支出'], top: 0 },
      grid: { left: 50, right: 20, top: 40, bottom: 30 },
      xAxis: { type: 'category', data: months, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      series: [
        { name: '收入', type: 'bar', data: incomeData, itemStyle: { color: '#00B894', borderRadius: [6, 6, 0, 0] } },
        { name: '支出', type: 'bar', data: expenseData, itemStyle: { color: '#FD79A8', borderRadius: [6, 6, 0, 0] } }
      ]
    });
    state.charts.financeTrend = chart;
  }
  
  // 分类饼图
  const catEl = $("finance-category-chart");
  if (catEl && typeof echarts !== 'undefined') {
    const chart = initChart("finance-category-chart", {}, "financeCat");
    if (!chart) return;
    const expense = monthTx.filter(t => t.type === 'expense');
    const catData = EXPENSE_CATEGORIES.map(c => ({
      name: c.name,
      value: expense.filter(t => t.category === c.id).reduce((s, t) => s + t.amount, 0),
      itemStyle: { color: c.color }
    })).filter(d => d.value > 0);
    
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
      series: [{ type: 'pie', radius: ['40%', '70%'], data: catData, label: { fontSize: 11 } }]
    });
    state.charts.financeCat = chart;
  }
}

function setTxType(type) {
  state.txType = type;
  $("tx-type-expense").className = "btn " + (type === 'expense' ? 'btn-primary' : 'btn-ghost');
  $("tx-type-income").className = "btn " + (type === 'income' ? 'btn-primary' : 'btn-ghost');
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  $("tx-category").innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join("");
}

function showAddTransaction() {
  $("transaction-modal-title").textContent = "记一笔";
  $("tx-amount").value = "";
  $("tx-date").value = new Date().toISOString().split('T')[0];
  $("tx-note").value = "";
  setTxType("expense");
  showModal("modal-add-transaction");
}

function saveTransaction() {
  const amount = parseFloat($("tx-amount").value);
  const date = $("tx-date").value;
  const category = $("tx-category").value;
  const note = $("tx-note").value.trim();
  if (!amount || amount <= 0) { toast("请输入有效金额", "error"); return; }
  if (!date) { toast("请选择日期", "error"); return; }
  
  const data = getProfileData(state.currentProfileId);
  data.transactions.push({ id: uuid(), type: state.txType, amount, date, category, note, createdAt: Date.now() });
  saveProfileData(state.currentProfileId, data);
  closeModal("modal-add-transaction");
  renderFinance();
  toast("记账成功", "success");
}

function deleteTransaction(id) {
  if (!confirm("确定要删除这条记录吗？")) return;
  const data = getProfileData(state.currentProfileId);
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveProfileData(state.currentProfileId, data);
  renderFinance();
  toast("记录已删除", "success");
}

function filterTransactions(filter) {
  renderFinance();
}

function exportFinanceCSV() {
  const data = getProfileData(state.currentProfileId);
  let csv = "日期,类型,分类,金额,备注\n";
  data.transactions.forEach(t => {
    const cats = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const cat = cats.find(c => c.id === t.category)?.name || t.category;
    csv += `${t.date},${t.type === 'income' ? '收入' : '支出'},${cat},${t.amount},${t.note || ''}\n`;
  });
  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "账单导出.csv";
  link.click();
  toast("导出成功", "success");
}

function showBudgetSetting() {
  const data = getProfileData(state.currentProfileId);
  const container = $("budget-settings-list");
  container.innerHTML = EXPENSE_CATEGORIES.map(c => `
    <div class="form-group">
      <label class="form-label">${c.icon} ${c.name}</label>
      <input type="number" class="form-input" id="budget-${c.id}" value="${data.budget[c.id] || ''}" placeholder="0" step="0.01">
    </div>
  `).join("");
  showModal("modal-budget");
}

function saveBudget() {
  const data = getProfileData(state.currentProfileId);
  EXPENSE_CATEGORIES.forEach(c => {
    const val = parseFloat($("budget-" + c.id).value);
    if (val > 0) data.budget[c.id] = val;
    else delete data.budget[c.id];
  });
  saveProfileData(state.currentProfileId, data);
  closeModal("modal-budget");
  renderFinance();
  toast("预算已保存", "success");
}

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
  if (isMobile) {
    setTimeout(() => _renderPlanChart(data), perfConfig.chartRenderDelay);
    return;
  }
  _renderPlanChart(data);
}

function _renderPlanChart(data) {
  const chartEl = $("plan-weekly-chart");
  if (chartEl && typeof echarts !== 'undefined') {
    const chart = initChart("plan-weekly-chart", {}, "planWeekly");
    if (!chart) return;
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
  // 移动端延迟渲染图表，避免卡顿
  if (isMobile) {
    setTimeout(() => _renderDashboardCharts(data), perfConfig.chartRenderDelay);
    return;
  }
  _renderDashboardCharts(data);
}

function _renderDashboardCharts(data) {
  // GPA趋势
  const gpaEl = $("dashboard-gpa-chart");
  if (gpaEl && typeof echarts !== 'undefined') {
    const chart = initChart("dashboard-gpa-chart", {}, "dashGpa");
    if (!chart) return;
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
    const chart = initChart("dashboard-finance-chart", {}, "dashFin");
    if (!chart) return;
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
  
  // 每分钟更新倒计时（仅在页面可见时）
  setInterval(() => {
    if (document.visibilityState === 'visible' && state.currentProfileId && state.currentView === 'countdown') {
      renderCountdown();
    }
  }, 60000);
  
  // 页面可见性变化时重新渲染
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.currentProfileId) {
      // 延迟渲染，避免与其他操作冲突
      setTimeout(() => {
        try { switchView(state.currentView); } catch(e) {}
      }, 300);
    }
  });
  
  // 窗口大小变化时重绘图表（防抖）
  window.addEventListener('resize', debounce(() => {
    Object.values(state.charts).forEach(chart => {
      if (chart && chart.resize) {
        try { chart.resize(); } catch(e) {}
      }
    });
  }, 200));
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

// 显示数据使用声明弹窗
function showDataUsageNotice() {
  showModal('modal-data-usage-notice');
}
window.showDataUsageNotice = showDataUsageNotice;

