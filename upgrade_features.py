import os

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 1. 升级按钮样式 ==========
old_btn = '''/* ===== Buttons ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition);
  font-family: inherit;
}

.btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.btn-primary {
  background: linear-gradient(135deg, var(--blue), var(--blue-dark));
  color: #fff;
  box-shadow: 0 4px 12px rgba(107, 124, 208, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 124, 208, 0.4);
}

.btn-secondary {
  background: var(--bg);
  color: var(--text-1);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-soft);
}

.btn-danger {
  background: linear-gradient(135deg, #e8846a, #d06a50);
  color: #fff;
}

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}'''

new_btn = '''/* ===== Buttons - Warm Gradient Design ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 22px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition);
  font-family: inherit;
  letter-spacing: 0.2px;
}

.btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-yellow), var(--accent-orange));
  color: #fff;
  box-shadow: 0 4px 14px rgba(232, 132, 106, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 132, 106, 0.4);
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-1);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover {
  background: var(--bg-soft);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-orange-dark));
  color: #fff;
  box-shadow: 0 4px 12px rgba(232, 132, 106, 0.25);
}

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 7px 16px;
  font-size: 12px;
  border-radius: 10px;
}'''

content = content.replace(old_btn, new_btn)
print('✓ 按钮样式已升级（暖黄橙渐变）')

# ========== 2. 升级模态框样式 ==========
old_modal = '''/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition);
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  transform: translateY(20px) scale(0.95);
  transition: all var(--transition);
}

.modal-overlay.show .modal {
  transform: translateY(0) scale(1);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions .btn {
  flex: 1;
}'''

new_modal = '''/* ===== Modal - Warm Rounded Design ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(42, 40, 38, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition);
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 28px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(139, 115, 85, 0.2);
  transform: translateY(20px) scale(0.95);
  transition: all var(--transition);
  border: 1px solid var(--border-light);
}

.modal-overlay.show .modal {
  transform: translateY(0) scale(1);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}

.modal-desc {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions .btn {
  flex: 1;
}'''

content = content.replace(old_modal, new_modal)
print('✓ 模态框样式已升级（大圆角+暖色阴影）')

# ========== 3. 在仪表盘中添加更多功能区 ==========
# 在数据统计卡片后添加本周概览和习惯打卡
old_dashboard_end = '''              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--blue-dark)" id="stat-transactions">0</div>
                <div style="font-size:11px;color:var(--text-3)">记账记录</div>
              </div>
              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--purple-dark)" id="stat-schedule">0</div>
                <div style="font-size:11px;color:var(--text-3)">作息安排</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>'''

new_dashboard_end = '''              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--blue-dark)" id="stat-transactions">0</div>
                <div style="font-size:11px;color:var(--text-3)">记账记录</div>
              </div>
              <div style="text-align:center;padding:12px;background:var(--bg);border-radius:12px;">
                <div style="font-size:24px;font-weight:800;color:var(--purple-dark)" id="stat-schedule">0</div>
                <div style="font-size:11px;color:var(--text-3)">作息安排</div>
              </div>
            </div>
          </div>
          
          <!-- 本周学习效率 -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">本周概览</div>
                <div class="card-subtitle">学习与生活效率统计</div>
              </div>
            </div>
            <div class="week-overview">
              <div class="week-overview-item">
                <div class="week-overview-icon" style="background:linear-gradient(135deg,var(--accent-green),var(--accent-green-dark))">
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
                <div class="week-overview-info">
                  <div class="week-overview-value" id="week-habits-done">0%</div>
                  <div class="week-overview-label">习惯完成率</div>
                </div>
              </div>
              <div class="week-overview-item">
                <div class="week-overview-icon" style="background:linear-gradient(135deg,var(--accent-blue),var(--accent-blue-dark))">
                  <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                </div>
                <div class="week-overview-info">
                  <div class="week-overview-value" id="week-study-hours">0h</div>
                  <div class="week-overview-label">本周学习</div>
                </div>
              </div>
              <div class="week-overview-item">
                <div class="week-overview-icon" style="background:linear-gradient(135deg,var(--accent-yellow),var(--accent-yellow-dark))">
                  <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                </div>
                <div class="week-overview-info">
                  <div class="week-overview-value" id="week-events-count">0</div>
                  <div class="week-overview-label">本周安排</div>
                </div>
              </div>
              <div class="week-overview-item">
                <div class="week-overview-icon" style="background:linear-gradient(135deg,var(--accent-orange),var(--accent-orange-dark))">
                  <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                </div>
                <div class="week-overview-info">
                  <div class="week-overview-value" id="week-budget-usage">0%</div>
                  <div class="week-overview-label">预算使用</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>'''

content = content.replace(old_dashboard_end, new_dashboard_end)
print('✓ 仪表盘已添加本周概览功能区')

# ========== 4. 添加本周概览CSS ==========
week_css = '''
/* ===== Week Overview ===== */
.week-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.week-overview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-soft);
  border-radius: var(--radius-md);
  transition: all var(--transition);
}

.week-overview-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.week-overview-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.week-overview-icon svg {
  width: 20px;
  height: 20px;
  fill: #fff;
}

.week-overview-info {
  flex: 1;
  min-width: 0;
}

.week-overview-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 2px;
}

.week-overview-label {
  font-size: 11px;
  color: var(--text-3);
}
'''

content = content.replace('</style>', week_css + '\n</style>')
print('✓ 本周概览CSS已添加')

# 保存
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 第四阶段功能区和组件升级完成，文件大小: {len(content)} 字节')
