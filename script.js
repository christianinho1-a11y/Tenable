const state = {
  topic: '',
  description: '',
  items: Array.from({ length: 10 }, () => ({ text: '', completed: false })),
  leaderboard: []
};

const homePage = document.getElementById('homePage');
const gamePage = document.getElementById('gamePage');
const startGameButton = document.getElementById('startGameButton');
const newTopicButton = document.getElementById('newTopicButton');
const topicInput = document.getElementById('topicInput');
const descriptionInput = document.getElementById('descriptionInput');
const topicTitle = document.getElementById('topicTitle');
const topicDescription = document.getElementById('topicDescription');
const itemsGrid = document.getElementById('itemsGrid');
const shareLink = document.getElementById('shareLink');
const gameCode = document.getElementById('gameCode');
const copyLinkButton = document.getElementById('copyLinkButton');
const leaderboardRows = document.getElementById('leaderboardRows');
const addPlayerButton = document.getElementById('addPlayerButton');
const resetLeaderboardButton = document.getElementById('resetLeaderboardButton');

const itemTemplate = document.getElementById('itemTemplate');
const leaderboardTemplate = document.getElementById('leaderboardTemplate');

function randomGameCode() {
  return `TOP10-${Math.floor(1000 + Math.random() * 9000)}`;
}

function renderItems() {
  itemsGrid.innerHTML = '';

  state.items.forEach((item, index) => {
    const node = itemTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.item-label').textContent = `Top ${index + 1}`;

    const input = node.querySelector('.item-input');
    input.value = item.text;
    input.addEventListener('input', (event) => {
      state.items[index].text = event.target.value;
    });

    const claimButton = node.querySelector('.claim-btn');
    const syncButton = () => {
      claimButton.textContent = state.items[index].completed ? 'Undo' : 'Mark Complete';
      node.classList.toggle('completed', state.items[index].completed);
    };

    claimButton.addEventListener('click', () => {
      state.items[index].completed = !state.items[index].completed;
      syncButton();
    });

    syncButton();
    itemsGrid.appendChild(node);
  });
}

function renderLeaderboard() {
  leaderboardRows.innerHTML = '';

  if (state.leaderboard.length === 0) {
    addPlayerRow();
    return;
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

function addPlayerRow() {
  state.leaderboard.push({ name: '', result: '' });
  renderLeaderboard();
}

function startGame() {
  state.topic = topicInput.value.trim() || 'Top 10 Topic';
  state.description = descriptionInput.value.trim() || 'Customize this challenge and race your friends.';
  topicTitle.textContent = state.topic;
  topicDescription.textContent = state.description;

  shareLink.value = window.location.href;
  gameCode.textContent = randomGameCode();

  renderItems();
  renderLeaderboard();

  homePage.classList.remove('active');
  gamePage.classList.add('active');
}

startGameButton.addEventListener('click', startGame);
newTopicButton.addEventListener('click', () => {
  homePage.classList.add('active');
  gamePage.classList.remove('active');
});

copyLinkButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    copyLinkButton.textContent = 'Copied!';
    setTimeout(() => {
      copyLinkButton.textContent = 'Copy Link';
    }, 1200);
  } catch {
    copyLinkButton.textContent = 'Copy Failed';
  }
});

addPlayerButton.addEventListener('click', addPlayerRow);

resetLeaderboardButton.addEventListener('click', () => {
  state.leaderboard = [];
  renderLeaderboard();
});
