/* =========================================================
   NextGen Desk Training — course player logic
   Plays each lesson from Google Drive and saves progress
   in the student's browser.
   ========================================================= */
(function () {
  'use strict';

  var C = window.COURSE;
  if (!C) return;

  var STORE_KEY = 'nextgen-progress-' + C.id;
  var lessons = C.lessons;
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

  /* ---------- Sidebar list ---------- */
  function renderList() {
    $('lessonList').innerHTML = lessons.map(function (l, i) {
      var isDone = !!done[i];
      return '<li><button type="button" class="lesson-item' + (isDone ? ' is-done' : '') + (i === current ? ' is-active' : '') +
        '" data-i="' + i + '"' + (i === current ? ' aria-current="true"' : '') + '>' +
        '<span class="lesson-item__dot">' + (isDone ? ICON_CHECK : (i + 1)) + '</span>' +
        '<span class="lesson-item__label">' + esc(l.title) + '</span>' +
        (l.driveId ? '' : '<span class="lesson-item__soon">Soon</span>') +
      '</button></li>';
    }).join('');
  }

  /* ---------- Player ---------- */
  function showLesson(i, push) {
    current = Math.max(0, Math.min(lessons.length - 1, i));
    var l = lessons[current];

    var frame = $('playerFrame');
    if (l.driveId) {
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
          '<div><strong>Video coming soon</strong>This lesson is being added. Check back shortly.</div>' +
        '</div>';
    }

    $('lessonNum').textContent = 'Lesson ' + (current + 1) + ' of ' + lessons.length;
    $('lessonTitle').textContent = l.title;
    var tag = $('lessonTag');
    tag.hidden = !l.tag;
    tag.textContent = l.tag || '';
    var desc = $('lessonDesc');
    desc.hidden = !l.description;
    desc.textContent = l.description || '';

    $('prevBtn').disabled = current === 0;
    var last = current === lessons.length - 1;
    $('nextBtn').disabled = last;

    updateComplete();
    renderList();
    document.title = l.title + ' | NextGen Desk';
    if (push !== false) history.replaceState(null, '', '#lesson-' + (current + 1));
  }

  function updateComplete() {
    var isDone = !!done[current];
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
  $('lessonList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-i]');
    if (!b) return;
    showLesson(+b.dataset.i);
    if (window.innerWidth < 1000) $('playerFrame').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('completeBtn').addEventListener('click', function () {
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
  var start = m ? (+m[1] - 1) : lessons.findIndex(function (_, i) { return !done[i]; });
  if (start < 0) start = 0;
  updateProgress();
  showLesson(start, !!m);
})();
