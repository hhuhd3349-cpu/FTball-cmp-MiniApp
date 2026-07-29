// ---------- TELEGRAM WEBAPP INIT ----------
const tg = window.Telegram?.WebApp;
let currentUserName = "Guest";

if (tg) {
  tg.ready();
  tg.expand();
  document.body.classList.add('tg-app');

  // Adapt to Telegram's theme colors if available
  if (tg.themeParams?.bg_color) {
    document.documentElement.style.setProperty('--tg-green', tg.themeParams.bg_color);
  }
  tg.setHeaderColor?.('#052e16');
  tg.setBackgroundColor?.('#052e16');

  const tgUser = tg.initDataUnsafe?.user;
  if (tgUser?.first_name) {
    currentUserName = tgUser.first_name;
  }

  // Disable vertical swipe-to-close so trivia scrolling feels native
  tg.disableVerticalSwipes?.();
}

function haptic(style = 'light'){
  tg?.HapticFeedback?.impactOccurred?.(style);
}

// ---------- DATA ----------
const playbooks = [
  { title: "4-3-3 Attacking Shape", icon:"⚔️", text:"Wingers hug the touchline to stretch the defense, the lone striker pins center-backs, and the double pivot recycles possession while the attacking mid roams between lines." },
  { title: "4-4-2 Compact Block", icon:"🛡️", text:"Two banks of four stay tight and narrow, inviting play out wide before pressing as a unit. Great for absorbing pressure and hitting on the counter." },
  { title: "Corner Kick Routine", icon:"🎯", text:"Near-post flick-on from the strongest header, with two runners peeling to the back post and one blocker screening the keeper's line of sight." },
  { title: "High Press Trigger", icon:"🔥", text:"Press is triggered the moment the ball is played back to the center-back — front three cut passing lanes while full-backs jump onto wingers." },
  { title: "False 9 Movement", icon:"🌀", text:"The striker drops deep to drag a center-back out of position, opening space in behind for wingers or an onrushing midfielder to exploit." },
];

const chants = [
  { title: "\"You'll Never Walk Alone\"", icon:"🎶", text:"A terrace anthem of unity and hope — sung arm-in-arm, scarves raised, echoing around the stadium before kickoff." },
  { title: "The Bouncing Chant", icon:"🕺", text:"When the home side scores late, the whole stand jumps in unison, chanting the scorer's name over and over until the noise shakes the stadium." },
  { title: "Keeper's Song", icon:"🧤", text:"A call-and-response chant dedicated to the goalkeeper after a big save — building from a whisper to a full-throated roar." },
  { title: "Match-Day Build Up", icon:"📣", text:"Sung on the walk to the ground, this chant gets fans in the mood, growing louder the closer they get to the turnstiles." },
  { title: "Derby Day Classic", icon:"🔴", text:"Reserved for the fiercest rivalries — sharp, proud, and loud enough to be heard from outside the ground." },
];

const triviaQuestions = [
  { q:"How many players are on a football team on the pitch (including the goalkeeper)?", options:["9","10","11","12"], answer:2 },
  { q:"What is the maximum duration of regular play in a standard football match (excluding stoppage time)?", options:["80 minutes","90 minutes","100 minutes","120 minutes"], answer:1 },
  { q:"What is it called when a player scores three goals in one match?", options:["Brace","Hat-trick","Treble","Triple"], answer:1 },
  { q:"Which competition is widely regarded as the most prestigious club tournament in Europe?", options:["Europa League","UEFA Champions League","Club World Cup","Conference League"], answer:1 },
  { q:"What is the term for a pass played through the defensive line into space?", options:["Through ball","Cross","Long ball","Cutback"], answer:0 },
];

// ---------- STATE ----------
let triviaIndex = 0;
let score = 0;

// ---------- SCREEN NAVIGATION ----------
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'leaderboard-screen') renderLeaderboard();
}

document.getElementById('start-btn').addEventListener('click', () => {
  haptic();
  document.getElementById('welcome-text').textContent =
    currentUserName !== "Guest" ? `Welcome, ${currentUserName}!` : "Welcome to the Club";
  showScreen('home-screen');
});

document.querySelectorAll('.menu-card').forEach(card => {
  card.addEventListener('click', () => {
    haptic();
    const target = card.dataset.target;
    showScreen(target + '-screen');
    if (target === 'trivia') startTrivia();
  });
});

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    haptic();
    showScreen('home-screen');
  });
});

// ---------- RENDER LISTS ----------
function renderList(containerId, data){
  const container = document.getElementById(containerId);
  container.innerHTML = data.map(item => `
    <div class="info-card">
      <h3>${item.icon} ${item.title}</h3>
      <p>${item.text}</p>
    </div>
  `).join('');
}
renderList('playbooks-list', playbooks);
renderList('chants-list', chants);

// ---------- TRIVIA ----------
function startTrivia(){
  triviaIndex = 0;
  score = 0;
  document.getElementById('trivia-box').style.display = 'block';
  document.getElementById('result-box').style.display = 'none';
  loadQuestion();
}

function loadQuestion(){
  const current = triviaQuestions[triviaIndex];
  document.getElementById('q-count').textContent = `Question ${triviaIndex+1} / ${triviaQuestions.length}`;
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('question-text').textContent = current.q;
  document.getElementById('next-btn').style.display = 'none';

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  current.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(idx));
    optionsDiv.appendChild(btn);
  });
}

function selectAnswer(idx){
  const current = triviaQuestions[triviaIndex];
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => b.disabled = true);

  if (idx === current.answer){
    buttons[idx].classList.add('correct');
    score++;
    haptic('medium');
  } else {
    buttons[idx].classList.add('wrong');
    buttons[current.answer].classList.add('correct');
    haptic('rigid');
  }
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('next-btn').style.display = 'inline-block';
}

document.getElementById('next-btn').addEventListener('click', () => {
  haptic();
  triviaIndex++;
  if (triviaIndex < triviaQuestions.length){
    loadQuestion();
  } else {
    showResult();
  }
});

function showResult(){
  document.getElementById('trivia-box').style.display = 'none';
  const resultBox = document.getElementById('result-box');
  resultBox.style.display = 'block';

  const total = triviaQuestions.length;
  let title, msg;
  if (score === total){
    title = "Legend! 🏆";
    msg = `Perfect score — ${score}/${total}. You know your football!`;
  } else if (score >= total * 0.6){
    title = "Solid Performance ⚽";
    msg = `You scored ${score}/${total}. Great football IQ!`;
  } else {
    title = "Keep Learning 📘";
    msg = `You scored ${score}/${total}. Explore the playbooks and try again!`;
  }
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-msg').textContent = msg;

  saveScore(currentUserName, score, total);
}

document.getElementById('retry-btn').addEventListener('click', () => {
  haptic();
  startTrivia();
});

// ---------- LEADERBOARD (localStorage) ----------
const LB_KEY = 'fc_leaderboard';

function saveScore(name, score, total){
  const entries = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  entries.push({
    name,
    score,
    total,
    date: new Date().toLocaleDateString()
  });
  // keep top 20 by score
  entries.sort((a, b) => b.score - a.score);
  localStorage.setItem(LB_KEY, JSON.stringify(entries.slice(0, 20)));
}

function renderLeaderboard(){
  const entries = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  const list = document.getElementById('leaderboard-list');
  const empty = document.getElementById('leaderboard-empty');

  if (entries.length === 0){
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = entries.map((e, i) => `
    <div class="lb-row">
      <span class="lb-rank">#${i+1}</span>
      <div class="lb-info">
        <div class="lb-name">${e.name}</div>
        <div class="lb-date">${e.date}</div>
      </div>
      <span class="lb-score">${e.score}/${e.total}</span>
    </div>
  `).join('');
}
