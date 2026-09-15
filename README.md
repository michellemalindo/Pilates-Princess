# 🐆 Pilates Princess 💗

A cute Y2K-cheetah-print, hot-pink tracker for your 30-Day Pilates YouTube challenge.

## Features

- **30-day grid** with auto-pulled YouTube thumbnails for each day
- Click any day to **watch the embedded video**, check it **Done!**, and jot down **notes/reflections**
- **Progress bar + streak counter** on the home page based on completed workouts
- **Reminders at a time you choose**: browser notification + on-page banner nudging you to do that day's workout
- Girly 2000s aesthetic: cheetah print, hot pink, pixel borders, chunky Y2K buttons

## Getting started

1. Open `index.html` in a browser (or host the folder with GitHub Pages / Netlify / any static host).
2. In **Settings**, set your **Challenge Start Date** (defaults to today) — this is what "Day 1" is calculated from — and your **Reminder Time** (defaults to 7:00 PM).
3. Click **🔔 Enable Reminders** and allow notifications when prompted.
4. Click on any day card, paste that day's **YouTube link**, and hit **Save**. The thumbnail and embedded video will appear automatically.
5. Watch the video, check **Done!**, add notes if you want, and hit **Save & Close** — you'll get a congrats banner 🎉 and your progress bar updates.

## Important note about reminders

This is a static site with no backend/server, so reminders work like this:

- While the site is open in a browser tab (even in the background), it checks the time every 30 seconds and will fire a **browser notification** the first time it's past your chosen reminder time on a challenge day you haven't completed yet, plus show an in-page reminder banner.
- **The site cannot send you a notification if your browser is fully closed** — true "wake up my phone at a set time" push notifications would require a backend server + push service. If you want that, keep a browser tab open (or pinned) around your reminder time, or consider adding a phone calendar reminder as a backup.

## Data storage

All your data (video links, done status, notes, start date) is saved in your browser's `localStorage` — it's private to your browser/device and isn't sent anywhere. Clearing your browser data will reset your progress, and progress won't sync across different browsers/devices.

## File structure

```
index.html          Main page markup
css/style.css        All styling (cheetah print, pink theme, pixel borders)
js/app.js            App logic (data, rendering, video parsing, reminders)
assets/cheetah-pattern.svg   Tileable cheetah print pattern used in the header
```
