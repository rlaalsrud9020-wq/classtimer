// 타이머의 순수 로직 (화면과 무관). 브라우저에서 window.TimerCore 로 사용합니다.
(function (global) {
  const WARNING_MS = 60 * 1000;

  function formatTime(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  // 분/초 입력 문자열 -> 밀리초. 잘못된 입력이거나 0이면 null.
  function parseDuration(minText, secText) {
    const m = String(minText).trim();
    const s = String(secText).trim();
    if (m === '' && s === '') return null;
    if ((m !== '' && !/^\d+$/.test(m)) || (s !== '' && !/^\d+$/.test(s))) return null;
    const min = m === '' ? 0 : Number(m);
    const sec = s === '' ? 0 : Number(s);
    if (sec > 59) return null;
    const total = (min * 60 + sec) * 1000;
    return total > 0 ? total : null;
  }

  function getPhase(ms) {
    if (ms <= 0) return 'done';
    if (ms <= WARNING_MS) return 'warning';
    return 'normal';
  }

  function remainingMs(endTime, now) {
    return Math.max(0, endTime - now);
  }

  global.TimerCore = { formatTime, parseDuration, getPhase, remainingMs };
})(window);
