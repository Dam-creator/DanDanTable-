const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const { execFileSync } = require('child_process');
const source = path.resolve(__dirname,'../index.html');
const out = path.join(process.env.TEMP,'dandantable-improved-20261011');
fs.mkdirSync(out,{recursive:true});
const html = fs.readFileSync(source,'utf8');
for (const [index,match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
  if (/\bsrc=/.test(match[1])) continue;
  const file=path.join(out,`inline-${index}.js`);fs.writeFileSync(file,match[2]);execFileSync(process.execPath,['--check',file]);
}
const passed=[];
function check(name,value,expected) {assert.deepEqual(value,expected,name);passed.push(name);}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:900},timezoneId:'Asia/Shanghai'});
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/dandantable.onrender.com/**',route=>route.abort());
  await page.clock.setFixedTime(new Date('2026-10-11T02:00:00Z'));
  await page.goto('file:///'+source,{waitUntil:'load'});
  await page.evaluate(()=>{document.getElementById('new-profile-username').value='review';document.getElementById('new-profile-name').value='预览同学';createProfile();});
  check('Local date follows Shanghai midnight',await page.evaluate(()=>localDateKey(new Date('2026-10-10T17:00:00Z'))),'2026-10-11');
  check('Calendar boundaries and invalid dates',await page.evaluate(()=>[calendarDaysUntil('2026-10-11'),calendarDaysUntil('2026-10-12'),calendarDaysUntil('2026-10-10'),Number.isNaN(calendarDaysUntil('2026-02-30'))]),[0,1,-1,true]);
  await page.evaluate(()=>generateSmartAnalysis());
  check('Empty grades do not trigger academic warning',await page.locator('#smart-analysis-content').innerText().then(t=>t.includes('成绩数据不足')&&!t.includes('学业需要加强')),true);
  check('Missing data does not produce a life score',await page.locator('#smart-analysis-content').innerText().then(t=>t.includes('目前不作综合评价')),true);
  check('Task pressure distinguishes today, next week and overdue',await page.evaluate(()=>{
    const results=[];
    for(const dueDate of ['2026-10-11','2026-10-18','2026-10-19','2026-10-10']) {
      const data=getProfileData(state.currentProfileId);data.tasksData=[{id:'test',title:'test',dueDate,priority:'medium',completed:false}];saveProfileData(state.currentProfileId,data);
      results.push(renderStressIndex().breakdown.task);
    }return results;
  }),[13,6,3,15]);
  await page.evaluate(()=>{
    const data=getProfileData(state.currentProfileId),sem=data.semesters[0].id;
    data.courses=[{id:'math',name:'高等数学',credit:3,score:90,semesterId:sem,type:'required'},{id:'english',name:'大学英语',credit:1,score:80,semesterId:sem,type:'required'}];
    data.countdowns=[{id:'exam-today',name:'英语期中考试',date:'2026-10-11',done:false,category:'exam',priority:'high'},{id:'exam-next',name:'高等数学考试',date:'2026-10-14',done:false,category:'exam',priority:'medium'}];
    data.tasksData=[{id:'task1',title:'高等数学习题',dueDate:'2026-10-11',priority:'high',completed:false,status:'todo'},{id:'task2',title:'英语展示准备',dueDate:'2026-10-13',priority:'medium',completed:false,status:'todo'}];
    data.transactions=[{id:'food',type:'expense',amount:28,date:'2026-10-11',category:'food',note:'食堂午餐'},{id:'past',type:'expense',amount:99,date:'2026-09-30',category:'food'},{id:'future',type:'expense',amount:200,date:'2026-11-01',category:'food'}];
    data.goalsData=[{id:'goal1',title:'完成数学复习',status:'active',progress:20,targetDate:'2026-10-30'}];
    data.scheduleEvents=[{id:'schedule1',title:'图书馆复习',date:'2026-10-11',startTime:'14:00',endTime:'15:00',category:'study',repeat:'',done:false}];
    saveProfileData(state.currentProfileId,data);renderDashboard();generateSmartAnalysis();
  });
  check('Weighted GPA shared by dashboard and analysis',await page.evaluate(()=>[cumulativeGPA(getProfileData(state.currentProfileId)),document.getElementById('v3-b-gpa').textContent,document.getElementById('smart-analysis-content').textContent.includes('3.75')]),[3.75,'3.75',true]);
  check('Analysis uses the current goals schema',await page.locator('#smart-analysis-content').innerText().then(t=>t.includes('有 1 个目标正在进行')),true);
  check('Month expenses exclude earlier and future months',await page.locator('#v3-b-expense').innerText(),'¥28');
  check('Today exam remains visible',await page.locator('#v3-b-exam').innerText(),'今天');
  check('Today schedule appears in the focus area',await page.locator('#dashboard-today-list').innerText().then(t=>t.includes('图书馆复习')),true);
  check('Dashboard balance excludes future expenses',await page.locator('#dashboard-finance').innerText(),'¥-28');
  await page.evaluate(()=>switchView('countdown'));
  check('Countdown list uses calendar dates',await page.locator('#countdown-list').innerText().then(t=>t.includes('今天考试')&&!t.includes('-')&&!t.includes('小时')),true);
  check('Active exams include today',await page.locator('#countdown-active').innerText(),'2');
  await page.evaluate(()=>switchView('dashboard'));
  const search=page.locator('#global-search');await search.fill('高等数学');
  check('Search finds courses, tasks and exams',await page.locator('.search-result').count(),3);
  await search.press('ArrowDown');check('Keyboard selection is accessible',await search.getAttribute('aria-activedescendant'),'global-search-option-0');
  await search.press('Enter');check('Search navigation opens grade view',await page.locator('#view-gpa').evaluate(el=>el.classList.contains('active')),true);
  await page.evaluate(()=>switchView('dashboard'));await search.fill('备份');await search.press('Escape');
  check('Escape closes search results',await page.locator('#global-search-results').isVisible(),false);await search.fill('');
  await page.waitForTimeout(1200);
  await page.screenshot({path:path.join(out,'desktop.png')});
  for (const width of [1024,768,390,320]) {
    await page.setViewportSize({width,height:844});
    await page.waitForTimeout(500);
    check(`Dashboard has no horizontal overflow at ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    check(`Dashboard content fits at ${width}px`,await page.locator('.main').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    await search.fill('课程');
    check(`Search panel fits viewport at ${width}px`,await page.locator('#global-search-results').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth;}),true);
    await search.press('Escape');await search.fill('');
    if(width===390) {await page.screenshot({path:path.join(out,'mobile.png')});await page.evaluate(()=>switchView('study'));await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'study-mobile.png')});await page.evaluate(()=>switchView('dashboard'));}
  }
  await page.evaluate(()=>completeDashboardTask('task1'));
  check('Completing dashboard task saves and updates overview',await page.evaluate(()=>[getProfileData(state.currentProfileId).tasksData.find(t=>t.id==='task1').completed,document.getElementById('v3-b-tasks').textContent]),[true,'1']);
  await page.evaluate(()=>{const data=getProfileData(state.currentProfileId);data.courses.forEach(c=>c.score=0);saveProfileData(state.currentProfileId,data);generateSmartAnalysis();});
  check('Real zero GPA remains visible',await page.locator('#smart-analysis-content').innerText().then(t=>t.includes('0.00')&&t.includes('学业需要加强')),true);
  await page.evaluate(()=>{const data=getProfileData(state.currentProfileId);data.gpaAlgorithm='zhejiang5';data.courses.forEach(c=>c.score=85);saveProfileData(state.currentProfileId,data);generateSmartAnalysis();});
  check('Five point GPA uses normalized thresholds',await page.locator('#smart-analysis-content').innerText().then(t=>t.includes('4.50')&&t.includes('学业表现优秀')),true);
  await page.evaluate(()=>{
    const data=getProfileDataCached(state.currentProfileId);data.marker='latest';saveProfileDataCached(state.currentProfileId,data);getProfileDataCached(state.currentProfileId);
    saveProfileDataCached('other-review-profile',{marker:'other'});
  });await page.waitForTimeout(650);
  check('Reading cached changes does not cancel saving',await page.evaluate(()=>JSON.parse(localStorage.getItem(STORAGE_PREFIX+'data_'+state.currentProfileId)).marker),'latest');
  check('Profiles save independently during rapid switching',await page.evaluate(()=>JSON.parse(localStorage.getItem(STORAGE_PREFIX+'data_other-review-profile')).marker),'other');
  page.on('dialog',dialog=>dialog.accept());await page.evaluate(()=>{localStorage.setItem('unrelated-tool','keep');clearAllData();});
  check('Clearing app data preserves unrelated same-origin data',await page.evaluate(()=>localStorage.getItem('unrelated-tool')),'keep');
  check('No browser runtime errors',errors,[]);
  console.log(JSON.stringify({passed:passed.length,checks:passed,screenshots:out},null,2));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

