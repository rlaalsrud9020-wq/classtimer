// 브라우저용 테스트: tests/test.html 을 열면 실행됩니다.
// test(name, fn) 과 eq(actual, expected) 는 test.html 에서 제공합니다.
const { formatTime, parseDuration, getPhase, remainingMs } = window.TimerCore || {};

test('formatTime shows minutes and seconds with zero padding', () => {
  eq(formatTime(5 * 60 * 1000), '05:00');
  eq(formatTime(65 * 1000), '01:05');
  eq(formatTime(0), '00:00');
});

test('formatTime rounds partial seconds up so 00:00 only appears at the end', () => {
  eq(formatTime(59001), '01:00');
  eq(formatTime(1), '00:01');
});

test('formatTime supports durations of 100 minutes or more', () => {
  eq(formatTime(120 * 60 * 1000), '120:00');
});

test('formatTime treats negative values as zero', () => {
  eq(formatTime(-500), '00:00');
});

test('parseDuration converts minutes and seconds input to milliseconds', () => {
  eq(parseDuration('3', '30'), 210000);
  eq(parseDuration('7', ''), 420000);
  eq(parseDuration('', '45'), 45000);
});

test('parseDuration returns null for empty, zero, or invalid input', () => {
  eq(parseDuration('', ''), null);
  eq(parseDuration('0', '0'), null);
  eq(parseDuration('-1', '0'), null);
  eq(parseDuration('abc', ''), null);
  eq(parseDuration('1', '60'), null);
  eq(parseDuration('1.5', ''), null);
});

test('getPhase is normal above one minute', () => {
  eq(getPhase(60001), 'normal');
});

test('getPhase is warning at one minute or less', () => {
  eq(getPhase(60000), 'warning');
  eq(getPhase(1), 'warning');
});

test('getPhase is done at zero or below', () => {
  eq(getPhase(0), 'done');
  eq(getPhase(-10), 'done');
});

test('remainingMs is computed from end time and current time', () => {
  eq(remainingMs(10000, 4000), 6000);
  eq(remainingMs(10000, 12000), 0);
});
