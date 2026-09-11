import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# 1. 找到CSS插入位置
insertCssLine = -1
for i, line in enumerate(lines):
    if '.modal-actions .btn { flex: 1; }' in line:
        insertCssLine = i
        print(f'找到CSS插入位置: 第 {i+1} 行')
        break

# 2. 找到第一个模态框位置
firstModalLine = -1
for i, line in enumerate(lines):
    if 'id="modal-schedule-event"' in line:
        firstModalLine = i
        print(f'找到第一个模态框: 第 {i+1} 行')
        break

# 构建新内容
new_lines = []
css_added = False
modal_added = False

for i, line in enumerate(lines):
    # 添加CSS
    if i == insertCssLine and not css_added:
        new_lines.append(line)
        new_lines.append('')
        new_lines.append('/* ===== 头像颜色选择 ===== */')
        new_lines.append('.avatar-colors { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }')
        new_lines.append('.avatar-color { width: 36px; height: 36px; border-radius: 50%; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }')
        new_lines.append('.avatar-color:hover { transform: scale(1.1); }')
        new_lines.append('.avatar-color.selected { border-color: #fff; box-shadow: 0 0 0 2px var(--primary); transform: scale(1.1); }')
        css_added = True
        print('已添加avatar-color CSS')
        continue
    
    # 添加模态框（在第一个模态框前）
    if i == firstModalLine - 1 and not modal_added:
        new_lines.append('<!-- ===== 弹窗：创建档案 ===== -->')
        new_lines.append('<div class="modal-overlay" id="modal-create-profile">')
        new_lines.append('  <div class="modal">')
        new_lines.append('    <h2 class="modal-title">创建新档案</h2>')
        new_lines.append('    <p class="modal-desc">设置你的用户名和昵称，开始使用DanDanTable</p>')
        new_lines.append('    <div class="form-group">')
        new_lines.append('      <label class="form-label">用户名（唯一标识）</label>')
        new_lines.append('      <input type="text" class="form-input" id="new-profile-username" placeholder="输入用户名，如：dandan2024" maxlength="20">')
        new_lines.append('    </div>')
        new_lines.append('    <div class="form-group">')
        new_lines.append('      <label class="form-label">昵称（显示名称）</label>')
        new_lines.append('      <input type="text" class="form-input" id="new-profile-name" placeholder="输入昵称，如：蛋蛋同学" maxlength="20">')
        new_lines.append('    </div>')
        new_lines.append('    <div class="form-group">')
        new_lines.append('      <label class="form-label">选择头像颜色</label>')
        new_lines.append('      <div class="avatar-colors" id="avatar-colors"></div>')
        new_lines.append('    </div>')
        new_lines.append('    <div class="modal-actions">')
        new_lines.append("      <button class=\"btn btn-ghost\" onclick=\"closeModal('modal-create-profile')\">取消</button>")
        new_lines.append('      <button class="btn btn-primary" onclick="createProfile()">创建档案</button>')
        new_lines.append('    </div>')
        new_lines.append('  </div>')
        new_lines.append('</div>')
        new_lines.append('')
        modal_added = True
        print('已添加modal-create-profile模态框')
    
    new_lines.append(line)

# 写回文件
new_content = '\n'.join(new_lines)
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'文件已更新，新大小: {len(new_content)} 字节')

# 验证
if 'id="modal-create-profile"' in new_content:
    print('✓ modal-create-profile模态框已添加')
else:
    print('✗ modal-create-profile模态框未添加')

if '.avatar-color' in new_content:
    print('✓ avatar-color CSS已添加')
else:
    print('✗ avatar-color CSS未添加')
