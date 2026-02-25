const state = {
  catalogs: {
    soccer: {
      label: 'Soccer',
      description: 'Legendary clubs, players, and moments.',
      items: [
        'Lionel Messi', 'Cristiano Ronaldo', 'Pelé', 'Diego Maradona', 'Real Madrid',
        'FC Barcelona', 'Manchester United', 'Champions League', 'World Cup', 'Zinedine Zidane',
        'Kylian Mbappé', 'Brazil', 'Argentina', 'Johan Cruyff', 'Sergio Ramos'
      ]
    },
    food: {
      label: 'Food',
      description: 'Popular foods from around the world.',
      items: [
        'Pizza', 'Burger', 'Tacos', 'Sushi', 'Pasta',
        'Fried Rice', 'Ice Cream', 'Ramen', 'Steak', 'Fries',
        'Burrito', 'Dumplings', 'Pancakes', 'Chicken Wings', 'Lasagna'
      ]
    },
    school: {
      label: 'School',
      description: 'Classroom topics, tools, and school life.',
      items: [
        'Math', 'Science', 'History', 'Notebook', 'Exam',
        'Homework', 'Project', 'Presentation', 'Library', 'Calculator',
        'Classroom', 'Essay', 'Geography', 'Art', 'Chemistry'
      ]
    }
  },
  currentCatalogKey: '',
  currentItems: [],
  leaderboard: [],
  theme: 'light',
  usedGuesses: new Set(),
  misses: 0
};

const homePage = document.getElementById('homePage');
const gamePage = document.getElementById('gamePage');
const adminPage = document.getElementById('adminPage');
const gameCatalog = document.getElementById('gameCatalog');
const topicTitle = document.getElementById('topicTitle');
const topicDescription = document.getElementById('topicDescription');
const itemsGrid = document.getElementById('itemsGrid');
const rerollButton = document.getElementById('rerollButton');
const backHomeButton = document.getElementById('backHomeButton');
const openAdminButton = document.getElementById('openAdminButton');
const adminBackHomeButton = document.getElementById('adminBackHomeButton');
const leaderboardRows = document.getElementById('leaderboardRows');
const addPlayerButton = document.getElementById('addPlayerButton');
const resetLeaderboardButton = document.getElementById('resetLeaderboardButton');
const itemTemplate = document.getElementById('itemTemplate');
const leaderboardTemplate = document.getElementById('leaderboardTemplate');
const guessInput = document.getElementById('guessInput');
const submitGuessButton = document.getElementById('submitGuessButton');
const guessFeedback = document.getElementById('guessFeedback');
const progressText = document.getElementById('progressText');
const usedGuessesText = document.getElementById('usedGuessesText');
const themeToggleButton = document.getElementById('themeToggleButton');

const adminTopicName = document.getElementById('adminTopicName');
const adminTopicDescription = document.getElementById('adminTopicDescription');
const createTopicButton = document.getElementById('createTopicButton');
const adminTopicSelect = document.getElementById('adminTopicSelect');
const adminItemInput = document.getElementById('adminItemInput');
const addItemButton = document.getElementById('addItemButton');
const adminItemsPreview = document.getElementById('adminItemsPreview');

function showPage(page) {
  [homePage, gamePage, adminPage].forEach((node) => node.classList.remove('active'));
  page.classList.add('active');
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function shuffle(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandomTen(items) {
  return shuffle(items).slice(0, 10).map((itemText) => ({ answer: itemText, guessed: false }));
}

function guessedCount() {
  return state.currentItems.filter((item) => item.guessed).length;
}

function updateProgress() {
  progressText.textContent = `Progress: ${guessedCount()}/10 guessed • Misses: ${state.misses}`;
  usedGuessesText.textContent = state.usedGuesses.size > 0
    ? `Used guesses: ${Array.from(state.usedGuesses).join(', ')}`
    : 'Used guesses: none';
}

function renderCatalog() {
  gameCatalog.innerHTML = '';
  Object.entries(state.catalogs).forEach(([key, catalog]) => {
    const card = document.createElement('article');
    card.className = 'catalog-card';
    card.innerHTML = `
      <h3>${catalog.label}</h3>
      <p>${catalog.description}</p>
      <p class="muted">${catalog.items.length} possible answers</p>
      <button class="btn primary">Play ${catalog.label}</button>
    `;

    card.querySelector('button').addEventListener('click', () => startGameFromCatalog(key));
    gameCatalog.appendChild(card);
  });
}

function renderItems() {
  itemsGrid.innerHTML = '';
  state.currentItems.forEach((item, index) => {
    const node = itemTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.item-label').textContent = `Top ${index + 1}`;
    const answerNode = node.querySelector('.item-answer');

    answerNode.textContent = item.guessed ? item.answer : '????';
    answerNode.classList.toggle('masked', !item.guessed);
    node.classList.toggle('completed', item.guessed);

    itemsGrid.appendChild(node);
  });
}

function renderLeaderboard() {
  leaderboardRows.innerHTML = '';
  if (state.leaderboard.length === 0) {
    state.leaderboard.push({ name: '', result: '' });
  }

  state.leaderboard.forEach((entry, index) => {
    const row = leaderboardTemplate.content.firstElementChild.cloneNode(true);
    const nameInput = row.querySelector('.player-name');
    const timeInput = row.querySelector('.player-time');

    nameInput.value = entry.name;
    timeInput.value = entry.result;

    nameInput.addEventListener('input', (event) => {
      state.leaderboard[index].name = event.target.value;
    });

    timeInput.addEventListener('input', (event) => {
      state.leaderboard[index].result = event.target.value;
    });

    row.querySelector('.remove-player').addEventListener('click', () => {
      state.leaderboard.splice(index, 1);
      renderLeaderboard();
    });

    leaderboardRows.appendChild(row);
  });
}

function resetGuessState() {
  state.usedGuesses = new Set();
  state.misses = 0;
  guessInput.value = '';
}

function startGameFromCatalog(key) {
  const catalog = state.catalogs[key];
  const uniqueItemCount = new Set(catalog.items.map((item) => normalize(item))).size;
  if (uniqueItemCount < 10) {
    alert('This topic needs at least 10 unique answers. Add more in Admin Page.');
    return;
  }

  state.currentCatalogKey = key;
  state.currentItems = pickRandomTen(catalog.items);
  topicTitle.textContent = `${catalog.label} Top 10 Guess Race`;
  topicDescription.textContent = catalog.description;

  resetGuessState();
  guessFeedback.textContent = 'Start typing a guess to reveal Top 1–10 answers.';

  renderItems();
  updateProgress();
  state.leaderboard = [];
  renderLeaderboard();
  showPage(gamePage);
}

function rerollCurrentGame() {
  if (!state.currentCatalogKey) {
    return;
  }

  state.currentItems = pickRandomTen(state.catalogs[state.currentCatalogKey].items);
  resetGuessState();
  guessFeedback.textContent = 'New hidden list generated. Keep guessing!';
  renderItems();
  updateProgress();
}

function submitGuess() {
  const rawGuess = guessInput.value.trim();
  const guess = normalize(rawGuess);

  if (!guess) {
    guessFeedback.textContent = 'Type a guess first.';
    return;
  }

  if (state.usedGuesses.has(guess)) {
    guessFeedback.textContent = 'You already tried that guess. Try a new one!';
    guessInput.value = '';
    guessInput.focus();
    return;
  }

  state.usedGuesses.add(guess);

  const matchIndex = state.currentItems.findIndex((item) => !item.guessed && normalize(item.answer) === guess);
  if (matchIndex >= 0) {
    state.currentItems[matchIndex].guessed = true;
    guessFeedback.textContent = `Correct! You revealed Top ${matchIndex + 1}: ${state.currentItems[matchIndex].answer}`;
    renderItems();

    if (guessedCount() === 10) {
      guessFeedback.textContent = '🏆 Amazing! You guessed all top 10 answers!';
    }
  } else {
    state.misses += 1;
    guessFeedback.textContent = `Not in this top 10 list: "${rawGuess}". Keep trying!`;
  }

  updateProgress();
  guessInput.value = '';
  guessInput.focus();
}

function renderAdminTopicSelect() {
  adminTopicSelect.innerHTML = '';
  Object.entries(state.catalogs).forEach(([key, catalog]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = catalog.label;
    adminTopicSelect.appendChild(option);
  });

  renderAdminItemsPreview();
}

function renderAdminItemsPreview() {
  const selected = adminTopicSelect.value;
  const catalog = state.catalogs[selected];
  if (!catalog) {
    adminItemsPreview.textContent = 'No topic selected.';
    return;
  }

  const list = catalog.items.map((item) => `<li>${item}</li>`).join('');
  adminItemsPreview.innerHTML = `
    <p><strong>${catalog.label}</strong> has ${catalog.items.length} possible answers:</p>
    <ul>${list}</ul>
  `;
}

function createTopic() {
  const label = adminTopicName.value.trim();
  const description = adminTopicDescription.value.trim();
  if (!label) {
    return;
  }

  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (state.catalogs[key]) {
    return;
  }

  state.catalogs[key] = {
    label,
    description: description || 'Custom topic created in admin.',
    items: []
  };

  adminTopicName.value = '';
  adminTopicDescription.value = '';

  renderCatalog();
  renderAdminTopicSelect();
  adminTopicSelect.value = key;
  renderAdminItemsPreview();
}

function addItemToTopic() {
  const selected = adminTopicSelect.value;
  const item = adminItemInput.value.trim();
  if (!selected || !item) {
    return;
  }

  state.catalogs[selected].items.push(item);
  adminItemInput.value = '';
  renderCatalog();
  renderAdminItemsPreview();
}

function setTheme(theme) {
  state.theme = theme;
  document.body.dataset.theme = theme;
  themeToggleButton.textContent = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

themeToggleButton.addEventListener('click', () => {
  setTheme(state.theme === 'light' ? 'dark' : 'light');
});

rerollButton.addEventListener('click', rerollCurrentGame);
backHomeButton.addEventListener('click', () => showPage(homePage));
openAdminButton.addEventListener('click', () => showPage(adminPage));
adminBackHomeButton.addEventListener('click', () => showPage(homePage));
submitGuessButton.addEventListener('click', submitGuess);
guessInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    submitGuess();
  }
});

addPlayerButton.addEventListener('click', () => {
  state.leaderboard.push({ name: '', result: '' });
  renderLeaderboard();
});

resetLeaderboardButton.addEventListener('click', () => {
  state.leaderboard = [];
  renderLeaderboard();
});

createTopicButton.addEventListener('click', createTopic);
addItemButton.addEventListener('click', addItemToTopic);
adminTopicSelect.addEventListener('change', renderAdminItemsPreview);

renderCatalog();
renderAdminTopicSelect();
setTheme('light');
