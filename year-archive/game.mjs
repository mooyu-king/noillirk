import { draw, points, rating } from './rules.mjs';
const el = id => document.getElementById(id);
const form = document.querySelector('form');
const storageKey = 'year-archive.daily.v1';
let deck, answers, day, daily, deadline, phase;

function show(id) {
  for (const name of ['start','desk','finish']) el(name).hidden = name !== id;
}
function save() {
  if (daily) try { localStorage.setItem(storageKey, JSON.stringify({day, answers, deadline, phase})); } catch {}
}
function start(timed) {
  daily = timed;
  day = new Date().toISOString().slice(0,10);
  deck = draw(timed ? day : String(Math.random()));
  answers = [];
  deadline = Date.now() + 25000;
  phase = 'question';
  if (daily) try {
    const old = JSON.parse(localStorage.getItem(storageKey));
    if (old?.day === day && Array.isArray(old.answers) && old.answers.length <= 7 &&
        old.answers.every(a => a === null || (Number.isInteger(a) && a >= 1 && a <= 9999)) &&
        Number.isFinite(old.deadline) && (old.phase === 'question' && old.answers.length < 7 ||
        old.phase === 'reveal' && old.answers.length > 0 || old.phase === 'finish' && old.answers.length === 7)) {
      ({answers, deadline, phase} = old);
    }
  } catch {}
  render();
  tick();
}
const labels = ['Excellent','Very nice','Good','Average','Poor'];
function react(score, final = false) {
 const row = rating(final ? score / answers.length : score);
 el('npc-reaction').hidden = false;
 el('npc-idle').hidden = true;
 el('npc-reaction').style.backgroundPositionY = row * 25 + '%';
 el('npc-reaction').setAttribute('aria-label', labels[row] + ' reaction');
 el('npc-score').textContent = (final ? 'Total ' : '') + score + ' pts';
 el('npc-label').textContent = labels[row];
}
function render() {
  save();
  if (phase === 'finish') {
    show('finish');
    const score = answers.reduce((sum,a,i) => sum + points(deck[i][0], a),0);
    el('total').textContent = score + ' pts'; react(score,true); el('summary-note').textContent = 'Average ' + (score/7).toFixed(1) + ' per record · Lower is better';
    el('shareStatus').textContent = '';
    el('ledger').replaceChildren(...deck.map(([year,event],i) => {
      const li = document.createElement('li');
      const score = document.createElement('strong'); score.textContent = points(year,answers[i]) + ' pts';
      const detail = document.createElement('div'); const title = document.createElement('span'); title.textContent = event;
      const note = document.createElement('small'); note.textContent = 'Correct: ' + year + ' · Yours: ' + (answers[i] ?? 'Timed out');
      detail.append(title,note); li.append(score,detail);
      return li;
    }));
    return;
  }
  show('desk');
  const revealed = phase === 'reveal';
  const i = answers.length - Number(revealed);
  const [year,event,fact,source] = deck[i];
  el('round').textContent = 'Record ' + (i+1) + ' / 7';
  el('prompt').textContent = event;
  form.hidden = revealed;
  el('reveal').hidden = !revealed;
  el('clock').textContent = daily ? '' : 'Untimed';
  if (revealed) {
    const a = answers[i];
    const difference = a === null ? 'Time expired' : a === year ? 'Exact year' :
      Math.abs(a-year) + ' years ' + (a < year ? 'early' : 'late');
    el('result').textContent = points(year,a) + ' pts';
    el('verdict').textContent = labels[rating(points(year,a))];
    el('answer-detail').textContent = 'Correct: ' + year + ' · Yours: ' + (a ?? 'No answer') + ' · ' + difference;
    react(points(year,a));
    el('source').href = source;
    el('fact').textContent = 'Fern’s note: ' + fact;
    el('next').textContent = i === 6 ? 'Open ledger →' : 'Next record →';
    el('next').focus();
  } else {
    el('npc-reaction').hidden = true; el('npc-idle').hidden = false; el('npc-score').textContent = ''; el('npc-label').textContent = 'Fern'; el('year').value = '';
    el('year').focus();
  }
}
function submit(a) {
  if (phase !== 'question') return;
  answers.push(daily && Date.now() >= deadline ? null : a);
  phase = 'reveal';
  render();
}
function tick() {
  if (!daily || phase !== 'question') return;
  const left = Math.ceil((deadline - Date.now()) / 1000);
  if (left <= 0) submit(null);
  else el('clock').textContent = left + ' s';
}
form.onsubmit = event => { event.preventDefault(); submit(Number(el('year').value)); };
el('next').onclick = () => {
  if (phase !== 'reveal') return;
  phase = answers.length === 7 ? 'finish' : 'question';
  deadline = Date.now() + 25000;
  render();
  tick();
};
el('daily').onclick = () => start(true);
el('practice').onclick = el('again').onclick = () => start(false);
el('share').onclick = async () => {
  const message = 'The Year Archive · ' + el('total').textContent;
  try {
    if (navigator.share) await navigator.share({text:message});
    else { await navigator.clipboard.writeText(message); el('shareStatus').textContent = 'Score copied.'; }
  } catch (error) { if (error.name !== 'AbortError') el('shareStatus').textContent = message; }
};
setInterval(tick,250);
