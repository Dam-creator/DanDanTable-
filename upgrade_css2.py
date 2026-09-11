import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 3. 升级侧边栏为浅色风格 ==========
# 找到侧边栏CSS部分并替换
old_sidebar_start = '''/* ===== Sidebar ===== */
.sidebar {
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
}'''

new_sidebar_start = '''/* ===== Sidebar - Light Warm Style ===== */
.sidebar {
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

content = content.replace(old_sidebar_start, new_sidebar_start)
print('✓ 侧边栏背景已升级为浅色')

# 升级侧边栏Logo
old_sidebar_logo = '''.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.sidebar-logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-logo-icon svg { width: 20px; height: 20px; fill: #fff; }

.sidebar-logo-text {'''

new_sidebar_logo = '''.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 28px;
  border-bottom: 1px solid var(--border);
}

.sidebar-logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent-yellow), var(--accent-orange));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(240, 199, 94, 0.3);
}

.sidebar-logo-icon svg { width: 22px; height: 22px; fill: #fff; }

.sidebar-logo-text {'''

content = content.replace(old_sidebar_logo, new_sidebar_logo)
print('✓ 侧边栏Logo已升级（暖黄橙渐变）')

# 升级导航项样式
old_nav_item = '''.nav-item {
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
}

.nav-item:hover {
  background: var(--bg-sidebar-hover);
  color: var(--text-sidebar);
}

.nav-item.active {
  background: var(--bg-sidebar-hover);
  color: #fff;
  border-left-color: var(--yellow);
}

.nav-item svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}'''

new_nav_item = '''.nav-item {
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
}

.nav-item svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}'''

content = content.replace(old_nav_item, new_nav_item)
print('✓ 导航项样式已升级（圆角卡片式选中态）')

# 升级侧边栏底部用户信息
old_sidebar_user = '''.sidebar-user {
  margin-top: auto;
  padding: 20px 24px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--teal));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
}

.sidebar-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sidebar);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  font-size: 11px;
  color: var(--text-sidebar-muted);
}'''

new_sidebar_user = '''.sidebar-user {
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
}

.sidebar-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-yellow), var(--accent-orange));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(240, 199, 94, 0.25);
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
}

.sidebar-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  font-size: 11px;
  color: var(--text-3);
}'''

content = content.replace(old_sidebar_user, new_sidebar_user)
print('✓ 侧边栏用户信息已升级（卡片式）')

# 保存
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 第二阶段侧边栏升级完成，文件大小: {len(content)} 字节')
