const categories = [
  {
    name: 'Top 10 clubs with the most Premier League titles',
    answers: [
      'Manchester United',
      'Manchester City',
      'Chelsea',
      'Arsenal',
      'Liverpool',
      'Blackburn Rovers',
      'Leicester City',
      'Everton',
      'Leeds United',
      'Newcastle United'
    ]
  },
  {
    name: 'Top 10 popular pizza toppings',
    answers: [
      'Pepperoni',
      'Mushrooms',
      'Onions',
      'Sausage',
      'Bacon',
      'Extra cheese',
      'Black olives',
      'Green peppers',
      'Pineapple',
      'Spinach'
    ]
  }
];

const maxLives = 3;

const state = {
  category: null,
  guessed: new Set(),
  lives: maxLives,
  gameOver: false
};

const categoryText = document.getElementById('categoryText');
const livesText = document.getElementById('livesText');
const scoreText = document.getElementById('scoreText');
const bestScoreText = document.getElementById('bestScoreText');
const slotsGrid = document.getElementById('slotsGrid');
const guessInput = document.getElementById('guessInput');
const submitGuessButton = document.getElementById('submitGuessButton');
const feedbackText = document.getElementById('feedbackText');
const endArea = document.getElementById('endArea');
const endMessage = document.getElementById('endMessage');
const fullAnswerList = document.getElementById('fullAnswerList');
const playAgainButton = document.getElementById('playAgainButton');

function normalize(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function currentAnswers() {
  return state.category.answers;
}

function getBestScore() {
  return localStorage.getItem('top10BestLivesLost');
}

function setBestScore(livesLost) {
  const currentBest = getBestScore();
  if (currentBest === null || livesLost < Number(currentBest)) {
    localStorage.setItem('top10BestLivesLost', String(livesLost));
  }
}

function updateBestScoreUI() {
  const best = getBestScore();
  bestScoreText.textContent = best === null ? 'N/A' : `${best} lives lost`;
}

function updateStatusUI() {
  livesText.textContent = '❤️'.repeat(state.lives) || '💔';
  scoreText.textContent = `${state.guessed.size} / ${currentAnswers().length}`;
}

function renderSlots() {
  slotsGrid.innerHTML = '';

  currentAnswers().forEach((answer, index) => {
    const slot = document.createElement('div');
    const isGuessed = state.guessed.has(normalize(answer));
    slot.className = `slot ${isGuessed ? 'filled' : ''}`;
    slot.textContent = isGuessed ? `${index + 1}. ${answer}` : `${index + 1}. ????`;
    slotsGrid.appendChild(slot);
  });
}

function setFeedback(message, type = 'info') {
  feedbackText.textContent = message;
  feedbackText.className = `feedback ${type}`;
}

function disableInput(disabled) {
  guessInput.disabled = disabled;
  submitGuessButton.disabled = disabled;
}

function showFullList() {
  fullAnswerList.innerHTML = '';
  currentAnswers().forEach((answer) => {
    const li = document.createElement('li');
    li.textContent = answer;
    fullAnswerList.appendChild(li);
  });
}

function endGame(win) {
  state.gameOver = true;
  disableInput(true);
  endArea.classList.remove('hidden');
  showFullList();

  if (win) {
    endMessage.textContent = '🎉 You win!';
    setFeedback('🎉 You guessed all 10! You win!', 'success');
    setBestScore(maxLives - state.lives);
    updateBestScoreUI();
  } else {
    endMessage.textContent = '💀 Game over!';
    setFeedback('💀 No lives remaining. Game over.', 'error');
  }
}

function checkWin() {
  if (state.guessed.size === currentAnswers().length) {
    endGame(true);
  }
}

function handleGuess() {
  if (state.gameOver) {
    return;
  }

  const rawGuess = guessInput.value;
  const guess = normalize(rawGuess);

  if (!guess) {
    setFeedback('Please enter a club name.', 'info');
    return;
  }

  const normalizedAnswers = currentAnswers().map((answer) => normalize(answer));

  if (state.guessed.has(guess)) {
    setFeedback('You already guessed that club.', 'info');
    guessInput.value = '';
    guessInput.focus();
    return;
  }

  const answerIndex = normalizedAnswers.indexOf(guess);

  if (answerIndex !== -1) {
    state.guessed.add(guess);
    setFeedback(`✅ Correct! ${currentAnswers()[answerIndex]} is on the list.`, 'success');
    renderSlots();
    updateStatusUI();
    checkWin();
  } else {
    state.lives -= 1;
    setFeedback('❌ Wrong guess. You lost a life.', 'error');
    updateStatusUI();

    if (state.lives === 0) {
      endGame(false);
    }
  }

  guessInput.value = '';
  guessInput.focus();
}

function pickRandomCategory() {
  return categories[Math.floor(Math.random() * categories.length)];
}

function resetGame() {
  state.category = pickRandomCategory();
  state.guessed = new Set();
  state.lives = maxLives;
  state.gameOver = false;

  categoryText.textContent = `Category: ${state.category.name}`;
  endArea.classList.add('hidden');
  disableInput(false);
  guessInput.value = '';

  setFeedback('Start guessing!', 'info');
  renderSlots();
  updateStatusUI();
  updateBestScoreUI();
  guessInput.focus();
}

submitGuessButton.addEventListener('click', handleGuess);

guessInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleGuess();
  }
});

playAgainButton.addEventListener('click', resetGame);

resetGame();
