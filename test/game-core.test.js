'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../game-core');

test('accuracy is 100 percent before the first key and penalizes each counted mistake', () => {
  assert.equal(core.accuracy(0, 0), 100);
  assert.equal(core.accuracy(8, 10), 80);
});

test('WPM uses five characters per word and elapsed minutes', () => {
  assert.equal(core.wpm(100, 60_000), 20);
  assert.equal(core.wpm(0, 0), 0);
});

test('bot bursts may move below or above the normal tier while staying bounded', () => {
  const bot = { low: 30, high: 45, current: 40 };
  assert.equal(core.botWpm(bot, 1.2), 48);
  assert.equal(core.botWpm(bot, 0.5), 20);
  assert.equal(core.botWpm(bot, 2), 58.5);
});

test('multiplayer waits until both human players have finished', () => {
  assert.equal(core.bothPlayersFinished(1, 0.99), false);
  assert.equal(core.bothPlayersFinished(0.99, 1), false);
  assert.equal(core.bothPlayersFinished(1, 1), true);
  assert.equal(core.bothPlayersFinished(-1, 2), false);
});

test('finish times produce one stable podium when racers have crossed', () => {
  const ranked = core.rankRacers([
    { id: 'guest', progress: 1, finishMs: 42_100, orderIndex: 0 },
    { id: 'host', progress: 1, finishMs: 41_900, orderIndex: 1 },
    { id: 'ghost', progress: 0.8, orderIndex: 2 }
  ]);
  assert.deepEqual(ranked.map((racer) => racer.id), ['host', 'guest', 'ghost']);
});
