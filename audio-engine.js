(function (root) {
  'use strict';

  function createAmbientSound() {
    var context = null;
    var master = null;
    var oscillators = [];
    var enabled = true;
    var STORAGE_KEY = 'turbo-type-racer-sound-v1';

    try { enabled = localStorage.getItem(STORAGE_KEY) !== 'off'; } catch (_) {}

    function build() {
      if (context || !window.AudioContext) return;
      context = new window.AudioContext();
      master = context.createGain();
      master.gain.value = 0;
      var filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 520;
      filter.Q.value = 0.35;
      filter.connect(master);
      master.connect(context.destination);

      // An original, quiet three-note drone: no downloaded track or licensing dependency.
      [73.42, 110, 146.83].forEach(function (frequency, index) {
        var tone = context.createOscillator();
        var level = context.createGain();
        tone.type = 'sine';
        tone.frequency.value = frequency;
        level.gain.value = [0.36, 0.19, 0.09][index];
        tone.connect(level);
        level.connect(filter);
        tone.start();
        oscillators.push(tone);
      });
    }

    function start() {
      if (!enabled) return;
      build();
      if (!context) return;
      context.resume().then(function () {
        var now = context.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(0.055, now, 1.8);
      }).catch(function () {});
    }

    function stop() {
      if (!context || !master) return;
      var now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(0, now, 0.35);
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