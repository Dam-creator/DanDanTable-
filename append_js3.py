import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index_new.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# JavaScript代码 - 第三部分：倒计时、记账、作息、初始化
js_part3 = '''
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
  // 趋势图
  const trendEl = $("finance-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    if (state.charts.financeTrend) state.charts.financeTrend.dispose();
    const chart = echarts.init(trendEl);
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
    if (state.charts.financeCat) state.charts.financeCat.dispose();
    const chart = echarts.init(catEl);
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
  let csv = "日期,类型,分类,金额,备注\\n";
  data.transactions.forEach(t => {
    const cats = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const cat = cats.find(c => c.id === t.category)?.name || t.category;
    csv += `${t.date},${t.type === 'income' ? '收入' : '支出'},${cat},${t.amount},${t.note || ''}\\n`;
  });
  const blob = new Blob(["\\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
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
'''

content += js_part3
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'已追加JS第三部分，当前大小: {len(content)} 字节')
