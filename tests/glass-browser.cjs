/* Browser checks for optical feedback, accessibility and live layout. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('assert/strict'),path=require('path'),fs=require('fs');
const out=process.env.GLASS_SCREENSHOTS || path.join(process.env.TEMP,'dandantable-glass');
fs.mkdirSync(out,{recursive:true});
const passed=[];const check=(name,value)=>{assert.ok(value,name);passed.push(name);};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1100},timezoneId:'Asia/Shanghai'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/dandantable.onrender.com/**',r=>r.abort());
  await page.goto(process.env.GLASS_URL || 'file:///'+path.resolve(__dirname,'../index.html').replaceAll('\\','/'));
  await page.evaluate(()=>{
   document.getElementById('new-profile-username').value='glass-preview';document.getElementById('new-profile-name').value='林同学';createProfile();
   const d=DanDanA1.read(),today=localDateKey();
   d.learningCourses=[{id:'math',name:'高等数学',scheduleIds:[],gradeIds:[]},{id:'english',name:'大学英语',scheduleIds:[],gradeIds:[]},{id:'code',name:'程序设计',scheduleIds:[],gradeIds:[]}];
   d.tasksData=[{id:'task-math',title:'完成高数习题',courseId:'math',deadline:today+'T18:00',status:'todo',estimatedMinutes:45},{id:'task-english',title:'准备英语演讲',courseId:'english',status:'todo',estimatedMinutes:30},{id:'task-code',title:'整理实验报告',courseId:'code',status:'todo',estimatedMinutes:60}];
   d.courseReviewItems=d.learningCourses.flatMap((c,i)=>Array.from({length:6},(_,j)=>({id:c.id+j,courseId:c.id,title:'复习知识点 '+(j+1),completed:j<[4,3,5][i]})));
   d.studySlots=[{id:'slot-english',date:today,startTime:'16:30',durationMinutes:45,taskId:'task-english'}];
   const examDate=new Date();examDate.setDate(examDate.getDate()+5);d.countdowns=[{id:'exam-math',name:'高数期中考试',date:localDateKey(examDate),courseId:'math',type:'exam'}];
   saveProfileData(state.currentProfileId,d);switchView('dashboard');
  });
  await page.waitForTimeout(500);
  await page.locator('#toast-container').evaluate(e=>e.innerHTML='');
  await page.locator('#global-search').fill('高数');
  const result=page.locator('#global-search-results');
  check('Search results remain above glass panels',await result.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+Math.min(35,r.height/2)));}));
  await page.keyboard.press('Escape');await page.locator('#global-search').fill('');
  const storage=await page.evaluate(()=>JSON.stringify({...localStorage}));
  const surface=page.locator('.a1-focus'),rect=await surface.boundingBox();
  await page.mouse.move(rect.x+rect.width*.15,rect.y+20);await page.waitForTimeout(80);
  const initial=await surface.evaluate(e=>e.style.getPropertyValue('--lg-x'));
  const imageA=await surface.screenshot();
  await page.mouse.move(rect.x+rect.width*.85,rect.y+rect.height*.4);await page.waitForTimeout(80);
  check('Specular highlight follows pointer across surface',initial!==await surface.evaluate(e=>e.style.getPropertyValue('--lg-x')));
  const imageB=await surface.screenshot();check('Moving light changes rendered pixels',!imageA.equals(imageB));
  check('Highlight never blocks task/control clicks',await surface.evaluate(e=>getComputedStyle(e,'::after').pointerEvents==='none'));
  check('Visual interactions preserve stored profile records',storage===await page.evaluate(()=>JSON.stringify({...localStorage})));
  await page.screenshot({path:path.join(out,'液态玻璃-桌面.png'),fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(rect.x+30,rect.y+30);await page.waitForTimeout(200);
  check('Reduced motion clears interactive optical feedback',await page.locator('.lg-tracking').count()===0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.mouse.move(rect.x+50,rect.y+50);await page.waitForTimeout(50);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  check('Window blur resets highlight',await page.locator('.lg-tracking').count()===0);
  for(const width of [1600,1440,1024,900,768,390,320]){
   await page.setViewportSize({width,height:950});
   for(const view of ['dashboard','courses','gpa','tasks','finance','countdown','goals']){
    await page.evaluate(v=>switchView(v),view);await page.waitForTimeout(35);
    check('Layout fits '+width+'px / '+view,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>switchView('dashboard'));
  await page.waitForTimeout(250);
  check('Final mobile dashboard has no clipped content',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(out,'液态玻璃-手机.png'),fullPage:true});
  await page.evaluate(()=>DanDanA1.openCourse('math'));await page.locator('#a1-dialog-title').waitFor({state:'visible'});
  check('Glass course dialog fits mobile viewport',await page.locator('#a1-dialog-panel').evaluate(e=>e.getBoundingClientRect().right<=innerWidth));
  await page.screenshot({path:path.join(out,'液态玻璃-课程详情.png')});await page.keyboard.press('Escape');
  check('Course dialog still closes with Escape',await page.locator('#a1-dialog').evaluate(e=>e.hidden));
  await page.locator('.mobile-menu-toggle').click();
  check('Mobile sidebar opens above content',await page.locator('#sidebar').evaluate(e=>e.classList.contains('open')));
  await page.locator('#sidebar-overlay').click({position:{x:360,y:300}});
  check('Mobile sidebar closes from backdrop',await page.locator('#sidebar').evaluate(e=>!e.classList.contains('open')));
  check('No browser runtime errors',errors.length===0);
  fs.writeFileSync(path.join(out,'液态玻璃验证.json'),JSON.stringify({passed:passed.length,checks:passed,errors},null,2));
  console.log('PASS '+passed.length+' liquid glass checks. '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
