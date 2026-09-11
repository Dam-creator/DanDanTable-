import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 1. 侧边栏改回深色 ==========
# 修改CSS变量
old_sidebar_vars = '''  --bg-sidebar: #faf8f5;
  --bg-sidebar-hover: #f0ede8;'''
new_sidebar_vars = '''  --bg-sidebar: #1e1e24;
  --bg-sidebar-hover: #2a2a32;'''
content = content.replace(old_sidebar_vars, new_sidebar_vars)

# 修改文字颜色变量
old_text_vars = '''  --text-sidebar: #4a4540;
  --text-sidebar-muted: #9a948e;'''
new_text_vars = '''  --text-sidebar: #e0e0e8;
  --text-sidebar-muted: #8a8a98;'''
content = content.replace(old_text_vars, new_text_vars)

# 修改侧边栏背景和边框
old_sidebar_css = '''.sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  color: var(--text-sidebar);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  transition: transform var(--transition);
  border-right: 1px solid var(--border);
  box-shadow: 2px 0 12px rgba(139, 115, 85, 0.04);
}'''
new_sidebar_css = '''.sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  color: var(--text-sidebar);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  transition: transform var(--transition);
  border-right: none;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}'''
content = content.replace(old_sidebar_css, new_sidebar_css)

# 修改侧边栏Logo边框
old_logo_border = '''.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 28px;
  border-bottom: 1px solid var(--border);
}'''
new_logo_border = '''.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}'''
content = content.replace(old_logo_border, new_logo_border)

# 修改导航项样式（深色背景下的选中态）
old_nav_item = '''.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 2px 16px;
  border-radius: 12px;
  color: var(--text-sidebar-muted);
  cursor: pointer;
  transition: all var(--transition);
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: var(--bg-sidebar-hover);
  color: var(--text-sidebar);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--accent-yellow-light), var(--accent-orange-light));
  color: var(--accent-orange-dark);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(232, 132, 106, 0.1);
}'''
new_nav_item = '''.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: var(--text-sidebar-muted);
  cursor: pointer;
  transition: all var(--transition);
  border-left: 3px solid transparent;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  border-radius: 0;
}

.nav-item:hover {
  background: var(--bg-sidebar-hover);
  color: var(--text-sidebar);
}

.nav-item.active {
  background: var(--bg-sidebar-hover);
  color: #fff;
  border-left-color: var(--accent-yellow);
  font-weight: 600;
  box-shadow: none;
}'''
content = content.replace(old_nav_item, new_nav_item)

# 修改侧边栏用户信息卡片（深色背景下）
old_sidebar_user = '''.sidebar-user {
  margin-top: auto;
  padding: 20px;
  margin: 16px;
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-light);
}'''
new_sidebar_user = '''.sidebar-user {
  margin-top: auto;
  padding: 20px 24px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  box-shadow: none;
  border: none;
  border-radius: 0;
  margin: 0;
}'''
content = content.replace(old_sidebar_user, new_sidebar_user)

# 修改侧边栏用户名颜色
old_user_name = '''.sidebar-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}'''
new_user_name = '''.sidebar-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sidebar);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}'''
content = content.replace(old_user_name, new_user_name)

print('✓ 侧边栏已改回深色风格')

# ========== 2. 修复使用声明弹窗被遮挡的问题 ==========
# 给使用声明弹窗添加更高的z-index
old_usage_modal = '''<!-- ===== 数据使用声明弹窗 ===== -->
<div class="modal-overlay" id="modal-data-usage-notice">'''
new_usage_modal = '''<!-- ===== 数据使用声明弹窗 ===== -->
<div class="modal-overlay" id="modal-data-usage-notice" style="z-index:1100;">'''
content = content.replace(old_usage_modal, new_usage_modal)

# 修改showDataUsageNotice函数，先关闭数据管理窗口
old_show_func = '''// 显示数据使用声明弹窗
function showDataUsageNotice() {
  showModal('modal-data-usage-notice');
}
window.showDataUsageNotice = showDataUsageNotice;'''
new_show_func = '''// 显示数据使用声明弹窗（先关闭数据管理窗口，避免被遮挡）
function showDataUsageNotice() {
  closeModal('modal-data-manager');
  setTimeout(() => {
    showModal('modal-data-usage-notice');
  }, 200);
}
window.showDataUsageNotice = showDataUsageNotice;'''
content = content.replace(old_show_func, new_show_func)

print('✓ 使用声明弹窗被遮挡问题已修复（更高z-index + 先关闭数据管理窗口）')

# 保存
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 修复完成，文件大小: {len(content)} 字节')
