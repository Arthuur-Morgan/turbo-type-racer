(function (root) {
  'use strict';

  function createAmbientSound() {
    var track = null;
    var enabled = true;
    var STORAGE_KEY = 'turbo-type-racer-sound-v2';

    try { enabled = localStorage.getItem(STORAGE_KEY) !== 'off'; } catch (_) {}

    function build() {
      if (track) return;
      track = new Audio('audio/safe_space_loop.flac');
      track.loop = true;
      track.volume = 0.24;
      track.preload = 'auto';
    }

    function start() {
      if (!enabled) return;
      build();
      track.play().catch(function () {});
    }

    function stop() {
      if (track) track.pause();
    }

    function setEnabled(value) {
      enabled = !!value;
      try { localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off'); } catch (_) {}
      if (enabled) start(); else stop();
      return enabled;
    }

    function isEnabled() { return enabled; }
    return Object.freeze({ start: start, stop: stop, setEnabled: setEnabled, isEnabled: isEnabled });
  }

  if (root) root.RaceSound = createAmbientSound();
})(typeof window !== 'undefined' ? window : null);
