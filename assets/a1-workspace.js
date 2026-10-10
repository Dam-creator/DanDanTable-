/* A1 workspace integration. Existing records retain their identifiers. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const esc = escapeHtml;
  const attr = escapeAttr;
  const arrays = ['learningCourses','courseReviewItems','focusSessions','studySlots'];
  let selectedDate = localDateKey(), taskTab = 'todo', currentCourse = null, dialogReturn = null;
  const originals = {};
  const done = t => !!t.completed || t.status === 'done';
  const durationText = seconds => seconds>=3600?(seconds/3600).toFixed(1)+' h':seconds>=60?Math.floor(seconds/60)+' 分钟':Math.floor(seconds)+' 秒';
  const icon = (name, size = 18) => {
    const paths={play:'<path d="m8 5 11 7-11 7Z"/>',home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>'};
    return paths[name]?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:${size}px;height:${size}px">${paths[name]}</svg>`:ico(name,size);
  };
  const action = (name, id = '', label = '', cls = 'a1-link') => `<button type="button" class="${cls}" data-a1="${name}" data-id="${attr(id)}">${label}</button>`;
  const empty = (title, detail, button = '') => `<div class="a1-empty">${esc(title)}<p>${esc(detail)}</p>${button}</div>`;
  function read(profileId = state.currentProfileId) {
    if (!profileId) return null;
    const data = getProfileDataCached(profileId);
    arrays.forEach(key => { if (!Array.isArray(data[key])) data[key] = []; });
    return data;
  }
  function write(data, profileId = state.currentProfileId) {
    return !!profileId && saveProfileData(profileId, data);
  }
  function migrate() {
    const data = read();
    if (!data || data.a1Version === 1) return;
    const key = 'pre_a1_' + state.currentProfileId;
    if (!storageGet(key, null) && !storageSet(key, {date:new Date().toISOString(), data})) return;
    data.a1Version = 1;
    write(data);
  }
  // Courses from different sources are separate unless the user explicitly links them.
  function courses(data) {
    const linkedSchedule = new Set(), linkedGrades = new Set();
    const result = data.learningCourses.map(c => {
      (c.scheduleIds || []).forEach(id => linkedSchedule.add(id));
      (c.gradeIds || []).forEach(id => linkedGrades.add(id));
      return {...c, aliases:[c.id,...(c.scheduleIds || []),...(c.gradeIds || []).map(id => 'grade_' + id)], source:'workspace'};
    });
    (data.scheduleCourses || []).forEach(c => {
      if (!linkedSchedule.has(c.id)) result.push({...c, aliases:[c.id], scheduleIds:[c.id], gradeIds:[], source:'schedule'});
    });
    (data.courses || []).forEach(c => {
      if (!linkedGrades.has(c.id)) {
        const semester = (data.semesters || []).find(s => s.id === c.semesterId);
        result.push({id:'grade_' + c.id, name:c.name, aliases:['grade_' + c.id], gradeIds:[c.id], scheduleIds:[], source:'grade', subtitle:semester?.name || '成绩课程'});
      }
    });
    return result;
  }
  const belongs = (record, course) => course.aliases.includes(record.courseId);
  const courseOf = (data, id) => courses(data).find(c => c.aliases.includes(id));
  function reviewStats(data, course) {
    const items = data.courseReviewItems.filter(r => belongs(r, course));
    const completed = items.filter(r => r.taskId ? done((data.tasksData || []).find(t => t.id === r.taskId) || {}) : r.completed).length;
    return {items, completed, percent:items.length ? Math.round(completed / items.length * 100) : null};
  }
  function courseCards(data, list) {
    return list.map(c => {
      const stats = reviewStats(data,c), tasks = (data.tasksData || []).filter(t => belongs(t,c) && !done(t));
      const exams = (data.countdowns || []).filter(x => belongs(x,c) && !x.done && calendarDaysUntil(x.date)>=0).sort((a,b)=>calendarDaysUntil(a.date)-calendarDaysUntil(b.date));
      return `<button type="button" class="a1-course" data-a1="course" data-id="${attr(c.id)}">
        <span class="a1-course-top">${icon('book')}<span>${esc(c.subtitle || (c.source==='grade'?'成绩课程':c.source==='schedule'?'课程表':'课程工作区'))} ↗</span></span>
        <h3>${esc(c.name)}</h3><span class="a1-course-meta"><span>复习进度</span><span>${stats.percent===null?'待建清单':stats.percent+'%'}</span></span>
        <span class="a1-progress"><span style="width:${stats.percent || 0}%"></span></span>
        <span class="a1-course-foot"><span>${exams.length?'考试还有 '+calendarDaysUntil(exams[0].date)+' 天':tasks.length+' 项待办'}</span><span>${stats.completed}/${stats.items.length}</span></span></button>`;
    }).join('');
  }
  function sortedTasks(data, filter = taskTab) {
    const rank = {high:0,medium:1,low:2};
    return (data.tasksData || []).filter(t => filter==='all' || (filter==='done'?done(t):!done(t))).slice().sort((a,b)=>{
      const dueA = new Date(a.dueDate || 'invalid').getTime(), dueB = new Date(b.dueDate || 'invalid').getTime();
      return (Number.isFinite(dueA)?dueA:Infinity)-(Number.isFinite(dueB)?dueB:Infinity) || (rank[a.priority] ?? 1)-(rank[b.priority] ?? 1);
    });
  }
  function taskRows(data,list) {
    return list.map(t => {
      const days = calendarDaysUntil(t.dueDate), course = courseOf(data,t.courseId);
      const dueText = !Number.isFinite(days)?'待安排':days<0?'逾期 '+(-days)+' 天':days===0?'今天截止':days===1?'明天截止':days+' 天后';
      return `<div class="a1-task-row ${done(t)?'done':''}">
        <button class="a1-check" type="button" role="checkbox" aria-checked="${done(t)}" aria-label="${attr((done(t)?'恢复':'完成')+'作业：'+t.title)}" data-a1="task-toggle" data-id="${attr(t.id)}">${done(t)?'✓':''}</button>
        <div class="a1-task-copy">${action('task-edit',t.id,esc(t.title),'a1-task-title')}<small>${esc(course?.name || t.courseName || '独立任务')}${t.estimatedMinutes?' · 预计 '+Number(t.estimatedMinutes)+' 分钟':''}</small></div>
        <span class="a1-due ${days<=0&&!done(t)?'urgent':''}">${done(t)?'已完成':dueText}</span>
        ${done(t)?'':`<div class="a1-task-actions"><button class="a1-round" type="button" aria-label="开始专注：${attr(t.title)}" data-a1="focus-task" data-id="${attr(t.id)}">${icon('play',14)}</button><button class="a1-round" type="button" aria-label="安排学习时段：${attr(t.title)}" data-a1="slot-new" data-id="${attr(t.id)}">${icon('calendar',14)}</button></div>`}</div>`;
    }).join('');
  }
  function dateFromKey(key) { return new Date(key+'T12:00:00'); }
  function dayItems(data,key) {
    const date = dateFromKey(key), day = date.getDay() || 7, items=[];
    const weeks = Math.round((dateFromKey(key)-dateFromKey(localDateKey())) / 86400000);
    const nowDay = new Date().getDay() || 7;
    const actualWeek = (Number(scheduleWeek) || 1) + Math.floor((weeks + nowDay - 1) / 7);
    (data.scheduleCourses || []).forEach(c => {
      if (Number(c.dayOfWeek)===day && Number(c.weekStart)<=actualWeek && Number(c.weekEnd)>=actualWeek)
        items.push({id:c.id,title:c.name,start:c.startTime,end:c.endTime,kind:'course',sub:[c.location,c.teacher].filter(Boolean).join(' · ') || '课程表 · 第 '+actualWeek+' 周'});
    });
    (data.scheduleEvents || []).forEach(e => {
      if (eventOnDay(e,day-1,key)) items.push({id:e.id,title:e.title,start:e.startTime,end:e.endTime,kind:'event',sub:'日程安排',done:e.done});
    });
    data.studySlots.filter(s=>s.date===key).forEach(s => {
      const task = (data.tasksData || []).find(t=>t.id===s.taskId), course = courseOf(data,task?.courseId);
      items.push({id:s.id,title:task?.title || s.title || '已删除任务的学习安排',start:s.startTime,end:s.endTime,kind:'slot',sub:(course?.name || '自主学习')+' · 学习时段',done:task&&done(task)});
    });
    return items.sort((a,b)=>(a.start || '').localeCompare(b.start || ''));
  }
  function renderAgenda(data) {
    const selected = dateFromKey(selectedDate), monday = new Date(selected);
    monday.setDate(selected.getDate()-((selected.getDay() || 7)-1));
    const dates = Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return localDateKey(d);});
    el('a1-calendar-title').textContent = selected.toLocaleDateString('zh-CN',{year:'numeric',month:'long'});
    el('a1-calendar-days').innerHTML = dates.map(key => `<button type="button" class="a1-day ${key===selectedDate?'active':''} ${key===localDateKey()?'today':''}" data-a1="date" data-id="${key}" aria-label="${key}" aria-pressed="${key===selectedDate}">${dateFromKey(key).getDate()}${dayItems(data,key).length?'<i></i>':'<i style="opacity:0"></i>'}</button>`).join('');
    el('a1-date-input').value = selectedDate;
    el('a1-agenda-title').textContent = selectedDate===localDateKey()?'今日日程':'当日日程';
    const items=dayItems(data,selectedDate);
    el('a1-agenda-items').innerHTML = items.length?items.map(e=>`<div class="a1-event" ${e.done?'style="opacity:.55"':''}><time>${esc(e.start || '全天')}</time><div class="a1-event-content">${action(e.kind==='slot'?'slot-edit':e.kind==='course'?'schedule-edit':'event-edit',e.id,'<strong>'+esc(e.title)+'</strong><small>'+esc(e.sub)+(e.end?' · 至 '+esc(e.end):'')+'</small>','')} </div></div>`).join(''): '<p class="a1-note">这一天没有安排，可以留一段时间给自己。</p>';
    const exams=(data.countdowns || []).filter(x=>!x.done&&calendarDaysUntil(x.date)>=0).sort((a,b)=>calendarDaysUntil(a.date)-calendarDaysUntil(b.date));
    el('a1-nearest-exam').innerHTML=exams.length?`<small>最近考试</small><strong>${esc(exams[0].name)}</strong><p>${calendarDaysUntil(exams[0].date)===0?'今天考试':'还有 '+calendarDaysUntil(exams[0].date)+' 天'} · ${esc(exams[0].date)}</p>${action('exams','', '查看考试计划 →')}`:`<strong>考试计划</strong><p>添加考试，及时安排复习。</p>${action('exam-new','','添加考试 →')}`;
  }
  function weeklyStats(data) {
    const date=dateFromKey(localDateKey()), monday=new Date(date);monday.setDate(date.getDate()-((date.getDay() || 7)-1));
    const start=localDateKey(monday), next=new Date(monday);next.setDate(monday.getDate()+7);const end=localDateKey(next);
    const sessions=data.focusSessions.filter(s=>{const day=localDateKey(new Date(s.endedAt));return day>=start&&day<end;});
    const seconds=sessions.reduce((sum,s)=>sum+(Number(s.seconds)||0),0);
    const completed=(data.tasksData || []).filter(t=>done(t)&&t.completedAt&&localDateKey(new Date(t.completedAt))>=start&&localDateKey(new Date(t.completedAt))<end).length;
    const daily=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);const key=localDateKey(d);return sessions.filter(s=>localDateKey(new Date(s.endedAt))===key).reduce((n,s)=>n+(Number(s.seconds)||0),0);});
    return {seconds,completed,daily};
  }
  function renderHome() {
    const data=read();if(!data)return;
    const list=courses(data), tasks=sortedTasks(data), stats=weeklyStats(data);
    const profile=state.profiles.find(p=>p.id===state.currentProfileId);
    if(state.currentView==='dashboard') {
      el('page-title').textContent='你好，'+(profile?.name || '同学');
      el('page-subtitle').textContent=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})+' · '+dayItems(data,localDateKey()).length+' 项安排，'+sortedTasks(data,'todo').length+' 项待办';
    }
    el('a1-home-courses').innerHTML = list.length?courseCards(data,list.slice(0,3)):empty('建立你的第一个课程工作区','已有课程表和成绩会出现在这里，也可以单独添加一门课程。',action('course-new','','＋ 添加课程','btn btn-primary'));
    el('a1-home-courses').classList.toggle('a1-course-grid',list.length>0);
    el('a1-home-tasks').innerHTML = tasks.length?taskRows(data,tasks.slice(0,5)):empty(taskTab==='done'?'还没有完成记录':'当前没有待办作业','从下一件要完成的事开始。',action('task-new','','＋ 添加作业','btn btn-primary'));
    document.querySelectorAll('[data-a1="task-tab"]').forEach(b=>b.classList.toggle('active',b.dataset.id===taskTab));
    el('a1-focus-hours').textContent=durationText(stats.seconds);
    el('a1-completed-count').textContent=stats.completed+' 项';
    const max=Math.max(...stats.daily,1);
    el('a1-week-bars').innerHTML=stats.daily.map((n,i)=>`<i style="--h:${n?Math.max(8,n/max*100):2}%" title="周${'一二三四五六日'[i]}：${Math.round(n/60)} 分钟"></i>`).join('');
    el('a1-week-bars').setAttribute('aria-label',stats.daily.map((n,i)=>'周'+'一二三四五六日'[i]+' '+Math.round(n/60)+' 分钟').join('，'));
    el('a1-summary-gpa').textContent=calculateGPA(data.courses || [],data.gpaAlgorithm || 'standard4');
    const spent=(data.transactions || []).filter(t=>t.type==='expense'&&String(t.date || '').slice(0,7)===localDateKey().slice(0,7)).reduce((sum,t)=>sum+(Number(t.amount)||0),0);
    const budget=Object.values(data.budget || {}).reduce((sum,n)=>sum+(Number(n)||0),0);
    el('a1-summary-budget').textContent='¥'+Math.round(spent);
    el('a1-budget-hint').textContent=budget?'预算 ¥'+budget+' · 剩余 ¥'+Math.round(budget-spent):'尚未设置分类预算';
    const goals=(data.goalsData || []).filter(g=>g.status!=='completed');
    el('a1-summary-goals').textContent=goals.length+' 个';
    const review=list.map(c=>({c,s:reviewStats(data,c)})).filter(x=>x.s.items.length).slice(0,2);
    el('a1-review-overview').innerHTML=review.length?review.map(({c,s})=>action('course',c.id,'<strong>'+esc(c.name)+' · 复习清单</strong><small>'+s.completed+' / '+s.items.length+' 项已完成</small>','')).join(''):empty('复习计划','在课程工作区建立清单，可以关联已有作业。',action('courses','','打开课程工作区 →'));
    renderAgenda(data);renderFocus(data);
  }
  function renderCourses() {
    const data=read();if(!data)return;
    const query=(el('a1-course-search').value || '').trim().toLocaleLowerCase();
    const list=courses(data).filter(c=>String(c.name || '').toLocaleLowerCase().includes(query));
    el('a1-all-courses').innerHTML=list.length?courseCards(data,list):empty(query?'没有匹配的课程':'还没有课程','添加课程工作区，或者从课程表、GPA 页面录入课程。',action('course-new','','＋ 添加课程','btn btn-primary'));
    el('a1-all-courses').classList.toggle('a1-course-list',list.length>0);
  }
  function refresh() {
    if(!state.currentProfileId)return;
    renderHome();
    if(state.currentView==='courses')renderCourses();
    if(currentCourse&&el('a1-dialog').dataset.kind==='course'&&!el('a1-dialog').hidden)openCourse(currentCourse,false);
  }
  function dialog(title,html,buttons='',kind='form',wide=false) {
    const root=el('a1-dialog');
    if(root.hidden)dialogReturn=document.activeElement;
    root.dataset.kind=kind;root.hidden=false;
    el('a1-dialog-title').textContent=title;
    el('a1-dialog-body').innerHTML=html;
    el('a1-dialog-actions').innerHTML=buttons||action('dialog-close','','关闭','btn btn-ghost');
    el('a1-dialog-panel').classList.toggle('a1-course-detail',wide);
    setTimeout(()=>{if(!root.hidden)root.querySelector('input:not([type=hidden]),select,button')?.focus();},20);
  }
  function closeDialog(){el('a1-dialog').hidden=true;currentCourse=null;dialogReturn?.focus();}
  function openCourse(id,focus=true) {
    const data=read(), c=courses(data).find(x=>x.id===id);if(!c){closeDialog();return;}
    currentCourse=id;const stats=reviewStats(data,c), tasks=(data.tasksData || []).filter(t=>belongs(t,c));
    const exams=(data.countdowns || []).filter(x=>belongs(x,c));
    const seconds=data.focusSessions.filter(s=>belongs(s,c)).reduce((n,s)=>n+(Number(s.seconds)||0),0);
    const grades=(data.courses || []).filter(g=>(c.gradeIds || []).includes(g.id));
    const schedule=(data.scheduleCourses || []).filter(s=>(c.scheduleIds || []).includes(s.id));
    const html=`<p class="a1-form-hint">${esc(c.subtitle || '课程工作区')} · 作业、复习与专注记录集中管理。</p><div class="a1-detail-meta"><span>复习 ${stats.completed}/${stats.items.length}</span><span>实际专注 ${durationText(seconds)}</span>${grades.map(g=>'<span>'+esc(g.name)+' · '+Number(g.credit)+' 学分 · '+esc(g.score)+' 分</span>').join('')}</div>
      ${schedule.length?'<p class="a1-form-hint">'+schedule.map(s=>esc('周'+'一二三四五六日'[Number(s.dayOfWeek)-1]+' '+s.startTime+'–'+s.endTime+' '+(s.location || ''))).join('<br>')+'</p>':''}
      <section class="a1-detail-section"><div class="a1-head"><h3>关联作业</h3>${action('course-task',id,'＋ 添加作业')}</div>${tasks.length?taskRows(data,tasks):'<p class="a1-form-hint">尚无关联作业。</p>'}</section>
      <section class="a1-detail-section"><h3>复习清单</h3>${stats.items.map(r=>{
        const linked=(data.tasksData || []).find(t=>t.id===r.taskId), completed=r.taskId?!!linked&&done(linked):!!r.completed;
        return `<div class="a1-review-row"><button type="button" class="a1-check" role="checkbox" aria-checked="${completed}" aria-label="${attr((completed?'恢复':'完成')+'复习项：'+r.title)}" data-a1="review-toggle" data-id="${attr(r.id)}">${completed?'✓':''}</button><span>${esc(r.title)}</span><small>${r.taskId?(linked?'关联作业':'作业已删除'):'独立清单'}</small>${action('review-delete',r.id,'删除')}</div>`;
      }).join('') || '<p class="a1-form-hint">建立清单后，课程卡会显示真实复习进度。</p>'}
      <div class="a1-inline-form"><label>复习项名称<input class="input" id="a1-review-title" maxlength="120" placeholder="例如：完成积分专题"></label><label>关联已有作业<select class="input" id="a1-review-task"><option value="">独立复习项</option>${tasks.map(t=>'<option value="'+attr(t.id)+'">'+esc(t.title)+'</option>').join('')}</select></label>${action('review-add',id,'添加','btn btn-primary')}</div></section>
      <section class="a1-detail-section"><h3>关联考试</h3>${exams.map(e=>'<div class="a1-review-row"><span>'+esc(e.name)+' · '+esc(e.date)+'</span>'+action('exam-edit',e.id,'编辑')+action('exam-unlink',e.id,'取消关联')+'</div>').join('') || '<p class="a1-form-hint">选择已有考试，或在考试页面新建。</p>'}<div class="a1-inline-form"><select class="input" id="a1-link-exam"><option value="">选择已有考试</option>${(data.countdowns || []).filter(e=>!e.courseId || belongs(e,c)).map(e=>'<option value="'+attr(e.id)+'">'+esc(e.name)+'</option>').join('')}</select>${action('exam-link',id,'关联考试','btn btn-ghost')}${action('course-exam',id,'新建考试','btn btn-ghost')}</div></section>`;
    dialog(c.name,html,action('course-manage',id,'编辑 / 关联课程','btn btn-ghost')+action('dialog-close','','关闭','btn btn-primary'),'course',true);
    if(!focus) el('a1-dialog-title').focus();
  }
  function reviewAdd(id) {
    const data=read(),c=courses(data).find(c=>c.id===id), title=el('a1-review-title').value.trim(), taskId=el('a1-review-task').value;
    if(!title)return toast('请输入复习项名称','error');
    data.courseReviewItems.push({id:uuid(),courseId:c.id,title,taskId:taskId||null,completed:false});
    if(write(data))refresh();
  }
  function taskToggle(id) {
    const data=read(),t=(data.tasksData || []).find(t=>t.id===id);if(!t)return;
    const previous={completed:t.completed,status:t.status,completedAt:t.completedAt};
    t.completed=!done(t);t.status=t.completed?'done':'todo';t.completedAt=t.completed?new Date().toISOString():null;
    if(write(data)){refresh();toast(t.completed?'作业已完成':'作业已恢复','success');undo('撤销作业状态',()=>{const latest=read();const found=(latest.tasksData || []).find(x=>x.id===id);if(found){Object.assign(found,previous);write(latest);refresh();}});}
  }
  let undoFn=null;
  function undo(label,fn){undoFn={profileId:state.currentProfileId,fn};const button=el('a1-undo');button.textContent=label;button.hidden=false;}
  function reviewToggle(id) {
    const data=read(),r=data.courseReviewItems.find(r=>r.id===id);if(!r)return;
    if(r.taskId){if(!(data.tasksData || []).some(t=>t.id===r.taskId))return toast('关联作业已删除，请重新建立复习项','error');return taskToggle(r.taskId);}
    r.completed=!r.completed;if(write(data))refresh();
  }
  function courseForm(id='') {
    const data=read(),all=courses(data),c=all.find(x=>x.id===id),owned=data.learningCourses.find(x=>x.id===id);
    const usedS=new Set(data.learningCourses.filter(x=>x.id!==id).flatMap(x=>x.scheduleIds || []));
    const usedG=new Set(data.learningCourses.filter(x=>x.id!==id).flatMap(x=>x.gradeIds || []));
    const choices=(records,type,used,selected)=>records.filter(r=>!used.has(r.id)).map(r=>`<label class="a1-review-row"><input type="checkbox" name="a1-${type}-link" value="${attr(r.id)}" ${(selected || []).includes(r.id)?'checked':''}><span>${esc(r.name)}${type==='grade'?' · '+esc((data.semesters || []).find(s=>s.id===r.semesterId)?.name || '成绩'):' · 周'+'一二三四五六日'[Number(r.dayOfWeek)-1]+' '+esc(r.startTime || '')}</span></label>`).join('');
    dialog(c?'编辑课程工作区':'新建课程工作区',`<input type="hidden" id="a1-course-id" value="${attr(id)}"><div class="form-group"><label for="a1-course-name">课程名称</label><input class="input" id="a1-course-name" maxlength="100" value="${attr(c?.name || '')}" required></div><p class="a1-form-hint">勾选属于同一门课程的课程表和成绩记录，保留原始数据。不会按名称自动合并。</p><div class="a1-detail-section"><h3>关联课程表</h3>${choices(data.scheduleCourses || [],'schedule',usedS,c?.scheduleIds) || '<p class="a1-form-hint">暂无可关联课程，可稍后在课程表录入。</p>'}</div><div class="a1-detail-section"><h3>关联成绩</h3>${choices(data.courses || [],'grade',usedG,c?.gradeIds) || '<p class="a1-form-hint">暂无可关联成绩，可稍后在 GPA 页面录入。</p>'}</div><p class="a1-form-error" id="a1-form-error" role="alert"></p>`,(owned?action('course-delete',id,'删除工作区','btn btn-danger'):'')+action('dialog-close','','取消','btn btn-ghost')+action('course-save','','保存课程','btn btn-primary'));
  }
  function courseSave(){
    const data=read(),id=el('a1-course-id').value,name=el('a1-course-name').value.trim();
    if(!name)return el('a1-form-error').textContent='请输入课程名称。';
    const scheduleIds=[...document.querySelectorAll('[name=a1-schedule-link]:checked')].map(x=>x.value),gradeIds=[...document.querySelectorAll('[name=a1-grade-link]:checked')].map(x=>x.value);
    const existing=data.learningCourses.find(c=>c.id===id),newId=existing?.id || 'lc_'+uuid();
    if(!existing && id){ // Keep pre-existing references when a virtual workspace becomes explicit.
      ['tasksData','courseReviewItems','focusSessions','countdowns'].forEach(key=>(data[key] || []).forEach(r=>{if(r.courseId===id)r.courseId=newId;}));
      if(data.focusActive?.courseId===id)data.focusActive.courseId=newId;
    }
    const record={id:newId,name,scheduleIds,gradeIds};
    if(existing)Object.assign(existing,record);else data.learningCourses.push(record);
    if(write(data)){closeDialog();refresh();renderCourses();toast('课程工作区已保存','success');}
  }
  function slotForm(taskId='',slotId='') {
    const data=read(),slot=data.studySlots.find(s=>s.id===slotId),tasks=data.tasksData || [],task=tasks.find(t=>t.id===(slot?.taskId || taskId));
    if(!tasks.length)return toast('先添加一项作业，再安排学习时段','info');
    dialog(slot?'编辑学习时段':'安排学习时段',`<input type="hidden" id="a1-slot-id" value="${attr(slotId)}"><div class="form-group"><label for="a1-slot-task">关联作业</label><select class="input" id="a1-slot-task">${tasks.map(t=>'<option value="'+attr(t.id)+'" '+(t.id===task?.id?'selected':'')+'>'+esc(t.title)+(done(t)?'（已完成）':'')+'</option>').join('')}</select></div><div class="form-group"><label for="a1-slot-date">日期</label><input class="input" type="date" id="a1-slot-date" value="${attr(slot?.date || selectedDate)}" required></div><div class="form-row"><div class="form-group"><label for="a1-slot-start">开始时间</label><input class="input" type="time" id="a1-slot-start" value="${attr(slot?.startTime || '18:00')}" required></div><div class="form-group"><label for="a1-slot-minutes">时长（分钟）</label><input class="input" type="number" min="1" max="720" id="a1-slot-minutes" value="${slot?toMin(slot.endTime)-toMin(slot.startTime):Number(task?.estimatedMinutes)||45}" required></div></div><p class="a1-form-hint">检查课程、日程与已有学习时段的重叠。任务原截止日期保持不变。课程冲突采用课程表当前选择的第 ${Number(scheduleWeek)||1} 周推算。</p><p class="a1-form-error" id="a1-form-error" role="alert"></p>`,(slot?action('slot-delete',slot.id,'删除时段','btn btn-danger'):'')+action('dialog-close','','取消','btn btn-ghost')+action('slot-save','','保存时段','btn btn-primary'));
    el('a1-slot-task').addEventListener('change',()=>{const t=tasks.find(t=>t.id===el('a1-slot-task').value);el('a1-slot-minutes').value=Number(t?.estimatedMinutes)||45;});
  }
  function slotSave(){
    const data=read(),id=el('a1-slot-id').value,task=(data.tasksData || []).find(t=>t.id===el('a1-slot-task').value),date=el('a1-slot-date').value,time=el('a1-slot-start').value,minutes=Number(el('a1-slot-minutes').value);
    const fail=text=>el('a1-form-error').textContent=text;
    if(!task||!Number.isFinite(calendarDaysUntil(date))||!/^\d{2}:\d{2}$/.test(time)||!Number.isInteger(minutes)||minutes<1||minutes>720)return fail('请选择作业、有效日期和时间，并填写 1–720 分钟的时长。');
    const start=toMin(time),end=start+minutes;if(end>1440)return fail('这个学习时段跨越午夜，请缩短时长或提前开始。');
    const conflicts=dayItems(data,date).filter(e=>!(e.kind==='slot'&&e.id===id)&&e.start&&e.end&&start<toMin(e.end)&&toMin(e.start)<end);
    if(conflicts.length)return fail('与「'+conflicts.map(c=>c.title).join('、')+'」重叠，请调整时间。');
    const endTime=end===1440?'24:00':String(Math.floor(end/60)).padStart(2,'0')+':'+String(end%60).padStart(2,'0');
    const slot={id:id||'slot_'+uuid(),taskId:task.id,title:task.title,date,startTime:time,endTime};
    const index=data.studySlots.findIndex(s=>s.id===id);if(index<0)data.studySlots.push(slot);else data.studySlots[index]=slot;
    if(write(data)){selectedDate=date;closeDialog();refresh();if(state.currentView==='plan')renderStudySlots();toast('学习时段已保存','success');}
  }
  function elapsed(active,now=Date.now()) {
    return Math.max(0,Math.min(Number(active.targetSeconds)*1000,(Number(active.elapsedMs)||0)+(active.status==='running'?Math.max(0,now-Number(active.startedAt)):0)));
  }
  function focusToggle(taskId='') {
    const data=read();if(!data)return;
    let active=data.focusActive;
    if(active&&taskId&&active.taskId!==taskId)return toast('请先结束当前专注记录，再切换任务','info');
    if(!active){
      const selected=taskId || el('a1-focus-select').value,task=(data.tasksData || []).find(t=>t.id===selected);
      if(!task||done(task))return toast('选择一项未完成的作业，再开始专注','info');
      const minutes=Number(el('a1-focus-duration').value);
      if(!Number.isInteger(minutes)||minutes<1||minutes>180)return toast('专注时长应为 1–180 分钟','error');
      active={id:'focus_'+uuid(),taskId:task.id,courseId:task.courseId || null,title:task.title,targetSeconds:minutes*60,elapsedMs:0,startedAt:Date.now(),status:'running',createdAt:new Date().toISOString()};
      data.focusActive=active;
    }else if(active.status==='running'){
      active.elapsedMs=elapsed(active);active.startedAt=null;active.status=active.elapsedMs>=active.targetSeconds*1000?'ready':'paused';
    }else if(active.status==='ready'){return focusFinish();}
    else {active.startedAt=Date.now();active.status='running';}
    if(write(data)){renderFocus(data);if(state.currentView==='dashboard')el('a1-focus-box').scrollIntoView({block:'nearest',behavior:'smooth'});}
  }
  function focusPause(profileId=state.currentProfileId){
    const data=read(profileId),a=data?.focusActive;if(!a||a.status!=='running')return;
    a.elapsedMs=elapsed(a);a.startedAt=null;a.status=a.elapsedMs>=a.targetSeconds*1000?'ready':'paused';write(data,profileId);
  }
  function renderFocus(data){
    const a=data.focusActive,select=el('a1-focus-select');
    const previous=select.value;
    select.innerHTML='<option value="">选择一项作业</option>'+(data.tasksData || []).filter(t=>!done(t)||t.id===a?.taskId).map(t=>'<option value="'+attr(t.id)+'">'+esc(t.title)+'</option>').join('');
    select.value=a?.taskId || previous;select.disabled=!!a;
    el('a1-focus-duration').disabled=!!a;
    if(a)el('a1-focus-duration').value=String(a.targetSeconds/60);
    el('a1-focus-end').disabled=!a;
    tickFocus();
  }
  function tickFocus(){
    const data=read(),a=data?.focusActive;if(!data)return;
    if(a&&a.status==='running'&&elapsed(a)>=a.targetSeconds*1000){a.elapsedMs=a.targetSeconds*1000;a.startedAt=null;a.status='ready';write(data);toast('本轮专注结束，点击结束记录保存实际时长','success');}
    const seconds=Math.max(0,Math.ceil(a?a.targetSeconds-elapsed(a)/1000:(Number(el('a1-focus-duration').value)||25)*60));
    const timer=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    el('a1-timer').textContent=timer;
    el('a1-focus-toggle').textContent=a?.status==='running'?'Ⅱ 暂停':a?.status==='ready'?'保存记录':a?'▶ 继续':'▶ 开始专注';
    el('a1-focus-task').textContent=a?(a.status==='ready'?'本轮已结束 · ':a.status==='paused'?'已暂停 · ':'当前任务 · ')+a.title:'选择任务，把注意力留给一件事。';
    const floating=el('a1-floating-focus');floating.hidden=!a||state.currentView==='dashboard';
    floating.innerHTML=icon('play',15)+' <span>'+timer+' · '+(a?.status==='paused'?'已暂停':a?.status==='ready'?'待保存':'专注中')+'</span>';
  }
  function focusFinish(){
    const data=read(),a=data?.focusActive;if(!a)return;
    focusPause();const active=read().focusActive,seconds=Math.floor(elapsed(active)/1000),task=(data.tasksData || []).find(t=>t.id===a.taskId);
    dialog('结束本轮专注',`<p class="a1-form-hint">${esc(a.title)}</p><p>实际专注 <strong>${Math.floor(seconds/60)} 分 ${seconds%60} 秒</strong></p><p class="a1-form-hint">记录归入当前档案和关联课程；暂停时间不计入专注。</p>${task&&!done(task)?'<label class="a1-review-row"><input type="checkbox" id="a1-focus-complete"><span>同时将关联作业标记为完成</span></label>':''}<input type="hidden" id="a1-finish-id" value="${attr(a.id)}">`,action('dialog-close','','继续保留','btn btn-ghost')+action('focus-save','','保存并结束','btn btn-primary'));
  }
  function focusSave(){
    const data=read(),a=data.focusActive;if(!a||a.id!==el('a1-finish-id').value)return closeDialog();
    const seconds=Math.floor(elapsed(a)/1000);
    if(seconds>0&&!data.focusSessions.some(s=>s.id===a.id))data.focusSessions.push({id:a.id,taskId:a.taskId,courseId:a.courseId,title:a.title,seconds,startedAt:a.createdAt,endedAt:new Date().toISOString()});
    if(el('a1-focus-complete')?.checked){const task=(data.tasksData || []).find(t=>t.id===a.taskId);if(task){task.completed=true;task.status='done';task.completedAt=new Date().toISOString();}}
    data.focusActive=null;
    if(write(data)){closeDialog();refresh();toast(seconds>0?'专注记录已保存':'本轮不足 1 秒，已结束且未计入统计','success');}
  }
  function focusHistory(){
    const data=read(),sessions=data.focusSessions.slice().sort((a,b)=>new Date(b.endedAt)-new Date(a.endedAt));
    dialog('专注记录',sessions.length?sessions.slice(0,100).map(s=>'<div class="a1-review-row"><span>'+esc(s.title)+'<small style="display:block">'+esc(new Date(s.endedAt).toLocaleString('zh-CN'))+'</small></span><strong>'+Math.floor(s.seconds/60)+' 分 '+s.seconds%60+' 秒</strong></div>').join(''):'<p class="a1-form-hint">还没有专注记录。结束一轮专注并保存后，会在这里显示。</p>');
  }
  function profileBackup(){
    const backup=storageGet('pre_a1_'+state.currentProfileId,null);if(!backup)return toast('当前档案没有升级前备份','info');
    const profile=state.profiles.find(p=>p.id===state.currentProfileId);
    downloadJSON({profiles:[profile],currentProfileId:profile.id,exportDate:backup.date,['data_'+profile.id]:backup.data},'DanDanTable_升级前备份_'+localDateKey()+'.json');
  }
  function downloadJSON(data,name){const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function estimateField(){
    const id=el('task-edit-id')?.value,data=read(),task=(data?.tasksData || []).find(t=>t.id===id);
    const target=el('task-course');if(!target)return;
    const current=target.value;target.innerHTML='<option value="">无</option>'+courses(data).map(c=>'<option value="'+attr(c.id)+'">'+esc(c.name)+(c.subtitle?' · '+esc(c.subtitle):'')+'</option>').join('');
    const related=courseOf(data,current);target.value=related?.id || current;
    el('task-due').closest('.form-group').insertAdjacentHTML('afterend','<div class="form-group"><label for="a1-task-estimate">预计用时（分钟，可不填）</label><input class="input" id="a1-task-estimate" type="number" min="1" max="720" value="'+(task?.estimatedMinutes || '')+'"></div>');
  }
  function installHooks(){
    const hook=(name,fn)=>{originals[name]=window[name];window[name]=fn;};
    hook('renderDashboard',function(){originals.renderDashboard();renderHome();});
    hook('switchView',function(view){
      if(view==='courses'){
        disposeViewCharts(state.currentView);state.currentView='courses';document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));el('view-courses').classList.add('active');
        el('page-title').textContent='课程工作区';el('page-subtitle').textContent='课程、作业、考试与复习清单，一处管理';renderCourses();
        el('sidebar').classList.remove('open');el('sidebar-overlay').classList.remove('show');
      }else originals.switchView(view);
      moveTopbar();setNav();tickFocus();window.scrollTo({top:0});
    });
    hook('switchStudySection',function(sec){originals.switchStudySection(sec);moveTopbar();setNav();tickFocus();window.scrollTo({top:0});});
    hook('enterProfile',function(id){
      if(state.currentProfileId&&state.currentProfileId!==id)focusPause();
      selectedDate=localDateKey();undoFn=null;el('a1-undo').hidden=true;closeDialog();
      originals.enterProfile(id);migrate();refresh();moveTopbar();setNav();
    });
    hook('logout',function(){focusPause();closeDialog();el('a1-floating-focus').hidden=true;el('a1-undo').hidden=true;undoFn=null;originals.logout();});
    hook('showAddTask',function(){originals.showAddTask();estimateField();});
    hook('taskEdit',function(id){originals.taskEdit(id);estimateField();});
    hook('taskSave',function(){
      const estimate=el('a1-task-estimate'),minutes=Number(estimate?.value),data=read(),id=el('task-edit-id').value;
      if(estimate?.value&&(!Number.isInteger(minutes)||minutes<1||minutes>720))return toast('预计用时应为 1–720 分钟','error');
      if(!el('task-title').value.trim())return toast('请输入任务标题','error');
      const oldIds=new Set((data.tasksData || []).map(t=>t.id));originals.taskSave();
      const updated=read(),task=(updated.tasksData || []).find(t=>id?t.id===id:!oldIds.has(t.id));
      if(task){task.estimatedMinutes=estimate?.value?minutes:null;write(updated);}
      refresh();
    });
    // Existing task board actions and A1 cards reference the same task record.
    ['taskToggleComplete','taskSetStatus','taskDelete','completeDashboardTask','scheduleSaveCourse','scheduleDeleteCourse','saveCourse','deleteCourse','saveCountdown'].forEach(name=>{
      const original=window[name];if(typeof original!=='function')return;
      window[name]=function(...args){const value=original(...args);refresh();return value;};
    });
    const deleteTask=window.taskDelete;
    window.taskDelete=function(id){
      const data=read(),index=(data.tasksData || []).findIndex(t=>t.id===id),record=data.tasksData?.[index];
      deleteTask(id);
      if(record&&!(read().tasksData || []).some(t=>t.id===id))undo('撤销删除作业',()=>{const d=read();if(!(d.tasksData || []).some(t=>t.id===id)){d.tasksData=d.tasksData || [];d.tasksData.splice(index,0,record);write(d);if(state.currentView==='tasks')renderTasksView();refresh();}});
    };
    hook('renderPlan',function(){originals.renderPlan();renderStudySlots();});
    hook('collectLocalData',function(){Object.keys(cacheDirty).forEach(id=>{if(cacheDirty[id]&&dataCache[id])saveProfileData(id,dataCache[id]);});return originals.collectLocalData();});
    hook('clearAllData',function(){originals.clearAllData();if(!state.currentProfileId){closeDialog();el('a1-floating-focus').hidden=true;el('a1-undo').hidden=true;undoFn=null;}});
  }
  function renderStudySlots(){
    const data=read(),root=el('view-plan');if(!data||!root)return;
    let block=el('a1-plan-slots');if(!block){block=document.createElement('section');block.id='a1-plan-slots';block.className='card';root.append(block);}
    const slots=data.studySlots.filter(s=>s.date>=localDateKey()).sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime));
    block.innerHTML='<div class="a1-head"><h2>学习时段</h2>'+action('slot-new','','＋ 安排时段')+'</div>'+(slots.length?slots.slice(0,30).map(s=>{const t=(data.tasksData || []).find(t=>t.id===s.taskId);return '<div class="a1-review-row"><span>'+esc(t?.title || s.title)+'<small style="display:block">'+esc(s.date)+' · '+esc(s.startTime)+'–'+esc(s.endTime)+'</small></span>'+action('slot-edit',s.id,'编辑')+'</div>';}).join(''):'<p class="a1-form-hint">尚无后续学习安排，可从作业中安排专属时段。</p>');
  }
  function setNav(){document.querySelectorAll('.sidebar [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.currentView || (b.dataset.view==='study'&&state.currentView==='plan')));}
  function moveTopbar(){const home=state.currentView==='dashboard',topbar=document.querySelector('.topbar'),main=document.querySelector('.main');main.classList.toggle('a1-home',home);if(home)el('a1-work').prepend(topbar);else main.prepend(topbar);}
  function dispatch(name,id,node){
    switch(name){
      case 'courses':return switchView('courses');
      case 'course':return openCourse(id);
      case 'course-new':return courseForm();
      case 'course-manage':return courseForm(id);
      case 'course-save':return courseSave();
      case 'course-delete':{
        const data=read(),record=data.learningCourses.find(c=>c.id===id);if(!record)return;
        const index=data.learningCourses.indexOf(record);data.learningCourses.splice(index,1);
        // Keep related tasks, source courses, reviews and sessions; unassign only this workspace.
        const changed=[];['tasksData','courseReviewItems','focusSessions','countdowns'].forEach(key=>(data[key] || []).forEach(r=>{if(r.courseId===id){changed.push({key,id:r.id});r.courseId=null;}}));
        if(write(data)){closeDialog();refresh();renderCourses();undo('撤销删除课程工作区',()=>{const d=read();d.learningCourses.splice(index,0,record);changed.forEach(x=>{const r=(d[x.key] || []).find(r=>r.id===x.id);if(r&&!r.courseId)r.courseId=id;});write(d);refresh();renderCourses();});}return;
      }
      case 'course-task':closeDialog();showAddTask();el('task-course').value=id;return;
      case 'task-new':return showAddTask();
      case 'task-edit':closeDialog();return taskEdit(id);
      case 'task-toggle':return taskToggle(id);
      case 'task-tab':taskTab=id;return renderHome();
      case 'review-add':return reviewAdd(id);
      case 'review-toggle':return reviewToggle(id);
      case 'review-delete':{
        const data=read(),index=data.courseReviewItems.findIndex(r=>r.id===id);if(index<0)return;
        const [record]=data.courseReviewItems.splice(index,1);if(write(data)){refresh();undo('撤销删除复习项',()=>{const d=read();d.courseReviewItems.splice(index,0,record);write(d);refresh();});}return;
      }
      case 'exam-link':{
        const data=read(),exam=(data.countdowns || []).find(e=>e.id===el('a1-link-exam').value);if(!exam)return toast('请选择已有考试','info');exam.courseId=id;if(write(data))refresh();return;
      }
      case 'exam-edit':closeDialog();return editCountdown(id);
      case 'exam-unlink':{const data=read(),exam=(data.countdowns || []).find(e=>e.id===id);if(exam){exam.courseId=null;if(write(data))refresh();}return;}
      case 'course-exam':{
        closeDialog();showAddCountdown();const data=read(),c=courses(data).find(c=>c.id===id);el('countdown-name').value=(c?.name || '')+'考试';
        const field=document.createElement('input');field.type='hidden';field.id='a1-countdown-course';field.value=id;el('modal-add-countdown').querySelector('.modal').append(field);return;
      }
      case 'exams':return switchView('countdown');
      case 'exam-new':return showAddCountdown();
      case 'schedule-edit':return scheduleEditCourse(id);
      case 'event-edit':return editScheduleEvent(id);
      case 'slot-new':return slotForm(id);
      case 'slot-edit':return slotForm('',id);
      case 'slot-save':return slotSave();
      case 'slot-delete':{
        const data=read(),index=data.studySlots.findIndex(s=>s.id===id);if(index<0)return;const [slot]=data.studySlots.splice(index,1);
        if(write(data)){closeDialog();refresh();if(state.currentView==='plan')renderStudySlots();undo('撤销删除学习时段',()=>{const d=read();d.studySlots.splice(index,0,slot);write(d);refresh();if(state.currentView==='plan')renderStudySlots();});}return;
      }
      case 'date':selectedDate=id;return renderAgenda(read());
      case 'week-prev':case 'week-next':{const d=dateFromKey(selectedDate);d.setDate(d.getDate()+(name==='week-prev'?-7:7));selectedDate=localDateKey(d);return renderAgenda(read());}
      case 'today':selectedDate=localDateKey();return renderAgenda(read());
      case 'focus-task':closeDialog();switchView('dashboard');return focusToggle(id);
      case 'focus-toggle':return focusToggle();
      case 'focus-end':return focusFinish();
      case 'focus-save':return focusSave();
      case 'focus-history':return focusHistory();
      case 'focus-duration':if(!read()?.focusActive){el('a1-focus-duration').value=id;tickFocus();}return;
      case 'floating-focus':switchView('dashboard');el('a1-focus-box').scrollIntoView({block:'nearest'});return;
      case 'view-gpa':return switchView('gpa');
      case 'view-finance':return switchView('finance');
      case 'view-goals':return switchView('goals');
      case 'data-manager':return showDataManager();
      case 'profile-backup':return profileBackup();
      case 'undo':if(undoFn?.profileId===state.currentProfileId)undoFn.fn();undoFn=null;node.hidden=true;return;
      case 'dialog-close':return closeDialog();
    }
  }
  function mount(){
    document.body.classList.add('a1-app');
    const dashboard=el('view-dashboard'),legacy=document.createElement('div');legacy.className='a1-legacy';legacy.setAttribute('aria-hidden','true');while(dashboard.firstChild)legacy.append(dashboard.firstChild);dashboard.append(legacy);
    dashboard.insertAdjacentHTML('afterbegin',`<div class="a1-board"><div class="a1-work" id="a1-work">
      <section><div class="a1-head"><h2>课程工作区</h2>${action('courses','','全部课程 ↗')}</div><div id="a1-home-courses" class="a1-course-grid"></div></section>
      <div class="a1-mid"><section><div class="a1-head"><h2>优先作业</h2>${action('task-new','','＋ 添加作业')}</div><div class="a1-task-tabs">${['todo','all','done'].map(t=>action('task-tab',t,{todo:'待办',all:'全部',done:'已完成'}[t],t==='todo'?'active':'')).join('')}</div><div id="a1-home-tasks"></div>${action('view-tasks','','全部作业 →')}</section>
      <section class="a1-focus-area"><div class="a1-focus" id="a1-focus-box"><div class="a1-focus-heading"><strong>专注一件事</strong><small>学习计时</small></div><div class="a1-timer" id="a1-timer" role="timer">25:00</div><p class="a1-focus-task" id="a1-focus-task"></p><select id="a1-focus-select" aria-label="选择专注任务"></select><div class="a1-focus-buttons">${action('focus-toggle','','▶ 开始专注','btn btn-primary')}${action('focus-end','','结束记录','btn btn-ghost')}</div><div class="a1-duration"><label for="a1-focus-duration">时长</label><input id="a1-focus-duration" type="number" min="1" max="180" value="25" aria-label="专注时长（分钟）" style="width:64px;padding:4px 7px;border:1px solid #dfe6d5;border-radius:6px;background:white">分钟${action('focus-duration','25','25 分')}${action('focus-duration','45','45 分')}</div></div>
      <div class="a1-mini-stats"><div class="a1-mini-stat"><small>本周实际专注</small><strong id="a1-focus-hours">0.0 h</strong><div class="a1-bars" id="a1-week-bars" role="img"></div>${action('focus-history','','查看记录 →')}</div><div class="a1-mini-stat"><small>本周完成作业</small><strong id="a1-completed-count">0 项</strong><small>依据完成日期统计</small></div></div></section></div>
      <div class="a1-review-summary" id="a1-review-overview"></div><div class="a1-summary"><button data-a1="view-gpa"><small>累计 GPA</small><strong id="a1-summary-gpa">--</strong><small>课程加权成绩 →</small></button><button data-a1="view-finance"><small>本月支出</small><strong id="a1-summary-budget">¥0</strong><small id="a1-budget-hint"></small></button><button data-a1="view-goals"><small>进行中的目标</small><strong id="a1-summary-goals">0 个</strong><small>目标与里程碑 →</small></button></div><div class="a1-status"><span>● 当前档案独立保存</span>${action('data-manager','','导出 / 云备份')}${action('profile-backup','','升级前备份')}</div><button type="button" class="a1-link" id="a1-undo" data-a1="undo" hidden></button>
      </div><aside class="a1-agenda" aria-label="日程"><div class="a1-head"><h2>日程</h2>${action('today','','今天')}</div><div class="a1-calendar-month"><strong id="a1-calendar-title"></strong><span>${action('week-prev','','‹')}${action('week-next','','›')}</span></div><div class="a1-week">${'一二三四五六日'.split('').map(d=>'<small>'+d+'</small>').join('')}</div><div class="a1-week" id="a1-calendar-days"></div><div class="a1-agenda-head"><strong id="a1-agenda-title">今日日程</strong><input id="a1-date-input" type="date" aria-label="选择日程日期"></div><div id="a1-agenda-items"></div>${action('slot-new','','＋ 安排一个学习时段','a1-schedule-add')}<div class="a1-exam" id="a1-nearest-exam"></div><p class="a1-note">给重要的事留出时间，也给自己留一点余裕。</p></aside></div>`);
  }
  mount();
  // Assign stable control identifiers before first render.
  document.querySelector('[data-a1=focus-toggle]').id='a1-focus-toggle';
  document.querySelector('[data-a1=focus-end]').id='a1-focus-end';
  document.querySelector('.main').insertAdjacentHTML('beforeend','<div class="view" id="view-courses"><div class="a1-courses-toolbar"><p>明确关联已有课程，保留课程表与成绩原始记录。</p><div style="display:flex;gap:10px;flex-wrap:wrap"><input class="input" id="a1-course-search" placeholder="搜索课程" aria-label="搜索课程" style="padding:9px 12px">'+action('course-new','','＋ 新建工作区','btn btn-primary')+'</div></div><div id="a1-all-courses" class="a1-course-list"></div></div>');
  const nav=el('sidebar').querySelector('.sidebar-nav');
  nav.insertAdjacentHTML('afterbegin',`<button class="nav-item" data-view="courses" onclick="switchView('courses')">${icon('book')}课程工作区</button>`);
  const study=nav.querySelector('[data-view=study]');
  study.insertAdjacentHTML('afterend',`<button class="nav-item" data-view="tasks" onclick="switchView('tasks')">${icon('check')}作业任务</button><button class="nav-item" data-view="goals" onclick="switchView('goals')">${icon('target')}目标与计划</button>`);
  nav.querySelector('[data-view=dashboard]').innerHTML=icon('home')+'今天总览';nav.prepend(nav.querySelector('[data-view=dashboard]'));
    const newTask=document.createElement('button');newTask.className='btn btn-primary a1-new-task';newTask.type='button';newTask.dataset.a1='task-new';newTask.textContent='＋ 新建';document.querySelector('.topbar-actions').append(newTask);
  document.body.insertAdjacentHTML('beforeend',`<div class="a1-dialog" id="a1-dialog" hidden><div class="modal" id="a1-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="a1-dialog-title" tabindex="-1"><h2 class="modal-title" id="a1-dialog-title" tabindex="-1"></h2><div id="a1-dialog-body"></div><div class="modal-actions" id="a1-dialog-actions"></div></div></div><button class="a1-floating-focus" id="a1-floating-focus" data-a1="floating-focus" hidden></button>`);
  document.body.append(el('a1-undo'));
  document.addEventListener('click',event=>{const node=event.target.closest('[data-a1]');if(node){if(node.dataset.a1==='view-tasks')return switchView('tasks');dispatch(node.dataset.a1,node.dataset.id || '',node);}});
  el('a1-date-input').addEventListener('change',event=>{if(Number.isFinite(calendarDaysUntil(event.target.value))){selectedDate=event.target.value;renderAgenda(read());}});
  el('a1-course-search').addEventListener('input',renderCourses);
  el('a1-focus-duration').addEventListener('change',tickFocus);
  el('a1-dialog').addEventListener('click',event=>{if(event.target===el('a1-dialog'))closeDialog();});
  document.addEventListener('keydown',event=>{
    const root=el('a1-dialog');if(root.hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeDialog();return;}
    if(event.key==='Tab'){
      const nodes=[...root.querySelectorAll('button:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled])')];
      const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  });
  installHooks();
  // Persist explicit course selection when creating an exam inside a workspace.
  const examSave=window.saveCountdown;
  window.saveCountdown=function(){const field=el('a1-countdown-course'),id=field?.value,previous=(read()?.countdowns || []).map(c=>c.id);examSave();if(id&&!el('modal-add-countdown').classList.contains('show')){const data=read(),exam=(data.countdowns || []).find(c=>!previous.includes(c.id));if(exam){exam.courseId=id;write(data);refresh();}field.remove();}};
  const examNew=window.showAddCountdown;window.showAddCountdown=function(){el('a1-countdown-course')?.remove();examNew();};
  const examEdit=window.editCountdown;window.editCountdown=function(id){el('a1-countdown-course')?.remove();examEdit(id);};
  const backupBtn=el('modal-data-manager')?.querySelector('.modal-actions');if(backupBtn)backupBtn.insertAdjacentHTML('beforeend',action('profile-backup','','升级前备份','btn btn-ghost'));
  window.addEventListener('storage',event=>{if(state.currentProfileId&&event.key===STORAGE_PREFIX+'data_'+state.currentProfileId){delete dataCache[state.currentProfileId];delete cacheDirty[state.currentProfileId];refresh();}});
  window.DanDanA1={courses,reviewStats,dayItems,weeklyStats,elapsed,read,renderHome,renderCourses,focusToggle,focusPause,focusFinish,focusSave,openCourse,slotForm,slotSave,taskToggle};
  migrate();if(state.currentProfileId){renderHome();moveTopbar();setNav();}setInterval(tickFocus,500);
})();

