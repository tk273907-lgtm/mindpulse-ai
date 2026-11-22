const API_URL = 'https://mindpulse-ai-fgqd.onrender.com';  // deploy ke baad live backend URL yahan daalna
const COUNTRIES = ["Other", "India", "USA", "Canada", "Australia", "UK", "Germany", "Mexico", "Turkey", "France", "Spain", "Ireland", "Japan", "Denmark", "Switzerland", "Nepal", "Italy", "Russia", "Sri Lanka", "Maldives", "Bangladesh", "Pakistan", "Poland", "South Korea", "China", "Brazil", "Singapore", "New Zealand", "Malaysia", "Netherlands", "UAE", "Finland", "Uzbekistan", "Afghanistan", "Qatar", "Sweden", "Norway", "Egypt", "Paraguay", "Cyprus", "Vietnam", "Argentina", "Costa Rica", "Romania", "Moldova", "Georgia", "Andorra", "Belgium", "Greece", "South Africa", "Peru", "Panama", "Trinidad", "Czech Republic", "Latvia", "Lithuania", "North Macedonia", "Lebanon", "Iraq", "Hong Kong", "Morocco", "Nigeria", "Slovakia", "Ukraine", "Kazakhstan", "Tajikistan", "Monaco", "San Marino", "Vatican City", "Albania", "Austria", "Portugal", "Philippines", "Indonesia", "Taiwan", "Israel", "Ghana", "Chile", "Venezuela", "Jamaica", "Bahamas", "Hungary", "Bulgaria", "Estonia", "Azerbaijan", "Malta", "Luxembourg", "Liechtenstein", "Kosovo", "Bahrain", "Oman", "Jordan", "Bhutan", "Thailand", "Kenya", "Colombia", "Ecuador", "Uruguay", "Bolivia", "Iceland", "Croatia", "Serbia", "Slovenia", "Belarus", "Kyrgyzstan", "Armenia", "Montenegro", "Bosnia", "Kuwait", "Yemen", "Syria"];
const PLATFORMS = ['Instagram','TikTok','YouTube','WhatsApp','Snapchat','Facebook','Twitter','LinkedIn','WeChat','LINE','KakaoTalk','VKontakte'];
const STRESS = ['Low','Medium','High','Very High'];

const STEPS = [
  {t:'Profile', f:[
    {k:'Age', l:'Age', type:'num', min:10, max:100, v:20},
    {k:'Gender', l:'Gender', type:'seg', o:['Male','Female']},
    {k:'Country', l:'Country', type:'text'},
    {k:'Academic_Level', l:'Academic level', type:'seg', o:['High School','Undergraduate','Graduate']}]},
  {t:'Habits', f:[
    {k:'Most_Used_Platform', l:'Most used platform', type:'seg', o:PLATFORMS},
    {k:'Purpose_Of_Use', l:'Main purpose of use', type:'seg', o:['Networking','Education','Entertainment','News']},
    {k:'Avg_Daily_Usage_Hours', l:'Daily social media use', type:'range', min:0, max:16, step:.5, v:4, u:'h'},
    {k:'Daily_Unlocks', l:'Phone unlocks per day', type:'range', min:0, max:300, step:5, v:60, u:''}]},
  {t:'Lifestyle', f:[
    {k:'Study_Hours', l:'Study hours per day', type:'range', min:0, max:14, step:.5, v:3, u:'h'},
    {k:'Physical_Activity_Hours', l:'Physical activity per day', type:'range', min:0, max:6, step:.5, v:1, u:'h'},
    {k:'Sleep_Hours_Per_Night', l:'Sleep per night', type:'range', min:0, max:12, step:.5, v:7, u:'h'},
    {k:'Stress_Level', l:'Stress level', type:'seg', o:STRESS}]}
];

const $ = s => document.querySelector(s);
const S = {};
STEPS.forEach(s => s.f.forEach(f => { if (f.v !== undefined) S[f.k] = f.v; }));
let cur = 0;

/* ---------- render ---------- */
function field(f) {
  let h = `<div class="fld"><div class="lab"><label>${f.l}</label>${f.type === 'range' ? `<output id="o_${f.k}"></output>` : ''}</div>`;
  if (f.type === 'seg') h += '<div class="seg" role="radiogroup">' + f.o.map(o => `<label><input type="radio" name="${f.k}" value="${o}"><span>${o}</span></label>`).join('') + '</div>';
  else if (f.type === 'range') h += `<input type="range" data-k="${f.k}" data-u="${f.u}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.v}" aria-label="${f.l}">`;
  else if (f.type === 'num') h += `<input class="txt" type="number" inputmode="numeric" data-k="${f.k}" min="${f.min}" max="${f.max}" value="${f.v}" aria-label="${f.l}">`;
  else h += `<input class="txt" data-k="${f.k}" list="cl" placeholder="Start typing your country" autocomplete="off" aria-label="${f.l}">`;
  return h + '</div>';
}
$('#panels').innerHTML = STEPS.map((s, i) => `<div class="panel" data-i="${i}">${s.f.map(field).join('')}</div>`).join('');
$('#steps').innerHTML = '<i></i>' + STEPS.map((s, i) => `<div class="st"><b>${i + 1}</b>${s.t}</div>`).join('');
$('#cl').innerHTML = COUNTRIES.map(c => `<option value="${c}">`).join('');
$('h1').innerHTML = [...'MindPulse'].map((c, i) => `<span style="--i:${i}" aria-hidden="true">${c}</span>`).join('');

function paint(el) {
  el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%');
  $('#o_' + el.dataset.k).textContent = el.value + el.dataset.u;
}
document.querySelectorAll('input[type=range]').forEach(paint);

function go(i, dir = 1) {
  cur = i;
  document.querySelectorAll('.panel').forEach((p, j) => { p.classList.toggle('on', j === i); p.style.setProperty('--dx', dir * 26 + 'px'); });
  document.querySelectorAll('.st').forEach((s, j) => { s.classList.toggle('on', j === i); s.classList.toggle('done', j < i); });
  $('.steps>i').style.width = `calc((100% - 26px) * ${i / (STEPS.length - 1)})`;
  $('#back').disabled = i === 0;
  $('#next').textContent = i === STEPS.length - 1 ? 'Predict my score' : 'Next';
}

/* ---------- form logic ---------- */
$('#form').addEventListener('input', e => {
  const t = e.target, k = t.name || t.dataset.k;
  S[k] = t.value;
  if (t.type === 'range') paint(t);
  hideErr(); drive();
});
$('#form').onsubmit = e => { e.preventDefault(); $('#next').click(); };

function valid(i) {
  for (const f of STEPS[i].f) {
    const v = S[f.k];
    if (v === undefined || String(v).trim() === '') return `Please fill in: ${f.l.toLowerCase()}.`;
    if (f.k === 'Age' && !(v >= 10 && v <= 100)) return 'Age must be between 10 and 100.';
  }
  return '';
}
const showErr = m => { const e = $('#err'); e.textContent = m; e.hidden = false; };
const hideErr = () => { $('#err').hidden = true; };
function fail(m) {
  showErr(m);
  const c = $('#card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
}
$('#next').onclick = () => {
  const m = valid(cur);
  if (m) return fail(m);
  hideErr();
  cur < STEPS.length - 1 ? go(cur + 1) : predict();
};
$('#back').onclick = () => { hideErr(); go(cur - 1, -1); };

function payload() {
  const o = {};
  STEPS.forEach(s => s.f.forEach(f => {
    o[f.k] = (f.type === 'num' || f.type === 'range') ? Number(S[f.k]) : String(S[f.k]).trim();
  }));
  o.Age = Math.round(o.Age);
  o.Daily_Unlocks = Math.round(o.Daily_Unlocks);
  const m = COUNTRIES.find(c => c.toLowerCase() === o.Country.toLowerCase());
  if (m) o.Country = m;
  return o;
}

async function predict() {
  const b = $('#next'); b.classList.add('busy'); b.textContent = 'Reading your signals';
  try {
    const r = await fetch(API_URL + '/predict', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload())});
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(r.status === 422 && Array.isArray(j.detail) ? j.detail.map(d => `${d.loc.slice(-1)}: ${d.msg}`).join(' | ') : 'Server error ' + r.status);
    showResult(j.predicted_mental_health_score);
  } catch (e) {
    fail(e instanceof TypeError ? `Can't reach the API at ${API_URL}. Is uvicorn running?` : e.message);
  } finally {
    b.classList.remove('busy'); b.textContent = 'Predict my score';
  }
}

/* ---------- result ---------- */
const BANDS = [
  [7.5, 'Thriving', 'Your signals point to a strong score.'],
  [6.5, 'Steady', 'Mostly balanced, with some room to improve.'],
  [5.5, 'Under strain', 'A few habits are pulling the score down.'],
  [0, 'Needs attention', 'Several signals point to a low score.']
];
function showResult(score) {
  $('#form').hidden = true; $('.steps').hidden = true; $('#result').hidden = false;
  const arc = $('#arc'); arc.style.strokeDashoffset = 565.49;
  requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.strokeDashoffset = 565.49 * (1 - Math.min(score, 10) / 10); }));
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min(1, (t - t0) / 1900);
    $('#score').textContent = (p < 1 ? score * (1 - Math.pow(2, -10 * p)) : score).toFixed(2);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
  const b = BANDS.find(x => score >= x[0]);
  $('#band').textContent = b[1]; $('#bandtxt').textContent = b[2];
  const tips = [];
  if (+S.Sleep_Hours_Per_Night < 6.5) tips.push(`Sleep is ${S.Sleep_Hours_Per_Night}h. In the training data, more sleep goes with higher scores.`);
  if (+S.Avg_Daily_Usage_Hours >= 6) tips.push(`${S.Avg_Daily_Usage_Hours}h of daily social media use is high. Heavier use goes with lower scores in the data.`);
  if (+S.Daily_Unlocks >= 120) tips.push(`${S.Daily_Unlocks} unlocks a day is frequent, and frequent unlocking also tracks with lower scores.`);
  if (+S.Physical_Activity_Hours < 1) tips.push('Under an hour of physical activity. More activity goes with higher scores in the data.');
  if (STRESS.indexOf(S.Stress_Level) >= 2) tips.push(`Stress is reported as ${S.Stress_Level.toLowerCase()}, which is the strongest category effect in the dataset.`);
  if (!tips.length) tips.push('Sleep, screen time and stress all sit in a healthy range in your answers.');
  $('#tips').innerHTML = tips.slice(0, 3).map((t, i) => `<li style="--i:${i}">${t}</li>`).join('');
  setTarget((9.4 - score) / 5.8);
}
$('#again').onclick = () => {
  $('#result').hidden = true; $('#form').hidden = false; $('.steps').hidden = false;
  $('#arc').style.strokeDashoffset = 565.49; go(0, -1); drive();
};

/* ---------- live pulse canvas ---------- */
const cv = $('#bg'), cx = cv.getContext('2d');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
let W, H, dpr, load = .35, target = .35, mx = .5, my = .5;
function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; if (calm) frame(0); }
const P = Array.from({length: 55}, () => ({x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * 2e-4, vy: (Math.random() - .5) * 2e-4}));
const g = (p, c, w, a) => a * Math.exp(-(((p - c) / w) ** 2));
const ecg = p => g(p, .2, .035, .12) + g(p, .4, .008, -.15) + g(p, .43, .012, 1) + g(p, .46, .01, -.3) + g(p, .72, .05, .2);
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function frame(t) {
  load += (target - load) * .04;
  cx.clearRect(0, 0, W, H);
  cx.shadowBlur = 0;
  for (const p of P) { p.x = (p.x + p.vx * 16 + 1) % 1; p.y = (p.y + p.vy * 16 + 1) % 1; }
  const ox = (mx - .5) * -30 * dpr, oy = (my - .5) * -30 * dpr;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], ax = a.x * W + ox, ay = a.y * H + oy;
    cx.fillStyle = 'rgba(150,160,255,.55)'; cx.fillRect(ax, ay, 2 * dpr, 2 * dpr);
    for (let j = i + 1; j < P.length; j++) {
      const b = P[j], d = Math.hypot(ax - (b.x * W + ox), ay - (b.y * H + oy));
      if (d < 120 * dpr) { cx.strokeStyle = `rgba(150,160,255,${.14 * (1 - d / (120 * dpr))})`; cx.lineWidth = dpr; cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(b.x * W + ox, b.y * H + oy); cx.stroke(); }
    }
  }
  const col = mix([56, 240, 208], [255, 109, 141], load).join(',');
  const cycles = 2 + load * 4, amp = H * (.05 + .11 * load), y0 = H * .8, ph = t * (.0002 + load * .0006);
  const gr = cx.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(.5, `rgba(${col},.95)`); gr.addColorStop(1, `rgba(${col},0)`);
  cx.strokeStyle = gr; cx.lineWidth = 2.5 * dpr; cx.lineJoin = 'round';
  cx.shadowColor = `rgb(${col})`; cx.shadowBlur = 18 * dpr;
  cx.beginPath();
  for (let x = 0; x <= W; x += 3 * dpr) {
    const q = x / W * cycles - ph, p = q - Math.floor(q);
    const y = y0 - amp * ecg(p) + Math.sin(x * .05 / dpr + t * .01) * load * H * .004;
    x ? cx.lineTo(x, y) : cx.moveTo(x, y);
  }
  cx.stroke();
  if (!calm) requestAnimationFrame(frame);
}
function setTarget(v) {
  target = Math.min(1, Math.max(0, v));
  $('#sig').textContent = target < .3 ? 'calm' : target < .55 ? 'steady' : target < .8 ? 'elevated' : 'strained';
  if (calm) { load = target; frame(0); }
}
function drive() {
  const st = STRESS.indexOf(S.Stress_Level);
  setTarget(.3 * (+S.Avg_Daily_Usage_Hours) / 10 + .2 * (+S.Daily_Unlocks) / 150 + .2 * (st < 0 ? 1 : st) / 3 + .2 * (1 - (+S.Sleep_Hours_Per_Night) / 8) + .1 * (1 - (+S.Physical_Activity_Hours) / 2));
}

const tilt = !calm && matchMedia('(pointer:fine)').matches;
addEventListener('pointermove', e => {
  mx = e.clientX / innerWidth; my = e.clientY / innerHeight;
  const c = $('#card'), r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
  if (tilt) c.style.transform = `perspective(1100px) rotateY(${(mx - .5) * 3}deg) rotateX(${(.5 - my) * 3}deg)`;
});
addEventListener('resize', size);

size(); go(0); drive();
if (!calm) requestAnimationFrame(frame);
