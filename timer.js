// 화면 조작: 버튼/입력 처리, 매 틱마다 표시 갱신, 종료 시 깜빡임과 알림음.
(function () {
  const { formatTime, parseDuration, getPhase, remainingMs } = window.TimerCore;

  const $ = (id) => document.getElementById(id);
  const timeEl = $('time');
  const doneEl = $('doneMessage');
  const pauseBtn = $('pauseBtn');
  const soundBtn = $('soundBtn');
  const fullscreenBtn = $('fullscreenBtn');
  const errorEl = $('error');

  let endTime = null;        // 실행 중일 때 종료 시각 (Date.now 기준)
  let pausedLeft = null;     // 일시정지 중일 때 남은 ms
  let tickId = null;
  let soundOn = true;
  let audioCtx = null;

  function render(ms) {
    const text = formatTime(ms);
    timeEl.textContent = text;
    timeEl.classList.toggle('long', text.length > 5);
    const phase = getPhase(ms);
    document.body.classList.toggle('warning', phase === 'warning');
    document.title = (doneEl.hidden ? text : '시간 끝!') + ' - 수업 타이머';
  }

  function stopTicking() {
    clearInterval(tickId);
    tickId = null;
  }

  function clearDone() {
    document.body.classList.remove('done');
    doneEl.hidden = true;
  }

  function start(ms) {
    unlockAudio();
    clearDone();
    errorEl.textContent = '';
    pausedLeft = null;
    endTime = Date.now() + ms;
    stopTicking();
    tickId = setInterval(tick, 200);
    document.body.classList.add('running');
    pauseBtn.disabled = false;
    pauseBtn.textContent = '일시정지';
    render(ms);
  }

  function tick() {
    const left = remainingMs(endTime, Date.now());
    if (left <= 0) {
      finish();
      return;
    }
    render(left);
  }

  function finish() {
    stopTicking();
    endTime = null;
    pausedLeft = null;
    document.body.classList.remove('running', 'warning');
    document.body.classList.add('done');
    doneEl.hidden = false;
    pauseBtn.disabled = true;
    render(0);
    if (soundOn) playAlarm();
  }

  function togglePause() {
    if (endTime !== null) {
      pausedLeft = remainingMs(endTime, Date.now());
      endTime = null;
      stopTicking();
      document.body.classList.remove('running');
      pauseBtn.textContent = '재개';
      render(pausedLeft);
    } else if (pausedLeft !== null) {
      start(pausedLeft);
    }
  }

  function reset() {
    stopTicking();
    endTime = null;
    pausedLeft = null;
    clearDone();
    document.body.classList.remove('running', 'warning');
    pauseBtn.disabled = true;
    pauseBtn.textContent = '일시정지';
    render(0);
  }

  // ---------- 알림음 (Web Audio로 직접 생성, 음원 파일 불필요) ----------
  function unlockAudio() {
    // 브라우저 자동재생 정책 때문에 사용자가 버튼을 누를 때 오디오를 준비해 둡니다.
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { audioCtx = null; }
  }

  function playAlarm() {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const start = t0 + i * 0.45;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    }
  }

  // ---------- 이벤트 연결 ----------
  document.querySelectorAll('.preset').forEach((btn) => {
    btn.addEventListener('click', () => start(Number(btn.dataset.minutes) * 60 * 1000));
  });

  $('customForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const ms = parseDuration($('minInput').value, $('secInput').value);
    if (ms === null) {
      errorEl.textContent = '시간을 올바르게 입력해 주세요. (분: 0 이상, 초: 0~59)';
      return;
    }
    start(ms);
  });

  pauseBtn.addEventListener('click', togglePause);
  $('resetBtn').addEventListener('click', reset);

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? '🔔 소리 켜짐' : '🔕 소리 꺼짐';
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    if (soundOn) unlockAudio();
  });

  fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.textContent = document.fullscreenElement ? '⛶ 전체화면 끄기' : '⛶ 전체화면';
  });

  render(0);
})();
