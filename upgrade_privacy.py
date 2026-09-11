import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 1. 在登录页添加隐私声明 ==========
old_welcome_end = '''    <button class="btn btn-primary btn-block" onclick="showCreateProfile()">
      <svg viewBox="0 0 24 24"><path d="M15 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm9-.44S17 5 12 5 4 9 4 11.56V17c0 .55.45.98.98.98h1.83c.53 0 .99-.44 1.03-.97l.27-3.15c.02-.18.18-.31.36-.31h7.06c.18 0 .34.13.36.31l.27 3.15c.04.53.5.97 1.03.97h1.83c.53 0 .98-.43.98-.98v-5.44z"/></svg>
      创建新档案
    </button>
  </div>
</div>'''

new_welcome_end = '''    <button class="btn btn-primary btn-block" onclick="showCreateProfile()">
      <svg viewBox="0 0 24 24"><path d="M15 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm9-.44S17 5 12 5 4 9 4 11.56V17c0 .55.45.98.98.98h1.83c.53 0 .99-.44 1.03-.97l.27-3.15c.02-.18.18-.31.36-.31h7.06c.18 0 .34.13.36.31l.27 3.15c.04.53.5.97 1.03.97h1.83c.53 0 .98-.43.98-.98v-5.44z"/></svg>
      创建新档案
    </button>
    
    <!-- 隐私声明 -->
    <div class="privacy-notice">
      <div class="privacy-icon">
        <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
      </div>
      <div class="privacy-content">
        <div class="privacy-title">隐私保护声明</div>
        <div class="privacy-text">
          您的所有数据（课程、成绩、账单、作息等）均<strong>仅存储在您当前使用的浏览器本地</strong>（localStorage），<strong>不会上传到任何服务器</strong>。服务提供方<strong>无法查看、收集或访问</strong>您的任何个人数据。清除浏览器数据或更换设备将导致数据丢失，请定期使用「数据管理」中的导出功能进行备份。
        </div>
      </div>
    </div>
  </div>
</div>'''

content = content.replace(old_welcome_end, new_welcome_end)
print('✓ 登录页隐私声明已添加')

# ========== 2. 添加隐私声明CSS ==========
privacy_css = '''
/* ===== Privacy Notice ===== */
.privacy-notice {
  margin-top: 24px;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent-green-light), var(--accent-teal-light));
  border-radius: var(--radius-md);
  border: 1px solid rgba(138, 184, 138, 0.2);
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.privacy-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-green), var(--accent-teal-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(138, 184, 138, 0.3);
}

.privacy-icon svg {
  width: 18px;
  height: 18px;
  fill: #fff;
}

.privacy-content {
  flex: 1;
  min-width: 0;
}

.privacy-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-green-dark);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.privacy-text {
  font-size: 11px;
  color: var(--text-2);
  line-height: 1.7;
}

.privacy-text strong {
  color: var(--accent-green-dark);
  font-weight: 600;
}
'''

# 在</style>前添加隐私声明CSS
content = content.replace('</style>', privacy_css + '\n</style>')
print('✓ 隐私声明CSS已添加')

# ========== 3. 在数据管理窗口添加使用声明按钮 ==========
old_data_manager = '''<div class="modal-overlay" id="modal-data-manager">
  <div class="modal" style="max-width:600px;">
    <h2 class="modal-title">数据管理</h2>
    <p class="modal-desc">导出、导入或清除你的数据</p>'''

new_data_manager = '''<div class="modal-overlay" id="modal-data-manager">
  <div class="modal" style="max-width:600px;">
    <h2 class="modal-title">数据管理</h2>
    <p class="modal-desc">导出、导入或清除你的数据</p>
    
    <!-- 使用声明按钮 -->
    <div class="data-notice-banner" onclick="showDataUsageNotice()">
      <div class="data-notice-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
      </div>
      <div class="data-notice-text">
        <strong>数据使用声明</strong>
        <span>了解数据存储位置、导出导入用法 →</span>
      </div>
    </div>'''

content = content.replace(old_data_manager, new_data_manager)
print('✓ 数据管理窗口使用声明按钮已添加')

# ========== 4. 添加使用声明弹窗 ==========
usage_notice_modal = '''
<!-- ===== 数据使用声明弹窗 ===== -->
<div class="modal-overlay" id="modal-data-usage-notice">
  <div class="modal" style="max-width:560px;max-height:80vh;overflow-y:auto;">
    <div class="modal-header-with-icon">
      <div class="modal-icon-badge" style="background:linear-gradient(135deg,var(--accent-blue),var(--accent-blue-dark));">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
      </div>
      <div>
        <h2 class="modal-title">数据使用声明</h2>
        <p class="modal-desc">请仔细阅读以下关于您数据的说明</p>
      </div>
    </div>
    
    <div class="usage-notice-section">
      <div class="usage-notice-section-title">
        <span class="usage-notice-number">1</span>
        数据存储位置
      </div>
      <div class="usage-notice-text">
        您在DanDanTable中创建的所有数据（包括但不限于课程成绩、考试倒计时、收支记录、作息安排、习惯打卡、健康记录等）<strong>全部存储在您当前使用的浏览器本地存储（localStorage）中</strong>。数据<strong>不会上传到任何服务器</strong>，也<strong>不会在多设备间自动同步</strong>。
      </div>
    </div>
    
    <div class="usage-notice-section">
      <div class="usage-notice-section-title">
        <span class="usage-notice-number">2</span>
        与账号登录的关系
      </div>
      <div class="usage-notice-text">
        本应用的「档案」功能<strong>仅用于在同一浏览器中区分不同用户的数据</strong>，并非真正的账号系统。档案信息同样存储在浏览器本地，<strong>与任何形式的账号登录无关</strong>。在其他设备或浏览器中无法通过「档案名」访问您的数据。
      </div>
    </div>
    
    <div class="usage-notice-section">
      <div class="usage-notice-section-title">
        <span class="usage-notice-number">3</span>
        导出数据的用法与目的
      </div>
      <div class="usage-notice-text">
        <strong>目的：</strong>将您当前档案的所有数据导出为JSON文件，用于<strong>数据备份</strong>和<strong>跨设备迁移</strong>。<br>
        <strong>用法：</strong>点击「导出数据」按钮，浏览器会自动下载一个名为 <code>dandantable_backup_日期.json</code> 的文件。请妥善保存该文件，它包含您的全部数据。<br>
        <strong>建议：</strong>定期导出备份，尤其是在清除浏览器数据、更换设备或更新浏览器之前。
      </div>
    </div>
    
    <div class="usage-notice-section">
      <div class="usage-notice-section-title">
        <span class="usage-notice-number">4</span>
        导入数据的用法与目的
      </div>
      <div class="usage-notice-text">
        <strong>目的：</strong>将之前导出的JSON备份文件恢复到当前档案中，用于<strong>数据恢复</strong>和<strong>设备迁移</strong>。<br>
        <strong>用法：</strong>点击「导入数据」按钮，选择之前导出的JSON文件。导入后，<strong>当前档案的现有数据将被完全覆盖</strong>，请谨慎操作。<br>
        <strong>注意：</strong>导入操作不可撤销，建议在导入前先导出当前数据作为备份。
      </div>
    </div>
    
    <div class="usage-notice-section">
      <div class="usage-notice-section-title">
        <span class="usage-notice-number">5</span>
        数据安全与隐私
      </div>
      <div class="usage-notice-text">
        服务提供方<strong>无法查看、收集、存储或传输</strong>您的任何个人数据。您的数据完全由您自己掌控。但请注意：<br>
        • 清除浏览器缓存/数据将导致数据丢失<br>
        • 使用隐私模式/无痕模式关闭后数据不会保存<br>
        • 更换浏览器或设备需要先导出再导入<br>
        • 建议定期导出备份到安全位置
      </div>
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="closeModal('modal-data-usage-notice')">我已了解</button>
    </div>
  </div>
</div>
'''

# 在toast-container后添加使用声明弹窗
content = content.replace('<div class="toast-container" id="toast-container"></div>', 
                          '<div class="toast-container" id="toast-container"></div>\n' + usage_notice_modal)
print('✓ 数据使用声明弹窗已添加')

# ========== 5. 添加使用声明相关CSS ==========
usage_css = '''
/* ===== Data Notice Banner ===== */
.data-notice-banner {
  background: linear-gradient(135deg, var(--accent-blue-light), var(--accent-purple-light));
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all var(--transition);
  border: 1px solid rgba(107, 143, 197, 0.15);
}

.data-notice-banner:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.data-notice-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-blue-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.data-notice-icon svg {
  width: 18px;
  height: 18px;
  fill: #fff;
}

.data-notice-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.data-notice-text strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-blue-dark);
}

.data-notice-text span {
  font-size: 11px;
  color: var(--text-2);
}

/* ===== Modal Header with Icon ===== */
.modal-header-with-icon {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.modal-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modal-icon-badge svg {
  width: 24px;
  height: 24px;
  fill: #fff;
}

/* ===== Usage Notice Sections ===== */
.usage-notice-section {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-soft);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-blue);
}

.usage-notice-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.usage-notice-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-blue-dark));
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.usage-notice-text {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.8;
}

.usage-notice-text strong {
  color: var(--text-1);
  font-weight: 600;
}

.usage-notice-text code {
  background: var(--bg-card);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--accent-orange-dark);
  font-family: 'Consolas', monospace;
}
'''

content = content.replace('</style>', usage_css + '\n</style>')
print('✓ 使用声明CSS已添加')

# ========== 6. 添加showDataUsageNotice函数 ==========
# 在</script>前添加函数
js_function = '''
// 显示数据使用声明弹窗
function showDataUsageNotice() {
  showModal('modal-data-usage-notice');
}
window.showDataUsageNotice = showDataUsageNotice;
'''

content = content.replace('</script>', js_function + '\n</script>')
print('✓ showDataUsageNotice函数已添加')

# 保存
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 隐私声明和使用声明添加完成，文件大小: {len(content)} 字节')
