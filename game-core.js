'use strict';

(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  if (root) root.TypeRacerCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function clamp(value, min, max) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
  }

  function accuracy(correct, attempted) {
    const good = Math.max(0, Number(correct) || 0);
    const total = Math.max(0, Number(attempted) || 0);
    return total ? Math.round((good / total) * 100) : 100;
  }

  function wpm(correctCharacters, elapsedMs) {
    const elapsedMinutes = Math.max((Number(elapsedMs) || 0) / 60000, 1 / 600);
    return Math.round((Math.max(0, Number(correctCharacters) || 0) / 5) / elapsedMinutes);
  }

  function botWpm(base, multiplier) {
    const low = Math.max(1, Number(base.low) || 1);
    const high = Math.max(low, Number(base.high) || low);
    return clamp((Number(base.current) || low) * (Number(multiplier) || 1), low * 0.65, high * 1.3);
  }

  function bothPlayersFinished(localProgress, remoteProgress) {
    return clamp(localProgress, 0, 1) >= 1 && clamp(remoteProgress, 0, 1) >= 1;
  }

  function rankRacers(racers) {
    return racers.slice().sort(function (a, b) {
      if (a.progress >= 1 && b.progress >= 1 && Number.isFinite(a.finishMs) && Number.isFinite(b.finishMs)) {
        return a.finishMs - b.finishMs;
      }
      if (a.progress !== b.progress) return b.progress - a.progress;
      return (a.orderIndex ?? Number.MAX_SAFE_INTEGER) - (b.orderIndex ?? Number.MAX_SAFE_INTEGER);
    });
  }

  return Object.freeze({ accuracy, wpm, botWpm, bothPlayersFinished, rankRacers, clamp });
});
