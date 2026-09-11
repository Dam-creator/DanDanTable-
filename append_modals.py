import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index_new.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# 追加模态框
modals_html = '''
<!-- ===== Modals ===== -->
<!-- 创建档案 -->
<div class="modal-overlay" id="modal-create-profile">
  <div class="modal">
    <h2 class="modal-title">创建新档案</h2>
    <p class="modal-desc">设置你的用户名和昵称，开始使用DanDanTable</p>
    <div class="form-group">
      <label class="form-label">用户名（唯一标识）</label>
      <input type="text" class="form-input" id="new-profile-username" placeholder="输入用户名，如：dandan2024" maxlength="20">
    </div>
    <div class="form-group">
      <label class="form-label">昵称（显示名称）</label>
      <input type="text" class="form-input" id="new-profile-name" placeholder="输入昵称，如：蛋蛋同学" maxlength="20">
    </div>
    <div class="form-group">
      <label class="form-label">选择头像颜色</label>
      <div class="avatar-colors" id="avatar-colors"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-create-profile')">取消</button>
      <button class="btn btn-primary" onclick="createProfile()">创建档案</button>
    </div>
  </div>
</div>

<!-- 添加课程 -->
<div class="modal-overlay" id="modal-add-course">
  <div class="modal">
    <h2 class="modal-title" id="course-modal-title">添加课程</h2>
    <p class="modal-desc">录入课程信息，自动计算绩点</p>
    <div class="form-group">
      <label class="form-label">课程名称</label>
      <input type="text" class="form-input" id="course-name" placeholder="如：高等数学">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">学分</label>
        <input type="number" class="form-input" id="course-credit" step="0.5" min="0.5" max="10" placeholder="3.0">
      </div>
      <div class="form-group">
        <label class="form-label">成绩</label>
        <input type="number" class="form-input" id="course-score" step="0.5" min="0" max="100" placeholder="85">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">课程类型</label>
        <select class="form-select" id="course-type">
          <option value="required">必修</option>
          <option value="elective">选修</option>
          <option value="general">通识</option>
          <option value="practice">实践</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">所属学期</label>
        <select class="form-select" id="course-semester"></select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-add-course')">取消</button>
      <button class="btn btn-primary" onclick="saveCourse()">保存</button>
    </div>
  </div>
</div>

<!-- 添加倒计时 -->
<div class="modal-overlay" id="modal-add-countdown">
  <div class="modal">
    <h2 class="modal-title" id="countdown-modal-title">添加倒计时</h2>
    <p class="modal-desc">记录重要考试和截止日期</p>
    <div class="form-group">
      <label class="form-label">名称</label>
      <input type="text" class="form-input" id="countdown-name" placeholder="如：高等数学期末考试">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">日期</label>
        <input type="date" class="form-input" id="countdown-date">
      </div>
      <div class="form-group">
        <label class="form-label">时间</label>
        <input type="time" class="form-input" id="countdown-time" value="09:00">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">分类</label>
        <select class="form-select" id="countdown-category">
          <option value="exam">考试</option>
          <option value="assignment">作业</option>
          <option value="project">项目</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">优先级</label>
        <select class="form-select" id="countdown-priority">
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">备注（可选）</label>
      <textarea class="form-textarea" id="countdown-note" rows="2" placeholder="添加备注..."></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-add-countdown')">取消</button>
      <button class="btn btn-primary" onclick="saveCountdown()">保存</button>
    </div>
  </div>
</div>

<!-- 添加交易 -->
<div class="modal-overlay" id="modal-add-transaction">
  <div class="modal">
    <h2 class="modal-title" id="transaction-modal-title">记一笔</h2>
    <p class="modal-desc">记录你的收入和支出</p>
    <div class="form-group">
      <label class="form-label">类型</label>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-primary" id="tx-type-expense" onclick="setTxType('expense')" style="flex:1;">支出</button>
        <button class="btn btn-ghost" id="tx-type-income" onclick="setTxType('income')" style="flex:1;">收入</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">金额</label>
        <input type="number" class="form-input" id="tx-amount" step="0.01" min="0" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">日期</label>
        <input type="date" class="form-input" id="tx-date">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">分类</label>
      <select class="form-select" id="tx-category"></select>
    </div>
    <div class="form-group">
      <label class="form-label">备注（可选）</label>
      <input type="text" class="form-input" id="tx-note" placeholder="添加备注...">
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-add-transaction')">取消</button>
      <button class="btn btn-primary" onclick="saveTransaction()">保存</button>
    </div>
  </div>
</div>

<!-- 预算设置 -->
<div class="modal-overlay" id="modal-budget">
  <div class="modal">
    <h2 class="modal-title">预算设置</h2>
    <p class="modal-desc">设置每月各分类的预算上限</p>
    <div id="budget-settings-list"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-budget')">取消</button>
      <button class="btn btn-primary" onclick="saveBudget()">保存</button>
    </div>
  </div>
</div>

<!-- 添加安排 -->
<div class="modal-overlay" id="modal-schedule-event">
  <div class="modal">
    <h2 class="modal-title" id="schedule-modal-title">添加安排</h2>
    <p class="modal-desc">规划你的作息时间</p>
    <div class="form-group">
      <label class="form-label">标题</label>
      <input type="text" class="form-input" id="schedule-title" placeholder="如：晨读英语">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">开始时间</label>
        <input type="time" class="form-input" id="schedule-start">
      </div>
      <div class="form-group">
        <label class="form-label">结束时间</label>
        <input type="time" class="form-input" id="schedule-end">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">分类</label>
      <div id="schedule-category-list" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
    </div>
    <div class="form-group">
      <label class="form-label">重复</label>
      <select class="form-select" id="schedule-repeat">
        <option value="once">仅一次</option>
        <option value="daily">每天</option>
        <option value="weekday">工作日</option>
        <option value="weekend">周末</option>
        <option value="custom">自定义</option>
      </select>
    </div>
    <div class="form-group" id="schedule-days-group" style="display:none;">
      <label class="form-label">选择星期</label>
      <div id="schedule-days-list" style="display:flex;gap:8px;"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-schedule-event')">取消</button>
      <button class="btn btn-primary" onclick="saveScheduleEvent()">保存</button>
    </div>
  </div>
</div>

<!-- 数据管理 -->
<div class="modal-overlay" id="modal-data-manager">
  <div class="modal" style="max-width:600px;">
    <h2 class="modal-title">数据管理</h2>
    <p class="modal-desc">导出、导入或清除你的数据</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <button class="btn btn-primary" onclick="exportData()" style="flex-direction:column;padding:20px;">
        <svg viewBox="0 0 24 24" style="width:32px;height:32px;margin-bottom:8px;"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        导出数据
      </button>
      <button class="btn btn-warning" onclick="document.getElementById('import-file').click()" style="flex-direction:column;padding:20px;">
        <svg viewBox="0 0 24 24" style="width:32px;height:32px;margin-bottom:8px;"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
        导入数据
      </button>
    </div>
    <input type="file" id="import-file" accept=".json" style="display:none;" onchange="importData(event)">
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:16px;">
      <div style="font-weight:600;color:#991b1b;margin-bottom:8px;">危险操作</div>
      <button class="btn btn-danger" onclick="clearAllData()">清除所有数据</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-data-manager')">关闭</button>
    </div>
  </div>
</div>

<!-- 档案管理 -->
<div class="modal-overlay" id="modal-profile-manager">
  <div class="modal">
    <h2 class="modal-title">档案管理</h2>
    <p class="modal-desc">管理你的用户档案</p>
    <div id="profile-manager-list" style="max-height:300px;overflow-y:auto;margin-bottom:16px;"></div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="showCreateProfile();closeModal('modal-profile-manager')">创建新档案</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-profile-manager')">关闭</button>
    </div>
  </div>
</div>

<!-- 自定义GPA（动态生成） -->
<div class="modal-overlay" id="modal-custom-gpa">
  <div class="modal" style="max-width:500px;max-height:80vh;overflow-y:auto;">
    <h2 class="modal-title">自定义GPA算法</h2>
    <p class="modal-desc">设置每个分数段对应的GPA值</p>
    <div id="custom-gpa-ranges"></div>
    <button class="btn btn-ghost" style="width:100%;margin-top:12px;" onclick="addCustomGPARange()">+ 添加分数段</button>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeCustomGPAModal()">取消</button>
      <button class="btn btn-primary" onclick="saveCustomGPASettings()">保存</button>
    </div>
  </div>
</div>

<!-- 健康记录 -->
<div class="modal-overlay" id="modal-health-record">
  <div class="modal">
    <h2 class="modal-title">健康记录</h2>
    <p class="modal-desc">记录你的健康数据</p>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">体重(kg)</label>
        <input type="number" class="form-input" id="health-weight" step="0.1" placeholder="60.0">
      </div>
      <div class="form-group">
        <label class="form-label">睡眠(小时)</label>
        <input type="number" class="form-input" id="health-sleep" step="0.5" placeholder="8.0">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">饮水量(ml)</label>
        <input type="number" class="form-input" id="health-water" placeholder="2000">
      </div>
      <div class="form-group">
        <label class="form-label">运动(分钟)</label>
        <input type="number" class="form-input" id="health-exercise" placeholder="30">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">心情</label>
      <select class="form-select" id="health-mood">
        <option value="great">非常好</option>
        <option value="good">好</option>
        <option value="normal">一般</option>
        <option value="bad">差</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-health-record')">取消</button>
      <button class="btn btn-primary" onclick="saveHealthRecord()">保存</button>
    </div>
  </div>
</div>

<script>
'''

content += modals_html
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'已追加模态框HTML，当前大小: {len(content)} 字节')
