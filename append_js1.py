import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index_new.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# JavaScript代码 - 第一部分：基础工具和状态管理
js_part1 = '''
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
'''

content += js_part1
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'已追加JS第一部分，当前大小: {len(content)} 字节')
