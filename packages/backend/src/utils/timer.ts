/**
 * A timer to log the duration of operations. It is here just to test sharing
 * some code.
 */
export function startTimer(timerLabel = "Timer") {
  const timer = Date.now();
  let lastPoint = timer;
  let pointCount = 0;

  console.log(`${timerLabel} @ start`);

  return [
    function point(pointLabel?: string) {
      const now = Date.now();
      const elapsed = now - lastPoint;
      const time = now - timer;

      console.log(
        `${timerLabel} @ ${
          pointLabel ?? `point ${++pointCount}`
        } is ${time} ms (+ ${elapsed} ms)`
      );

      lastPoint = now;
    },

    function end() {
      const now = Date.now();
      const elapsed = now - lastPoint;
      const time = Date.now() - timer;
      console.log(`${timerLabel} @ end is ${time} ms (+ ${elapsed} ms)`);
    },
  ] as const;
}
