import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 4. 升级主内容区布局 ==========
old_main = '''/* ===== Main Content ===== */
.main {
  flex: 1;
  margin-left: 240px;
  padding: 28px 32px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-3);
}'''

new_main = '''/* ===== Main Content - Warm Design ===== */
.main {
  flex: 1;
  margin-left: 240px;
  padding: 32px 36px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-3);
}

.page-header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}'''

content = content.replace(old_main, new_main)
print('✓ 主内容区布局已升级')

# ========== 5. 升级卡片样式 ==========
old_card = '''/* ===== Card ===== */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
  transition: all var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
}

.card-desc {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 2px;
}'''

new_card = '''/* ===== Card - Warm Rounded Design ===== */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
  margin-bottom: 20px;
  transition: all var(--transition);
  border: 1px solid var(--border-light);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, var(--accent-yellow), var(--accent-orange));
  border-radius: 2px;
}

.card-desc {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 2px;
}'''

content = content.replace(old_card, new_card)
print('✓ 卡片样式已升级（大圆角+左侧装饰条）')

# ========== 6. 升级统计卡片 ==========
old_stat_card = '''/* ===== Stat Cards ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.stat-card-icon svg {
  width: 22px;
  height: 22px;
  fill: #fff;
}

.stat-card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 4px;
}

.stat-card-label {
  font-size: 13px;
  color: var(--text-3);
}

.stat-card.green .stat-card-icon { background: linear-gradient(135deg, var(--green), var(--green-dark)); }
.stat-card.yellow .stat-card-icon { background: linear-gradient(135deg, var(--yellow), var(--yellow-dark)); }
.stat-card.blue .stat-card-icon { background: linear-gradient(135deg, var(--blue), var(--blue-dark)); }
.stat-card.purple .stat-card-icon { background: linear-gradient(135deg, var(--purple), var(--purple-dark)); }
.stat-card.pink .stat-card-icon { background: linear-gradient(135deg, var(--pink), var(--pink-dark)); }
.stat-card.teal .stat-card-icon { background: linear-gradient(135deg, var(--teal), var(--teal-dark)); }'''

new_stat_card = '''/* ===== Stat Cards - Warm Gradient Design ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-card);
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0.08;
  transform: translate(20px, -20px);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-card-icon svg {
  width: 24px;
  height: 24px;
  fill: #fff;
}

.stat-card-value {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 6px;
  letter-spacing: -1px;
}

.stat-card-label {
  font-size: 13px;
  color: var(--text-3);
  font-weight: 500;
}

.stat-card.green .stat-card-icon { background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark)); }
.stat-card.green::before { background: var(--accent-green); }
.stat-card.yellow .stat-card-icon { background: linear-gradient(135deg, var(--accent-yellow), var(--accent-yellow-dark)); }
.stat-card.yellow::before { background: var(--accent-yellow); }
.stat-card.blue .stat-card-icon { background: linear-gradient(135deg, var(--accent-blue), var(--accent-blue-dark)); }
.stat-card.blue::before { background: var(--accent-blue); }
.stat-card.purple .stat-card-icon { background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark)); }
.stat-card.purple::before { background: var(--accent-purple); }
.stat-card.pink .stat-card-icon { background: linear-gradient(135deg, var(--accent-pink), var(--accent-pink-dark)); }
.stat-card.pink::before { background: var(--accent-pink); }
.stat-card.teal .stat-card-icon { background: linear-gradient(135deg, var(--accent-teal), var(--accent-teal-dark)); }
.stat-card.teal::before { background: var(--accent-teal); }
.stat-card.orange .stat-card-icon { background: linear-gradient(135deg, var(--accent-orange), var(--accent-orange-dark)); }
.stat-card.orange::before { background: var(--accent-orange); }'''

content = content.replace(old_stat_card, new_stat_card)
print('✓ 统计卡片样式已升级（暖色调渐变+装饰圆）')

# 保存
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 第三阶段卡片升级完成，文件大小: {len(content)} 字节')
