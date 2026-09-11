import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index_new.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# 追加各个视图
views_html = '''
    <!-- ===== View: Dashboard ===== -->
    <div class="view active" id="view-dashboard">
      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="quick-action" onclick="switchView('gpa');setTimeout(()=>showAddCourse(),300)">
          <div class="quick-action-icon" style="background:linear-gradient(135deg,var(--green),var(--green-dark))">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <div class="quick-action-label">添加课程</div>
        </button>
        <button class="quick-action" onclick="switchView('countdown');setTimeout(()=>showAddCountdown(),300)">
          <div class="quick-action-icon" style="background:linear-gradient(135deg,var(--yellow),var(--yellow-dark))">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <div class="quick-action-label">添加倒计时</div>
        </button>
        <button class="quick-action" onclick="switchView('finance');setTimeout(()=>showAddTransaction(),300)">
          <div class="quick-action-icon" style="background:linear-gradient(135deg,var(--blue),var(--blue-dark))">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <div class="quick-action-label">记一笔</div>
        </button>
        <button class="quick-action" onclick="switchView('plan')">
          <div class="quick-action-icon" style="background:linear-gradient(135deg,var(--purple),var(--purple-dark))">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <div class="quick-action-label">规划中心</div>
        </button>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card green">
          <div class="stat-card-header">
            <span class="stat-card-label">当前GPA</span>
            <span class="stat-card-change up" id="dashboard-gpa-change">--</span>
          </div>
          <div class="stat-card-value" id="dashboard-gpa">--</div>
          <div class="stat-card-desc" id="dashboard-gpa-desc">暂无课程数据</div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-card-header">
            <span class="stat-card-label">近期考试</span>
            <span class="stat-card-change up" id="dashboard-countdown-change">--</span>
          </div>
          <div class="stat-card-value" id="dashboard-countdown">--</div>
          <div class="stat-card-desc" id="dashboard-countdown-desc">暂无倒计时</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-card-header">
            <span class="stat-card-label">本月收支</span>
            <span class="stat-card-change" id="dashboard-finance-change">--</span>
          </div>
          <div class="stat-card-value" id="dashboard-finance">--</div>
          <div class="stat-card-desc" id="dashboard-finance-desc">暂无记账数据</div>
        </div>
      </div>
      
      <!-- Content Grid -->
      <div class="content-grid">
        <div>
          <!-- GPA Trend Chart -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">GPA趋势</div>
                <div class="card-subtitle">各学期GPA变化</div>
              </div>
              <button class="card-action" onclick="switchView('gpa')">查看详情</button>
            </div>
            <div class="chart-container" id="dashboard-gpa-chart"></div>
          </div>
          
          <!-- Recent Countdowns -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">近期考试</div>
                <div class="card-subtitle">即将到来的考试和截止日期</div>
              </div>
              <button class="card-action" onclick="switchView('countdown')">全部</button>
            </div>
            <div id="dashboard-countdown-list"></div>
          </div>
        </div>
        
        <div>
          <!-- Finance Overview -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">收支概览</div>
                <div class="card-subtitle">本月收支情况</div>
              </div>
              <button class="card-action" onclick="switchView('finance')">详情</button>
            </div>
            <div class="chart-container small" id="dashboard-finance-chart"></div>
          </div>
          
          <!-- Today's Schedule -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">今日安排</div>
                <div class="card-subtitle" id="dashboard-today-date">今天</div>
              </div>
              <button class="card-action" onclick="switchView('plan')">规划中心</button>
            </div>
            <div id="dashboard-today-list"></div>
          </div>
          
          <!-- Quick Stats -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">数据统计</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--green-dark)" id="stat-courses">0</div>
                <div style="font-size:11px;color:var(--text-3)">已修课程</div>
              </div>
              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--yellow-dark)" id="stat-exams">0</div>
                <div style="font-size:11px;color:var(--text-3)">考试倒计时</div>
              </div>
              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--blue-dark)" id="stat-transactions">0</div>
                <div style="font-size:11px;color:var(--text-3)">记账记录</div>
              </div>
              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--purple-dark)" id="stat-schedules">0</div>
                <div style="font-size:11px;color:var(--text-3)">作息安排</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ===== View: GPA ===== -->
    <div class="view" id="view-gpa">
      <div class="stats-grid">
        <div class="stat-card green">
          <div class="stat-card-header">
            <span class="stat-card-label">总GPA</span>
            <span class="stat-card-change up" id="gpa-total-change">4.0制</span>
          </div>
          <div class="stat-card-value" id="gpa-total">--</div>
          <div class="stat-card-desc" id="gpa-total-desc">加权平均绩点</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-card-header">
            <span class="stat-card-label">已修学分</span>
            <span class="stat-card-change up">学分</span>
          </div>
          <div class="stat-card-value" id="gpa-credits">0</div>
          <div class="stat-card-desc">累计已修学分</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-card-header">
            <span class="stat-card-label">课程数量</span>
            <span class="stat-card-change up">门</span>
          </div>
          <div class="stat-card-value" id="gpa-courses-count">0</div>
          <div class="stat-card-desc">已录入课程总数</div>
        </div>
      </div>
      
      <div class="content-grid">
        <div>
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">课程列表</div>
                <div class="card-subtitle">
                  <select class="form-select" style="width:auto;display:inline-block;padding:6px 12px;font-size:12px;" id="gpa-semester-select" onchange="selectSemester(this.value)"></select>
                  <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px;margin-left:8px;" onclick="addSemester()">+ 学期</button>
                </div>
              </div>
              <button class="btn btn-primary" onclick="showAddCourse()">
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                添加课程
              </button>
            </div>
            <div id="gpa-courses-list"></div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div class="card-title">GPA趋势图</div>
              <button class="card-action" onclick="showCustomGPASettings()">自定义算法</button>
            </div>
            <div class="chart-container" id="gpa-trend-chart"></div>
          </div>
        </div>
        
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title">算法设置</div>
            </div>
            <div id="gpa-algorithm-list"></div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div class="card-title">成绩分布</div>
            </div>
            <div class="chart-container small" id="gpa-distribution-chart"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ===== View: Countdown ===== -->
    <div class="view" id="view-countdown">
      <div class="stats-grid">
        <div class="stat-card yellow">
          <div class="stat-card-header">
            <span class="stat-card-label">进行中</span>
            <span class="stat-card-change up">个</span>
          </div>
          <div class="stat-card-value" id="countdown-active">0</div>
          <div class="stat-card-desc">未完成的倒计时</div>
        </div>
        <div class="stat-card pink">
          <div class="stat-card-header">
            <span class="stat-card-label">紧急</span>
            <span class="stat-card-change down">7天内</span>
          </div>
          <div class="stat-card-value" id="countdown-urgent">0</div>
          <div class="stat-card-desc">一周内到期</div>
        </div>
        <div class="stat-card teal">
          <div class="stat-card-header">
            <span class="stat-card-label">已完成</span>
            <span class="stat-card-change up">个</span>
          </div>
          <div class="stat-card-value" id="countdown-done">0</div>
          <div class="stat-card-desc">已完成的倒计时</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">考试倒计时</div>
            <div class="card-subtitle">
              <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px;" onclick="toggleCountdownFilter('all')">全部</button>
              <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px;margin-left:4px;" onclick="toggleCountdownFilter('active')">进行中</button>
              <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px;margin-left:4px;" onclick="toggleCountdownFilter('done')">已完成</button>
            </div>
          </div>
          <button class="btn btn-primary" onclick="showAddCountdown()">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            添加倒计时
          </button>
        </div>
        <div id="countdown-list"></div>
      </div>
    </div>
    
    <!-- ===== View: Finance ===== -->
    <div class="view" id="view-finance">
      <div class="stats-grid">
        <div class="stat-card green">
          <div class="stat-card-header">
            <span class="stat-card-label">本月收入</span>
            <span class="stat-card-change up">收入</span>
          </div>
          <div class="stat-card-value" id="finance-income">¥0</div>
          <div class="stat-card-desc">本月总收入</div>
        </div>
        <div class="stat-card pink">
          <div class="stat-card-header">
            <span class="stat-card-label">本月支出</span>
            <span class="stat-card-change down">支出</span>
          </div>
          <div class="stat-card-value" id="finance-expense">¥0</div>
          <div class="stat-card-desc">本月总支出</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-card-header">
            <span class="stat-card-label">本月结余</span>
            <span class="stat-card-change">结余</span>
          </div>
          <div class="stat-card-value" id="finance-balance">¥0</div>
          <div class="stat-card-desc">收入 - 支出</div>
        </div>
      </div>
      
      <div class="content-grid">
        <div>
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">交易记录</div>
                <div class="card-subtitle">
                  <select class="form-select" style="width:auto;display:inline-block;padding:6px 12px;font-size:12px;" id="finance-filter" onchange="filterTransactions(this.value)">
                    <option value="all">全部</option>
                    <option value="income">收入</option>
                    <option value="expense">支出</option>
                  </select>
                </div>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-ghost" onclick="exportFinanceCSV()">导出</button>
                <button class="btn btn-primary" onclick="showAddTransaction()">
                  <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  记一笔
                </button>
              </div>
            </div>
            <div id="finance-transactions-list"></div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div class="card-title">收支趋势</div>
              <button class="card-action" onclick="showBudgetSetting()">预算设置</button>
            </div>
            <div class="chart-container" id="finance-trend-chart"></div>
          </div>
        </div>
        
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title">支出分类</div>
            </div>
            <div class="chart-container small" id="finance-category-chart"></div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div class="card-title">本月预算</div>
            </div>
            <div id="finance-budget-list"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ===== View: Plan ===== -->
    <div class="view" id="view-plan">
      <div class="stats-grid">
        <div class="stat-card purple">
          <div class="stat-card-header">
            <span class="stat-card-label">今日安排</span>
            <span class="stat-card-change up">项</span>
          </div>
          <div class="stat-card-value" id="plan-today-count">0</div>
          <div class="stat-card-desc">今日待完成安排</div>
        </div>
        <div class="stat-card green">
          <div class="stat-card-header">
            <span class="stat-card-label">已完成</span>
            <span class="stat-card-change up">项</span>
          </div>
          <div class="stat-card-value" id="plan-done-count">0</div>
          <div class="stat-card-desc">本周已完成安排</div>
        </div>
        <div class="stat-card teal">
          <div class="stat-card-header">
            <span class="stat-card-label">完成率</span>
            <span class="stat-card-change up">%</span>
          </div>
          <div class="stat-card-value" id="plan-completion-rate">0%</div>
          <div class="stat-card-desc">本周安排完成率</div>
        </div>
      </div>
      
      <div class="content-grid">
        <div>
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">作息总表</div>
                <div class="card-subtitle">
                  <div id="plan-day-tabs" style="display:flex;gap:6px;margin-top:8px;"></div>
                </div>
              </div>
              <button class="btn btn-primary" onclick="showAddScheduleEvent()">
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                添加安排
              </button>
            </div>
            <div id="plan-schedule-list"></div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div class="card-title">本周统计</div>
            </div>
            <div class="chart-container" id="plan-weekly-chart"></div>
          </div>
        </div>
        
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title">今日作息</div>
              <button class="card-action" id="plan-today-date-label">今天</button>
            </div>
            <div id="plan-today-timeline"></div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div class="card-title">习惯打卡</div>
            </div>
            <div id="plan-habits-list"></div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div class="card-title">健康记录</div>
              <button class="card-action" onclick="showHealthRecord()">记录</button>
            </div>
            <div id="plan-health-list"></div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- ===== Bottom Nav (Mobile) ===== -->
<div class="bottom-nav">
  <button class="bottom-nav-item active" data-view="dashboard" onclick="switchView('dashboard')">
    <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
    仪表盘
  </button>
  <button class="bottom-nav-item" data-view="gpa" onclick="switchView('gpa')">
    <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
    GPA
  </button>
  <button class="bottom-nav-item" data-view="countdown" onclick="switchView('countdown')">
    <svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
    倒计时
  </button>
  <button class="bottom-nav-item" data-view="finance" onclick="switchView('finance')">
    <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
    记账
  </button>
  <button class="bottom-nav-item" data-view="plan" onclick="switchView('plan')">
    <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
    规划
  </button>
</div>

<!-- ===== Toast Container ===== -->
<div class="toast-container" id="toast-container"></div>
'''

content += views_html
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'已追加视图HTML，当前大小: {len(content)} 字节')
