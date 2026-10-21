/* =========================================================
   NextGen Desk: Q&A videos page
   Plays each Q&A video from Loom. The list comes from
   window.COURSE.qa in course-data.js.
   ========================================================= */
(function () {
  'use strict';

  var C = window.COURSE;
  var qa = (C && C.qa) || [];
  var current = 0;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  function renderList() {
    $('qaList').innerHTML = qa.map(function (v, i) {
      return '<li><button type="button" class="lesson-item' + (i === current ? ' is-active' : '') +
        '" data-i="' + i + '"' + (i === current ? ' aria-current="true"' : '') + '>' +
        '<span class="lesson-item__dot">' + (i + 1) + '</span>' +
        '<span class="lesson-item__label">' + esc(v.title) + '</span>' +
        (v.loomId ? '' : '<span class="lesson-item__soon">Soon</span>') +
      '</button></li>';
    }).join('');
  }

  function showVideo(i, push) {
    current = Math.max(0, Math.min(qa.length - 1, i));
    var v = qa[current];

    var frame = $('playerFrame');
    if (v.loomId) {
      frame.innerHTML =
        '<iframe src="https://www.loom.com/embed/' + encodeURIComponent(v.loomId) +
        '?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"' +
        ' title="' + esc(v.title) + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    } else {
      frame.innerHTML =
        '<div class="player__empty">' +
          '<div class="player__empty-icon">' + ICON_CLOCK + '</div>' +
          '<div><strong>Video coming soon</strong>This video is being added. Check back shortly.</div>' +
        '</div>';
    }

    $('lessonNum').textContent = 'Q&A ' + (current + 1) + ' of ' + qa.length;
    $('lessonTitle').textContent = v.title;
    var desc = $('lessonDesc');
    desc.hidden = !v.description;
    desc.textContent = v.description || '';

    $('prevBtn').disabled = current === 0;
    $('nextBtn').disabled = current === qa.length - 1;

    renderList();
    document.title = v.title + ' | NextGen Desk Q&A';
    if (push !== false) history.replaceState(null, '', '#qa-' + (current + 1));
  }

  $('qaList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-i]');
    if (!b) return;
    showVideo(+b.dataset.i);
    if (window.innerWidth < 1000) $('playerFrame').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('prevBtn').addEventListener('click', function () { showVideo(current - 1); });
  $('nextBtn').addEventListener('click', function () { showVideo(current + 1); });

  $('year').textContent = new Date().getFullYear();

  if (!qa.length) {
    $('playerFrame').innerHTML =
      '<div class="player__empty"><div class="player__empty-icon">' + ICON_CLOCK + '</div>' +
      '<div><strong>No Q&amp;A videos yet</strong>Check back shortly.</div></div>';
    $('lessonTitle').textContent = 'Q&A videos';
    $('qaCount').textContent = '';
    $('prevBtn').disabled = true;
    $('nextBtn').disabled = true;
    return;
  }

  $('qaCount').textContent = qa.length + ' quick answers to common questions. Pick one to watch.';
  var m = location.hash.match(/qa-(\d+)/);
  showVideo(m ? (+m[1] - 1) : 0, !!m);
})();
