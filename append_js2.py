import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index_new.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# JavaScript代码 - 第二部分：档案管理和GPA
js_part2 = '''
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
  // 趋势图
  const trendEl = $("gpa-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    if (state.charts.gpaTrend) state.charts.gpaTrend.dispose();
    const chart = echarts.init(trendEl);
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
    if (state.charts.gpaDist) state.charts.gpaDist.dispose();
    const chart = echarts.init(distEl);
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
'''

content += js_part2
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'已追加JS第二部分，当前大小: {len(content)} 字节')
