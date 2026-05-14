<!DOCTYPE html>
<html lang="en">
<head>
<!--
=============================================================
  SINGAPORE BUS ARRIVAL TRACKER
  Home: B20019  |  Office: B18101
  Buses: 97, 97E, 197, 963
  Hosted on Vercel — LTA calls proxied via /api/bus
=============================================================
-->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bus Tracker SG</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700;900&display=swap" rel="stylesheet">

<style>
  :root {
    --bg:      #0b0f14;
    --panel:   #111720;
    --border:  #1e2d3d;
    --accent:  #00d4ff;
    --accent2: #ff6b35;
    --green:   #00e676;
    --yellow:  #ffd740;
    --red:     #ff5252;
    --text:    #e0eaf5;
    --muted:   #4a6070;
    --mono:    'Share Tech Mono', monospace;
    --head:    'Barlow Condensed', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--head);
    min-height: 100vh;
    padding: 16px;
    background-image:
      radial-gradient(ellipse at 20% 0%,   #00d4ff0a 0%, transparent 60%),
      radial-gradient(ellipse at 80% 100%, #ff6b350a 0%, transparent 60%);
  }

  /* ── HEADER ── */
  header { text-align: center; margin-bottom: 20px; }

  .logo {
    font-size: 11px;
    letter-spacing: 6px;
    color: var(--accent);
    font-family: var(--mono);
    text-transform: uppercase;
    margin-bottom: 4px;
    opacity: 0.7;
  }

  h1 {
    font-size: clamp(28px, 7vw, 48px);
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1;
  }

  h1 span { color: var(--accent); }

  .timestamp {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    margin-top: 6px;
    letter-spacing: 1px;
  }

  /* ── LAYOUT ── */
  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    max-width: 700px;
    margin: 0 auto 20px;
  }

  @media (max-width: 480px) {
    .panels { grid-template-columns: 1fr; }
  }

  /* ── PANEL ── */
  .panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.3s;
  }

  .panel:hover { border-color: #2a4060; }

  .panel-header {
    padding: 12px 16px 10px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .direction-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }

  .panel-home   .direction-icon { background: #00d4ff18; }
  .panel-office .direction-icon { background: #ff6b3518; }

  .panel-title {
    font-size: 13px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
  }

  .panel-home   .panel-title { color: var(--accent); }
  .panel-office .panel-title { color: var(--accent2); }

  .stop-code {
    font-family: var(--mono);
    font-size: 10px; color: var(--muted); letter-spacing: 1px;
  }

  /* ── BUS ROWS ── */
  .bus-list { padding: 8px 0; }

  .bus-row {
    display: flex; align-items: center;
    padding: 9px 16px;
    border-bottom: 1px solid #151e28;
    gap: 10px;
    transition: background 0.2s;
  }

  .bus-row:last-child { border-bottom: none; }
  .bus-row:hover { background: #141e2a; }

  .bus-number {
    font-size: 22px; font-weight: 900;
    width: 52px; flex-shrink: 0;
    letter-spacing: -0.5px;
  }

  .arrivals { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; }

  .arrival-chip {
    display: flex; flex-direction: column;
    align-items: center; min-width: 42px;
  }

  .arrival-time {
    font-family: var(--mono);
    font-size: 16px; line-height: 1;
    color: var(--green);
  }

  .arrival-time.soon  { color: var(--yellow); }
  .arrival-time.now   { color: var(--accent); font-weight: 700; }
  .arrival-time.empty { color: var(--muted); font-size: 12px; }

  .load-dot {
    width: 5px; height: 5px;
    border-radius: 50%; margin-top: 3px;
  }

  .load-SEA { background: var(--green); }
  .load-SDA { background: var(--yellow); }
  .load-LSD { background: var(--red); }
  .load-NA  { background: var(--muted); }

  /* ── SKELETON ── */
  .skeleton {
    border-radius: 4px;
    background: linear-gradient(90deg, #1a2535 25%, #222f42 50%, #1a2535 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── CONTROLS ── */
  .controls { text-align: center; max-width: 700px; margin: 0 auto; }

  .refresh-btn {
    font-family: var(--head);
    font-size: 15px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--bg); background: var(--accent);
    border: none; border-radius: 8px;
    padding: 12px 36px; cursor: pointer;
    transition: all 0.2s;
    position: relative; overflow: hidden;
  }

  .refresh-btn:hover  { background: #33ddff; transform: translateY(-1px); }
  .refresh-btn:active { transform: translateY(0); }

  .refresh-btn.loading {
    background: var(--muted);
    pointer-events: none;
  }

  .refresh-btn.loading::after {
    content: '';
    position: absolute; left: 0; top: 0;
    height: 100%; width: 0%;
    background: rgba(255,255,255,0.15);
    animation: progress 1.5s ease-in-out infinite;
  }

  @keyframes progress {
    0%   { width: 0%; left: 0; }
    50%  { width: 60%; }
    100% { width: 0%; left: 100%; }
  }

  .auto-label {
    font-family: var(--mono);
    font-size: 10px; color: var(--muted);
    margin-top: 8px; letter-spacing: 1px;
  }

  /* ── COUNTDOWN BAR ── */
  .countdown-bar {
    height: 2px; background: var(--border);
    border-radius: 1px;
    max-width: 700px; margin: 12px auto 0;
    overflow: hidden;
  }

  .countdown-fill {
    height: 100%; background: var(--accent);
    width: 100%; transition: width 1s linear; opacity: 0.5;
  }

  /* ── ERROR ── */
  .error-msg {
    font-family: var(--mono);
    font-size: 11px; color: var(--red);
    text-align: center; margin-top: 10px;
    padding: 8px 16px;
    background: #ff525210; border-radius: 6px;
    max-width: 700px; margin-left: auto; margin-right: auto;
    display: none;
  }

  .error-msg.visible { display: block; }
</style>
</head>
<body>

<header>
  <div class="logo">Singapore Transit</div>
  <h1>BUS <span>TRACKER</span></h1>
  <div class="timestamp" id="ts">—</div>
</header>

<div class="panels">
  <div class="panel panel-home">
    <div class="panel-header">
      <div class="direction-icon">🏠</div>
      <div>
        <div class="panel-title">Home</div>
        <div class="stop-code">STOP B20019</div>
      </div>
    </div>
    <div class="bus-list" id="list-B20019"></div>
  </div>

  <div class="panel panel-office">
    <div class="panel-header">
      <div class="direction-icon">🏢</div>
      <div>
        <div class="panel-title">Office</div>
        <div class="stop-code">STOP B18101</div>
      </div>
    </div>
    <div class="bus-list" id="list-B18101"></div>
  </div>
</div>

<div class="controls">
  <button class="refresh-btn" id="refreshBtn" onclick="fetchAll()">⟳ &nbsp;REFRESH</button>
  <div class="auto-label">AUTO-REFRESH EVERY 30 SEC</div>
</div>
<div class="countdown-bar"><div class="countdown-fill" id="cdFill"></div></div>
<div class="error-msg" id="errMsg"></div>

<script>
  const STOPS            = ['B20019', 'B18101'];
  const BUSES            = ['97', '97E', '197', '963'];
  const AUTO_REFRESH_SEC = 30;

  let countdownSecs  = AUTO_REFRESH_SEC;
  let countdownTimer = null;

  function arrivalLabel(isoStr) {
    if (!isoStr || isoStr === '0001-01-01T00:00:00+08:00') return null;
    const diff = Math.round((new Date(isoStr) - Date.now()) / 60000);
    if (diff <= 0) return { text: 'Arr', cls: 'now' };
    if (diff <= 3) return { text: diff + ' min', cls: 'soon' };
    return { text: diff + ' min', cls: '' };
  }

  function loadClass(load) {
    return { SEA: 'SEA', SDA: 'SDA', LSD: 'LSD' }[load] || 'NA';
  }

  function renderSkeleton(stopCode) {
    const el = document.getElementById('list-' + stopCode);
    el.innerHTML = BUSES.map(() => `
      <div class="bus-row">
        <div class="bus-number"><div class="skeleton" style="width:40px;height:22px"></div></div>
        <div class="arrivals" style="gap:12px">
          <div class="skeleton" style="width:44px;height:16px"></div>
          <div class="skeleton" style="width:44px;height:16px"></div>
          <div class="skeleton" style="width:44px;height:16px"></div>
        </div>
      </div>`).join('');
  }

  function renderStop(stopCode, services) {
    const el = document.getElementById('list-' + stopCode);
    if (!el) return;
    el.innerHTML = BUSES.map(busNo => {
      const svc = services.find(s => s.ServiceNo === busNo);
      let chips = '';
      if (!svc) {
        chips = `<div class="arrival-chip"><span class="arrival-time empty">–</span></div>`;
      } else {
        chips = [svc.NextBus, svc.NextBus2, svc.NextBus3].map(b => {
          const lbl = arrivalLabel(b?.EstimatedArrival);
          if (!lbl) return `<div class="arrival-chip"><span class="arrival-time empty">–</span><div class="load-dot load-NA"></div></div>`;
          return `<div class="arrival-chip">
            <span class="arrival-time ${lbl.cls}">${lbl.text}</span>
            <div class="load-dot load-${loadClass(b?.Load)}"></div>
          </div>`;
        }).join('');
      }
      return `<div class="bus-row">
        <div class="bus-number">${busNo}</div>
        <div class="arrivals">${chips}</div>
      </div>`;
    }).join('');
  }

  async function fetchStop(stopCode) {
    const res = await fetch(`/api/bus?stop=${stopCode}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for stop ${stopCode}`);
    const json = await res.json();
    return json.Services || [];
  }

  async function fetchAll() {
    const btn = document.getElementById('refreshBtn');
    const err = document.getElementById('errMsg');
    btn.classList.add('loading');
    btn.textContent = '⟳  LOADING…';
    err.classList.remove('visible');
    STOPS.forEach(renderSkeleton);

    try {
      const [s1, s2] = await Promise.all(STOPS.map(fetchStop));
      renderStop(STOPS[0], s1);
      renderStop(STOPS[1], s2);
      const now = new Date();
      document.getElementById('ts').textContent =
        'Updated ' + now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      resetCountdown();
    } catch (e) {
      err.textContent = '⚠ ' + e.message;
      err.classList.add('visible');
      STOPS.forEach(s => {
        const el = document.getElementById('list-' + s);
        if (el) el.innerHTML = BUSES.map(b =>
          `<div class="bus-row"><div class="bus-number">${b}</div><div class="arrivals"><span class="arrival-time empty">Error</span></div></div>`
        ).join('');
      });
    } finally {
      btn.classList.remove('loading');
      btn.innerHTML = '⟳ &nbsp;REFRESH';
    }
  }

  function resetCountdown() {
    clearInterval(countdownTimer);
    countdownSecs = AUTO_REFRESH_SEC;
    updateBar();
    countdownTimer = setInterval(() => {
      countdownSecs--;
      updateBar();
      if (countdownSecs <= 0) fetchAll();
    }, 1000);
  }

  function updateBar() {
    document.getElementById('cdFill').style.width =
      (countdownSecs / AUTO_REFRESH_SEC * 100) + '%';
  }

  fetchAll();
</script>
</body>
</html>
