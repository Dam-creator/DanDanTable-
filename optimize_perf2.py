import os
import re

filePath = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index.html'
with open(filePath, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 优化6: 替换图表渲染函数，使用initChart ==========
# 替换所有 echarts.init 调用为 initChart

# 1. GPA趋势图
old_gpa_trend = '''  const trendEl = $("gpa-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    if (state.charts.gpaTrend) state.charts.gpaTrend.dispose();
    const chart = echarts.init(trendEl);'''

new_gpa_trend = '''  const trendEl = $("gpa-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    const chart = initChart("gpa-trend-chart", {}, "gpaTrend");
    if (!chart) return;'''

content = content.replace(old_gpa_trend, new_gpa_trend)

# 2. GPA分布图
old_gpa_dist = '''  const distEl = $("gpa-distribution-chart");
  if (distEl && typeof echarts !== 'undefined') {
    if (state.charts.gpaDist) state.charts.gpaDist.dispose();
    const chart = echarts.init(distEl);'''

new_gpa_dist = '''  const distEl = $("gpa-distribution-chart");
  if (distEl && typeof echarts !== 'undefined') {
    const chart = initChart("gpa-distribution-chart", {}, "gpaDist");
    if (!chart) return;'''

content = content.replace(old_gpa_dist, new_gpa_dist)

# 3. 财务趋势图
old_fin_trend = '''  const trendEl = $("finance-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    if (state.charts.financeTrend) state.charts.financeTrend.dispose();
    const chart = echarts.init(trendEl);'''

new_fin_trend = '''  const trendEl = $("finance-trend-chart");
  if (trendEl && typeof echarts !== 'undefined') {
    const chart = initChart("finance-trend-chart", {}, "financeTrend");
    if (!chart) return;'''

content = content.replace(old_fin_trend, new_fin_trend)

# 4. 财务分类图
old_fin_cat = '''  const catEl = $("finance-category-chart");
  if (catEl && typeof echarts !== 'undefined') {
    if (state.charts.financeCat) state.charts.financeCat.dispose();
    const chart = echarts.init(catEl);'''

new_fin_cat = '''  const catEl = $("finance-category-chart");
  if (catEl && typeof echarts !== 'undefined') {
    const chart = initChart("finance-category-chart", {}, "financeCat");
    if (!chart) return;'''

content = content.replace(old_fin_cat, new_fin_cat)

# 5. 规划周统计图
old_plan = '''  const chartEl = $("plan-weekly-chart");
  if (chartEl && typeof echarts !== 'undefined') {
    if (state.charts.planWeekly) state.charts.planWeekly.dispose();
    const chart = echarts.init(chartEl);'''

new_plan = '''  const chartEl = $("plan-weekly-chart");
  if (chartEl && typeof echarts !== 'undefined') {
    const chart = initChart("plan-weekly-chart", {}, "planWeekly");
    if (!chart) return;'''

content = content.replace(old_plan, new_plan)

# 6. 仪表盘GPA图
old_dash_gpa = '''  const gpaEl = $("dashboard-gpa-chart");
  if (gpaEl && typeof echarts !== 'undefined') {
    if (state.charts.dashGpa) state.charts.dashGpa.dispose();
    const chart = echarts.init(gpaEl);'''

new_dash_gpa = '''  const gpaEl = $("dashboard-gpa-chart");
  if (gpaEl && typeof echarts !== 'undefined') {
    const chart = initChart("dashboard-gpa-chart", {}, "dashGpa");
    if (!chart) return;'''

content = content.replace(old_dash_gpa, new_dash_gpa)

# 7. 仪表盘财务图
old_dash_fin = '''  const finEl = $("dashboard-finance-chart");
  if (finEl && typeof echarts !== 'undefined') {
    if (state.charts.dashFin) state.charts.dashFin.dispose();
    const chart = echarts.init(finEl);'''

new_dash_fin = '''  const finEl = $("dashboard-finance-chart");
  if (finEl && typeof echarts !== 'undefined') {
    const chart = initChart("dashboard-finance-chart", {}, "dashFin");
    if (!chart) return;'''

content = content.replace(old_dash_fin, new_dash_fin)

print('✓ 所有图表渲染函数已替换为initChart')

# ========== 优化7: 移动端延迟渲染图表 ==========
# 在每个render函数的图表调用前添加延迟（移动端）
# 在renderDashboardCharts函数开头添加延迟
old_render_dash_charts = '''function renderDashboardCharts(data) {
  // GPA趋势'''

new_render_dash_charts = '''function renderDashboardCharts(data) {
  // 移动端延迟渲染图表，避免卡顿
  if (isMobile) {
    setTimeout(() => _renderDashboardCharts(data), perfConfig.chartRenderDelay);
    return;
  }
  _renderDashboardCharts(data);
}

function _renderDashboardCharts(data) {
  // GPA趋势'''

content = content.replace(old_render_dash_charts, new_render_dash_charts)

# renderGPACharts
old_render_gpa_charts = '''function renderGPACharts(data) {
  // 趋势图'''

new_render_gpa_charts = '''function renderGPACharts(data) {
  if (isMobile) {
    setTimeout(() => _renderGPACharts(data), perfConfig.chartRenderDelay);
    return;
  }
  _renderGPACharts(data);
}

function _renderGPACharts(data) {
  // 趋势图'''

content = content.replace(old_render_gpa_charts, new_render_gpa_charts)

# renderFinanceCharts
old_render_fin_charts = '''function renderFinanceCharts(data, monthTx) {
  // 趋势图'''

new_render_fin_charts = '''function renderFinanceCharts(data, monthTx) {
  if (isMobile) {
    setTimeout(() => _renderFinanceCharts(data, monthTx), perfConfig.chartRenderDelay);
    return;
  }
  _renderFinanceCharts(data, monthTx);
}

function _renderFinanceCharts(data, monthTx) {
  // 趋势图'''

content = content.replace(old_render_fin_charts, new_render_fin_charts)

# renderPlanChart
old_render_plan_chart = '''function renderPlanChart(data) {
  const chartEl'''

new_render_plan_chart = '''function renderPlanChart(data) {
  if (isMobile) {
    setTimeout(() => _renderPlanChart(data), perfConfig.chartRenderDelay);
    return;
  }
  _renderPlanChart(data);
}

function _renderPlanChart(data) {
  const chartEl'''

content = content.replace(old_render_plan_chart, new_render_plan_chart)

print('✓ 移动端图表延迟渲染已添加')

# 保存
with open(filePath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\\n✓ 第二阶段优化完成，文件大小: {len(content)} 字节')
