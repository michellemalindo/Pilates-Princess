/* ===== Pilates Princess — App Logic ===== */

const STORAGE_KEY = 'pilatesPrincessData';
const TOTAL_DAYS = 30;
const REMINDER_HOUR = 19; // 7pm

let state = loadState();
let activeDay = null;

function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.days && parsed.days.length === TOTAL_DAYS) return parsed;
    } catch (e) { /* fall through to defaults */ }
  }
  const days = [];
  for (let i = 1; i <= TOTAL_DAYS; i++) {
    days.push({ day: i, videoUrl: '', videoId: '', done: false, notes: '', completedAt: null });
  }
  return {
    startDate: todayStr(),
    reminderEnabled: false,
    lastNotifiedDate: null,
    days
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function extractYouTubeId(url) {
  if (!url) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return '';
}

function getDayNumberForToday() {
  const start = new Date(state.startDate + 'T00:00:00');
  const now = new Date();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffDays = Math.round((nowMidnight - startMidnight) / 86400000);
  return diffDays + 1; // day 1 = start date
}

function computeStreak() {
  let streak = 0;
  const todayNum = getDayNumberForToday();
  for (let d = Math.min(todayNum, TOTAL_DAYS); d >= 1; d--) {
    const dayObj = state.days[d - 1];
    if (dayObj && dayObj.done) streak++;
    else break;
  }
  return streak;
}

/* ===== Rendering ===== */

function renderProgress() {
  const doneCount = state.days.filter(d => d.done).length;
  const pct = Math.round((doneCount / TOTAL_DAYS) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${doneCount} / ${TOTAL_DAYS} Days Complete`;
  document.getElementById('streakText').textContent = `🔥 ${computeStreak()} day streak`;
}

function renderTodayCard() {
  const el = document.getElementById('todayCard');
  const dayNum = getDayNumberForToday();

  if (dayNum < 1) {
    el.innerHTML = `
      <span class="today-label">Get Ready!</span>
      <span class="today-day">Challenge starts ${state.startDate}</span>
      <span class="today-status">Set your start date in Settings 👉</span>`;
    return;
  }
  if (dayNum > TOTAL_DAYS) {
    el.innerHTML = `
      <span class="today-label">🏆 Challenge Complete!</span>
      <span class="today-day">You finished all 30 days!</span>
      <span class="today-status">You're a certified Pilates Princess 👑</span>`;
    return;
  }

  const dayObj = state.days[dayNum - 1];
  const statusText = dayObj.done ? '✅ Completed today\'s workout!' : '⏳ Not done yet — you got this!';
  el.innerHTML = `
    <span class="today-label">Today's Workout</span>
    <span class="today-day">Day ${dayNum} of ${TOTAL_DAYS}</span>
    <span class="today-status">${statusText}</span>
    <button class="btn btn-done" id="openTodayBtn">${dayObj.done ? 'Review Day' : 'Let\'s Go! 💪'}</button>
  `;
  document.getElementById('openTodayBtn').addEventListener('click', () => openDayModal(dayNum));
}

function renderDaysGrid() {
  const grid = document.getElementById('daysGrid');
  grid.innerHTML = '';
  const todayNum = getDayNumberForToday();

  state.days.forEach(dayObj => {
    const card = document.createElement('div');
    card.className = 'day-card' + (dayObj.done ? ' is-done' : '') + (dayObj.day === todayNum ? ' is-today' : '');
    card.dataset.day = dayObj.day;

    let thumbHtml;
    if (dayObj.videoId) {
      thumbHtml = `<img class="day-thumb" src="https://img.youtube.com/vi/${dayObj.videoId}/mqdefault.jpg" alt="Day ${dayObj.day} thumbnail" loading="lazy" onerror="this.outerHTML='<div class=&quot;day-thumb&quot;>🐆</div>'">`;
    } else {
      thumbHtml = `<div class="day-thumb">🐆</div>`;
    }

    card.innerHTML = `
      ${dayObj.done ? '<div class="day-badge">✅</div>' : ''}
      ${thumbHtml}
      <div class="day-card-body">
        <div class="day-number">DAY ${dayObj.day}</div>
      </div>
    `;
    card.addEventListener('click', () => openDayModal(dayObj.day));
    grid.appendChild(card);
  });
}

function renderAll() {
  renderProgress();
  renderTodayCard();
  renderDaysGrid();
}

/* ===== Modal ===== */

function openDayModal(dayNum) {
  activeDay = dayNum;
  const dayObj = state.days[dayNum - 1];

  document.getElementById('modalDayTitle').textContent = `Day ${dayNum}`;
  document.getElementById('videoUrlInput').value = dayObj.videoUrl || '';
  document.getElementById('doneCheckbox').checked = !!dayObj.done;
  document.getElementById('notesArea').value = dayObj.notes || '';

  renderVideoEmbed(dayObj);

  document.getElementById('dayModal').classList.add('is-open');
}

function renderVideoEmbed(dayObj) {
  const wrap = document.getElementById('videoEmbedWrap');
  if (dayObj.videoId) {
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${dayObj.videoId}" title="Day ${dayObj.day} workout" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    wrap.innerHTML = `<p class="no-video-msg">Paste a YouTube link above to load this day's workout! 🎀</p>`;
  }
}

function closeDayModal() {
  document.getElementById('dayModal').classList.remove('is-open');
  activeDay = null;
}

function saveVideoForDay() {
  if (!activeDay) return;
  const url = document.getElementById('videoUrlInput').value.trim();
  const id = extractYouTubeId(url);
  const dayObj = state.days[activeDay - 1];
  dayObj.videoUrl = url;
  dayObj.videoId = id;
  saveState();
  renderVideoEmbed(dayObj);
  renderDaysGrid();
  renderTodayCard();
}

function saveModalAndClose() {
  if (!activeDay) { closeDayModal(); return; }
  const dayObj = state.days[activeDay - 1];
  const wasDone = dayObj.done;
  const nowDone = document.getElementById('doneCheckbox').checked;

  dayObj.notes = document.getElementById('notesArea').value;
  dayObj.done = nowDone;
  dayObj.completedAt = nowDone ? (dayObj.completedAt || todayStr()) : null;

  saveState();
  renderAll();
  closeDayModal();

  if (!wasDone && nowDone) {
    showCongrats(activeDay);
  }
}

/* ===== Congrats banner ===== */

function showCongrats(dayNum) {
  document.getElementById('congratsDay').textContent = dayNum;
  const banner = document.getElementById('congratsBanner');
  banner.classList.add('is-shown');
  clearTimeout(showCongrats._t);
  showCongrats._t = setTimeout(() => banner.classList.remove('is-shown'), 3500);
}

/* ===== Reminders ===== */

function updateNotifStatusText() {
  const statusEl = document.getElementById('notifStatus');
  if (!('Notification' in window)) {
    statusEl.textContent = 'Notifications not supported in this browser';
    return;
  }
  if (Notification.permission === 'granted' && state.reminderEnabled) {
    statusEl.textContent = `Reminders ON — you'll be pinged at ${REMINDER_HOUR}:00 while this tab is open`;
  } else if (Notification.permission === 'denied') {
    statusEl.textContent = 'Notifications blocked — enable them in your browser settings';
  } else {
    statusEl.textContent = 'Reminders are off';
  }
}

function enableNotifications() {
  if (!('Notification' in window)) {
    alert('Sorry, your browser does not support notifications.');
    return;
  }
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      state.reminderEnabled = true;
      saveState();
      new Notification('Pilates Princess 💗', { body: "You'll get a reminder at 7pm on workout days!" });
    }
    updateNotifStatusText();
  });
}

function checkReminder() {
  if (!state.reminderEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const dayNum = getDayNumberForToday();
  if (dayNum < 1 || dayNum > TOTAL_DAYS) return;

  const dayObj = state.days[dayNum - 1];
  const today = todayStr();

  if (now.getHours() >= REMINDER_HOUR && state.lastNotifiedDate !== today && !dayObj.done) {
    new Notification('Pilates Princess 💗 Time to workout!', {
      body: `Day ${dayNum} is waiting for you. Tap in and get your glow on! 🐆`
    });
    state.lastNotifiedDate = today;
    saveState();
  }
}

function updatePageReminderToast() {
  const toast = document.getElementById('pageReminder');
  const now = new Date();
  const dayNum = getDayNumberForToday();

  if (dayNum < 1 || dayNum > TOTAL_DAYS) {
    toast.classList.remove('is-shown');
    return;
  }
  const dayObj = state.days[dayNum - 1];
  if (now.getHours() >= REMINDER_HOUR && !dayObj.done) {
    toast.innerHTML = `💗 It's workout time! Day ${dayNum} is still waiting for you.<br><button class="btn btn-small" id="toastGoBtn">Let's go!</button>`;
    toast.classList.add('is-shown');
    document.getElementById('toastGoBtn').addEventListener('click', () => {
      toast.classList.remove('is-shown');
      openDayModal(dayNum);
    });
  } else {
    toast.classList.remove('is-shown');
  }
}

/* ===== Init ===== */

function init() {
  document.getElementById('startDateInput').value = state.startDate;
  document.getElementById('startDateInput').addEventListener('change', (e) => {
    state.startDate = e.target.value || todayStr();
    saveState();
    renderAll();
  });

  document.getElementById('enableNotifBtn').addEventListener('click', enableNotifications);
  updateNotifStatusText();

  document.getElementById('closeModal').addEventListener('click', closeDayModal);
  document.getElementById('dayModal').addEventListener('click', (e) => {
    if (e.target.id === 'dayModal') closeDayModal();
  });
  document.getElementById('saveVideoBtn').addEventListener('click', saveVideoForDay);
  document.getElementById('saveModalBtn').addEventListener('click', saveModalAndClose);
  document.getElementById('congratsBanner').addEventListener('click', () => {
    document.getElementById('congratsBanner').classList.remove('is-shown');
  });

  renderAll();
  updatePageReminderToast();

  setInterval(() => {
    checkReminder();
    updatePageReminderToast();
  }, 30000);
}

document.addEventListener('DOMContentLoaded', init);
