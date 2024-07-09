const boardSize = 5;
let board = [];
let score = 0;
let selectedTiles = [];
const tileValues = [2, 4, 8, 16, 32, 64, 128, 256, 512];
const mergeSound = new Audio('sound.mp3');

function initBoard() {
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  fillBoard();
  score = 0;
  updateScore();
  renderBoard();
}

function fillBoard() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) {
        board[i][j] = tileValues[Math.floor(Math.random() * tileValues.length)];
      }
    }
  }
}

function renderBoard() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const tile = document.createElement('div');
      tile.className = `tile tile-${board[i][j]}`;
      tile.innerText = board[i][j] === 0 ? '' : board[i][j];
      tile.addEventListener('click', () => toggleTileSelection(i, j));
      if (selectedTiles.some(tile => tile.x === i && tile.y === j)) {
        tile.classList.add('selected');
      }
      gameBoard.appendChild(tile);
    }
  }
}

function toggleTileSelection(x, y) {
  const selectedIndex = selectedTiles.findIndex(tile => tile.x === x && tile.y === y);
  if (selectedIndex !== -1) {
    selectedTiles.splice(selectedIndex, 1);
  } else {
    const lastTile = selectedTiles[selectedTiles.length - 1];
    const currentValue = board[x][y];
    const currentSum = selectedTiles.reduce((sum, tile) => sum + tile.value, 0);
    if (!lastTile || (isAdjacent(x, y, lastTile.x, lastTile.y) && isValidSelection(x, y) && currentSum >= currentValue)) {
      selectedTiles.push({ x, y, value: currentValue });
    }
  }
  renderBoard();
}

function isAdjacent(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}

function isValidSelection(x, y) {
  const lastTile = selectedTiles[selectedTiles.length - 1];
  if (!lastTile) return true;
  const lastValue = board[lastTile.x][lastTile.y];
  const currentValue = board[x][y];
  return currentValue >= lastValue;
}

function mergeTiles() {
  if (selectedTiles.length < 2) return;

  let sum = 0;
  selectedTiles.forEach(tile => {
    sum += tile.value;
    board[tile.x][tile.y] = 0;
  });

  const roundedSum = roundToNextPowerOf2(sum);
  const { x, y } = selectedTiles[selectedTiles.length - 1];
  board[x][y] = roundedSum;
  score += roundedSum;

  shiftTilesDown();
  spawnNewNumbers();
  selectedTiles = [];
  updateScore();
  renderBoard();
  
  // Play the merge sound
  mergeSound.play();

  if (isGameOver()) {
    alert('Game Over!');
  }
}

function shiftTilesDown() {
  for (let j = 0; j < boardSize; j++) {
    let emptyRow = boardSize - 1;
    for (let i = boardSize - 1; i >= 0; i--) {
      if (board[i][j] !== 0) {
        if (i !== emptyRow) {
          board[emptyRow][j] = board[i][j];
          board[i][j] = 0;
        }
        emptyRow--;
      }
    }
  }
}

function spawnNewNumbers() {
  for (let j = 0; j < boardSize; j++) {
    for (let i = 0; i < boardSize; i++) {
      if (board[i][j] === 0) {
        board[i][j] = tileValues[Math.floor(Math.random() * tileValues.length)];
      }
    }
  }
}

function roundToNextPowerOf2(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}

function updateScore() {
  document.getElementById('score').innerText = `Score: ${score}`;
}

function isGameOver() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0 || canMerge(i, j)) {
        return false;
      }
    }
  }
  return true;
}

function canMerge(x, y) {
  const value = board[x][y];
  const directions = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 1 },
  ];

  return directions.some(dir => {
    const newX = x + dir.dx;
    const newY = y + dir.dy;
    return (
      newX >= 0 &&
      newX < boardSize &&
      newY >= 0 &&
      newY < boardSize &&
      board[newX][newY] >= value
    );
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    mergeTiles();
  }
});

function restartGame() {
  initBoard();
}

// Initialize the game
initBoard();
