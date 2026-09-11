import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 1. 替换CSS变量为暖色调风格 ==========
old_css_vars = '''/* ===== CSS Variables ===== */
:root {
  --bg: #f0efe9;
  --bg-card: #ffffff;
  --bg-sidebar: #1e1e24;
  --bg-sidebar-hover: #2a2a32;
  --text-1: #1a1a2e;
  --text-2: #5a5a6e;
  --text-3: #9a9aae;
  --text-sidebar: #e0e0e8;
  --text-sidebar-muted: #8a8a98;
  --border: #e8e7e0;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.08);
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --green: #a8c5a0;
  --green-dark: #7ba87a;
  --yellow: #f0d080;
  --yellow-dark: #d4a84a;
  --blue: #8b9cf0;
  --blue-dark: #6b7cd0;
  --purple: #b8a5e0;
  --purple-dark: #9885c0;
  --pink: #f0a5b8;
  --pink-dark: #d08598;
  --teal: #85c5c0;
  --teal-dark: #65a5a0;
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}'''

new_css_vars = '''/* ===== CSS Variables - Warm Tone Design ===== */
:root {
  /* 背景色 - 暖白色/米白色 */
  --bg: #f5f2ed;
  --bg-soft: #efece6;
  --bg-card: #ffffff;
  --bg-sidebar: #faf8f5;
  --bg-sidebar-hover: #f0ede8;
  --bg-dark: #2a2826;
  
  /* 文字色 - 暖灰色系 */
  --text-1: #2a2826;
  --text-2: #6b6560;
  --text-3: #a09a94;
  --text-sidebar: #4a4540;
  --text-sidebar-muted: #9a948e;
  
  /* 边框色 */
  --border: #e8e4dd;
  --border-light: #f0ece5;
  
  /* 阴影 - 柔和暖色调 */
  --shadow-sm: 0 2px 12px rgba(139, 115, 85, 0.06);
  --shadow-md: 0 4px 20px rgba(139, 115, 85, 0.08);
  --shadow-lg: 0 8px 40px rgba(139, 115, 85, 0.1);
  --shadow-card: 0 2px 16px rgba(139, 115, 85, 0.07);
  
  /* 圆角 - 大圆角设计 */
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 28px;
  
  /* 强调色 - 暖黄色和橙红色 */
  --accent-yellow: #f0c75e;
  --accent-yellow-dark: #d4a843;
  --accent-yellow-light: #faf0d4;
  --accent-orange: #e8846a;
  --accent-orange-dark: #d06a50;
  --accent-orange-light: #fae0d8;
  --accent-blue: #6b8fc5;
  --accent-blue-dark: #5075a8;
  --accent-blue-light: #dce6f2;
  --accent-green: #8ab88a;
  --accent-green-dark: #6a986a;
  --accent-green-light: #dceadc;
  --accent-purple: #a890c0;
  --accent-purple-dark: #8870a0;
  --accent-purple-light: #e8dff0;
  --accent-pink: #e090a8;
  --accent-pink-dark: #c07088;
  --accent-pink-light: #f5dce4;
  --accent-teal: #7ab5b0;
  --accent-teal-dark: #5a9590;
  --accent-teal-light: #d5eae8;
  
  /* 兼容旧变量名 */
  --green: var(--accent-green);
  --green-dark: var(--accent-green-dark);
  --yellow: var(--accent-yellow);
  --yellow-dark: var(--accent-yellow-dark);
  --blue: var(--accent-blue);
  --blue-dark: var(--accent-blue-dark);
  --purple: var(--accent-purple);
  --purple-dark: var(--accent-purple-dark);
  --pink: var(--accent-pink);
  --pink-dark: var(--accent-pink-dark);
  --teal: var(--accent-teal);
  --teal-dark: var(--accent-teal-dark);
  
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}'''

content = content.replace(old_css_vars, new_css_vars)
print('✓ CSS变量已升级为暖色调风格')

# ========== 2. 升级body背景 ==========
old_body = '''body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text-1);
  overflow-x: hidden;
  line-height: 1.6;
}'''

new_body = '''body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(240, 199, 94, 0.04) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(232, 132, 106, 0.03) 0%, transparent 40%);
  color: var(--text-1);
  overflow-x: hidden;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}'''

content = content.replace(old_body, new_body)
print('✓ Body背景已升级（添加暖色渐变）')

# 保存
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 第一阶段CSS升级完成，文件大小: {len(content)} 字节')
