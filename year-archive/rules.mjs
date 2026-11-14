import { records } from './bank.mjs';

export function draw(seed) {
  // 复用 Rare Dive 的日期散列与洗牌算法，独立维护年份题库。
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  const deck = [...records];
  for (let i = deck.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = Math.floor((state >>> 0) / 4294967296 * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 7);
}

export function points(year, guess) {
  if (guess === null) return 1000;
  return Math.abs(year - guess);
}

export function rating(s) { return s===0?0:s<=10?1:s<=30?2:s<=50?3:4; }
