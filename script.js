let correctGuesses = 0;
let incorrectGuesses = 0;
let gameStartTime = null;

const dictionary = [
  "listen", "silent", "enlist", "tears", "stare", "aster", "earth", "heart",
    "below", "elbow", "state", "taste", "angel", "glean", "evil", "vile", "live", "veil",
    "thing", "night", "save", "vase", "file", "life", "bare", "bear", "flow", "wolf",
    "meat", "team", "mate", "dusty", "study", "saw", "was", "rat", "tar", "art", "tap", "pat",
    "god", "dog", "act", "cat", "opt", "pot", "top", "brag", "grab", "stone", "tones", "notes",
    "loop", "pool", "rail", "liar", "lair", "inch", "chin", "spit", "tips",
    "cheaters", "teachers", "reaches", "painter", "repaint", "pertain", "carets", "caster",
    "crates", "reacts", "recast", "traces", "paste", "pates", "peats", "septa", "spate", "tapes",
    "stressed", "desserts", "stream", "master", "tamers", "players", "replays", "parsley",
    "gallery", "largely", "regally", "admirer", "married", "danger", "garden", "bored", "robed",
    "rescue", "secure", "dare", "read", "dear", "cinema", "iceman", "arc", "car", "scare", "races",
    "cares", "elan", "lean", "lane", "panel", "penal", "plane", "ranger", "garner", "fired", "fried",
    "parse", "spear", "pares", "reaps", "curse", "cruse", "dust", "stud", "fast", "fats", "teal", "tale",
    "late", "scar", "cars", "arcs", "her", "reh", "least", "slate", "stale", "steal", "tales", "robe", "bore",
    "seat", "eats", "teas", "east", "share", "hears", "shear", "pale", "leap", "plea", "stop", "post", "pots",
    "spot", "tops", "word", "drow", "care", "race", "acre", "slip", "lisp", "lips", "rope", "repo", "pore",
    "tone", "note", "seal", "sale", "leas", "ear", "are", "era", "band", "brand", "clamp", "lamb", "lamp",
    "tree", "beer", "deer", "seek", "sake", "cake", "fake", "snake", "lock", "cork", "fork", "work", "mark",
    "land", "sand", "plan", "bland", "cart", "track", "back", "bark", "dark", "stack", "snack", "shell", "bell",
    "knight", "fight", "bright", "tight", "night", "long", "gong", "song", "wrong", "strong", "fight", "right",
    "change", "range", "grape", "page", "rage", "stage", "salad", "dials", "scale", "seal", "seals", "flame",
    "glame", "flute", "blute", "blaze", "paze", "flop", "plop", "slip", "clip", "flip", "slap", "clap", "wrap",
    "skip", "trip", "blip", "sick", "lick", "tick", "pick", "slick", "snap", "trap", "crap", "wrap", "flag",
    "stag", "drag", "swag", "flap", "clap", "lap", "zap", "clot", "plot", "slot", "stunt", "bunt", "font",
    "lone", "bone", "cone", "done", "tone", "clue", "blue", "shoe", "glue", "brood", "food", "mood", "wood",
    "root", "hoot", "boot", "loot", "stoop", "loop", "hoop", "soap", "soup", "broom", "room", "groom", "doom",
    "goose", "loose", "muse", "fuse", "tune", "bune", "rune", "dune", "wheat", "heats", "earth", "heart", "clean",
    "lawn", "wan", "fan", "scan", "plan", "span", "mark", "park", "lark", "shark", "lark", "dark", "fire", "hire",
    "wire", "sire", "mire", "dire", "fire", "bore", "roar", "boar", "door", "moor", "floor", "core", "store",
    "show", "snow", "glow", "flow", "throw", "blow", "glow", "slow", "crow", "grow", "frog", "log", "clog", "frog",
    "plug", "slug", "shrug", "snug", "hug", "rug", "bug", "mug", "hug", "chug", "luggage", "wage", "page", "rage",
    "time", "mite", "rite", "lite", "site", "bite", "kite", "pipe", "grip", "ship", "chip", "slip", "flip", "grip"
  ];
  

const levels = {
  easy: dictionary.filter(word => word.length <= 4),
  medium: dictionary.filter(word => word.length >= 5 && word.length <= 6),
  hard: dictionary.filter(word => word.length >= 7)
};

let currentWord = '';
let scrambledWord = '';
let score = 0;
let currentPath = [];
let wrongTries = 0;
const maxWrongTries = 4;

let correctCount = 0;
let incorrectCount = 0;

// ---------------- Utility Functions ----------------
function shuffleWord(word) {
  let arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function isAnagram(word1, word2) {
  return word1.split('').sort().join('') === word2.split('').sort().join('');
}

function heuristic(word, target) {
  let diff = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== target[i]) diff++;
  }
  return diff;
}

// ---------------- Score and Feedback ----------------
function updateScore() {
  document.getElementById('score').innerText = score;
  const scoreBox = document.getElementById('floatingScore');
  scoreBox.classList.add('bump');
  setTimeout(() => scoreBox.classList.remove('bump'), 500);
}

function showFeedback(type, message) {
  const fb = document.getElementById('feedback');
  fb.className = `feedback show ${type}`;
  fb.innerText = message;
  setTimeout(() => fb.classList.remove('show'), 1200);
}

// ---------------- Game Flow ----------------
function startGame() {
  const level = document.getElementById('levelSelect').value;
  const wordList = levels[level];
  const randomIndex = Math.floor(Math.random() * wordList.length);
  currentWord = wordList[randomIndex];
  scrambledWord = shuffleWord(currentWord);
  currentPath = [];
  wrongTries = 0;

  if (!gameStartTime) {
    gameStartTime = performance.now();
  }

  document.getElementById('scrambledWord').textContent = scrambledWord;
  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').disabled = false;
}

let hasReachedTwenty = false; 

function submitGuess() {
  const guess = document.getElementById('guessInput').value.trim().toLowerCase();
  if (!guess) return;

  const level = document.getElementById('levelSelect').value;
  let points = 10;
  if (level === 'easy') points = 4;
  else if (level === 'medium') points = 6;
  else if (level === 'hard') points = 10;

  if (guess === currentWord) {
    score += points;
    correctCount++;

    if (score >= 20) {
      hasReachedTwenty = true;
    }

    updateScore();
    showFeedback("correct", ` Correct! +${points}`);
    setTimeout(() => {
      startGame();
    }, 800);
  } else {
    if (!currentPath.length) {
      currentPath = dfs(scrambledWord, currentWord) || [];
    }

    if (currentPath.includes(guess)) {
      showModal(`"${guess}" is part of the transformation path.`);
      showFeedback("partial", " Almost There!");
    } else {
      wrongTries++;
      incorrectCount++;
      score -= 5;

      if (hasReachedTwenty && score < 0) {
        updateScore();
        showFeedback("incorrect", `Wrong! (-5) Score fell below 0 after reaching 20.`);
        endGameWithStats("scoreBelowZero");
        return;
      }

      updateScore();
      showFeedback("incorrect", ` Wrong! (-5)  ${maxWrongTries - wrongTries} tries left`);

      if (wrongTries >= maxWrongTries) {
        endGameWithStats("4 attemps fail");
      }
    }
  }

  document.getElementById('guessInput').value = '';
}

// ---------------- Modal ----------------
function showModal(text) {
  document.getElementById('modalText').innerText = text;
  document.getElementById('modal').style.display = "block";
}
function closeModal() {
  document.getElementById('modal').style.display = "none";
}
function closeDFSModal() {
  document.getElementById('dfsModal').style.display = "none";
}
function closeAstarModal() {
  document.getElementById('astarModal').style.display = "none";
}

let solverModalUses = 0;
let modalPenaltyApplied = false;



// ---------------- DFS Solver ----------------
function dfs(node, target, visited = new Set()) {
  if (node === target) return [node];
  visited.add(node);
  for (let word of dictionary) {
    if (isAnagram(node, word) && !visited.has(word)) {
      const path = dfs(word, target, visited);
      if (path) return [node, ...path];
    }
  }
  return null;
}

function runDFS() {
  solverModalUses++;
  if (solverModalUses > 3) {
    score -= 2;
    updateScore();
    showFeedback("partial", "Hint used more than 3 times  (-2 )");
  }

  const startTime = performance.now();
  const path = dfs(scrambledWord, currentWord);
  const endTime = performance.now();
  const timeTaken = (endTime - startTime).toFixed(2);
  document.getElementById('dfsPathContent').innerHTML =
    path ? `Path: ${path.join(' → ')}<br>Time Taken: ${timeTaken} ms`
         : `No path found.<br>Time Taken: ${timeTaken} ms`;
  document.getElementById('dfsModal').style.display = "block";
}

// ---------------- A* Solver ----------------
function aStar(start, goal) {
  const openSet = [{ word: start, path: [start], cost: 0 }];
  const visited = new Set();
  while (openSet.length > 0) {
    openSet.sort((a, b) => (a.cost + heuristic(a.word, goal)) - (b.cost + heuristic(b.word, goal)));
    const current = openSet.shift();
    if (current.word === goal) return current.path;
    visited.add(current.word);
    for (let word of dictionary) {
      if (isAnagram(current.word, word) && !visited.has(word)) {
        openSet.push({ word, path: [...current.path, word], cost: current.cost + 1 });
      }
    }
  }
  return null;
}

function runAStar() {
  solverModalUses++;
  if (solverModalUses > 3) {
    score -= 2;
    updateScore();
    showFeedback("partial", "Hint used more than 3 times  (-2 )");
  }

  const startTime = performance.now();
  const path = aStar(scrambledWord, currentWord);
  const endTime = performance.now();
  const timeTaken = (endTime - startTime).toFixed(2);
  document.getElementById('astarPathContent').innerHTML =
    path ? `Path: ${path.join(' → ')}<br>Time Taken: ${timeTaken} ms`
         : `No valid path found.<br>Time Taken: ${timeTaken} ms`;
  document.getElementById('astarModal').style.display = "block";
}

// ---------------- Modals Draggable ----------------
function makeDraggable(modalId) {
  const modal = document.getElementById(modalId);
  let offsetX, offsetY;
  modal.onmousedown = function (e) {
    e.preventDefault();
    offsetX = e.clientX - modal.getBoundingClientRect().left;
    offsetY = e.clientY - modal.getBoundingClientRect().top;
    document.onmousemove = function (e) {
      modal.style.left = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - modal.offsetWidth)) + 'px';
      modal.style.top = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - modal.offsetHeight)) + 'px';
    };
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

document.addEventListener('DOMContentLoaded', () => {
  makeDraggable('modal');
  makeDraggable('dfsModal');
  makeDraggable('astarModal');
});


function restartGame() {
  score = 0;
  updateScore();
  correctCount = 0;
  incorrectCount = 0;
  gameStartTime = null;

  document.getElementById('guessInput').disabled = false;
  document.querySelectorAll('.btn').forEach(btn => btn.disabled = false);

  const overlay = document.getElementById('gameOverOverlay');
  if (overlay) overlay.remove();

  startGame();
}



// ---------------- Sounds ----------------
const clickSound = document.getElementById('click-sound');
const submitSound = document.getElementById('submit-sound');
const levelSound = document.getElementById('level-sound');
const endGameSound = document.getElementById('floatingEndGameSound'); 
const levelSelect = document.getElementById('levelSelect');
const buttons = document.querySelectorAll('button');
const floatingEndGameDiv = document.getElementById('floatingEndGame');

window.addEventListener('load', () => {
  clickSound.play().then(() => clickSound.pause());
  submitSound.play().then(() => submitSound.pause());
  levelSound.play().then(() => levelSound.pause());
  endGameSound.play().then(() => endGameSound.pause());
});

// Sound for all normal buttons
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.id === 'submit-button') {
      submitSound.currentTime = 0;
      submitSound.play();
    } else {
      clickSound.currentTime = 0;
      clickSound.play();
    }
  });
});

// Sound for level select
levelSelect.addEventListener('change', () => {
  levelSound.currentTime = 0;
  levelSound.play();
});

//  Sound for the End Game DIV
floatingEndGameDiv.addEventListener('click', () => {
  endGameSound.currentTime = 0;
  endGameSound.play();
});


document.getElementById("floatingEndGame").addEventListener("click", () => {
  const finalScore = document.getElementById("score").innerText;
  document.getElementById("finalScoreDisplay").textContent = finalScore;
  document.getElementById("endGameModal").style.display = "block";
});


function triggerEndGameModal() {
  const finalScore = score;
  const correct = correctCount;
  const incorrect = incorrectCount;
  let timeTaken = "0s";

  if (gameStartTime) {
    const now = performance.now();
    timeTaken = ((now - gameStartTime) / 1000).toFixed(2) + "s";
  }

  document.getElementById("finalScoreDisplay").innerText = finalScore;
  document.getElementById("finalCorrectDisplay").innerText = correct;
  document.getElementById("finalIncorrectDisplay").innerText = incorrect;
  document.getElementById("finalTimeDisplay").innerText = timeTaken;

  document.getElementById("endGameModal").style.display = "flex";
}


function closeEndGameModal() {
  document.getElementById("endGameModal").style.display = "none";
}

function endGameWithStats(triggerSource = "manual") {
  const gameEndTime = performance.now();
  const timeTaken = gameStartTime ? ((gameEndTime - gameStartTime) / 1000).toFixed(2) : "0";

  const historyEntry = {
    date: new Date().toLocaleString(),
    correct: correctCount,
    incorrect: incorrectCount,
    timeTaken: parseFloat(timeTaken),
    score: score,
    endedBy: triggerSource
  };

  const history = JSON.parse(localStorage.getItem('gameHistory')) || [];
  history.push(historyEntry);
  localStorage.setItem('gameHistory', JSON.stringify(history));

  document.getElementById("finalScoreDisplay").innerText = score;
  document.getElementById("finalCorrectDisplay").innerText = correctCount;
  document.getElementById("finalIncorrectDisplay").innerText = incorrectCount;
  document.getElementById("finalTimeDisplay").innerText = timeTaken + "s";

  document.getElementById("endGameModal").style.display = "flex";

  // Reset game state
  document.getElementById('guessInput').disabled = true;
  document.querySelectorAll('.btn').forEach(btn => btn.disabled = true);
  gameStartTime = null;
}
      
