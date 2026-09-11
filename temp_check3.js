
(function() {
"use strict";

// ========== 常量配置 ==========
const STORAGE_PREFIX = "campus_toolbox_";
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
  tsinghua: { name: "清华大学4.0", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 82 ? 3.3 : s >= 78 ? 3.0 : s >= 75 ? 2.7 : s >= 72 ? 2.3 : s >= 68 ? 2.0 : s >= 64 ? 1.5 : s >= 60 ? 1.0 : 0 },
  pku: { name: "北京大学4.0", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 82 ? 3.3 : s >= 78 ? 3.0 : s >= 75 ? 2.7 : s >= 72 ? 2.3 : s >= 68 ? 2.0 : s >= 64 ? 1.5 : s >= 60 ? 1.0 : 0 },
  fudan: { name: "复旦大学4.0", max: 4.0, calc: s => s >= 95 ? 4.0 : s >= 90 ? 3.7 : s >= 85 ? 3.3 : s >= 80 ? 3.0 : s >= 75 ? 2.7 : s >= 70 ? 2.3 : s >= 65 ? 2.0 : s >= 60 ? 1.0 : 0 },
  sjtu: { name: "上海交大4.3", max: 4.3, calc: s => s >= 95 ? 4.3 : s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 80 ? 3.3 : s >= 75 ? 3.0 : s >= 70 ? 2.7 : s >= 65 ? 2.3 : s >= 60 ? 2.0 : 0 },
  zju: { name: "浙江大学5.0", max: 5.0, calc: s => s >= 95 ? 5.0 : s >= 90 ? 4.8 : s >= 85 ? 4.5 : s >= 80 ? 4.0 : s >= 75 ? 3.5 : s >= 70 ? 3.0 : s >= 65 ? 2.5 : s >= 60 ? 2.0 : 0 },
  nju: { name: "南京大学4.0", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 80 ? 3.3 : s >= 75 ? 3.0 : s >= 70 ? 2.7 : s >= 65 ? 2.3 : s >= 60 ? 2.0 : 0 },
  ustc: { name: "中科大4.3", max: 4.3, calc: s => s >= 95 ? 4.3 : s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 80 ? 3.3 : s >= 75 ? 3.0 : s >= 70 ? 2.7 : s >= 65 ? 2.3 : s >= 60 ? 2.0 : 0 },
  whu: { name: "武汉大学4.0", max: 4.0, calc: s => s >= 90 ? 4.0 : s >= 85 ? 3.7 : s >= 82 ? 3.3 : s >= 78 ? 3.0 : s >= 75 ? 2.7 : s >= 72 ? 2.3 : s >= 68 ? 2.0 : s >= 64 ? 1.5 : s >= 60 ? 1.0 : 0 },
  custom: { name: "自定义算法", max: 4.0, calc: s => calcCustomGPA(s) }
};

// 自定义GPA算法
const DEFAULT_CUSTOM_GPA = {
  max: 4.0,
  ranges: [
    { min: 90, max: 100, gpa: 4.0 },
    { min: 85, max: 89, gpa: 3.7 },
    { min: 82, max: 84, gpa: 3.3 },
    { min: 78, max: 81, gpa: 3.0 },
    { min: 75, max: 77, gpa: 2.7 },
    { min: 72, max: 74, gpa: 2.3 },
    { min: 68, max: 71, gpa: 2.0 },
    { min: 64, max: 67, gpa: 1.5 },
    { min: 60, max: 63, gpa: 1.0 },
    { min: 0, max: 59, gpa: 0 }
  ]
};

function calcCustomGPA(score) {
  const data = getCurrentData();
  const settings = data.customGPASettings || DEFAULT_CUSTOM_GPA;
  for (const range of settings.ranges) {
    if (score >= range.min && score <= range.max) return range.gpa;
  }
  return 0;
}

const COUNTDOWN_CATEGORIES = {
  exam: { name: "考试", color: "danger", icon: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>' },
  homework: { name: "作业/DDL", color: "warning", icon: '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>' },
  competition: { name: "竞赛", color: "accent", icon: '<path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>' },
  activity: { name: "活动", color: "pink", icon: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' },
  other: { name: "其他", color: "gray", icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>' }
};

const EXPENSE_CATEGORIES = [
  { id: "food", name: "餐饮", color: "#E17055", icon: '<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>' },
  { id: "transport", name: "交通", color: "#F0A500", icon: '<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>' },
  { id: "shopping", name: "购物", color: "#FDCB6E", icon: '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>' },
  { id: "entertainment", name: "娱乐", color: "#A29BFE", icon: '<path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zM9 8l7 4-7 4V8z"/>' },
  { id: "study", name: "学习", color: "#00B894", icon: '<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>' },
  { id: "medical", name: "医疗", color: "#00B894", icon: '<path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>' },
  { id: "digital", name: "数码", color: "#74B9FF", icon: '<path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>' },
  { id: "other_expense", name: "其他", color: "#94a3b8", icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>' }
];

const INCOME_CATEGORIES = [
  { id: "allowance", name: "生活费", color: "#00B894", icon: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>' },
  { id: "parttime", name: "兼职", color: "#00B894", icon: '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>' },
  { id: "scholarship", name: "奖学金", color: "#FDCB6E", icon: '<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>' },
  { id: "redpacket", name: "红包", color: "#E17055", icon: '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>' },
  { id: "other_income", name: "其他", color: "#94a3b8", icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>' }
];

// ========== 状态 ==========
let state = {
  profiles: [],
  currentProfileId: null,
  currentView: "dashboard",
  theme: "dark",
  gpaAlgorithm: "standard4",
  currentSemester: null,
  countdownFilter: "all",
  txFilter: "all",
  txType: "expense",
  selectedCategory: null,
  editingCourseId: null,
  editingCountdownId: null,
  selectedAvatarColor: 0,
  charts: {}
};

// ========== 工具函数 ==========
function $(id) { return document.getElementById(id); }
function uuid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }
function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
function formatDate(d) { const dt = new Date(d); return dt.getFullYear() + "-" + String(dt.getMonth()+1).padStart(2,"0") + "-" + String(dt.getDate()).padStart(2,"0"); }
function formatMoney(n) { return "¥" + Number(n).toFixed(2); }
function getTodayStr() { return formatDate(new Date()); }

function toast(msg, type) {
  type = type || "info";
  const container = $("toast-container");
  const el = document.createElement("div");
  el.className = "toast " + type;
  const icons = { success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>', error: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>', info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' };
  el.innerHTML = '<svg viewBox="0 0 24 24">' + (icons[type] || icons.info) + '</svg><span>' + escapeHtml(msg) + '</span>';
  container.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 400); }, 2800);
}

function showModal(id) { $(id).classList.add("show"); }
function closeModal(id) { $(id).classList.remove("show"); }

// 点击遮罩关闭弹窗
document.querySelectorAll(".modal-overlay").forEach(o => {
  o.addEventListener("click", e => { if (e.target === o) o.classList.remove("show"); });
});

// ========== 数据存储 ==========
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
    budget: 2000,
    gpaAlgorithm: "standard4",
    scheduleEvents: [],
    scheduleCategories: [
      { id: "course", name: "课程", color: "#38bdf8" },
      { id: "study", name: "自习", color: "#A29BFE" },
      { id: "exercise", name: "运动", color: "#fb7185" },
      { id: "life", name: "生活", color: "#FD79A8" },
      { id: "rest", name: "休息", color: "#00B894" },
      { id: "social", name: "社交", color: "#FDCB6E" },
      { id: "sleep", name: "睡眠", color: "#818cf8" }
    ],
    scheduleSettings: { timeStart: 390, timeEnd: 1410, step: 30 },
    scheduleHideDone: false,
    scheduleFilterCat: "all",
    scheduleSelectedDay: null,
    habits: [
      { id: "h1", name: "早起", icon: "🌅", done: false, streak: 0 },
      { id: "h2", name: "背单词", icon: "📚", done: false, streak: 0 },
      { id: "h3", name: "运动", icon: "🏃", done: false, streak: 0 },
      { id: "h4", name: "阅读", icon: "📖", done: false, streak: 0 }
    ],
    health: { water: 0, sleep: null, mood: null, exercise: 0, lastDate: null },
    customGPASettings: JSON.parse(JSON.stringify(DEFAULT_CUSTOM_GPA))
  });
}
function saveProfileData(profileId, data) {
  storageSet("data_" + profileId, data);
}
function getCurrentData() { return getProfileData(state.currentProfileId); }
function saveCurrentData(data) { saveProfileData(state.currentProfileId, data); }

// ========== 多用户系统 ==========
function loadProfiles() {
  state.profiles = storageGet("profiles", []);
  state.currentProfileId = storageGet("current_profile", null);
  state.theme = storageGet("theme", "dark");
}

function renderWelcomeProfiles() {
  const container = $("welcome-profiles");
  if (state.profiles.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-desc">还没有档案，创建一个开始使用吧</div></div>';
    return;
  }
  container.innerHTML = state.profiles.map(p => {
    const data = getProfileData(p.id);
    const courseCount = data.courses.length;
    const txCount = data.transactions.length;
    return '<button class="welcome-profile-item" onclick="enterProfile(\'' + p.id + '\')">' +
      '<div class="profile-avatar" style="background:linear-gradient(135deg,' + p.colorFrom + ',' + p.colorTo + ')">' + p.name.charAt(0) + '</div>' +
      '<div class="welcome-profile-info">' +
        '<div class="welcome-profile-name">' + escapeHtml(p.name) + (p.username ? ' <span style="font-size:11px;color:var(--text-3);font-weight:500;">@' + escapeHtml(p.username) + '</span>' : '') + '</div>' +
        '<div class="welcome-profile-meta">' + courseCount + ' 门课程 · ' + txCount + ' 笔账单 · ' + data.countdowns.filter(c=>!c.done).length + ' 个倒计时</div>' +
      '</div>' +
      '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' +
    '</button>';
  }).join("");
}

function renderAvatarColors() {
  const container = $("avatar-colors");
  container.innerHTML = AVATAR_COLORS.map((c, i) =>
    '<div class="avatar-color ' + (i === state.selectedAvatarColor ? "selected" : "") + '" style="background:linear-gradient(135deg,' + c.from + ',' + c.to + ')" onclick="selectAvatarColor(' + i + ')"></div>'
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
  } catch(e) {
    console.error("showCreateProfile error:", e);
  }
}

function createProfile() {
  const username = $("new-profile-username").value.trim();
  const name = $("new-profile-name").value.trim();
  if (!username) { toast("请输入用户名", "error"); return; }
  if (!name) { toast("请输入昵称", "error"); return; }
  // 检查用户名唯一性
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
  $("sidebar-username").textContent = profile.username ? "@" + profile.username : "";
  const avatar = $("sidebar-avatar");
  avatar.style.background = "linear-gradient(135deg," + profile.colorFrom + "," + profile.colorTo + ")";
  avatar.textContent = profile.name.charAt(0);
  // 加载数据
  const data = getCurrentData();
  state.gpaAlgorithm = data.gpaAlgorithm || "standard4";
  $("gpa-algorithm").value = state.gpaAlgorithm;
  state.currentSemester = data.semesters[0] ? data.semesters[0].id : null;
  // 切换界面
  $("welcome-page").style.display = "none";
  $("app").style.display = "flex";
  // 应用主题
  applyTheme();
  // 渲染所有视图
  renderAll();
  // 问候语
  updateGreeting(profile.name);
}

function updateGreeting(name) {
  const hour = new Date().getHours();
  let greet = "你好";
  if (hour < 6) greet = "夜深了";
  else if (hour < 12) greet = "早上好";
  else if (hour < 14) greet = "中午好";
  else if (hour < 18) greet = "下午好";
  else greet = "晚上好";
  $("dashboard-greeting").textContent = greet + "，" + name;
  const days = ["周日","周一","周二","周三","周四","周五","周六"];
  const now = new Date();
  $("dashboard-date").textContent = now.getFullYear() + "年" + (now.getMonth()+1) + "月" + now.getDate() + "日 " + days[now.getDay()] + " · 今天也要加油哦";
}

function showProfileManager() {
  const container = $("profile-manager-list");
  container.innerHTML = state.profiles.map(p => {
    const isCurrent = p.id === state.currentProfileId;
    return '<div class="welcome-profile-item" style="' + (isCurrent ? 'border-color:var(--primary);background:rgba(108,92,231,0.1);' : '') + '">' +
      '<div class="profile-avatar" style="background:linear-gradient(135deg,' + p.colorFrom + ',' + p.colorTo + ')">' + p.name.charAt(0) + '</div>' +
      '<div class="welcome-profile-info">' +
        '<div class="welcome-profile-name">' + escapeHtml(p.name) + (isCurrent ? ' <span class="tag primary" style="margin-left:6px;">当前</span>' : '') + (p.username ? ' <span style="font-size:11px;color:var(--text-3);font-weight:500;">@' + escapeHtml(p.username) + '</span>' : '') + '</div>' +
        '<div class="welcome-profile-meta">创建于 ' + formatDate(p.createdAt) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;">' +
        (!isCurrent ? '<button class="btn btn-ghost btn-sm" onclick="enterProfile(\'' + p.id + '\');closeModal(\'modal-profile-manager\')">切换</button>' : '') +
        (state.profiles.length > 1 ? '<button class="btn btn-danger btn-sm" onclick="deleteProfile(\'' + p.id + '\')">删除</button>' : '') +
      '</div>' +
    '</div>';
  }).join("");
  showModal("modal-profile-manager");
}

function deleteProfile(profileId) {
  if (!confirm("确定要删除这个档案吗？所有数据将被清除，且无法恢复。")) return;
  state.profiles = state.profiles.filter(p => p.id !== profileId);
  storageSet("profiles", state.profiles);
  localStorage.removeItem(STORAGE_PREFIX + "data_" + profileId);
  if (state.currentProfileId === profileId) {
    state.currentProfileId = state.profiles[0] ? state.profiles[0].id : null;
    storageSet("current_profile", state.currentProfileId);
    if (state.currentProfileId) {
      enterProfile(state.currentProfileId);
    } else {
      $("app").style.display = "none";
      $("welcome-page").style.display = "flex";
      renderWelcomeProfiles();
    }
  }
  closeModal("modal-profile-manager");
  toast("档案已删除", "success");
}

// ========== 视图切换 ==========
function switchView(view) {
  state.currentView = view;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $("view-" + view).classList.add("active");
  document.querySelectorAll(".nav-item[data-view]").forEach(n => {
    n.classList.toggle("active", n.dataset.view === view);
  });
  document.querySelectorAll(".bottom-nav-item").forEach(n => {
    n.classList.toggle("active", n.dataset.view === view);
  });
  // 应用视图主题色
  const main = document.querySelector(".main");
  main.classList.remove("view-gpa", "view-plan", "view-finance");
  if (view !== "dashboard" && view !== "plan") main.classList.add("view-" + view);
  // 渲染对应视图
  if (view === "dashboard") renderDashboard();
  else if (view === "gpa") renderGPA();
  else if (view === "plan") renderPlan();
  else if (view === "finance") renderFinance();
  // 滚动到顶部
  document.querySelector(".main").scrollTop = 0;
}

// ========== 主题切换 ==========
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const icon = state.theme === "dark"
    ? '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>'
    : '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>';
  document.querySelectorAll("#theme-icon, .topbar .icon-btn svg").forEach(s => { if (s.closest("[onclick*=switchTheme]") || s.id === "theme-icon") s.innerHTML = icon; });
}
function switchTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  storageSet("theme", state.theme);
  applyTheme();
  // 重绘图表
  setTimeout(() => {
    Object.values(state.charts).forEach(c => { if (c) c.resize(); });
  }, 100);
}

// ========== 渲染所有 ==========
// ========== 生活作息管理 ==========
const SCHEDULE_WEEK_DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
let scheduleEditingId = null;

function schedTodayIndex() { return (new Date().getDay() + 6) % 7; }
function schedUid() { return "ev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }

// 作息总表渲染
function renderSchedule() {
  const data = getCurrentData();
  if (data.scheduleSelectedDay === null || data.scheduleSelectedDay === undefined) {
    data.scheduleSelectedDay = schedTodayIndex();
  }
  renderScheduleStats(data);
  renderScheduleDayTabs(data);
  renderScheduleEventList(data);
  renderCategoryBars(data);
}

function renderScheduleStats(data) {
  const events = data.scheduleEvents || [];
  const today = schedTodayIndex();
  const todays = events.filter(e => e.day === today);
  const doneCount = events.filter(e => e.done).length;
  const donePercent = events.length ? Math.round(doneCount / events.length * 100) : 0;
  const studyMin = events.filter(e => e.category === "course" || e.category === "study")
    .reduce((sum, e) => sum + Math.max(0, e.end - e.start), 0);
  const studyH = Math.floor(studyMin / 60);

  $("schedule-stats").innerHTML =
    '<div class="stat-card primary"><div class="stat-label">本周安排</div><div class="stat-value">' + events.length + '</div></div>' +
    '<div class="stat-card danger"><div class="stat-label">本周学习</div><div class="stat-value">' + studyH + '<small>h</small></div></div>' +
    '<div class="stat-card warning"><div class="stat-label">今日安排</div><div class="stat-value">' + todays.length + '</div></div>' +
    '<div class="stat-card success"><div class="stat-label">完成率</div><div class="stat-value">' + donePercent + '<small>%</small></div></div>';
}

function renderScheduleDayTabs(data) {
  const today = schedTodayIndex();
  const selected = data.scheduleSelectedDay;
  let html = '';
  for (let d = 0; d < 7; d++) {
    const count = (data.scheduleEvents || []).filter(e => e.day === d).length;
    html += '<button class="countdown-tab ' + (d === selected ? 'active' : '') + '" onclick="switchScheduleDay(' + d + ')">' +
      SCHEDULE_WEEK_DAYS[d] + (d === today ? ' <span style="font-size:10px;opacity:0.7;">今</span>' : '') +
      (count > 0 ? ' <span style="font-size:10px;opacity:0.6;">(' + count + ')</span>' : '') +
      '</button>';
  }
  $("schedule-day-tabs").innerHTML = html;
}

function switchScheduleDay(day) {
  const data = getCurrentData();
  data.scheduleSelectedDay = day;
  saveCurrentData(data);
  renderSchedule();
}

function renderScheduleEventList(data) {
  const day = data.scheduleSelectedDay;
  const events = (data.scheduleEvents || []).filter(e => e.day === day).sort((a, b) => a.start - b.start);
  const cats = data.scheduleCategories || [];

  if (events.length === 0) {
    $("schedule-event-list").innerHTML =
      '<div class="empty-state" style="padding:40px;text-align:center;grid-column:1/-1;"><div class="empty-desc">这一天还没有安排，点击右上角"添加安排"按钮创建吧</div></div>';
    return;
  }

  let html = '';
  events.forEach(e => {
    const cat = cats.find(c => c.id === e.category) || { color: "#888", name: "其他" };
    const startH = Math.floor(e.start / 60), startM = e.start % 60;
    const endH = Math.floor(e.end / 60), endM = e.end % 60;
    const timeStr = String(startH).padStart(2, '0') + ':' + String(startM).padStart(2, '0') +
      ' - ' + String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0');

    html += '<div class="countdown-card ' + (e.done ? 'done' : '') + '" style="border-top:3px solid ' + cat.color + ';">' +
      '<div class="countdown-card-header">' +
      '<div class="countdown-card-title">' + escapeHtml(e.title) + '</div>' +
      '<div class="countdown-card-actions">' +
      '<button class="icon-btn btn-sm" onclick="toggleScheduleDone(\'' + e.id + '\')" title="' + (e.done ? '恢复' : '完成') + '" style="color:' + (e.done ? 'var(--success)' : 'var(--text-3)') + ';">' +
      (e.done ? '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>') +
      '</button>' +
      '<button class="icon-btn btn-sm" onclick="editScheduleEvent(\'' + e.id + '\')" title="编辑"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>' +
      '<button class="icon-btn btn-sm" onclick="deleteScheduleEvent(\'' + e.id + '\')" title="删除"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>' +
      '</div></div>' +
      '<div class="countdown-card-info">' +
      '<div class="countdown-card-date">🕐 ' + timeStr + '</div>' +
      '<div class="countdown-card-cat" style="background:' + cat.color + ';">' + cat.name + '</div>' +
      (e.location ? '<div class="countdown-card-date">📍 ' + escapeHtml(e.location) + '</div>' : '') +
      '</div></div>';
  });
  $("schedule-event-list").innerHTML = html;
}

function renderCategoryBars(data) {
  const cats = data.scheduleCategories || [];
  const events = data.scheduleEvents || [];
  const counts = {};
  events.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
  const maxCount = Math.max(1, ...Object.values(counts));

  let html = "";
  cats.forEach(c => {
    const count = counts[c.id] || 0;
    const width = (count / maxCount) * 100;
    html += '<div class="category-bar-row">' +
      '<div class="category-bar-name"><span class="category-bar-dot" style="background:' + c.color + ';"></span>' + c.name + '</div>' +
      '<div class="category-bar-track"><div class="category-bar-fill" style="width:' + width + '%;background:' + c.color + ';"></div></div>' +
      '<div class="category-bar-count">' + count + ' 项</div></div>';
  });
  $("category-bars").innerHTML = html;
}

// 事件增删改查
function showAddScheduleEvent() {
  const data = getCurrentData();
  scheduleEditingId = null;
  $("schedule-event-title").textContent = "添加安排";
  $("se-title").value = "";
  $("se-day").value = data.scheduleSelectedDay !== null ? data.scheduleSelectedDay : schedTodayIndex();
  $("se-start").value = "08:00";
  $("se-end").value = "09:40";
  $("se-location").value = "";
  $("se-notes").value = "";
  $("se-delete-btn").style.display = "none";
  renderCategoryPicker(data, "course");
  showModal("modal-schedule-event");
}

function editScheduleEvent(eventId) {
  const data = getCurrentData();
  const event = (data.scheduleEvents || []).find(e => e.id === eventId);
  if (!event) return;
  scheduleEditingId = eventId;
  $("schedule-event-title").textContent = "编辑安排";
  $("se-title").value = event.title;
  $("se-day").value = event.day;
  $("se-start").value = String(Math.floor(event.start / 60)).padStart(2, '0') + ':' + String(event.start % 60).padStart(2, '0');
  $("se-end").value = String(Math.floor(event.end / 60)).padStart(2, '0') + ':' + String(event.end % 60).padStart(2, '0');
  $("se-location").value = event.location || "";
  $("se-notes").value = event.notes || "";
  $("se-delete-btn").style.display = "block";
  renderCategoryPicker(data, event.category);
  showModal("modal-schedule-event");
}

function renderCategoryPicker(data, selectedId) {
  const cats = data.scheduleCategories || [];
  let html = "";
  cats.forEach(c => {
    html += '<div class="category-option ' + (c.id === selectedId ? "selected" : "") + '" style="background:' + c.color + ';color:#fff;" onclick="selectScheduleCategory(\'' + c.id + '\', this)">' + c.name + '</div>';
  });
  $("se-category-picker").innerHTML = html;
  $("se-category-picker").dataset.selected = selectedId;
}

function selectScheduleCategory(catId, el) {
  document.querySelectorAll("#se-category-picker .category-option").forEach(o => o.classList.remove("selected"));
  el.classList.add("selected");
  $("se-category-picker").dataset.selected = catId;
}

function saveScheduleEvent() {
  const data = getCurrentData();
  const title = $("se-title").value.trim();
  if (!title) { toast("请输入安排名称", "error"); return; }
  const day = parseInt($("se-day").value);
  const startStr = $("se-start").value;
  const endStr = $("se-end").value;
  const start = parseInt(startStr.split(':')[0]) * 60 + parseInt(startStr.split(':')[1]);
  const end = parseInt(endStr.split(':')[0]) * 60 + parseInt(endStr.split(':')[1]);
  if (end <= start) { toast("结束时间必须晚于开始时间", "error"); return; }
  const location = $("se-location").value.trim();
  const notes = $("se-notes").value.trim();
  const category = $("se-category-picker").dataset.selected || "course";

  if (!data.scheduleEvents) data.scheduleEvents = [];
  if (scheduleEditingId) {
    const idx = data.scheduleEvents.findIndex(e => e.id === scheduleEditingId);
    if (idx >= 0) {
      data.scheduleEvents[idx] = { ...data.scheduleEvents[idx], title, day, start, end, location, notes, category };
    }
  } else {
    data.scheduleEvents.push({ id: schedUid(), title, day, start, end, location, notes, category, done: false, createdAt: Date.now() });
  }
  saveCurrentData(data);
  closeModal("modal-schedule-event");
  renderSchedule();
  renderRoutine();
  toast("保存成功", "success");
}

function deleteScheduleEvent(eventId) {
  const id = eventId || scheduleEditingId;
  if (!id) return;
  if (!confirm("确定要删除这个安排吗？")) return;
  const data = getCurrentData();
  data.scheduleEvents = (data.scheduleEvents || []).filter(e => e.id !== id);
  saveCurrentData(data);
  closeModal("modal-schedule-event");
  renderSchedule();
  renderRoutine();
  toast("已删除", "success");
}

function toggleScheduleDone(eventId) {
  const data = getCurrentData();
  const idx = (data.scheduleEvents || []).findIndex(e => e.id === eventId);
  if (idx >= 0) {
    data.scheduleEvents[idx].done = !data.scheduleEvents[idx].done;
    saveCurrentData(data);
    renderSchedule();
    renderRoutine();
  }
}

// ========== 今日作息 ==========
function renderRoutine() {
  const data = getCurrentData();
  const today = schedTodayIndex();
  const now = new Date();
  const dateStr = now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日 " + SCHEDULE_WEEK_DAYS[today];
  $("routine-date").textContent = dateStr + " · 今日安排、习惯打卡、健康记录";

  const todayKey = now.toDateString();
  if (!data.health) data.health = { water: 0, sleep: null, mood: null, exercise: 0, lastDate: null };
  if (data.health.lastDate !== todayKey) {
    data.health = { water: 0, sleep: data.health.sleep, mood: null, exercise: 0, lastDate: todayKey };
  }

  renderRoutineStats(data);
  renderRoutineTimeline(data);
  renderHabits(data);
  renderHealth(data);
}

function renderRoutineStats(data) {
  const today = schedTodayIndex();
  const events = (data.scheduleEvents || []).filter(e => e.day === today);
  const doneCount = events.filter(e => e.done).length;
  const donePercent = events.length ? Math.round(doneCount / events.length * 100) : 0;
  const habits = data.habits || [];
  const habitDone = habits.filter(h => h.done).length;
  const streak = habits.length > 0 && habits.every(h => h.done) ? Math.max(...habits.map(h => h.streak || 0)) : 0;

  $("routine-stats").innerHTML =
    '<div class="stat-card primary"><div class="stat-label">今日安排</div><div class="stat-value">' + events.length + '</div></div>' +
    '<div class="stat-card success"><div class="stat-label">已完成</div><div class="stat-value">' + doneCount + '</div></div>' +
    '<div class="stat-card warning"><div class="stat-label">完成率</div><div class="stat-value">' + donePercent + '<small>%</small></div></div>' +
    '<div class="stat-card danger"><div class="stat-label">习惯打卡</div><div class="stat-value">' + habitDone + '<small>/' + habits.length + '</small></div></div>';
}

function renderRoutineTimeline(data) {
  const today = schedTodayIndex();
  const events = (data.scheduleEvents || []).filter(e => e.day === today).sort((a, b) => a.start - b.start);
  const cats = data.scheduleCategories || [];

  if (events.length === 0) {
    $("routine-timeline").innerHTML = '<div class="empty-state" style="padding:20px;text-align:center;"><div class="empty-desc">今天还没有安排</div></div>';
    return;
  }

  let html = '';
  events.forEach(e => {
    const cat = cats.find(c => c.id === e.category) || { color: "#888", name: "其他" };
    const startH = Math.floor(e.start / 60), startM = e.start % 60;
    const endH = Math.floor(e.end / 60), endM = e.end % 60;
    const timeStr = String(startH).padStart(2, '0') + ':' + String(startM).padStart(2, '0');
    const endTimeStr = String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0');

    html += '<div class="routine-item ' + (e.done ? 'done' : '') + '" style="border-left:3px solid ' + cat.color + ';">' +
      '<div class="routine-time">' + timeStr + '<span>' + endTimeStr + '</span></div>' +
      '<div class="routine-title">' + escapeHtml(e.title) + '</div>' +
      '<div class="routine-meta">' +
      '<span style="color:' + cat.color + ';">' + cat.name + '</span>' +
      (e.location ? '<span>📍 ' + escapeHtml(e.location) + '</span>' : '') +
      '</div>' +
      '<button class="routine-done-btn" onclick="toggleScheduleDone(\'' + e.id + '\')" title="' + (e.done ? '恢复未完成' : '标记完成') + '">' +
      (e.done ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '') +
      '</button></div>';
  });
  $("routine-timeline").innerHTML = html;
}

// ========== 习惯打卡 ==========
function renderHabits(data) {
  const habits = data.habits || [];
  if (habits.length === 0) {
    $("habit-grid").innerHTML = '<div class="empty-state" style="padding:20px;text-align:center;grid-column:1/-1;"><div class="empty-desc">还没有习惯，点击右上角添加</div></div>';
    return;
  }
  let html = '';
  habits.forEach(h => {
    html += '<button type="button" class="habit-card ' + (h.done ? 'done' : '') + '" onclick="toggleHabit(\'' + h.id + '\')">' +
      (h.done ? '<div class="habit-check">✓</div>' : '') +
      '<div class="habit-icon">' + h.icon + '</div>' +
      '<div class="habit-name">' + escapeHtml(h.name) + '</div>' +
      '<div class="habit-streak">连续 ' + (h.streak || 0) + ' 天</div>' +
      '</button>';
  });
  $("habit-grid").innerHTML = html;
}

function toggleHabit(habitId) {
  const data = getCurrentData();
  const idx = (data.habits || []).findIndex(h => h.id === habitId);
  if (idx >= 0) {
    data.habits[idx].done = !data.habits[idx].done;
    if (data.habits[idx].done) {
      data.habits[idx].streak = (data.habits[idx].streak || 0) + 1;
    } else {
      data.habits[idx].streak = Math.max(0, (data.habits[idx].streak || 0) - 1);
    }
    saveCurrentData(data);
    renderRoutine();
    toast(data.habits[idx].done ? "打卡成功！" : "已取消打卡", "success");
  }
}

function showAddHabit() {
  const name = prompt("请输入习惯名称：");
  if (!name || !name.trim()) return;
  const icons = ["🌅", "📚", "🏃", "📖", "💧", "🧘", "✍️", "🎯", "💪", "🌙"];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  const data = getCurrentData();
  if (!data.habits) data.habits = [];
  data.habits.push({ id: "h" + Date.now(), name: name.trim(), icon, done: false, streak: 0 });
  saveCurrentData(data);
  renderRoutine();
  toast("习惯添加成功", "success");
}

// ========== 健康记录 ==========
function renderHealth(data) {
  const h = data.health || { water: 0, sleep: null, mood: null, exercise: 0 };
  $("water-count").textContent = h.water || 0;
  $("sleep-hours").textContent = h.sleep ? h.sleep + "h" : "--";
  $("mood-text").textContent = h.mood || "--";
  $("exercise-min").textContent = h.exercise || 0;
}

function logWater() {
  const data = getCurrentData();
  if (!data.health) data.health = { water: 0, sleep: null, mood: null, exercise: 0, lastDate: new Date().toDateString() };
  data.health.water = (data.health.water || 0) + 1;
  saveCurrentData(data);
  renderHealth(data);
  toast("已记录喝水 +1 杯，当前 " + data.health.water + " 杯", "success");
}

function logSleep() {
  const hours = prompt("请输入昨晚睡眠时长（小时）：", "7.5");
  if (hours === null) return;
  const h = parseFloat(hours);
  if (isNaN(h) || h < 0 || h > 24) { toast("请输入有效的小时数", "error"); return; }
  const data = getCurrentData();
  if (!data.health) data.health = { water: 0, sleep: null, mood: null, exercise: 0, lastDate: new Date().toDateString() };
  data.health.sleep = h;
  saveCurrentData(data);
  renderHealth(data);
  toast("睡眠记录成功：" + h + " 小时", "success");
}

function logMood() {
  const moods = ["😊 开心", "😐 平静", "😔 低落", "😤 烦躁", "😴 疲惫", "🤔 思考"];
  const moodStr = moods.map((m, i) => (i + 1) + ". " + m).join("\n");
  const choice = prompt("请选择今日心情（输入序号）：\n" + moodStr, "1");
  if (choice === null) return;
  const idx = parseInt(choice) - 1;
  if (idx < 0 || idx >= moods.length) { toast("请输入有效的序号", "error"); return; }
  const data = getCurrentData();
  if (!data.health) data.health = { water: 0, sleep: null, mood: null, exercise: 0, lastDate: new Date().toDateString() };
  data.health.mood = moods[idx];
  saveCurrentData(data);
  renderHealth(data);
  toast("心情记录成功", "success");
}

function logExercise() {
  const data = getCurrentData();
  if (!data.health) data.health = { water: 0, sleep: null, mood: null, exercise: 0, lastDate: new Date().toDateString() };
  data.health.exercise = (data.health.exercise || 0) + 30;
  saveCurrentData(data);
  renderHealth(data);
  toast("已记录运动 +30 分钟，当前 " + data.health.exercise + " 分钟", "success");
}



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
      '<div class="countdown-actions"><button class="done-btn" onclick="toggleCountdownDone('' + c.id + '')">完成</button><button class="del-btn" onclick="deleteCountdown('' + c.id + '')">删除</button></div></div>';
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
function renderAll() {
  renderDashboard();
  renderGPA();
  renderPlan();
  renderFinance();
}

// ========== GPA 模块 ==========
function calcGPA(courses, algorithm) {
  const algo = GPA_ALGORITHMS[algorithm] || GPA_ALGORITHMS.standard4;
  let totalPoints = 0, totalCredits = 0;
  courses.forEach(c => {
    const grade = algo.calc(Number(c.score));
    totalPoints += grade * Number(c.credit);
    totalCredits += Number(c.credit);
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

function getGradeColor(score) {
  if (score >= 90) return "linear-gradient(135deg,#00B894,#059669)";
  if (score >= 80) return "linear-gradient(135deg,#00B894,#0891b2)";
  if (score >= 70) return "linear-gradient(135deg,#A29BFE,#7c3aed)";
  if (score >= 60) return "linear-gradient(135deg,#FDCB6E,#d97706)";
  return "linear-gradient(135deg,#E17055,#dc2626)";
}

function renderGPA() {
  updateCustomGPABtn();
  const data = getCurrentData();
  const algo = GPA_ALGORITHMS[state.gpaAlgorithm];

  // 统计
  const allCourses = data.courses;
  const totalGPA = calcGPA(allCourses, state.gpaAlgorithm);
  const totalCredits = allCourses.reduce((s,c) => s + Number(c.credit), 0);
  const avgScore = allCourses.length > 0 ? allCourses.reduce((s,c) => s + Number(c.score), 0) / allCourses.length : 0;
  const passed = allCourses.filter(c => c.score >= 60).length;

  $("gpa-stats").innerHTML =
    '<div class="stat-card primary"><div class="stat-label">总 GPA</div><div class="stat-value">' + totalGPA.toFixed(2) + '<small>/' + algo.max + '</small></div><div class="stat-trend up">' + algo.name + '</div></div>' +
    '<div class="stat-card accent"><div class="stat-label">总学分</div><div class="stat-value">' + totalCredits.toFixed(1) + '<small>学分</small></div></div>' +
    '<div class="stat-card success"><div class="stat-label">平均分</div><div class="stat-value">' + avgScore.toFixed(1) + '<small>分</small></div></div>' +
    '<div class="stat-card warning"><div class="stat-label">通过课程</div><div class="stat-value">' + passed + '<small>/' + allCourses.length + '</small></div></div>';

  // 学期标签
  const tabsHtml = data.semesters.map(s =>
    '<button class="semester-tab ' + (s.id === state.currentSemester ? "active" : "") + '" onclick="selectSemester(\'' + s.id + '\')">' + escapeHtml(s.name) + '</button>'
  ).join('') + '<button class="semester-tab add-tab" onclick="addSemester()">+ 新学期</button>';
  $("semester-tabs").innerHTML = tabsHtml;

  // 学期下拉
  $("course-semester").innerHTML = data.semesters.map(s =>
    '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>'
  ).join("");

  // 当前学期课程
  const semCourses = allCourses.filter(c => c.semesterId === state.currentSemester);
  const semGPA = calcGPA(semCourses, state.gpaAlgorithm);
  $("course-count").textContent = semCourses.length + " 门课 · 学期GPA " + semGPA.toFixed(2);

  if (semCourses.length === 0) {
    $("course-list").innerHTML = '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg></div><div class="empty-title">还没有课程</div><div class="empty-desc">点击右上角"添加课程"开始录入成绩</div></div>';
  } else {
    const typeNames = { required: "必修", elective: "选修", general: "通识", practice: "实践" };
    $("course-list").innerHTML = semCourses.map(c =>
      '<div class="course-item">' +
        '<div class="course-grade" style="background:' + getGradeColor(c.score) + '">' + Math.round(c.score) + '</div>' +
        '<div class="course-info">' +
          '<div class="course-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="course-meta"><span>' + typeNames[c.type] + '</span><span>' + c.credit + ' 学分</span><span>绩点 ' + GPA_ALGORITHMS[state.gpaAlgorithm].calc(Number(c.score)).toFixed(1) + '</span></div>' +
        '</div>' +
        '<div class="course-credit">' + c.credit + '学分</div>' +
        '<button class="course-delete" onclick="editCourse(\'' + c.id + '\')" title="编辑"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>' +
        '<button class="course-delete" onclick="deleteCourse(\'' + c.id + '\')" title="删除"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>' +
      '</div>'
    ).join("");
  }

  // GPA趋势图
  renderGPAChart(data);
}

function renderGPAChart(data) {
  if (typeof echarts === "undefined") return;
  const el = $("gpa-chart");
  if (!el) return;
  if (state.charts.gpa) { state.charts.gpa.dispose(); }
  const chart = echarts.init(el);
  state.charts.gpa = chart;

  const semNames = data.semesters.map(s => s.name.length > 8 ? s.name.slice(-8) : s.name);
  const semGPAs = data.semesters.map(s => {
    const courses = data.courses.filter(c => c.semesterId === s.id);
    return calcGPA(courses, state.gpaAlgorithm);
  });

  const textColor = state.theme === "dark" ? "#a0a0b8" : "#505068";
  chart.setOption({
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    tooltip: { trigger: "axis", backgroundColor: "rgba(20,20,40,0.95)", borderColor: "rgba(108,92,231,0.3)", textStyle: { color: "#fff" } },
    xAxis: { type: "category", data: semNames, axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } }, axisLabel: { color: textColor, fontSize: 11, rotate: semNames.length > 4 ? 30 : 0 } },
    yAxis: { type: "value", min: 0, max: GPA_ALGORITHMS[state.gpaAlgorithm].max, axisLine: { show: false }, axisLabel: { color: textColor }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } } },
    series: [{
      type: "line", data: semGPAs, smooth: true, symbol: "circle", symbolSize: 10,
      lineStyle: { width: 3, color: new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:"#6C5CE7"},{offset:1,color:"#00B894"}]) },
      itemStyle: { color: "#6C5CE7", borderColor: "#fff", borderWidth: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:"rgba(108,92,231,0.3)"},{offset:1,color:"rgba(108,92,231,0)"}]) }
    }]
  });
}

function selectSemester(id) { state.currentSemester = id; renderGPA(); }

function addSemester() {
  const name = prompt("请输入学期名称，如：2025-2026 第一学期");
  if (!name) return;
  const data = getCurrentData();
  const sem = { id: uuid(), name: name.trim() };
  data.semesters.push(sem);
  saveCurrentData(data);
  state.currentSemester = sem.id;
  renderGPA();
  toast("学期已添加", "success");
}

function changeGpaAlgorithm() {
  state.gpaAlgorithm = $("gpa-algorithm").value;
  const data = getCurrentData();
  data.gpaAlgorithm = state.gpaAlgorithm;
  saveCurrentData(data);
  updateCustomGPABtn();
  renderGPA();
}

function updateCustomGPABtn() {
  const btn = $("edit-custom-gpa-btn");
  if (btn) {
    btn.style.display = state.gpaAlgorithm === "custom" ? "inline-flex" : "none";
  }
}

function showCustomGPASettings() {
  const data = getCurrentData();
  const settings = data.customGPASettings || DEFAULT_CUSTOM_GPA;
  let html = '<div style="margin-bottom:16px;"><label class="form-label">GPA满分</label><input type="number" class="form-input" id="cgpa-max" value="' + settings.max + '" step="0.1" min="1" max="5"></div>';
  html += '<div style="margin-bottom:16px;"><label class="form-label">分数段设置（从高到低）</label><div id="cgpa-ranges" style="display:flex;flex-direction:column;gap:8px;"></div></div>';
  html += '<button class="btn btn-ghost btn-sm" style="margin-bottom:16px;" onclick="addCustomGPARange()">+ 添加分数段</button>';

  // 用模态框显示
  const modal = document.createElement("div");
  modal.className = "modal-overlay show";
  modal.id = "modal-custom-gpa";
  modal.innerHTML = '<div class="modal" style="max-width:500px;max-height:80vh;overflow-y:auto;"><h2 class="modal-title">自定义GPA算法</h2><p class="modal-desc">设置每个分数段对应的GPA值</p>' + html + '<div class="modal-actions"><button class="btn btn-ghost" onclick="closeCustomGPAModal()">取消</button><button class="btn btn-primary" onclick="saveCustomGPASettings()">保存</button></div></div>';
  document.body.appendChild(modal);
  renderCustomGPARanges(settings.ranges);
}

function renderCustomGPARanges(ranges) {
  const container = $("cgpa-ranges");
  if (!container) return;
  container.innerHTML = ranges.map((r, i) =>
    '<div style="display:flex;gap:8px;align-items:center;">' +
    '<input type="number" class="form-input" style="width:70px;" value="' + r.min + '" data-idx="' + i + '" data-field="min" placeholder="最低分">' +
    '<span style="color:var(--text-3);">-</span>' +
    '<input type="number" class="form-input" style="width:70px;" value="' + r.max + '" data-idx="' + i + '" data-field="max" placeholder="最高分">' +
    '<span style="color:var(--text-3);">→</span>' +
    '<input type="number" class="form-input" style="width:70px;" value="' + r.gpa + '" data-idx="' + i + '" data-field="gpa" step="0.1" placeholder="GPA">' +
    '<button class="btn btn-danger btn-sm" onclick="removeCustomGPARange(' + i + ')">×</button>' +
    '</div>'
  ).join("");
}

function addCustomGPARange() {
  const data = getCurrentData();
  data.customGPASettings.ranges.push({ min: 0, max: 59, gpa: 0 });
  saveCurrentData(data);
  renderCustomGPARanges(data.customGPASettings.ranges);
}

function removeCustomGPARange(idx) {
  const data = getCurrentData();
  data.customGPASettings.ranges.splice(idx, 1);
  saveCurrentData(data);
  renderCustomGPARanges(data.customGPASettings.ranges);
}

function saveCustomGPASettings() {
  const data = getCurrentData();
  data.customGPASettings.max = parseFloat($("cgpa-max").value) || 4.0;
  const inputs = document.querySelectorAll("#cgpa-ranges input");
  const ranges = [];
  inputs.forEach(input => {
    const idx = parseInt(input.dataset.idx);
    const field = input.dataset.field;
    if (!ranges[idx]) ranges[idx] = { min: 0, max: 100, gpa: 0 };
    ranges[idx][field] = parseFloat(input.value) || 0;
  });
  data.customGPASettings.ranges = ranges.filter(r => r !== undefined);
  saveCurrentData(data);
  closeCustomGPAModal();
  renderGPA();
  toast("自定义GPA算法已保存", "success");
}

function closeCustomGPAModal() {
  const modal = $("modal-custom-gpa");
  if (modal) modal.remove();
}

function showAddCourse() {
  state.editingCourseId = null;
  $("course-modal-title").textContent = "添加课程";
  $("course-name").value = "";
  $("course-credit").value = "";
  $("course-score").value = "";
  $("course-type").value = "required";
  $("course-semester").value = state.currentSemester;
  showModal("modal-add-course");
}

function editCourse(id) {
  const data = getCurrentData();
  const course = data.courses.find(c => c.id === id);
  if (!course) return;
  state.editingCourseId = id;
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
  if (isNaN(credit) || credit <= 0) { toast("请输入有效的学分", "error"); return; }
  if (isNaN(score) || score < 0 || score > 100) { toast("请输入0-100的成绩", "error"); return; }

  const data = getCurrentData();
  if (state.editingCourseId) {
    const course = data.courses.find(c => c.id === state.editingCourseId);
    if (course) { Object.assign(course, { name, credit, score, type, semesterId }); }
    toast("课程已更新", "success");
  } else {
    data.courses.push({ id: uuid(), name, credit, score, type, semesterId, createdAt: Date.now() });
    toast("课程已添加", "success");
  }
  saveCurrentData(data);
  closeModal("modal-add-course");
  renderGPA();
}

function deleteCourse(id) {
  if (!confirm("确定要删除这门课程吗？")) return;
  const data = getCurrentData();
  data.courses = data.courses.filter(c => c.id !== id);
  saveCurrentData(data);
  renderGPA();
  toast("课程已删除", "success");
}

// ========== 倒计时模块 ==========
function getCountdownInfo(c) {
  const target = new Date(c.date + "T" + (c.time || "09:00"));
  const now = new Date();
  const diff = target - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { target, diff, days, hours, mins, isPast: diff < 0 };
}

function renderCountdown() {
  const data = getCurrentData();
  let countdowns = data.countdowns.slice();

  // 筛选
  if (state.countdownFilter === "active") countdowns = countdowns.filter(c => !c.done);
  else if (state.countdownFilter === "done") countdowns = countdowns.filter(c => c.done);

  // 更新筛选按钮状态
  ["all","active","done"].forEach(f => {
    const btn = $("filter-" + f);
    if (btn) btn.style.background = state.countdownFilter === f ? "linear-gradient(135deg,var(--primary),var(--primary-2))" : "";
    if (btn) btn.style.color = state.countdownFilter === f ? "white" : "";
  });

  // 统计
  const active = data.countdowns.filter(c => !c.done);
  const urgent = active.filter(c => { const info = getCountdownInfo(c); return info.days <= 7 && info.days >= 0; }).length;
  const done = data.countdowns.filter(c => c.done).length;
  const nextEvent = active.filter(c => !getCountdownInfo(c).isPast).sort((a,b) => new Date(a.date) - new Date(b.date))[0];

  $("countdown-stats").innerHTML =
    '<div class="stat-card primary"><div class="stat-label">进行中</div><div class="stat-value">' + active.length + '<small>个</small></div></div>' +
    '<div class="stat-card danger"><div class="stat-label">7天内</div><div class="stat-value">' + urgent + '<small>个</small></div></div>' +
    '<div class="stat-card success"><div class="stat-label">已完成</div><div class="stat-value">' + done + '<small>个</small></div></div>' +
    '<div class="stat-card accent"><div class="stat-label">最近事件</div><div class="stat-value" style="font-size:16px;line-height:1.4;">' + (nextEvent ? escapeHtml(nextEvent.name.slice(0,8)) : "暂无") + '</div></div>';

  // 角标
  const badge = $("countdown-badge");
  if (urgent > 0) { badge.style.display = "inline-block"; badge.textContent = urgent; }
  else { badge.style.display = "none"; }

  // 排序：未完成按日期升序，已完成按日期降序
  countdowns.sort((a,b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.done ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
  });

  if (countdowns.length === 0) {
    $("countdown-list").innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div><div class="empty-title">还没有倒计时</div><div class="empty-desc">添加考试、DDL或重要日子，再也不错过</div></div>';
    return;
  }

  const priorityNames = { high: "高", mid: "中", low: "低" };
  $("countdown-list").innerHTML = countdowns.map(c => {
    const info = getCountdownInfo(c);
    const cat = COUNTDOWN_CATEGORIES[c.category] || COUNTDOWN_CATEGORIES.other;
    const isUrgent = !c.done && info.days <= 3 && info.days >= 0;
    const progress = c.totalDays ? Math.min(100, ((c.totalDays - info.days) / c.totalDays) * 100) : 0;

    if (c.done) {
      return '<div class="countdown-card priority-' + c.priority + '" style="opacity:0.5;">' +
        '<div class="countdown-header"><div class="countdown-title" style="text-decoration:line-through;">' + escapeHtml(c.name) + '</div><span class="tag success">已完成</span></div>' +
        '<div class="countdown-days" style="font-size:24px;">已完成</div>' +
        '<div class="countdown-time"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>' + c.date + ' ' + (c.time || "") + '</div>' +
        '<div class="countdown-actions"><button class="del-btn" onclick="deleteCountdown(\'' + c.id + '\')">删除</button></div>' +
      '</div>';
    }

    if (info.isPast) {
      return '<div class="countdown-card priority-' + c.priority + '" style="opacity:0.6;">' +
        '<div class="countdown-header"><div class="countdown-title">' + escapeHtml(c.name) + '</div><span class="tag ' + cat.color + '">' + cat.name + '</span></div>' +
        '<div class="countdown-days" style="font-size:28px;">已过期</div>' +
        '<div class="countdown-days-label">' + Math.abs(info.days) + ' 天前</div>' +
        '<div class="countdown-time"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>' + c.date + ' ' + (c.time || "") + '</div>' +
        '<div class="countdown-actions"><button class="done-btn" onclick="toggleCountdownDone(\'' + c.id + '\')">标记完成</button><button class="del-btn" onclick="deleteCountdown(\'' + c.id + '\')">删除</button></div>' +
      '</div>';
    }

    return '<div class="countdown-card priority-' + c.priority + (isUrgent ? ' urgent' : '') + '">' +
      '<div class="countdown-header">' +
        '<div class="countdown-title">' + escapeHtml(c.name) + '</div>' +
        '<div style="display:flex;gap:6px;flex-shrink:0;"><span class="tag ' + cat.color + '">' + cat.name + '</span><span class="tag gray">' + priorityNames[c.priority] + '</span></div>' +
      '</div>' +
      '<div class="countdown-days ' + (isUrgent ? 'urgent' : '') + '">' + info.days + '</div>' +
      '<div class="countdown-days-label">天 ' + (info.days === 0 ? '· 今天！' : (info.hours > 0 ? info.hours + ' 小时 ' + info.mins + ' 分' : '')) + '</div>' +
      (c.note ? '<div style="font-size:12px;color:var(--text-3);margin-top:8px;">' + escapeHtml(c.note) + '</div>' : '') +
      '<div class="countdown-time"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>' + c.date + ' ' + (c.time || "") + '</div>' +
      '<div class="countdown-progress"><div class="countdown-progress-bar" style="width:' + progress + '%;background:linear-gradient(90deg,var(--primary),var(--accent));"></div></div>' +
      '<div class="countdown-actions">' +
        '<button onclick="editCountdown(\'' + c.id + '\')">编辑</button>' +
        '<button class="done-btn" onclick="toggleCountdownDone(\'' + c.id + '\')">完成</button>' +
        '<button class="del-btn" onclick="deleteCountdown(\'' + c.id + '\')">删除</button>' +
      '</div>' +
    '</div>';
  }).join("");
}

function toggleCountdownFilter(f) { state.countdownFilter = f; renderCountdown(); }

function showAddCountdown() {
  state.editingCountdownId = null;
  $("countdown-modal-title").textContent = "添加倒计时";
  $("countdown-name").value = "";
  $("countdown-date").value = getTodayStr();
  $("countdown-time").value = "09:00";
  $("countdown-category").value = "exam";
  $("countdown-priority").value = "mid";
  $("countdown-note").value = "";
  showModal("modal-add-countdown");
}

function editCountdown(id) {
  const data = getCurrentData();
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
  if (!name) { toast("请输入事件名称", "error"); return; }
  if (!date) { toast("请选择日期", "error"); return; }

  const data = getCurrentData();
  if (state.editingCountdownId) {
    const c = data.countdowns.find(x => x.id === state.editingCountdownId);
    if (c) { Object.assign(c, { name, date, time, category, priority, note }); }
    toast("倒计时已更新", "success");
  } else {
    const totalDays = Math.ceil((new Date(date) - new Date()) / (1000*60*60*24));
    data.countdowns.push({ id: uuid(), name, date, time, category, priority, note, done: false, totalDays, createdAt: Date.now() });
    toast("倒计时已添加", "success");
  }
  saveCurrentData(data);
  closeModal("modal-add-countdown");
  renderCountdown();
}

function toggleCountdownDone(id) {
  const data = getCurrentData();
  const c = data.countdowns.find(x => x.id === id);
  if (c) { c.done = !c.done; saveCurrentData(data); renderCountdown(); toast(c.done ? "已标记完成" : "已恢复", "success"); }
}

function deleteCountdown(id) {
  if (!confirm("确定要删除这个倒计时吗？")) return;
  const data = getCurrentData();
  data.countdowns = data.countdowns.filter(c => c.id !== id);
  saveCurrentData(data);
  renderCountdown();
  toast("倒计时已删除", "success");
}

// ========== 记账本模块 ==========
function getCategoryById(id) {
  return EXPENSE_CATEGORIES.find(c => c.id === id) || INCOME_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length-1];
}

function renderFinance() {
  const data = getCurrentData();
  const now = new Date();
  const thisMonth = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0");

  const monthTx = data.transactions.filter(t => t.date.startsWith(thisMonth));
  const monthExpense = monthTx.filter(t => t.type === "expense").reduce((s,t) => s + Number(t.amount), 0);
  const monthIncome = monthTx.filter(t => t.type === "income").reduce((s,t) => s + Number(t.amount), 0);
  const balance = monthIncome - monthExpense;
  const txCount = data.transactions.length;

  $("finance-stats").innerHTML =
    '<div class="stat-card danger"><div class="stat-label">本月支出</div><div class="stat-value">' + monthExpense.toFixed(0) + '<small>元</small></div></div>' +
    '<div class="stat-card success"><div class="stat-label">本月收入</div><div class="stat-value">' + monthIncome.toFixed(0) + '<small>元</small></div></div>' +
    '<div class="stat-card ' + (balance >= 0 ? "accent" : "warning") + '"><div class="stat-label">本月结余</div><div class="stat-value">' + (balance >= 0 ? "+" : "") + balance.toFixed(0) + '<small>元</small></div></div>' +
    '<div class="stat-card primary"><div class="stat-label">累计账单</div><div class="stat-value">' + txCount + '<small>笔</small></div></div>';

  // 预算条
  const budget = data.budget || 0;
  const budgetPercent = budget > 0 ? Math.min(100, (monthExpense / budget) * 100) : 0;
  const budgetClass = budgetPercent >= 100 ? "danger" : budgetPercent >= 80 ? "warning" : "";
  $("budget-bar").innerHTML =
    '<div class="budget-info"><span class="label">已用 / 预算</span><span class="value">' + monthExpense.toFixed(0) + ' / ' + budget.toFixed(0) + ' 元 (' + budgetPercent.toFixed(0) + '%)</span></div>' +
    '<div class="budget-track"><div class="budget-fill ' + budgetClass + '" style="width:' + budgetPercent + '%"></div></div>' +
    (budgetPercent >= 100 ? '<div style="font-size:12px;color:var(--danger);margin-top:8px;">已超支 ' + (monthExpense - budget).toFixed(0) + ' 元，注意控制开销！</div>' : budgetPercent >= 80 ? '<div style="font-size:12px;color:var(--warning);margin-top:8px;">预算使用超过80%，注意控制开销</div>' : "");

  // 交易列表
  renderTransactionList(data);

  // 趋势图
  renderFinanceChart(data);
}

function renderTransactionList(data) {
  let txs = data.transactions.slice();
  if (state.txFilter !== "all") txs = txs.filter(t => t.type === state.txFilter);

  // 更新筛选按钮
  document.querySelectorAll("[data-tx-filter]").forEach(b => {
    b.classList.toggle("active", b.dataset.txFilter === state.txFilter);
  });

  if (txs.length === 0) {
    $("transaction-list").innerHTML = '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div><div class="empty-title">还没有账单</div><div class="empty-desc">点击"记一笔"开始记录你的每一笔开销</div></div>';
    return;
  }

  // 按日期分组
  txs.sort((a,b) => new Date(b.date) - new Date(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  const groups = {};
  txs.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });

  let html = "";
  Object.keys(groups).forEach(date => {
    const dayTx = groups[date];
    const dayExpense = dayTx.filter(t => t.type === "expense").reduce((s,t) => s + Number(t.amount), 0);
    const dayIncome = dayTx.filter(t => t.type === "income").reduce((s,t) => s + Number(t.amount), 0);
    const d = new Date(date);
    const dateStr = (d.getMonth()+1) + "月" + d.getDate() + "日 " + ["周日","周一","周二","周三","周四","周五","周六"][d.getDay()];

    html += '<div class="transaction-date-group"><div class="transaction-date-label"><span>' + dateStr + '</span><span>' + (dayIncome > 0 ? '收 ' + dayIncome.toFixed(0) + '  ' : '') + (dayExpense > 0 ? '支 ' + dayExpense.toFixed(0) : '') + '</span></div>';
    dayTx.forEach(t => {
      const cat = getCategoryById(t.category);
      html += '<div class="transaction-item">' +
        '<div class="tx-icon" style="background:' + cat.color + ';"><svg viewBox="0 0 24 24">' + cat.icon + '</svg></div>' +
        '<div class="tx-info"><div class="tx-name">' + escapeHtml(t.note || cat.name) + '</div><div class="tx-category">' + cat.name + '</div></div>' +
        '<div class="tx-amount ' + t.type + '">' + (t.type === "expense" ? "-" : "+") + Number(t.amount).toFixed(2) + '</div>' +
        '<button class="course-delete" onclick="deleteTransaction(\'' + t.id + '\')" style="opacity:0;margin-left:8px;"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>' +
      '</div>';
    });
    html += '</div>';
  });
  $("transaction-list").innerHTML = html;
}

function renderFinanceChart(data) {
  if (typeof echarts === "undefined") return;
  const el = $("finance-chart");
  if (!el) return;
  if (state.charts.finance) { state.charts.finance.dispose(); }
  const chart = echarts.init(el);
  state.charts.finance = chart;

  // 最近6个月
  const months = [];
  const expenseData = [];
  const incomeData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
    months.push((d.getMonth()+1) + "月");
    const monthTx = data.transactions.filter(t => t.date.startsWith(key));
    expenseData.push(monthTx.filter(t => t.type === "expense").reduce((s,t) => s + Number(t.amount), 0));
    incomeData.push(monthTx.filter(t => t.type === "income").reduce((s,t) => s + Number(t.amount), 0));
  }

  const textColor = state.theme === "dark" ? "#a0a0b8" : "#505068";
  chart.setOption({
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    tooltip: { trigger: "axis", backgroundColor: "rgba(20,20,40,0.95)", borderColor: "rgba(108,92,231,0.3)", textStyle: { color: "#fff" } },
    legend: { data: ["支出","收入"], textStyle: { color: textColor }, top: 0, right: 0 },
    xAxis: { type: "category", data: months, axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } }, axisLabel: { color: textColor, fontSize: 11 } },
    yAxis: { type: "value", axisLine: { show: false }, axisLabel: { color: textColor }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } } },
    series: [
      { name: "支出", type: "bar", data: expenseData, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:"#E17055"},{offset:1,color:"rgba(248,113,113,0.3)"}]), borderRadius: [4,4,0,0] }, barWidth: 16 },
      { name: "收入", type: "bar", data: incomeData, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:"#00B894"},{offset:1,color:"rgba(52,211,153,0.3)"}]), borderRadius: [4,4,0,0] }, barWidth: 16 }
    ]
  });
}

function filterTransactions(f) { state.txFilter = f; renderFinance(); }

function setTxType(type) {
  state.txType = type;
  state.selectedCategory = null;
  document.querySelectorAll("[data-tx-type]").forEach(b => b.classList.toggle("active", b.dataset.txType === type));
  renderTxCategories();
}

function renderTxCategories() {
  const cats = state.txType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  $("tx-categories").innerHTML = cats.map(c =>
    '<div class="category-item ' + (state.selectedCategory === c.id ? "selected" : "") + '" onclick="selectCategory(\'' + c.id + '\')">' +
      '<div class="category-icon" style="background:' + c.color + ';"><svg viewBox="0 0 24 24">' + c.icon + '</svg></div>' +
      '<div class="category-name">' + c.name + '</div>' +
    '</div>'
  ).join("");
}

function selectCategory(id) { state.selectedCategory = id; renderTxCategories(); }

function showAddTransaction() {
  state.txType = "expense";
  state.selectedCategory = null;
  $("tx-amount").value = "";
  $("tx-note").value = "";
  $("tx-date").value = getTodayStr();
  document.querySelectorAll("[data-tx-type]").forEach(b => b.classList.toggle("active", b.dataset.txType === "expense"));
  renderTxCategories();
  showModal("modal-add-transaction");
}

function saveTransaction() {
  const amount = parseFloat($("tx-amount").value);
  const note = $("tx-note").value.trim();
  const date = $("tx-date").value;
  if (isNaN(amount) || amount <= 0) { toast("请输入有效金额", "error"); return; }
  if (!state.selectedCategory) { toast("请选择分类", "error"); return; }
  if (!date) { toast("请选择日期", "error"); return; }

  const data = getCurrentData();
  data.transactions.push({
    id: uuid(), type: state.txType, category: state.selectedCategory,
    amount: amount, note: note, date: date, createdAt: Date.now()
  });
  saveCurrentData(data);
  closeModal("modal-add-transaction");
  renderFinance();
  toast("记账成功", "success");
}

function deleteTransaction(id) {
  if (!confirm("确定要删除这笔记录吗？")) return;
  const data = getCurrentData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveCurrentData(data);
  renderFinance();
  toast("记录已删除", "success");
}

function showBudgetSetting() {
  const data = getCurrentData();
  $("budget-amount").value = data.budget || 0;
  showModal("modal-budget");
}

function saveBudget() {
  const budget = parseFloat($("budget-amount").value);
  if (isNaN(budget) || budget < 0) { toast("请输入有效预算", "error"); return; }
  const data = getCurrentData();
  data.budget = budget;
  saveCurrentData(data);
  closeModal("modal-budget");
  renderFinance();
  toast("预算已保存", "success");
}

function exportFinanceCSV() {
  const data = getCurrentData();
  if (data.transactions.length === 0) { toast("暂无账单可导出", "error"); return; }
  let csv = "\uFEFF日期,类型,分类,金额,备注\n";
  data.transactions.slice().sort((a,b) => a.date.localeCompare(b.date)).forEach(t => {
    const cat = getCategoryById(t.category);
    csv += t.date + "," + (t.type === "expense" ? "支出" : "收入") + "," + cat.name + "," + t.amount + "," + (t.note || "") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "账单_" + getTodayStr() + ".csv";
  a.click();
  URL.revokeObjectURL(url);
  toast("CSV已导出", "success");
}

// ========== 仪表盘 ==========
function renderDashboard() {
  const data = getCurrentData();
  const now = new Date();
  const thisMonth = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0");

  // 统计
  const totalGPA = calcGPA(data.courses, state.gpaAlgorithm);
  const activeCountdowns = data.countdowns.filter(c => !c.done);
  const urgent = activeCountdowns.filter(c => { const info = getCountdownInfo(c); return info.days <= 7 && info.days >= 0; }).length;
  const monthExpense = data.transactions.filter(t => t.date.startsWith(thisMonth) && t.type === "expense").reduce((s,t) => s + Number(t.amount), 0);
  const budget = data.budget || 0;
  const budgetPercent = budget > 0 ? Math.min(100, (monthExpense / budget) * 100) : 0;

  // 作息统计
  const today = schedTodayIndex();
  const todayEvents = (data.scheduleEvents || []).filter(e => e.day === today);
  const todayDone = todayEvents.filter(e => e.done).length;
  const todayPercent = todayEvents.length ? Math.round(todayDone / todayEvents.length * 100) : 0;
  const habitDone = (data.habits || []).filter(h => h.done).length;
  const habitTotal = (data.habits || []).length;

  $("dashboard-stats").innerHTML =
    '<div class="stat-card primary"><div class="stat-label">当前 GPA</div><div class="stat-value">' + totalGPA.toFixed(2) + '</div><div class="stat-trend up">' + data.courses.length + ' 门课程</div></div>' +
    '<div class="stat-card danger"><div class="stat-label">待办倒计时</div><div class="stat-value">' + activeCountdowns.length + '<small>个</small></div>' + (urgent > 0 ? '<div class="stat-trend down">' + urgent + ' 个7天内</div>' : '<div class="stat-trend up">暂无紧急</div>') + '</div>' +
    '<div class="stat-card warning"><div class="stat-label">本月支出</div><div class="stat-value">' + monthExpense.toFixed(0) + '<small>元</small></div><div class="stat-trend ' + (budgetPercent >= 80 ? "down" : "up") + '">预算 ' + budgetPercent.toFixed(0) + '%</div></div>' +
    '<div class="stat-card success"><div class="stat-label">今日安排</div><div class="stat-value">' + todayEvents.length + '<small>项</small></div><div class="stat-trend ' + (todayPercent >= 50 ? "up" : "down") + '">完成 ' + todayPercent + '% · 习惯 ' + habitDone + '/' + habitTotal + '</div></div>';

  // 即将到来
  const upcoming = activeCountdowns.filter(c => !getCountdownInfo(c).isPast).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
  if (upcoming.length === 0) {
    $("dashboard-upcoming").innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-desc">暂无即将到来的事件</div></div>';
  } else {
    const colors = { high: "#E17055", mid: "#FDCB6E", low: "#00B894" };
    $("dashboard-upcoming").innerHTML = upcoming.map(c => {
      const info = getCountdownInfo(c);
      const cat = COUNTDOWN_CATEGORIES[c.category] || COUNTDOWN_CATEGORIES.other;
      return '<div class="recent-item" onclick="switchView(\'countdown\')" style="cursor:pointer;">' +
        '<div class="recent-dot" style="background:' + colors[c.priority] + ';"></div>' +
        '<div class="recent-text">' + escapeHtml(c.name) + ' <span style="color:var(--text-3);font-size:11px;">(' + cat.name + ')</span></div>' +
        '<div class="recent-time" style="color:' + (info.days <= 3 ? "var(--danger)" : "var(--text-2)") + ';font-weight:700;">' + (info.days === 0 ? "今天" : info.days + "天") + '</div>' +
      '</div>';
    }).join("");
  }

  // 最近动态
  const recent = [];
  data.courses.slice(-3).reverse().forEach(c => recent.push({ type: "gpa", text: "添加课程：" + c.name + "（" + c.score + "分）", time: c.createdAt }));
  data.countdowns.slice(-3).reverse().forEach(c => recent.push({ type: "countdown", text: "添加倒计时：" + c.name, time: c.createdAt }));
  data.transactions.slice(-3).reverse().forEach(t => {
    const cat = getCategoryById(t.category);
    recent.push({ type: "finance", text: (t.type === "expense" ? "支出" : "收入") + "：" + (t.note || cat.name) + " ¥" + t.amount, time: t.createdAt });
  });
  (data.scheduleEvents || []).slice(-3).reverse().forEach(e => {
    recent.push({ type: "schedule", text: (e.done ? "完成安排" : "添加安排") + "：" + e.title, time: e.createdAt || Date.now() });
  });
  recent.sort((a,b) => (b.time || 0) - (a.time || 0));
  const recentShow = recent.slice(0, 8);

  if (recentShow.length === 0) {
    $("dashboard-recent").innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-desc">暂无动态，开始使用各个功能吧</div></div>';
  } else {
    const typeColors = { gpa: "#6C5CE7", countdown: "#E17055", finance: "#00B894", schedule: "#FD79A8" };
    $("dashboard-recent").innerHTML = recentShow.map(r => {
      const d = new Date(r.time || Date.now());
      const timeStr = (d.getMonth()+1) + "/" + d.getDate() + " " + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
      return '<div class="recent-item">' +
        '<div class="recent-dot" style="background:' + typeColors[r.type] + ';"></div>' +
        '<div class="recent-text">' + escapeHtml(r.text) + '</div>' +
        '<div class="recent-time">' + timeStr + '</div>' +
      '</div>';
    }).join("");
  }
}

// ========== 数据管理 ==========
function showDataManager() { showModal("modal-data-manager"); }

function exportData() {
  const data = getCurrentData();
  const profile = state.profiles.find(p => p.id === state.currentProfileId);
  const exportObj = { version: "1.0", profile: profile, data: data, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "DanDanTable备份_" + (profile ? profile.name : "") + "_" + getTodayStr() + ".json";
  a.click();
  URL.revokeObjectURL(url);
  toast("数据已导出", "success");
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const obj = JSON.parse(e.target.result);
      if (!obj.data) { toast("无效的备份文件", "error"); return; }
      if (!confirm("导入将覆盖当前档案的所有数据，确定继续吗？")) return;
      saveCurrentData(obj.data);
      state.gpaAlgorithm = obj.data.gpaAlgorithm || "standard4";
      $("gpa-algorithm").value = state.gpaAlgorithm;
      renderAll();
      closeModal("modal-data-manager");
      toast("数据导入成功", "success");
    } catch(err) {
      toast("文件解析失败", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function clearAllData() {
  if (!confirm("确定要清除当前档案的所有数据吗？此操作不可恢复！")) return;
  if (!confirm("再次确认：所有课程、倒计时、账单都将被删除！")) return;
  const data = { courses: [], semesters: getCurrentData().semesters, countdowns: [], transactions: [], budget: 2000, gpaAlgorithm: state.gpaAlgorithm };
  saveCurrentData(data);
  renderAll();
  closeModal("modal-data-manager");
  toast("数据已清除", "success");
}

// ========== 窗口大小变化 ==========
window.addEventListener("resize", () => {
  Object.values(state.charts).forEach(c => { if (c) c.resize(); });
});

// ========== 粒子背景 ==========
function initParticles() {
  const container = $("bg-particles");
  if (!container) return;
  const colors = ["#6C5CE7", "#00B894", "#FD79A8", "#00B894", "#FDCB6E"];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDelay = Math.random() * 15 + "s";
    p.style.animationDuration = (10 + Math.random() * 15) + "s";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = (2 + Math.random() * 4) + "px";
    p.style.height = p.style.width;
    p.style.opacity = 0.3 + Math.random() * 0.4;
    container.appendChild(p);
  }
}

// ========== 初始化 ==========
function init() {
  initParticles();
  loadProfiles();
  applyTheme();

  if (state.currentProfileId && state.profiles.find(p => p.id === state.currentProfileId)) {
    // 有上次使用的档案，直接进入
    enterProfile(state.currentProfileId);
  } else {
    // 显示欢迎页
    renderWelcomeProfiles();
  }

  // 每分钟更新倒计时
  setInterval(() => {
    if (state.currentProfileId && state.currentView === "plan") renderPlan();
  }, 60000);
}

// 暴露函数到全局（供onclick调用）
window.enterProfile = enterProfile;
window.showCreateProfile = showCreateProfile;
window.createProfile = createProfile;
window.selectAvatarColor = selectAvatarColor;
window.showProfileManager = showProfileManager;
window.deleteProfile = deleteProfile;
window.switchView = switchView;
window.switchTheme = switchTheme;
window.selectSemester = selectSemester;
window.addSemester = addSemester;
window.changeGpaAlgorithm = changeGpaAlgorithm;
window.showAddCourse = showAddCourse;
window.editCourse = editCourse;
window.saveCourse = saveCourse;
window.deleteCourse = deleteCourse;
window.toggleCountdownFilter = toggleCountdownFilter;
window.showAddCountdown = showAddCountdown;
window.editCountdown = editCountdown;
window.saveCountdown = saveCountdown;
window.toggleCountdownDone = toggleCountdownDone;
window.deleteCountdown = deleteCountdown;
window.filterTransactions = filterTransactions;
window.setTxType = setTxType;
window.selectCategory = selectCategory;
window.showAddTransaction = showAddTransaction;
window.saveTransaction = saveTransaction;
window.deleteTransaction = deleteTransaction;
window.showBudgetSetting = showBudgetSetting;
window.saveBudget = saveBudget;
window.exportFinanceCSV = exportFinanceCSV;
window.showDataManager = showDataManager;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.closeModal = closeModal;
// 作息相关函数
window.showAddScheduleEvent = showAddScheduleEvent;
window.editScheduleEvent = editScheduleEvent;
window.saveScheduleEvent = saveScheduleEvent;
window.deleteScheduleEvent = deleteScheduleEvent;
window.toggleScheduleDone = toggleScheduleDone;
window.switchScheduleDay = switchScheduleDay;
window.selectScheduleCategory = selectScheduleCategory;
window.renderPlan = renderPlan;
window.selectPlanDay = selectPlanDay;
window.switchScheduleDayTabs = switchScheduleDayTabs;
window.toggleHabit = toggleHabit;
window.showAddHabit = showAddHabit;
window.logWater = logWater;
window.logSleep = logSleep;
window.logMood = logMood;
window.logExercise = logExercise;

init();

})();
