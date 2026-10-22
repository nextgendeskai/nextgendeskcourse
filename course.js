/* =========================================================
   NextGen Desk Training — course player logic
   Plays each lesson from Google Drive and each Q&A video from
   Loom. Lesson progress is saved in the student's browser.
   ========================================================= */
(function () {
  'use strict';

  var C = window.COURSE;
  if (!C) return;

  var STORE_KEY = 'nextgen-progress-' + C.id;
  var lessons = C.lessons;
  var qa = C.qa || [];
  // One playlist: the lessons first, then the Q&A videos.
  // Only lessons count toward progress.
  var items = lessons.concat(qa.map(function (q) {
    var o = { isQA: true };
    for (var k in q) o[k] = q[k];
    return o;
  }));
  var current = 0;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(done)); } catch (e) {} }

  var done = load();
  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2200);
  }

  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  /* ---------- Sidebar lists ---------- */
  function itemHtml(i) {
    var l = items[i];
    var isDone = !l.isQA && !!done[i];
    var hasVideo = l.isQA ? !!l.loomId : !!l.driveId;
    var num = l.isQA ? (i - lessons.length + 1) : (i + 1);
    return '<li><button type="button" class="lesson-item' + (isDone ? ' is-done' : '') + (i === current ? ' is-active' : '') +
      '" data-i="' + i + '"' + (i === current ? ' aria-current="true"' : '') + '>' +
      '<span class="lesson-item__dot">' + (isDone ? ICON_CHECK : num) + '</span>' +
      '<span class="lesson-item__label">' + esc(l.title) + '</span>' +
      (hasVideo ? '' : '<span class="lesson-item__soon">Soon</span>') +
    '</button></li>';
  }
  function renderList() {
    var a = '', b = '';
    for (var i = 0; i < items.length; i++) {
      if (items[i].isQA) b += itemHtml(i); else a += itemHtml(i);
    }
    $('lessonList').innerHTML = a;
    $('qaList').innerHTML = b;
    $('secQA').hidden = !qa.length;

    // The section you are watching goes on top, the other one sits below it
    var box = $('sideSections');
    var inQA = !!(items[current] && items[current].isQA);
    if (inQA) box.insertBefore($('secQA'), $('secCourse'));
    else box.insertBefore($('secCourse'), $('secQA'));
  }

  /* ---------- Player ---------- */
  function showLesson(i, push) {
    current = Math.max(0, Math.min(items.length - 1, i));
    var l = items[current];
    var isQA = !!l.isQA;
    var qaNum = current - lessons.length + 1;
    var hasVideo = isQA ? !!l.loomId : !!l.driveId;

    var frame = $('playerFrame');
    if (isQA && l.loomId) {
      // Loom's embed player
      frame.innerHTML =
        '<iframe src="https://www.loom.com/embed/' + encodeURIComponent(l.loomId) +
        '?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"' +
        ' title="' + esc(l.title) + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    } else if (!isQA && l.driveId) {
      // Drive's preview player: plays the video without a download link
      frame.innerHTML =
        '<iframe src="https://drive.google.com/file/d/' + encodeURIComponent(l.driveId) + '/preview"' +
        ' title="' + esc(l.title) + '" allow="autoplay; fullscreen" allowfullscreen' +
        ' referrerpolicy="no-referrer"></iframe>' +
        '<a class="player__shield" href="watch.html#lesson-' + (current + 1) + '" target="_blank" rel="noopener"' +
        ' title="Open video in a new tab" aria-label="Open this video in a new tab"></a>';
    } else {
      frame.innerHTML =
        '<div class="player__empty">' +
          '<div class="player__empty-icon">' + ICON_CLOCK + '</div>' +
          '<div><strong>Video coming soon</strong>This video is being added. Check back shortly.</div>' +
        '</div>';
    }

    $('lessonNum').textContent = isQA
      ? 'Q&A ' + qaNum + ' of ' + qa.length
      : 'Lesson ' + (current + 1) + ' of ' + lessons.length;
    // Q&A videos are extra help, so they have no "Mark as complete" button
    $('completeBtn').style.display = isQA ? 'none' : '';
    $('lessonTitle').textContent = l.title;
    var tag = $('lessonTag');
    tag.hidden = !l.tag;
    tag.textContent = l.tag || '';
    var desc = $('lessonDesc');
    desc.hidden = !l.description;
    desc.textContent = l.description || '';

    $('prevBtn').disabled = current === 0;
    var last = current === items.length - 1;
    $('nextBtn').disabled = last;

    updateComplete();
    renderList();
    document.title = l.title + ' | NextGen Desk';
    if (push !== false) history.replaceState(null, '', isQA ? '#qa-' + qaNum : '#lesson-' + (current + 1));
  }

  function updateComplete() {
    var isDone = current < lessons.length && !!done[current];
    var b = $('completeBtn');
    b.classList.toggle('is-done', isDone);
    b.setAttribute('aria-pressed', isDone ? 'true' : 'false');
    $('completeLabel').textContent = isDone ? 'Completed' : 'Mark as complete';
  }

  /* ---------- Progress ---------- */
  function updateProgress() {
    var count = lessons.filter(function (_, i) { return done[i]; }).length;
    var pct = Math.round((count / lessons.length) * 100);
    $('progressText').textContent = count + ' of ' + lessons.length + ' complete';
    $('progressPct').textContent = pct + '%';
    $('progressFill').style.width = pct + '%';
    $('progressBar').setAttribute('aria-valuenow', pct);
  }

  /* ---------- Events ---------- */
  function onListClick(e) {
    var b = e.target.closest('[data-i]');
    if (!b) return;
    showLesson(+b.dataset.i);
    if (window.innerWidth < 1000) $('playerFrame').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('lessonList').addEventListener('click', onListClick);
  $('qaList').addEventListener('click', onListClick);

  $('completeBtn').addEventListener('click', function () {
    if (current >= lessons.length) return;
    if (done[current]) { delete done[current]; }
    else { done[current] = true; }
    save();
    updateComplete();
    updateProgress();
    renderList();
    if (done[current]) {
      var all = lessons.every(function (_, i) { return done[i]; });
      toast(all ? 'Course complete — amazing work!' : 'Lesson marked as complete');
    }
  });

  $('prevBtn').addEventListener('click', function () { showLesson(current - 1); });
  $('nextBtn').addEventListener('click', function () { showLesson(current + 1); });

  $('resetBtn').addEventListener('click', function () {
    if (!confirm('Reset all progress for this course?')) return;
    done = {};
    save();
    updateComplete();
    updateProgress();
    renderList();
    toast('Progress reset');
  });

  // On phones the corner button is just a logo badge: tapping it does nothing
  var MOBILE = window.matchMedia('(max-width: 760px)');
  $('playerFrame').addEventListener('click', function (e) {
    if (MOBILE.matches && e.target.closest('.player__shield')) e.preventDefault();
  });

  // Block right-click and common "save" shortcuts on the page
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('.player')) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'u')) e.preventDefault();
  });

  $('year').textContent = new Date().getFullYear();

  /* ---------- Start: open #lesson-N, else the first unfinished lesson ---------- */
  var m = location.hash.match(/lesson-(\d+)/);
  var q = location.hash.match(/qa-(\d+)/);
  var start = m ? (+m[1] - 1)
    : (q && qa.length) ? (lessons.length + (+q[1]) - 1)
    : lessons.findIndex(function (_, i) { return !done[i]; });
  if (start < 0) start = 0;
  updateProgress();
  showLesson(start, !!(m || q));
})();
