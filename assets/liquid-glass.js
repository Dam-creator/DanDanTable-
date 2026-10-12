/* Presentation only: no profile writes, timer changes or cloud requests. */
(() => {
  'use strict';
  const body = document.body;
  body.classList.add('liquid-app');
  const work = document.getElementById('a1-work');
  const coursePanel = document.getElementById('a1-home-courses').closest('section');
  const tasks = document.getElementById('a1-home-tasks').closest('section');
  coursePanel.classList.add('lg-courses');
  tasks.classList.add('lg-tasks');
  tasks.querySelector('h2').textContent = '今日优先';
  coursePanel.querySelector('h2').textContent = '我的课程';
  // Keep the existing IDs and handlers; only rearrange presentation nodes.
  const left = document.createElement('div'), right = document.createElement('div');
  left.className = 'lg-left'; right.className = 'lg-right';
  left.append(tasks, document.querySelector('.a1-mini-stats'), coursePanel,
    document.getElementById('a1-review-overview'), document.querySelector('.a1-summary'), document.querySelector('.a1-status'));
  right.append(document.getElementById('a1-focus-box'), document.querySelector('.a1-agenda'));
  document.querySelector('.a1-mid').remove();
  work.append(left, right);
  document.querySelector('.sidebar-logo-text').insertAdjacentHTML('afterend', '<small class="lg-brand-note">YOUR STUDY SPACE</small>');
  const headline = document.querySelector('.topbar-title');
  headline.insertAdjacentHTML('beforeend', '<div class="lg-greeting">今天，稳步向前<span aria-hidden="true"> ⤴</span></div>');

  // Highlights are local to the hovered surface. One RAF, no document-wide
  // per-frame queries, no transforms on text, and no sensor permissions.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = '.nav-item,.btn-primary,.search-box,.a1-focus,.a1-course,.lg-tasks,.a1-mini-stat,.a1-agenda,.modal,.bottom-nav';
  let active = null, frame = 0, settle = 0, point = null, previous = null;
  const enabled = () => fine.matches && !reduced.matches && !document.hidden;
  function clear() {
    cancelAnimationFrame(frame); clearTimeout(settle); frame = 0; point = null; previous = null;
    if (active) { active.classList.remove('lg-tracking'); active.style.removeProperty('--lg-energy'); }
    active = null;
  }
  function paint() {
    frame = 0;
    if (!enabled() || !active?.isConnected || !point) { clear(); return; }
    const rect = active.getBoundingClientRect();
    if (!rect.width || !rect.height) { clear(); return; }
    const x = Math.max(0, Math.min(1, (point.x - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (point.y - rect.top) / rect.height));
    const speed = previous ? Math.min(1, Math.hypot(point.x - previous.x, point.y - previous.y) / Math.max(1, point.t - previous.t) / 2) : 0;
    active.style.setProperty('--lg-x', (x * 100).toFixed(2) + '%');
    active.style.setProperty('--lg-y', (y * 100).toFixed(2) + '%');
    active.style.setProperty('--lg-angle', (Math.atan2(y - .5, x - .5) * 180 / Math.PI + 90).toFixed(1) + 'deg');
    active.style.setProperty('--lg-energy', (.28 + speed * .35).toFixed(2));
    active.classList.add('lg-tracking');
    previous = point;
    clearTimeout(settle);
    const painted = active;
    settle = setTimeout(() => { if (active === painted) active.style.setProperty('--lg-energy', '.18'); }, 160);
  }
  document.addEventListener('pointermove', event => {
    if (!enabled() || event.pointerType !== 'mouse') return;
    const target = event.target.closest(selector);
    if (!target || !target.closest('.app,.a1-dialog,.modal-overlay')) { clear(); return; }
    if (target !== active) { clear(); active = target; }
    point = {x:event.clientX, y:event.clientY, t:event.timeStamp};
    if (!frame) frame = requestAnimationFrame(paint);
  }, {passive:true});
  document.addEventListener('pointerout', event => { if (active && !active.contains(event.relatedTarget)) clear(); }, {passive:true});
  document.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') clear(); }, {passive:true});
  document.addEventListener('visibilitychange', clear);
  window.addEventListener('blur', clear);
  window.addEventListener('scroll', clear, {passive:true});
  fine.addEventListener('change', clear);
  reduced.addEventListener('change', clear);
  window.addEventListener('pagehide', clear);
})();
