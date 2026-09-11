import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 优化1: CSS移动端性能降级 ==========
# 在</style>前添加移动端优化CSS
mobile_css = '''
/* ===== Mobile Performance Optimization ===== */
@media (max-width: 768px) {
  /* 减少阴影，提升渲染性能 */
  .card, .stat-card, .quick-action, .modal, .welcome-card, .toast {
    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
  }
  
  /* 移除毛玻璃效果（非常耗性能） */
  .modal-overlay {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  
  /* 减少过渡动画 */
  * {
    transition-duration: 0.1s !important;
    animation-duration: 0.15s !important;
  }
  
  /* 禁用hover效果（移动端不需要） */
  .nav-item:hover, .quick-action:hover, .stat-card:hover, 
  .list-item:hover, .btn:hover, .icon-btn:hover {
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* 优化滚动性能 */
  .main, .sidebar-nav, .modal {
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
  }
  
  /* 减少图表容器高度 */
  .chart-container { height: 220px !important; }
  .chart-container.small { height: 180px !important; }
  .chart-container.tiny { height: 100px !important; }
  
  /* 禁用文字选中高亮闪烁 */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  
  /* 优化按钮点击反馈 */
  .btn:active, .nav-item:active, .quick-action:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

/* 低端设备降级 */
@media (max-width: 768px) and (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
'''

content = content.replace('</style>', mobile_css + '\n</style>')
print('✓ CSS移动端性能优化已添加')

# ========== 优化2: JS性能优化 ==========
# 在<script>后添加性能优化工具函数
perf_js = '''
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
'''

content = content.replace('<script>', '<script>\n' + perf_js)
print('✓ JS性能优化工具函数已添加')

# ========== 优化3: 替换switchView函数，添加图表管理 ==========
old_switch = '''function switchView(view) {
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
  });'''

new_switch = '''function switchView(view) {
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
  });'''

content = content.replace(old_switch, new_switch)
print('✓ switchView函数已优化（添加图表销毁）')

# ========== 优化4: resize事件防抖 ==========
old_resize = '''  // 窗口大小变化时重绘图表
  window.addEventListener('resize', () => {
    Object.values(state.charts).forEach(chart => {
      if (chart && chart.resize) chart.resize();
    });
  });'''

new_resize = '''  // 窗口大小变化时重绘图表（防抖）
  window.addEventListener('resize', debounce(() => {
    Object.values(state.charts).forEach(chart => {
      if (chart && chart.resize) {
        try { chart.resize(); } catch(e) {}
      }
    });
  }, 200));'''

content = content.replace(old_resize, new_resize)
print('✓ resize事件已防抖')

# ========== 优化5: setInterval优化，只在可见时更新 ==========
old_interval = '''  // 每分钟更新倒计时
  setInterval(() => {
    if (state.currentProfileId && state.currentView === 'countdown') {
      renderCountdown();
    }
  }, 60000);'''

new_interval = '''  // 每分钟更新倒计时（仅在页面可见时）
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
  });'''

content = content.replace(old_interval, new_interval)
print('✓ setInterval已优化（页面可见性检测）')

# 保存优化后的文件
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 性能优化完成，文件大小: {len(content)} 字节')
